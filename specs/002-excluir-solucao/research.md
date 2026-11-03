# Research: Excluir solução

All technical decisions are the agent's (constitution, principle VIII). No open items.

## R1. Soft delete of the solution
- **Decision**: new column `solutions.deleted_at timestamptz NULL`.
  - Deleting means `deleted_at = now()`.
  - In the same transaction, the link rows (`solution_groups`, `solution_access_groups`, `solution_access_users`, `solution_related` on both sides) are physically removed.
- **Rationale**:
  - `DATABASE.md` requires soft delete in domain tables (no physical `DELETE`). That also keeps the record for audit (FR-006).
  - Removing the links follows the same choice as group deletion (research R6 of spec 001): a dead link with no filter would leak access.
- **Alternatives considered**:
  - Physical `DELETE`: rejected, because it breaks the project's database rule and loses the audit trail.
  - Reusing `archived_at`: rejected, because archiving is reversible and visible in the list; deleting is not.

## R2. Every read ignores deleted solutions
- **Decision**:
  - A shared constant `notDeleted = { deletedAt: null }`, applied everywhere a solution is read.
  - Places: list, counts, detail, reference check (related), graph (`visibleSolutionsWhere`), "Acessa" count in Usuários, connected solutions in Grupos, and group deletion impact.
- **Rationale**:
  - `access_all = true` stays on the deleted row. Without the filter, it would come back in the globe.
  - The integration test covers exactly that.

## R3. Contract
- **Decision**: `DELETE /api/v1/solutions/:id`, admin only.
  - Responses: 204 when deleted; 404 `SOLUTION_NOT_FOUND` when missing or already deleted; 403 for a non-admin.
  - It follows the REST pattern of the `node-api-development` skill (DELETE → 204).

## R4. Confirmation on screen
- **Decision**:
  - A `DeleteSolutionDialog` that reuses the `Dialog` primitive (native, Escape, focus).
  - The related solutions come from the list item itself (`related`), with no extra call.
  - Confirming calls the API and reloads the list.
- **Rationale**: the list data already has what the warning shows, and a single list reload updates the counts.
