# FantaBrain Restyle · Fase 1 — Foundation · Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Sostituire interamente il design-system (fonts, palette, tokens, bottom nav) con il nuovo linguaggio "Stadium Electric" (Plum/Milk + Unbounded/Inter/JetBrains Mono) e predisporre la nuova Information Architecture a 5 tab, senza ridisegnare le pagine di contenuto (Home, Schiera, Classifica, News, AI restano funzionanti ma conservano il layout attuale — verranno restylate nelle fasi 2 e 3).

**Architecture:** Al termine di questa fase il progetto ha (a) nuovi design tokens attivi via CSS custom properties, con toggle light/dark gestito da `ThemeProvider` React Context che rispetta `prefers-color-scheme` e persiste la scelta utente in `localStorage`, (b) Tailwind v4 `@theme` block che espone i token come classi utility, (c) nuovo `BottomNav.jsx` con 5 tab floating (Home / Schiera / Classif. / News / AI) che rimpiazza `Dock.jsx` — il vecchio `Dock` viene eliminato, (d) due nuove route placeholder (`/news` e `/hub/analisi`) e un redirect da `/la-rosa` verso `/schieramento?tab=rosa`. Le pagine esistenti continuano a renderizzare ma appariranno visivamente spurie finché non vengono restylate nelle fasi successive — questo è atteso e documentato.

**Tech Stack:** React 19, React Router v6 (HashRouter), Zustand 4.5, Tailwind CSS v4 (`@theme` in-CSS, no config file), Vite 5, CSS custom properties. Fonts via Google Fonts (Unbounded, Inter, JetBrains Mono). Nessuna nuova dipendenza npm richiesta.

**Spec di riferimento:** `docs/superpowers/specs/2026-04-19-fantabrain-restyle-design.md` (sezioni 6 "Design tokens", 7 "Information Architecture", 11 "Note tecniche di base").

**Testing convention:** FantaBrain MVP non ha infrastruttura Vitest/Jest. La verifica per ogni task è: (1) `npm run build` senza errori, (2) smoke manuale via `npm run dev` a http://localhost:5173 controllando la regressione specifica indicata. Unit test automatici verranno introdotti in un plan separato quando serviranno (pianificato prima del lancio store, agosto 2026 — vedi `.claude/rules/testing.md`).

**Pre-requisito branch:** lavorare sul branch `claude/fantabrain-restyle-stadium-spec` (già attivo, spec committato come `c5cc54b`). Ci sono altri file modificati non committati nel working tree (v. `git status`): **non includerli in questi commit** — ogni commit in questo plan tocca solo i file elencati nella relativa sezione "Files".

---

## File Structure

File creati in questa fase:

| Path | Responsabilità |
|---|---|
| `src/contexts/ThemeContext.jsx` | React Context che espone `{ theme, setTheme, toggleTheme }`. Inizializza da `localStorage['fantabrain-theme']`, fallback a `prefers-color-scheme`. Applica `data-theme="light"` o `"dark"` su `<html>`. |
| `src/components/layout/BottomNav.jsx` | Nuovo componente floating nav 5-tab. Sostituisce `Dock.jsx`. |
| `src/pages/News.jsx` | Placeholder route `/news` — copy italiano "Il feed Pulse + AI Magazine arriva nella Fase 3". |
| `src/pages/HubAnalisi.jsx` | Placeholder route `/hub/analisi` — copy italiano "Fusione di War Room + Scouting + Statistiche in arrivo (Fase 3)". |

File modificati in questa fase:

| Path | Modifica |
|---|---|
| `index.html` | Swap link Google Fonts. `theme-color` diventa dinamico via JS (o fallback statico Plum). |
| `src/styles/design-system.css` | Rewrite completo — nuovi tokens, dark/light mode, bottom nav styles. |
| `src/index.css` | Aggiunta `@theme` block Tailwind v4 che espone i nuovi tokens. |
| `src/main.jsx` | Wrap `<App />` con `<ThemeProvider>`. |
| `src/App.jsx` | Rimuove import/uso `Dock`, importa e usa `BottomNav`. Aggiunge route `/news`, `/hub/analisi`. Aggiunge redirect `/la-rosa` → `/schieramento?tab=rosa`. |

File che **non** vengono toccati in questa fase (eliminati o refattorizzati in Fase 2/3):

- `src/components/layout/Dock.jsx` — lasciato nel repo ma non più importato. Verrà cancellato in Fase 3 durante il cleanup.
- `src/components/layout/FloatingPanel.jsx`, `src/components/layout/PanelHeader.jsx` — continuano a renderizzare. Verranno sostituiti in Fase 2.
- Pagine (`Dashboard.jsx`, `LaRosa.jsx`, `Schieramento.jsx`, `Classifica.jsx`, ecc.) — continuano a renderizzare con le classi del vecchio design system. Appariranno visivamente spurie (mix vecchio/nuovo) fino alla Fase 2.

**Nota importante sulla UX intermedia:** al termine di questa fase l'app è **funzionante ma visivamente ibrida**. È accettabile: Fase 1 sposta solo le fondamenta. Un bug visivo nelle pagine contenuto **non è un regresso di Fase 1** — va registrato ma risolto nelle fasi successive.

---

## Task 1 — Swap Google Fonts in index.html

**Files:**
- Modify: `index.html:27-31`

- [ ] **Step 1: Aggiornare il link Google Fonts**

Sostituire il blocco attuale (righe 27-31):

```html
<!-- Fonts — Plus Jakarta Sans + Outfit -->
<link
  href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Outfit:wght@400;500;600;700&display=swap"
  rel="stylesheet"
/>
```

con:

```html
<!-- Fonts — Unbounded (display/numbers) + Inter (body) + JetBrains Mono (metadata) -->
<link
  href="https://fonts.googleapis.com/css2?family=Unbounded:wght@400;600;700;900&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap"
  rel="stylesheet"
/>
```

- [ ] **Step 2: Aggiornare `theme-color` meta tag**

Sostituire (riga 10):

```html
<meta name="theme-color" content="#080808" />
```

con due meta tag che rispondono al color-scheme del sistema (fallback dark = Plum):

```html
<meta name="theme-color" content="#FFF3E6" media="(prefers-color-scheme: light)" />
<meta name="theme-color" content="#381932" media="(prefers-color-scheme: dark)" />
```

- [ ] **Step 3: Build check**

Run: `npm run build`
Expected: exit code 0, nessun errore di bundling. Il warning tipico di Vite sulla size del bundle va bene.

- [ ] **Step 4: Smoke manuale**

Run: `npm run dev`
Apri http://localhost:5173. DevTools → Network → filtra `fonts.googleapis.com`. Deve caricare il nuovo URL con `Unbounded|Inter|JetBrains+Mono`. Chiudere il dev server con Ctrl+C.

Non verificare ancora l'effetto visivo sui titoli: il CSS non è stato ancora aggiornato, quindi `font-family` punta ancora a `Plus Jakarta Sans` (che non viene più caricato e farà fallback a system-ui). **Questo è temporaneamente atteso** e sparisce al Task 2.

- [ ] **Step 5: Commit**

```bash
git add index.html
git commit -m "feat(restyle): swap Google Fonts to Unbounded + Inter + JetBrains Mono

Rimuove Plus Jakarta Sans + Outfit. Aggiunge theme-color responsivo a
prefers-color-scheme (Milk per light, Plum per dark).

Primo step della fase 1 restyle Stadium Electric."
```

---

## Task 2 — Rewrite `design-system.css` con nuovi tokens

Questo è il task più corposo del plan. Sostituisce interamente il file (1076 righe) con il nuovo design system. Lo facciamo in un'unica operazione perché i token del vecchio sistema (`--green`, `--indigo`, `--bg-deep`) sono intrecciati e una migrazione graduale produrrebbe bug visivi peggiori dell'ibrido finale.

**Files:**
- Modify: `src/styles/design-system.css` (rewrite completo)

- [ ] **Step 1: Rewrite completo del file**

Sovrascrivere `src/styles/design-system.css` con questo contenuto:

```css
/* ══════════════════════════════════════════════════════════
   FantaBrain — Design System · Stadium Electric
   Palette: Plum #381932 + Milk #FFF3E6
   Mode: dark = Plum bg + Milk fg · light = Milk bg + Plum fg
   ══════════════════════════════════════════════════════════ */

/* ──────────────────────────────────────────────────────────
   TOKENS — dark mode default (html[data-theme="dark"] e fallback)
   ────────────────────────────────────────────────────────── */
:root,
html[data-theme="dark"] {
  /* Core brand */
  --color-plum: #381932;
  --color-milk: #FFF3E6;

  /* Ruoli semantici (stabili in entrambe le mode) */
  --color-success: #0E8C5F;
  --color-danger:  #D64545;
  --color-gold:    #E6B325;
  --color-info:    #3B5B8C;

  /* Background + foreground (dark) */
  --bg: #381932;
  --fg: #FFF3E6;
  --fg-70: rgba(255, 243, 230, 0.70);
  --fg-55: rgba(255, 243, 230, 0.55);
  --fg-35: rgba(255, 243, 230, 0.35);
  --fg-15: rgba(255, 243, 230, 0.15);
  --fg-08: rgba(255, 243, 230, 0.08);
  --fg-04: rgba(255, 243, 230, 0.04);
  --surface: rgba(255, 243, 230, 0.04);
  --surface-hover: rgba(255, 243, 230, 0.08);
  --border-subtle: rgba(255, 243, 230, 0.08);
  --border: rgba(255, 243, 230, 0.15);

  /* Shadows — dark */
  --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.25);
  --shadow-md: 0 8px 24px rgba(0, 0, 0, 0.35);
  --shadow-lg: 0 20px 60px rgba(0, 0, 0, 0.50);

  /* Role colors (Mantra) */
  --role-gk:  var(--color-gold);
  --role-def: var(--color-info);
  --role-mid: var(--fg);
  --role-fwd: var(--color-danger);
  --role-pk:  var(--color-gold);
}

/* ──────────────────────────────────────────────────────────
   TOKENS — light mode (html[data-theme="light"])
   ────────────────────────────────────────────────────────── */
html[data-theme="light"] {
  --bg: #FFF3E6;
  --fg: #381932;
  --fg-70: rgba(56, 25, 50, 0.70);
  --fg-55: rgba(56, 25, 50, 0.55);
  --fg-35: rgba(56, 25, 50, 0.35);
  --fg-15: rgba(56, 25, 50, 0.15);
  --fg-08: rgba(56, 25, 50, 0.08);
  --fg-04: rgba(56, 25, 50, 0.04);
  --surface: rgba(56, 25, 50, 0.04);
  --surface-hover: rgba(56, 25, 50, 0.08);
  --border-subtle: rgba(56, 25, 50, 0.08);
  --border: rgba(56, 25, 50, 0.15);

  /* Shadows — più morbide in light perché il fondo Milk non regge ombre profonde */
  --shadow-sm: 0 2px 8px rgba(56, 25, 50, 0.12);
  --shadow-md: 0 8px 24px rgba(56, 25, 50, 0.18);
  --shadow-lg: 0 20px 60px rgba(56, 25, 50, 0.25);
}

/* ──────────────────────────────────────────────────────────
   TOKENS — non-color (spacing, radius, motion, typography)
   ────────────────────────────────────────────────────────── */
:root {
  /* Typography */
  --font-display: 'Unbounded', system-ui, sans-serif;
  --font-body:    'Inter', system-ui, sans-serif;
  --font-mono:    'JetBrains Mono', ui-monospace, monospace;

  /* Spacing (4px base) */
  --space-1:  4px;
  --space-2:  8px;
  --space-3:  12px;
  --space-4:  16px;
  --space-5:  20px;
  --space-6:  24px;
  --space-8:  32px;
  --space-10: 40px;

  /* Radius */
  --radius-sm: 6px;
  --radius-md: 12px;
  --radius-lg: 18px;
  --radius-xl: 28px;
  --radius-full: 9999px;

  /* Motion */
  --ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-standard: cubic-bezier(0.2, 0.8, 0.2, 1);
  --motion-micro: 120ms;
  --motion-standard: 240ms;
  --motion-expressive: 600ms;
  --motion-modal: 320ms;

  /* ── Legacy aliases (riempiti con i nuovi token per compatibilità) ──
     Servono finché le pagine non vengono restylate nelle fasi 2/3.
     Non aggiungere nuove alias qui: usare i token nuovi. */
  --bg-deep: var(--bg);
  --bg-panel: var(--surface);
  --bg-surface: var(--surface);
  --bg-elevated: var(--surface-hover);
  --bg-dock: var(--surface);
  --bg-glass: var(--fg-04);
  --bg-glass-hover: var(--fg-08);

  --text-primary: var(--fg);
  --text-secondary: var(--fg-70);
  --text-muted: var(--fg-55);
  --text-accent: var(--fg);

  --border-panel: var(--border-subtle);
  --border-glass: var(--border-subtle);
  --border-hover: var(--border);
  --border-accent: var(--border);

  --green: var(--color-success);
  --green-light: var(--color-success);
  --indigo: var(--color-info);
  --indigo-light: var(--color-info);
  --grad: linear-gradient(135deg, var(--color-plum), var(--color-plum));
  --grad-text: linear-gradient(135deg, var(--fg), var(--fg));
  --accent-primary: var(--fg);
  --accent-secondary: var(--fg-70);
  --accent-muted: var(--fg-15);
  --accent-glow: var(--fg-15);
  --accent-intense: var(--fg-35);
  --ice-blue: var(--fg);
  --ice-light: var(--fg-70);
  --chrome-light: var(--fg);
  --chrome-mid: var(--fg-55);
  --chrome-dark: var(--fg-35);

  --gold: var(--color-gold);
  --gold-dark: var(--color-gold);
  --gold-glow: rgba(230, 179, 37, 0.25);
  --gold-gradient: var(--color-gold);
  --gold-border: rgba(230, 179, 37, 0.2);
  --success: var(--color-success);
  --danger: var(--color-danger);
  --warning: var(--color-gold);
  --blue: var(--color-info);
  --green-semantic: var(--color-success);
  --red: var(--color-danger);
  --amber: var(--color-gold);
  --silver: var(--fg-55);

  --shadow-glow: 0 0 20px var(--fg-15);
  --shadow-gold: 0 0 20px rgba(230, 179, 37, 0.20);
  --glow-ice: 0 0 20px var(--fg-15);
  --glow-indigo: 0 0 20px var(--fg-15);

  --transition-fast: var(--motion-micro);
  --transition-base: var(--motion-standard);
  --transition-slow: var(--motion-expressive);

  --space-xs: var(--space-1);
  --space-sm: var(--space-2);
  --space-md: var(--space-4);
  --space-lg: var(--space-6);
  --space-xl: var(--space-8);
  --space-2xl: var(--space-10);
  --space-3xl: 64px;

  --radius-2xl: var(--radius-xl);
  --radius-panel: var(--radius-lg);
  --radius-dock: var(--radius-xl);
}

/* ══════════════════════════════════════════════════════════
   BASE
   ══════════════════════════════════════════════════════════ */

*, *::before, *::after {
  box-sizing: border-box;
}

html {
  /* Fallback se ThemeProvider non ha ancora applicato data-theme */
  color-scheme: dark light;
}

body {
  margin: 0;
  font-family: var(--font-body);
  font-size: 14px;
  line-height: 1.5;
  color: var(--fg);
  background: var(--bg);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  transition: background-color var(--motion-standard) var(--ease-standard),
              color var(--motion-standard) var(--ease-standard);
}

/* Radial "stadium" glow — molto leggero, serve da atmosfera */
body::before {
  content: '';
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  background:
    radial-gradient(ellipse 50% 60% at 15% 20%, var(--fg-08), transparent 70%),
    radial-gradient(circle at 85% 80%, var(--fg-04), transparent 60%);
}

h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-display);
  line-height: 1.1;
  letter-spacing: -0.02em;
  margin: 0;
}

/* ══════════════════════════════════════════════════════════
   LAYOUT — Floating panel (ereditato dalla vecchia IA,
   verrà sostituito in Fase 2. Tenuto funzionante con i nuovi token.)
   ══════════════════════════════════════════════════════════ */

.app-layout {
  position: relative;
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.floating-panel {
  position: fixed;
  top: 16px;
  left: 16px;
  right: 16px;
  bottom: 88px; /* spazio per la nuova BottomNav 72px + 16px gap */
  background: var(--surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  z-index: 1;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-subtle);
  flex-shrink: 0;
}

.panel-logo,
.panel-title {
  font-family: var(--font-display);
  font-size: 15px;
  font-weight: 900;
  color: var(--fg);
  letter-spacing: -0.02em;
  -webkit-text-fill-color: currentColor; /* reset eventuali gradient-text legacy */
}

.panel-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--fg);
  color: var(--bg);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-display);
  font-size: 11px;
  font-weight: 700;
}

.page-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  scrollbar-width: thin;
  scrollbar-color: var(--fg-08) transparent;
}

.page-content::-webkit-scrollbar { width: 6px; }
.page-content::-webkit-scrollbar-track { background: transparent; }
.page-content::-webkit-scrollbar-thumb {
  background: var(--fg-08);
  border-radius: 3px;
}

/* ══════════════════════════════════════════════════════════
   BOTTOM NAV — 5 tab floating con inversione colore
   ══════════════════════════════════════════════════════════ */

.bottom-nav {
  position: fixed;
  bottom: calc(12px + env(safe-area-inset-bottom, 0px));
  left: 50%;
  transform: translateX(-50%);
  width: calc(100% - 32px);
  max-width: 420px;
  background: var(--fg);
  color: var(--bg);
  border-radius: var(--radius-xl);
  padding: 8px;
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 4px;
  z-index: 50;
  box-shadow: var(--shadow-md);
  transition: transform var(--motion-standard) var(--ease-standard);
}

.bottom-nav.hidden {
  transform: translateX(-50%) translateY(calc(100% + 24px));
}

.bottom-nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  padding: 8px 4px;
  border-radius: var(--radius-md);
  background: transparent;
  border: none;
  color: var(--bg);
  text-decoration: none;
  cursor: pointer;
  font-family: var(--font-display);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  transition: background var(--motion-micro) ease-out;
}

.bottom-nav-item:hover {
  background: rgba(0, 0, 0, 0.06);
}

.bottom-nav-item.active {
  background: var(--bg);
  color: var(--fg);
}

.bottom-nav-item-icon {
  font-size: 18px;
  line-height: 1;
}

.bottom-nav-item-label {
  font-size: 9px;
  opacity: 0.9;
}

/* ══════════════════════════════════════════════════════════
   CARDS (legacy glass-card mantenuta, restylata)
   ══════════════════════════════════════════════════════════ */

.glass-card {
  background: var(--surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
  transition: border-color var(--motion-micro) ease-out,
              transform var(--motion-micro) ease-out;
  position: relative;
  overflow: hidden;
}

.glass-card:hover {
  border-color: var(--border);
  transform: translateY(-2px);
}

.glass-card--accent { border-color: var(--border); }
.glass-card--gold   { border-color: rgba(230, 179, 37, 0.35); }

.glass-elevated {
  background: var(--surface-hover);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
}

/* ══════════════════════════════════════════════════════════
   TYPOGRAPHY utilities
   ══════════════════════════════════════════════════════════ */

.section-title {
  font-family: var(--font-display);
  font-size: 18px;
  font-weight: 700;
  color: var(--fg);
  line-height: 1.1;
  letter-spacing: -0.02em;
}

.section-subtitle {
  font-family: var(--font-body);
  font-size: 13px;
  color: var(--fg-70);
  line-height: 1.5;
}

.kicker {
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.22em;
  color: var(--fg-55);
}

.display-giant {
  font-family: var(--font-display);
  font-weight: 900;
  font-size: clamp(72px, 18vw, 120px);
  line-height: 0.9;
  letter-spacing: -0.05em;
  color: var(--fg);
}

/* ══════════════════════════════════════════════════════════
   BUTTONS
   ══════════════════════════════════════════════════════════ */

.btn-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: 0 var(--space-6);
  min-height: 48px;
  border: none;
  border-radius: var(--radius-md);
  background: var(--fg);
  color: var(--bg);
  font-family: var(--font-display);
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.02em;
  cursor: pointer;
  transition: transform var(--motion-micro) ease-out,
              box-shadow var(--motion-micro) ease-out;
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.btn-primary:active { transform: translateY(0); }

.btn-secondary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: 0 var(--space-6);
  min-height: 44px;
  background: transparent;
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  color: var(--fg);
  font-family: var(--font-body);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: background var(--motion-micro) ease-out,
              border-color var(--motion-micro) ease-out;
}

.btn-secondary:hover {
  background: var(--surface-hover);
  border-color: var(--fg-35);
}

.btn-ghost {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: 0 var(--space-4);
  min-height: 40px;
  background: transparent;
  border: none;
  border-radius: var(--radius-md);
  color: var(--fg-70);
  font-family: var(--font-body);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: color var(--motion-micro) ease-out,
              background var(--motion-micro) ease-out;
}

.btn-ghost:hover {
  color: var(--fg);
  background: var(--surface);
}

.btn-ai {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: 0 var(--space-6);
  min-height: 48px;
  border: 1px solid rgba(230, 179, 37, 0.35);
  border-radius: var(--radius-md);
  background: rgba(230, 179, 37, 0.10);
  color: var(--color-gold);
  font-family: var(--font-display);
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.02em;
  cursor: pointer;
  transition: background var(--motion-micro) ease-out;
}

.btn-ai:hover { background: rgba(230, 179, 37, 0.18); }

.btn-danger {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: 0 var(--space-6);
  min-height: 44px;
  background: rgba(214, 69, 69, 0.10);
  border: 1px solid rgba(214, 69, 69, 0.30);
  border-radius: var(--radius-md);
  color: var(--color-danger);
  font-family: var(--font-body);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: background var(--motion-micro) ease-out;
}

.btn-danger:hover { background: rgba(214, 69, 69, 0.18); }

.btn-gold {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: 0 var(--space-6);
  min-height: 48px;
  border: none;
  border-radius: var(--radius-md);
  background: var(--color-gold);
  color: var(--color-plum);
  font-family: var(--font-display);
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.02em;
  cursor: pointer;
  transition: transform var(--motion-micro) ease-out;
}

.btn-gold:hover { transform: translateY(-1px); }

/* ══════════════════════════════════════════════════════════
   BADGES
   ══════════════════════════════════════════════════════════ */

.badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: var(--radius-full);
  font-family: var(--font-mono);
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  line-height: 1;
}

.badge-cyan,
.badge-ice,
.badge-green {
  background: rgba(14, 140, 95, 0.12);
  border: 1px solid rgba(14, 140, 95, 0.30);
  color: var(--color-success);
}

.badge-red {
  background: rgba(214, 69, 69, 0.12);
  border: 1px solid rgba(214, 69, 69, 0.30);
  color: var(--color-danger);
}

.badge-amber,
.badge-gold {
  background: rgba(230, 179, 37, 0.12);
  border: 1px solid rgba(230, 179, 37, 0.30);
  color: var(--color-gold);
}

.badge-blue,
.badge-indigo {
  background: rgba(59, 91, 140, 0.12);
  border: 1px solid rgba(59, 91, 140, 0.30);
  color: var(--color-info);
}

.badge-muted,
.badge-silver {
  background: var(--surface);
  border: 1px solid var(--border-subtle);
  color: var(--fg-70);
}

/* ══════════════════════════════════════════════════════════
   FORM INPUTS
   ══════════════════════════════════════════════════════════ */

.input-field {
  width: 100%;
  height: 44px;
  padding: 0 var(--space-4);
  background: var(--surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  color: var(--fg);
  font-family: var(--font-body);
  font-size: 14px;
  outline: none;
  transition: border-color var(--motion-micro) ease-out,
              box-shadow var(--motion-micro) ease-out;
}

.input-field::placeholder { color: var(--fg-55); }

.input-field:focus {
  border-color: var(--fg);
  box-shadow: 0 0 0 3px var(--fg-15);
}

textarea.input-field {
  height: auto;
  min-height: 96px;
  padding: var(--space-2) var(--space-4);
  resize: vertical;
  line-height: 1.5;
}

select.input-field {
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='currentColor' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  padding-right: 36px;
}

/* ══════════════════════════════════════════════════════════
   DATA TABLE
   ══════════════════════════════════════════════════════════ */

.data-table { width: 100%; border-collapse: collapse; }

.data-table thead th {
  font-family: var(--font-mono);
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--fg-55);
  padding: var(--space-2) var(--space-4);
  text-align: left;
  border-bottom: 1px solid var(--border-subtle);
}

.data-table tbody td {
  padding: var(--space-3) var(--space-4);
  font-size: 14px;
  color: var(--fg);
  border-bottom: 1px solid var(--border-subtle);
}

.data-table tbody tr { transition: background var(--motion-micro) ease-out; }
.data-table tbody tr:hover { background: var(--surface); }

/* ══════════════════════════════════════════════════════════
   NAVIGATION (legacy nav-item usata in Dashboard/LaRosa — mantenuta)
   ══════════════════════════════════════════════════════════ */

.nav-item {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: 10px 14px;
  border-radius: var(--radius-md);
  font-family: var(--font-body);
  font-size: 13px;
  font-weight: 500;
  color: var(--fg-70);
  cursor: pointer;
  transition: background var(--motion-micro) ease-out, color var(--motion-micro) ease-out;
  border: none;
  background: none;
  text-decoration: none;
  width: 100%;
}

.nav-item:hover {
  background: var(--surface);
  color: var(--fg);
}

.nav-item.active {
  background: var(--surface-hover);
  color: var(--fg);
  font-weight: 600;
}

.nav-group-label {
  font-family: var(--font-mono);
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--fg-55);
  padding: var(--space-4) var(--space-4) var(--space-1);
}

/* ══════════════════════════════════════════════════════════
   EMPTY STATE
   ══════════════════════════════════════════════════════════ */

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 64px var(--space-6);
  text-align: center;
}

.empty-state-icon {
  font-size: 48px;
  opacity: 0.5;
  margin-bottom: var(--space-4);
}

.empty-state-title {
  font-family: var(--font-display);
  font-size: 18px;
  font-weight: 700;
  color: var(--fg);
  margin-bottom: var(--space-1);
}

.empty-state-desc {
  font-family: var(--font-body);
  font-size: 14px;
  color: var(--fg-70);
  max-width: 320px;
  line-height: 1.5;
}

/* ══════════════════════════════════════════════════════════
   AI RESPONSE (mantenuta finché AI Coach non viene restylata in Fase 3)
   ══════════════════════════════════════════════════════════ */

.ai-response {
  background: var(--surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  padding: var(--space-4);
  position: relative;
}

.ai-response::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--color-gold);
  border-radius: var(--radius-md) var(--radius-md) 0 0;
}

/* ══════════════════════════════════════════════════════════
   STAT BAR
   ══════════════════════════════════════════════════════════ */

.stat-bar {
  width: 100%;
  height: 6px;
  background: var(--surface);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.stat-bar-fill {
  height: 100%;
  background: var(--fg);
  border-radius: var(--radius-full);
  transition: width var(--motion-expressive) var(--ease-standard);
}

.stat-bar-fill--gold { background: var(--color-gold); }

/* ══════════════════════════════════════════════════════════
   VOTE DOT
   ══════════════════════════════════════════════════════════ */

.vote-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
}

/* ══════════════════════════════════════════════════════════
   PITCH
   ══════════════════════════════════════════════════════════ */

.pitch {
  background: linear-gradient(180deg, #0E3A24 0%, #0A2D1B 50%, #0E3A24 100%);
  border-radius: var(--radius-lg);
  position: relative;
  overflow: hidden;
}

/* ══════════════════════════════════════════════════════════
   BAR CHART
   ══════════════════════════════════════════════════════════ */

.bar-chart {
  display: flex;
  align-items: flex-end;
  gap: 4px;
  height: 100%;
}

.bar-chart-bar {
  flex: 1;
  background: var(--fg);
  border-radius: 3px 3px 0 0;
  transition: height var(--motion-standard) var(--ease-standard);
  min-width: 4px;
}

/* ══════════════════════════════════════════════════════════
   SKELETON LOADING
   ══════════════════════════════════════════════════════════ */

.skeleton {
  background: linear-gradient(
    90deg,
    var(--fg-04) 25%,
    var(--fg-08) 50%,
    var(--fg-04) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s ease-in-out infinite;
  border-radius: var(--radius-sm);
}

/* ══════════════════════════════════════════════════════════
   MODAL
   ══════════════════════════════════════════════════════════ */

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  animation: fadeIn 0.2s ease-out;
}

.modal-box {
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  max-width: 480px;
  width: 90%;
  max-height: 85vh;
  overflow-y: auto;
  animation: slideUp var(--motion-modal) var(--ease-out-expo);
}

/* ══════════════════════════════════════════════════════════
   SCROLL REVEAL (mantenuta)
   ══════════════════════════════════════════════════════════ */

.reveal {
  opacity: 0;
  transform: translateY(12px);
  transition: opacity 0.3s var(--ease-out-expo), transform 0.3s var(--ease-out-expo);
}

.reveal.visible {
  opacity: 1;
  transform: translateY(0);
}

.reveal-stagger > * {
  opacity: 0;
  transform: translateY(12px);
  transition: opacity 0.3s var(--ease-out-expo), transform 0.3s var(--ease-out-expo);
}

.reveal-stagger.visible > *:nth-child(1) { transition-delay: 0ms;   opacity: 1; transform: translateY(0); }
.reveal-stagger.visible > *:nth-child(2) { transition-delay: 50ms;  opacity: 1; transform: translateY(0); }
.reveal-stagger.visible > *:nth-child(3) { transition-delay: 100ms; opacity: 1; transform: translateY(0); }
.reveal-stagger.visible > *:nth-child(4) { transition-delay: 150ms; opacity: 1; transform: translateY(0); }
.reveal-stagger.visible > *:nth-child(5) { transition-delay: 200ms; opacity: 1; transform: translateY(0); }
.reveal-stagger.visible > *:nth-child(6) { transition-delay: 250ms; opacity: 1; transform: translateY(0); }

/* ══════════════════════════════════════════════════════════
   KEYFRAMES
   ══════════════════════════════════════════════════════════ */

@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes slideUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
@keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
@keyframes spin { to { transform: rotate(360deg); } }
@keyframes countUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }

/* Pulsazione deadline (rosso danger) — sostituisce le vecchie pulseGlow/pulseGold */
@keyframes pulseDanger {
  0%, 100% { box-shadow: 0 0 0 0 rgba(214, 69, 69, 0.35); }
  50%      { box-shadow: 0 0 0 8px rgba(214, 69, 69, 0.00); }
}

/* Legacy: se rimangono riferimenti a .chrome-line, li rendiamo invisibili
   senza rompere i layout finché non li rimuoviamo in Fase 2 */
.chrome-line { position: relative; }
.chrome-line::before { content: none; }

/* ══════════════════════════════════════════════════════════
   RESPONSIVE
   ══════════════════════════════════════════════════════════ */

@media (max-width: 768px) {
  .floating-panel {
    top: 8px;
    left: 8px;
    right: 8px;
    bottom: 80px;
    border-radius: var(--radius-md);
  }

  .page-content { padding: var(--space-4); }
  .panel-header { padding: 12px 16px; }
  .glass-card   { padding: var(--space-4); }

  .bottom-nav {
    width: calc(100% - 16px);
    bottom: calc(8px + env(safe-area-inset-bottom, 0px));
  }
}

@media (min-width: 769px) and (max-width: 1024px) {
  .floating-panel {
    top: 12px;
    left: 12px;
    right: 12px;
    bottom: 88px;
  }
}
```

- [ ] **Step 2: Build check**

Run: `npm run build`
Expected: exit code 0. Se fallisce per un `@import` perso o una sintassi errata, rileggere l'output dell'errore e correggere.

- [ ] **Step 3: Smoke manuale**

Run: `npm run dev` → apri http://localhost:5173.

Visualmente cosa aspettarsi:
- Lo sfondo diventa **Plum** (`#381932`) in dark (default sistema macOS/Windows impostati su dark) o **Milk** (`#FFF3E6`) in light
- I titoli ora sono in **Unbounded** (font geometrico, moderno) invece di Plus Jakarta Sans
- Il body è in **Inter**
- Le pagine **appariranno ibride**: il Dock in basso è ancora il vecchio (glassmorphism), i button "btn-primary" sono ora piatti Milk-on-Plum
- **La Dashboard potrebbe avere pezzi visivamente spurie** — non è un bug di Fase 1, si risolve in Fase 2

Se il build fallisce, **NON procedere**: debuggare prima.

- [ ] **Step 4: Commit**

```bash
git add src/styles/design-system.css
git commit -m "feat(restyle): rewrite design-system.css con Stadium Electric tokens

Sostituisce palette green+indigo con Plum/Milk, aggiunge light/dark mode
via html[data-theme], fonts Unbounded/Inter/JetBrains Mono, nuovi radius
e motion tokens. Mantiene alias legacy (--green, --indigo, --bg-deep…)
che rimappano sui nuovi token per non rompere le pagine esistenti
finché non vengono restylate nelle fasi successive."
```

---

## Task 3 — Tailwind v4 `@theme` block in `index.css`

Tailwind v4 non usa un `tailwind.config.js`: la configurazione avviene in CSS via `@theme {}`. Il file attuale fa solo due import; va arricchito per esporre i nuovi token come classi utility (`bg-plum`, `text-fg`, `font-display`, ecc.).

**Files:**
- Modify: `src/index.css`

- [ ] **Step 1: Sovrascrivere `src/index.css`**

```css
@import "tailwindcss";
@import "./styles/design-system.css";

/* ──────────────────────────────────────────────────────────
   Tailwind v4 · theme config
   Espone i design tokens come utility: bg-plum, text-fg,
   font-display, rounded-xl (28px), shadow-md, duration-standard…
   ────────────────────────────────────────────────────────── */
@theme {
  /* Colors — brand + semantic */
  --color-plum: #381932;
  --color-milk: #FFF3E6;
  --color-success: #0E8C5F;
  --color-danger:  #D64545;
  --color-gold:    #E6B325;
  --color-info:    #3B5B8C;

  /* Colors — runtime (seguono data-theme via var(--bg)/var(--fg)) */
  --color-bg: var(--bg);
  --color-fg: var(--fg);
  --color-fg-70: var(--fg-70);
  --color-fg-55: var(--fg-55);
  --color-fg-15: var(--fg-15);
  --color-fg-08: var(--fg-08);
  --color-surface: var(--surface);
  --color-border: var(--border);
  --color-border-subtle: var(--border-subtle);

  /* Font families */
  --font-display: 'Unbounded', system-ui, sans-serif;
  --font-body:    'Inter', system-ui, sans-serif;
  --font-mono:    'JetBrains Mono', ui-monospace, monospace;

  /* Radius */
  --radius-sm: 6px;
  --radius-md: 12px;
  --radius-lg: 18px;
  --radius-xl: 28px;

  /* Shadows — in dark (i token runtime cambiano già in light via :root override) */
  --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.25);
  --shadow-md: 0 8px 24px rgba(0, 0, 0, 0.35);
  --shadow-lg: 0 20px 60px rgba(0, 0, 0, 0.50);

  /* Durations + easings per utility transition-*/
  --default-transition-duration: 240ms;
  --default-transition-timing-function: cubic-bezier(0.2, 0.8, 0.2, 1);
}
```

**Nota tecnica:** `@theme` espone i token per le utility Tailwind. I valori runtime (`--color-bg: var(--bg)`) si aggiornano automaticamente quando `html[data-theme]` cambia — quindi `bg-bg` e `text-fg` sono theme-aware gratis. I valori statici (`--color-plum`, `--color-milk`) sono fissi e utili quando vuoi il colore brand indipendentemente dal tema.

- [ ] **Step 2: Build check**

Run: `npm run build`
Expected: exit code 0. Tailwind v4 potrebbe loggare warning se un `@theme` entry è duplicato o malformato — risolvere eventuali warning prima di procedere.

- [ ] **Step 3: Smoke manuale**

Run: `npm run dev`. Nessun cambiamento visivo atteso rispetto al Task 2 (questo task abilita utility nuove ma non le usa nessun componente ancora). Il build che passa è la verifica sufficiente.

- [ ] **Step 4: Commit**

```bash
git add src/index.css
git commit -m "feat(restyle): add Tailwind v4 @theme block con nuovi design tokens

Espone Plum/Milk/semantic colors, font families e radius come utility
Tailwind (bg-plum, text-fg, font-display, rounded-xl, ecc.).
I token runtime (--color-bg, --color-fg) seguono data-theme per utility
theme-aware automatiche."
```

---

## Task 4 — ThemeProvider context

Gestisce lo stato del tema (light/dark), lo persiste in `localStorage` e lo applica a `<html data-theme="...">`.

**Files:**
- Create: `src/contexts/ThemeContext.jsx`

- [ ] **Step 1: Creare la directory `src/contexts/`**

La directory `src/contexts/` non esiste ancora nel repo. Verificare con `ls src/contexts` prima; se fallisce, il File Write la crea automaticamente al prossimo step.

- [ ] **Step 2: Scrivere `src/contexts/ThemeContext.jsx`**

```jsx
import { createContext, useContext, useEffect, useState, useCallback } from 'react'

/**
 * Theme values:
 * - 'light' → palette Milk bg + Plum fg
 * - 'dark'  → palette Plum bg + Milk fg
 *
 * Resolution order:
 * 1. User choice persisted in localStorage('fantabrain-theme')
 * 2. prefers-color-scheme (sistema operativo)
 * 3. Fallback: 'dark'
 */

const STORAGE_KEY = 'fantabrain-theme'
const ThemeContext = createContext(null)

function resolveInitialTheme() {
  if (typeof window === 'undefined') return 'dark'
  const stored = window.localStorage.getItem(STORAGE_KEY)
  if (stored === 'light' || stored === 'dark') return stored
  if (window.matchMedia?.('(prefers-color-scheme: light)').matches) return 'light'
  return 'dark'
}

function applyThemeToHtml(theme) {
  if (typeof document === 'undefined') return
  document.documentElement.setAttribute('data-theme', theme)
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(resolveInitialTheme)

  // Applica il tema all'html al mount e a ogni cambio
  useEffect(() => {
    applyThemeToHtml(theme)
  }, [theme])

  // Reagisce al cambio del sistema operativo SOLO se l'utente
  // non ha ancora espresso una preferenza (nessun valore in localStorage)
  useEffect(() => {
    if (typeof window === 'undefined') return
    const mq = window.matchMedia('(prefers-color-scheme: light)')
    const onChange = (e) => {
      const stored = window.localStorage.getItem(STORAGE_KEY)
      if (stored === 'light' || stored === 'dark') return
      setThemeState(e.matches ? 'light' : 'dark')
    }
    mq.addEventListener?.('change', onChange)
    return () => mq.removeEventListener?.('change', onChange)
  }, [])

  const setTheme = useCallback((next) => {
    if (next !== 'light' && next !== 'dark') return
    window.localStorage.setItem(STORAGE_KEY, next)
    setThemeState(next)
  }, [])

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'light' ? 'dark' : 'light')
  }, [theme, setTheme])

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) {
    throw new Error('useTheme deve essere chiamato dentro <ThemeProvider>')
  }
  return ctx
}
```

- [ ] **Step 3: Build check**

Run: `npm run build`
Expected: exit code 0. Se fallisce con "can't resolve ./contexts/ThemeContext", ricontrollare il path (dovrebbe essere `src/contexts/ThemeContext.jsx`).

- [ ] **Step 4: Commit**

```bash
git add src/contexts/ThemeContext.jsx
git commit -m "feat(restyle): add ThemeProvider context per light/dark toggle

Risoluzione iniziale: localStorage > prefers-color-scheme > fallback dark.
Applica data-theme all'elemento html. Espone hook useTheme con
{ theme, setTheme, toggleTheme }. Reagisce al cambio prefers-color-scheme
solo se l'utente non ha ancora espresso una preferenza."
```

---

## Task 5 — Wire `ThemeProvider` in `main.jsx`

**Files:**
- Modify: `src/main.jsx`

- [ ] **Step 1: Aggiornare `src/main.jsx`**

Sostituire l'intero contenuto del file (attualmente 10 righe):

```jsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { ThemeProvider } from './contexts/ThemeContext.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>
);
```

- [ ] **Step 2: Build check**

Run: `npm run build`
Expected: exit code 0.

- [ ] **Step 3: Smoke manuale — verifica attributo `data-theme`**

Run: `npm run dev` → http://localhost:5173.

DevTools → Elements → ispeziona `<html>`. Deve avere `data-theme="dark"` (o `"light"` se il sistema è in chiaro).

In Console digitare:
```js
localStorage.setItem('fantabrain-theme', 'light')
location.reload()
```
Dopo il reload `<html>` deve avere `data-theme="light"`, lo sfondo deve essere Milk (`#FFF3E6`) e il testo Plum (`#381932`).

Pulire:
```js
localStorage.removeItem('fantabrain-theme')
location.reload()
```

- [ ] **Step 4: Commit**

```bash
git add src/main.jsx
git commit -m "feat(restyle): wrap App con ThemeProvider in main.jsx

Ora html[data-theme] viene settato al boot e reagisce al toggle dell'utente."
```

---

## Task 6 — Creare `BottomNav.jsx` (5 tab)

Nuovo componente floating nav che sostituisce `Dock.jsx`. 5 tab: Home, Schiera, Classif., News, AI. Si nasconde allo scroll-down (riusando `useScrollDirection`).

**Files:**
- Create: `src/components/layout/BottomNav.jsx`

- [ ] **Step 1: Scrivere il componente**

```jsx
import { NavLink } from 'react-router-dom'
import useScrollDirection from '../../hooks/useScrollDirection'

const TABS = [
  { path: '/',            icon: '⌂', label: 'Home' },
  { path: '/schieramento', icon: '⚽', label: 'Schiera' },
  { path: '/classifica',  icon: '≡', label: 'Classif.' },
  { path: '/news',        icon: '✦', label: 'News' },
  { path: '/ai-analisi',  icon: '◉', label: 'AI' },
]

export default function BottomNav() {
  const isScrollingDown = useScrollDirection()

  return (
    <nav
      className={`bottom-nav${isScrollingDown ? ' hidden' : ''}`}
      aria-label="Navigazione principale"
    >
      {TABS.map(({ path, icon, label }) => (
        <NavLink
          key={path}
          to={path}
          end={path === '/'}
          className={({ isActive }) => `bottom-nav-item${isActive ? ' active' : ''}`}
          aria-label={label}
        >
          <span className="bottom-nav-item-icon" aria-hidden="true">{icon}</span>
          <span className="bottom-nav-item-label">{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
```

**Dipendenze verificate:** il file `src/hooks/useScrollDirection.js` esiste già nel repo ed è usato dal `Dock` attuale. Se un'implementazione futura lo rimuovesse, questo componente si romperebbe — in tal caso sostituire con uno stato locale + `window.addEventListener('scroll', ...)`.

- [ ] **Step 2: Build check**

Run: `npm run build`
Expected: exit code 0.

- [ ] **Step 3: Smoke manuale (superficiale)**

Il componente non è ancora wired in `App.jsx`, quindi non è visibile. Il build che passa è la verifica sufficiente per questo step. Smoke visivo dettagliato avviene al Task 10.

- [ ] **Step 4: Commit**

```bash
git add src/components/layout/BottomNav.jsx
git commit -m "feat(restyle): add BottomNav floating a 5 tab

5 tab: Home / Schiera / Classif. / News / AI. Inversione colore
(Milk pieno in dark, Plum pieno in light). Nasconde allo scroll-down
via useScrollDirection. Sostituirà Dock.jsx al Task 10."
```

---

## Task 7 — Creare pagina placeholder `News.jsx`

Componente placeholder leggero per la route `/news`. Non implementa feed né logica — solo un empty state che comunica all'utente che la feature arriva in Fase 3.

**Files:**
- Create: `src/pages/News.jsx`

- [ ] **Step 1: Scrivere il componente**

```jsx
export default function News() {
  return (
    <div className="empty-state">
      <div className="empty-state-icon" aria-hidden="true">✦</div>
      <h1 className="empty-state-title">News</h1>
      <p className="empty-state-desc">
        Il feed Pulse della tua lega + AI Magazine arriva nella prossima
        versione. Restyle Fase 3.
      </p>
    </div>
  )
}
```

- [ ] **Step 2: Build check**

Run: `npm run build`
Expected: exit code 0.

- [ ] **Step 3: Commit**

```bash
git add src/pages/News.jsx
git commit -m "feat(restyle): add News.jsx placeholder per route /news

Empty state con copy italiano che annuncia il feed Pulse + AI Magazine
in arrivo nella Fase 3. Collegato al router al Task 10."
```

---

## Task 8 — Creare pagina placeholder `HubAnalisi.jsx`

Placeholder per `/hub/analisi` (fusione futura di War Room + Scouting + Statistiche).

**Files:**
- Create: `src/pages/HubAnalisi.jsx`

- [ ] **Step 1: Scrivere il componente**

```jsx
export default function HubAnalisi() {
  return (
    <div className="empty-state">
      <div className="empty-state-icon" aria-hidden="true">◈</div>
      <h1 className="empty-state-title">Hub Analisi</h1>
      <p className="empty-state-desc">
        War Room, Scouting e Statistiche confluiscono qui in un'unica vista.
        Disponibile nella Fase 3 del restyle.
      </p>
    </div>
  )
}
```

- [ ] **Step 2: Build check**

Run: `npm run build`
Expected: exit code 0.

- [ ] **Step 3: Commit**

```bash
git add src/pages/HubAnalisi.jsx
git commit -m "feat(restyle): add HubAnalisi.jsx placeholder per route /hub/analisi

Placeholder per la fusione di War Room + Scouting + Statistiche,
implementata nella Fase 3."
```

---

## Task 9 — Aggiornare `App.jsx` · swap Dock→BottomNav, nuove route, redirect /la-rosa

Tutto in un unico commit perché i cambi sono interdipendenti (rimuovere l'import di `Dock` senza aver aggiunto `BottomNav` causa crash).

**Files:**
- Modify: `src/App.jsx`

- [ ] **Step 1: Sovrascrivere `src/App.jsx`**

```jsx
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import FloatingPanel from './components/layout/FloatingPanel';
import BottomNav from './components/layout/BottomNav';
import Dashboard from './pages/Dashboard';
import AIAnalisi from './pages/AIAnalisi';
import Schieramento from './pages/Schieramento';
import Classifica from './pages/Classifica';
import Calendario from './pages/Calendario';
import Mercato from './pages/Mercato';
import Scouting from './pages/Scouting';
import WarRoom from './pages/WarRoom';
import Statistiche from './pages/Statistiche';
import News from './pages/News';
import HubAnalisi from './pages/HubAnalisi';
import Login from './pages/Login';
import Register from './pages/Register';
import WarroomShare from './pages/WarroomShare';
import LeagueCreation from './pages/LeagueCreation';
import LeagueSettings from './pages/LeagueSettings';
import LandingPage from './pages/LandingPage';
import useAppStore from './store/useAppStore';

function RequireAuth({ children }) {
  const token = useAppStore((s) => s.user.token);
  return token ? children : <Navigate to="/login" replace />;
}

/**
 * Redirect /la-rosa → /schieramento?tab=rosa
 * Mantiene i deep link esistenti e li traduce nella nuova IA
 * (La Rosa vive come sub-tab dentro Schieramento).
 */
function LaRosaRedirect() {
  const location = useLocation();
  const search = new URLSearchParams(location.search);
  search.set('tab', 'rosa');
  return <Navigate to={`/schieramento?${search.toString()}`} replace />;
}

function AppLayout() {
  return (
    <div className="app-layout">
      <FloatingPanel>
        <Routes>
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="ai-analisi" element={<AIAnalisi />} />
          <Route path="la-rosa" element={<LaRosaRedirect />} />
          <Route path="schieramento" element={<Schieramento />} />
          <Route path="classifica" element={<Classifica />} />
          <Route path="news" element={<News />} />
          <Route path="calendario" element={<Calendario />} />
          <Route path="mercato" element={<Mercato />} />
          <Route path="scouting" element={<Scouting />} />
          <Route path="war-room" element={<WarRoom />} />
          <Route path="statistiche" element={<Statistiche />} />
          <Route path="hub/analisi" element={<HubAnalisi />} />
          <Route path="crea-lega" element={<LeagueCreation />} />
          <Route path="impostazioni-lega" element={<LeagueSettings />} />
        </Routes>
      </FloatingPanel>
      <BottomNav />
    </div>
  );
}

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/warroom/:id" element={<WarroomShare />} />
        <Route path="/landing" element={<LandingPage />} />
        <Route path="/*" element={<RequireAuth><AppLayout /></RequireAuth>} />
      </Routes>
    </HashRouter>
  );
}
```

**Cosa è cambiato rispetto alla versione precedente del file:**
- Rimosso `import Dock from './components/layout/Dock'` → aggiunto `import BottomNav from './components/layout/BottomNav'`
- Rimosso `import LaRosa from './pages/LaRosa'` (la route `/la-rosa` ora è un redirect, non renderizza più il componente `<LaRosa />`). Il file `src/pages/LaRosa.jsx` resta sul disco: verrà riutilizzato dalla sub-tab "Rosa" di Schieramento in Fase 2, che lo importerà esplicitamente allora.
- Aggiunti import `News`, `HubAnalisi` e `useLocation`
- Aggiunto helper `LaRosaRedirect` che trasforma `/la-rosa?x=y` in `/schieramento?tab=rosa&x=y`
- Nella tabella `<Routes>` dentro `AppLayout`: `la-rosa` punta ora al redirect; aggiunte `news` e `hub/analisi`
- In `AppLayout`: `<Dock />` → `<BottomNav />`
- **NON toccato**: le route pubbliche (login, register, warroom/:id, landing) — restano identiche

- [ ] **Step 2: Build check**

Run: `npm run build`
Expected: exit code 0. Se il linter si lamenta di import non usato (es. `LaRosa`), rimuoverlo.

- [ ] **Step 3: Smoke manuale — routing**

Run: `npm run dev` → http://localhost:5173 (login con un account esistente oppure usare il token già in localStorage).

Checklist:
1. Visitare `#/` → la Home carica, in fondo si vede il nuovo **BottomNav** (Milk pieno in dark, Plum pieno in light) con 5 tab
2. Tap su "Schiera" → URL diventa `#/schieramento`, tab attiva evidenziata con inversione (Plum bg + Milk fg)
3. Tap su "Classif." → `#/classifica`
4. Tap su "News" → `#/news`, vedere l'empty state "Il feed Pulse…"
5. Tap su "AI" → `#/ai-analisi`, pagina AI Coach carica
6. Navigare manualmente a `#/la-rosa` nell'URL → redirige a `#/schieramento?tab=rosa` (la sub-tab non è ancora implementata — è Fase 2 — ma l'URL deve cambiare)
7. Navigare manualmente a `#/hub/analisi` → empty state HubAnalisi
8. Navigare manualmente a `#/war-room` → la vecchia pagina carica ancora (va bene, verrà consolidata in Fase 3)
9. Scroll down su una pagina con contenuto: la BottomNav si nasconde; scroll up: riappare

Se uno qualsiasi dei punti 1-7 fallisce con errore React/console, **NON committare**: debuggare prima.

- [ ] **Step 4: Commit**

```bash
git add src/App.jsx
git commit -m "feat(restyle): swap Dock→BottomNav, add routes /news e /hub/analisi

- BottomNav floating a 5 tab sostituisce il Dock vecchio
- Nuova route /news (placeholder Fase 3)
- Nuova route /hub/analisi (placeholder Fase 3)
- /la-rosa diventa redirect a /schieramento?tab=rosa
  (la sub-tab verrà implementata in Fase 2)
- Le route esistenti di War Room/Scouting/Statistiche restano
  attive: verranno consolidate nell'Hub in Fase 3"
```

---

## Task 10 — Smoke test finale + tag merge-ready

Ultimo giro completo per assicurarsi che Fase 1 sia ready per Fase 2.

**Files:** nessuno (solo verifica + tag git opzionale)

- [ ] **Step 1: Build pulito**

```bash
npm run build
```
Expected: exit code 0. Nessun warning critico di Tailwind o Vite. Nota la dimensione del bundle per confronto con la Fase 2.

- [ ] **Step 2: Smoke manuale completo**

Run: `npm run dev` → http://localhost:5173, autenticati.

Checklist funzionale (conforme a `.claude/rules/testing.md`):

- [ ] Dashboard carica senza errori in console
- [ ] `/la-rosa` redirige a `/schieramento?tab=rosa` (nessun errore)
- [ ] `/schieramento` carica, il formation editor con @dnd-kit funziona ancora (drag&drop giocatore)
- [ ] `/ai-analisi` — scrivere un prompt qualsiasi, verificare che la chiamata AI risponda e il contatore crediti si decrementa (come prima)
- [ ] `/crea-lega` — il form multi-step si apre e compila
- [ ] Badge "GIORNATA N" nella Topbar (se presente) mostra un numero reale
- [ ] BottomNav: ogni tap cambia URL e highlighta la tab corretta
- [ ] Toggle tema: in Console `localStorage.setItem('fantabrain-theme','light'); location.reload()` → sfondo Milk, testo Plum, BottomNav Plum pieno
- [ ] Ripristino: `localStorage.removeItem('fantabrain-theme'); location.reload()` → torna al tema di sistema
- [ ] DevTools mobile viewport 375×812 → niente overflow orizzontale, BottomNav ben posizionata

Regressioni visive accettate (saranno risolte in Fase 2/3):
- Le card della Dashboard appaiono piatte/monocromatiche (perdono i gradient green→indigo vecchi) → OK
- Il `panel-title` nella header non è più animato → OK
- Alcuni badge/button possono sembrare "spenti" rispetto a prima → OK

Se **qualsiasi** elemento della checklist funzionale fallisce, aprire un follow-up task nel prossimo plan invece di forzare un fix dentro Fase 1.

- [ ] **Step 3: Tag git (opzionale ma utile)**

```bash
git tag restyle-phase-1-complete
git log --oneline -15
```

Dà un punto di ritorno sicuro prima di iniziare la Fase 2. Nessun push — il tag resta locale.

- [ ] **Step 4: Check finale su git**

```bash
git status
```

Expected: working tree invariato rispetto allo stato di partenza tranne per i commit della Fase 1. I file `.claude/settings.json`, `src/pages/Dashboard.jsx`, ecc. che erano già modificati all'inizio **devono ancora risultare `M`** — questo plan non li ha toccati.

---

## Self-Review

**1. Spec coverage:**

| Requisito spec | Task che lo implementa |
|---|---|
| §6.1 Palette Plum/Milk dark+light | Task 2 |
| §6.2 Semantic colors (success/danger/gold/info) | Task 2 |
| §6.3 Fonts Unbounded + Inter + JetBrains Mono | Task 1 (link) + Task 2 (tokens) |
| §6.4 Spacing 4px base | Task 2 |
| §6.5 Radius sm/md/lg/xl | Task 2 |
| §6.6 Shadow elevation (diverse light/dark) | Task 2 |
| §6.7 Motion micro/standard/expressive | Task 2 |
| §7.1 Route mapping (`/news`, `/hub/analisi` nuove, `/la-rosa` redirect) | Task 7, 8, 9 |
| §7.2 Bottom nav 5 tab | Task 6 + Task 9 |
| §11 Sostituzione `design-system.css` | Task 2 |
| §11 Nuovo `BottomNav.jsx` in place di `Dock.jsx` | Task 6 + Task 9 |
| §11 Tailwind `@theme` aggiornato | Task 3 |
| §12.6 Light mode default via prefers-color-scheme | Task 4 (`ThemeProvider`) |

Fuori scope Fase 1 (in Fase 2/3, esplicitamente non coperti da questo plan):
- Hero block, player token, deadline pill, pulse card, AI magazine cover (componenti riusabili §10) → Fase 2
- Match day flow redesign schermate Home/Schiera/Live/Recap/Classifica/News/AI (§8-9) → Fase 2+3
- `useNewsStore` Zustand persist (§11) → Fase 3
- Cleanup `Dock.jsx`, `FloatingPanel.jsx`, `PanelHeader.jsx` (§11 nota tecnica) → Fase 3

**2. Placeholder scan:** nessun "TBD", "TODO", "implement later". Tutti gli snippet di codice sono completi. Le testing convention (no Vitest) sono dichiarate esplicitamente nell'intro.

**3. Type consistency:** 
- `theme` valori: sempre `'light' | 'dark'` (Task 4, 5, 10)
- `data-theme` attribute: sempre su `<html>`, valori `'light'|'dark'` (Task 2 CSS selector + Task 4 applyThemeToHtml)
- `ThemeContext` shape: sempre `{ theme, setTheme, toggleTheme }` (Task 4 definizione, nessun consumer in Fase 1 — arriveranno in Fase 2 via header toggle)
- BottomNav tab paths: coincidono con le route in `App.jsx` (`/`, `/schieramento`, `/classifica`, `/news`, `/ai-analisi`)

**4. Ordine dei commit e rollback:**
Ogni task produce un commit isolato. Rollback a qualsiasi checkpoint è `git reset --hard <sha>`. Se Task 9 fallisce, i Task 1-8 restano utili sul branch senza rompere nulla (Dock continua a essere usato finché non lo si sostituisce).

---

## Execution Handoff

Plan complete e salvato in `docs/superpowers/plans/2026-04-19-fantabrain-restyle-phase-1-foundation.md`.

Due opzioni di esecuzione:

**1. Subagent-Driven (raccomandato)** — dispatch di un subagent fresco per ogni task, review tra un task e l'altro, iterazione veloce. Mantiene il contesto di questa sessione pulito.

**2. Inline Execution** — eseguo i task in questa stessa sessione usando `executing-plans`, con checkpoint di review ogni 2-3 task per ridurre context burn.

Quale preferisci?

---

**Prossimi plan** (non in questo file): dopo completamento Fase 1, torneremo qui per scrivere `2026-04-19-fantabrain-restyle-phase-2-match-day.md` (Home, Schiera, Classifica, match day components) e `2026-04-19-fantabrain-restyle-phase-3-content.md` (News feed, AI Coach restyle, Hub analisi consolidation, cleanup componenti legacy).
