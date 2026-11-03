import type { ReactNode } from "react";
import { Button } from "./Button";

export function LoadingState({ label = "Carregando…" }: { label?: string }) {
  return (
    <div role="status" className="flex items-center gap-3 p-6 text-sm text-muted-foreground">
      <span className="size-2 animate-pulse rounded-full bg-primary" aria-hidden="true" />
      {label}
    </div>
  );
}

type EmptyStateProps = { title: string; children?: ReactNode };

export function EmptyState({ title, children }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-start gap-2 p-6 text-sm">
      <p className="font-medium text-secondary-foreground">{title}</p>
      {children && <div className="text-muted-foreground">{children}</div>}
    </div>
  );
}

type ErrorStateProps = { message: string; onRetry?: () => void };

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div
      role="alert"
      className="flex flex-col items-start gap-3 rounded-lg border border-destructive-border bg-destructive-tint p-4 text-sm"
    >
      <p className="text-foreground">{message}</p>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          Tentar de novo
        </Button>
      )}
    </div>
  );
}
