import { Avatar } from "@/components/ui/Avatar";
import { Banner } from "@/components/ui/Banner";
import { Chip } from "@/components/ui/Chip";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/States";
import { solutionCountLabel } from "@/lib/plural";
import { useUsers } from "../hooks/useUsers";

const headerCell = "px-4 py-3 text-left text-[10.5px] font-semibold tracking-[0.14em] uppercase";

// Somente leitura: pessoas são criadas e editadas no Radar.
export function UsersTable() {
  const { users, isLoading, error, reload } = useUsers();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-[26px] font-medium tracking-[-0.4px]">Usuários</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Usuários internos do Radar. Para incluir alguém em um grupo, use a tela Grupos.
        </p>
      </div>

      <Banner title="Lista herdada do Radar">
        Os usuários virão do Radar por integração (próxima etapa) e não são criados nem editados no
        Hub.
      </Banner>

      {isLoading && <LoadingState label="Carregando usuários…" />}
      {error && <ErrorState message={error} onRetry={() => void reload()} />}
      {!isLoading && !error && users.length === 0 && (
        <EmptyState title="Nenhum usuário encontrado no Radar." />
      )}

      {users.length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-border-subtle bg-surface">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="border-b border-border-subtle text-subtle-foreground">
              <tr>
                <th scope="col" className={headerCell}>
                  Nome
                </th>
                <th scope="col" className={headerCell}>
                  E-mail
                </th>
                <th scope="col" className={headerCell}>
                  Grupos no Hub
                </th>
                <th scope="col" className={`${headerCell} text-right`}>
                  Acessa
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-border-subtle last:border-0">
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-3">
                      <Avatar name={user.name} size="sm" />
                      <span>
                        {user.name}
                        {user.isAdmin && (
                          <span className="ml-2 text-[11px] text-primary-hover">Admin</span>
                        )}
                      </span>
                    </span>
                  </td>
                  <td className="px-4 py-3 text-soft-foreground">{user.email}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1.5">
                      {user.groups.length === 0 ? (
                        <span className="text-xs text-subtle-foreground">Nenhum</span>
                      ) : (
                        user.groups.map((group) => <Chip key={group.id}>{group.name}</Chip>)
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right text-soft-foreground">
                    {solutionCountLabel(user.accessibleSolutionCount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
