# LingoPancar — Context Handoff (for future AI sessions)

## Project Snapshot
- Stack: `Next.js 16` + `React 19` + `TypeScript` + `Tailwind v4` + `Firebase Realtime DB` + `Vitest`.
- Purpose: language flashcards with spaced repetition study sessions.
- Main review flow: pick 10 cards, collect feedback (`again` / `meh` / `yay`), update SR fields, persist per card.

## High-Value File Map
```text
src/
  app/
    page.tsx                  # Auth gate + global loading shell
    providers.tsx             # Auth context + welcome-card bootstrap
    globals.css               # Theme tokens and shared global styles
  components/
    dashboard/Dashboard.tsx   # Main app shell, deck loading, study entrypoints
    review/ReviewMode.tsx     # Active study UI and feedback handling
    auth/AuthPage.tsx         # Google sign-in page
    ui/button.tsx             # Shared Button variants + cursor behavior
    ui/loading-spinner.tsx    # Brand spinner
    ui/loading-text.tsx       # Rotating multilingual loading label
  lib/
    spaced-repetition.ts      # Core SM-2-like scheduling + due selection
    review-session.ts         # Pure helpers for feedback mapping / next-step
    firebase-service.ts       # Realtime DB reads/writes (cards, decks, demo)
  __tests__/
    review-integration.test.ts
    review-session.test.ts
    spaced-repetition.test.ts
    review-feature.test.ts
    auth-and-welcome.test.ts
```

## Core Behavior Decisions
- Feedback mapping is fixed:
  - `again -> 1`
  - `meh -> 2`
  - `yay -> 4`
- Review persistence timing:
  - Card update is sent to Firebase **immediately on each feedback click** (not end-of-session batch).
- Due selection:
  - `getTopReviewCards(cards, 10)` using `nextReviewAt` fallback to `createdAt`.

## Testing Strategy Used
- Deterministic tests use `vi.useFakeTimers()`.
- Integration test (`23-card complex`) uses hardcoded per-session expected reviewed IDs (`sessionResults`) plus rule checks.
- `createDeck` baseline now starts from **1 day before mocked now** to keep timestamps intuitive in logs.

## Important Recent UI/UX Changes
- Demo deck loading now blocks UI with full-screen overlay spinner.
- Shared rotating loading text (`LoadingText`) added and reused in:
  - spinner,
  - dashboard demo-loading label,
  - auth sign-in loading label.
- Buttons:
  - global pointer cursor for active buttons in shared `Button` component,
  - disabled state uses `cursor-not-allowed`.
- Dashboard layout:
  - root uses `min-h-dvh` for mobile browser toolbar-safe viewport behavior,
  - main content constrained/centered with `max-w-225` (900px) + `mx-auto`.
- Theme tokens moved to CSS vars in `globals.css`; dark token updated to `#121212`.

## Commands
- Dev server: `npm run dev`
- Tests (non-watch): `npm test -- --run`
- Single test file: `npm test -- --run src/__tests__/review-integration.test.ts`

## Known Notes
- Next warning currently appears in dev:
  - `Unsupported metadata viewport is configured in metadata export in /`.
  - Needs moving viewport config to `viewport` export in app router metadata.

## Working Conventions for Future AI Runs
- Keep changes TypeScript-first and minimal.
- After code changes, run tests in non-watch mode.
- Prefer editing shared primitives (`ui/button`, shared loading components) for global behavior changes.
- Update this file when architectural behavior or UX conventions change.
