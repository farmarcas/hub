import { Folder, Globe, Layers, Users, type LucideIcon } from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/cn";
import { ROUTES } from "@/lib/routes";
import { IdentitySwitcher, useSession } from "@/features/session";

type RailItem = { to: string; label: string; icon: LucideIcon; end?: boolean };

const EXPLORE: RailItem = { to: ROUTES.explore, label: "Explorar", icon: Globe, end: true };
const ADMIN_ITEMS: RailItem[] = [
  { to: ROUTES.solutions, label: "Soluções", icon: Layers },
  { to: ROUTES.groups, label: "Grupos", icon: Folder },
  { to: ROUTES.users, label: "Usuários", icon: Users },
];

function RailLink({ to, label, icon: Icon, end }: RailItem) {
  return (
    <NavLink
      to={to}
      end={end}
      title={label}
      aria-label={label}
      className={({ isActive }) =>
        cn(
          "flex size-10 items-center justify-center rounded-icon border transition-colors duration-200",
          "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
          isActive
            ? "border-primary-border bg-primary-tint text-primary-hover shadow-glow-sm"
            : "border-transparent text-muted-foreground hover:text-foreground",
        )
      }
    >
      <Icon size={20} strokeWidth={1.6} aria-hidden="true" />
    </NavLink>
  );
}

// Um admin é também colaborador: os itens de administração são um acréscimo no mesmo menu.
export function Rail() {
  const { viewer } = useSession();

  return (
    <nav
      aria-label="Navegação principal"
      className="fixed inset-y-0 left-0 z-40 flex w-16 flex-col items-center gap-3 border-r border-border-subtle bg-rail py-4"
    >
      <span
        aria-hidden="true"
        className="mb-3 flex size-[30px] items-center justify-center rounded-[9px] bg-primary text-sm font-semibold text-primary-foreground"
      >
        H
      </span>
      <RailLink {...EXPLORE} />
      {viewer?.isAdmin && (
        <>
          <span aria-hidden="true" className="h-px w-7 bg-border" />
          {ADMIN_ITEMS.map((item) => (
            <RailLink key={item.to} {...item} />
          ))}
        </>
      )}
      <div className="mt-auto">
        <IdentitySwitcher />
      </div>
    </nav>
  );
}
