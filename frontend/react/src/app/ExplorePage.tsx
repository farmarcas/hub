import { ExploreView } from "@/features/explore";

// Área cheia abaixo do cabeçalho (altura visível − 64px). dvh acompanha a barra do navegador
// do celular; no celular a lista rola dentro desta área.
export function ExplorePage() {
  return (
    <div className="flex h-[calc(100dvh-64px)] min-h-0 flex-col">
      <ExploreView />
    </div>
  );
}
