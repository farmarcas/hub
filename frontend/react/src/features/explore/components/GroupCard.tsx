import { cn } from "@/lib/cn";
import type { GraphGroup } from "@/types/api";
import { solutionCountLabel } from "@/lib/plural";

type GroupCardProps = {
  group: GraphGroup;
  isPreviewing: boolean;
  // Sem onPreview (lista do celular) não há prévia: tocar já entra no grupo.
  onPreview?: (id: string | null) => void;
  onSelect: (id: string) => void;
};

// Cartão de tema/diretoria no Núcleo. Mouse ou foco = prévia no globo; clique ou toque = entrar.
export function GroupCard({ group, isPreviewing, onPreview, onSelect }: GroupCardProps) {
  const isTheme = group.type === "Tema";

  return (
    <button
      type="button"
      onMouseEnter={onPreview && (() => onPreview(group.id))}
      onFocus={onPreview && (() => onPreview(group.id))}
      onMouseLeave={onPreview && (() => onPreview(null))}
      onBlur={onPreview && (() => onPreview(null))}
      onClick={() => onSelect(group.id)}
      className={cn(
        "flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-left transition-colors duration-200",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
        isPreviewing
          ? "border-primary-border bg-primary-wash"
          : "border-border-subtle bg-background/40 hover:border-border-strong",
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "shrink-0 border-2",
          isTheme
            ? "size-3 rounded-full border-primary"
            : "mx-px size-2.5 rotate-45 border-accent-soft",
        )}
      />
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-sm font-medium text-foreground">{group.name}</span>
        {group.description && (
          <span className="truncate text-xs text-muted-foreground">{group.description}</span>
        )}
      </span>
      <span className="shrink-0 text-xs text-subtle-foreground">
        {solutionCountLabel(group.solutionCount)}
      </span>
    </button>
  );
}
