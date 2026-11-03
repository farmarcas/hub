import { Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/States";
import { useGroups } from "../hooks/useGroups";
import { GroupDetail } from "./GroupDetail";
import { GroupForm } from "./GroupForm";
import { GroupList } from "./GroupList";

export function GroupsView() {
  const state = useGroups();
  const [isCreating, setIsCreating] = useState(false);
  const { openGroup } = state;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-[26px] font-medium tracking-[-0.4px]">Grupos</h2>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Temas e diretorias viram nós do grafo. Somente administradores criam grupos e definem
            quem faz parte deles.
          </p>
        </div>
        <Button onClick={() => setIsCreating(true)}>
          <Plus size={16} aria-hidden="true" />
          Novo grupo
        </Button>
      </div>

      {state.isLoading && <LoadingState label="Carregando grupos…" />}
      {state.error && <ErrorState message={state.error} onRetry={() => void state.reload()} />}
      {state.actionError && !state.error && <ErrorState message={state.actionError} />}

      {isCreating && (
        <Card className="max-w-xl">
          <GroupForm
            idPrefix="new-group"
            submitLabel="Criar grupo"
            onCancel={() => setIsCreating(false)}
            onSubmit={async (payload) => {
              const failure = await state.createGroup(payload);
              if (!failure) setIsCreating(false);
              return failure;
            }}
          />
        </Card>
      )}

      {!state.isLoading && !state.error && (
        <div className="grid gap-6 lg:grid-cols-[minmax(260px,340px)_1fr]">
          <GroupList
            groups={state.groups}
            filter={state.filter}
            openGroupId={state.openGroupId}
            onFilterChange={state.setFilter}
            onOpen={state.setOpenGroupId}
          />
          {openGroup ? (
            <GroupDetail
              key={openGroup.id}
              group={openGroup}
              people={state.people}
              loadImpact={state.loadImpact}
              onUpdate={(payload) => state.updateGroup(openGroup.id, payload)}
              onDelete={() => state.deleteGroup(openGroup.id)}
              onAddMember={(userId) => state.addMember(openGroup.id, userId)}
              onRemoveMember={(userId) => state.removeMember(openGroup.id, userId)}
            />
          ) : (
            <EmptyState title="Nenhum grupo aberto.">Crie um grupo para começar.</EmptyState>
          )}
        </div>
      )}
    </div>
  );
}
