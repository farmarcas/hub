import { z } from 'zod';
import {
  GROUP_TYPE_LABELS,
  SOLUTION_STATUS_LABELS,
  solutionStatusFromLabel,
  solutionStatusLabelValues,
} from '../../shared/domain/labels.js';
import {
  emptyObject,
  idParamSchema,
  paginationSchema,
  uuidList,
} from '../../shared/http/schemas.js';
import type { SolutionDetail } from './solutions.service.js';

const MAX_NAME = 120;
const MAX_DESCRIPTION = 160;
const MAX_OBJECTIVE = 1000;
const MAX_URL = 2048;

const statusLabel = z.enum(solutionStatusLabelValues).transform(solutionStatusFromLabel);

export const solutionBodySchema = z
  .object({
    name: z.string().trim().min(1).max(MAX_NAME),
    url: z
      .string()
      .trim()
      .max(MAX_URL)
      .url()
      .regex(/^https:\/\//, 'O endereço precisa começar com https://'),
    objective: z.string().trim().min(1).max(MAX_OBJECTIVE),
    description: z
      .string()
      .trim()
      .min(1)
      .max(MAX_DESCRIPTION)
      .regex(/^[^\r\n]*$/, 'A descrição curta deve ter uma linha só'),
    categoryId: z.string().uuid(),
    status: statusLabel,
    groupIds: uuidList,
    relatedIds: uuidList,
    access: z
      .object({ all: z.boolean().default(false), groupIds: uuidList, userIds: uuidList })
      .strict(),
  })
  .strict();

const listQuerySchema = paginationSchema
  .extend({
    status: statusLabel.optional(),
    archived: z
      .enum(['true', 'false'])
      .transform((value) => value === 'true')
      .optional(),
  })
  .strict();

export const listSolutionsRequestSchema = z.object({
  body: emptyObject.default({}),
  params: emptyObject.default({}),
  query: listQuerySchema,
});

export const solutionIdRequestSchema = z.object({
  body: emptyObject.default({}),
  params: idParamSchema,
  query: emptyObject.default({}),
});

export const createSolutionRequestSchema = z.object({
  body: solutionBodySchema,
  params: emptyObject.default({}),
  query: emptyObject.default({}),
});

export const updateSolutionRequestSchema = z.object({
  body: solutionBodySchema,
  params: idParamSchema,
  query: emptyObject.default({}),
});

// Saída: rótulos legíveis no lugar dos valores do banco.
export const toSolutionResponse = (solution: SolutionDetail) => ({
  ...solution,
  status: SOLUTION_STATUS_LABELS[solution.status],
  groups: solution.groups.map((group) => ({ ...group, type: GROUP_TYPE_LABELS[group.type] })),
});
