import type { ReactNode } from "react";

type BannerProps = { title: string; children: ReactNode };

export function Banner({ title, children }: BannerProps) {
  return (
    <div
      role="note"
      className="rounded-lg border border-primary-border bg-primary-wash px-4 py-3 text-sm"
    >
      <p className="font-medium text-primary-hover">{title}</p>
      <p className="mt-0.5 text-soft-foreground">{children}</p>
    </div>
  );
}
