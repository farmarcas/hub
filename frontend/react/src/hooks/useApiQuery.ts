import { useCallback, useEffect, useState } from "react";
import { api, errorMessage } from "@/lib/api";

type QueryResult<T> = { data: T | null; error: string | null };

// Busca um recurso da API ao montar e expõe reload() para depois de uma ação.
// O estado só muda quando a resposta chega (nada de setState síncrono no efeito).
export function useApiQuery<T>(path: string) {
  const [result, setResult] = useState<QueryResult<T>>({ data: null, error: null });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isCurrent = true;
    api
      .get<T>(path)
      .then((data) => {
        if (isCurrent) setResult({ data, error: null });
      })
      .catch((cause: unknown) => {
        if (isCurrent) setResult((current) => ({ ...current, error: errorMessage(cause) }));
      })
      .finally(() => {
        if (isCurrent) setIsLoading(false);
      });
    return () => {
      isCurrent = false;
    };
  }, [path]);

  const reload = useCallback(async () => {
    setIsLoading(true);
    try {
      setResult({ data: await api.get<T>(path), error: null });
    } catch (cause) {
      setResult((current) => ({ ...current, error: errorMessage(cause) }));
    } finally {
      setIsLoading(false);
    }
  }, [path]);

  return { data: result.data, error: result.error, isLoading, reload };
}
