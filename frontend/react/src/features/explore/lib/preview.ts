import type { GlobeLayout } from "./layout";

// O que acende no globo: o nó sob o mouse ou, sem ele, o grupo em prévia no painel,
// sempre junto com os vizinhos (soluções ligadas ao grupo).
export function highlightSet(
  layout: GlobeLayout,
  hoverId: string | null,
  previewId: string | null,
): Set<string> {
  const id = hoverId ?? previewId;
  if (!id || !layout.nodes[id]) return new Set();
  return new Set([id, ...(layout.neighbors[id] ?? [])]);
}
