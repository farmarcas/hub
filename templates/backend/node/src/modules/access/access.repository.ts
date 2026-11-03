import type { Prisma } from '../../generated/prisma/client.js';
import type { Viewer } from './access.service.js';

// Solução excluída (exclusão lógica) não existe para nenhuma leitura, de nenhuma tela.
export const notDeletedSolution = { deletedAt: null } as const satisfies Prisma.SolutionWhereInput;

// Mesma regra de canView, traduzida para consulta no banco: o filtro acontece no servidor.
export const visibleSolutionsWhere = (
  viewer: Pick<Viewer, 'id' | 'groupIds'>,
): Prisma.SolutionWhereInput => ({
  ...notDeletedSolution,
  status: 'published',
  archivedAt: null,
  OR: [
    { accessAll: true },
    { accessUsers: { some: { userId: viewer.id } } },
    { accessGroups: { some: { groupId: { in: viewer.groupIds } } } },
  ],
});
