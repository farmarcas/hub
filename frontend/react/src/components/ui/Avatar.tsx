import { cn } from "@/lib/cn";

const avatarSize = { sm: "size-7 text-[11px]", md: "size-8 text-xs" } as const;

type AvatarProps = { name: string; size?: keyof typeof avatarSize; className?: string };

export function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? (parts.at(-1)?.[0] ?? "") : "";
  return (first + last).toUpperCase();
}

export function Avatar({ name, size = "md", className }: AvatarProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full border border-primary-border bg-primary-wash font-medium text-accent-soft",
        avatarSize[size],
        className,
      )}
    >
      {initials(name)}
    </span>
  );
}
