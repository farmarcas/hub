import { BusinessRuleError } from '../../shared/errors/business-rule-error.js';
import { NotFoundError } from '../../shared/errors/not-found-error.js';
import type { GroupTypeValue, SolutionStatusValue } from '../../shared/domain/labels.js';

const SOLUTION_NOT_FOUND = 'Solução não encontrada';
const REQUIRES_GROUP = 'Sem tema ou diretoria, a solução ficaria solta no grafo.';
const REQUIRES_ACCESS = 'Defina ao menos uma regra de acesso.';
const SELF_RELATION = 'Uma solução não pode ser relacionada com ela mesma.';
const REFERENCE_NOT_FOUND = 'Há itens selecionados que não existem mais.';

export type SolutionInput = {
  name: string;
  url: string;
  objective: string;
  description: string;
  categoryId: string;
  status: SolutionStatusValue;
  groupIds: string[];
  relatedIds: string[];
  access: { all: boolean; groupIds: string[]; userIds: string[] };
};

type NamedRef = { id: string; name: string };

export type SolutionDetail = {
  id: string;
  name: string;
  url: string;
  objective: string;
  description: string;
  category: NamedRef;
  status: SolutionStatusValue;
  archived: boolean;
  groups: (NamedRef & { type: GroupTypeValue })[];
  related: NamedRef[];
  access: { all: boolean; groups: NamedRef[]; users: NamedRef[] };
};

export type SolutionCounts = { published: number; inReview: number; archived: number };

export type ListFilters = {
  page: number;
  pageSize: number;
  status?: SolutionStatusValue;
  archived?: boolean;
};

export type MissingReference = { type: 'category' | 'group' | 'user' | 'solution'; id: string };

export type ReferenceCheck = {
  categoryId: string;
  groupIds: string[];
  userIds: string[];
  solutionIds: string[];
};

export type SolutionsRepository = {
  list: (filters: ListFilters) => Promise<{ data: SolutionDetail[]; total: number }>;
  counts: () => Promise<SolutionCounts>;
  findById: (id: string) => Promise<SolutionDetail | null>;
  findMissingReferences: (check: ReferenceCheck) => Promise<MissingReference[]>;
  create: (input: SolutionInput) => Promise<SolutionDetail>;
  update: (id: string, input: SolutionInput) => Promise<SolutionDetail>;
  setArchived: (id: string, archived: boolean) => Promise<SolutionDetail>;
  // Exclusão lógica só desta solução; as ligações dela saem, as outras soluções não mudam.
  softDelete: (id: string) => Promise<void>;
};

// A relação entre soluções é simétrica e guardada uma vez por par, com o menor id primeiro.
export const orderedPair = (a: string, b: string): [string, string] => (a < b ? [a, b] : [b, a]);

const unique = (ids: string[]) => [...new Set(ids)];

const normalize = (input: SolutionInput): SolutionInput => ({
  ...input,
  groupIds: unique(input.groupIds),
  relatedIds: unique(input.relatedIds),
  // "Toda a empresa" já cobre todos: grupos e pessoas específicas deixam de valer.
  access: input.access.all
    ? { all: true, groupIds: [], userIds: [] }
    : {
        all: false,
        groupIds: unique(input.access.groupIds),
        userIds: unique(input.access.userIds),
      },
});

const hasAccessRule = ({ access }: SolutionInput) =>
  access.all || access.groupIds.length > 0 || access.userIds.length > 0;

export const makeSolutionsService = (repo: SolutionsRepository) => {
  const findOrFail = async (id: string) => {
    const solution = await repo.findById(id);
    if (!solution) throw new NotFoundError(SOLUTION_NOT_FOUND, 'SOLUTION_NOT_FOUND');
    return solution;
  };

  const assertValid = async (input: SolutionInput, selfId?: string) => {
    if (input.groupIds.length === 0) {
      throw new BusinessRuleError(REQUIRES_GROUP, 'SOLUTION_REQUIRES_GROUP');
    }
    if (!hasAccessRule(input)) {
      throw new BusinessRuleError(REQUIRES_ACCESS, 'SOLUTION_REQUIRES_ACCESS');
    }
    if (selfId && input.relatedIds.includes(selfId)) {
      throw new BusinessRuleError(SELF_RELATION, 'SOLUTION_SELF_RELATION');
    }

    const missing = await repo.findMissingReferences({
      categoryId: input.categoryId,
      groupIds: unique([...input.groupIds, ...input.access.groupIds]),
      userIds: input.access.userIds,
      solutionIds: input.relatedIds,
    });
    if (missing.length > 0) {
      throw new BusinessRuleError(REFERENCE_NOT_FOUND, 'REFERENCE_NOT_FOUND', missing);
    }
  };

  return {
    async list(filters: ListFilters) {
      const [{ data, total }, counts] = await Promise.all([repo.list(filters), repo.counts()]);
      return { data, meta: { page: filters.page, pageSize: filters.pageSize, total, counts } };
    },

    getById: findOrFail,

    async create(raw: SolutionInput) {
      const input = normalize(raw);
      await assertValid(input);
      return repo.create(input);
    },

    async update(id: string, raw: SolutionInput) {
      await findOrFail(id);
      const input = normalize(raw);
      await assertValid(input, id);
      return repo.update(id, input);
    },

    async archive(id: string) {
      await findOrFail(id);
      return repo.setArchived(id, true);
    },

    async restore(id: string) {
      await findOrFail(id);
      return repo.setArchived(id, false);
    },

    async remove(id: string) {
      await findOrFail(id);
      await repo.softDelete(id);
    },
  };
};

export type SolutionsService = ReturnType<typeof makeSolutionsService>;
