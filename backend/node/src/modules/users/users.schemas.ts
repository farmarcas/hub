import { z } from 'zod';
import { GROUP_TYPE_LABELS } from '../../shared/domain/labels.js';
import { emptyObject, paginationSchema } from '../../shared/http/schemas.js';
import type { UserRecord } from './users.service.js';

export const listUsersRequestSchema = z.object({
  body: emptyObject.default({}),
  params: emptyObject.default({}),
  query: paginationSchema,
});

export const toUserResponse = (user: UserRecord & { accessibleSolutionCount: number }) => ({
  ...user,
  groups: user.groups.map((group) => ({ ...group, type: GROUP_TYPE_LABELS[group.type] })),
});
