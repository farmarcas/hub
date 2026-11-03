import { useCallback, useMemo, useState } from "react";
import { useApiQuery } from "@/hooks/useApiQuery";
import { api, errorMessage } from "@/lib/api";
import type {
  DeletionImpact,
  GroupPayload,
  GroupSummary,
  GroupType,
  Identity,
  Page,
} from "@/types/api";

const PAGE_SIZE = 100;

export type GroupFilter = "Todos" | GroupType;

export function useGroups() {
  const groupsQuery = useApiQuery<Page<GroupSummary>>(`/groups?pageSize=${PAGE_SIZE}`);
  const peopleQuery = useApiQuery<Page<Identity>>(`/users?pageSize=${PAGE_SIZE}`);
  const [filter, setFilter] = useState<GroupFilter>("Todos");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const allGroups = useMemo(() => groupsQuery.data?.data ?? [], [groupsQuery.data]);
  const visibleGroups = useMemo(
    () => (filter === "Todos" ? allGroups : allGroups.filter(({ type }) => type === filter)),
    [filter, allGroups],
  );
  // Grupo aberto: o escolhido, ou o primeiro da lista se ele sumiu (ex.: foi excluído).
  const openGroup =
    allGroups.find(({ id }) => id === selectedId) ?? visibleGroups[0] ?? allGroups[0] ?? null;

  const { reload } = groupsQuery;

  // Executa a ação, recarrega a lista e devolve a mensagem de erro (ou null) para o formulário.
  const run = useCallback(
    async (action: () => Promise<unknown>): Promise<string | null> => {
      setActionError(null);
      try {
        await action();
        await reload();
        return null;
      } catch (cause) {
        const message = errorMessage(cause);
        setActionError(message);
        return message;
      }
    },
    [reload],
  );

  const createGroup = useCallback(
    (payload: GroupPayload) =>
      run(async () => {
        const created = await api.post<GroupSummary>("/groups", payload);
        setSelectedId(created.id);
      }),
    [run],
  );

  const updateGroup = useCallback(
    (id: string, payload: GroupPayload) => run(() => api.put(`/groups/${id}`, payload)),
    [run],
  );

  const deleteGroup = useCallback((id: string) => run(() => api.delete(`/groups/${id}`)), [run]);

  const loadImpact = useCallback(
    (id: string) => api.get<DeletionImpact>(`/groups/${id}/deletion-impact`),
    [],
  );

  const addMember = useCallback(
    (groupId: string, userId: string) =>
      run(() => api.post(`/groups/${groupId}/members`, { userId })),
    [run],
  );

  const removeMember = useCallback(
    (groupId: string, userId: string) =>
      run(() => api.delete(`/groups/${groupId}/members/${userId}`)),
    [run],
  );

  return {
    groups: visibleGroups,
    people: peopleQuery.data?.data ?? [],
    filter,
    setFilter,
    openGroup,
    openGroupId: openGroup?.id ?? null,
    setOpenGroupId: setSelectedId,
    isLoading: groupsQuery.isLoading || peopleQuery.isLoading,
    error: groupsQuery.error ?? peopleQuery.error,
    actionError,
    reload: async () => {
      await Promise.all([groupsQuery.reload(), peopleQuery.reload()]);
    },
    createGroup,
    updateGroup,
    deleteGroup,
    loadImpact,
    addMember,
    removeMember,
  };
}
