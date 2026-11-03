import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import { app } from '../../app.js';
import { prisma } from '../../shared/database/prisma.js';
import { asUser, resetAndSeed, SEED } from '../../test/seed-database.js';

const admin = asUser(SEED.users.marina);

describe('/api/v1/users', () => {
  beforeAll(resetAndSeed);
  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('deve listar pessoas com grupos e quantas soluções acessam', async () => {
    const response = await request(app).get('/api/v1/users').set(admin);
    const byName = Object.fromEntries(
      response.body.data.map((user: { name: string; accessibleSolutionCount: number }) => [
        user.name,
        user.accessibleSolutionCount,
      ]),
    );

    expect(response.status).toBe(200);
    expect(response.body.meta.total).toBe(6);
    expect(byName).toEqual({
      'Camila Rocha': 5,
      'Diego Almeida': 8,
      'Juliana Sato': 9,
      'Marina Freitas': 9,
      'Rafael Prado': 6,
      'Tiago Menezes': 5,
    });
  });

  it('não deve permitir criar, editar nem remover pessoas', async () => {
    const created = await request(app)
      .post('/api/v1/users')
      .set(admin)
      .send({ name: 'Nova', email: 'nova@farmarcas.com.br' });
    const removed = await request(app).delete(`/api/v1/users/${SEED.users.diego}`).set(admin);

    expect(created.status).toBe(404);
    expect(removed.status).toBe(404);
  });

  it('deve responder 403 para quem não é admin', async () => {
    const response = await request(app).get('/api/v1/users').set(asUser(SEED.users.diego));

    expect(response.status).toBe(403);
  });

  it('deve deixar de contar a solução excluída em "Acessa"', async () => {
    // Sonar (s8) é para toda a empresa: excluir tira 1 da conta de todo mundo.
    await request(app).delete(`/api/v1/solutions/${SEED.solutions.s8}`).set(admin);
    const response = await request(app).get('/api/v1/users').set(admin);
    const camila = response.body.data.find(({ name }: { name: string }) => name === 'Camila Rocha');

    expect(camila.accessibleSolutionCount).toBe(4);
  });
});
