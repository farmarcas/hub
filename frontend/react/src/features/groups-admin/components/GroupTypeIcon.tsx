import { cn } from "@/lib/cn";
import type { GroupType } from "@/types/api";

// Mesma linguagem do globo: tema = círculo vazado, diretoria = losango.
export function GroupTypeIcon({ type, className }: { type: GroupType; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-block size-3 shrink-0 border-[1.5px]",
        type === "Tema" ? "rounded-full border-primary" : "rotate-45 border-accent-soft",
        className,
      )}
    />
  );
}
