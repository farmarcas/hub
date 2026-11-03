---

description: "Task list for Explorar on mobile as a list"
---

# Tasks: Explorar no celular em lista

**Input**: [plan.md](plan.md), [spec.md](spec.md)

**Tests**: cross-browser test (Playwright) extended for mobile; Vitest unit tests keep passing.

## Format: `[ID] [P?] [Story] Description`

---

## Phase 1: User Story 1 - Browse solutions on mobile through a list (Priority: P1) 🎯

**Goal**: below 768 px, the Explorar screen is a full-width list (Núcleo → group → solution), with no globe.

**Independent Test**:
- on mobile: no globe;
- Núcleo → Marketing → Radar Marketing → "Abrir solução" works;
- the search takes you straight to the solution;
- from tablet up, nothing changes.

### Implementation

- [x] T001 [P] [US1] Create `frontend/react/src/features/explore/hooks/useMediaQuery.ts`:
  - initial state comes from `window.matchMedia(query).matches`;
  - a `change` listener with cleanup.

  In `hooks/useGlobe.ts`, `usePrefersReducedMotion` uses `useMediaQuery("(prefers-reduced-motion: reduce)")`.
- [x] T002 [US1] Create `frontend/react/src/features/explore/components/ExploreDetails.tsx`:
  - move `LinkList`, `LinkItem`, `CoreContent`, `GroupContent` and `SolutionContent` out of `DetailPanel.tsx` without changing texts or behavior;
  - props: `graph`, `focusId`, `onSelect`, `previewId?`, `onPreview?`.
- [x] T003 [US1] `frontend/react/src/features/explore/components/DetailPanel.tsx`: keep only the pin button, the `aside` and the X, rendering `ExploreDetails` inside.
- [x] T004 [P] [US1] `frontend/react/src/features/explore/components/GroupCard.tsx`: make `onPreview` optional. Without it there are no hover/focus handlers and the highlight does not show.
- [x] T005 [US1] Create `frontend/react/src/features/explore/components/ExploreList.tsx`:
  - a column with vertical scroll;
  - at the top, `Breadcrumb` + `GlobeSearch` (full width, search below the path);
  - below, `ExploreDetails` (no preview) with `px-4 pb-8` padding.
- [x] T006 [US1] `frontend/react/src/features/explore/components/ExploreView.tsx`:
  - `isWide = useMediaQuery("(min-width: 768px)")`;
  - when `isWide`, the current layout (globe + panel + legend);
  - otherwise, `ExploreList`, with the same `path/focusId/goTo` from `useExplorePath` (the path survives the switch);
  - do not mount `GlobeCanvas` on mobile.
- [x] T007 [P] [US1] In `frontend/react/src/app/ExplorePage.tsx`, keep the full area on desktop and allow the list to scroll on mobile (`min-h-0`, `overflow-y-auto` on the list itself).

---

## Phase 2: Polish

- [x] T008 Lint, types and tests of the web app green (`npm run lint`, `npm run typecheck`, `npm test`).
- [x] T009 Extend the cross-browser test (scratchpad) for mobile:
  - no `canvas`;
  - cards present;
  - tapping Marketing → Radar Marketing shows "Abrir solução";
  - the path "Núcleo / Marketing / Radar Marketing";
  - the search "radar" → chosen solution.

  Tablet/notebook/monitor still with the globe drawn. Run it in Chromium, Firefox and WebKit, with 0 errors and 0 overflow.
- [x] T010 Mark tasks as done, run `scripts/check-repo.sh`, and confirm `docker compose ps` healthy.

## Dependencies
- T001 → T002 → T003/T004 → T005 → T006/T007 → T008–T010.
