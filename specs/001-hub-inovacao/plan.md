# Implementation Plan: Hub de Inovação Farmarcas (MVP)

**Branch**: `claude/nova-aplicacao-cdc5de` | **Date**: 2026-10-15 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/001-hub-inovacao/spec.md`, the v5 design spec (README handoff) and the "Hub de Inovacao v5" prototype.

## Summary

Internal catalog of Farmarcas solutions, explored as a 3D globe, with access control per company / group / person, applied on the server, and admin screens for solutions, groups and users.

- **What we reuse:** the project's skeleton, i.e. the Node + Prisma API, the React frontend and Docker Compose.
- **What the database gains:** the tables for groups, categories, solutions and their links.
- **What the frontend changes:**
  - becomes TypeScript + Tailwind 4 with the dark visual identity of the prototype;
  - the globe is drawn in a 2D canvas with 3D projection.
- **How people are identified:** simulated identification ("Entrar como") until the Radar integration exists.

## For the reader

- **Storage.** Chosen: keep solutions, groups and people in the project database, in separate tables linked to each other. Why: this keeps "who sees what" in one place, protected on the server, and nothing is lost when the computer restarts.
- **Sign-in.** Chosen: while the link with the Radar does not exist, you pick "Entrar como" one of the 6 sample people. Why: this lets us test what each person sees without inventing a login that will be replaced.
- **Globe.** Chosen: draw the globe the same way the prototype does. Why: it keeps the look you approved and stays light for any notebook.
- **Policies.** Chosen: the Policies text sits fixed in the screen, copied from the prototype. Why: no one needs to edit it in the MVP, and it can become editable later.

## Technical Context

- **Language/Version**:
  - API: TypeScript 6 on Node 22 (ESM, strict).
  - Web: TypeScript 6 + React 18.
- **Primary Dependencies**:
  - API: Express 5, Zod 4, Prisma 7 (`@prisma/adapter-pg`), Pino.
  - Web: Vite 5, React Router, Tailwind 4 (`@tailwindcss/vite`), `clsx`, `tailwind-merge`, `lucide-react`, `@fontsource/rubik`.
- **Storage**: PostgreSQL 16 (Compose `postgres` service). Model in [data-model.md](data-model.md).
- **Testing**:
  - API: Vitest unit tests on services, plus Vitest + Supertest integration against `<db>_test`.
  - Web: Vitest on pure functions (globe, summaries).
- **Target Platform**: Desktop browser (Chrome/Edge/Safari, current versions), local environment via Docker.
- **Project Type**: Web application (frontend + API + database).
- **Performance Goals**:
  - Globe at ~60 fps with ≤ 100 nodes on a common notebook.
  - Admin lists respond in < 300 ms locally.
- **Constraints**:
  - Access filter always on the server.
  - `prefers-reduced-motion` respected.
  - Ports only on `127.0.0.1`.
  - No secrets in git.
- **Scale/Scope**:
  - Dozens of solutions, ~10–30 groups, hundreds of users (Radar).
  - 6 screens: Explorar, Políticas, Soluções (list + form), Grupos, Usuários.

## Constitution Check

| Principle | Status |
|---|---|
| I. Spec Kit required | ✅ spec approved; this plan precedes tasks/implement |
| II. Everything runs in Docker | ✅ uses the existing Compose. New variable `AUTH_MODE` in `.env.example`; seed and tests via `docker compose exec` |
| III. Default stack | ✅ Postgres 16, Node 22 + TS + Prisma, React + Vite + Tailwind. Extra libs (router, lucide, fontsource) are support libraries within the stack, justified in research R2 |
| IV. Database only changes via migration | ✅ new Prisma migration (`hub_catalog`) with collation, partial indexes and CHECKs edited by hand. Seed is DML only |
| V. Protected local data | ✅ no `down -v`/`migrate reset`. The seed is idempotent |
| VI. Plain language | ✅ "For the reader" section |
| VII. Start small | ✅ delivery in slices: P1 (admin + access) works and can be verified before the globe (P2) and Policies (P3) |
| VIII. Agent decides the technical side | ✅ no technical question to the person. Authentication gap stated (R3) |

**Gate after design**: passes. Only open point: real authentication is a known gap in `AGENTS.md`. The MVP uses simulated identification, explicit and blocked outside `AUTH_MODE=mock`.

## Project Structure

### Documentation (this feature)

```text
specs/001-hub-inovacao/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/api.md
├── checklists/requirements.md
└── tasks.md            # next step (/speckit-tasks)
```

### Source Code (repository root)

```text
backend/node/
├── prisma/
│   ├── schema.prisma                 # + is_admin, groups, categories, solutions and links
│   └── migrations/<ts>_hub_catalog/  # SQL edited by hand: pt_br, partial indexes, CHECKs
├── seeds/20261015120000_hub_prototipo.sql
└── src/
    ├── config/env.ts                 # + AUTH_MODE
    ├── shared/middlewares/
    │   ├── identify.ts               # x-hub-user → req.viewer (mock)
    │   └── require-admin.ts
    ├── shared/errors/                # + unauthorized, forbidden
    └── modules/
        ├── identities/               # GET /identities (mock only)
        ├── me/
        ├── access/                   # canView + visibility query (shared)
        ├── graph/                    # GET /graph
        ├── solutions/                # CRUD + archive/restore
        ├── categories/
        ├── groups/                   # CRUD + members + deletion-impact
        └── users/                    # read-only (remove create/update/delete)

frontend/react/
├── index.html
├── vite.config.ts
├── tsconfig.json
└── src/
    ├── main.tsx
    ├── app/                          # thin routes: ExplorePage, PoliciesPage, Solutions*, GroupsPage, UsersPage
    ├── styles/globals.css            # @theme with the v5 tokens (dark, Farmarcas orange, Rubik)
    ├── lib/                          # cn, api client (injects x-hub-user)
    ├── components/
    │   ├── ui/                       # Button, TextField, TextArea, Select, Chip, StatusBadge, Toggle, Table, Dialog, Banner
    │   └── layout/                   # AppShell, Rail, Header
    ├── features/
    │   ├── session/                  # useSession, "Entrar como" selector
    │   ├── explore/                  # globe: lib/ (projection, layout, labels), hooks/useGlobe, Breadcrumb, Search, DetailPanel, Legend
    │   ├── policies/                 # content.ts + tabs
    │   ├── solutions-admin/          # list, form, validation
    │   ├── groups-admin/
    │   └── users-admin/
    └── types/
```

**Structure Decision**: web application with separate `backend/node` and `frontend/react`, as the repository already uses and the Compose expects. The frontend follows the `component-development` folder tree. The API follows one module per domain, as in `node-api-development`.

## Delivery order (slices)

1. **Foundation**: migration, seed, identification + `/me`, `/identities`.
2. **P1 Admin**:
   - API: solutions, categories, groups, members, users.
   - Admin screens, with the AppShell and the visual tokens.
3. **P1 Access**: `/graph` with the filter, plus integration tests of the matrix in the quickstart.
4. **P2 Exploration**: globe, search, breadcrumb, panel.
5. **P3 Policies**.
6. **Verification**: lint, types, tests, environment `healthy`, quickstart scenarios.

## Complexity Tracking

No violations to justify.
