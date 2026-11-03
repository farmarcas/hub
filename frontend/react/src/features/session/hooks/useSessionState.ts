import { useCallback, useEffect, useState } from "react";
import { api, errorMessage } from "@/lib/api";
import { readViewerId, writeViewerId } from "@/lib/viewerStorage";
import type { Identity } from "@/types/api";

export type SessionState = {
  viewer: Identity | null;
  identities: Identity[];
  isLoading: boolean;
  error: string | null;
  switchTo: (id: string) => void;
  retry: () => void;
};

// Sem integração com o Radar ainda: escolhe a pessoa salva ou, na primeira vez, o primeiro admin.
function pickInitial(identities: Identity[]): Identity | null {
  const saved = readViewerId();
  return (
    identities.find(({ id }) => id === saved) ??
    identities.find(({ isAdmin }) => isAdmin) ??
    identities[0] ??
    null
  );
}

export function useSessionState(): SessionState {
  const [identities, setIdentities] = useState<Identity[]>([]);
  const [viewer, setViewer] = useState<Identity | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let isCurrent = true;
    api
      .get<{ data: Identity[] }>("/identities")
      .then(({ data }) => {
        if (!isCurrent) return;
        const initial = pickInitial(data);
        if (initial) writeViewerId(initial.id);
        setIdentities(data);
        setViewer(initial);
        setError(null);
      })
      .catch((cause: unknown) => {
        if (isCurrent) setError(errorMessage(cause));
      })
      .finally(() => {
        if (isCurrent) setIsLoading(false);
      });
    return () => {
      isCurrent = false;
    };
  }, [attempt]);

  const switchTo = useCallback(
    (id: string) => {
      const next = identities.find((identity) => identity.id === id);
      if (!next) return;
      writeViewerId(next.id);
      setViewer(next);
    },
    [identities],
  );

  const retry = useCallback(() => {
    setIsLoading(true);
    setAttempt((value) => value + 1);
  }, []);

  return { viewer, identities, isLoading, error, switchTo, retry };
}
