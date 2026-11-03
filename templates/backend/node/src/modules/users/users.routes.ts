import { Router } from 'express';
import { requireAdmin } from '../../shared/middlewares/require-admin.js';
import { validate } from '../../shared/middlewares/validate.js';
import { makeUsersController } from './users.controller.js';
import { usersRepository } from './users.repository.js';
import { listUsersRequestSchema } from './users.schemas.js';
import { makeUsersService, type UsersRepository } from './users.service.js';

// Somente leitura (FR-014): pessoas são geridas no Radar.
export const usersRouter = (repo: UsersRepository = usersRepository) => {
  const controller = makeUsersController(makeUsersService(repo));
  const router = Router();

  router.use(requireAdmin);
  router.get('/', validate(listUsersRequestSchema), controller.list);

  return router;
};
