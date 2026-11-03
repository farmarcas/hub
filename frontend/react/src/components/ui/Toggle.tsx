import { cn } from "@/lib/cn";

type ToggleProps = {
  id: string;
  label: string;
  description?: string;
  isChecked: boolean;
  onChange: (isChecked: boolean) => void;
};

export function Toggle({ id, label, description, isChecked, onChange }: ToggleProps) {
  return (
    <div className="flex items-center gap-3">
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={isChecked}
        onClick={() => onChange(!isChecked)}
        className={cn(
          "relative h-5 w-9 shrink-0 rounded-chip border transition-colors duration-200",
          "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
          isChecked ? "border-primary bg-primary" : "border-border-strong bg-background",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 left-0.5 size-3.5 rounded-full transition-transform duration-200",
            isChecked ? "translate-x-4 bg-primary-foreground" : "bg-muted-foreground",
          )}
        />
      </button>
      <label htmlFor={id} className="flex flex-col">
        <span className="text-sm text-foreground">{label}</span>
        {description && <span className="text-xs text-subtle-foreground">{description}</span>}
      </label>
    </div>
  );
}
