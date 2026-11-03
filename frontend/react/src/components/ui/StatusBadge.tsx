import { cn } from "@/lib/cn";

const badgeTone = {
  published: "border-primary-border bg-primary-tint text-primary-hover",
  review: "border-border-strong text-accent-soft",
  archived: "border-border text-subtle-foreground",
} as const;

type StatusBadgeProps = {
  tone: keyof typeof badgeTone;
  label: string;
};

export function StatusBadge({ tone, label }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-sm border px-2 py-0.5 text-[11px] font-medium",
        badgeTone[tone],
      )}
    >
      {label}
    </span>
  );
}
