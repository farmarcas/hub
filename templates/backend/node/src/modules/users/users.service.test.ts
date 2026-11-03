import { describe, expect, it, vi } from 'vitest';
import { makeUsersService, type UserRecord, type UsersRepository } from './users.service.js';

const user = (overrides: Partial<UserRecord> = {}): UserRecord => ({
  id: 'u-1',
  name: 'Ana',
  email: 'ana@farmarcas.com.br',
  isAdmin: false,
  groups: [{ id: 'g-1', name: 'Comercial', type: 'theme' }],
  ...overrides,
});

const published = { status: 'published' as const, archived: false, accessUserIds: [] };

const makeRepo = (overrides: Partial<UsersRepository> = {}): UsersRepository => ({
  list: vi.fn().mockResolvedValue({ data: [user()], total: 1 }),
  loadAccessRules: vi.fn().mockResolvedValue([]),
  ...overrides,
});

describe('makeUsersService.list', () => {
  it('deve contar as soluções que cada pessoa acessa com a mesma regra do globo', async () => {
    const repo = makeRepo({
      list: vi.fn().mockResolvedValue({
        data: [user(), user({ id: 'u-2', groups: [] })],
        total: 2,
      }),
      loadAccessRules: vi.fn().mockResolvedValue([
        { ...published, accessAll: true, accessGroupIds: [] },
        { ...published, accessAll: false, accessGroupIds: ['g-1'] },
        { ...published, accessAll: false, accessGroupIds: [], accessUserIds: ['u-2'] },
      ]),
    });

    const result = await makeUsersService(repo).list(1, 20);

    expect(
      result.data.map(({ id, accessibleSolutionCount }) => [id, accessibleSolutionCount]),
    ).toEqual([
      ['u-1', 2],
      ['u-2', 2],
    ]);
    expect(result.meta).toEqual({ page: 1, pageSize: 20, total: 2 });
  });
});
