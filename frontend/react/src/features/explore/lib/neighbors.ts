import type { Graph, GraphGroup, GraphSolution } from "@/types/api";

export type RelatedEntry = { solution: GraphSolution; via: string | null };

// Grupos que compartilham ao menos uma solução com o grupo em foco ("órbitas vizinhas").
export function neighborOrbits(graph: Graph, groupId: string): GraphGroup[] {
  const ids = new Set<string>();
  for (const solution of graph.solutions) {
    if (!solution.groupIds.includes(groupId)) continue;
    solution.groupIds.forEach((id) => {
      if (id !== groupId) ids.add(id);
    });
  }
  return graph.groups.filter(({ id }) => ids.has(id));
}

export function solutionsInGroup(graph: Graph, groupId: string): GraphSolution[] {
  return graph.solutions.filter(({ groupIds }) => groupIds.includes(groupId));
}

// Relacionadas: primeiro as ligadas diretamente; depois as que dividem um grupo ("via <grupo>").
export function relatedSolutions(graph: Graph, solutionId: string): RelatedEntry[] {
  const solution = graph.solutions.find(({ id }) => id === solutionId);
  if (!solution) return [];

  const groupName = new Map(graph.groups.map(({ id, name }) => [id, name]));
  const direct = graph.solutions
    .filter(({ id }) => solution.relatedIds.includes(id))
    .map((other) => ({ solution: other, via: null }));

  const viaGroup = graph.solutions
    .filter(({ id }) => id !== solutionId && !solution.relatedIds.includes(id))
    .flatMap((other) => {
      const shared = solution.groupIds.find((groupId) => other.groupIds.includes(groupId));
      return shared ? [{ solution: other, via: groupName.get(shared) ?? null }] : [];
    });

  return [...direct, ...viaGroup];
}
