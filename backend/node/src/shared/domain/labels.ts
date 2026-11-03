// O banco guarda valores estáveis; a API fala os rótulos que as pessoas leem.
export const GROUP_TYPE_LABELS = { theme: 'Tema', directorate: 'Diretoria' } as const;
export const SOLUTION_STATUS_LABELS = {
  in_review: 'Em avaliação',
  published: 'Publicada',
} as const;

export type GroupTypeValue = keyof typeof GROUP_TYPE_LABELS;
export type GroupTypeLabel = (typeof GROUP_TYPE_LABELS)[GroupTypeValue];
export type SolutionStatusValue = keyof typeof SOLUTION_STATUS_LABELS;
export type SolutionStatusLabel = (typeof SOLUTION_STATUS_LABELS)[SolutionStatusValue];

export const groupTypeLabelValues = ['Tema', 'Diretoria'] as const;
export const solutionStatusLabelValues = ['Em avaliação', 'Publicada'] as const;

export const groupTypeFromLabel = (label: GroupTypeLabel): GroupTypeValue =>
  label === 'Tema' ? 'theme' : 'directorate';

export const solutionStatusFromLabel = (label: SolutionStatusLabel): SolutionStatusValue =>
  label === 'Publicada' ? 'published' : 'in_review';
