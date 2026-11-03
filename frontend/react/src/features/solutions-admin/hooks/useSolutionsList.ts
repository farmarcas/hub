import { useCallback, useState } from "react";
import { useApiQuery } from "@/hooks/useApiQuery";
import { api, errorMessage } from "@/lib/api";
import type { Page, PageMeta, SolutionCounts, SolutionDetail } from "@/types/api";

const PAGE_SIZE = 100;

type ListMeta = PageMeta & { counts: SolutionCounts };

export function useSolutionsList() {
  const { data, isLoading, error, reload } = useApiQuery<Page<SolutionDetail, ListMeta>>(
    `/solutions?pageSize=${PAGE_SIZE}`,
  );
  const [actionError, setActionError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const setArchived = useCallback(
    async (id: string, archived: boolean) => {
      setBusyId(id);
      setActionError(null);
      try {
        await api.post(`/solutions/${id}/${archived ? "archive" : "restore"}`);
        await reload();
      } catch (cause) {
        setActionError(errorMessage(cause));
      } finally {
        setBusyId(null);
      }
    },
    [reload],
  );

  // Exclui só a solução escolhida. Devolve a mensagem de erro (ou null) para o diálogo.
  const deleteSolution = useCallback(
    async (id: string): Promise<string | null> => {
      setBusyId(id);
      setActionError(null);
      try {
        await api.delete(`/solutions/${id}`);
        await reload();
        return null;
      } catch (cause) {
        // Outra pessoa já excluiu: atualiza a lista para ela sumir daqui também.
        await reload();
        return errorMessage(cause);
      } finally {
        setBusyId(null);
      }
    },
    [reload],
  );

  return {
    solutions: data?.data ?? [],
    counts: data?.meta.counts ?? null,
    isLoading,
    error,
    actionError,
    busyId,
    reload,
    setArchived,
    deleteSolution,
  };
}
