import { createContext, useContext, type ReactNode } from "react";
import { useSessionState, type SessionState } from "./hooks/useSessionState";

const SessionContext = createContext<SessionState | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const session = useSessionState();
  return <SessionContext.Provider value={session}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionState {
  const session = useContext(SessionContext);
  if (!session) throw new Error("useSession precisa estar dentro de <SessionProvider>");
  return session;
}
