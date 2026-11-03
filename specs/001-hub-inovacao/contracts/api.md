# API Contract — Hub de Inovação (v1)

## Common conventions

- **Format:**
  - Prefix `/api/v1`.
  - JSON in camelCase.
  - Dates in ISO 8601 UTC.
  - Error format: `{ "error": { "code", "message", "details": [] } }`.
- **Identification (MVP):**
  - Every `/api/v1/*` request requires the `x-hub-user: <userId>` header (research R3).
  - Missing or unknown header → `401 UNAUTHENTICATED`.
  - A non-admin on an admin route → `403 FORBIDDEN`.
- **Pagination:**
  - Lists accept `?page=1&pageSize=20` (max. 100).
  - Response shape: `{ data, meta: { page, pageSize, total } }`.
- **Value labels:**
  - `type`: `"Tema" | "Diretoria"`.
  - `status`: `"Em avaliação" | "Publicada"`.

## Everyone

### `GET /api/v1/me`
200 → `{ id, name, email, isAdmin }`

### `GET /api/v1/identities`
- **Purpose:** list for the "Entrar como" selector.
- **Header:** the only route that does not require `x-hub-user`.
- **Availability:** only exists with `AUTH_MODE=mock`.
- **Response:** 200 → `{ data: [{ id, name, email, isAdmin }] }`

### `GET /api/v1/graph`
Graph already filtered for the requester (FR-015/016).

200 →
```json
{
  "groups": [{ "id", "type", "name", "description", "solutionCount" }],
  "solutions": [{
    "id", "name", "url", "objective", "description", "category",
    "groupIds": ["..."],
    "relatedIds": ["..."]
  }]
}
```

Contents:
- `groups` lists all active groups. `solutionCount` counts only the visible solutions.
- `solutions` contains only visible solutions.
- `relatedIds` is already symmetric and only points to visible solutions.

The frontend does search, panel and breadcrumb on top of this payload, with no other call.

## Admin

### Solutions

`GET /api/v1/solutions?page&pageSize&status&archived`
- **Response:** 200 → paginated `data`, plus `meta.counts: { published, inReview, archived }`.
- **Item:**
  - `{ id, name, category: {id,name}, status, archived, groups: [{id,type,name}] }`
  - `access: { all, groups: [{id,name}], users: [{id,name}] }`
  - `related: [{id,name}]`, `url`, `objective`, `description`

`GET /api/v1/solutions/:id` → 200 item | 404 `SOLUTION_NOT_FOUND`

`POST` and `PUT` also return `400 SOLUTION_SELF_RELATION` when a solution is related to itself.

`POST /api/v1/solutions` → 201 item

Body:
```json
{
  "name": "Radar CRM",
  "url": "https://crm.farmarcas.internal",
  "objective": "…",
  "description": "…",
  "categoryId": "uuid",
  "status": "Publicada",
  "groupIds": ["uuid"],
  "relatedIds": ["uuid"],
  "access": { "all": false, "groupIds": ["uuid"], "userIds": [] }
}
```

Errors:
- `400 VALIDATION_ERROR`: fields, https.
- `400 SOLUTION_REQUIRES_GROUP`.
- `400 SOLUTION_REQUIRES_ACCESS`.
- `400 REFERENCE_NOT_FOUND`.

`PUT /api/v1/solutions/:id`
- Same body and errors as `POST`, plus 404.
- Response: 200.

`POST /api/v1/solutions/:id/archive` and `POST /api/v1/solutions/:id/restore` → 200 item | 404

### Categories

- `GET /api/v1/categories` → 200 `{ data: [{ id, name }] }`. Bounded list, unpaginated, ordered by `pt_br`.
- `POST /api/v1/categories` with body `{ name }`:
  - 201 when created;
  - 200 when it already existed (match ignores case and spaces).

### Groups

`GET /api/v1/groups?type=Tema|Diretoria&page&pageSize`
- 200 paginated.
- Item: `{ id, type, name, description, solutionCount, memberCount, solutions: [{id,name}], members: [{id,name,email}] }`

`POST /api/v1/groups` body `{ type, name, description? }`
- 201.
- `400 VALIDATION_ERROR` (empty name).
- `409 GROUP_NAME_TAKEN`.

`PUT /api/v1/groups/:id` → same body, 200 | 404 | 409

`GET /api/v1/groups/:id/deletion-impact`
- 200 → `{ solutions: [{id,name}], members: [{id,name}], orphanedByGroup: [{id,name}], orphanedByAccess: [{id,name}] }`

`DELETE /api/v1/groups/:id` → 204 | 404

`POST /api/v1/groups/:id/members` body `{ userId }`
- 201.
- 404 for a missing group or user.
- 409 `ALREADY_MEMBER`.

`DELETE /api/v1/groups/:id/members/:userId` → 204 | 404

### Users (read-only)

`GET /api/v1/users?page&pageSize`
- 200 paginated.
- Item: `{ id, name, email, isAdmin, groups: [{id,name,type}], accessibleSolutionCount }`

The previous `POST/PATCH/DELETE /users` routes of the skeleton are removed (FR-014).

## Health
`GET /health`, `GET /health/ready`. Unchanged.
