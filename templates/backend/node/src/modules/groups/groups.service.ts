import { ConflictError } from '../../shared/errors/conflict-error.js';
import { NotFoundError } from '../../shared/errors/not-found-error.js';
import type { GroupTypeValue } from '../../shared/domain/labels.js';

const GROUP_NOT_FOUND = 'Grupo não encontrado';
const USER_NOT_FOUND = 'Pessoa não encontrada';
const MEMBER_NOT_FOUND = 'Essa pessoa não faz parte do grupo';
const GROUP_NAME_TAKEN = 'Já existe um grupo com esse nome';
const ALREADY_MEMBER = 'Essa pessoa já faz parte do grupo';

type NamedRef = { id: string; name: string };

export type GroupRecord = {
  id: string;
  type: GroupTypeValue;
  name: string;
  description: string | null;
};

export type GroupSummary = GroupRecord & {
  solutions: NamedRef[];
  members: (NamedRef & { email: string })[];
};

export type GroupInput = { type: GroupTypeValue; name: string; description?: string | null };

export type ImpactSolution = NamedRef & {
  groupIds: string[];
  accessAll: boolean;
  accessGroupIds: string[];
  accessUserCount: number;
};

export type ImpactData = { solutions: ImpactSolution[]; members: NamedRef[] };

export type GroupsRepository = {
  list: (filters: {
    type?: GroupTypeValue;
    page: number;
    pageSize: number;
  }) => Promise<{ data: GroupSummary[]; total: number }>;
  findById: (id: string) => Promise<GroupRecord | null>;
  findActiveByName: (name: string, excludeId?: string) => Promise<GroupRecord | null>;
  create: (input: GroupInput) => Promise<GroupRecord>;
  update: (id: string, input: GroupInput) => Promise<GroupRecord>;
  loadImpactData: (id: string) => Promise<ImpactData>;
  softDelete: (id: string) => Promise<void>;
  userExists: (userId: string) => Promise<boolean>;
  isMember: (groupId: string, userId: string) => Promise<boolean>;
  addMember: (groupId: string, userId: string) => Promise<void>;
  removeMember: (groupId: string, userId: string) => Promise<void>;
};

const toRef = ({ id, name }: NamedRef): NamedRef => ({ id, name });

// O que acontece se o grupo sumir: quem perde a única relação no grafo ou a única regra de acesso.
export const computeDeletionImpact = (groupId: string, { solutions, members }: ImpactData) => ({
  solutions: solutions.map(toRef),
  members,
  orphanedByGroup: solutions
    .filter(({ groupIds }) => groupIds.length > 0 && groupIds.every((id) => id === groupId))
    .map(toRef),
  orphanedByAccess: solutions
    .filter(
      (solution) =>
        !solution.accessAll &&
        solution.accessUserCount === 0 &&
        solution.accessGroupIds.length > 0 &&
        solution.accessGroupIds.every((id) => id === groupId),
    )
    .map(toRef),
});

export const makeGroupsService = (repo: GroupsRepository) => {
  const findOrFail = async (id: string) => {
    const group = await repo.findById(id);
    if (!group) throw new NotFoundError(GROUP_NOT_FOUND, 'GROUP_NOT_FOUND');
    return group;
  };

  const assertNameFree = async (name: string, excludeId?: string) => {
    if (await repo.findActiveByName(name, excludeId)) {
      throw new ConflictError(GROUP_NAME_TAKEN, 'GROUP_NAME_TAKEN');
    }
  };

  return {
    async list(filters: { type?: GroupTypeValue; page: number; pageSize: number }) {
      const { data, total } = await repo.list(filters);
      return { data, meta: { page: filters.page, pageSize: filters.pageSize, total } };
    },

    async create(input: GroupInput) {
      const name = input.name.trim();
      await assertNameFree(name);
      return repo.create({ ...input, name });
    },

    async update(id: string, input: GroupInput) {
      await findOrFail(id);
      const name = input.name.trim();
      await assertNameFree(name, id);
      return repo.update(id, { ...input, name });
    },

    async deletionImpact(id: string) {
      await findOrFail(id);
      return computeDeletionImpact(id, await repo.loadImpactData(id));
    },

    async remove(id: string) {
      await findOrFail(id);
      await repo.softDelete(id);
    },

    async addMember(groupId: string, userId: string) {
      await findOrFail(groupId);
      if (!(await repo.userExists(userId))) {
        throw new NotFoundError(USER_NOT_FOUND, 'USER_NOT_FOUND');
      }
      if (await repo.isMember(groupId, userId)) {
        throw new ConflictError(ALREADY_MEMBER, 'ALREADY_MEMBER');
      }
      await repo.addMember(groupId, userId);
    },

    async removeMember(groupId: string, userId: string) {
      await findOrFail(groupId);
      if (!(await repo.isMember(groupId, userId))) {
        throw new NotFoundError(MEMBER_NOT_FOUND, 'MEMBER_NOT_FOUND');
      }
      await repo.removeMember(groupId, userId);
    },
  };
};

export type GroupsService = ReturnType<typeof makeGroupsService>;
