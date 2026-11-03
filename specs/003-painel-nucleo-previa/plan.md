# Implementation Plan: Painel do Núcleo com prévia no globo

**Branch**: `claude/nova-aplicacao-cdc5de` | **Date**: 2026-10-16 | **Spec**: [spec.md](spec.md) | **Reference**: [referencia.png](referencia.png)

## Summary
Screen-only change: no API, no database.
- **Panel:** the Núcleo panel gets the support text and group cards (icon, name, one-line description, "N soluções").
- **Preview:** hovering or focusing a card sends a **preview** to the globe. The globe rotates to the group and lights up the group plus its solutions, the same way hovering a node does today. The breadcrumb does not change.

## For the reader
- **Preview.** Chosen: reuse the same globe highlight that already happens when you hover a dot. Why: the effect looks just like the image and adds no new piece to maintain.
- **Counts.** Chosen: the "N soluções" count comes from the same data the globe already receives. Why: no extra request; it is always equal to what lights up.

## Technical Context
- **Stack**: unchanged (React 18 + TS + Tailwind 4; 2D canvas). No new library.
- **Data**: `GET /api/v1/graph` (already filtered by access; `solutionCount` already comes per group).
- **Testing**: Vitest on the new pure functions (count text, preview target); manual check in the browser against the reference image.
- **Constraints**: `prefers-reduced-motion` respected; keyboard (focus/Enter) works the same as the mouse.

## Constitution Check
| Principle | Status |
|---|---|
| I. Spec Kit | ✅ spec approved; plan → tasks → implement |
| II. Docker | ✅ no change to the environment |
| III. Stack | ✅ no new dependency |
| IV. Database via migration | ✅ no database change |
| V–VIII | ✅ nothing destructive; plain language; technical decisions made by the agent |

## Design
1. **Preview state** lives in `ExploreView` (`previewId: string | null`):
   - `DetailPanel` receives `onPreview(id | null)` and passes it to the cards;
   - `GlobeCanvas`/`useGlobe` receives `previewId`.
2. **`useGlobe`**:
   - When `previewId` changes:
     - with a value: rotation target = `focusAngles(direction)`, and the highlight uses `previewId` like a hover (group + neighbors lit, the rest at ~0.25);
     - `null`: restore the target of the current focus (Núcleo = free spin).
   - Reduced motion: jump straight to the angle (no easing).
   - Dragging cancels the target as it does today; the preview only comes back on a new hover.
3. **`GroupCard`** (`features/explore/components/GroupCard.tsx`):
   - `<button>` with `onMouseEnter`/`onFocus` → preview, `onMouseLeave`/`onBlur` → clear, `onClick` → enter the group;
   - icon in the same visual language as the globe and the Grupos screen;
   - description with `truncate`;
   - highlight state while previewing (`border-primary-border bg-primary-wash`).
4. **Count text**: pure function `solutionCountLabel(n)` → "1 solução" / "N soluções" (reused in the group panel and the cards).

## Project Structure (files touched)
```text
frontend/react/src/features/explore/
├── components/ExploreView.tsx      # previewId state
├── components/DetailPanel.tsx      # CoreContent with text + GroupCard
├── components/GroupCard.tsx        # new
├── components/GlobeCanvas.tsx      # passes previewId
├── hooks/useGlobe.ts               # preview: rotation + highlight
└── lib/labels.ts or lib/text.ts    # solutionCountLabel (+ test)
```

## Complexity Tracking
No violations.
