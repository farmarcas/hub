import type { Graph } from "@/types/api";
import { Breadcrumb } from "./Breadcrumb";
import { ExploreDetails } from "./ExploreDetails";
import { GlobeSearch } from "./GlobeSearch";

type ExploreListProps = {
  graph: Graph;
  focusId: string;
  breadcrumb: { id: string; name: string }[];
  onSelect: (id: string) => void;
};

// Explorar no celular: o mesmo conteúdo do painel, em tela cheia e sem globo.
export function ExploreList({ graph, focusId, breadcrumb, onSelect }: ExploreListProps) {
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
      <div className="flex flex-col gap-3 border-b border-border-subtle px-4 py-4">
        <Breadcrumb items={breadcrumb} onSelect={onSelect} />
        <GlobeSearch graph={graph} onSelect={onSelect} />
      </div>
      <div className="px-4 pt-6 pb-10">
        <ExploreDetails graph={graph} focusId={focusId} onSelect={onSelect} />
      </div>
    </div>
  );
}
