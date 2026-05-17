# LingoPancar — Context Handoff (for future AI sessions)

## Project Snapshot

- Stack: `Next.js 16` + `React 19` + `TypeScript` + `Tailwind v4` + `Firebase Realtime DB` + `Vitest`.
- Purpose: language flashcards with spaced repetition study sessions.
- Main review flow: pick 10 cards, collect feedback (`again` / `meh` / `yay`), update SR fields, persist per card.

## High-Value File Map

```text
src/
  app/
    layout.tsx                # Root metadata + pre-hydration theme init + provider wiring
    page.tsx                  # Auth gate + global loading shell
    providers.tsx             # Auth context + welcome-card bootstrap
    theme-provider.tsx        # Persisted theme context + system/light/dark resolution
    globals.css               # Theme tokens, dark-mode overrides, and shared global styles
  components/
    cards/CardList.tsx        # Card list UI + long-word-safe headword wrapping
    cards/CardForm.tsx        # Add-card form (uses CardFormFields)
    cards/EditCardForm.tsx    # Edit-card form (uses CardFormFields)
    cards/CardFormFields.tsx  # Shared fields + title + type toggle for add/edit
    dashboard/Dashboard.tsx   # Main app shell, deck loading, study entrypoints
    review/ReviewMode.tsx     # Active study UI and feedback handling
    auth/AuthPage.tsx         # Google sign-in page + theme toggle
    ui/button.tsx             # Shared Button variants + cursor behavior
    ui/input.tsx              # Shared Input primitive (hairline border, brass focus ring)
    ui/textarea.tsx           # Shared Textarea primitive (matches Input)
    ui/label.tsx              # Shared Label primitive (bakes in label-vintage small caps)
    ui/panel.tsx              # Shared Panel (bg-surface, hairline border, soft shadow)
    ui/modal.tsx              # Shared Modal (backdrop + panel, sizes sm/md/lg/xl, scrollable)
    ui/loading-spinner.tsx    # Brand spinner
    ui/loading-text.tsx       # Rotating multilingual loading label
    ui/theme-toggle.tsx       # Single-icon sun/moon theme toggle
  lib/
    types.ts                  # Card types and extra metadata typing
    theme.ts                  # Theme helpers, persistence, and init script source
    spaced-repetition.ts      # Core SM-2-like scheduling + due selection
    review-session.ts         # Pure helpers for feedback mapping / next-step
    firebase-service.ts       # Realtime DB reads/writes (cards, decks, demo)
  assets/
    demo-deck.ts              # Aggregates demo deck chunks into one export
    demo-deck/
      demo-deck-1.json ...    # Chunked demo cards (1..10)
      demo-deck-10.json
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
- Card metadata schema:
  - Preferred shape is `extra: { info, subInfo }`.
  - Current types/UI still tolerate `extra` as a string in some paths.
- Demo deck structure:
  - Demo cards are split into 10 files under `src/assets/demo-deck/` and merged in `src/assets/demo-deck.ts`.
- Theme behavior:
  - Theme is applied through `html[data-theme]` CSS variables in `globals.css`.
  - `layout.tsx` injects `themeInitScript` before hydration to avoid a light/dark flash.
  - `ThemeProvider` persists theme preference in local storage and resolves `system` via `matchMedia`.
  - The visible UI toggle is a simple explicit light/dark switch using a single sun/moon icon.
- Visual language (vintage):
  - Palette: wine burgundy `--brand-burgundy` (primary), Victorian navy `--brand-blue` (secondary), warm brass `--brand-brass` (accents/focus), sage `--accent-sage`, parchment `--neutral-ivory`.
  - `--destructive` is a dedicated terracotta red token distinct from wine primary — use the Button `destructive` variant for actual delete actions without overriding `bg-*`.
  - Typography: Merriweather (`--font-merriweather`) for serif headings/headwords/meaning via `font-serif` — chosen for sturdy on-screen vintage weight after Cormorant/Lora read too thin. Merriweather only ships in **300/400/700/900**, so always pair `font-serif` with `font-bold` (avoid `font-semibold` and `font-medium`, which would faux-bold). Inter (`--font-inter`) is the default body sans.
  - Ornamentation utilities in `globals.css`: `.label-vintage` (small caps), `.nums-oldstyle` (oldstyle numerals). The `Label` primitive bakes in `label-vintage` by default.
  - Chrome conventions: `rounded-md` + `border border-border` + `shadow-sm` for panels/cards, `shadow-lg` only for modals, `border border-input` + brass focus ring on inputs.
  - Dashboard nav is flat wine with a double brass hairline (`border-b-4 border-double border-brand-brass`) as the only heavy rule in the app.

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
- Dark mode:
  - root theme tokens live in `globals.css` with `:root[data-theme="dark"]` overrides,
  - `html` `color-scheme` switches between light and dark,
  - the theme toggle is rendered in both `Dashboard` and `AuthPage`.
- Long compounds/headwords:
  - list cards and study cards wrap long words like `Wohnungsgesellschaft` instead of overflowing.

## Commands

- Dev server: `npm run dev`
- Tests (non-watch): `npm test -- --run`
- Single test file: `npm test -- --run src/__tests__/review-integration.test.ts`

## Known Notes

- The old viewport-warning note is obsolete: `layout.tsx` already exports `viewport` separately.
- Theme defaults to `system` when there is no stored preference, but the visible toggle flips explicit light/dark only.

## Working Conventions for Future AI Runs

- Keep changes TypeScript-first and minimal.
- After code changes, run tests in non-watch mode.
- Prefer editing shared primitives (`ui/button`, `ui/input`, `ui/textarea`, `ui/label`, `ui/panel`, `ui/modal`, shared loading components) for global behavior changes.
- For modals anywhere in the app, use `@/components/ui/modal` — do not hand-roll `fixed inset-0` overlays.
- For text inputs use `Input` / `Textarea` / `Label`; they already carry the hairline + brass focus treatment.
- For theme changes, prefer editing `src/app/globals.css`, `src/lib/theme.ts`, `src/app/theme-provider.tsx`, and `src/components/ui/theme-toggle.tsx` before scattering overrides across feature components.
- When adding a form similar to add/edit card, extend `CardFormFields` instead of duplicating field markup.
- Update this file when architectural behavior or UX conventions change (whenever it's needed)
