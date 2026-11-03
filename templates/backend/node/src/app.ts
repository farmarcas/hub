import express from 'express';
import { pinoHttp } from 'pino-http';
import { prisma } from './shared/database/prisma.js';
import { logger } from './shared/logger.js';
import { errorHandler } from './shared/middlewares/error-handler.js';
import { identify } from './shared/middlewares/identify.js';
import { requestId } from './shared/middlewares/request-id.js';
import { categoriesRouter } from './modules/categories/categories.routes.js';
import { graphRouter } from './modules/graph/graph.routes.js';
import { groupsRouter } from './modules/groups/groups.routes.js';
import {
  identitiesRepository,
  type IdentitiesRepository,
} from './modules/identities/identities.repository.js';
import { identitiesRouter } from './modules/identities/identities.routes.js';
import { meRouter } from './modules/me/me.routes.js';
import { solutionsRouter } from './modules/solutions/solutions.routes.js';
import { usersRouter } from './modules/users/users.routes.js';

type AppDeps = {
  identitiesRepository?: IdentitiesRepository;
};

export const createApp = (deps: AppDeps = {}) => {
  const identities = deps.identitiesRepository ?? identitiesRepository;
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json());
  app.use(requestId);
  app.use(
    pinoHttp({
      logger,
      genReqId: (req) => req.id,
    }),
  );

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.get('/health/ready', async (_req, res) => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      res.json({ status: 'ok' });
    } catch (error) {
      logger.warn({ err: error }, 'readiness check failed');
      res.status(503).json({
        error: { code: 'NOT_READY', message: 'Banco indisponível', details: [] },
      });
    }
  });

  // AUTH_MODE=mock (único modo hoje): lista do "Entrar como", sem exigir identificação.
  app.use('/api/v1/identities', identitiesRouter(identities));

  // Daqui em diante toda rota sabe quem está pedindo.
  app.use('/api/v1', identify(identities));
  app.use('/api/v1/me', meRouter());
  app.use('/api/v1/graph', graphRouter());
  app.use('/api/v1/solutions', solutionsRouter());
  app.use('/api/v1/categories', categoriesRouter());
  app.use('/api/v1/groups', groupsRouter());
  app.use('/api/v1/users', usersRouter());

  app.use((_req, res) => {
    res.status(404).json({
      error: { code: 'NOT_FOUND', message: 'Rota não encontrada', details: [] },
    });
  });

  app.use(errorHandler);
  return app;
};

export const app = createApp();
