import { describe, expect, it, vi } from 'vitest';
import { BusinessRuleError } from '../../shared/errors/business-rule-error.js';
import { NotFoundError } from '../../shared/errors/not-found-error.js';
import {
  makeSolutionsService,
  orderedPair,
  type SolutionDetail,
  type SolutionInput,
  type SolutionsRepository,
} from './solutions.service.js';

const input = (overrides: Partial<SolutionInput> = {}): SolutionInput => ({
  name: 'Radar CRM',
  url: 'https://crm.farmarcas.internal',
  objective: 'Centralizar o relacionamento.',
  description: 'Carteira de clientes.',
  categoryId: 'c-1',
  status: 'published',
  groupIds: ['g-1'],
  relatedIds: [],
  access: { all: false, groupIds: ['g-2'], userIds: [] },
  ...overrides,
});

const detail = (overrides: Partial<SolutionDetail> = {}): SolutionDetail => ({
  id: 's-1',
  name: 'Radar CRM',
  url: 'https://crm.farmarcas.internal',
  objective: 'Centralizar o relacionamento.',
  description: 'Carteira de clientes.',
  category: { id: 'c-1', name: 'Micro SaaS' },
  status: 'published',
  archived: false,
  groups: [],
  related: [],
  access: { all: false, groups: [], users: [] },
  ...overrides,
});

const makeRepo = (overrides: Partial<SolutionsRepository> = {}): SolutionsRepository => ({
  list: vi.fn(),
  counts: vi.fn(),
  findById: vi.fn().mockResolvedValue(detail()),
  findMissingReferences: vi.fn().mockResolvedValue([]),
  create: vi.fn().mockResolvedValue(detail()),
  update: vi.fn().mockResolvedValue(detail()),
  setArchived: vi.fn().mockResolvedValue(detail()),
  softDelete: vi.fn(),
  ...overrides,
});

describe('orderedPair', () => {
  it('deve guardar o par sempre com o menor id primeiro', () => {
    expect(orderedPair('b', 'a')).toEqual(['a', 'b']);
    expect(orderedPair('a', 'b')).toEqual(['a', 'b']);
  });
});

describe('makeSolutionsService.create', () => {
  it('deve recusar sem tema ou diretoria', async () => {
    const repo = makeRepo();
    const promise = makeSolutionsService(repo).create(input({ groupIds: [] }));

    await expect(promise).rejects.toBeInstanceOf(BusinessRuleError);
    await expect(promise).rejects.toMatchObject({ code: 'SOLUTION_REQUIRES_GROUP' });
    expect(repo.create).not.toHaveBeenCalled();
  });

  it('deve recusar sem nenhuma regra de acesso', async () => {
    const repo = makeRepo();
    const promise = makeSolutionsService(repo).create(
      input({ access: { all: false, groupIds: [], userIds: [] } }),
    );

    await expect(promise).rejects.toMatchObject({ code: 'SOLUTION_REQUIRES_ACCESS' });
    expect(repo.create).not.toHaveBeenCalled();
  });

  it('deve aceitar acesso só por pessoa específica', async () => {
    const repo = makeRepo();
    await makeSolutionsService(repo).create(
      input({ access: { all: false, groupIds: [], userIds: ['u-1'] } }),
    );

    expect(repo.create).toHaveBeenCalled();
  });

  it('deve descartar grupos e pessoas de acesso quando é para toda a empresa', async () => {
    const repo = makeRepo();
    await makeSolutionsService(repo).create(
      input({ access: { all: true, groupIds: ['g-2'], userIds: ['u-1'] } }),
    );

    expect(repo.create).toHaveBeenCalledWith(
      expect.objectContaining({ access: { all: true, groupIds: [], userIds: [] } }),
    );
  });

  it('deve recusar referência inexistente listando o que falta', async () => {
    const missing = [{ type: 'group', id: 'g-9' }];
    const repo = makeRepo({ findMissingReferences: vi.fn().mockResolvedValue(missing) });
    const promise = makeSolutionsService(repo).create(input({ groupIds: ['g-9'] }));

    await expect(promise).rejects.toMatchObject({ code: 'REFERENCE_NOT_FOUND', details: missing });
    expect(repo.create).not.toHaveBeenCalled();
  });

  it('deve conferir de uma vez categoria, grupos, pessoas e relacionadas', async () => {
    const repo = makeRepo();
    await makeSolutionsService(repo).create(
      input({ relatedIds: ['s-7'], access: { all: false, groupIds: ['g-2'], userIds: ['u-1'] } }),
    );

    expect(repo.findMissingReferences).toHaveBeenCalledWith({
      categoryId: 'c-1',
      groupIds: ['g-1', 'g-2'],
      userIds: ['u-1'],
      solutionIds: ['s-7'],
    });
  });
});

describe('makeSolutionsService.update', () => {
  it('deve responder não encontrado quando a solução não existe', async () => {
    const repo = makeRepo({ findById: vi.fn().mockResolvedValue(null) });
    const promise = makeSolutionsService(repo).update('s-404', input());

    await expect(promise).rejects.toBeInstanceOf(NotFoundError);
    await expect(promise).rejects.toMatchObject({ code: 'SOLUTION_NOT_FOUND' });
  });

  it('deve recusar relacionar a solução com ela mesma', async () => {
    const repo = makeRepo();
    const promise = makeSolutionsService(repo).update('s-1', input({ relatedIds: ['s-1'] }));

    await expect(promise).rejects.toMatchObject({ code: 'SOLUTION_SELF_RELATION' });
    expect(repo.update).not.toHaveBeenCalled();
  });

  it('deve aplicar as mesmas regras obrigatórias da criação', async () => {
    const repo = makeRepo();
    const promise = makeSolutionsService(repo).update('s-1', input({ groupIds: [] }));

    await expect(promise).rejects.toMatchObject({ code: 'SOLUTION_REQUIRES_GROUP' });
  });
});

describe('makeSolutionsService.archive / restore', () => {
  it('deve arquivar sem apagar', async () => {
    const repo = makeRepo();
    await makeSolutionsService(repo).archive('s-1');

    expect(repo.setArchived).toHaveBeenCalledWith('s-1', true);
  });

  it('deve restaurar', async () => {
    const repo = makeRepo();
    await makeSolutionsService(repo).restore('s-1');

    expect(repo.setArchived).toHaveBeenCalledWith('s-1', false);
  });

  it('deve responder não encontrado ao arquivar solução inexistente', async () => {
    const repo = makeRepo({ findById: vi.fn().mockResolvedValue(null) });

    await expect(makeSolutionsService(repo).archive('s-404')).rejects.toMatchObject({
      code: 'SOLUTION_NOT_FOUND',
    });
    expect(repo.setArchived).not.toHaveBeenCalled();
  });
});

describe('makeSolutionsService.remove', () => {
  it('deve excluir logicamente só a solução escolhida', async () => {
    const repo = makeRepo();
    await makeSolutionsService(repo).remove('s-1');

    expect(repo.softDelete).toHaveBeenCalledWith('s-1');
    expect(repo.softDelete).toHaveBeenCalledTimes(1);
    expect(repo.update).not.toHaveBeenCalled();
  });

  it('deve responder não encontrado sem excluir nada quando não existe ou já foi excluída', async () => {
    const repo = makeRepo({ findById: vi.fn().mockResolvedValue(null) });

    await expect(makeSolutionsService(repo).remove('s-404')).rejects.toMatchObject({
      code: 'SOLUTION_NOT_FOUND',
    });
    expect(repo.softDelete).not.toHaveBeenCalled();
  });
});

describe('makeSolutionsService.list', () => {
  it('deve devolver página com contagem por situação', async () => {
    const counts = { published: 9, inReview: 1, archived: 1 };
    const repo = makeRepo({
      list: vi.fn().mockResolvedValue({ data: [detail()], total: 11 }),
      counts: vi.fn().mockResolvedValue(counts),
    });

    const result = await makeSolutionsService(repo).list({ page: 1, pageSize: 20 });

    expect(result).toEqual({
      data: [detail()],
      meta: { page: 1, pageSize: 20, total: 11, counts },
    });
  });
});
