# LandingPage React — Restyle Waiting List

**Date:** 2026-03-31
**Status:** Approved

## Goal

Restyle `src/pages/LandingPage.jsx` (route `/#/landing`) to match visually the static `public/waiting-list.html` — same fonts, colors, spacing, and component style — while preserving all existing LandingPage content and structure.

---

## Design Decisions

### Fonts
Replace Syne + DM Sans with **Plus Jakarta Sans** (headings) + **Outfit** (body), loaded via Google Fonts in `index.html`.

### Colors & Tokens (CSS variables)
| Variable | Value |
|---|---|
| `--bg` | `#080808` |
| `--surface` | `#111111` |
| `--surface-2` | `#181818` |
| `--border` | `rgba(255,255,255,0.06)` |
| `--text` | `#f5f5f5` |
| `--text-muted` | `rgba(255,255,255,0.45)` |
| `--green` | `#10b981` |
| `--indigo` | `#6366f1` |
| `--green-muted` | `rgba(16,185,129,0.12)` |

### Gradient Text
Animated gradient applied to selected keyword spans only:

```css
.grad-text {
  background: linear-gradient(135deg, #10b981 0%, #6366f1 38%, #34d399 65%, #818cf8 100%);
  background-size: 300% 300%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: grad-flow 6s ease-in-out infinite;
}
@keyframes grad-flow {
  0%, 100% { background-position: 0% 50%; }
  50%       { background-position: 100% 50%; }
}
```

---

## Section-by-Section Mapping

### 1. Nav
**Keep, restyle.** Logo dot + links + CTA button — same structure, waiting-list visual style.

### 2. Hero + SpiralGate
**Keep, restyle.** Badge + headline + typed text + email form + stats row.
Gradient: only on **"Coach AI"** in the h1.

### 3. Feature Cards (was: Problema)
**Keep, restyle.** 3 problem cards → feature card grid with gradient icons.
H2 title **"Perché perdi la lega ogni anno"** — all white, no gradient.

### 4. How it Works (was: Demo Coach AI)
**Simplify.** Interactive mockup → 3 numbered steps row (steps-row pattern from waiting list).
H2: gradient on **"semplice"** and **"potenti"**.

### 5. Social Proof → Stats Row
**Simplify.** Testimonials grid → 4 numeric stats (e.g. #1 App, 550+ utenti, ecc.).

### 6. Pricing
**Keep full 3-card pricing.** Restyled to match waiting-list card style.
H2 title **"Scegli il tuo piano"** — all white, no gradient.

### 7. FAQ
**Keep, restyle.** Accordion — same content, waiting-list card style.

### 8. CTA + Form + Footer
**Keep, restyle.** cta-card + email form + footer from waiting-list.
Gradient on **"Entra in lista ora."**

---

## Implementation Approach

**Approach A — Replace CSS + refactor JSX** (chosen):

1. **`src/pages/LandingPage.css`** — full replacement with waiting-list token system
2. **`src/pages/LandingPage_part1.jsx`** — update classNames + HTML structure for: Nav, Hero, Feature Cards, How it Works
3. **`src/pages/LandingPage_part2.jsx`** — update classNames + HTML structure for: Stats, Pricing, FAQ, CTA, Footer
4. **`index.html`** — add Google Fonts: Plus Jakarta Sans + Outfit

No new files created. No changes to routing or state logic.

---

## Gradient Text Rules (Final)

| Section | Element | Gradient |
|---|---|---|
| Hero | "Coach AI" in h1 | ✓ |
| Feature Cards | h2 title | ✗ (all white) |
| How it Works | "semplice" in h2 | ✓ |
| How it Works | "potenti" in h2 | ✓ |
| Stats row | numeric values | ✓ |
| Pricing | h2 title | ✗ (all white) |
| FAQ | h2 title | ✗ (all white) |
| CTA | "Entra in lista ora." | ✓ |

---

## Files Changed

| File | Action |
|---|---|
| `src/pages/LandingPage.css` | Full rewrite |
| `src/pages/LandingPage_part1.jsx` | Update classNames + structure |
| `src/pages/LandingPage_part2.jsx` | Update classNames + structure |
| `index.html` | Add Google Fonts link |

---

## Out of Scope

- No changes to routing logic
- No changes to data-fetching or state management
- No changes to other pages
- Waiting list (`public/waiting-list.html`) remains untouched
