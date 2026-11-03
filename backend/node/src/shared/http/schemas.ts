import { z } from 'zod';

const MAX_PAGE_SIZE = 100;

export const emptyObject = z.object({}).strict();

export const idParamSchema = z.object({ id: z.string().uuid() }).strict();

export const paginationSchema = z
  .object({
    page: z.coerce.number().int().positive().default(1),
    pageSize: z.coerce.number().int().positive().max(MAX_PAGE_SIZE).default(20),
  })
  .strict();

export const uuidList = z
  .array(z.string().uuid())
  .default([])
  .transform((ids) => [...new Set(ids)]);

export type PageMeta = { page: number; pageSize: number; total: number };
