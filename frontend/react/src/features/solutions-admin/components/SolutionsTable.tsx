import { Plus } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/States";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ROUTES } from "@/lib/routes";
import type { SolutionDetail } from "@/types/api";
import { useSolutionsList } from "../hooks/useSolutionsList";
import { accessSummary } from "../lib/accessSummary";
import { DeleteSolutionDialog } from "./DeleteSolutionDialog";

function statusBadge(solution: SolutionDetail) {
  if (solution.archived) return <StatusBadge tone="archived" label="Arquivada" />;
  return solution.status === "Publicada" ? (
    <StatusBadge tone="published" label="Publicada" />
  ) : (
    <StatusBadge tone="review" label="Em avaliação" />
  );
}

const headerCell = "px-4 py-3 text-left text-[10.5px] font-semibold tracking-[0.14em] uppercase";

export function SolutionsTable() {
  const {
    solutions,
    counts,
    isLoading,
    error,
    actionError,
    busyId,
    reload,
    setArchived,
    deleteSolution,
  } = useSolutionsList();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const deleting = solutions.find(({ id }) => id === deletingId) ?? null;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-[26px] font-medium tracking-[-0.4px]">Soluções</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {counts
              ? `${counts.published} publicadas · ${counts.inReview} em avaliação · ${counts.archived} arquivadas`
              : "Catálogo de soluções internas"}
          </p>
        </div>
        <Link
          to={ROUTES.newSolution}
          className="inline-flex h-9 items-center gap-2 rounded-md bg-primary px-4 text-[13px] font-semibold text-primary-foreground shadow-glow transition-colors hover:bg-primary-hover focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          <Plus size={16} aria-hidden="true" />
          Nova solução
        </Link>
      </div>

      {actionError && <ErrorState message={actionError} />}
      {isLoading && solutions.length === 0 && <LoadingState label="Carregando soluções…" />}
      {error && <ErrorState message={error} onRetry={() => void reload()} />}
      {!isLoading && !error && solutions.length === 0 && (
        <EmptyState title="Nenhuma solução cadastrada ainda.">
          Use “Nova solução” para cadastrar a primeira.
        </EmptyState>
      )}

      {solutions.length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-border-subtle bg-surface">
          <table className="w-full min-w-[860px] text-sm">
            <thead className="border-b border-border-subtle text-subtle-foreground">
              <tr>
                <th scope="col" className={headerCell}>
                  Solução
                </th>
                <th scope="col" className={headerCell}>
                  Status
                </th>
                <th scope="col" className={headerCell}>
                  Relações no grafo
                </th>
                <th scope="col" className={headerCell}>
                  Acesso
                </th>
                <th scope="col" className={`${headerCell} text-right`}>
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {solutions.map((solution) => (
                <tr
                  key={solution.id}
                  className="border-b border-border-subtle last:border-0 hover:bg-primary-wash"
                >
                  <td className="px-4 py-3">
                    <p className="font-medium text-foreground">{solution.name}</p>
                    <p className="text-xs text-subtle-foreground">{solution.category.name}</p>
                  </td>
                  <td className="px-4 py-3">{statusBadge(solution)}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1.5">
                      {solution.groups.map((group) => (
                        <Chip key={group.id}>{group.name}</Chip>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-soft-foreground">
                    {accessSummary(solution.access)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Link
                        to={ROUTES.editSolution(solution.id)}
                        aria-label={`Editar ${solution.name}`}
                        className="inline-flex h-8 items-center rounded-md border border-border-strong px-3 text-xs text-secondary-foreground hover:border-primary-border hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                      >
                        Editar
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={busyId === solution.id}
                        aria-label={`${solution.archived ? "Restaurar" : "Arquivar"} ${solution.name}`}
                        onClick={() => void setArchived(solution.id, !solution.archived)}
                      >
                        {solution.archived ? "Restaurar" : "Arquivar"}
                      </Button>
                      <Button
                        variant="ghost-destructive"
                        size="sm"
                        disabled={busyId === solution.id}
                        aria-label={`Excluir ${solution.name}`}
                        onClick={() => setDeletingId(solution.id)}
                      >
                        Excluir
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {deleting && (
        <DeleteSolutionDialog
          solution={deleting}
          onConfirm={() => deleteSolution(deleting.id)}
          onClose={() => setDeletingId(null)}
        />
      )}
    </div>
  );
}
