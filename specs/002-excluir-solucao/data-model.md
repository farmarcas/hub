# Data Model: Excluir solução

Changes to the [spec 001 model](../001-hub-inovacao/data-model.md).

## solutions (gains a column)
| Column | Type | Rule |
|---|---|---|
| deleted_at | timestamptz(3) NULL | null = exists. Filled in = deleted (does not show anywhere) |

- Index: `solutions_visible_idx` is recreated as `(status) WHERE archived_at IS NULL AND deleted_at IS NULL`.
- Migration: `<ts>_solution_soft_delete` (Prisma Migrate, partial index edited by hand).

## State transitions
- Active ⇄ archived (unchanged).
- Active or archived → **deleted**: final through the screen.

When a solution is deleted, in a single transaction:
1. `deleted_at = now()`;
2. its links in `solution_groups`, `solution_access_groups`, `solution_access_users` and `solution_related` (as A or B) are removed.

Only rows **of the deleted solution** are touched. Related solutions, groups, people and categories are never deleted or updated. The `solution_related` foreign keys keep `ON DELETE CASCADE` only for the link row, and there is no physical `DELETE` on `solutions`.

## Visibility rule (update)
`canView` keeps the same rule. The query also requires `deleted_at IS NULL`.
