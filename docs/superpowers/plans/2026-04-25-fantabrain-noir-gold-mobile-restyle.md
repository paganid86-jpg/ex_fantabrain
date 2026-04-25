# FantaBrain Noir Gold Mobile Restyle Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the approved Noir Gold minimal-lux mobile restyle for FantaBrain while preserving existing app logic, stores, routes, AI proxy rules and league localStorage behavior.

**Architecture:** The rollout is CSS/token-first, then page-by-page. Shared visual primitives are introduced in `src/components/patterns/`, existing React pages keep their data flow, and `src/styles/design-system.css` remains the single visual source of truth.

**Tech Stack:** React 19, React Router v6 HashRouter, Zustand, Vite 5, Tailwind CSS v4, CSS custom properties, existing Express backend.

---

## File Structure

- Modify `src/styles/design-system.css` - Add Noir Gold tokens, shell overrides, mobile-first components, and page-specific class refinements.
- Modify `src/components/layout/BottomNav.jsx` - Keep route behavior but simplify active nav styling through existing class names.
- Modify `src/components/layout/PanelHeader.jsx` - Keep header compact and aligned with Noir Gold credits/avatar treatment.
- Create `src/components/patterns/MetricHero.jsx` - Reusable hero metric for Home and future Classifica work.
- Create `src/components/patterns/SignalRow.jsx` - Compact state/action row for deadlines, formation completeness and risks.
- Create `src/components/patterns/NoirActionRow.jsx` - Two-action mobile CTA row with accessible primary and secondary links.
- Modify `src/pages/Dashboard.jsx` - Replace crowded quick-card emphasis with MetricHero, NoirActionRow and SignalRow.
- Modify `src/components/formation/FormationEditor.jsx` - Rename visible copy and keep existing drag/drop and slot picker behavior.
- Modify `src/pages/AIAnalisi.jsx` - Add context card and calmer layout while keeping backend-mediated AI calls and credits.
- Modify `src/pages/Classifica.jsx` - First cleanup pass: remove emoji tab labels and add semantic class hooks for a later ranked-card pass.
- Modify `src/pages/LeagueCreation.jsx` - First cleanup pass: remove emoji structural icons and add semantic class hooks for setup flow.
- Verify with `npm run build` and browser QA on mobile widths.

No persisted Zustand data structure changes are planned. If implementation discovers a store shape change is unavoidable, stop and add a migration plan before editing the store.

---

### Task 1: Add Noir Gold Foundation Tokens

**Files:**
- Modify: `src/styles/design-system.css`
- Test: `npm run build`

- [ ] **Step 1: Add Noir Gold token block near the existing token definitions**

Add these custom properties inside `:root` after the existing core palette tokens:

```css
  --color-noir: #0a090b;
  --color-noir-panel: #121013;
  --color-noir-elevated: #181417;
  --color-gold-light: #f0dba7;

  --noir-bg-glow:
    radial-gradient(circle at 20% -10%, rgba(216, 180, 106, 0.12), transparent 34%),
    radial-gradient(circle at 90% 18%, rgba(255, 243, 230, 0.05), transparent 30%),
    linear-gradient(135deg, #151015 0%, #080708 68%, #120f0c 100%);
  --noir-surface: rgba(255, 243, 230, 0.045);
  --noir-surface-hover: rgba(255, 243, 230, 0.075);
  --noir-border-subtle: rgba(255, 243, 230, 0.09);
  --noir-border: rgba(255, 243, 230, 0.14);
  --noir-border-gold: rgba(216, 180, 106, 0.26);
```

- [ ] **Step 2: Map semantic aliases to Noir Gold without removing legacy tokens**

Update existing aliases so new work can use stable names while older pages keep rendering:

```css
  --bg: var(--color-noir);
  --fg: var(--color-milk);
  --surface: var(--noir-surface);
  --surface-hover: var(--noir-surface-hover);
  --border-subtle: var(--noir-border-subtle);
  --border: var(--noir-border);
  --color-gold: #d8b46a;
  --color-success: #82aa8b;
  --color-danger: #d97872;
  --color-info: #7f92ad;
```

Keep `--color-plum` available for legacy/light-mode bridge classes.

- [ ] **Step 3: Simplify shell visuals**

Update shell classes without changing layout structure:

```css
body {
  background: var(--noir-bg-glow);
}

.floating-panel {
  background:
    linear-gradient(180deg, rgba(255, 243, 230, 0.045), rgba(255, 243, 230, 0.018)),
    rgba(10, 9, 11, 0.92);
  border-color: var(--noir-border-subtle);
  box-shadow: 0 28px 90px rgba(0, 0, 0, 0.34);
}

.page-content {
  background: transparent;
}
```

- [ ] **Step 4: Run build verification**

Run: `npm run build`  
Expected: Vite build completes successfully and writes `dist/`.

- [ ] **Step 5: Commit foundation**

```bash
git add src/styles/design-system.css
git commit -m "style: add noir gold design tokens"
```

---

### Task 2: Add Shared Noir Gold Pattern Components

**Files:**
- Create: `src/components/patterns/MetricHero.jsx`
- Create: `src/components/patterns/SignalRow.jsx`
- Create: `src/components/patterns/NoirActionRow.jsx`
- Modify: `src/styles/design-system.css`
- Test: `npm run build`

- [ ] **Step 1: Create `MetricHero.jsx`**

```jsx
import { Link } from 'react-router-dom';

export default function MetricHero({
  kicker,
  value,
  label,
  delta,
  action,
  tone = 'default',
}) {
  const deltaClass =
    delta == null ? '' : delta > 0 ? ' metric-hero__delta--pos' : delta < 0 ? ' metric-hero__delta--neg' : '';
  const deltaText =
    delta == null ? null : delta > 0 ? `+${delta} sulla media` : delta < 0 ? `${delta} sulla media` : 'in media';

  return (
    <section className={`metric-hero metric-hero--${tone}`}>
      {kicker && <span className="metric-hero__kicker">{kicker}</span>}
      <strong className="metric-hero__value">{value}</strong>
      <div className="metric-hero__footer">
        {label && <span>{label}</span>}
        {deltaText && <span className={`metric-hero__delta${deltaClass}`}>{deltaText}</span>}
      </div>
      {action && (
        <Link to={action.to} className="metric-hero__action">
          {action.label}
        </Link>
      )}
    </section>
  );
}
```

- [ ] **Step 2: Create `SignalRow.jsx`**

```jsx
import { Link } from 'react-router-dom';

export default function SignalRow({ tone = 'neutral', label, value, hint, to }) {
  const content = (
    <>
      <span className={`signal-row__dot signal-row__dot--${tone}`} aria-hidden="true" />
      <span className="signal-row__body">
        <span className="signal-row__label">{label}</span>
        {hint && <span className="signal-row__hint">{hint}</span>}
      </span>
      {value != null && <strong className="signal-row__value">{value}</strong>}
    </>
  );

  if (to) {
    return (
      <Link to={to} className={`signal-row signal-row--${tone}`} aria-label={`${label}${value != null ? `: ${value}` : ''}`}>
        {content}
      </Link>
    );
  }

  return <div className={`signal-row signal-row--${tone}`}>{content}</div>;
}
```

- [ ] **Step 3: Create `NoirActionRow.jsx`**

```jsx
import { Link } from 'react-router-dom';

export default function NoirActionRow({ primary, secondary }) {
  return (
    <div className="noir-action-row">
      <Link to={primary.to} className="noir-action noir-action--primary">
        {primary.label}
      </Link>
      {secondary && (
        <Link to={secondary.to} className="noir-action noir-action--secondary">
          {secondary.label}
        </Link>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Add component CSS**

Append these classes near the pattern library section:

```css
.metric-hero {
  position: relative;
  min-height: 190px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  gap: var(--space-2);
  padding: 18px;
  border: 1px solid var(--noir-border-gold);
  border-radius: 30px;
  background:
    radial-gradient(circle at 85% 0%, rgba(216, 180, 106, 0.19), transparent 42%),
    linear-gradient(180deg, rgba(255, 243, 230, 0.065), rgba(255, 243, 230, 0.02));
}

.metric-hero__kicker,
.signal-row__hint {
  color: var(--fg-55);
  font-family: var(--font-mono);
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.metric-hero__value {
  color: var(--fg);
  font-family: Georgia, 'Times New Roman', serif;
  font-size: clamp(72px, 20vw, 96px);
  font-weight: 400;
  letter-spacing: -0.07em;
  line-height: 0.82;
}

.metric-hero__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  color: var(--fg-70);
  font-size: 13px;
}

.metric-hero__delta--pos { color: var(--color-success); }
.metric-hero__delta--neg { color: var(--color-danger); }

.metric-hero__action {
  position: absolute;
  right: 16px;
  top: 16px;
  min-height: 38px;
  display: inline-flex;
  align-items: center;
  padding: 0 12px;
  border-radius: var(--radius-full);
  background: rgba(216, 180, 106, 0.12);
  color: var(--color-gold-light);
  font-weight: 850;
  text-decoration: none;
}

.signal-row {
  min-height: 56px;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: var(--space-3);
  padding: 10px 12px;
  border: 1px solid var(--noir-border-subtle);
  border-radius: 18px;
  background: var(--noir-surface);
  color: var(--fg);
  text-decoration: none;
}

.signal-row__dot {
  width: 8px;
  height: 8px;
  border-radius: var(--radius-full);
  background: var(--color-gold);
}

.signal-row__dot--success { background: var(--color-success); }
.signal-row__dot--danger { background: var(--color-danger); }
.signal-row__dot--warning,
.signal-row__dot--gold { background: var(--color-gold); }

.signal-row__body {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.signal-row__label {
  overflow-wrap: anywhere;
  font-size: 13px;
  font-weight: 780;
}

.signal-row__value {
  font-family: var(--font-mono);
  font-size: 11px;
}

.noir-action-row {
  display: grid;
  grid-template-columns: minmax(0, 1.15fr) minmax(0, 0.85fr);
  gap: 10px;
}

.noir-action {
  min-height: 54px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 18px;
  font-size: 14px;
  font-weight: 900;
  text-decoration: none;
}

.noir-action--primary {
  background: linear-gradient(135deg, var(--color-gold-light), var(--color-gold));
  color: #16100b;
}

.noir-action--secondary {
  border: 1px solid var(--noir-border-subtle);
  background: var(--noir-surface);
  color: var(--fg);
}
```

- [ ] **Step 5: Run build verification**

Run: `npm run build`  
Expected: build succeeds with no missing imports.

- [ ] **Step 6: Commit pattern components**

```bash
git add src/components/patterns/MetricHero.jsx src/components/patterns/SignalRow.jsx src/components/patterns/NoirActionRow.jsx src/styles/design-system.css
git commit -m "feat: add noir gold pattern components"
```

---

### Task 3: Restyle Home Dashboard

**Files:**
- Modify: `src/pages/Dashboard.jsx`
- Modify: `src/styles/design-system.css`
- Test: `npm run build`, browser QA at 375px and 430px

- [ ] **Step 1: Replace imports in `Dashboard.jsx`**

Replace the current pattern imports:

```jsx
import HeroBlock from '../components/patterns/HeroBlock';
import DeadlinePill from '../components/patterns/DeadlinePill';
import QuickCard from '../components/patterns/QuickCard';
```

with:

```jsx
import MetricHero from '../components/patterns/MetricHero';
import SignalRow from '../components/patterns/SignalRow';
import NoirActionRow from '../components/patterns/NoirActionRow';
```

Keep `NewsPreviewStub` unchanged for this pass.

- [ ] **Step 2: Replace the main dashboard markup after the league gate**

Use this structure for the returned JSX:

```jsx
return (
  <div className="home-stack home-stack--noir">
    <section className="home-noir-intro">
      <div className="home-noir-topline">
        <span className="kicker">
          GIORNATA {giornataCorrente ?? '-'} · {currentLeague.nome}
        </span>
        <span className="home-noir-credit">{aiCrediti} crediti AI</span>
      </div>
      <h1 className="home-noir-title">
        Ciao {userName}. {phrase}
      </h1>
    </section>

    <MetricHero
      kicker={
        ultimaGiocata
          ? `GIORNATA ${ultimaGiocata.giornata} · PUNTI`
          : 'PUNTI · NESSUNA GIOCATA'
      }
      value={puntiUltima ?? '—'}
      delta={diff}
      label={puntiUltima != null ? 'ultima giornata' : 'nessun dato'}
    />

    <NoirActionRow
      primary={{ label: 'Schiera ora', to: '/schieramento' }}
      secondary={{ label: 'Coach', to: '/ai-analisi' }}
    />

    <section className="home-noir-signals" aria-label="Segnali giornata">
      <SignalRow
        tone="gold"
        label="Deadline schieramento"
        value={deadline.toLocaleDateString('it-IT', { weekday: 'short', day: 'numeric', month: 'short' })}
        hint="Controlla prima del blocco"
        to="/schieramento"
      />
      <SignalRow
        tone={infortunati > 0 ? 'danger' : 'success'}
        label="Rischi rosa"
        value={infortunati}
        hint={infortunati > 0 ? 'giocatori da valutare' : 'nessun infortunio'}
        to="/la-rosa"
      />
      <SignalRow
        tone="neutral"
        label="Posizione lega"
        value={posizione ? `${posizione}/${classifica.length}` : '—'}
        hint={posizione ? 'classifica aggiornata' : 'non disponibile'}
        to="/classifica"
      />
    </section>

    <NewsPreviewStub players={rosa} />
  </div>
);
```

- [ ] **Step 3: Add Home Noir CSS**

Append:

```css
.home-stack--noir {
  position: relative;
  margin: calc(var(--space-4) * -1);
  min-height: calc(100% + var(--space-8));
  padding: 18px;
  background: transparent;
}

.home-noir-intro {
  display: grid;
  gap: var(--space-3);
}

.home-noir-topline {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
}

.home-noir-credit {
  min-height: 34px;
  display: inline-flex;
  align-items: center;
  padding: 0 10px;
  border: 1px solid var(--noir-border-subtle);
  border-radius: var(--radius-full);
  background: var(--noir-surface);
  color: var(--fg-70);
  font-size: 11px;
  font-weight: 800;
  white-space: nowrap;
}

.home-noir-title {
  color: var(--fg);
  font-family: Georgia, 'Times New Roman', serif;
  font-size: clamp(36px, 10vw, 48px);
  font-weight: 400;
  letter-spacing: -0.055em;
  line-height: 0.96;
}

.home-noir-signals {
  display: grid;
  gap: var(--space-2);
}
```

- [ ] **Step 4: Run build verification**

Run: `npm run build`  
Expected: build succeeds.

- [ ] **Step 5: Browser QA**

Start dev server: `npm run dev`  
Open `http://localhost:5173/#/` with an authenticated local state. Check:

- active league state shows title, hero, action row and signals;
- no active league state still shows `Crea lega` and `Unisciti`;
- 375px width has no horizontal scroll;
- `Schiera ora`, `Coach`, signal rows and bottom nav are tappable.

- [ ] **Step 6: Commit Home**

```bash
git add src/pages/Dashboard.jsx src/styles/design-system.css
git commit -m "feat: restyle dashboard with noir gold home"
```

---

### Task 4: Restyle Bottom Nav and Header Chrome

**Files:**
- Modify: `src/components/layout/BottomNav.jsx`
- Modify: `src/components/layout/PanelHeader.jsx`
- Modify: `src/styles/design-system.css`
- Test: `npm run build`, browser QA navigation

- [ ] **Step 1: Keep labels unchanged in `BottomNav.jsx`**

Confirm `TABS` remains:

```jsx
const TABS = [
  { path: '/', icon: 'home', label: 'Home' },
  { path: '/schieramento', icon: 'pitch', label: 'Schiera' },
  { path: '/classifica', icon: 'table', label: 'Classif.' },
  { path: '/news', icon: 'pulse', label: 'News' },
  { path: '/ai-analisi', icon: 'spark', label: 'AI', orbital: true },
];
```

- [ ] **Step 2: Update nav CSS**

Replace the heavy active gold treatment with translucent milk:

```css
.bottom-nav {
  background: rgba(10, 9, 11, 0.74);
  border: 1px solid var(--noir-border-subtle);
  box-shadow: 0 18px 44px rgba(0, 0, 0, 0.36);
  backdrop-filter: blur(18px);
}

.bottom-nav-item {
  min-height: 50px;
  color: var(--fg-55);
}

.bottom-nav-item:hover {
  background: var(--noir-surface-hover);
  color: var(--fg);
}

.bottom-nav-item.active {
  background: rgba(255, 243, 230, 0.12);
  color: var(--fg);
  box-shadow: none;
}

.bottom-nav-item.active .bottom-nav-item-icon-wrap {
  background: rgba(255, 243, 230, 0.08);
}
```

Keep the AI mark CSS, but change any full gold active fill to translucent unless the orbital menu is open.

- [ ] **Step 3: Compact `PanelHeader` visuals**

Keep JSX data flow as-is. Update CSS:

```css
.panel-header {
  border-bottom: 1px solid var(--noir-border-subtle);
  background: rgba(10, 9, 11, 0.58);
}

.panel-brand-mark {
  background: rgba(216, 180, 106, 0.12);
  color: var(--color-gold-light);
  border-color: var(--noir-border-gold);
}

.panel-ai-credits,
.panel-status,
.panel-avatar {
  background: var(--noir-surface);
  border-color: var(--noir-border-subtle);
  color: var(--fg-70);
}
```

- [ ] **Step 4: Run build verification**

Run: `npm run build`  
Expected: build succeeds.

- [ ] **Step 5: Browser QA**

Check routes:

- `/#/`
- `/#/schieramento`
- `/#/classifica`
- `/#/news`
- `/#/ai-analisi`

Expected: active tab is visible, labels fit, nav does not cover content after scrolling.

- [ ] **Step 6: Commit navigation chrome**

```bash
git add src/components/layout/BottomNav.jsx src/components/layout/PanelHeader.jsx src/styles/design-system.css
git commit -m "style: refine noir gold app chrome"
```

---

### Task 5: Restyle Schieramento

**Files:**
- Modify: `src/components/formation/FormationEditor.jsx`
- Modify: `src/styles/design-system.css`
- Test: `npm run build`, browser QA on `/#/schieramento`

- [ ] **Step 1: Update visible copy only in `FormationEditor.jsx`**

Change:

```jsx
<span className="lineup-studio-kicker">Lineup Studio</span>
<h2 className="lineup-studio-title">Schiera</h2>
```

to:

```jsx
<span className="lineup-studio-kicker">Studio XI</span>
<h2 className="lineup-studio-title">Forma il tuo undici.</h2>
```

Keep all DnD, slot and picker logic unchanged.

- [ ] **Step 2: Add Noir Gold Schieramento CSS overrides**

Append after current Schieramento luxury section:

```css
.schiera-page {
  background:
    radial-gradient(circle at 50% -10%, rgba(216, 180, 106, 0.12), transparent 34%),
    linear-gradient(180deg, #141114 0%, #09080a 100%);
}

.lineup-studio-title {
  max-width: 320px;
  color: var(--fg);
  font-family: Georgia, 'Times New Roman', serif;
  font-size: clamp(36px, 10vw, 46px);
  font-weight: 400;
  letter-spacing: -0.055em;
  line-height: 0.96;
}

.schiera-page .campo-toolbar--luxury {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 9px;
}

.schiera-page .modulo-chip,
.schiera-page .campo-kpi {
  min-height: 62px;
  border-radius: 20px;
  background: var(--noir-surface);
  border-color: var(--noir-border-subtle);
}

.schiera-page .modulo-chip__label,
.schiera-page .campo-kpi__label {
  color: var(--fg-55);
}

.pitch--luxury {
  min-height: 430px;
  border-radius: 32px;
  background:
    linear-gradient(90deg, transparent 49.5%, rgba(255, 243, 230, 0.15) 50%, transparent 50.5%),
    radial-gradient(circle at 50% 50%, transparent 0 37px, rgba(255, 243, 230, 0.15) 38px 39px, transparent 40px),
    linear-gradient(180deg, #143929, #0d2119);
}

.schiera-page .bench-tray,
.schiera-page .formation-status-bar {
  background: var(--noir-surface);
  border-color: var(--noir-border-subtle);
}
```

- [ ] **Step 3: Verify empty roster state**

Open `/#/schieramento?tab=rosa` and `/#/schieramento`. Expected:

- empty rosa text remains visible;
- no mock players are introduced;
- bottom sheet still opens for module selection;
- player picker empty state says no compatible players when roster is empty.

- [ ] **Step 4: Run build verification**

Run: `npm run build`  
Expected: build succeeds.

- [ ] **Step 5: Commit Schieramento**

```bash
git add src/components/formation/FormationEditor.jsx src/styles/design-system.css
git commit -m "feat: restyle schieramento noir gold"
```

---

### Task 6: Restyle AI Coach

**Files:**
- Modify: `src/pages/AIAnalisi.jsx`
- Modify: `src/styles/design-system.css`
- Test: `npm run build`, browser QA on `/#/ai-analisi`

- [ ] **Step 1: Add context summary card in `AIAnalisi.jsx`**

Place this block after credit/gold strips and before `.coach-thread`:

```jsx
<div className="coach-context-card">
  <span className="coach-kicker">Contesto letto</span>
  <p>
    Rosa, giornata {giornataCorrente}, classifica
    {serieAContext ? ' e dati Serie A reali.' : '.'}
  </p>
</div>
```

- [ ] **Step 2: Change title copy**

Change:

```jsx
<h1 className="coach-title">AI Coach</h1>
<p className="coach-subtitle">
  Giornata {giornataCorrente} · lettura contestuale sulla tua rosa.
</p>
```

to:

```jsx
<h1 className="coach-title">Coach, senza rumore.</h1>
<p className="coach-subtitle">
  Giornata {giornataCorrente} · analisi privata sulla tua rosa.
</p>
```

- [ ] **Step 3: Add Coach Noir CSS**

Append:

```css
.coach-page {
  background: transparent;
}

.coach-shell,
.coach-side-card {
  background:
    linear-gradient(180deg, rgba(255, 243, 230, 0.045), transparent 70%),
    var(--noir-surface);
  border-color: var(--noir-border-subtle);
}

.coach-title,
.coach-empty h2,
.coach-side-card h2 {
  color: var(--fg);
  font-family: Georgia, 'Times New Roman', serif;
  font-weight: 400;
  letter-spacing: -0.055em;
}

.coach-context-card {
  margin: 0 18px;
  padding: 14px;
  border: 1px solid var(--noir-border-gold);
  border-radius: 22px;
  background:
    linear-gradient(135deg, rgba(216, 180, 106, 0.14), rgba(255, 243, 230, 0.035));
}

.coach-context-card p {
  margin: 6px 0 0;
  color: var(--fg-70);
  font-size: 13px;
  line-height: 1.45;
}

.coach-message__bubble {
  background: var(--noir-surface);
  border-color: var(--noir-border-subtle);
}

.coach-message--user .coach-message__bubble {
  background: linear-gradient(135deg, var(--color-gold-light), var(--color-gold));
  color: #17100c;
}

.coach-prompt,
.coach-input {
  background: var(--noir-surface);
  border-color: var(--noir-border-subtle);
}
```

- [ ] **Step 4: Verify AI behavior remains unchanged**

Do not edit `chatClaude`, `buildSystemPrompt`, credit store calls, or API endpoint usage. In browser:

- empty chat shows prompt grid;
- quick prompt click adds a user message;
- no credits state shows lock message;
- reset conversation still appears only when messages exist.

- [ ] **Step 5: Run build verification**

Run: `npm run build`  
Expected: build succeeds.

- [ ] **Step 6: Commit AI Coach**

```bash
git add src/pages/AIAnalisi.jsx src/styles/design-system.css
git commit -m "feat: restyle ai coach noir gold"
```

---

### Task 7: First Cleanup for Classifica and League Creation

**Files:**
- Modify: `src/pages/Classifica.jsx`
- Modify: `src/pages/LeagueCreation.jsx`
- Modify: `src/styles/design-system.css`
- Test: `npm run build`, browser QA on `/#/classifica` and `/#/crea-lega`

- [ ] **Step 1: Remove emoji labels from Classifica tabs**

In `Classifica.jsx`, change the tab config from:

```jsx
[
  { val: 'lega',   label: '🏆 La mia Lega' },
  { val: 'seriea', label: '⚽ Serie A Reale' },
]
```

to:

```jsx
[
  { val: 'lega', label: 'La mia Lega' },
  { val: 'seriea', label: 'Serie A Reale' },
]
```

- [ ] **Step 2: Replace inline tab styles with class names**

Change each tab button class to:

```jsx
className={`segmented-tab${vista === t.val ? ' segmented-tab--active' : ''}`}
```

Keep the click handler unchanged.

- [ ] **Step 3: Add segmented tab CSS**

```css
.segmented-tab {
  min-height: 40px;
  padding: 0 16px;
  border: 1px solid var(--noir-border-subtle);
  border-radius: var(--radius-full);
  background: var(--noir-surface);
  color: var(--fg-70);
  font-family: var(--font-body);
  font-size: 13px;
  font-weight: 800;
}

.segmented-tab--active {
  border-color: var(--noir-border-gold);
  background: rgba(216, 180, 106, 0.12);
  color: var(--color-gold-light);
}
```

- [ ] **Step 4: Remove emoji structural icons from LeagueCreation home**

In `LeagueCreation.jsx`, replace:

```jsx
<div style={{ fontSize: '2.5rem', marginBottom: 'var(--space-sm)' }}>⚽</div>
```

with:

```jsx
<div className="league-choice-mark" aria-hidden="true">CL</div>
```

Replace:

```jsx
<div style={{ fontSize: '2.5rem', marginBottom: 'var(--space-sm)' }}>🔗</div>
```

with:

```jsx
<div className="league-choice-mark" aria-hidden="true">IN</div>
```

- [ ] **Step 5: Add league choice mark CSS**

```css
.league-choice-mark {
  width: 48px;
  height: 48px;
  display: inline-grid;
  place-items: center;
  margin-bottom: var(--space-sm);
  border: 1px solid var(--noir-border-gold);
  border-radius: 18px;
  background: rgba(216, 180, 106, 0.12);
  color: var(--color-gold-light);
  font-family: var(--font-mono);
  font-size: 13px;
  font-weight: 900;
}
```

- [ ] **Step 6: Run build verification**

Run: `npm run build`  
Expected: build succeeds.

- [ ] **Step 7: Commit cleanup**

```bash
git add src/pages/Classifica.jsx src/pages/LeagueCreation.jsx src/styles/design-system.css
git commit -m "style: clean classifica and league setup visuals"
```

---

### Task 8: Final Verification and Report

**Files:**
- Create: `reportskill/session-2026-04-25_noir-gold-implementation.md`
- Test: `npm run build`, browser QA

- [ ] **Step 1: Run production build**

Run: `npm run build`  
Expected: build succeeds.

- [ ] **Step 2: Start dev server**

Run: `npm run dev`  
Expected: Vite prints a local URL, usually `http://localhost:5173/`.

- [ ] **Step 3: Browser QA checklist**

Check these routes at 375px and 430px:

- `/#/`
- `/#/schieramento`
- `/#/schieramento?tab=rosa`
- `/#/classifica`
- `/#/ai-analisi`
- `/#/crea-lega`

Expected:

- no horizontal scroll;
- bottom nav does not cover important controls;
- primary actions are at least 44px high;
- text remains Italian;
- no structural emoji remain in touched screens;
- AI calls still go through existing `src/lib/claudeApi.js`;
- league flow stays localStorage-only.

- [ ] **Step 4: Inspect git diff**

Run: `git diff --stat HEAD~7..HEAD` or inspect the current branch diff against the base branch. Expected changed areas:

- `src/styles/design-system.css`
- `src/components/patterns/MetricHero.jsx`
- `src/components/patterns/SignalRow.jsx`
- `src/components/patterns/NoirActionRow.jsx`
- `src/pages/Dashboard.jsx`
- `src/components/formation/FormationEditor.jsx`
- `src/pages/AIAnalisi.jsx`
- `src/pages/Classifica.jsx`
- `src/pages/LeagueCreation.jsx`
- `reportskill/`

- [ ] **Step 5: Generate session report**

Create `reportskill/session-2026-04-25_noir-gold-implementation.md` containing:

- overview of Noir Gold implementation;
- files changed;
- verification commands and results;
- known limitations;
- next steps.

- [ ] **Step 6: Commit final report**

```bash
git add reportskill/session-2026-04-25_noir-gold-implementation.md
git commit -m "docs: add noir gold implementation report"
```

---

## Self-Review Notes

- Spec coverage: The plan covers tokens, shell, Home, Schieramento, AI Coach, Classifica cleanup, League setup cleanup, accessibility/mobile QA and reporting.
- Scope control: The plan preserves backend, store shape, AI proxy rules, football proxy rules and localStorage-only league behavior.
- Test reality: The repo has no configured test runner, so each task uses `npm run build` plus route-specific browser QA.
- Execution recommendation: Use subagent-driven development for Tasks 1-7 if parallel implementation is desired; otherwise execute inline with one commit per task.
