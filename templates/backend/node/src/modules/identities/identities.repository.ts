import { prisma } from '../../shared/database/prisma.js';
import type { Viewer } from '../access/access.service.js';

export type Identity = Omit<Viewer, 'groupIds'>;

export type IdentitiesRepository = {
  findViewer: (id: string) => Promise<Viewer | null>;
  list: () => Promise<Identity[]>;
};

const identitySelect = { id: true, name: true, email: true, isAdmin: true } as const;

export const identitiesRepository: IdentitiesRepository = {
  async findViewer(id) {
    const user = await prisma.user.findFirst({
      where: { id, deletedAt: null },
      select: {
        ...identitySelect,
        memberships: { where: { group: { deletedAt: null } }, select: { groupId: true } },
      },
    });
    if (!user) return null;

    const { memberships, ...identity } = user;
    return { ...identity, groupIds: memberships.map((membership) => membership.groupId) };
  },

  list() {
    return prisma.user.findMany({
      where: { deletedAt: null },
      select: identitySelect,
      orderBy: { name: 'asc' },
    });
  },
};
