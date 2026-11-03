---

description: "Task list for the Hub de Inovação Farmarcas MVP"
---

# Tasks: Hub de Inovação Farmarcas (MVP)

**Input**: Design documents from `specs/001-hub-inovacao/`

**Prerequisites**: [plan.md](plan.md), [spec.md](spec.md), [research.md](research.md), [data-model.md](data-model.md), [contracts/api.md](contracts/api.md), [quickstart.md](quickstart.md)

**Tests**: Included.
- The `node-api-development` and `node-unit-testing` skills require TDD on services and Supertest integration on routes (research R13).
- Every service test is written first and must fail before its implementation.

**Organization**: by user story from the spec.
- API paths are under `backend/node/`.
- Web paths are under `frontend/react/`.
- All commands run via `docker compose exec <service> …`.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: can run in parallel (different files, no pending dependency)
- **[Story]**: US1…US6 from the spec

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: prepare the frontend in TS + Tailwind and the API config.

- [x] T001 Migrate the frontend to TypeScript:
  - create `frontend/react/tsconfig.json` (strict, `noUncheckedIndexedAccess`, alias `@/` → `src/`);
  - rename `vite.config.js` → `frontend/react/vite.config.ts` and keep the `/api` and `/health` proxy;
  - add the `@/` alias and the `@tailwindcss/vite` plugin.
- [x] T002 Update `frontend/react/package.json`:
  - deps: `react-router-dom`, `lucide-react`, `clsx`, `tailwind-merge`, `@fontsource/rubik`;
  - devDeps: `typescript`, `@types/react`, `@types/react-dom`, `tailwindcss`, `@tailwindcss/vite`, `vitest`, `eslint`, `typescript-eslint`, `eslint-plugin-react-hooks`, `prettier`;
  - scripts: `test`, `typecheck` (`tsc --noEmit`), `lint`;
  - regenerate `package-lock.json` inside the container.
- [x] T003 [P] Create `frontend/react/eslint.config.js` and `frontend/react/.prettierrc.json`, aligned with `backend/node`.
- [x] T004 [P] Create `frontend/react/src/styles/globals.css` with `@import "tailwindcss"`, Rubik (`@fontsource/rubik` 300/400/500/600) and `@theme`:
  - required semantic tokens mapped to v5:
    - `background` #050505, `foreground` #FAF9F8;
    - `primary` #FF5510, `primary-foreground` #050505;
    - `muted` rgba(14,13,12,0.86), `muted-foreground` #A5A19B;
    - `destructive` #D92D20, `destructive-foreground` #FAF9F8;
    - `border` rgba(255,255,255,0.1), `ring` #FF7334;
  - extra tokens:
    - `primary-hover` #FF7334;
    - `accent-soft` #FFBE9F;
    - `subtle-foreground` #787471;
    - `surface` rgba(14,13,12,0.9);
    - `primary-tint` rgba(255,85,16,0.14);
  - radii 5/8/10/12/20;
  - `prefers-reduced-motion` base.
- [x] T005 [P] Create `frontend/react/src/lib/cn.ts` (clsx + tailwind-merge).
- [x] T006 Replace `frontend/react/src/main.jsx` and `App.jsx` with `frontend/react/src/main.tsx` (router with routes `/`, `/politicas`, `/admin/solucoes`, `/admin/solucoes/nova`, `/admin/solucoes/:id`, `/admin/grupos`, `/admin/usuarios`) and update `frontend/react/index.html` (title "Hub de Inovação Farmarcas", `lang="pt-BR"`).
- [x] T007 [P] Add `AUTH_MODE` (`z.enum(['mock'])`, default `mock`, fails to start with any other value) to `backend/node/src/config/env.ts` and `AUTH_MODE=mock` to `.env.example`, `backend/node/.env.example` and to the `api` service in `docker-compose.yml`.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: database, seed, identification and app shell. No story starts before this.

- [x] T008 Model it in `backend/node/prisma/schema.prisma`, following [data-model.md](data-model.md):
  - `User` gains `isAdmin Boolean @default(false) @map("is_admin")`;
  - new models `Group`, `GroupMember`, `Category`, `Solution`, `SolutionGroup`, `SolutionRelated`, `SolutionAccessGroup`, `SolutionAccessUser`;
  - enums `GroupType (theme, directorate)` and `SolutionStatus (in_review, published)`;
  - UUIDv7, `@db.Timestamptz(3)`, `@map` to snake_case.
- [x] T009 Generate the migration with `npx prisma migrate dev --create-only --name hub_catalog` inside the container. Then edit by hand `backend/node/prisma/migrations/<ts>_hub_catalog/migration.sql`:
  - `CREATE COLLATION IF NOT EXISTS pt_br (provider = icu, locale = 'pt-BR', deterministic = true)` and `COLLATE pt_br` on `users.name`, `groups.name`, `categories.name`, `solutions.name`;
  - `groups_name_active_uidx ON groups (lower(btrim(name))) WHERE deleted_at IS NULL`;
  - `categories_name_uidx ON categories (lower(btrim(name)))`;
  - `CHECK (url ~ '^https://')`;
  - `CHECK (char_length(name) <= 120)` and `CHECK (char_length(description) <= 160)` on solutions;
  - `CHECK (solution_a_id < solution_b_id)` on `solution_related`;
  - `solutions_visible_idx (status) WHERE archived_at IS NULL`;
  - FK indexes on the link tables.

  Apply with `npx prisma migrate deploy`.
- [x] T010 Create the seed `backend/node/seeds/20261015120000_hub_prototipo.sql`, UTF-8, idempotent (`ON CONFLICT DO NOTHING`), with fixed UUIDv7 values commented by prototype id:
  - 6 users (u1 Marina Freitas and u6 Tiago Menezes with `is_admin = true`);
  - 9 groups (g-com, g-fin, g-mkt, g-ops, g-bi, g-ppl, d-com, d-adm, d-tec, with descriptions);
  - memberships;
  - 4 categories;
  - 11 solutions s1…s11 with url/objective/description/status `published`;
  - `solution_groups`, `solution_related` (normalized a<b), `access_all` for s5/s8/s11, access groups and the u2 user on s9.

  Add the script `"db:seed": "prisma db execute --file seeds/20261015120000_hub_prototipo.sql"` to `backend/node/package.json`.
- [x] T011 [P] Create the errors `UnauthorizedError` (401 `UNAUTHENTICATED`) and `ForbiddenError` (403 `FORBIDDEN`) in `backend/node/src/shared/errors/unauthorized-error.ts` and `backend/node/src/shared/errors/forbidden-error.ts`.
- [x] T012 Create `backend/node/src/shared/middlewares/identify.ts`:
  - reads `x-hub-user`, validates the UUID, loads the active user and their group ids, and sets `req.viewer = { id, name, email, isAdmin, groupIds }`;
  - 401 when missing or unknown;
  - type in `backend/node/src/types/express.d.ts`.
- [x] T013 [P] Create `backend/node/src/shared/middlewares/require-admin.ts` (403 when `!req.viewer.isAdmin`).
- [x] T014 Create the modules `backend/node/src/modules/identities/` (`GET /api/v1/identities`, only with `AUTH_MODE=mock`, no identification) and `backend/node/src/modules/me/` (`GET /api/v1/me`). Register them in `backend/node/src/app.ts` with `identify` applied to `/api/v1` except `/identities`.
- [x] T015 [P] Integration test `backend/node/src/modules/me/me.routes.integration.test.ts`: 401 without the header, 401 with an unknown id, 200 with a seed user, plus `/identities` listing 6 people.
- [x] T016 [P] Create the API client `frontend/react/src/lib/api.ts`:
  - `apiGet/apiPost/apiPut/apiDelete` inject `x-hub-user` from the session;
  - they parse `{ error: { code, message, details } }` into a typed `ApiError`.
- [x] T017 Create the `frontend/react/src/features/session/` feature:
  - `hooks/useSession.ts` (selected identity in `localStorage`, loads `/me` and `/identities`);
  - `components/IdentitySwitcher.tsx` ("Entrar como" list in the rail avatar);
  - `SessionProvider` context;
  - `index.ts`.
- [x] T018 [P] Create the UI primitives in `frontend/react/src/components/ui/`, with the v5 specs from the README:
  - `Button.tsx` (variants `primary`, `secondary`, `ghost`, `destructive`; primary with orange glow);
  - `TextField.tsx`, `TextArea.tsx`, `Select.tsx` (label + error via `aria-describedby`);
  - `Chip.tsx` (selectable, radius 20);
  - `StatusBadge.tsx`, `Toggle.tsx`, `Banner.tsx`;
  - `Dialog.tsx` (Escape, traps focus, returns focus);
  - `EmptyState.tsx`, `ErrorState.tsx`, `LoadingState.tsx`.
- [x] T019 Create the layout in `frontend/react/src/components/layout/`:
  - `Rail.tsx`:
    - 64px, provisional "H" mark;
    - Explorar, divider, admin items Soluções/Grupos/Usuários only when `isAdmin`;
    - avatar with initials opening `IdentitySwitcher`;
    - active/inactive states from the README;
  - `Header.tsx`: screen title 20px/500, "Hub de Inovação Farmarcas" and the **Políticas** button with active state;
  - `AppShell.tsx` combining both;
  - admin routes redirect to `/` when not admin.

**Checkpoint**:
- `docker compose up -d --build --wait` is healthy and the seed applies.
- The shell opens with the "Entrar como" switcher and the admin menu appears only for Marina/Tiago.

---

## Phase 3: User Story 1 - Admin registers and maintains solutions (Priority: P1) 🎯 MVP

**Goal**: list, create, edit, archive and restore solutions with the required rules.

**Independent Test**: quickstart scenarios 2–5. Create a full solution, see the summary in the list, archive and restore it, and get refused without a group or without access.

### Tests for User Story 1 ⚠️ write first, they must fail

- [x] T020 [P] [US1] Unit test `backend/node/src/modules/solutions/solutions.service.test.ts`:
  - `SOLUTION_REQUIRES_GROUP` when `groupIds` is empty;
  - `SOLUTION_REQUIRES_ACCESS` when `access.all=false` and no groups/users;
  - `REFERENCE_NOT_FOUND` for a missing or deleted group/user/related solution/category;
  - the solution does not relate to itself;
  - `relatedIds` normalized into (a<b) pairs with no duplicates;
  - archive/restore idempotent;
  - 404 `SOLUTION_NOT_FOUND`.
- [x] T021 [P] [US1] Unit test `backend/node/src/modules/categories/categories.service.test.ts`: names "  micro saas " and "Micro SaaS" resolve to the existing category (`created: false`); an empty name gives 400.
- [x] T022 [P] [US1] Integration test `backend/node/src/modules/solutions/solutions.routes.integration.test.ts`:
  - POST 201;
  - 400 http:// URL;
  - 400 without a group;
  - 400 without access;
  - 403 non-admin;
  - PUT 200/404;
  - archive/restore;
  - GET list with `meta.counts` and pagination.

### Implementation for User Story 1

- [x] T023 [P] [US1] Zod schemas in `backend/node/src/modules/solutions/solutions.schemas.ts`, following [contracts/api.md](../001-hub-inovacao/contracts/api.md):
  - `name` 1–120;
  - `url` matching `^https://`;
  - `objective` required;
  - `description` 1–160 with no line break;
  - `status` "Em avaliação" | "Publicada";
  - `groupIds`, `relatedIds`, `access.{all,groupIds,userIds}`;
  - `.strict()`;
  - plus the mapping of labels ↔ enums.
- [x] T024 [P] [US1] Category schemas/repository/service/controller/routes in `backend/node/src/modules/categories/`:
  - `GET` ordered;
  - `POST` returns 201 or 200 when it already exists.
- [x] T025 [US1] Repository `backend/node/src/modules/solutions/solutions.repository.ts`:
  - paginated list with groups/access/related (no N+1) and counts by situation;
  - findById;
  - create/update in `$transaction` rewriting the link tables;
  - archive/restore via `archived_at`;
  - `existingIds` checks for groups/users/solutions/categories.
- [x] T026 [US1] Service `backend/node/src/modules/solutions/solutions.service.ts` with the T020 rules (GREEN).
- [x] T027 [US1] Controller + routes in `backend/node/src/modules/solutions/` (`GET /`, `GET /:id`, `POST /`, `PUT /:id`, `POST /:id/archive`, `POST /:id/restore`), under `requireAdmin`; register them in `backend/node/src/app.ts`.
- [x] T028 [P] [US1] Pure function `frontend/react/src/features/solutions-admin/lib/accessSummary.ts` ("Toda a empresa" | "N grupos" | "N pessoas", combined with " + ") and test `accessSummary.test.ts`.
- [x] T029 [US1] Hooks in `frontend/react/src/features/solutions-admin/hooks/`:
  - `useSolutionsList.ts`: list, counts, archive/restore;
  - `useSolutionForm.ts`:
    - load for editing;
    - form state;
    - validation of group/access/https before enabling Save;
    - inline category creation;
    - submit;
    - mapping of API errors to fields.
- [x] T030 [US1] `frontend/react/src/features/solutions-admin/components/SolutionsTable.tsx`:
  - columns SOLUÇÃO (name + category), STATUS, RELAÇÕES NO GRAFO (chips), ACESSO (summary), AÇÕES (Editar, Arquivar/Restaurar);
  - subtitle "N publicadas · N em avaliação · N arquivadas";
  - **Nova solução** button;
  - loading/empty/error states.
- [x] T031 [US1] `frontend/react/src/features/solutions-admin/components/SolutionForm.tsx` with three blocks:
  - "← Voltar para soluções" at the top;
  - **SOLUÇÃO**: Nome, URL, Objetivo, Descrição curta, Categoria with "criar nova" inline, Status;
  - **QUEM ACESSA \***:
    - "Toda a empresa" toggle dims the rest (opacity 0.4);
    - chips of Grupos and Pessoas específicas;
    - when empty: red border and "Defina ao menos uma regra de acesso.";
  - **RELAÇÕES NO GRAFO \***:
    - chips of Temas, Diretorias, Soluções relacionadas;
    - preview "NO GRAFO: <nome> conecta a …";
    - when empty: "Sem tema ou diretoria, a solução ficaria solta no grafo.";
  - **Salvar solução** disabled while something is missing, plus Cancelar.
- [x] T032 [US1] Thin pages `frontend/react/src/app/SolutionsPage.tsx` and `frontend/react/src/app/SolutionFormPage.tsx` (new and edit by `:id`).

**Checkpoint**: US1 works with the seed and quickstart scenarios 2–5 pass.

---

## Phase 4: User Story 2 - Admin organizes groups and members (Priority: P1)

**Goal**: CRUD of Tema/Diretoria, members and deletion with an impact warning.

**Independent Test**: quickstart scenario 6, plus creating a theme, adding/removing a person and renaming with a duplicate name refused.

### Tests for User Story 2 ⚠️

- [x] T033 [P] [US2] Unit test `backend/node/src/modules/groups/groups.service.test.ts`:
  - empty/blank name → 400;
  - duplicate name ignoring case/spaces → 409 `GROUP_NAME_TAKEN`;
  - impact computes `solutions`, `members`, `orphanedByGroup` (only group of the solution) and `orphanedByAccess` (`access_all=false`, no users, only access group);
  - member add duplicated → 409 `ALREADY_MEMBER`;
  - missing group/user → 404.
- [x] T034 [P] [US2] Integration test `backend/node/src/modules/groups/groups.routes.integration.test.ts`:
  - CRUD;
  - type filter;
  - members;
  - `deletion-impact` for "Dir. Comercial" (seed);
  - DELETE removes its links from solutions, access and memberships, and the group disappears from the list;
  - 403 non-admin.

### Implementation for User Story 2

- [x] T035 [P] [US2] Zod schemas in `backend/node/src/modules/groups/groups.schemas.ts`:
  - `type` "Tema" | "Diretoria";
  - `name` trim, 1–80;
  - `description` optional;
  - `?type` filter;
  - pagination.
- [x] T036 [US2] Repository `backend/node/src/modules/groups/groups.repository.ts`:
  - list with solution/member counts and lists;
  - name lookup by `lower(btrim)` among active ones;
  - create/update;
  - impact query;
  - soft delete + removal of links in `$transaction`;
  - add/remove member.
- [x] T037 [US2] Service `backend/node/src/modules/groups/groups.service.ts` (GREEN for T033).
- [x] T038 [US2] Controller + routes `backend/node/src/modules/groups/`:
  - `GET /`, `POST /`, `PUT /:id`, `GET /:id/deletion-impact`, `DELETE /:id`, `POST /:id/members`, `DELETE /:id/members/:userId`;
  - under `requireAdmin`;
  - register them in `app.ts`.
- [x] T039 [US2] Hook `frontend/react/src/features/groups-admin/hooks/useGroups.ts`: list/filter, open group, create/edit/delete with impact, add/remove members, list of users for the select.
- [x] T040 [US2] Components in `frontend/react/src/features/groups-admin/components/`:
  - `GroupList.tsx`: icon by type, "N soluções · N pessoas", filter Todos | Temas | Diretorias;
  - `GroupDetail.tsx`:
    - type, name, description;
    - inline Editar;
    - SOLUÇÕES CONECTADAS;
    - PESSOAS NO GRUPO with remove;
    - add a user via select;
  - `NewGroupForm.tsx`;
  - `DeleteGroupDialog.tsx`: affected solutions and people, plus the list of the ones left without access/relation;
  - subtitle from the README.
- [x] T041 [US2] Thin page `frontend/react/src/app/GroupsPage.tsx` in two columns.

**Checkpoint**: US1 + US2 working. The admin manages the whole catalog.

---

## Phase 5: User Story 3 - Each person only sees what they are entitled to (Priority: P1)

**Goal**: `/graph` filtered on the server, the single source of everything the person explores.

**Independent Test**: the quickstart access matrix (SC-002) via integration test, plus scenario 8.

### Tests for User Story 3 ⚠️

- [x] T042 [P] [US3] Unit test `backend/node/src/modules/access/access.service.test.ts` for `canView`:
  - access_all;
  - named person;
  - member of an access group;
  - none → false;
  - `in_review` → false;
  - archived → false;
  - double path counts once.
- [x] T043 [P] [US3] Integration test `backend/node/src/modules/graph/graph.routes.integration.test.ts`:
  - for each of the 6 seed users, the set of `solutions[].id` is equal to the quickstart matrix;
  - `relatedIds` never points to an invisible solution and is symmetric;
  - `groups[].solutionCount` counts only visible ones;
  - an archived/in_review solution never appears.

### Implementation for User Story 3

- [x] T044 [US3] `backend/node/src/modules/access/`:
  - `access.service.ts` with pure `canView`;
  - `access.repository.ts` with the Prisma `where` for visible solutions (`status = published`, `archivedAt = null`, `OR[accessAll, accessUsers some viewer, accessGroups some groupId in viewer.groupIds]`);
  - reused by graph and users.
- [x] T045 [US3] `backend/node/src/modules/graph/`: repository, service (builds groups with `solutionCount`, solutions with `groupIds` and symmetric `relatedIds` filtered to visible ones), controller and route `GET /api/v1/graph`; register it in `app.ts`.

**Checkpoint**: the P1 MVP is complete. Access is guaranteed by the server and covered by tests.

---

## Phase 6: User Story 4 - Exploring in the globe (Priority: P2)

**Goal**: interactive globe, search, breadcrumb and detail panel, as in v5.

**Independent Test**: quickstart scenarios 9, 10 and 13.

### Tests for User Story 4 ⚠️

- [x] T046 [P] [US4] Tests in `frontend/react/src/features/explore/lib/`:
  - `layout.test.ts`:
    - Fibonacci for groups at radius 0.62;
    - solutions at radius 1;
    - deterministic by id hash;
    - minimum separation after repulsion;
  - `projection.test.ts` (perspective d=3.2, rotation yaw/pitch, depth);
  - `labels.test.ts` (collision priority focus > hover > groups > solutions > depth);
  - `search.test.ts` (max. 7, case-insensitive, with type);
  - `neighbors.test.ts` (neighboring orbits, related "via <grupo>").

### Implementation for User Story 4

- [x] T047 [P] [US4] Pure functions in `frontend/react/src/features/explore/lib/`:
  - `hash.ts`, `vector.ts`;
  - `layout.ts` (buildGraph: core, group, sol nodes; sol→group and sol↔sol edges);
  - `projection.ts`;
  - `labels.ts`;
  - `search.ts`;
  - `neighbors.ts`.
- [x] T048 [US4] Hook `frontend/react/src/features/explore/hooks/useGraph.ts` (loads `/api/v1/graph`, loading/empty/error states).
- [x] T049 [US4] Hook `frontend/react/src/features/explore/hooks/useGlobe.ts`:
  - `requestAnimationFrame` with cleanup;
  - drag rotation with inertia, wheel zoom 0.7–1.8, slow auto-rotation without focus;
  - focus with ease 0.07/frame and zoom 1.08 (group) / 1.18 (solution);
  - wave ring and pulse cascade every ~3.4s;
  - pulses at rest;
  - hover dims the rest to ~0.25;
  - `motion` 0 when `prefers-reduced-motion`.
- [x] T050 [US4] `frontend/react/src/features/explore/components/GlobeCanvas.tsx` (globe canvas + particle field), drawing as in the README:
  - sphere with radial gradient and 30° mesh;
  - inner sphere;
  - two dotted orbits with satellites;
  - pulsing NÚCLEO;
  - node shapes: theme = outlined circle #FF5510, directorate = diamond #FFBE9F, solution = filled point #FF7334;
  - lifted arcs 0.08 / 0.18 dashed;
  - labels with a 72% black box.
- [x] T051 [P] [US4] `Breadcrumb.tsx`, `GlobeSearch.tsx` (260px, dropdown of 7 with TEMA/DIRETORIA/SOLUÇÃO, keyboard-accessible) and `GlobeLegend.tsx` in `frontend/react/src/features/explore/components/`.
- [x] T052 [US4] `frontend/react/src/features/explore/components/DetailPanel.tsx`:
  - hidden by default;
  - `clamp(300px, 32%, 380px)`, 260ms slide;
  - opens on hover of the 40px icon and closes 250ms after the mouse leaves;
  - clicking the icon pins/unpins, X closes;
  - content for Núcleo / group / solution as in User Story 4;
  - "Abrir solução ↗" as `<a target="_blank" rel="noopener noreferrer">`;
  - message when there are no visible solutions.
- [x] T053 [US4] `frontend/react/src/features/explore/components/ExploreView.tsx`:
  - path state (`["core", …]`);
  - Esc goes back one level;
  - clicking a solution pins the panel;
  - thin page `frontend/react/src/app/ExplorePage.tsx` (full area, 100vh − 64px).

**Checkpoint**: exploration works on top of the filtered `/graph`.

---

## Phase 7: User Story 5 - Admin views users (Priority: P2)

**Goal**: read-only table with groups and accessible solutions.

**Independent Test**: quickstart scenario 12. The "Acessa" numbers match the access matrix.

- [x] T054 [P] [US5] Update `backend/node/src/modules/users/users.service.test.ts` and `users.routes.integration.test.ts`:
  - only `GET` paginated, with `groups` and `accessibleSolutionCount` matching the matrix;
  - `POST/PATCH/DELETE` return 404;
  - 403 non-admin.
- [x] T055 [US5] Make `backend/node/src/modules/users/` read-only:
  - remove create/update/delete from `users.routes.ts`, `users.controller.ts`, `users.service.ts`, `users.schemas.ts` and `users.repository.ts`;
  - list with groups and a count via `access.repository`;
  - `requireAdmin`.
- [x] T056 [US5] `frontend/react/src/features/users-admin/` (hook `useUsers.ts`, component `UsersTable.tsx` with avatar initials, e-mail, group tags, "Acessa"):
  - "Lista herdada do Radar" banner with the README copy;
  - no create button;
  - page `frontend/react/src/app/UsersPage.tsx`.

---

## Phase 8: User Story 6 - Policies (Priority: P3)

**Goal**: Policies screen with 3 tabs and fixed content.

**Independent Test**: quickstart scenario 11.

- [x] T057 [P] [US6] Extract the full Policies text from the v5 prototype (`<script type="__bundler/template">` from `~/Downloads/Hub de Inovacao v5.html`) into `frontend/react/src/features/policies/content.ts`:
  - typed;
  - tabs 01 Criar, 02 Publicar, 03 Governança;
  - steps, checklist, flow, cycle, roles and archiving rule.
- [x] T058 [US6] `frontend/react/src/features/policies/components/PoliciesView.tsx`:
  - POLÍTICAS eyebrow;
  - title;
  - "Conteúdo de exemplo — substituir pela política oficial aprovada." notice;
  - accessible tabs;
  - page `frontend/react/src/app/PoliciesPage.tsx`;
  - **Políticas** button in the header active on this route.

---

## Phase 9: Polish & Cross-Cutting Concerns

- [x] T059 [P] Update `README.md` at the root with "Hub de Inovação: como rodar" (up, seed, "Entrar como") and the authentication gap.
- [x] T060 [P] Run `scripts/sync-templates.sh` if `backend/node` or Docker files changed (templates are generated, never edited by hand).
- [x] T061 Lint, types and tests green:
  - API: `npm run lint`, `npm test`, `npm run test:integration`;
  - web: `npm run lint`, `npm run typecheck`, `npm test`.
- [x] T062 Close the `component-development` and `styling-tailwind` checklists (tokens, `cn`, primitives, loading/empty/error states, focus, labels) and the LGPD checklist in `DATABASE.md`.
- [x] T063 Run [quickstart.md](quickstart.md) end to end:
  - `docker compose ps` healthy;
  - seed applied;
  - scenarios 1–13 checked in the browser;
  - URL http://localhost:3000 reported.

---

## Dependencies & Execution Order

- **Setup (1)** → **Foundational (2)** → stories.
- **US1** and **US2** depend only on Phase 2 (the seed already provides groups for US1). They can run in parallel.
- **US3** depends on Phase 2. In the UI it only shows up through US4, but it is complete and tested by the API.
- **US4** depends on US3 (`/graph`).
- **US5** depends on US3 (`access.repository`, for the "Acessa" count).
- **US6** depends only on Phase 2 (shell).
- **Polish** at the end.

Inside each story: tests (fail) → schemas → repository → service → routes → hooks → components → page.

## Parallel Opportunities

- Setup: T003, T004, T005, T007 together.
- Foundational: T011, T013, T015, T016, T018 together after T008–T010.
- US1: T020, T021, T022 (tests) together; then T023, T024, T028.
- US2: T033, T034, T035 together.
- US1 ∥ US2 ∥ US6 after Phase 2.
- US4: T046, T047, T051 together.

## Implementation Strategy

1. **MVP (P1)**: Phases 1–5.
   - Stop and validate: admin creates/edits/archives, manages groups, and the access matrix passes.
2. **+US4**: globe, the main experience.
3. **+US5, +US6**: users and policies.
4. **Polish** and the full quickstart.

Each checkpoint leaves the environment healthy and testable at http://localhost:3000.
