# API Contract: Excluir solução

Adds to [contracts/api.md](../../001-hub-inovacao/contracts/api.md).

`DELETE /api/v1/solutions/:id` (admin)

| Status | When |
|---|---|
| 204 | Deleted |
| 404 `SOLUTION_NOT_FOUND` | Missing or already deleted |
| 403 `FORBIDDEN` | Not an admin |
| 401 `UNAUTHENTICATED` | No identification |

After a 204:
- `GET/PUT /solutions/:id`, `POST /solutions/:id/archive|restore` and `DELETE` again respond 404.
- `GET /solutions`, `GET /graph`, `GET /groups` and `GET /users` no longer count or show the solution.
