import type { Request, Response } from 'express';
import type { z } from 'zod';
import { readValidated } from '../../shared/middlewares/validate.js';
import { toUserResponse, type listUsersRequestSchema } from './users.schemas.js';
import type { UsersService } from './users.service.js';

export const makeUsersController = (service: UsersService) => ({
  async list(_req: Request, res: Response) {
    const { query } = readValidated<z.infer<typeof listUsersRequestSchema>>(res);
    const result = await service.list(query.page, query.pageSize);
    res.json({ ...result, data: result.data.map(toUserResponse) });
  },
});
