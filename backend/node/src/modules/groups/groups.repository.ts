import { prisma } from '../../shared/database/prisma.js';
import { notDeletedSolution } from '../access/access.repository.js';
import type { GroupsRepository } from './groups.service.js';

const groupSelect = { id: true, type: true, name: true, description: true } as const;
const active = { deletedAt: null } as const;

export const groupsRepository: GroupsRepository = {
  async list({ type, page, pageSize }) {
    const where = { ...active, ...(type ? { type } : {}) };
    const [rows, total] = await prisma.$transaction([
      prisma.group.findMany({
        where,
        select: {
          ...groupSelect,
          solutions: {
            where: { solution: { ...notDeletedSolution, archivedAt: null } },
            select: { solution: { select: { id: true, name: true } } },
            orderBy: { solution: { name: 'asc' } },
          },
          members: {
            where: { user: active },
            select: { user: { select: { id: true, name: true, email: true } } },
            orderBy: { user: { name: 'asc' } },
          },
        },
        orderBy: [{ type: 'asc' }, { name: 'asc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.group.count({ where }),
    ]);

    const data = rows.map(({ solutions, members, ...group }) => ({
      ...group,
      solutions: solutions.map(({ solution }) => solution),
      members: members.map(({ user }) => user),
    }));
    return { data, total };
  },

  findById(id) {
    return prisma.group.findFirst({ where: { id, ...active }, select: groupSelect });
  },

  findActiveByName(name, excludeId) {
    return prisma.group.findFirst({
      where: {
        ...active,
        name: { equals: name, mode: 'insensitive' },
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
      select: groupSelect,
    });
  },

  create(input) {
    return prisma.group.create({ data: input, select: groupSelect });
  },

  update(id, input) {
    return prisma.group.update({ where: { id }, data: input, select: groupSelect });
  },

  async loadImpactData(id) {
    const [solutions, members] = await prisma.$transaction([
      prisma.solution.findMany({
        where: {
          ...notDeletedSolution,
          OR: [{ groups: { some: { groupId: id } } }, { accessGroups: { some: { groupId: id } } }],
        },
        select: {
          id: true,
          name: true,
          accessAll: true,
          groups: { select: { groupId: true } },
          accessGroups: { select: { groupId: true } },
          _count: { select: { accessUsers: true } },
        },
        orderBy: { name: 'asc' },
      }),
      prisma.user.findMany({
        where: { ...active, memberships: { some: { groupId: id } } },
        select: { id: true, name: true },
        orderBy: { name: 'asc' },
      }),
    ]);

    return {
      members,
      solutions: solutions.map((solution) => ({
        id: solution.id,
        name: solution.name,
        accessAll: solution.accessAll,
        groupIds: solution.groups.map(({ groupId }) => groupId),
        accessGroupIds: solution.accessGroups.map(({ groupId }) => groupId),
        accessUserCount: solution._count.accessUsers,
      })),
    };
  },

  // Exclusão lógica do grupo; as ligações técnicas saem de vez para não vazar acesso (research R6).
  async softDelete(id) {
    await prisma.$transaction([
      prisma.solutionGroup.deleteMany({ where: { groupId: id } }),
      prisma.solutionAccessGroup.deleteMany({ where: { groupId: id } }),
      prisma.groupMember.deleteMany({ where: { groupId: id } }),
      prisma.group.update({ where: { id }, data: { deletedAt: new Date() } }),
    ]);
  },

  async userExists(userId) {
    return (await prisma.user.count({ where: { id: userId, ...active } })) > 0;
  },

  async isMember(groupId, userId) {
    return (await prisma.groupMember.count({ where: { groupId, userId } })) > 0;
  },

  async addMember(groupId, userId) {
    await prisma.groupMember.create({ data: { groupId, userId } });
  },

  async removeMember(groupId, userId) {
    await prisma.groupMember.delete({ where: { groupId_userId: { groupId, userId } } });
  },
};
