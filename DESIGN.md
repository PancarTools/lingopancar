# LingoPancar Design System

Visual language: **vintage editorial** — wine burgundy authority, Victorian navy depth, warm brass ornament, parchment warmth. Think 19th-century European dictionary, rendered on screen.

---

## Color Palette

### Brand Tokens

| Token | Value | Role |
|---|---|---|
| `--brand-burgundy` | `#7c1e2c` | Primary actions, headings, nav background |
| `--brand-blue` | `#1b3a5b` | Secondary actions, links, accents |
| `--brand-brass` | `#b68b3a` | Focus rings, nav hairline, ornamental dividers |
| `--accent-sage` | `#3a6a44` | Accent surface, muted tints |
| `--neutral-ivory` | `#f5ecd9` | Light mode background, primary foreground text |
| `--neutral-charcoal` | `#121212` | Light mode foreground text |
| `--neutral-mist` | `#eef3f8` | Dark mode foreground text |
| `--neutral-night` | `#0f1115` | Dark mode page background |
| `--neutral-night-surface` | `#181c23` | Dark mode card/panel surface |
| `--neutral-night-elevated` | `#222834` | Dark mode elevated surfaces |
| `--destructive` | `#a53c4b` | Delete/error — terracotta, distinct from burgundy |

### Semantic Tokens

These map onto brand/neutral values and change in dark mode. Always use these in component code — never hard-code hex values.

| Token | Light | Dark |
|---|---|---|
| `--background` | `--neutral-ivory` | `--neutral-night` |
| `--foreground` | `--neutral-charcoal` | `--neutral-mist` |
| `--surface` | ivory tint (96% ivory + white) | night-surface/elevated mix |
| `--primary` | `--brand-burgundy` | burgundy lightened 16% |
| `--primary-foreground` | `--neutral-ivory` | `--neutral-mist` |
| `--secondary` | `--brand-blue` | blue lightened 18% |
| `--secondary-foreground` | `--neutral-ivory` | `--neutral-mist` |
| `--accent` | `--accent-sage` | sage lightened 14% |
| `--border` | burgundy/ivory mix (72/28) | night-elevated/mist mix (70/30) |
| `--input` | blue/ivory mix (28/72) | night-elevated/blue mix |
| `--muted` | sage/ivory mix (18/82) | night-elevated/night mix |
| `--muted-foreground` | blue/charcoal mix | mist/blue mix |
| `--overlay` | charcoal 60% transparent | night 76% transparent |
| `--destructive` | `#a53c4b` | terracotta lightened 20% |

---

## Typography

### Fonts Loaded

All five candidates are loaded as CSS variables on `<html>`. Swap the active serif by editing the `--font-serif` line in `globals.css` only — no changes needed in `layout.tsx`.

| Variable | Font | Character |
|---|---|---|
| `--font-inter` | Inter | Body sans-serif (default) |
| `--font-merriweather` | Merriweather | Sturdy newspaper. Weights: **300/400/700/900 only** |
| `--font-vollkorn` | Vollkorn | Warm German book serif, full weight range |
| `--font-bitter` | Bitter | Slab-serif workhorse, very legible on screens |
| `--font-playfair` | Playfair Display | **Currently active.** Dramatic Edwardian display |
| `--font-eb-garamond` | EB Garamond | Classical Garamond spirit, refined and bookish |

### Active Assignments

```css
--font-sans: Inter               /* body, UI labels, everything default */
--font-serif: Playfair Display   /* headings, headwords, meanings */
```

### Rules

- **`font-serif` always paired with `font-bold`** — Playfair Display renders weight correctly only at bold+. Never use `font-semibold` or `font-medium` with serif.
- If switching to Merriweather: same rule applies — available weights are 300/400/700/900 only.
- Body text: Inter, no special pairing needed.

### Utility Classes

| Class | Effect |
|---|---|
| `.label-vintage` | `font-variant: small-caps` + `letter-spacing: 0.08em` + `text-transform: lowercase`. Used for section labels, metadata labels. |
| `.nums-oldstyle` | `font-variant-numeric: oldstyle-nums`. Used for progress counters, review stats. |

---

## Spacing & Layout

| Constraint | Value | Purpose |
|---|---|---|
| Max content width | `max-w-225` (900px) | Main content centering |
| Nav max width | `max-w-7xl` | Full-width nav inner constraint |
| Root min-height | `min-h-dvh` | Mobile browser toolbar safety |
| Panel padding sm | `p-3 sm:p-4` | Tight panels |
| Panel padding md | `p-4 sm:p-6` | Standard panels (default) |
| Panel padding lg | `p-4 sm:p-6 md:p-8` | Spacious panels (auth card, review card) |

---

## Component Conventions

### Panels & Cards

```
bg-surface  rounded-md  border border-border  shadow-sm
```

- `shadow-sm` for all panels and cards
- `shadow-lg` reserved for modals only
- `rounded-md` universally — no sharp corners, no pill shapes

### Navigation Bar

```
bg-primary  border-b-4  border-double  border-brand-brass
```

The double brass hairline is the only heavy rule in the app. It anchors the nav and signals the editorial register.

### Inputs

```
border border-input  rounded-md  bg-background
focus: border-brand-brass  ring-1 ring-brand-brass
```

All inputs carry the brass focus ring. Use `Input`, `Textarea`, `Label` primitives — never hand-roll field markup.

### Buttons

| Variant | Usage |
|---|---|
| `default` | Primary actions (`bg-primary`, burgundy) |
| `secondary` | Secondary actions (`bg-secondary`, navy) |
| `outline` | Cancel, back, navigation — `border-input bg-surface` |
| `destructive` | Delete actions (`bg-destructive`, terracotta). Never use `bg-*` override — use this variant. |
| `ghost` | Minimal actions, icon buttons |
| `link` | Text links |

All buttons: `cursor-pointer` active, `cursor-not-allowed` disabled. Focus ring: `ring-brand-brass`.

### Modals

Always use `<Modal>` from `@/components/ui/modal`. Never hand-roll `fixed inset-0` overlays.

Sizes: `sm` (384px), `md` (448px), `lg` (512px), `xl` (672px).

Backdrop: `bg-overlay` (charcoal/night 60-76% transparent).

### Long Words / Headwords

German compound words can be very long. Apply `wrap-anywhere` on headword spans to prevent overflow in cards and list items.

---

## Dark Mode

Theme applied via `html[data-theme="dark"]`. The `data-theme` attribute is set by an inline script in `<head>` before hydration (see `themeInitScript` in `src/lib/theme.ts`) to avoid a light flash.

`html` element switches `color-scheme` between `light` and `dark` to get correct browser chrome (scrollbars, inputs).

Toggle: sun/moon icon button — explicit light/dark only. System preference is the default when no stored preference exists, but the toggle always sets explicit light or dark.

---

## Animations

| Class | Keyframe | Usage |
|---|---|---|
| `.animate-pulse-scale` | Scale 1 → 1.1 → 1, 2s ease-in-out infinite | Brand spinner, loading states |
| `--card-hover-scale: 1.01` | Used via `hover:scale-(--card-hover-scale)` | Review card hover lift |

---

## Do / Don't

| Do | Don't |
|---|---|
| Use semantic tokens (`text-primary`, `bg-surface`) | Hard-code hex values in components |
| Use `Button destructive` for delete actions | Override with `bg-red-*` or raw `bg-destructive` |
| Pair `font-serif` with `font-bold` | Use `font-semibold` + `font-serif` (faux-bold) |
| Use `<Modal>` primitive | Hand-roll `fixed inset-0` overlay divs |
| Use `<Input>` / `<Textarea>` / `<Label>` | Duplicate hairline + focus-ring markup |
| Use `<Panel>` for content surfaces | Repeat `bg-surface rounded-md border border-border shadow-sm` |
| Apply `wrap-anywhere` on headwords | Let long German words overflow containers |
| Edit `globals.css` for theme changes | Scatter color overrides into feature components |
