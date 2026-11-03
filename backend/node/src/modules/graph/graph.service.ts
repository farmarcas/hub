import { GROUP_TYPE_LABELS, type GroupTypeValue } from '../../shared/domain/labels.js';
import type { Viewer } from '../access/access.service.js';

export type GraphGroup = {
  id: string;
  type: GroupTypeValue;
  name: string;
  description: string | null;
};

// Soluções já filtradas pelo acesso da pessoa; relatedIds pode citar soluções que ela não vê.
export type GraphSolution = {
  id: string;
  name: string;
  url: string;
  objective: string;
  description: string;
  category: string;
  groupIds: string[];
  relatedIds: string[];
};

export type GraphSource = { groups: GraphGroup[]; solutions: GraphSolution[] };

export type GraphRepository = {
  load: (viewer: Pick<Viewer, 'id' | 'groupIds'>) => Promise<GraphSource>;
};

export const buildGraph = ({ groups, solutions }: GraphSource) => {
  const visibleIds = new Set(solutions.map(({ id }) => id));
  const related = new Map(solutions.map(({ id }) => [id, new Set<string>()]));

  for (const solution of solutions) {
    for (const otherId of solution.relatedIds) {
      if (!visibleIds.has(otherId) || otherId === solution.id) continue;
      related.get(solution.id)?.add(otherId);
      related.get(otherId)?.add(solution.id);
    }
  }

  return {
    groups: groups.map((group) => ({
      ...group,
      type: GROUP_TYPE_LABELS[group.type],
      solutionCount: solutions.filter(({ groupIds }) => groupIds.includes(group.id)).length,
    })),
    solutions: solutions.map((solution) => ({
      ...solution,
      relatedIds: [...(related.get(solution.id) ?? [])],
    })),
  };
};

export const makeGraphService = (repo: GraphRepository) => ({
  async forViewer(viewer: Viewer) {
    return buildGraph(await repo.load(viewer));
  },
});
