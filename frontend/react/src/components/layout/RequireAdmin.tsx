import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { ROUTES } from "@/lib/routes";
import { useSession } from "@/features/session";

// Só esconde a tela. Quem barra de verdade é o servidor (403).
export function RequireAdmin({ children }: { children: ReactNode }) {
  const { viewer } = useSession();
  if (!viewer?.isAdmin) return <Navigate to={ROUTES.explore} replace />;
  return children;
}
