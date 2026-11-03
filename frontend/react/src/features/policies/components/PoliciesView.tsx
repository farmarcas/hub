import { useState, type KeyboardEvent } from "react";
import { Card, Eyebrow } from "@/components/ui/Card";
import { cn } from "@/lib/cn";
import { POLICY_TABS, type PolicyTabId } from "../content";
import { CreatePanel, GovernancePanel, PublishPanel } from "./PolicyPanels";

const PANELS: Record<PolicyTabId, () => JSX.Element> = {
  create: CreatePanel,
  publish: PublishPanel,
  governance: GovernancePanel,
};

export function PoliciesView() {
  const [activeTab, setActiveTab] = useState<PolicyTabId>("create");
  const Panel = PANELS[activeTab];

  // Setas esquerda/direita trocam de aba (padrão de abas acessíveis).
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    const index = POLICY_TABS.findIndex(({ id }) => id === activeTab);
    const step = event.key === "ArrowRight" ? 1 : -1;
    const next = POLICY_TABS[(index + step + POLICY_TABS.length) % POLICY_TABS.length];
    if (!next) return;
    setActiveTab(next.id);
    document.getElementById(`policy-tab-${next.id}`)?.focus();
  };

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <div>
        <Eyebrow>Políticas</Eyebrow>
        <h2 className="mt-2 text-[26px] font-medium tracking-[-0.4px]">
          Como as equipes criam, publicam e mantêm soluções no Hub.
        </h2>
        <p className="mt-2 text-sm text-accent-soft">
          Conteúdo de exemplo — substituir pela política oficial aprovada.
        </p>
      </div>

      <Card className="flex flex-col gap-6 p-0">
        <div
          role="tablist"
          aria-label="Políticas"
          className="flex flex-col border-b border-border-subtle sm:flex-row"
          onKeyDown={handleKeyDown}
        >
          {POLICY_TABS.map((tab) => (
            <button
              key={tab.id}
              id={`policy-tab-${tab.id}`}
              type="button"
              role="tab"
              aria-selected={tab.id === activeTab}
              aria-controls={`policy-panel-${tab.id}`}
              tabIndex={tab.id === activeTab ? 0 : -1}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex flex-1 items-center gap-3 border-b-2 px-5 py-4 text-left text-sm transition-colors",
                "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-inset",
                tab.id === activeTab
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              <span className="text-xs font-semibold text-primary">{tab.number}</span>
              {tab.label}
            </button>
          ))}
        </div>
        <div
          id={`policy-panel-${activeTab}`}
          role="tabpanel"
          aria-labelledby={`policy-tab-${activeTab}`}
          className="px-5 pb-6"
        >
          <Panel />
        </div>
      </Card>
    </div>
  );
}
