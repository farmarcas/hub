import { z } from 'zod';
import {
  GROUP_TYPE_LABELS,
  groupTypeFromLabel,
  groupTypeLabelValues,
} from '../../shared/domain/labels.js';
import { emptyObject, idParamSchema, paginationSchema } from '../../shared/http/schemas.js';
import type { GroupRecord, GroupSummary } from './groups.service.js';

const MAX_NAME = 80;
const MAX_DESCRIPTION = 500;

const typeLabel = z.enum(groupTypeLabelValues).transform(groupTypeFromLabel);

const groupBodySchema = z
  .object({
    type: typeLabel,
    name: z.string().trim().min(1, 'Informe o nome do grupo').max(MAX_NAME),
    description: z
      .string()
      .trim()
      .max(MAX_DESCRIPTION)
      .nullish()
      .transform((value) => value || null),
  })
  .strict();

export const listGroupsRequestSchema = z.object({
  body: emptyObject.default({}),
  params: emptyObject.default({}),
  query: paginationSchema.extend({ type: typeLabel.optional() }).strict(),
});

export const groupIdRequestSchema = z.object({
  body: emptyObject.default({}),
  params: idParamSchema,
  query: emptyObject.default({}),
});

export const createGroupRequestSchema = z.object({
  body: groupBodySchema,
  params: emptyObject.default({}),
  query: emptyObject.default({}),
});

export const updateGroupRequestSchema = z.object({
  body: groupBodySchema,
  params: idParamSchema,
  query: emptyObject.default({}),
});

export const addMemberRequestSchema = z.object({
  body: z.object({ userId: z.string().uuid() }).strict(),
  params: idParamSchema,
  query: emptyObject.default({}),
});

export const removeMemberRequestSchema = z.object({
  body: emptyObject.default({}),
  params: z.object({ id: z.string().uuid(), userId: z.string().uuid() }).strict(),
  query: emptyObject.default({}),
});

export const toGroupResponse = (group: GroupRecord) => ({
  ...group,
  type: GROUP_TYPE_LABELS[group.type],
});

export const toGroupSummaryResponse = (group: GroupSummary) => ({
  ...toGroupResponse(group),
  solutionCount: group.solutions.length,
  memberCount: group.members.length,
});
