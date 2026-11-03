import { useApiQuery } from "@/hooks/useApiQuery";
import type { Graph } from "@/types/api";

// O grafo já chega filtrado pelo servidor: só o que a pessoa pode ver.
export function useGraph() {
  const { data: graph, isLoading, error, reload } = useApiQuery<Graph>("/graph");
  return { graph, isLoading, error, reload };
}
