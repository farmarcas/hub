import { ArrowUpRight } from "lucide-react";
import type { ReactNode } from "react";
import { Chip } from "@/components/ui/Chip";
import { Eyebrow } from "@/components/ui/Card";
import type { Graph } from "@/types/api";
import { CORE } from "../hooks/useExplorePath";
import { neighborOrbits, relatedSolutions, solutionsInGroup } from "../lib/neighbors";
import { GroupCard } from "./GroupCard";

// Conteúdo de cada nível (Núcleo, grupo, solução). O painel do globo e a lista do celular usam
// o mesmo componente; só o painel tem prévia no globo (previewId/onPreview).
type ExploreDetailsProps = {
  graph: Graph;
  focusId: string;
  onSelect: (id: string) => void;
  previewId?: string | null;
  onPreview?: (id: string | null) => void;
};

function LinkList({ children }: { children: ReactNode }) {
  return <ul className="mt-2 flex flex-col gap-1">{children}</ul>;
}

function LinkItem({ label, meta, onClick }: { label: string; meta?: string; onClick: () => void }) {
  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        className="flex min-h-11 w-full items-center justify-between gap-3 rounded-md px-2 py-1.5 text-left text-sm text-secondary-foreground hover:bg-primary-wash hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none md:min-h-0"
      >
        <span className="truncate">{label}</span>
        {meta && <span className="shrink-0 text-xs text-subtle-foreground">{meta}</span>}
      </button>
    </li>
  );
}

function CoreContent({
  graph,
  previewId,
  onPreview,
  onSelect,
}: Omit<ExploreDetailsProps, "focusId">) {
  return (
    <>
      <Eyebrow>Núcleo</Eyebrow>
      <h2 className="mt-3 text-[26px] leading-tight font-medium tracking-[-0.4px]">
        Toda a inovação Farmarcas, em órbita.
      </h2>
      <p className="mt-3 text-sm text-muted-foreground">
        {onPreview
          ? "Temas e diretorias formam o núcleo; as soluções vivem na superfície. Gire o globo e clique para seguir as conexões."
          : "Temas e diretorias reúnem as soluções da Farmarcas. Toque em um deles para ver o que existe ali."}
      </p>
      {graph.solutions.length === 0 && (
        <p className="mt-3 rounded-md border border-border-subtle p-3 text-sm text-muted-foreground">
          Ainda não há soluções liberadas para você. Fale com o admin do Hub se precisar de acesso.
        </p>
      )}
      <div className="mt-6">
        <Eyebrow className="text-subtle-foreground">Temas e diretorias</Eyebrow>
        {/* Sair da lista encerra a prévia mesmo se o mouse passar rápido entre cartões. */}
        <ul className="mt-3 flex flex-col gap-2" onMouseLeave={() => onPreview?.(null)}>
          {graph.groups.map((group) => (
            <li key={group.id}>
              <GroupCard
                group={group}
                isPreviewing={group.id === previewId}
                onPreview={onPreview}
                onSelect={onSelect}
              />
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

function GroupContent({
  graph,
  groupId,
  onSelect,
}: Pick<ExploreDetailsProps, "graph" | "onSelect"> & { groupId: string }) {
  const group = graph.groups.find(({ id }) => id === groupId);
  if (!group) return null;
  const orbits = neighborOrbits(graph, groupId);
  const solutions = solutionsInGroup(graph, groupId);

  return (
    <>
      <Eyebrow>{group.type}</Eyebrow>
      <h2 className="mt-2 text-xl font-medium">{group.name}</h2>
      <p className="mt-2 text-sm text-muted-foreground">{group.description || "Sem descrição."}</p>
      {orbits.length > 0 && (
        <div className="mt-6">
          <Eyebrow>Órbitas vizinhas</Eyebrow>
          <div className="mt-2 flex flex-wrap gap-2">
            {orbits.map((orbit) => (
              <Chip key={orbit.id} onToggle={() => onSelect(orbit.id)}>
                {orbit.name}
              </Chip>
            ))}
          </div>
        </div>
      )}
      <div className="mt-6">
        <Eyebrow>Soluções em órbita · {solutions.length}</Eyebrow>
        {solutions.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">Nenhuma solução visível para você.</p>
        ) : (
          <LinkList>
            {solutions.map((solution) => (
              <LinkItem
                key={solution.id}
                label={solution.name}
                meta={solution.category}
                onClick={() => onSelect(solution.id)}
              />
            ))}
          </LinkList>
        )}
      </div>
    </>
  );
}

function SolutionContent({
  graph,
  solutionId,
  onSelect,
}: Pick<ExploreDetailsProps, "graph" | "onSelect"> & { solutionId: string }) {
  const solution = graph.solutions.find(({ id }) => id === solutionId);
  if (!solution) return null;
  const groups = graph.groups.filter(({ id }) => solution.groupIds.includes(id));
  const related = relatedSolutions(graph, solutionId);

  return (
    <>
      <Eyebrow>{solution.category}</Eyebrow>
      <h2 className="mt-2 text-xl font-medium">{solution.name}</h2>
      <p className="mt-2 text-sm text-muted-foreground">{solution.description}</p>
      <div className="mt-5 rounded-lg border border-primary-border bg-primary-wash p-4">
        <Eyebrow>Objetivo</Eyebrow>
        <p className="mt-1.5 text-sm text-soft-foreground">{solution.objective}</p>
      </div>
      <a
        href={solution.url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-primary text-sm font-semibold text-primary-foreground shadow-glow transition-colors hover:bg-primary-hover focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none md:h-10"
      >
        Abrir solução
        <ArrowUpRight size={16} aria-hidden="true" />
        <span className="sr-only">(abre em nova aba)</span>
      </a>
      <div className="mt-6">
        <Eyebrow>Temas e diretorias</Eyebrow>
        <div className="mt-2 flex flex-wrap gap-2">
          {groups.map((group) => (
            <Chip key={group.id} onToggle={() => onSelect(group.id)}>
              {group.name}
            </Chip>
          ))}
        </div>
      </div>
      {related.length > 0 && (
        <div className="mt-6">
          <Eyebrow>Relacionadas</Eyebrow>
          <LinkList>
            {related.map(({ solution: other, via }) => (
              <LinkItem
                key={other.id}
                label={other.name}
                meta={via ? `via ${via}` : "relação direta"}
                onClick={() => onSelect(other.id)}
              />
            ))}
          </LinkList>
        </div>
      )}
    </>
  );
}

export function ExploreDetails({
  graph,
  focusId,
  onSelect,
  previewId = null,
  onPreview,
}: ExploreDetailsProps) {
  if (focusId === CORE) {
    return (
      <CoreContent graph={graph} previewId={previewId} onPreview={onPreview} onSelect={onSelect} />
    );
  }
  if (graph.solutions.some(({ id }) => id === focusId)) {
    return <SolutionContent graph={graph} solutionId={focusId} onSelect={onSelect} />;
  }
  return <GroupContent graph={graph} groupId={focusId} onSelect={onSelect} />;
}
