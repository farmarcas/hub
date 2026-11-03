---

description: "Task list for the Núcleo panel with a globe preview"
---

# Tasks: Painel do Núcleo com prévia no globo

**Input**: [plan.md](plan.md), [spec.md](spec.md), [referencia.png](referencia.png)

**Tests**: Vitest on the pure functions + check in the browser against the reference image.

## Format: `[ID] [P?] [Story] Description`

---

## Phase 1: User Story 1 - See what exists in each theme or directorate (Priority: P1) 🎯

**Goal**: cards in the Núcleo panel; hover/focus rotates and lights up the group in the globe; clicking enters the group.

**Independent Test**: with the Núcleo panel open, hover "Marketing" → the globe rotates to Marketing and lights up its solutions; the number on the card equals what lights up; moving the mouse away goes back to free spin.

### Tests ⚠️ write first

- [x] T001 [P] [US1] `frontend/react/src/features/explore/lib/text.test.ts`: `solutionCountLabel(0)` = "0 soluções", `(1)` = "1 solução", `(6)` = "6 soluções".
- [x] T002 [P] [US1] `frontend/react/src/features/explore/lib/preview.test.ts`: `highlightSet(layout, hoverId, previewId)` returns the preview group + its neighbors (solutions) when there is no hover; a mouse hover over the globe takes priority over the panel preview; with neither, an empty set.

### Implementation

- [x] T003 [P] [US1] `frontend/react/src/features/explore/lib/text.ts` with `solutionCountLabel`. Use it in `DetailPanel` (group panel "Soluções em órbita" keeps the number; Núcleo cards use the text).
- [x] T004 [P] [US1] `frontend/react/src/features/explore/lib/preview.ts` with `highlightSet` (pure, used by `useGlobe`).
- [x] T005 [US1] `frontend/react/src/features/explore/hooks/useGlobe.ts`:
  - accepts `previewId: string | null`;
  - effect on `previewId`:
    - with a value: `target = focusAngles(direction, yaw)`;
    - `null`: restore the target of the current focus (Núcleo → `null`, free spin);
  - with reduced motion, apply the angle straight away;
  - the frame highlight uses `highlightSet(layout, hoverId, previewId)`;
  - auto-rotation stops while there is a preview;
  - dragging cancels the target as it does today.
- [x] T006 [P] [US1] `frontend/react/src/features/explore/components/GroupCard.tsx`:
  - `<button type="button">` with:
    - icon (circle `border-primary` for Tema, diamond `border-accent-soft` for Diretoria);
    - name (`font-medium`);
    - description `truncate` (when present);
    - `solutionCountLabel` on the right;
  - events:
    - `onMouseEnter`/`onFocus` → `onPreview(id)`;
    - `onMouseLeave`/`onBlur` → `onPreview(null)`;
    - `onClick` → `onSelect(id)`;
  - styling:
    - base: `rounded-lg border border-border-subtle bg-background/40`;
    - highlighted (`isPreviewing`): `border-primary-border bg-primary-wash`;
    - visible focus.
- [x] T007 [US1] `frontend/react/src/features/explore/components/DetailPanel.tsx` → `CoreContent`:
  - "NÚCLEO" eyebrow;
  - title "Toda a inovação Farmarcas, em órbita.";
  - text "Temas e diretorias formam o núcleo; as soluções vivem na superfície. Gire o globo e clique para seguir as conexões.";
  - "TEMAS E DIRETORIAS" section (gray, `text-subtle-foreground`) with the list of `GroupCard`;
  - clear the preview when the list loses the mouse;
  - new props `previewId` and `onPreview`.
- [x] T008 [US1] `frontend/react/src/features/explore/components/ExploreView.tsx`:
  - `previewId` state, passed to `DetailPanel` and to `GlobeCanvas` → `useGlobe`;
  - clear the preview when the focus leaves the Núcleo (click on a card or on the globe) and when the panel closes.

---

## Phase 2: Polish

- [x] T009 Lint, types and tests of the web app green (`npm run lint`, `npm run typecheck`, `npm test`).
- [x] T010 In the browser (as a person who can see solutions), compare with `referencia.png`:
  - texts;
  - cards with icon/description/count;
  - hovering Marketing rotates and lights up its solutions;
  - leaving goes back to free spin;
  - clicking enters the group;
  - keyboard (Tab + Enter);
  - `docker compose ps` healthy.

## Dependencies
- T001–T002 → T003–T004 → T005 → T006–T008 → T009–T010.
