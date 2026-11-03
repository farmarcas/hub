// "1 solução", "2 soluções", "0 pessoas": singular só quando é exatamente 1.
export function countLabel(count: number, singular: string, plural: string): string {
  return `${count} ${count === 1 ? singular : plural}`;
}

export const solutionCountLabel = (count: number) => countLabel(count, "solução", "soluções");
export const peopleCountLabel = (count: number) => countLabel(count, "pessoa", "pessoas");
