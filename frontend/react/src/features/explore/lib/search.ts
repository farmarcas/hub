import type { Graph } from "@/types/api";

export const MAX_RESULTS = 7;

export type SearchKind = "TEMA" | "DIRETORIA" | "SOLUÇÃO";
export type SearchResult = { id: string; name: string; kind: SearchKind };

const fold = (text: string) => text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();

// Busca por nome entre temas, diretorias e soluções que a pessoa vê (o grafo já vem filtrado).
export function searchGraph(graph: Graph, query: string): SearchResult[] {
  const needle = fold(query);
  if (!needle) return [];

  const candidates: SearchResult[] = [
    ...graph.groups.map(({ id, name, type }) => ({
      id,
      name,
      kind: (type === "Tema" ? "TEMA" : "DIRETORIA") as SearchKind,
    })),
    ...graph.solutions.map(({ id, name }) => ({ id, name, kind: "SOLUÇÃO" as SearchKind })),
  ];

  return candidates
    .filter(({ name }) => fold(name).includes(needle))
    .sort(
      (a, b) => Number(!fold(a.name).startsWith(needle)) - Number(!fold(b.name).startsWith(needle)),
    )
    .slice(0, MAX_RESULTS);
}
