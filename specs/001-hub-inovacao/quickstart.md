# Quickstart — validate the Hub de Inovação MVP

## Prerequisites
- Docker Desktop open.
- `.env` created from `.env.example`. It now includes `AUTH_MODE=mock`.

## Bring it up
1. Start everything: `docker compose up -d --build --wait`
2. Check health: `docker compose ps` should show `postgres`, `api` and `web` as `healthy`.
3. Load the sample data: `docker compose exec api npm run db:seed`
4. Open http://localhost:3000

## Automated tests
- API unit tests: `docker compose exec api npm test`
- API integration tests: `docker compose exec api npm run test:integration`
- Web pure functions: `docker compose exec web npm test`
- Lint and types: `docker compose exec api npm run lint`, `docker compose exec web npm run lint`, `docker compose exec web npm run typecheck`

## Manual scenarios (map to the spec)

| # | Scenario | Expected |
|---|---|---|
| 1 | Sign in as **Marina Freitas** (admin) | Rail shows Explorar + Soluções, Grupos, Usuários |
| 2 | Soluções → Nova solução without a theme/directorate | "Salvar solução" disabled; message "Sem tema ou diretoria…" |
| 3 | Same, without an access rule | Red border and "Defina ao menos uma regra de acesso." |
| 4 | Create a solution with a new category "Automação" | Saves; category appears for the next one |
| 5 | Archive "Sonar" | Disappears from everyone's globe; "Restaurar" in the list |
| 6 | Grupos → delete "Dir. Comercial" (cancel at the end) | Impact lists the affected solutions and those left without access |
| 7 | Sign in as **Rafael Prado** (Dir. Adm. Financeira) | Globe without Radar CRM; with Radar Finanças, Cosmos, Sonar, Onboarding, Portal and Relatório de Vendas Mensal (named access) |
| 8 | As Rafael, try `GET /api/v1/solutions` | 403 |
| 9 | Search "crm" as Marina | Result "Radar CRM · SOLUÇÃO"; click focuses, panel opens, "Abrir solução ↗" opens a new tab |
| 10 | Esc after focusing a solution | Goes back to the group level in the breadcrumb |
| 11 | Políticas button | 3 tabs and the "Conteúdo de exemplo" notice |
| 12 | Usuários | Read-only table with groups and "Acessa"; no create button |
| 13 | macOS "Reduzir movimento" turned on | Globe without auto-rotation or pulses |
| 14 | Archive a solution, then try to find it in the globe search | It does not appear for anyone |

## Reference access matrix (seed)

| Person | Groups | Sees |
|---|---|---|
| Marina Freitas (admin) | Dir. Comercial, Dir. Tecnologia | s1, s2, s5, s6, s7, s8, s9, s10, s11 (not s3 or s4: being an admin does not widen what she sees in the globe) |
| Rafael Prado | Dir. Adm. Financeira | s3, s5, s7, s8, s9 (named), s11 |
| Juliana Sato | Dir. Comercial, Marketing | s1, s2, s4, s5, s6, s8, s9, s10, s11 |
| Diego Almeida | Dir. Comercial | s1, s2, s5, s6, s8, s9, s10, s11 |
| Camila Rocha | Dir. Adm. Financeira | s3, s5, s7, s8, s11 |
| Tiago Menezes (admin) | Dir. Tecnologia | s5, s6, s7, s8, s11 |

This table is the expected result of integration test SC-002.
