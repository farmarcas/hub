import type { SolutionDetail, SolutionPayload, SolutionStatus } from "@/types/api";

export type SolutionFormValues = {
  name: string;
  url: string;
  objective: string;
  description: string;
  categoryId: string;
  status: SolutionStatus;
  groupIds: string[];
  relatedIds: string[];
  accessAll: boolean;
  accessGroupIds: string[];
  accessUserIds: string[];
};

export type SolutionFormErrors = Partial<Record<keyof SolutionFormValues | "access", string>>;

export const EMPTY_FORM: SolutionFormValues = {
  name: "",
  url: "https://",
  objective: "",
  description: "",
  categoryId: "",
  status: "Em avaliação",
  groupIds: [],
  relatedIds: [],
  accessAll: false,
  accessGroupIds: [],
  accessUserIds: [],
};

export const MESSAGES = {
  requiresGroup: "Sem tema ou diretoria, a solução ficaria solta no grafo.",
  requiresAccess: "Defina ao menos uma regra de acesso.",
  https: "O endereço precisa começar com https://",
} as const;

const HTTPS = /^https:\/\/\S+\.\S+/;

export function fromDetail(solution: SolutionDetail): SolutionFormValues {
  return {
    name: solution.name,
    url: solution.url,
    objective: solution.objective,
    description: solution.description,
    categoryId: solution.category.id,
    status: solution.status,
    groupIds: solution.groups.map(({ id }) => id),
    relatedIds: solution.related.map(({ id }) => id),
    accessAll: solution.access.all,
    accessGroupIds: solution.access.groups.map(({ id }) => id),
    accessUserIds: solution.access.users.map(({ id }) => id),
  };
}

export function toPayload(values: SolutionFormValues): SolutionPayload {
  return {
    name: values.name.trim(),
    url: values.url.trim(),
    objective: values.objective.trim(),
    description: values.description.trim(),
    categoryId: values.categoryId,
    status: values.status,
    groupIds: values.groupIds,
    relatedIds: values.relatedIds,
    access: {
      all: values.accessAll,
      groupIds: values.accessAll ? [] : values.accessGroupIds,
      userIds: values.accessAll ? [] : values.accessUserIds,
    },
  };
}

export const hasAccessRule = (values: SolutionFormValues) =>
  values.accessAll || values.accessGroupIds.length > 0 || values.accessUserIds.length > 0;

// Mesmas regras do servidor, para desabilitar "Salvar" antes de enviar.
export function validate(values: SolutionFormValues): SolutionFormErrors {
  const errors: SolutionFormErrors = {};
  if (!values.name.trim()) errors.name = "Informe o nome.";
  if (!HTTPS.test(values.url.trim())) errors.url = MESSAGES.https;
  if (!values.objective.trim()) errors.objective = "Conte por que a solução existe.";
  if (!values.description.trim()) errors.description = "Escreva uma descrição de uma linha.";
  if (!values.categoryId) errors.categoryId = "Escolha ou crie uma categoria.";
  if (values.groupIds.length === 0) errors.groupIds = MESSAGES.requiresGroup;
  if (!hasAccessRule(values)) errors.access = MESSAGES.requiresAccess;
  return errors;
}

export const toggleId = (ids: string[], id: string) =>
  ids.includes(id) ? ids.filter((current) => current !== id) : [...ids, id];
