import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { ErrorState } from "@/components/ui/States";
import type { SolutionDetail } from "@/types/api";

type DeleteSolutionDialogProps = {
  solution: SolutionDetail;
  onConfirm: () => Promise<string | null>;
  onClose: () => void;
};

// Montado só enquanto aberto. Deixa claro que só a solução escolhida sai do Hub.
export function DeleteSolutionDialog({ solution, onConfirm, onClose }: DeleteSolutionDialogProps) {
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = async () => {
    setIsDeleting(true);
    const failure = await onConfirm();
    setIsDeleting(false);
    if (failure) setError(failure);
    else onClose();
  };

  return (
    <Dialog
      title={`Excluir “${solution.name}”?`}
      isOpen
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="destructive" disabled={isDeleting} onClick={() => void handleConfirm()}>
            {isDeleting ? "Excluindo…" : "Excluir solução"}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-3">
        <p>
          A solução sai do Hub para todos: some da lista, do globo, da busca e das relacionadas. Não
          dá para desfazer pela tela.
        </p>
        {solution.related.length > 0 && (
          <div className="rounded-md border border-border-strong p-3">
            <p className="text-xs font-medium text-foreground">
              Estas soluções continuam no Hub. Só perdem a ligação com {solution.name}:
            </p>
            <ul className="mt-1 list-disc pl-5 text-xs">
              {solution.related.map((related) => (
                <li key={related.id}>{related.name}</li>
              ))}
            </ul>
          </div>
        )}
        {error && <ErrorState message={error} />}
      </div>
    </Dialog>
  );
}
