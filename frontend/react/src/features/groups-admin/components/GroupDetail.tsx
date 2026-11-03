import { useState } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Card, Eyebrow } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { Select } from "@/components/ui/Select";
import type { DeletionImpact, GroupPayload, GroupSummary, Identity } from "@/types/api";
import { DeleteGroupDialog } from "./DeleteGroupDialog";
import { GroupForm } from "./GroupForm";
import { GroupTypeIcon } from "./GroupTypeIcon";

type GroupDetailProps = {
  group: GroupSummary;
  people: Identity[];
  onUpdate: (payload: GroupPayload) => Promise<string | null>;
  onDelete: () => Promise<string | null>;
  loadImpact: (id: string) => Promise<DeletionImpact>;
  onAddMember: (userId: string) => Promise<string | null>;
  onRemoveMember: (userId: string) => Promise<string | null>;
};

export function GroupDetail({
  group,
  people,
  onUpdate,
  onDelete,
  loadImpact,
  onAddMember,
  onRemoveMember,
}: GroupDetailProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [newMemberId, setNewMemberId] = useState("");

  const memberIds = new Set(group.members.map(({ id }) => id));
  const candidates = people.filter(({ id }) => !memberIds.has(id));

  return (
    <Card className="flex flex-col gap-6">
      {isEditing ? (
        <GroupForm
          idPrefix="edit-group"
          initial={{ type: group.type, name: group.name, description: group.description }}
          submitLabel="Salvar"
          onCancel={() => setIsEditing(false)}
          onSubmit={async (payload) => {
            const failure = await onUpdate(payload);
            if (!failure) setIsEditing(false);
            return failure;
          }}
        />
      ) : (
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="flex items-center gap-2 text-xs text-subtle-foreground">
              <GroupTypeIcon type={group.type} />
              {group.type}
            </p>
            <h2 className="mt-1 text-xl font-medium">{group.name}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {group.description || "Sem descrição."}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={() => setIsEditing(true)}>
              Editar
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setIsDeleting(true)}>
              Excluir
            </Button>
          </div>
        </div>
      )}

      <section className="flex flex-col gap-2">
        <Eyebrow>Soluções conectadas</Eyebrow>
        {group.solutions.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhuma solução ligada a este grupo.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {group.solutions.map((solution) => (
              <Chip key={solution.id}>{solution.name}</Chip>
            ))}
          </div>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <Eyebrow>Pessoas no grupo</Eyebrow>
        {group.members.length === 0 ? (
          <p className="text-sm text-muted-foreground">Ninguém neste grupo ainda.</p>
        ) : (
          <ul className="flex flex-col gap-1.5">
            {group.members.map((member) => (
              <li
                key={member.id}
                className="flex items-center gap-3 rounded-md border border-border-subtle px-3 py-2"
              >
                <Avatar name={member.name} size="sm" />
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-sm">{member.name}</span>
                  <span className="truncate text-xs text-subtle-foreground">{member.email}</span>
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  aria-label={`Remover ${member.name} do grupo`}
                  onClick={() => void onRemoveMember(member.id)}
                >
                  Remover
                </Button>
              </li>
            ))}
          </ul>
        )}
        <form
          className="flex items-end gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            if (!newMemberId) return;
            void onAddMember(newMemberId).then((failure) => {
              if (!failure) setNewMemberId("");
            });
          }}
        >
          <Select
            id="add-member"
            label="Adicionar pessoa (usuários do Radar)"
            placeholder={candidates.length ? "Escolha uma pessoa" : "Todos já fazem parte"}
            options={candidates.map(({ id, name }) => ({ value: id, label: name }))}
            value={newMemberId}
            className="flex-1"
            onChange={(event) => setNewMemberId(event.target.value)}
          />
          <Button type="submit" size="sm" className="mb-0.5 h-9" disabled={!newMemberId}>
            Adicionar
          </Button>
        </form>
      </section>

      {isDeleting && (
        <DeleteGroupDialog
          group={group}
          isOpen
          loadImpact={loadImpact}
          onConfirm={onDelete}
          onClose={() => setIsDeleting(false)}
        />
      )}
    </Card>
  );
}
