import { Router } from 'express';
import { requireAdmin } from '../../shared/middlewares/require-admin.js';
import { validate } from '../../shared/middlewares/validate.js';
import { makeSolutionsController } from './solutions.controller.js';
import { solutionsRepository } from './solutions.repository.js';
import {
  createSolutionRequestSchema,
  listSolutionsRequestSchema,
  solutionIdRequestSchema,
  updateSolutionRequestSchema,
} from './solutions.schemas.js';
import { makeSolutionsService, type SolutionsRepository } from './solutions.service.js';

export const solutionsRouter = (repo: SolutionsRepository = solutionsRepository) => {
  const controller = makeSolutionsController(makeSolutionsService(repo));
  const router = Router();

  router.use(requireAdmin);
  router.get('/', validate(listSolutionsRequestSchema), controller.list);
  router.post('/', validate(createSolutionRequestSchema), controller.create);
  router.get('/:id', validate(solutionIdRequestSchema), controller.getById);
  router.put('/:id', validate(updateSolutionRequestSchema), controller.update);
  router.delete('/:id', validate(solutionIdRequestSchema), controller.remove);
  router.post('/:id/archive', validate(solutionIdRequestSchema), controller.archive);
  router.post('/:id/restore', validate(solutionIdRequestSchema), controller.restore);

  return router;
};
