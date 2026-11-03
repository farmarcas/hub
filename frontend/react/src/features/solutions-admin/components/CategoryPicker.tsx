import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { TextField } from "@/components/ui/TextField";
import { errorMessage } from "@/lib/api";
import type { Category } from "@/types/api";

type CategoryPickerProps = {
  categories: Category[];
  value: string;
  error?: string;
  onChange: (categoryId: string) => void;
  onCreate: (name: string) => Promise<Category>;
};

// Lista aberta: escolhe uma existente ou cria uma nova ali mesmo.
export function CategoryPicker({
  categories,
  value,
  error,
  onChange,
  onCreate,
}: CategoryPickerProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [name, setName] = useState("");
  const [createError, setCreateError] = useState<string | undefined>();
  const [isSaving, setIsSaving] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) {
      setCreateError("Informe o nome da categoria.");
      return;
    }
    setIsSaving(true);
    try {
      await onCreate(name);
      setIsCreating(false);
      setName("");
      setCreateError(undefined);
    } catch (cause) {
      setCreateError(errorMessage(cause));
    } finally {
      setIsSaving(false);
    }
  };

  if (isCreating) {
    return (
      <div className="flex items-end gap-2">
        <TextField
          id="new-category"
          label="Nova categoria"
          value={name}
          error={createError}
          autoFocus
          className="flex-1"
          onChange={(event) => setName(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              void handleCreate();
            }
          }}
        />
        <Button
          size="sm"
          className="mb-0.5 h-9"
          disabled={isSaving}
          onClick={() => void handleCreate()}
        >
          Criar
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="mb-0.5 h-9"
          onClick={() => setIsCreating(false)}
        >
          Cancelar
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-end gap-2">
      <Select
        id="category"
        label="Categoria"
        placeholder="Escolha uma categoria"
        options={categories.map(({ id, name: label }) => ({ value: id, label }))}
        value={value}
        error={error}
        className="flex-1"
        onChange={(event) => onChange(event.target.value)}
      />
      <Button
        variant="secondary"
        size="sm"
        className="mb-0.5 h-9"
        onClick={() => setIsCreating(true)}
      >
        + Nova
      </Button>
    </div>
  );
}
