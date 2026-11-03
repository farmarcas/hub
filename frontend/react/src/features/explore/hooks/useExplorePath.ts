import { useCallback, useEffect, useState } from "react";

export const CORE = "core";

// Caminho da trilha "Núcleo / Grupo / Solução". Esc volta um nível.
export function useExplorePath(knownIds: Set<string>) {
  const [path, setPath] = useState<string[]>([CORE]);
  const focusId = path[path.length - 1] ?? CORE;

  const goTo = useCallback((id: string) => {
    setPath((current) => {
      if (id === CORE) return [CORE];
      const index = current.indexOf(id);
      return index >= 0 ? current.slice(0, index + 1) : [...current, id];
    });
  }, []);

  const back = useCallback(() => {
    setPath((current) => (current.length > 1 ? current.slice(0, -1) : current));
  }, []);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      // Esc com texto na busca só limpa a busca; em formulários e diálogos não mexe no globo.
      const target = event.target as HTMLElement | null;
      if (target instanceof HTMLInputElement && target.value) return;
      if (target?.closest("textarea, select, dialog")) return;
      back();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [back]);

  // Se um nó do caminho deixou de existir (ex.: troca de pessoa), volta ao Núcleo.
  const validPath = path.every((id) => id === CORE || knownIds.has(id)) ? path : [CORE];

  return { path: validPath, focusId: validPath === path ? focusId : CORE, goTo, back };
}
