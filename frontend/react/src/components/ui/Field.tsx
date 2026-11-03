import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type FieldProps = {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  className?: string;
  children: ReactNode;
};

// Rótulo + controle + ajuda/erro. O controle recebe aria-describedby={`${id}-message`}.
export function Field({ id, label, hint, error, className, children }: FieldProps) {
  const message = error ?? hint;
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={id} className="text-xs font-medium text-soft-foreground">
        {label}
      </label>
      {children}
      {message && (
        <p
          id={`${id}-message`}
          className={cn("text-xs", error ? "text-destructive" : "text-subtle-foreground")}
        >
          {message}
        </p>
      )}
    </div>
  );
}

export const controlClass = cn(
  "w-full rounded-md border border-border bg-background/60 px-3 py-2 text-sm text-foreground",
  "placeholder:text-subtle-foreground",
  "focus-visible:border-primary-border focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:outline-none",
  "aria-invalid:border-destructive-border",
);
