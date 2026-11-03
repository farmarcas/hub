import { Chip } from "@/components/ui/Chip";
import type { NamedRef } from "@/types/api";

type ChipGroupProps = {
  label: string;
  items: NamedRef[];
  selectedIds: string[];
  isDisabled?: boolean;
  emptyLabel?: string;
  onToggle: (id: string) => void;
};

export function ChipGroup({
  label,
  items,
  selectedIds,
  isDisabled = false,
  emptyLabel = "Nada para escolher ainda.",
  onToggle,
}: ChipGroupProps) {
  return (
    <fieldset className="flex flex-col gap-2" disabled={isDisabled}>
      <legend className="mb-2 text-xs font-medium text-soft-foreground">{label}</legend>
      {items.length === 0 ? (
        <p className="text-xs text-subtle-foreground">{emptyLabel}</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {items.map((item) => (
            <Chip
              key={item.id}
              isSelected={selectedIds.includes(item.id)}
              isDisabled={isDisabled}
              onToggle={() => onToggle(item.id)}
            >
              {item.name}
            </Chip>
          ))}
        </div>
      )}
    </fieldset>
  );
}
