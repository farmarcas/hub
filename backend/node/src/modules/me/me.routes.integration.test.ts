import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import { app } from '../../app.js';
import { prisma } from '../../shared/database/prisma.js';
import { asUser, resetAndSeed, SEED } from '../../test/seed-database.js';

describe('identificação', () => {
  beforeAll(resetAndSeed);
  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('deve responder 401 sem cabeçalho de identificação', async () => {
    const response = await request(app).get('/api/v1/me');

    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe('UNAUTHENTICATED');
  });

  it('deve responder 401 com pessoa desconhecida', async () => {
    const response = await request(app)
      .get('/api/v1/me')
      .set(asUser('0199e800-0000-7000-8000-000000000999'));

    expect(response.status).toBe(401);
  });

  it('deve devolver a pessoa identificada', async () => {
    const response = await request(app).get('/api/v1/me').set(asUser(SEED.users.marina));

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      id: SEED.users.marina,
      name: 'Marina Freitas',
      email: 'marina.freitas@farmarcas.com.br',
      isAdmin: true,
    });
  });

  it('deve listar as 6 pessoas do "Entrar como" sem exigir identificação', async () => {
    const response = await request(app).get('/api/v1/identities');

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(6);
    expect(response.body.data[0]).toEqual(expect.objectContaining({ name: 'Camila Rocha' }));
  });
});
