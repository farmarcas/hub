import type { Request, Response } from 'express';
import type { z } from 'zod';
import { readValidated } from '../../shared/middlewares/validate.js';
import type { createCategoryRequestSchema } from './categories.schemas.js';
import type { CategoriesService } from './categories.service.js';

export const makeCategoriesController = (service: CategoriesService) => ({
  async list(_req: Request, res: Response) {
    res.json(await service.list());
  },

  async create(_req: Request, res: Response) {
    const { body } = readValidated<z.infer<typeof createCategoryRequestSchema>>(res);
    const { category, created } = await service.createOrGet(body.name);
    res.status(created ? 201 : 200).json(category);
  },
});
