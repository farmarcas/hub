import { describe, expect, it } from 'vitest';
import { buildGraph, type GraphSource } from './graph.service.js';

const source = (overrides: Partial<GraphSource> = {}): GraphSource => ({
  groups: [
    { id: 'g-1', type: 'theme', name: 'Comercial', description: null },
    { id: 'g-2', type: 'directorate', name: 'Dir. Comercial', description: 'Patrocina' },
  ],
  solutions: [
    {
      id: 's-1',
      name: 'Radar CRM',
      url: 'https://crm',
      objective: 'Objetivo',
      description: 'Descrição',
      category: 'Micro SaaS',
      groupIds: ['g-1', 'g-2'],
      relatedIds: ['s-2', 's-9'],
    },
    {
      id: 's-2',
      name: 'Órbita',
      url: 'https://orbita',
      objective: 'Objetivo',
      description: 'Descrição',
      category: 'Micro SaaS',
      groupIds: ['g-1'],
      relatedIds: [],
    },
  ],
  ...overrides,
});

describe('buildGraph', () => {
  it('deve contar só as soluções visíveis em cada grupo', () => {
    const graph = buildGraph(source());

    expect(graph.groups.map(({ id, solutionCount }) => [id, solutionCount])).toEqual([
      ['g-1', 2],
      ['g-2', 1],
    ]);
  });

  it('deve tornar a relação simétrica e descartar relacionadas invisíveis', () => {
    const graph = buildGraph(source());
    const related = Object.fromEntries(
      graph.solutions.map(({ id, relatedIds }) => [id, relatedIds]),
    );

    expect(related).toEqual({ 's-1': ['s-2'], 's-2': ['s-1'] });
  });

  it('deve usar os rótulos legíveis do tipo de grupo', () => {
    expect(buildGraph(source()).groups.map(({ type }) => type)).toEqual(['Tema', 'Diretoria']);
  });
});
