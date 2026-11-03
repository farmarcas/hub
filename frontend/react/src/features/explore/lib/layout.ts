import { distance, hash, normalize, scale, type Vec3 } from "./vector";

export const GROUP_RADIUS = 0.62;
export const SOLUTION_RADIUS = 1;
const MIN_SOLUTION_GAP = 0.62;
const RELAX_ITERATIONS = 200;
const JITTER = 0.6;

export type NodeKind = "theme" | "dir" | "sol";

export type GlobeNode = { id: string; kind: NodeKind; name: string; radius: number };

export type GlobeEdge = { a: string; b: string; type: "group" | "related" };

export type GlobeLayout = {
  nodes: Record<string, GlobeNode>;
  ids: string[];
  groupIds: string[];
  directions: Record<string, Vec3>;
  edges: GlobeEdge[];
  neighbors: Record<string, string[]>;
};

type LayoutGroup = { id: string; type: "Tema" | "Diretoria"; name: string };
type LayoutSolution = { id: string; name: string; groupIds: string[]; relatedIds: string[] };

// Grupos na órbita interna (espiral de Fibonacci); soluções na superfície, perto dos seus grupos.
export function buildLayout(groups: LayoutGroup[], solutions: LayoutSolution[]): GlobeLayout {
  const nodes: Record<string, GlobeNode> = {};
  const neighbors: Record<string, string[]> = {};
  const edges: GlobeEdge[] = [];
  const directions: Record<string, Vec3> = {};

  for (const group of groups) {
    const kind = group.type === "Diretoria" ? "dir" : "theme";
    nodes[group.id] = { id: group.id, kind, name: group.name, radius: GROUP_RADIUS };
  }
  for (const solution of solutions) {
    nodes[solution.id] = {
      id: solution.id,
      kind: "sol",
      name: solution.name,
      radius: SOLUTION_RADIUS,
    };
  }
  const ids = Object.keys(nodes);
  for (const id of ids) neighbors[id] = [];

  const addEdge = (a: string, b: string, type: GlobeEdge["type"]) => {
    if (!nodes[a] || !nodes[b] || a === b) return;
    if (edges.some((edge) => (edge.a === a && edge.b === b) || (edge.a === b && edge.b === a))) {
      return;
    }
    edges.push({ a, b, type });
    neighbors[a]?.push(b);
    neighbors[b]?.push(a);
  };
  for (const solution of solutions) {
    solution.groupIds.forEach((groupId) => addEdge(solution.id, groupId, "group"));
    solution.relatedIds.forEach((relatedId) => addEdge(solution.id, relatedId, "related"));
  }

  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  groups.forEach((group, index) => {
    const y = 1 - ((index + 0.5) / groups.length) * 2;
    const ring = Math.sqrt(1 - y * y);
    const theta = index * goldenAngle;
    directions[group.id] = normalize([Math.cos(theta) * ring, y * 0.85, Math.sin(theta) * ring]);
  });

  for (const solution of solutions) {
    const sum: Vec3 = [0, 0, 0];
    for (const groupId of solution.groupIds) {
      const direction = directions[groupId];
      if (!direction) continue;
      sum[0] += direction[0];
      sum[1] += direction[1];
      sum[2] += direction[2];
    }
    directions[solution.id] = normalize([
      sum[0] + (hash(solution.id) - 0.5) * JITTER,
      sum[1] + (hash(`${solution.id}y`) - 0.5) * JITTER,
      sum[2] + (hash(`${solution.id}z`) - 0.5) * JITTER + 0.01,
    ]);
  }

  relaxSolutions(
    solutions.map(({ id }) => id),
    directions,
  );

  return { nodes, ids, groupIds: groups.map(({ id }) => id), directions, edges, neighbors };
}

// Repulsão simples para as soluções não se sobreporem na superfície.
function relaxSolutions(ids: string[], directions: Record<string, Vec3>) {
  for (let iteration = 0; iteration < RELAX_ITERATIONS; iteration++) {
    for (let i = 0; i < ids.length; i++) {
      for (let j = i + 1; j < ids.length; j++) {
        const idA = ids[i] as string;
        const idB = ids[j] as string;
        const a = directions[idA] as Vec3;
        const b = directions[idB] as Vec3;
        const gap = distance(a, b);
        if (gap >= MIN_SOLUTION_GAP) continue;
        const push = scale([a[0] - b[0], a[1] - b[1], a[2] - b[2]], (MIN_SOLUTION_GAP - gap) * 0.5);
        directions[idA] = normalize([a[0] + push[0], a[1] + push[1], a[2] + push[2]]);
        directions[idB] = normalize([b[0] - push[0], b[1] - push[1], b[2] - push[2]]);
      }
    }
  }
}

export function positionOf(layout: GlobeLayout, id: string): Vec3 {
  const direction = layout.directions[id] ?? [0, 0, 1];
  return scale(direction, layout.nodes[id]?.radius ?? SOLUTION_RADIUS);
}
