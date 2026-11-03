import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { ErrorState, LoadingState } from "@/components/ui/States";
import { errorMessage } from "@/lib/api";
import type { DeletionImpact, GroupSummary, NamedRef } from "@/types/api";

type DeleteGroupDialogProps = {
  group: GroupSummary;
  isOpen: boolean;
  loadImpact: (id: string) => Promise<DeletionImpact>;
  onConfirm: () => Promise<string | null>;
  onClose: () => void;
};

function NameList({ title, items }: { title: string; items: NamedRef[] }) {
  if (items.length === 0) return null;
  return (
    <div className="rounded-md border border-destructive-border bg-destructive-tint p-3">
      <p className="text-xs font-medium text-foreground">{title}</p>
      <ul className="mt-1 list-disc pl-5 text-xs">
        {items.map((item) => (
          <li key={item.id}>{item.name}</li>
        ))}
      </ul>
    </div>
  );
}

// Antes de excluir, mostra o impacto: quem perde a relação no grafo ou a única regra de acesso.
export function DeleteGroupDialog({
  group,
  isOpen,
  loadImpact,
  onConfirm,
  onClose,
}: DeleteGroupDialogProps) {
  const [impact, setImpact] = useState<DeletionImpact | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // O componente é montado só quando o diálogo abre, então o estado começa sempre limpo.
  useEffect(() => {
    let isCurrent = true;
    loadImpact(group.id)
      .then((result) => {
        if (isCurrent) setImpact(result);
      })
      .catch((cause: unknown) => {
        if (isCurrent) setError(errorMessage(cause));
      });
    return () => {
      isCurrent = false;
    };
  }, [group.id, loadImpact]);

  const handleConfirm = async () => {
    setIsDeleting(true);
    const failure = await onConfirm();
    setIsDeleting(false);
    if (failure) setError(failure);
    else onClose();
  };

  return (
    <Dialog
      title={`Excluir “${group.name}”?`}
      isOpen={isOpen}
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            variant="destructive"
            disabled={!impact || isDeleting}
            onClick={() => void handleConfirm()}
          >
            {isDeleting ? "Excluindo…" : "Excluir grupo"}
          </Button>
        </>
      }
    >
      {error && <ErrorState message={error} />}
      {!impact && !error && <LoadingState label="Calculando o impacto…" />}
      {impact && (
        <div className="flex flex-col gap-3">
          <p>
            {impact.solutions.length} soluções e {impact.members.length} pessoas são afetadas. O
            grupo sai das relações no grafo, das regras de acesso e da lista de membros.
          </p>
          <NameList
            title="Ficariam sem tema ou diretoria (soltas no grafo):"
            items={impact.orphanedByGroup}
          />
          <NameList
            title="Ficariam sem regra de acesso (ninguém mais vê):"
            items={impact.orphanedByAccess}
          />
          {(impact.orphanedByGroup.length > 0 || impact.orphanedByAccess.length > 0) && (
            <p className="text-xs text-subtle-foreground">
              Depois de excluir, edite essas soluções para definir uma nova relação ou regra.
            </p>
          )}
        </div>
      )}
    </Dialog>
  );
}
