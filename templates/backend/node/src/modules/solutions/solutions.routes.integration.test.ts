import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { app } from '../../app.js';
import { prisma } from '../../shared/database/prisma.js';
import { asUser, resetAndSeed, SEED } from '../../test/seed-database.js';

const admin = asUser(SEED.users.marina);

const body = (overrides: Record<string, unknown> = {}) => ({
  name: 'Radar Automação',
  url: 'https://automacao.farmarcas.internal',
  objective: 'Automatizar tarefas repetitivas.',
  description: 'Robôs para rotinas internas.',
  categoryId: SEED.categories.microSaas,
  status: 'Publicada',
  groupIds: [SEED.groups.operacao],
  relatedIds: [SEED.solutions.s8],
  access: { all: false, groupIds: [SEED.groups.dirTecnologia], userIds: [] },
  ...overrides,
});

describe('/api/v1/solutions', () => {
  beforeEach(resetAndSeed);
  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('deve criar solução completa e devolver os rótulos legíveis', async () => {
    const response = await request(app).post('/api/v1/solutions').set(admin).send(body());

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      name: 'Radar Automação',
      status: 'Publicada',
      archived: false,
      groups: [{ id: SEED.groups.operacao, type: 'Tema', name: 'Operação' }],
      related: [{ id: SEED.solutions.s8, name: 'Sonar' }],
      access: { all: false, groups: [{ name: 'Dir. Tecnologia' }], users: [] },
    });
  });

  it('deve recusar endereço sem https', async () => {
    const response = await request(app)
      .post('/api/v1/solutions')
      .set(admin)
      .send(body({ url: 'http://automacao.farmarcas.internal' }));

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('deve recusar sem tema ou diretoria', async () => {
    const response = await request(app)
      .post('/api/v1/solutions')
      .set(admin)
      .send(body({ groupIds: [] }));

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('SOLUTION_REQUIRES_GROUP');
  });

  it('deve recusar sem regra de acesso', async () => {
    const response = await request(app)
      .post('/api/v1/solutions')
      .set(admin)
      .send(body({ access: { all: false, groupIds: [], userIds: [] } }));

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('SOLUTION_REQUIRES_ACCESS');
  });

  it('deve responder 403 para quem não é admin', async () => {
    const response = await request(app).get('/api/v1/solutions').set(asUser(SEED.users.rafael));

    expect(response.status).toBe(403);
    expect(response.body.error.code).toBe('FORBIDDEN');
  });

  it('deve listar paginado com contagem por situação', async () => {
    const response = await request(app).get('/api/v1/solutions?page=1&pageSize=5').set(admin);

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(5);
    expect(response.body.meta).toEqual({
      page: 1,
      pageSize: 5,
      total: 11,
      counts: { published: 11, inReview: 0, archived: 0 },
    });
  });

  it('deve editar e mostrar a relação nos dois sentidos', async () => {
    const response = await request(app)
      .put(`/api/v1/solutions/${SEED.solutions.s8}`)
      .set(admin)
      .send(body({ name: 'Sonar', relatedIds: [SEED.solutions.s2] }));
    const crm = await request(app).get(`/api/v1/solutions/${SEED.solutions.s2}`).set(admin);

    expect(response.status).toBe(200);
    expect(response.body.related.map(({ name }: { name: string }) => name)).toEqual(['Radar CRM']);
    expect(crm.body.related.map(({ name }: { name: string }) => name)).toContain('Sonar');
  });

  it('deve responder 404 ao editar solução inexistente', async () => {
    const response = await request(app)
      .put('/api/v1/solutions/0199e800-0000-7000-8000-000000000999')
      .set(admin)
      .send(body());

    expect(response.status).toBe(404);
    expect(response.body.error.code).toBe('SOLUTION_NOT_FOUND');
  });

  it('deve arquivar e restaurar', async () => {
    const archived = await request(app)
      .post(`/api/v1/solutions/${SEED.solutions.s8}/archive`)
      .set(admin);
    const list = await request(app).get('/api/v1/solutions').set(admin);
    const restored = await request(app)
      .post(`/api/v1/solutions/${SEED.solutions.s8}/restore`)
      .set(admin);

    expect(archived.body.archived).toBe(true);
    expect(list.body.meta.counts).toEqual({ published: 10, inReview: 0, archived: 1 });
    expect(restored.body.archived).toBe(false);
  });

  it('deve criar categoria nova e reaproveitar a existente', async () => {
    const created = await request(app)
      .post('/api/v1/categories')
      .set(admin)
      .send({ name: 'Automação' });
    const again = await request(app)
      .post('/api/v1/categories')
      .set(admin)
      .send({ name: '  micro saas ' });

    expect(created.status).toBe(201);
    expect(again.status).toBe(200);
    expect(again.body).toEqual({ id: SEED.categories.microSaas, name: 'Micro SaaS' });
  });

  describe('DELETE /:id', () => {
    const { s2, s4, s10 } = SEED.solutions;
    const relatedNames = (body: { related: { name: string }[] }) =>
      body.related.map(({ name }) => name);

    it('deve excluir só a solução escolhida e manter as relacionadas intactas', async () => {
      const before = await Promise.all(
        [s4, s10].map((id) => request(app).get(`/api/v1/solutions/${id}`).set(admin)),
      );

      const removed = await request(app).delete(`/api/v1/solutions/${s2}`).set(admin);
      const list = await request(app).get('/api/v1/solutions').set(admin);
      const after = await Promise.all(
        [s4, s10].map((id) => request(app).get(`/api/v1/solutions/${id}`).set(admin)),
      );

      expect(removed.status).toBe(204);
      expect(list.body.meta.total).toBe(10);
      for (const [index, response] of after.entries()) {
        const previous = before[index]?.body;
        expect(response.status).toBe(200);
        // Tudo igual na relacionada, menos a ligação com a excluída.
        expect({ ...response.body, related: undefined }).toEqual({
          ...previous,
          related: undefined,
        });
        expect(relatedNames(previous)).toContain('Radar CRM');
        expect(relatedNames(response.body)).not.toContain('Radar CRM');
      }
    });

    it('deve tratar a solução excluída como inexistente', async () => {
      await request(app).delete(`/api/v1/solutions/${s2}`).set(admin);

      const responses = await Promise.all([
        request(app).get(`/api/v1/solutions/${s2}`).set(admin),
        request(app).put(`/api/v1/solutions/${s2}`).set(admin).send(body()),
        request(app).post(`/api/v1/solutions/${s2}/archive`).set(admin),
        request(app).delete(`/api/v1/solutions/${s2}`).set(admin),
      ]);

      for (const response of responses) {
        expect(response.status).toBe(404);
        expect(response.body.error.code).toBe('SOLUTION_NOT_FOUND');
      }
    });

    it('não deve aceitar relacionar com uma solução excluída', async () => {
      await request(app).delete(`/api/v1/solutions/${s2}`).set(admin);

      const response = await request(app)
        .post('/api/v1/solutions')
        .set(admin)
        .send(body({ relatedIds: [s2] }));

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('REFERENCE_NOT_FOUND');
    });

    it('deve responder 403 para quem não é admin', async () => {
      const response = await request(app)
        .delete(`/api/v1/solutions/${s2}`)
        .set(asUser(SEED.users.diego));

      expect(response.status).toBe(403);
    });
  });
});
