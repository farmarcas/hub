---

description: "Task list for deleting a solution"
---

# Tasks: Excluir solução

**Input**: [plan.md](plan.md), [spec.md](spec.md), [research.md](research.md), [data-model.md](data-model.md), [contracts/api.md](contracts/api.md), [quickstart.md](quickstart.md)

**Tests**: included (TDD in the service, Supertest on the route), per the `node-api-development` and `node-unit-testing` skills.

## Format: `[ID] [P?] [Story] Description`

---

## Phase 1: Foundational (database)

- [x] T001 Add `deletedAt DateTime? @map("deleted_at") @db.Timestamptz(3)` to `Solution` in `backend/node/prisma/schema.prisma`.
- [x] T002 Generate the migration `npx prisma migrate dev --create-only --name solution_soft_delete` inside the container, then edit by hand `backend/node/prisma/migrations/<ts>_solution_soft_delete/migration.sql`:
  - `DROP INDEX "solutions_visible_idx"`;
  - `CREATE INDEX "solutions_visible_idx" ON "solutions" ("status") WHERE "archived_at" IS NULL AND "deleted_at" IS NULL`.

  Apply with `npx prisma migrate deploy` and regenerate the client.

**Checkpoint**: migration applied, the 11 sample solutions intact (`deleted_at` null).

---

## Phase 2: User Story 1 - Admin deletes a solution (Priority: P1) 🎯

**Goal**: Excluir button with confirmation. Only the chosen solution disappears; the related ones stay, only without the link.

**Independent Test**: [quickstart.md](quickstart.md) scenarios 1–7, plus the automated tests below.

### Tests ⚠️ write first, they must fail

- [x] T003 [P] [US1] In `backend/node/src/modules/solutions/solutions.service.test.ts`, add tests for `remove`:
  - calls `repo.softDelete(id)` for an existing solution;
  - `SOLUTION_NOT_FOUND` (404) without calling `softDelete` for a missing or already deleted one.
- [x] T004 [P] [US1] In `backend/node/src/modules/solutions/solutions.routes.integration.test.ts`, add tests:
  - `DELETE` on Radar CRM (s2) → 204;
  - then `GET /solutions/:id` → 404, `PUT` → 404, `DELETE` again → 404;
  - `meta.total` goes from 11 to 10;
  - **the related ones of s2 (Painel de Indicadores Comerciais s10 and Radar Marketing s4) still exist**, with the same name, status, groups and access, and no longer list s2 in `related`;
  - non-admin → 403.
- [x] T005 [P] [US1] In `backend/node/src/modules/graph/graph.routes.integration.test.ts`, add a test: after deleting s5 (`access_all`), no person sees s5; s7 (Cosmos, its related one) remains visible to whoever saw it.
- [x] T006 [P] [US1] In `backend/node/src/modules/users/users.routes.integration.test.ts` and `backend/node/src/modules/groups/groups.routes.integration.test.ts`, add tests that after a deletion:
  - "Acessa" drops by 1 for those who saw it;
  - the solution no longer appears in "Soluções conectadas" or in the group deletion impact.

### Implementation

- [x] T007 [US1] `backend/node/src/modules/solutions/solutions.service.ts`:
  - `SolutionsRepository` gains `softDelete(id)`;
  - service `remove(id)` (findOrFail → softDelete), GREEN for T003.
- [x] T008 [US1] `backend/node/src/modules/solutions/solutions.repository.ts`:
  - constant `notDeleted = { deletedAt: null }` applied to list, counts, `findById`, `setArchived` and the related-solution check in `findMissingReferences`;
  - `softDelete` in `$transaction` that removes **only** the rows of the solution itself in `solution_groups`, `solution_access_groups`, `solution_access_users` and `solution_related` (`solutionAId = id OR solutionBId = id`), then sets `deletedAt = now()`;
  - no other solution is updated.
- [x] T009 [US1] Route `DELETE /:id` → controller `remove` (204) in `backend/node/src/modules/solutions/solutions.routes.ts` and `solutions.controller.ts`, under `requireAdmin`.
- [x] T010 [P] [US1] Filter `deletedAt: null`:
  - `visibleSolutionsWhere` in `backend/node/src/modules/access/access.repository.ts`;
  - `loadAccessRules` in `backend/node/src/modules/users/users.repository.ts`;
  - `solutions` of the list and `loadImpactData` in `backend/node/src/modules/groups/groups.repository.ts`.
- [x] T011 [US1] `frontend/react/src/features/solutions-admin/hooks/useSolutionsList.ts`: `deleteSolution(id)` calls `DELETE /solutions/:id`, reloads the list and keeps the error in `actionError` if it fails.
- [x] T012 [US1] `frontend/react/src/features/solutions-admin/components/DeleteSolutionDialog.tsx` (reuses `components/ui/Dialog`). It shows:
  - title "Excluir “<nome>”?";
  - the notice that it cannot be undone from the screen;
  - when there are related solutions, the list with the text "Estas soluções continuam no Hub. Só perdem a ligação com <nome>.";
  - buttons Cancelar and **Excluir solução** (`destructive`).

  Mounted only while open.
- [x] T013 [US1] `frontend/react/src/features/solutions-admin/components/SolutionsTable.tsx`: an **Excluir** button in each row (after Arquivar/Restaurar, `aria-label="Excluir <nome>"`) that opens the dialog.

---

## Phase 3: Polish

- [x] T014 Update [contracts/api.md](../001-hub-inovacao/contracts/api.md) of spec 001 with a link to this addition, and run `scripts/sync-templates.sh` + `scripts/check-repo.sh`.
- [x] T015 Lint, types and tests green:
  - API: `npm run lint`, `npm test`, `npm run test:integration`;
  - web: `npm run lint`, `npm run typecheck`, `npm test`.
- [x] T016 Run [quickstart.md](quickstart.md) in the browser with a test solution, so the sample data stays intact, and confirm `docker compose ps` healthy.

## Dependencies & Execution Order
- T001 → T002 → the rest.
- T003–T006 (tests, in parallel) → T007–T010 (API) → T011–T013 (screen) → T014–T016.
