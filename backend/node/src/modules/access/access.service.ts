import type { SolutionStatusValue } from '../../shared/domain/labels.js';

// Pessoa identificada na requisição. No MVP vem do "Entrar como"; depois, do Radar.
export type Viewer = {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  groupIds: string[];
};

export type AccessRule = {
  status: SolutionStatusValue;
  archived: boolean;
  accessAll: boolean;
  accessGroupIds: string[];
  accessUserIds: string[];
};

// Regra única de "quem vê o quê" (FR-015). Ser admin não amplia o que se vê no globo.
export const canView = (rule: AccessRule, viewer: Pick<Viewer, 'id' | 'groupIds'>): boolean => {
  if (rule.status !== 'published' || rule.archived) return false;
  if (rule.accessAll) return true;
  if (rule.accessUserIds.includes(viewer.id)) return true;
  return rule.accessGroupIds.some((groupId) => viewer.groupIds.includes(groupId));
};
