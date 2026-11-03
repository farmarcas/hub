import { Router } from 'express';
import { requireAdmin } from '../../shared/middlewares/require-admin.js';
import { validate } from '../../shared/middlewares/validate.js';
import { makeCategoriesController } from './categories.controller.js';
import { categoriesRepository } from './categories.repository.js';
import { createCategoryRequestSchema, listCategoriesRequestSchema } from './categories.schemas.js';
import { makeCategoriesService, type CategoriesRepository } from './categories.service.js';

export const categoriesRouter = (repo: CategoriesRepository = categoriesRepository) => {
  const controller = makeCategoriesController(makeCategoriesService(repo));
  const router = Router();

  router.use(requireAdmin);
  router.get('/', validate(listCategoriesRequestSchema), controller.list);
  router.post('/', validate(createCategoryRequestSchema), controller.create);

  return router;
};
