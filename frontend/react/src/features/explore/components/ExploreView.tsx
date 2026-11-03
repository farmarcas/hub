import { useCallback, useMemo, useState } from "react";
import { ErrorState, LoadingState } from "@/components/ui/States";
import { cn } from "@/lib/cn";
import type { Graph } from "@/types/api";
import { CORE, useExplorePath } from "../hooks/useExplorePath";
import { useGraph } from "../hooks/useGraph";
import { useMediaQuery } from "../hooks/useMediaQuery";
import { usePanel } from "../hooks/usePanel";
import { buildLayout } from "../lib/layout";
import { Breadcrumb } from "./Breadcrumb";
import { DetailPanel } from "./DetailPanel";
import { ExploreList } from "./ExploreList";
import { GlobeCanvas } from "./GlobeCanvas";
import { GlobeLegend } from "./GlobeLegend";
import { GlobeSearch } from "./GlobeSearch";

const WIDE_SCREEN = "(min-width: 768px)";

function Explorer({ graph }: { graph: Graph }) {
  const layout = useMemo(() => buildLayout(graph.groups, graph.solutions), [graph]);
  const knownIds = useMemo(() => new Set(layout.ids), [layout]);
  const { path, focusId, goTo } = useExplorePath(knownIds);
  const panel = usePanel();
  const { pin } = panel;
  const [previewId, setPreviewId] = useState<string | null>(null);
  // Abaixo do tablet (md = 768px) a tela vira lista, sem globo.
  const isWide = useMediaQuery(WIDE_SCREEN);
  // A prévia só vale com o painel do Núcleo aberto; fora dele o globo segue o foco.
  const activePreview = focusId === CORE && panel.isOpen ? previewId : null;

  const nameOf = (id: string) => (id === CORE ? "Núcleo" : (layout.nodes[id]?.name ?? ""));

  // Clicar numa solução também fixa o painel aberto.
  const handlePick = useCallback(
    (id: string) => {
      setPreviewId(null);
      goTo(id);
      if (layout.nodes[id]?.kind === "sol") pin();
    },
    [goTo, layout, pin],
  );

  const breadcrumb = path.map((id) => ({ id, name: nameOf(id) }));

  if (!isWide) {
    return (
      // A chave pelo nível volta a lista para o topo a cada toque.
      <ExploreList
        key={focusId}
        graph={graph}
        focusId={focusId}
        breadcrumb={breadcrumb}
        onSelect={goTo}
      />
    );
  }

  return (
    // overflow-clip (e não hidden): o painel fora da tela não pode empurrar o globo ao receber foco.
    <div className="relative min-h-[560px] flex-1 overflow-clip">
      <GlobeCanvas
        layout={layout}
        focusId={focusId}
        previewId={activePreview}
        isPanelOpen={panel.isOpen}
        onPick={handlePick}
      />

      {/* Trilha e busca ficam na área visível: com o painel aberto, param antes dele. */}
      <div
        className={cn(
          "pointer-events-none absolute top-5 left-6 z-10 flex flex-wrap items-start justify-between gap-4",
          "transition-[right] duration-[260ms] ease-panel",
          panel.isOpen ? "right-[calc(clamp(300px,32%,380px)+1.5rem)]" : "right-6",
        )}
      >
        <div className="pointer-events-auto">
          <Breadcrumb items={breadcrumb} onSelect={goTo} />
        </div>
        <div className="pointer-events-auto">
          <GlobeSearch graph={graph} onSelect={handlePick} />
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-5 left-6 z-10">
        <GlobeLegend />
      </div>

      <DetailPanel
        graph={graph}
        focusId={focusId}
        previewId={activePreview}
        onPreview={setPreviewId}
        isOpen={panel.isOpen}
        isPinned={panel.isPinned}
        onEnter={panel.enter}
        onLeave={panel.leave}
        onTogglePin={panel.togglePin}
        onClose={panel.close}
        onSelect={handlePick}
      />
    </div>
  );
}

export function ExploreView() {
  const { graph, isLoading, error, reload } = useGraph();

  if (isLoading && !graph) return <LoadingState label="Carregando soluções…" />;
  if (error)
    return (
      <div className="p-6">
        <ErrorState message={error} onRetry={() => void reload()} />
      </div>
    );
  if (!graph) return null;
  return <Explorer graph={graph} />;
}
