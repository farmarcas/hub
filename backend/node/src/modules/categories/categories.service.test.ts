import { describe, expect, it, vi } from 'vitest';
import { makeCategoriesService, type CategoriesRepository } from './categories.service.js';

const makeRepo = (overrides: Partial<CategoriesRepository> = {}): CategoriesRepository => ({
  list: vi.fn().mockResolvedValue([]),
  findByName: vi.fn().mockResolvedValue(null),
  create: vi.fn(),
  ...overrides,
});

describe('makeCategoriesService.createOrGet', () => {
  it('deve devolver a categoria existente quando o nome só muda em maiúsculas e espaços', async () => {
    const existing = { id: 'c-1', name: 'Micro SaaS' };
    const repo = makeRepo({ findByName: vi.fn().mockResolvedValue(existing) });

    const result = await makeCategoriesService(repo).createOrGet('  micro saas ');

    expect(result).toEqual({ category: existing, created: false });
    expect(repo.findByName).toHaveBeenCalledWith('micro saas');
    expect(repo.create).not.toHaveBeenCalled();
  });

  it('deve criar com o nome sem espaços nas pontas quando não existe', async () => {
    const created = { id: 'c-2', name: 'Automação' };
    const repo = makeRepo({ create: vi.fn().mockResolvedValue(created) });

    const result = await makeCategoriesService(repo).createOrGet('  Automação ');

    expect(result).toEqual({ category: created, created: true });
    expect(repo.create).toHaveBeenCalledWith('Automação');
  });
});
