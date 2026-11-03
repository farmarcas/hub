import { prisma } from '../../shared/database/prisma.js';
import type { CategoriesRepository } from './categories.service.js';

const categorySelect = { id: true, name: true } as const;

export const categoriesRepository: CategoriesRepository = {
  list() {
    return prisma.category.findMany({ select: categorySelect, orderBy: { name: 'asc' } });
  },

  findByName(name) {
    return prisma.category.findFirst({
      where: { name: { equals: name, mode: 'insensitive' } },
      select: categorySelect,
    });
  },

  create(name) {
    return prisma.category.create({ data: { name }, select: categorySelect });
  },
};
