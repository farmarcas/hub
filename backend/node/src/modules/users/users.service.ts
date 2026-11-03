import type { GroupTypeValue } from '../../shared/domain/labels.js';
import { canView, type AccessRule } from '../access/access.service.js';

// Usuários vêm do Radar (no MVP, do seed). O Hub só lê: não cria, não edita, não remove.
export type UserRecord = {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  groups: { id: string; name: string; type: GroupTypeValue }[];
};

export type UsersRepository = {
  list: (page: number, pageSize: number) => Promise<{ data: UserRecord[]; total: number }>;
  loadAccessRules: () => Promise<AccessRule[]>;
};

export const makeUsersService = (repo: UsersRepository) => ({
  async list(page: number, pageSize: number) {
    const [{ data, total }, rules] = await Promise.all([
      repo.list(page, pageSize),
      repo.loadAccessRules(),
    ]);

    return {
      data: data.map((user) => {
        const viewer = { id: user.id, groupIds: user.groups.map(({ id }) => id) };
        return {
          ...user,
          accessibleSolutionCount: rules.filter((rule) => canView(rule, viewer)).length,
        };
      }),
      meta: { page, pageSize, total },
    };
  },
});

export type UsersService = ReturnType<typeof makeUsersService>;
