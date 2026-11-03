export const ROUTES = {
  explore: "/",
  policies: "/politicas",
  solutions: "/admin/solucoes",
  newSolution: "/admin/solucoes/nova",
  editSolution: (id: string) => `/admin/solucoes/${id}`,
  groups: "/admin/grupos",
  users: "/admin/usuarios",
} as const;

export function titleFor(pathname: string): string {
  if (pathname.startsWith(ROUTES.policies)) return "Políticas";
  if (pathname === ROUTES.newSolution) return "Nova solução";
  if (pathname.startsWith(`${ROUTES.solutions}/`)) return "Editar solução";
  if (pathname.startsWith(ROUTES.solutions)) return "Soluções";
  if (pathname.startsWith(ROUTES.groups)) return "Grupos";
  if (pathname.startsWith(ROUTES.users)) return "Usuários";
  return "Órbita da inovação";
}
