import { describe, expect, it, vi } from 'vitest';
import { ConflictError } from '../../shared/errors/conflict-error.js';
import { NotFoundError } from '../../shared/errors/not-found-error.js';
import {
  computeDeletionImpact,
  makeGroupsService,
  type GroupsRepository,
  type ImpactSolution,
} from './groups.service.js';

const group = { id: 'g-1', type: 'theme' as const, name: 'Comercial', description: null };

const makeRepo = (overrides: Partial<GroupsRepository> = {}): GroupsRepository => ({
  list: vi.fn(),
  findById: vi.fn().mockResolvedValue(group),
  findActiveByName: vi.fn().mockResolvedValue(null),
  create: vi.fn().mockResolvedValue(group),
  update: vi.fn().mockResolvedValue(group),
  loadImpactData: vi.fn().mockResolvedValue({ solutions: [], members: [] }),
  softDelete: vi.fn(),
  userExists: vi.fn().mockResolvedValue(true),
  isMember: vi.fn().mockResolvedValue(false),
  addMember: vi.fn(),
  removeMember: vi.fn(),
  ...overrides,
});

const impactSolution = (overrides: Partial<ImpactSolution> = {}): ImpactSolution => ({
  id: 's-1',
  name: 'Radar CRM',
  groupIds: ['g-1', 'g-2'],
  accessAll: false,
  accessGroupIds: ['g-3'],
  accessUserCount: 0,
  ...overrides,
});

describe('computeDeletionImpact', () => {
  it('deve apontar solução cujo único tema/diretoria é o grupo excluído', () => {
    const impact = computeDeletionImpact('g-1', {
      solutions: [impactSolution({ groupIds: ['g-1'] })],
      members: [],
    });

    expect(impact.orphanedByGroup).toEqual([{ id: 's-1', name: 'Radar CRM' }]);
    expect(impact.orphanedByAccess).toEqual([]);
  });

  it('deve apontar solução cujo único acesso é o grupo excluído', () => {
    const impact = computeDeletionImpact('g-1', {
      solutions: [impactSolution({ accessGroupIds: ['g-1'] })],
      members: [],
    });

    expect(impact.orphanedByAccess).toEqual([{ id: 's-1', name: 'Radar CRM' }]);
    expect(impact.orphanedByGroup).toEqual([]);
  });

  it('não deve apontar perda de acesso quando ainda há pessoa específica ou toda a empresa', () => {
    const impact = computeDeletionImpact('g-1', {
      solutions: [
        impactSolution({ id: 's-1', accessGroupIds: ['g-1'], accessUserCount: 1 }),
        impactSolution({ id: 's-2', accessGroupIds: ['g-1'], accessAll: true }),
      ],
      members: [],
    });

    expect(impact.orphanedByAccess).toEqual([]);
  });

  it('deve listar todas as soluções e pessoas afetadas', () => {
    const members = [{ id: 'u-1', name: 'Ana' }];
    const impact = computeDeletionImpact('g-1', {
      solutions: [impactSolution(), impactSolution({ id: 's-2', name: 'Órbita' })],
      members,
    });

    expect(impact.solutions).toEqual([
      { id: 's-1', name: 'Radar CRM' },
      { id: 's-2', name: 'Órbita' },
    ]);
    expect(impact.members).toEqual(members);
  });
});

describe('makeGroupsService.create', () => {
  it('deve recusar nome repetido entre grupos ativos', async () => {
    const repo = makeRepo({ findActiveByName: vi.fn().mockResolvedValue(group) });
    const promise = makeGroupsService(repo).create({ type: 'theme', name: ' comercial ' });

    await expect(promise).rejects.toBeInstanceOf(ConflictError);
    await expect(promise).rejects.toMatchObject({ code: 'GROUP_NAME_TAKEN' });
    expect(repo.findActiveByName).toHaveBeenCalledWith('comercial', undefined);
  });

  it('deve criar com o nome sem espaços nas pontas', async () => {
    const repo = makeRepo();
    await makeGroupsService(repo).create({ type: 'directorate', name: '  Dir. Nova ' });

    expect(repo.create).toHaveBeenCalledWith({ type: 'directorate', name: 'Dir. Nova' });
  });
});

describe('makeGroupsService.update', () => {
  it('deve ignorar o próprio grupo ao conferir nome repetido', async () => {
    const repo = makeRepo();
    await makeGroupsService(repo).update('g-1', { type: 'theme', name: 'Comercial' });

    expect(repo.findActiveByName).toHaveBeenCalledWith('Comercial', 'g-1');
  });

  it('deve responder não encontrado para grupo inexistente', async () => {
    const repo = makeRepo({ findById: vi.fn().mockResolvedValue(null) });

    await expect(
      makeGroupsService(repo).update('g-9', { type: 'theme', name: 'X' }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });
});

describe('makeGroupsService.remove', () => {
  it('deve excluir logicamente o grupo existente', async () => {
    const repo = makeRepo();
    await makeGroupsService(repo).remove('g-1');

    expect(repo.softDelete).toHaveBeenCalledWith('g-1');
  });

  it('deve responder não encontrado sem excluir nada', async () => {
    const repo = makeRepo({ findById: vi.fn().mockResolvedValue(null) });

    await expect(makeGroupsService(repo).remove('g-9')).rejects.toMatchObject({
      code: 'GROUP_NOT_FOUND',
    });
    expect(repo.softDelete).not.toHaveBeenCalled();
  });
});

describe('makeGroupsService membros', () => {
  it('deve recusar pessoa que já é membro', async () => {
    const repo = makeRepo({ isMember: vi.fn().mockResolvedValue(true) });

    await expect(makeGroupsService(repo).addMember('g-1', 'u-1')).rejects.toMatchObject({
      code: 'ALREADY_MEMBER',
    });
    expect(repo.addMember).not.toHaveBeenCalled();
  });

  it('deve responder não encontrado para pessoa inexistente', async () => {
    const repo = makeRepo({ userExists: vi.fn().mockResolvedValue(false) });

    await expect(makeGroupsService(repo).addMember('g-1', 'u-9')).rejects.toMatchObject({
      code: 'USER_NOT_FOUND',
    });
  });

  it('deve responder não encontrado ao remover quem não é membro', async () => {
    const repo = makeRepo();

    await expect(makeGroupsService(repo).removeMember('g-1', 'u-1')).rejects.toMatchObject({
      code: 'MEMBER_NOT_FOUND',
    });
    expect(repo.removeMember).not.toHaveBeenCalled();
  });
});
