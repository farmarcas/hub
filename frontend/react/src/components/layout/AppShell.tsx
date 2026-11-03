import { Outlet, useLocation } from "react-router-dom";
import { ErrorState, LoadingState } from "@/components/ui/States";
import { titleFor } from "@/lib/routes";
import { useSession } from "@/features/session";
import { Header } from "./Header";
import { Rail } from "./Rail";

export function AppShell() {
  const { pathname } = useLocation();
  const { viewer, isLoading, error, retry } = useSession();

  return (
    <div className="min-h-full pl-16">
      <Rail />
      <div className="flex min-h-screen flex-col">
        <Header title={titleFor(pathname)} />
        <main className="relative flex min-w-0 flex-1 flex-col">
          {isLoading && <LoadingState label="Identificando…" />}
          {error && (
            <div className="p-6">
              <ErrorState message={error} onRetry={retry} />
            </div>
          )}
          {/* Trocar de pessoa remonta a tela: cada uma vê só o que é dela. */}
          {viewer && <Outlet key={viewer.id} />}
        </main>
      </div>
    </div>
  );
}
