import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type ChipProps = {
  children: ReactNode;
  isSelected?: boolean;
  isDisabled?: boolean;
  onToggle?: () => void;
  className?: string;
};

// Sem onToggle é só rótulo; com onToggle vira botão de alternância (aria-pressed).
export function Chip({ children, isSelected = false, isDisabled, onToggle, className }: ChipProps) {
  const classes = cn(
    "inline-flex items-center gap-1.5 rounded-chip border px-3 py-1 text-xs whitespace-nowrap",
    "transition-colors duration-200",
    isSelected
      ? "border-primary-border bg-primary-tint text-primary-hover"
      : "border-border text-soft-foreground",
    className,
  );

  if (!onToggle) return <span className={classes}>{children}</span>;

  return (
    <button
      type="button"
      aria-pressed={isSelected}
      disabled={isDisabled}
      onClick={onToggle}
      className={cn(
        classes,
        "hover:border-primary-border hover:text-foreground",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
        "disabled:pointer-events-none",
      )}
    >
      {children}
    </button>
  );
}
