import { Router } from 'express';
import { readViewer } from '../../shared/middlewares/identify.js';
import { graphRepository } from './graph.repository.js';
import { makeGraphService, type GraphRepository } from './graph.service.js';

// Tudo o que a pessoa explora (globo, busca, painel) sai daqui, já filtrado no servidor.
export const graphRouter = (repo: GraphRepository = graphRepository) => {
  const service = makeGraphService(repo);
  const router = Router();

  router.get('/', async (req, res) => {
    res.json(await service.forViewer(readViewer(req)));
  });

  return router;
};
