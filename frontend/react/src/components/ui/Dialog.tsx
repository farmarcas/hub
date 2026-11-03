import { useEffect, useRef, type ReactNode } from "react";

type DialogProps = {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  footer: ReactNode;
};

// <dialog> nativo: prende o foco, fecha com Escape e devolve o foco a quem abriu.
export function Dialog({ title, isOpen, onClose, children, footer }: DialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (isOpen && !dialog.open) dialog.showModal();
    if (!isOpen && dialog.open) dialog.close();
  }, [isOpen]);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="dialog-title"
      onClose={onClose}
      className="m-auto w-[min(520px,calc(100vw-32px))] rounded-lg border border-border-strong bg-surface p-0 text-foreground backdrop:bg-overlay backdrop:backdrop-blur-sm"
    >
      <div className="flex flex-col gap-4 p-6">
        <h2 id="dialog-title" className="text-lg font-medium">
          {title}
        </h2>
        <div className="text-sm text-soft-foreground">{children}</div>
        <div className="flex justify-end gap-2">{footer}</div>
      </div>
    </dialog>
  );
}
