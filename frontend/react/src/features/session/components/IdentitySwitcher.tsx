import { useEffect, useRef, useState } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { cn } from "@/lib/cn";
import { useSession } from "../SessionProvider";

// Avatar no rodapé do rail. Abre a lista "Entrar como" (identificação simulada até o Radar).
export function IdentitySwitcher() {
  const { viewer, identities, switchTo } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handlePointer = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setIsOpen(false);
    };
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("pointerdown", handlePointer);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("pointerdown", handlePointer);
      document.removeEventListener("keydown", handleKey);
    };
  }, [isOpen]);

  if (!viewer) return null;

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label={`Você está como ${viewer.name}. Trocar pessoa`}
        title={`${viewer.name} · trocar pessoa`}
        onClick={() => setIsOpen((value) => !value)}
        className="rounded-full focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      >
        <Avatar name={viewer.name} />
      </button>

      {isOpen && (
        <div
          role="menu"
          aria-label="Entrar como"
          className="absolute bottom-0 left-12 z-50 w-72 rounded-lg border border-border-strong bg-surface p-2 shadow-2xl backdrop-blur-xl"
        >
          <p className="px-2 pt-1 pb-2 text-[10.5px] font-semibold tracking-[0.15em] text-primary uppercase">
            Entrar como
          </p>
          <p className="px-2 pb-2 text-xs text-subtle-foreground">
            Simulação até a integração com o Radar.
          </p>
          {identities.map((identity) => (
            <button
              key={identity.id}
              type="button"
              role="menuitemradio"
              aria-checked={identity.id === viewer.id}
              onClick={() => {
                switchTo(identity.id);
                setIsOpen(false);
              }}
              className={cn(
                "flex w-full items-center gap-3 rounded-md px-2 py-2 text-left text-sm",
                "hover:bg-primary-wash focus-visible:bg-primary-wash focus-visible:outline-none",
                identity.id === viewer.id && "bg-primary-tint",
              )}
            >
              <Avatar name={identity.name} size="sm" />
              <span className="flex min-w-0 flex-col">
                <span className="truncate text-foreground">{identity.name}</span>
                <span className="truncate text-xs text-subtle-foreground">
                  {identity.isAdmin ? "Admin do Hub" : "Colaborador"}
                </span>
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
