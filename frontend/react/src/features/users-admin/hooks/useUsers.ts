import { useApiQuery } from "@/hooks/useApiQuery";
import type { Page, UserRow } from "@/types/api";

const PAGE_SIZE = 100;

export function useUsers() {
  const { data, isLoading, error, reload } = useApiQuery<Page<UserRow>>(
    `/users?pageSize=${PAGE_SIZE}`,
  );
  return { users: data?.data ?? [], isLoading, error, reload };
}
