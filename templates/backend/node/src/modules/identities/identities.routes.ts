import { Router } from 'express';
import { identitiesRepository, type IdentitiesRepository } from './identities.repository.js';

// Lista para o "Entrar como" (identificação simulada até a integração com o Radar).
export const identitiesRouter = (repo: IdentitiesRepository = identitiesRepository) => {
  const router = Router();

  router.get('/', async (_req, res) => {
    res.json({ data: await repo.list() });
  });

  return router;
};
