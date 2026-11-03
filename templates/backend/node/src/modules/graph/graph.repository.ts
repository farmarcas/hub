import { prisma } from '../../shared/database/prisma.js';
import { visibleSolutionsWhere } from '../access/access.repository.js';
import type { GraphRepository } from './graph.service.js';

export const graphRepository: GraphRepository = {
  async load(viewer) {
    const [groups, solutions] = await prisma.$transaction([
      prisma.group.findMany({
        where: { deletedAt: null },
        select: { id: true, type: true, name: true, description: true },
        orderBy: [{ type: 'asc' }, { name: 'asc' }],
      }),
      prisma.solution.findMany({
        where: visibleSolutionsWhere(viewer),
        select: {
          id: true,
          name: true,
          url: true,
          objective: true,
          description: true,
          category: { select: { name: true } },
          groups: { where: { group: { deletedAt: null } }, select: { groupId: true } },
          relatedAsA: { select: { solutionBId: true } },
          relatedAsB: { select: { solutionAId: true } },
        },
        orderBy: { name: 'asc' },
      }),
    ]);

    return {
      groups,
      solutions: solutions.map(({ category, groups: links, relatedAsA, relatedAsB, ...rest }) => ({
        ...rest,
        category: category.name,
        groupIds: links.map(({ groupId }) => groupId),
        relatedIds: [
          ...relatedAsA.map(({ solutionBId }) => solutionBId),
          ...relatedAsB.map(({ solutionAId }) => solutionAId),
        ],
      })),
    };
  },
};
