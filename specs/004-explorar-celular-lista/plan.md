# Implementation Plan: Explorar no celular em lista

**Branch**: `claude/nova-aplicacao-cdc5de` | **Date**: 2026-10-16 | **Spec**: [spec.md](spec.md)

## Summary
Screen-only: no API, no database.
- Below 768 px wide, `ExploreView` renders a full-width **list** instead of the globe.
- The list reuses the same panel content (Núcleo, group, solution), moved into a shared component.
- The path, search and access rule stay the same, because they come from the same state and the same `/graph`.

## For the reader
- **Chosen:** reuse in the list the exact content of the side panel. **Why:** a single text and behavior to maintain, the same on mobile and on desktop.
- **Chosen:** on mobile the globe is not even loaded. **Why:** it saves battery and makes the screen lighter.

## Technical Context
- **Stack**: unchanged (React 18 + TS + Tailwind 4). No new library.
- **Testing**:
  - Vitest on nothing new (no pure logic is added; it is only composition).
  - Cross-browser test (Playwright: Chromium, Firefox, WebKit) on mobile, tablet, notebook and monitor:
    - on mobile: no `canvas`;
    - cards present;
    - tapping navigates Núcleo → Marketing → Radar Marketing;
    - search takes you to the solution;
    - from tablet up: the globe is still drawn.

## Constitution Check
| Principle | Status |
|---|---|
| I. Spec Kit | ✅ spec approved; plan → tasks → implement |
| II–IV | ✅ no change to the environment, stack or database |
| V–VIII | ✅ nothing destructive; plain language; technical decisions made by the agent |

## Design
1. **`useMediaQuery(query)`** (`features/explore/hooks/useMediaQuery.ts`):
   - initial state read from `matchMedia`;
   - listens to `change` with cleanup;
   - `isWide = useMediaQuery("(min-width: 768px)")`, the Tailwind `md`.
   - The existing `usePrefersReducedMotion` in `useGlobe` starts using it.
2. **`ExploreDetails`** (`features/explore/components/ExploreDetails.tsx`):
   - takes `CoreContent`, `GroupContent`, `SolutionContent` and `LinkList/LinkItem` out of `DetailPanel` without changing the behavior;
   - props: `graph`, `focusId`, `onSelect`, and optional `previewId`/`onPreview` (on desktop only);
   - `DetailPanel` keeps only the aside, the pin button and the X, and renders `ExploreDetails`.
3. **`GroupCard`**: `onPreview` optional. Without it (mobile) there are no hover/focus handlers, and a tap enters the group.
4. **`ExploreList`** (`features/explore/components/ExploreList.tsx`):
   - a column with a scroll area;
   - at the top, the path + search (full width);
   - below, `ExploreDetails` with mobile padding;
   - comfortable touch targets (cards ≥ 48 px tall, as they already are).
5. **`ExploreView`/`Explorer`**:
   - `isWide` decides between the current layout (globe + panel) and `ExploreList`;
   - `useExplorePath` stays in `Explorer`, so the path survives switching between the two (rotating the phone or resizing the window);
   - `GlobeCanvas` is not mounted on mobile.

## Project Structure (files touched)
```text
frontend/react/src/features/explore/
├── hooks/useMediaQuery.ts          # new
├── hooks/useGlobe.ts               # uses useMediaQuery for reduced motion
├── components/ExploreDetails.tsx   # new (content taken out of DetailPanel)
├── components/DetailPanel.tsx      # only the aside + buttons
├── components/GroupCard.tsx        # optional onPreview
├── components/ExploreList.tsx      # new
└── components/ExploreView.tsx      # chooses globe or list
```

## Complexity Tracking
No violations.
