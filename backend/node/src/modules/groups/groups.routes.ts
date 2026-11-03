import { Router } from 'express';
import { requireAdmin } from '../../shared/middlewares/require-admin.js';
import { validate } from '../../shared/middlewares/validate.js';
import { makeGroupsController } from './groups.controller.js';
import { groupsRepository } from './groups.repository.js';
import {
  addMemberRequestSchema,
  createGroupRequestSchema,
  groupIdRequestSchema,
  listGroupsRequestSchema,
  removeMemberRequestSchema,
  updateGroupRequestSchema,
} from './groups.schemas.js';
import { makeGroupsService, type GroupsRepository } from './groups.service.js';

export const groupsRouter = (repo: GroupsRepository = groupsRepository) => {
  const controller = makeGroupsController(makeGroupsService(repo));
  const router = Router();

  router.use(requireAdmin);
  router.get('/', validate(listGroupsRequestSchema), controller.list);
  router.post('/', validate(createGroupRequestSchema), controller.create);
  router.put('/:id', validate(updateGroupRequestSchema), controller.update);
  router.get('/:id/deletion-impact', validate(groupIdRequestSchema), controller.deletionImpact);
  router.delete('/:id', validate(groupIdRequestSchema), controller.remove);
  router.post('/:id/members', validate(addMemberRequestSchema), controller.addMember);
  router.delete(
    '/:id/members/:userId',
    validate(removeMemberRequestSchema),
    controller.removeMember,
  );

  return router;
};
