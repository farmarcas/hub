import { z } from 'zod';
import { emptyObject } from '../../shared/http/schemas.js';

const MAX_CATEGORY_NAME = 60;

export const listCategoriesRequestSchema = z.object({
  body: emptyObject.default({}),
  params: emptyObject.default({}),
  query: emptyObject.default({}),
});

export const createCategoryRequestSchema = z.object({
  body: z.object({ name: z.string().trim().min(1).max(MAX_CATEGORY_NAME) }).strict(),
  params: emptyObject.default({}),
  query: emptyObject.default({}),
});
