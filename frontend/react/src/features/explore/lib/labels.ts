export type LabelBox = { x0: number; x1: number; y0: number; y1: number };
export type LabelCandidate<T> = { item: T; box: LabelBox; priority: number };

const overlaps = (a: LabelBox, b: LabelBox) =>
  a.x0 < b.x1 && a.x1 > b.x0 && a.y0 < b.y1 && a.y1 > b.y0;

// Anticolisão: maior prioridade primeiro (foco > hover > grupos > soluções > profundidade);
// o rótulo que colide com um já colocado some.
export function placeLabels<T>(candidates: LabelCandidate<T>[]): LabelCandidate<T>[] {
  const placed: LabelCandidate<T>[] = [];
  for (const candidate of [...candidates].sort((a, b) => b.priority - a.priority)) {
    if (placed.some(({ box }) => overlaps(box, candidate.box))) continue;
    placed.push(candidate);
  }
  return placed;
}

export function labelPriority({
  isFocus,
  isHot,
  isGroup,
  depth,
}: {
  isFocus: boolean;
  isHot: boolean;
  isGroup: boolean;
  depth: number;
}): number {
  return (isFocus ? 4 : isHot ? 3 : 0) + (isGroup ? 1.5 : 0) + depth;
}
