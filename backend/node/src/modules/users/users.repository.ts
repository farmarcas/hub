import { prisma } from '../../shared/database/prisma.js';
import { notDeletedSolution } from '../access/access.repository.js';
import type { UsersRepository } from './users.service.js';

const active = { deletedAt: null } as const;

export const usersRepository: UsersRepository = {
  async list(page, pageSize) {
    const [rows, total] = await prisma.$transaction([
      prisma.user.findMany({
        where: active,
        select: {
          id: true,
          name: true,
          email: true,
          isAdmin: true,
          memberships: {
            where: { group: active },
            select: { group: { select: { id: true, name: true, type: true } } },
            orderBy: { group: { name: 'asc' } },
          },
        },
        orderBy: { name: 'asc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.user.count({ where: active }),
    ]);

    const data = rows.map(({ memberships, ...user }) => ({
      ...user,
      groups: memberships.map(({ group }) => group),
    }));
    return { data, total };
  },

  // Só as soluções que podem aparecer no globo entram na conta de "Acessa".
  async loadAccessRules() {
    const solutions = await prisma.solution.findMany({
      where: { ...notDeletedSolution, status: 'published', archivedAt: null },
      select: {
        status: true,
        accessAll: true,
        accessGroups: { select: { groupId: true } },
        accessUsers: { select: { userId: true } },
      },
    });

    return solutions.map((solution) => ({
      status: solution.status,
      archived: false,
      accessAll: solution.accessAll,
      accessGroupIds: solution.accessGroups.map(({ groupId }) => groupId),
      accessUserIds: solution.accessUsers.map(({ userId }) => userId),
    }));
  },
};
