import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type CardProps = { children: ReactNode; className?: string; hasError?: boolean };

export function Card({ children, className, hasError = false }: CardProps) {
  return (
    <section
      className={cn(
        "rounded-lg border bg-surface p-5 backdrop-blur-md",
        hasError ? "border-destructive-border" : "border-border-subtle",
        className,
      )}
    >
      {children}
    </section>
  );
}

type EyebrowProps = { children: ReactNode; className?: string };

export function Eyebrow({ children, className }: EyebrowProps) {
  return (
    <p
      className={cn(
        "text-[10.5px] font-semibold tracking-[0.15em] text-primary uppercase",
        className,
      )}
    >
      {children}
    </p>
  );
}
