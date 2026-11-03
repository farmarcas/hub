# Implementation Plan: Excluir solução

**Branch**: `claude/nova-aplicacao-cdc5de` | **Date**: 2026-10-16 | **Spec**: [spec.md](spec.md)

## Summary
Add **Excluir** to the solutions list, with confirmation.
- **Database:** the solution gets a deletion date (soft delete), and its links are removed in the same transaction.
- **API:** gains `DELETE /api/v1/solutions/:id`.
- **Reads:** every read starts ignoring deleted solutions.
- **Screen:** gains the button and the confirmation dialog.

## For the reader
- **Excluir.** Chosen: the deleted solution stays stored with the deletion date, but disappears from every screen and from everyone. Why: it is the project's database rule, and it lets us know later what was removed.
- **Confirmation.** Chosen: the confirmation lists the related solutions that will lose the link. Why: it avoids surprises in the globe after deleting.

## Technical Context
- **Stack**: unchanged (Node 22 + TS + Express + Prisma; React + Vite + Tailwind; Postgres 16; Docker Compose).
- **Database**: 1 Prisma migration (`deleted_at` column + recreated partial index). See [data-model.md](data-model.md).
- **Testing**:
  - Vitest unit test on `solutions.service` (`remove`).
  - Supertest integration: DELETE 204/404/403, plus disappearance from `/solutions`, `/graph`, `/users`, `/groups`.
- **Scale**: unchanged.

## Constitution Check
| Principle | Status |
|---|---|
| I. Spec Kit | ✅ spec approved; plan → tasks → implement with approval |
| II. Docker | ✅ migration applied by the API container on startup |
| III. Stack | ✅ no new library |
| IV. Database via migration | ✅ new migration; none of the applied ones is edited |
| V. Protected data | ✅ soft delete; no `down -v` / `migrate reset` |
| VI–VIII | ✅ plain language; technical decisions made by the agent |

## Project Structure (files touched)
```text
backend/node/prisma/schema.prisma                       # Solution.deletedAt
backend/node/prisma/migrations/<ts>_solution_soft_delete/
backend/node/src/modules/solutions/                     # service.remove, repository.softDelete + filters, DELETE route
backend/node/src/modules/access/access.repository.ts    # visibleSolutionsWhere: deletedAt null
backend/node/src/modules/graph|groups|users/*.repository.ts  # deletedAt null filter
frontend/react/src/features/solutions-admin/            # Excluir button + DeleteSolutionDialog + hook
```

## Complexity Tracking
No violations.
