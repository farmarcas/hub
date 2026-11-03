import { prisma } from '../../shared/database/prisma.js';
import type { Prisma } from '../../generated/prisma/client.js';
import { notDeletedSolution } from '../access/access.repository.js';
import {
  orderedPair,
  type MissingReference,
  type SolutionDetail,
  type SolutionInput,
  type SolutionsRepository,
} from './solutions.service.js';

const named = { select: { id: true, name: true } } as const;

const detailInclude = {
  category: named,
  groups: { select: { group: { select: { id: true, name: true, type: true } } } },
  relatedAsA: { where: { solutionB: notDeletedSolution }, select: { solutionB: named } },
  relatedAsB: { where: { solutionA: notDeletedSolution }, select: { solutionA: named } },
  accessGroups: { select: { group: named } },
  accessUsers: { select: { user: named } },
} satisfies Prisma.SolutionInclude;

type SolutionRow = Prisma.SolutionGetPayload<{ include: typeof detailInclude }>;

const byName = <T extends { name: string }>(items: T[]) =>
  [...items].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));

const toDetail = (row: SolutionRow): SolutionDetail => ({
  id: row.id,
  name: row.name,
  url: row.url,
  objective: row.objective,
  description: row.description,
  category: row.category,
  status: row.status,
  archived: row.archivedAt !== null,
  groups: byName(row.groups.map(({ group }) => group)),
  related: byName([
    ...row.relatedAsA.map(({ solutionB }) => solutionB),
    ...row.relatedAsB.map(({ solutionA }) => solutionA),
  ]),
  access: {
    all: row.accessAll,
    groups: byName(row.accessGroups.map(({ group }) => group)),
    users: byName(row.accessUsers.map(({ user }) => user)),
  },
});

const scalarData = (input: SolutionInput) => ({
  name: input.name,
  url: input.url,
  objective: input.objective,
  description: input.description,
  categoryId: input.categoryId,
  status: input.status,
  accessAll: input.access.all,
});

// Reescreve as ligações da solução (relações no grafo e regras de acesso) dentro da transação.
const writeLinks = async (tx: Prisma.TransactionClient, id: string, input: SolutionInput) => {
  await tx.solutionGroup.deleteMany({ where: { solutionId: id } });
  await tx.solutionAccessGroup.deleteMany({ where: { solutionId: id } });
  await tx.solutionAccessUser.deleteMany({ where: { solutionId: id } });
  await tx.solutionRelated.deleteMany({
    where: { OR: [{ solutionAId: id }, { solutionBId: id }] },
  });

  await tx.solutionGroup.createMany({
    data: input.groupIds.map((groupId) => ({ solutionId: id, groupId })),
  });
  await tx.solutionAccessGroup.createMany({
    data: input.access.groupIds.map((groupId) => ({ solutionId: id, groupId })),
  });
  await tx.solutionAccessUser.createMany({
    data: input.access.userIds.map((userId) => ({ solutionId: id, userId })),
  });
  await tx.solutionRelated.createMany({
    data: input.relatedIds.map((relatedId) => {
      const [solutionAId, solutionBId] = orderedPair(id, relatedId);
      return { solutionAId, solutionBId };
    }),
  });
};

const listWhere = ({
  status,
  archived,
}: {
  status?: SolutionDetail['status'];
  archived?: boolean;
}): Prisma.SolutionWhereInput => ({
  ...notDeletedSolution,
  ...(status ? { status } : {}),
  ...(archived === undefined ? {} : { archivedAt: archived ? { not: null } : null }),
});

const findDetail = async (id: string) => {
  const row = await prisma.solution.findFirst({
    where: { id, ...notDeletedSolution },
    include: detailInclude,
  });
  return row ? toDetail(row) : null;
};

const loadDetail = async (id: string) => {
  const detail = await findDetail(id);
  if (!detail) throw new Error(`Solução ${id} sumiu durante a gravação`);
  return detail;
};

const missingIds = (requested: string[], found: { id: string }[]) => {
  const foundIds = new Set(found.map(({ id }) => id));
  return requested.filter((id) => !foundIds.has(id));
};

export const solutionsRepository: SolutionsRepository = {
  async list({ page, pageSize, status, archived }) {
    const where = listWhere({ status, archived });
    const [rows, total] = await prisma.$transaction([
      prisma.solution.findMany({
        where,
        include: detailInclude,
        orderBy: { name: 'asc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.solution.count({ where }),
    ]);
    return { data: rows.map(toDetail), total };
  },

  async counts() {
    const [published, inReview, archived] = await prisma.$transaction([
      prisma.solution.count({
        where: { ...notDeletedSolution, status: 'published', archivedAt: null },
      }),
      prisma.solution.count({
        where: { ...notDeletedSolution, status: 'in_review', archivedAt: null },
      }),
      prisma.solution.count({ where: { ...notDeletedSolution, archivedAt: { not: null } } }),
    ]);
    return { published, inReview, archived };
  },

  findById: findDetail,

  async findMissingReferences({ categoryId, groupIds, userIds, solutionIds }) {
    const [categories, groups, users, solutions] = await prisma.$transaction([
      prisma.category.findMany({ where: { id: categoryId }, select: { id: true } }),
      prisma.group.findMany({
        where: { id: { in: groupIds }, deletedAt: null },
        select: { id: true },
      }),
      prisma.user.findMany({
        where: { id: { in: userIds }, deletedAt: null },
        select: { id: true },
      }),
      prisma.solution.findMany({
        where: { id: { in: solutionIds }, ...notDeletedSolution },
        select: { id: true },
      }),
    ]);

    const missing: MissingReference[] = [
      ...missingIds([categoryId], categories).map((id) => ({ type: 'category' as const, id })),
      ...missingIds(groupIds, groups).map((id) => ({ type: 'group' as const, id })),
      ...missingIds(userIds, users).map((id) => ({ type: 'user' as const, id })),
      ...missingIds(solutionIds, solutions).map((id) => ({ type: 'solution' as const, id })),
    ];
    return missing;
  },

  async create(input) {
    const id = await prisma.$transaction(async (tx) => {
      const created = await tx.solution.create({ data: scalarData(input), select: { id: true } });
      await writeLinks(tx, created.id, input);
      return created.id;
    });
    return loadDetail(id);
  },

  async update(id, input) {
    await prisma.$transaction(async (tx) => {
      await tx.solution.update({ where: { id }, data: scalarData(input) });
      await writeLinks(tx, id, input);
    });
    return loadDetail(id);
  },

  async setArchived(id, archived) {
    // Arquivar é idempotente: mantém a data original se já estava arquivada.
    await prisma.solution.updateMany({
      where: { id, ...notDeletedSolution, archivedAt: archived ? null : { not: null } },
      data: { archivedAt: archived ? new Date() : null },
    });
    return loadDetail(id);
  },

  // Só linhas desta solução: as relacionadas perdem a ligação, mas nenhuma outra solução é
  // excluída ou alterada. O registro fica guardado com a data (exclusão lógica, DATABASE.md).
  async softDelete(id) {
    await prisma.$transaction([
      prisma.solutionGroup.deleteMany({ where: { solutionId: id } }),
      prisma.solutionAccessGroup.deleteMany({ where: { solutionId: id } }),
      prisma.solutionAccessUser.deleteMany({ where: { solutionId: id } }),
      prisma.solutionRelated.deleteMany({
        where: { OR: [{ solutionAId: id }, { solutionBId: id }] },
      }),
      prisma.solution.updateMany({
        where: { id, ...notDeletedSolution },
        data: { deletedAt: new Date() },
      }),
    ]);
  },
};
