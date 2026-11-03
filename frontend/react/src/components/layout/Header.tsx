import { BookOpen } from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/cn";
import { ROUTES } from "@/lib/routes";

type HeaderProps = { title: string };

export function Header({ title }: HeaderProps) {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-4 border-b border-border-subtle px-6">
      <h1 className="truncate text-xl font-medium">{title}</h1>
      <div className="flex items-center gap-4">
        <span className="hidden text-xs text-subtle-foreground sm:inline">
          Hub de Inovação Farmarcas
        </span>
        <NavLink
          to={ROUTES.policies}
          className={({ isActive }) =>
            cn(
              "inline-flex h-9 items-center gap-2 rounded-[9px] border px-3 text-[13px] transition-colors duration-200",
              "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
              isActive
                ? "border-primary-border bg-primary-tint text-primary-hover shadow-glow-sm"
                : "border-border-strong text-secondary-foreground hover:text-foreground",
            )
          }
        >
          <BookOpen size={16} strokeWidth={1.6} aria-hidden="true" />
          Políticas
        </NavLink>
      </div>
    </header>
  );
}
