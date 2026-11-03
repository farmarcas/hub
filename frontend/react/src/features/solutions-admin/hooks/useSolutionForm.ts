import { useCallback, useEffect, useMemo, useState } from "react";
import { ApiError, api, errorMessage } from "@/lib/api";
import type { Category, GroupSummary, Identity, NamedRef, Page, SolutionDetail } from "@/types/api";
import {
  EMPTY_FORM,
  fromDetail,
  MESSAGES,
  toggleId,
  toPayload,
  validate,
  type SolutionFormErrors,
  type SolutionFormValues,
} from "../lib/solutionForm";

const PAGE_SIZE = 100;

export type FormOptions = {
  categories: Category[];
  themes: NamedRef[];
  directorates: NamedRef[];
  groups: NamedRef[];
  people: Identity[];
  solutions: NamedRef[];
};

const EMPTY_OPTIONS: FormOptions = {
  categories: [],
  themes: [],
  directorates: [],
  groups: [],
  people: [],
  solutions: [],
};

const SERVER_FIELD_ERRORS: Record<string, keyof SolutionFormErrors> = {
  SOLUTION_REQUIRES_GROUP: "groupIds",
  SOLUTION_REQUIRES_ACCESS: "access",
  SOLUTION_SELF_RELATION: "relatedIds",
};

async function loadOptions(editingId?: string): Promise<FormOptions> {
  const [categories, groups, people, solutions] = await Promise.all([
    api.get<{ data: Category[] }>("/categories"),
    api.get<Page<GroupSummary>>(`/groups?pageSize=${PAGE_SIZE}`),
    api.get<Page<Identity>>(`/users?pageSize=${PAGE_SIZE}`),
    api.get<Page<SolutionDetail>>(`/solutions?pageSize=${PAGE_SIZE}&archived=false`),
  ]);
  const ref = ({ id, name }: NamedRef) => ({ id, name });
  return {
    categories: categories.data,
    themes: groups.data.filter(({ type }) => type === "Tema").map(ref),
    directorates: groups.data.filter(({ type }) => type === "Diretoria").map(ref),
    groups: groups.data.map(ref),
    people: people.data,
    solutions: solutions.data.filter(({ id }) => id !== editingId).map(ref),
  };
}

export function useSolutionForm(editingId: string | undefined, onSaved: () => void) {
  const [values, setValues] = useState<SolutionFormValues>(EMPTY_FORM);
  const [options, setOptions] = useState<FormOptions>(EMPTY_OPTIONS);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [serverErrors, setServerErrors] = useState<SolutionFormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [touched, setTouched] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let isCurrent = true;
    Promise.all([
      loadOptions(editingId),
      editingId ? api.get<SolutionDetail>(`/solutions/${editingId}`) : Promise.resolve(null),
    ])
      .then(([loadedOptions, solution]) => {
        if (!isCurrent) return;
        setOptions(loadedOptions);
        if (solution) setValues(fromDetail(solution));
        setLoadError(null);
      })
      .catch((cause: unknown) => {
        if (isCurrent) setLoadError(errorMessage(cause));
      })
      .finally(() => {
        if (isCurrent) setIsLoading(false);
      });
    return () => {
      isCurrent = false;
    };
  }, [editingId, attempt]);

  const errors = useMemo(() => ({ ...validate(values), ...serverErrors }), [values, serverErrors]);
  const canSave = Object.keys(validate(values)).length === 0 && !isSaving;

  const update = useCallback(
    <K extends keyof SolutionFormValues>(field: K, value: SolutionFormValues[K]) => {
      setTouched(true);
      setServerErrors({});
      setValues((current) => ({ ...current, [field]: value }));
    },
    [],
  );

  type ListField = "groupIds" | "relatedIds" | "accessGroupIds" | "accessUserIds";

  // Liga/desliga um item da lista a partir do valor mais recente (cliques rápidos não se perdem).
  const toggle = useCallback((field: ListField, id: string) => {
    setTouched(true);
    setServerErrors({});
    setValues((current) => ({ ...current, [field]: toggleId(current[field], id) }));
  }, []);

  const createCategory = useCallback(async (name: string) => {
    const category = await api.post<Category>("/categories", { name });
    setOptions((current) => ({
      ...current,
      categories: current.categories.some(({ id }) => id === category.id)
        ? current.categories
        : [...current.categories, category].sort((a, b) => a.name.localeCompare(b.name, "pt-BR")),
    }));
    setValues((current) => ({ ...current, categoryId: category.id }));
    return category;
  }, []);

  const submit = useCallback(async () => {
    setTouched(true);
    if (Object.keys(validate(values)).length > 0) return;
    setIsSaving(true);
    setSubmitError(null);
    try {
      const payload = toPayload(values);
      if (editingId) await api.put(`/solutions/${editingId}`, payload);
      else await api.post("/solutions", payload);
      onSaved();
    } catch (cause) {
      const field = cause instanceof ApiError ? SERVER_FIELD_ERRORS[cause.code] : undefined;
      if (field) setServerErrors({ [field]: cause instanceof Error ? cause.message : "" });
      else if (cause instanceof ApiError && cause.code === "VALIDATION_ERROR")
        setSubmitError(
          `${cause.message}. Confira os campos (ex.: ${MESSAGES.https.toLowerCase()}).`,
        );
      else setSubmitError(errorMessage(cause));
    } finally {
      setIsSaving(false);
    }
  }, [editingId, onSaved, values]);

  return {
    values,
    options,
    errors,
    showErrors: touched || Boolean(editingId),
    isLoading,
    loadError,
    submitError,
    isSaving,
    canSave,
    update,
    toggle,
    createCategory,
    submit,
    retry: () => {
      setIsLoading(true);
      setAttempt((value) => value + 1);
    },
  };
}
