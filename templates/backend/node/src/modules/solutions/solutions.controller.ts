import type { Request, Response } from 'express';
import type { z } from 'zod';
import { readValidated } from '../../shared/middlewares/validate.js';
import {
  toSolutionResponse,
  type createSolutionRequestSchema,
  type listSolutionsRequestSchema,
  type solutionIdRequestSchema,
  type updateSolutionRequestSchema,
} from './solutions.schemas.js';
import type { SolutionsService } from './solutions.service.js';

export const makeSolutionsController = (service: SolutionsService) => ({
  async list(_req: Request, res: Response) {
    const { query } = readValidated<z.infer<typeof listSolutionsRequestSchema>>(res);
    const result = await service.list(query);
    res.json({ ...result, data: result.data.map(toSolutionResponse) });
  },

  async getById(_req: Request, res: Response) {
    const { params } = readValidated<z.infer<typeof solutionIdRequestSchema>>(res);
    res.json(toSolutionResponse(await service.getById(params.id)));
  },

  async create(_req: Request, res: Response) {
    const { body } = readValidated<z.infer<typeof createSolutionRequestSchema>>(res);
    res.status(201).json(toSolutionResponse(await service.create(body)));
  },

  async update(_req: Request, res: Response) {
    const { params, body } = readValidated<z.infer<typeof updateSolutionRequestSchema>>(res);
    res.json(toSolutionResponse(await service.update(params.id, body)));
  },

  async archive(_req: Request, res: Response) {
    const { params } = readValidated<z.infer<typeof solutionIdRequestSchema>>(res);
    res.json(toSolutionResponse(await service.archive(params.id)));
  },

  async restore(_req: Request, res: Response) {
    const { params } = readValidated<z.infer<typeof solutionIdRequestSchema>>(res);
    res.json(toSolutionResponse(await service.restore(params.id)));
  },

  async remove(_req: Request, res: Response) {
    const { params } = readValidated<z.infer<typeof solutionIdRequestSchema>>(res);
    await service.remove(params.id);
    res.status(204).send();
  },
});
