import { countLabel, peopleCountLabel } from "@/lib/plural";
import type { SolutionDetail } from "@/types/api";

// Resumo da coluna ACESSO: "Toda a empresa", "2 grupos", "1 pessoa", combináveis com "+".
export function accessSummary(access: SolutionDetail["access"]): string {
  if (access.all) return "Toda a empresa";
  const parts = [
    access.groups.length > 0 && countLabel(access.groups.length, "grupo", "grupos"),
    access.users.length > 0 && peopleCountLabel(access.users.length),
  ].filter(Boolean);
  return parts.length > 0 ? parts.join(" + ") : "Sem regra de acesso";
}
