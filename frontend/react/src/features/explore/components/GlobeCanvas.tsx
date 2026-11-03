import { cn } from "@/lib/cn";
import { useGlobe } from "../hooks/useGlobe";
import type { GlobeLayout } from "../lib/layout";

type GlobeCanvasProps = {
  layout: GlobeLayout;
  focusId: string;
  previewId: string | null;
  isPanelOpen: boolean;
  onPick: (id: string) => void;
};

export function GlobeCanvas({ layout, focusId, previewId, isPanelOpen, onPick }: GlobeCanvasProps) {
  const { stageRef, canvasRef, backgroundRef, cursor } = useGlobe({
    layout,
    focusId,
    previewId,
    isPanelOpen,
    onPick,
  });

  return (
    <div
      ref={stageRef}
      className={cn(
        "absolute inset-0 touch-none select-none",
        cursor === "grab" && "cursor-grab",
        cursor === "grabbing" && "cursor-grabbing",
        cursor === "pointer" && "cursor-pointer",
      )}
    >
      <canvas ref={backgroundRef} aria-hidden="true" className="absolute inset-0 size-full" />
      <canvas
        ref={canvasRef}
        role="img"
        aria-label="Globo de soluções: temas e diretorias na órbita interna, soluções na superfície. Use a busca para navegar pelo teclado."
        className="absolute inset-0 size-full"
      />
    </div>
  );
}
