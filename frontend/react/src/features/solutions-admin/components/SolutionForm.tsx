import { ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { Card, Eyebrow } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { ErrorState, LoadingState } from "@/components/ui/States";
import { TextArea, TextField } from "@/components/ui/TextField";
import { Toggle } from "@/components/ui/Toggle";
import { cn } from "@/lib/cn";
import { ROUTES } from "@/lib/routes";
import type { SolutionStatus } from "@/types/api";
import { useSolutionForm } from "../hooks/useSolutionForm";
import { CategoryPicker } from "./CategoryPicker";
import { ChipGroup } from "./ChipGroup";

const STATUS_OPTIONS: { value: SolutionStatus; label: string }[] = [
  { value: "Em avaliação", label: "Em avaliação" },
  { value: "Publicada", label: "Publicada" },
];

type SolutionFormProps = { solutionId?: string };

export function SolutionForm({ solutionId }: SolutionFormProps) {
  const navigate = useNavigate();
  const form = useSolutionForm(solutionId, () => navigate(ROUTES.solutions));
  const { values, options, update } = form;
  const errors = form.showErrors ? form.errors : {};

  if (form.isLoading) return <LoadingState label="Carregando formulário…" />;
  if (form.loadError) return <ErrorState message={form.loadError} onRetry={form.retry} />;

  const connectedNames = [
    ...options.groups.filter(({ id }) => values.groupIds.includes(id)),
    ...options.solutions.filter(({ id }) => values.relatedIds.includes(id)),
  ].map(({ name }) => name);

  return (
    <form
      noValidate
      className="flex max-w-3xl flex-col gap-5"
      onSubmit={(event) => {
        event.preventDefault();
        void form.submit();
      }}
    >
      <Link
        to={ROUTES.solutions}
        className="inline-flex w-fit items-center gap-2 text-sm text-muted-foreground hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      >
        <ArrowLeft size={16} aria-hidden="true" />
        Voltar para soluções
      </Link>

      <Card className="flex flex-col gap-4">
        <Eyebrow>Solução</Eyebrow>
        <TextField
          id="name"
          label="Nome"
          value={values.name}
          maxLength={120}
          error={errors.name}
          onChange={(event) => update("name", event.target.value)}
        />
        <TextField
          id="url"
          label="URL"
          type="url"
          inputMode="url"
          value={values.url}
          hint="Abre em nova aba. Sempre https://"
          error={errors.url}
          onChange={(event) => update("url", event.target.value)}
        />
        <TextArea
          id="objective"
          label="Objetivo"
          hint="Por que a solução existe."
          value={values.objective}
          error={errors.objective}
          onChange={(event) => update("objective", event.target.value)}
        />
        <TextField
          id="description"
          label="Descrição curta"
          hint="Uma linha, até 160 caracteres."
          maxLength={160}
          value={values.description}
          error={errors.description}
          onChange={(event) => update("description", event.target.value.replace(/[\r\n]/g, " "))}
        />
        <div className="grid gap-4 md:grid-cols-2">
          <CategoryPicker
            categories={options.categories}
            value={values.categoryId}
            error={errors.categoryId}
            onChange={(categoryId) => update("categoryId", categoryId)}
            onCreate={form.createCategory}
          />
          <Select
            id="status"
            label="Status"
            options={STATUS_OPTIONS}
            value={values.status}
            onChange={(event) => update("status", event.target.value as SolutionStatus)}
          />
        </div>
      </Card>

      <Card className="flex flex-col gap-4" hasError={Boolean(errors.access)}>
        <Eyebrow>Quem acessa *</Eyebrow>
        <Toggle
          id="access-all"
          label="Toda a empresa"
          description="Qualquer colaborador vê e abre a solução."
          isChecked={values.accessAll}
          onChange={(isChecked) => update("accessAll", isChecked)}
        />
        <div
          className={cn("flex flex-col gap-4 transition-opacity", values.accessAll && "opacity-40")}
        >
          <ChipGroup
            label="Grupos"
            items={options.groups}
            selectedIds={values.accessGroupIds}
            isDisabled={values.accessAll}
            onToggle={(id) => form.toggle("accessGroupIds", id)}
          />
          <ChipGroup
            label="Pessoas específicas (usuários do Radar)"
            items={options.people}
            selectedIds={values.accessUserIds}
            isDisabled={values.accessAll}
            onToggle={(id) => form.toggle("accessUserIds", id)}
          />
        </div>
        {errors.access && (
          <p role="alert" className="text-xs text-destructive">
            {errors.access}
          </p>
        )}
      </Card>

      <Card className="flex flex-col gap-4" hasError={Boolean(errors.groupIds)}>
        <div>
          <Eyebrow>Relações no grafo *</Eyebrow>
          <p className="mt-1 text-sm text-muted-foreground">
            Define onde a solução aparece no grafo e com quem ela se conecta. Escolha ao menos um
            tema ou diretoria.
          </p>
        </div>
        <ChipGroup
          label="Temas"
          items={options.themes}
          selectedIds={values.groupIds}
          onToggle={(id) => form.toggle("groupIds", id)}
        />
        <ChipGroup
          label="Diretorias"
          items={options.directorates}
          selectedIds={values.groupIds}
          onToggle={(id) => form.toggle("groupIds", id)}
        />
        <ChipGroup
          label="Soluções relacionadas (opcional)"
          items={options.solutions}
          selectedIds={values.relatedIds}
          onToggle={(id) => form.toggle("relatedIds", id)}
        />
        {errors.relatedIds && <p className="text-xs text-destructive">{errors.relatedIds}</p>}
        <p className="rounded-md border border-border-subtle bg-background/60 px-3 py-2 text-xs text-soft-foreground">
          <span className="font-semibold tracking-[0.14em] text-primary">NO GRAFO: </span>
          {connectedNames.length > 0
            ? `${values.name.trim() || "Esta solução"} conecta a ${connectedNames.join(", ")}`
            : "ainda sem conexões"}
        </p>
        {errors.groupIds && (
          <p role="alert" className="text-xs text-destructive">
            {errors.groupIds}
          </p>
        )}
      </Card>

      {form.submitError && <ErrorState message={form.submitError} />}

      <div className="flex gap-3">
        <Button type="submit" disabled={!form.canSave}>
          {form.isSaving ? "Salvando…" : "Salvar solução"}
        </Button>
        <Button variant="secondary" onClick={() => navigate(ROUTES.solutions)}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
