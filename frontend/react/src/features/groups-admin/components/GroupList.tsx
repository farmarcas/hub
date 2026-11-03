import { cn } from "@/lib/cn";
import { peopleCountLabel, solutionCountLabel } from "@/lib/plural";
import type { GroupSummary } from "@/types/api";
import type { GroupFilter } from "../hooks/useGroups";
import { GroupTypeIcon } from "./GroupTypeIcon";

const FILTERS: { value: GroupFilter; label: string }[] = [
  { value: "Todos", label: "Todos" },
  { value: "Tema", label: "Temas" },
  { value: "Diretoria", label: "Diretorias" },
];

type GroupListProps = {
  groups: GroupSummary[];
  filter: GroupFilter;
  openGroupId: string | null;
  onFilterChange: (filter: GroupFilter) => void;
  onOpen: (id: string) => void;
};

export function GroupList({ groups, filter, openGroupId, onFilterChange, onOpen }: GroupListProps) {
  return (
    <div className="flex flex-col gap-3">
      <div
        role="group"
        aria-label="Filtrar grupos"
        className="flex gap-1 rounded-md border border-border-subtle p-1"
      >
        {FILTERS.map((option) => (
          <button
            key={option.value}
            type="button"
            aria-pressed={filter === option.value}
            onClick={() => onFilterChange(option.value)}
            className={cn(
              "flex-1 rounded-sm px-3 py-1.5 text-xs transition-colors",
              "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
              filter === option.value
                ? "bg-primary-tint text-primary-hover"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {option.label}
          </button>
        ))}
      </div>

      {groups.length === 0 ? (
        <p className="p-3 text-sm text-muted-foreground">Nenhum grupo deste tipo ainda.</p>
      ) : (
        <ul className="flex flex-col gap-1.5">
          {groups.map((group) => (
            <li key={group.id}>
              <button
                type="button"
                aria-current={group.id === openGroupId ? "true" : undefined}
                onClick={() => onOpen(group.id)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors",
                  "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                  group.id === openGroupId
                    ? "border-primary-border bg-primary-wash"
                    : "border-border-subtle bg-surface hover:border-border-strong",
                )}
              >
                <GroupTypeIcon type={group.type} />
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-sm text-foreground">{group.name}</span>
                  <span className="text-xs text-subtle-foreground">
                    {solutionCountLabel(group.solutionCount)} ·{" "}
                    {peopleCountLabel(group.memberCount)}
                  </span>
                </span>
                <span className="text-[11px] text-subtle-foreground">{group.type}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
