import { PanelRight, X } from "lucide-react";
import { cn } from "@/lib/cn";
import type { Graph } from "@/types/api";
import { ExploreDetails } from "./ExploreDetails";

type DetailPanelProps = {
  graph: Graph;
  focusId: string;
  previewId: string | null;
  onPreview: (id: string | null) => void;
  isOpen: boolean;
  isPinned: boolean;
  onEnter: () => void;
  onLeave: () => void;
  onTogglePin: () => void;
  onClose: () => void;
  onSelect: (id: string) => void;
};

export function DetailPanel(props: DetailPanelProps) {
  const {
    graph,
    focusId,
    previewId,
    onPreview,
    isOpen,
    isPinned,
    onEnter,
    onLeave,
    onTogglePin,
    onClose,
    onSelect,
  } = props;

  return (
    <>
      <button
        type="button"
        aria-label={isPinned ? "Desafixar painel de detalhes" : "Fixar painel de detalhes"}
        aria-expanded={isOpen}
        aria-controls="detail-panel"
        onMouseEnter={onEnter}
        onMouseLeave={onLeave}
        onFocus={onEnter}
        onClick={onTogglePin}
        className={cn(
          "absolute top-1/2 z-20 flex size-10 -translate-y-1/2 items-center justify-center rounded-l-icon border border-r-0",
          "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
          // Acompanha a borda do painel: nunca fica escondido atrás dele.
          "transition-[right,color,background-color,border-color] duration-[260ms] ease-panel",
          isOpen ? "right-[clamp(300px,32%,380px)]" : "right-0",
          isPinned
            ? "border-primary-border bg-primary-tint text-primary-hover"
            : "border-border-strong bg-surface text-muted-foreground hover:text-foreground",
        )}
      >
        <PanelRight size={20} strokeWidth={1.6} aria-hidden="true" />
      </button>

      <aside
        id="detail-panel"
        aria-label="Detalhes"
        onMouseEnter={onEnter}
        onMouseLeave={onLeave}
        className={cn(
          "absolute inset-y-0 right-0 z-30 w-[clamp(300px,32%,380px)] overflow-y-auto border-l border-border-subtle bg-panel px-6 pt-7 pb-9",
          // visibility tira o painel fechado da ordem do Tab e do leitor de tela, sem cortar a animação.
          "transition-[transform,visibility] duration-[260ms] ease-panel",
          isOpen ? "visible translate-x-0" : "invisible translate-x-full",
        )}
      >
        <button
          type="button"
          aria-label="Fechar painel"
          onClick={onClose}
          className="absolute top-4 right-4 rounded-md border border-border-strong p-1.5 text-muted-foreground hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          <X size={18} aria-hidden="true" />
        </button>
        <ExploreDetails
          graph={graph}
          focusId={focusId}
          previewId={previewId}
          onPreview={onPreview}
          onSelect={onSelect}
        />
      </aside>
    </>
  );
}
