# Waiting List — Redesign Estetico
**Data:** 2026-03-29
**Scope:** Riscrittura completa di `public/waiting-list.html` (CSS + markup). Il file `public/waiting-list.js` resta invariato.

---

## Decisioni di design

| Parametro | Scelta |
|-----------|--------|
| Stile globale | Gradient SaaS — dark, minimal, pulito |
| Palette primaria | Emerald `#10B981` → Indigo `#6366F1` |
| Background hero | Minimal — solo radial glow (nessuna animazione di sfondo, no particles canvas) |
| Font titoli / CTA | **Plus Jakarta Sans** 700/800 |
| Font corpo / form | **Outfit** 400/500 |
| Scope strutturale | Restyling visivo puro — stesse sezioni, stesso contenuto |

---

## Design system

### Colori

```css
--bg:           #080808
--bg-surface:   #0d0d0d
--bg-card:      #101010
--bg-card-hover:#151515
--green:        #10b981
--indigo:       #6366f1
--grad:         linear-gradient(135deg, #10b981 0%, #6366f1 100%)
--text:         #f4f4f5
--text-soft:    #71717a
--text-muted:   #3f3f46
--border:       rgba(255,255,255,0.06)
--border-md:    rgba(255,255,255,0.09)
```

### Tipografia

```css
--font-display: 'Plus Jakarta Sans', sans-serif   /* titoli, label, CTA, step-num */
--font-body:    'Outfit', sans-serif               /* corpo, input, footer */
```

Google Fonts import:
```
Plus Jakarta Sans: 400, 500, 600, 700, 800
Outfit: 400, 500, 600, 700
```

### Gradiente `.grad-text`

```css
background: linear-gradient(135deg, #10b981, #6366f1);
-webkit-background-clip: text;
-webkit-text-fill-color: transparent;
background-clip: text;
```

Applicato a:
- `"Brain"` in `<h1>Fanta<span class="grad-text">Brain</span></h1>`
- Typed text (rotante) nell'hero
- `"Tu scegli"` nel titolo Features: `<span class="grad-text">Tu scegli</span>, sempre.`
- Numeri stats row (`#1`, `38`, `550+`, `Gratis`)
- CTA button background (`background: var(--grad)`)
- Step number boxes background
- Checkmark `✓` nei trust signals
- `btn-grad` nella CTA card

---

## Struttura pagina (invariata)

1. **Nav** — sticky, blur backdrop, logo + CTA button gradient
2. **Hero** — badge, h1, typed row, sub, form (4 campi), counter, stats row (4 KPI)
3. **Features** — 6 card in griglia 3×2
4. **How it works** — 3 step con connettore orizzontale + CTA card
5. **Footer** — logo, nav links, social icons, copyright

---

## Comportamento background hero

Nessun canvas / particle system. Solo due radial gradient (position: absolute, pointer-events: none, z-index: 0):
- `hero-glow-1`: top-right, `rgba(16,185,129,0.07)`, blur leggero
- `hero-glow-2`: bottom-left, `rgba(99,102,241,0.06)`, blur leggero

---

## Feature cards

- Background: `var(--bg-card)` — `#101010`
- Border: `1px solid var(--border)` — hover → `rgba(99,102,241,0.25)`
- Hover box-shadow: `0 8px 40px rgba(99,102,241,0.07)`
- Icon box: gradient background `rgba(16,185,129,0.1)` → `rgba(99,102,241,0.1)`, border `rgba(99,102,241,0.2)`
- Icon stroke color: `var(--indigo)` — `#6366f1`

---

## Nav

- Sticky top, `backdrop-filter: blur(14px)`, `background: rgba(8,8,8,0.82)`
- CTA "Entra in lista →": gradient background, `font-family: var(--font-display)`, font-weight 700

---

## JavaScript

`public/waiting-list.js` richiede **una sola modifica**: rimuovere il blocco IIFE delle particelle (righe 1–50), che esegue `canvas.getContext('2d')` e lancerebbe `TypeError` se `#canvas` non è nel DOM. Il resto del file resta identico.

Il nuovo HTML deve mantenere tutti gli ID esistenti:
- `#canvas` → **rimosso** (no più particle system; il blocco JS corrispondente va rimosso)
- `#typed` — typed text
- `#count-num` — counter animato
- `#waitlist-form` — form submit
- `#inp-name`, `#inp-email`, `#inp-lega`, `#inp-referral` — campi form
- `#cta-btn`, `#btn-label`, `#btn-arrow` — stato loading bottone
- `#form-error` — errore validazione
- `#success-overlay`, `#success-close`, `#position-num`, `#referral-display` — overlay successo
- `#share-wa`, `#share-copy`, `#copy-label`, `#copy-icon` — share buttons
- `#final-cta-btn` — ID sul bottone CTA card ("Entra in lista →" nella sezione How it works)

---

## Animazioni / microinteraction

| Elemento | Animazione |
|----------|-----------|
| Cursor typed | `blink` 0.7s ease-in-out infinite |
| Counter dot | `pulse-dot` 2s ease-in-out infinite |
| CTA btn | hover: `translateY(-2px)` + `box-shadow indigo` |
| Feature cards | hover: `translateY(-3px)` + border indigo + box-shadow |
| Scroll reveal | `IntersectionObserver` su `.reveal`, `.features-grid`, `.steps-row` (identico all'attuale) |

---

## File da toccare

| File | Azione |
|------|--------|
| `public/waiting-list.html` | **Riscrittura completa** |
| `public/waiting-list.js` | Rimuovere IIFE particelle (righe 1–50) |

---

## Riferimento mockup

Mockup approvato: `.superpowers/brainstorm/5784-1774795592/content/full-mockup.html`
