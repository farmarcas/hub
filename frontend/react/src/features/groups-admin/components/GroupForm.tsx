import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { TextArea, TextField } from "@/components/ui/TextField";
import type { GroupPayload, GroupType } from "@/types/api";

const TYPE_OPTIONS = [
  { value: "Tema", label: "Tema" },
  { value: "Diretoria", label: "Diretoria" },
];

type GroupFormProps = {
  idPrefix: string;
  initial?: GroupPayload;
  submitLabel: string;
  onSubmit: (payload: GroupPayload) => Promise<string | null>;
  onCancel: () => void;
};

export function GroupForm({ idPrefix, initial, submitLabel, onSubmit, onCancel }: GroupFormProps) {
  const [type, setType] = useState<GroupType>(initial?.type ?? "Tema");
  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [error, setError] = useState<string | undefined>();
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError("Informe o nome do grupo.");
      return;
    }
    setIsSaving(true);
    const failure = await onSubmit({
      type,
      name: name.trim(),
      description: description.trim() || null,
    });
    setIsSaving(false);
    if (failure) setError(failure);
  };

  return (
    <form
      noValidate
      className="flex flex-col gap-3"
      onSubmit={(event) => {
        event.preventDefault();
        void handleSubmit();
      }}
    >
      <TextField
        id={`${idPrefix}-name`}
        label="Nome"
        value={name}
        maxLength={80}
        error={error}
        autoFocus
        onChange={(event) => {
          setName(event.target.value);
          setError(undefined);
        }}
      />
      <Select
        id={`${idPrefix}-type`}
        label="Tipo"
        options={TYPE_OPTIONS}
        value={type}
        onChange={(event) => setType(event.target.value as GroupType)}
      />
      <TextArea
        id={`${idPrefix}-description`}
        label="Descrição (opcional)"
        value={description}
        onChange={(event) => setDescription(event.target.value)}
      />
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={isSaving}>
          {isSaving ? "Salvando…" : submitLabel}
        </Button>
        <Button variant="ghost" size="sm" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
