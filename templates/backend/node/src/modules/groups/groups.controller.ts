import type { Request, Response } from 'express';
import type { z } from 'zod';
import { readValidated } from '../../shared/middlewares/validate.js';
import {
  toGroupResponse,
  toGroupSummaryResponse,
  type addMemberRequestSchema,
  type createGroupRequestSchema,
  type groupIdRequestSchema,
  type listGroupsRequestSchema,
  type removeMemberRequestSchema,
  type updateGroupRequestSchema,
} from './groups.schemas.js';
import type { GroupsService } from './groups.service.js';

export const makeGroupsController = (service: GroupsService) => ({
  async list(_req: Request, res: Response) {
    const { query } = readValidated<z.infer<typeof listGroupsRequestSchema>>(res);
    const result = await service.list(query);
    res.json({ ...result, data: result.data.map(toGroupSummaryResponse) });
  },

  async create(_req: Request, res: Response) {
    const { body } = readValidated<z.infer<typeof createGroupRequestSchema>>(res);
    res.status(201).json(toGroupResponse(await service.create(body)));
  },

  async update(_req: Request, res: Response) {
    const { params, body } = readValidated<z.infer<typeof updateGroupRequestSchema>>(res);
    res.json(toGroupResponse(await service.update(params.id, body)));
  },

  async deletionImpact(_req: Request, res: Response) {
    const { params } = readValidated<z.infer<typeof groupIdRequestSchema>>(res);
    res.json(await service.deletionImpact(params.id));
  },

  async remove(_req: Request, res: Response) {
    const { params } = readValidated<z.infer<typeof groupIdRequestSchema>>(res);
    await service.remove(params.id);
    res.status(204).send();
  },

  async addMember(_req: Request, res: Response) {
    const { params, body } = readValidated<z.infer<typeof addMemberRequestSchema>>(res);
    await service.addMember(params.id, body.userId);
    res.status(201).json({ groupId: params.id, userId: body.userId });
  },

  async removeMember(_req: Request, res: Response) {
    const { params } = readValidated<z.infer<typeof removeMemberRequestSchema>>(res);
    await service.removeMember(params.id, params.userId);
    res.status(204).send();
  },
});
