import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { app } from '../../app.js';
import { prisma } from '../../shared/database/prisma.js';
import { asUser, resetAndSeed, SEED } from '../../test/seed-database.js';

const admin = asUser(SEED.users.marina);
const { groups: G, users: U, solutions: S } = SEED;

describe('/api/v1/groups', () => {
  beforeEach(resetAndSeed);
  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('deve filtrar por tipo com contagem de soluções e pessoas', async () => {
    const response = await request(app).get('/api/v1/groups?type=Diretoria').set(admin);

    expect(response.status).toBe(200);
    expect(response.body.meta.total).toBe(3);
    expect(response.body.data[0]).toMatchObject({
      name: 'Dir. Adm. Financeira',
      type: 'Diretoria',
      solutionCount: 2,
      memberCount: 2,
    });
  });

  it('deve criar grupo e recusar nome repetido', async () => {
    const created = await request(app)
      .post('/api/v1/groups')
      .set(admin)
      .send({ type: 'Tema', name: 'Inovação', description: 'Novos negócios.' });
    const duplicated = await request(app)
      .post('/api/v1/groups')
      .set(admin)
      .send({ type: 'Diretoria', name: ' inovação ' });

    expect(created.status).toBe(201);
    expect(duplicated.status).toBe(409);
    expect(duplicated.body.error.code).toBe('GROUP_NAME_TAKEN');
  });

  it('deve recusar nome vazio', async () => {
    const response = await request(app)
      .put(`/api/v1/groups/${G.marketing}`)
      .set(admin)
      .send({ type: 'Tema', name: '   ' });

    expect(response.status).toBe(400);
  });

  it('deve adicionar e remover membro', async () => {
    const added = await request(app)
      .post(`/api/v1/groups/${G.marketing}/members`)
      .set(admin)
      .send({ userId: U.diego });
    const again = await request(app)
      .post(`/api/v1/groups/${G.marketing}/members`)
      .set(admin)
      .send({ userId: U.diego });
    const removed = await request(app)
      .delete(`/api/v1/groups/${G.marketing}/members/${U.diego}`)
      .set(admin);

    expect(added.status).toBe(201);
    expect(again.status).toBe(409);
    expect(removed.status).toBe(204);
  });

  it('deve mostrar o impacto antes de excluir a Dir. Comercial', async () => {
    const response = await request(app)
      .get(`/api/v1/groups/${G.dirComercial}/deletion-impact`)
      .set(admin);
    const names = (items: { name: string }[]) => items.map(({ name }) => name);

    expect(response.status).toBe(200);
    expect(response.body.members).toHaveLength(3);
    expect(response.body.solutions).toHaveLength(7);
    expect(names(response.body.orphanedByGroup)).toEqual([]);
    expect(names(response.body.orphanedByAccess)).toEqual([
      'Painel de Indicadores Comerciais',
      'Radar CRM',
      'Radar Pricing',
    ]);
  });

  it('deve excluir e tirar o grupo das soluções, do acesso e dos membros', async () => {
    const removed = await request(app).delete(`/api/v1/groups/${G.dirComercial}`).set(admin);
    const list = await request(app).get('/api/v1/groups?pageSize=100').set(admin);
    const crm = await request(app).get(`/api/v1/solutions/${S.s2}`).set(admin);
    const diegoGraph = await request(app).get('/api/v1/graph').set(asUser(U.diego));

    expect(removed.status).toBe(204);
    expect(list.body.data.map(({ id }: { id: string }) => id)).not.toContain(G.dirComercial);
    expect(crm.body.groups.map(({ id }: { id: string }) => id)).not.toContain(G.dirComercial);
    expect(crm.body.access.groups).toEqual([]);
    // Diego só era da Dir. Comercial: sobra o que é para toda a empresa.
    expect(diegoGraph.body.solutions.map(({ id }: { id: string }) => id).sort()).toEqual(
      [S.s5, S.s8, S.s11].sort(),
    );
  });

  it('deve responder 403 para quem não é admin', async () => {
    const response = await request(app).get('/api/v1/groups').set(asUser(U.camila));

    expect(response.status).toBe(403);
  });

  it('deve tirar a solução excluída das conectadas e do impacto, sem mexer no grupo', async () => {
    await request(app).delete(`/api/v1/solutions/${S.s2}`).set(admin);

    const list = await request(app).get('/api/v1/groups?type=Diretoria').set(admin);
    const impact = await request(app)
      .get(`/api/v1/groups/${G.dirComercial}/deletion-impact`)
      .set(admin);
    const dirComercial = list.body.data.find(({ id }: { id: string }) => id === G.dirComercial);
    const names = (items: { name: string }[]) => items.map(({ name }) => name);

    expect(dirComercial.solutionCount).toBe(6);
    expect(dirComercial.memberCount).toBe(3);
    expect(names(dirComercial.solutions)).not.toContain('Radar CRM');
    expect(names(impact.body.solutions)).not.toContain('Radar CRM');
  });
});
