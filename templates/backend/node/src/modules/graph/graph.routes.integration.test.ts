import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import { app } from '../../app.js';
import { prisma } from '../../shared/database/prisma.js';
import { asUser, resetAndSeed, SEED } from '../../test/seed-database.js';

const { solutions: S, users: U } = SEED;

// Matriz de acesso esperada (specs/001-hub-inovacao/quickstart.md, SC-002).
const EXPECTED: Record<string, string[]> = {
  [U.marina]: [S.s1, S.s2, S.s5, S.s6, S.s7, S.s8, S.s9, S.s10, S.s11],
  [U.rafael]: [S.s3, S.s5, S.s7, S.s8, S.s9, S.s11],
  [U.juliana]: [S.s1, S.s2, S.s4, S.s5, S.s6, S.s8, S.s9, S.s10, S.s11],
  [U.diego]: [S.s1, S.s2, S.s5, S.s6, S.s8, S.s9, S.s10, S.s11],
  [U.camila]: [S.s3, S.s5, S.s7, S.s8, S.s11],
  [U.tiago]: [S.s5, S.s6, S.s7, S.s8, S.s11],
};

type GraphBody = {
  groups: { id: string; solutionCount: number }[];
  solutions: { id: string; groupIds: string[]; relatedIds: string[] }[];
};

const graphOf = async (userId: string) =>
  (await request(app).get('/api/v1/graph').set(asUser(userId))).body as GraphBody;

describe('GET /api/v1/graph', () => {
  beforeAll(resetAndSeed);
  afterAll(async () => {
    await prisma.$disconnect();
  });

  it.each(Object.entries(EXPECTED))(
    'pessoa %s vê exatamente as soluções liberadas',
    async (userId, ids) => {
      const graph = await graphOf(userId);

      expect(graph.solutions.map(({ id }) => id).sort()).toEqual([...ids].sort());
    },
  );

  it('nunca aponta relacionada invisível e mantém a relação simétrica', async () => {
    for (const userId of Object.keys(EXPECTED)) {
      const graph = await graphOf(userId);
      const visible = new Map(graph.solutions.map((solution) => [solution.id, solution]));

      for (const solution of graph.solutions) {
        for (const relatedId of solution.relatedIds) {
          expect(visible.has(relatedId)).toBe(true);
          expect(visible.get(relatedId)?.relatedIds).toContain(solution.id);
        }
      }
    }
  });

  it('conta em cada grupo só as soluções visíveis para a pessoa', async () => {
    const graph = await graphOf(U.camila);
    const counts = Object.fromEntries(
      graph.groups.map(({ id, solutionCount }) => [id, solutionCount]),
    );

    expect(graph.groups).toHaveLength(9);
    expect(counts[SEED.groups.comercial]).toBe(1);
    expect(counts[SEED.groups.dirAdmFinanceira]).toBe(2);
  });

  it('esconde solução arquivada ou em avaliação de todos', async () => {
    await prisma.solution.update({ where: { id: S.s8 }, data: { archivedAt: new Date() } });
    await prisma.solution.update({ where: { id: S.s11 }, data: { status: 'in_review' } });

    const ids = (await graphOf(U.marina)).solutions.map(({ id }) => id);

    expect(ids).not.toContain(S.s8);
    expect(ids).not.toContain(S.s11);
  });

  it('esconde de todos a solução excluída, mesmo a liberada para toda a empresa', async () => {
    const removed = await request(app).delete(`/api/v1/solutions/${S.s5}`).set(asUser(U.marina));

    expect(removed.status).toBe(204);
    for (const userId of Object.keys(EXPECTED)) {
      const ids = (await graphOf(userId)).solutions.map(({ id }) => id);
      expect(ids).not.toContain(S.s5);
    }

    // A relacionada (Cosmos) continua no globo de quem já a via, sem a ligação.
    const cosmos = (await graphOf(U.marina)).solutions.find(({ id }) => id === S.s7);
    expect(cosmos).toBeDefined();
    expect(cosmos?.relatedIds).not.toContain(S.s5);
  });
});
