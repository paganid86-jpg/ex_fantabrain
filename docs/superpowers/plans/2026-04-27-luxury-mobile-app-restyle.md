# Luxury Mobile App Restyle Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply the approved Luxury Matchday OS restyle to the full FantaBrain app, with Private AI Coach styling reserved for `AIAnalisi`.

**Architecture:** Keep the current React Router, Zustand stores, backend proxies, and component structure. Centralize the visual language in `src/styles/design-system.css`, then update reusable shell/pattern components before page-level passes. Do not change persisted store structure or API call paths.

**Tech Stack:** React 19, React Router v6 `HashRouter`, Zustand, Tailwind CSS v4, Vite 5, Express backend.

---

## File Structure

Primary design-system file:

- Modify: `src/styles/design-system.css`
  - Owns Luxury Matchday OS tokens, shell layout, bottom nav, pattern classes, page classes, AI Coach styling, responsive behavior.

Shell and navigation:

- Modify: `src/components/layout/FloatingPanel.jsx`
- Modify: `src/components/layout/PanelHeader.jsx`
- Modify: `src/components/layout/BottomNav.jsx`

Reusable patterns:

- Modify: `src/components/patterns/MetricHero.jsx`
- Modify: `src/components/patterns/SignalRow.jsx`
- Modify: `src/components/patterns/NoirActionRow.jsx`
- Modify: `src/components/patterns/NewsPreviewStub.jsx`
- Modify: `src/components/patterns/SchieraTabBar.jsx`
- Modify: `src/components/patterns/BottomSheet.jsx`

Formation and roster:

- Modify: `src/pages/Schieramento.jsx`
- Modify: `src/pages/LaRosa.jsx`
- Modify: `src/components/formation/FormationEditor.jsx`
- Modify: `src/components/formation/FormationSlot.jsx`
- Modify: `src/components/formation/PlayerToken.jsx`
- Modify: `src/components/ui/AddPlayerModal.jsx`
- Modify: `src/components/ui/PlayerSearchInput.jsx`

Main pages:

- Modify: `src/pages/Dashboard.jsx`
- Modify: `src/pages/Classifica.jsx`
- Modify: `src/pages/Calendario.jsx`
- Modify: `src/pages/News.jsx`
- Modify: `src/pages/Mercato.jsx`
- Modify: `src/pages/Scouting.jsx`
- Modify: `src/pages/WarRoom.jsx`
- Modify: `src/pages/Statistiche.jsx`
- Modify: `src/pages/HubAnalisi.jsx`
- Modify: `src/pages/LeagueCreation.jsx`
- Modify: `src/pages/LeagueSettings.jsx`

AI Coach:

- Modify: `src/pages/AIAnalisi.jsx`

Verification artifacts:

- Do not commit `public/__brainstorm/`; it is a temporary browser board.
- No new production dependency is planned.

## Task 1: Design Tokens And Global Shell CSS

**Files:**
- Modify: `src/styles/design-system.css`

- [ ] **Step 1: Add Luxury Matchday OS token aliases near the existing `:root` tokens**

Add a single token section after the current core color variables. Keep existing token names intact so legacy classes continue to work.

```css
:root,
html[data-theme="dark"] {
  --lux-bg: #05070d;
  --lux-bg-deep: #02040a;
  --lux-panel: rgba(12, 16, 26, 0.88);
  --lux-panel-soft: rgba(255, 247, 234, 0.055);
  --lux-panel-hover: rgba(255, 247, 234, 0.085);
  --lux-line: rgba(255, 247, 234, 0.12);
  --lux-line-gold: rgba(245, 207, 114, 0.28);
  --lux-gold: #f5cf72;
  --lux-gold-soft: #fff0bc;
  --lux-milk: #fff7ea;
  --lux-muted: rgba(255, 247, 234, 0.66);
  --lux-dim: rgba(255, 247, 234, 0.44);
  --lux-ai: #9b64ff;
  --lux-ai-soft: rgba(155, 100, 255, 0.16);
  --lux-success: #37df96;
  --lux-danger: #ff6f7b;
  --lux-warning: #ffd65f;
  --lux-radius-card: 24px;
  --lux-radius-control: 18px;
  --lux-shadow: 0 24px 80px rgba(0, 0, 0, 0.42);
}
```

- [ ] **Step 2: Update app background and base typography**

Change `body` and `body::before` so the global app reads as black/gold with subtle AI violet. Preserve `font-family: var(--font-body)`.

```css
body {
  margin: 0;
  font-family: var(--font-body);
  font-size: 14px;
  line-height: 1.5;
  color: var(--lux-milk);
  background:
    radial-gradient(circle at 76% 12%, rgba(155, 100, 255, 0.16), transparent 34%),
    radial-gradient(circle at 18% -8%, rgba(245, 207, 114, 0.14), transparent 36%),
    linear-gradient(145deg, var(--lux-bg) 0%, #08111d 55%, var(--lux-bg-deep) 100%);
  min-height: 100vh;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body::before {
  content: '';
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  background:
    linear-gradient(rgba(255, 255, 255, 0.018) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.014) 1px, transparent 1px);
  background-size: 42px 42px;
  mask-image: radial-gradient(circle at 50% 20%, black, transparent 70%);
}
```

- [ ] **Step 3: Run the build to catch CSS syntax failures**

Run: `npm run build`

Expected: Vite completes with a production bundle. CSS warnings about large chunks are acceptable; syntax errors are not.

- [ ] **Step 4: Commit token baseline**

```bash
git add src/styles/design-system.css
git commit -m "style: add luxury mobile design tokens"
```

## Task 2: App Shell, Header, And Bottom Navigation

**Files:**
- Modify: `src/components/layout/FloatingPanel.jsx`
- Modify: `src/components/layout/PanelHeader.jsx`
- Modify: `src/components/layout/BottomNav.jsx`
- Modify: `src/styles/design-system.css`

- [ ] **Step 1: Update `PanelHeader` to expose Luxury OS structure**

Make sure the header renders logo, page context, credits, live status, and avatar. Keep Italian labels. Use Zustand default export import without braces.

```jsx
import { useLocation } from 'react-router-dom'
import useAppStore from '../../store/useAppStore'

const PAGE_META = {
  '/': { kicker: 'FANTABRAIN', title: 'Home' },
  '/dashboard': { kicker: 'FANTABRAIN', title: 'Home' },
  '/schieramento': { kicker: 'MATCH DAY', title: 'Schieramento' },
  '/classifica': { kicker: 'LEGA', title: 'Classifica' },
  '/news': { kicker: 'ROSA WIRE', title: 'News' },
  '/ai-analisi': { kicker: 'COACH PERSONALE', title: 'AI Coach' },
}

export default function PanelHeader() {
  const location = useLocation()
  const aiCrediti = useAppStore((state) => state.aiCrediti)
  const userName = useAppStore((state) => state.user?.name || 'DA')
  const meta = PAGE_META[location.pathname] || { kicker: 'FANTABRAIN', title: 'Console' }
  const initials = userName.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase()

  return (
    <header className="panel-header panel-header--luxury">
      <div className="panel-brand">
        <span className="panel-brand__mark" aria-hidden="true">FB</span>
        <span className="panel-brand__copy">
          <span>{meta.kicker}</span>
          <strong>{meta.title}</strong>
        </span>
      </div>
      <div className="panel-status">
        <span className="panel-status__pill">Crediti AI {aiCrediti}</span>
        <span className="panel-status__pill panel-status__pill--live">Live app</span>
        <span className="panel-status__avatar" aria-label={`Profilo ${initials}`}>{initials}</span>
      </div>
    </header>
  )
}
```

- [ ] **Step 2: Update `BottomNav` tab model**

Use five visible tabs: Home, Rosa, Partite, AI Assistant, Lega. Keep the orbital AI menu only if it does not obscure mobile nav; otherwise the AI tab navigates directly to `/ai-analisi`.

```jsx
const TABS = [
  { path: '/', icon: 'home', label: 'Home' },
  { path: '/schieramento?tab=rosa', icon: 'team', label: 'Rosa' },
  { path: '/schieramento', icon: 'pitch', label: 'Partite' },
  { path: '/ai-analisi', icon: 'spark', label: 'AI Assistant' },
  { path: '/impostazioni-lega', icon: 'trophy', label: 'Lega' },
]
```

Add `team` and `trophy` cases to `NavIcon` using the same inline SVG stroke pattern already used in the file.

- [ ] **Step 3: Add shell CSS**

Add or replace the shell/nav blocks in `src/styles/design-system.css`.

```css
.floating-panel {
  position: fixed;
  top: 8px;
  left: 50%;
  bottom: calc(var(--bottom-nav-height) + 10px + env(safe-area-inset-bottom, 0px));
  transform: translateX(-50%);
  width: min(100%, 560px);
  overflow: hidden;
  border: 1px solid rgba(255, 247, 234, 0.1);
  border-radius: 28px;
  background:
    linear-gradient(180deg, rgba(255, 247, 234, 0.055), rgba(255, 247, 234, 0.018)),
    rgba(5, 7, 13, 0.94);
  box-shadow: var(--lux-shadow);
}

.panel-header--luxury {
  min-height: 78px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 18px;
  border-bottom: 1px solid rgba(255, 247, 234, 0.08);
}

.panel-brand,
.panel-status {
  display: flex;
  align-items: center;
  min-width: 0;
}

.panel-brand { gap: 12px; }
.panel-status { gap: 8px; justify-content: flex-end; }

.panel-brand__mark {
  display: grid;
  place-items: center;
  width: 46px;
  height: 46px;
  flex: 0 0 auto;
  border: 1px solid rgba(245, 207, 114, 0.5);
  border-radius: 50%;
  color: var(--lux-gold);
  background: rgba(245, 207, 114, 0.055);
  font-weight: 950;
}

.panel-brand__copy span,
.lux-kicker {
  display: block;
  color: var(--lux-gold);
  font-family: var(--font-mono);
  font-size: 10px;
  font-weight: 900;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.panel-brand__copy strong {
  display: block;
  overflow: hidden;
  color: var(--lux-milk);
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 26px;
  line-height: 1;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.panel-status__pill,
.panel-status__avatar {
  min-height: 34px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(255, 247, 234, 0.14);
  border-radius: 999px;
  background: rgba(255, 247, 234, 0.055);
  color: var(--lux-milk);
  font-family: var(--font-mono);
  font-size: 10px;
  font-weight: 900;
  text-transform: uppercase;
  white-space: nowrap;
}

.panel-status__pill { padding: 0 12px; }
.panel-status__pill--live::before {
  content: '';
  width: 8px;
  height: 8px;
  margin-right: 7px;
  border-radius: 50%;
  background: var(--lux-success);
}
.panel-status__avatar { width: 36px; padding: 0; }
```

- [ ] **Step 4: Verify navigation with build**

Run: `npm run build`

Expected: Build succeeds and no import error appears for `useAppStore`.

- [ ] **Step 5: Commit shell changes**

```bash
git add src/components/layout/FloatingPanel.jsx src/components/layout/PanelHeader.jsx src/components/layout/BottomNav.jsx src/styles/design-system.css
git commit -m "style: restyle app shell navigation"
```

## Task 3: Reusable Luxury Page Patterns

**Files:**
- Modify: `src/components/patterns/MetricHero.jsx`
- Modify: `src/components/patterns/SignalRow.jsx`
- Modify: `src/components/patterns/NoirActionRow.jsx`
- Modify: `src/components/patterns/NewsPreviewStub.jsx`
- Modify: `src/components/patterns/SchieraTabBar.jsx`
- Modify: `src/components/patterns/BottomSheet.jsx`
- Modify: `src/styles/design-system.css`

- [ ] **Step 1: Add shared pattern class names without changing props**

For pattern components, keep existing props and add luxury class hooks. Example for `MetricHero`:

```jsx
return (
  <section className={`metric-hero metric-hero--luxury metric-hero--${tone}`}>
    {kicker && <span className="metric-hero__kicker lux-kicker">{kicker}</span>}
    <strong className="metric-hero__value">{value}</strong>
    <div className="metric-hero__footer">
      {label && <span>{label}</span>}
      {deltaText && <span className={`metric-hero__delta${deltaClass}`}>{deltaText}</span>}
    </div>
    {hasAction && (
      <Link to={action.to} className="metric-hero__action">
        {action.label}
      </Link>
    )}
  </section>
)
```

- [ ] **Step 2: Style metric, signal, action, tab, sheet, and news patterns**

Add pattern CSS:

```css
.home-stack,
.lux-page-stack {
  display: grid;
  gap: 16px;
}

.metric-hero--luxury,
.home-noir-signals,
.news-wire,
.bench-tray,
.formation-status-bar,
.bottom-sheet {
  border: 1px solid var(--lux-line);
  border-radius: var(--lux-radius-card);
  background:
    linear-gradient(180deg, rgba(255, 247, 234, 0.055), rgba(255, 247, 234, 0.022)),
    rgba(8, 12, 20, 0.76);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.055);
}

.metric-hero--luxury {
  position: relative;
  overflow: hidden;
  padding: 24px;
}

.metric-hero--luxury::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 82% 12%, rgba(245, 207, 114, 0.2), transparent 28%),
    radial-gradient(circle at 36% 92%, rgba(155, 100, 255, 0.14), transparent 34%);
  pointer-events: none;
}

.metric-hero__value {
  position: relative;
  display: block;
  color: var(--lux-gold-soft);
  font-family: Georgia, 'Times New Roman', serif;
  font-size: clamp(64px, 18vw, 104px);
  line-height: 0.9;
}

.signal-row,
.news-wire-card,
.player-picker-item,
.modulo-list-item {
  border: 1px solid rgba(255, 247, 234, 0.1);
  border-radius: var(--lux-radius-control);
  background: rgba(255, 247, 234, 0.045);
}

.noir-action-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.noir-action-row a:first-child {
  color: #07101b;
  background: linear-gradient(135deg, var(--lux-gold-soft), var(--lux-gold));
}

.schiera-tab-bar {
  border: 1px solid rgba(255, 247, 234, 0.1);
  border-radius: 999px;
  background: rgba(255, 247, 234, 0.055);
}
```

- [ ] **Step 3: Run build**

Run: `npm run build`

Expected: Build succeeds; existing props still satisfy all component calls.

- [ ] **Step 4: Commit pattern changes**

```bash
git add src/components/patterns src/styles/design-system.css
git commit -m "style: add luxury reusable page patterns"
```

## Task 4: Home Dashboard Restyle

**Files:**
- Modify: `src/pages/Dashboard.jsx`
- Modify: `src/components/patterns/NewsPreviewStub.jsx`
- Modify: `src/styles/design-system.css`

- [ ] **Step 1: Replace Home intro with Luxury Matchday hero structure**

Keep the current data calculations. Replace only the JSX structure inside the authenticated league branch.

```jsx
<section className="home-lux-hero">
  <div className="home-lux-hero__copy">
    <span className="lux-kicker">GIORNATA {giornataCorrente ?? '-'} · {leagueName}</span>
    <h1>Ciao {userName}. <span>{phrase}</span></h1>
    <p>L'AI ha analizzato i segnali della tua lega. Ecco cosa conta oggi per vincere.</p>
    <Link to="/ai-analisi" className="home-lux-hero__cta">Chiedi un consiglio all'AI</Link>
  </div>
  <div className="home-lux-hero__brain" aria-hidden="true">
    <span />
    <span />
    <span />
  </div>
</section>
```

- [ ] **Step 2: Add Home CSS**

```css
.home-lux-hero {
  position: relative;
  min-height: 320px;
  display: grid;
  align-items: end;
  overflow: hidden;
  padding: 28px 20px;
  border: 1px solid rgba(255, 247, 234, 0.12);
  border-radius: 28px;
  background:
    radial-gradient(circle at 78% 26%, rgba(155, 100, 255, 0.34), transparent 24%),
    radial-gradient(circle at 82% 44%, rgba(245, 207, 114, 0.18), transparent 30%),
    linear-gradient(145deg, rgba(255, 247, 234, 0.055), rgba(255, 247, 234, 0.018));
}

.home-lux-hero h1 {
  max-width: 11ch;
  margin: 12px 0;
  color: var(--lux-milk);
  font-family: Georgia, 'Times New Roman', serif;
  font-size: clamp(44px, 13vw, 68px);
  font-weight: 700;
  letter-spacing: 0;
}

.home-lux-hero h1 span {
  color: var(--lux-gold-soft);
}

.home-lux-hero p {
  max-width: 34ch;
  margin: 0 0 20px;
  color: var(--lux-muted);
  font-size: 16px;
}

.home-lux-hero__cta {
  min-height: 56px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 18px;
  border: 1px solid rgba(155, 100, 255, 0.28);
  border-radius: 999px;
  color: var(--lux-milk);
  background: rgba(155, 100, 255, 0.16);
  font-weight: 900;
  text-decoration: none;
}
```

- [ ] **Step 3: Verify empty league state remains Italian and usable**

Run: `npm run build`

Expected: Build succeeds. The empty state still links to `/crea-lega` and `/impostazioni-lega`.

- [ ] **Step 4: Commit Home changes**

```bash
git add src/pages/Dashboard.jsx src/components/patterns/NewsPreviewStub.jsx src/styles/design-system.css
git commit -m "style: restyle home dashboard luxury"
```

## Task 5: Schieramento And Rosa Restyle

**Files:**
- Modify: `src/pages/Schieramento.jsx`
- Modify: `src/pages/LaRosa.jsx`
- Modify: `src/components/formation/FormationEditor.jsx`
- Modify: `src/components/formation/FormationSlot.jsx`
- Modify: `src/components/formation/PlayerToken.jsx`
- Modify: `src/components/ui/AddPlayerModal.jsx`
- Modify: `src/components/ui/PlayerSearchInput.jsx`
- Modify: `src/styles/design-system.css`

- [ ] **Step 1: Keep formation logic unchanged and adjust labels only where needed**

In `FormationEditor`, keep DnD handlers, slot mapping, compatibility, and bench sorting. Update visible copy to match Luxury Matchday OS:

```jsx
<div className="lineup-studio-header">
  <div>
    <span className="lineup-studio-kicker lux-kicker">Match day</span>
    <h2 className="lineup-studio-title">Schiera il tuo undici.</h2>
  </div>
</div>
```

- [ ] **Step 2: Restyle pitch and slots**

Add CSS:

```css
.pitch--luxury {
  border: 1px solid rgba(245, 207, 114, 0.24);
  border-radius: 26px;
  background:
    radial-gradient(circle at 50% 42%, rgba(55, 223, 150, 0.14), transparent 34%),
    linear-gradient(145deg, rgba(6, 64, 45, 0.86), rgba(5, 18, 16, 0.94));
  box-shadow: inset 0 0 0 1px rgba(255, 247, 234, 0.06), 0 18px 48px rgba(0, 0, 0, 0.28);
}

.formation-slot {
  min-width: 64px;
  min-height: 86px;
  border: 1px solid rgba(255, 247, 234, 0.18);
  border-radius: 18px;
  background:
    linear-gradient(180deg, rgba(255, 247, 234, 0.08), rgba(255, 247, 234, 0.035)),
    rgba(7, 13, 22, 0.74);
}

.formation-slot--empty {
  border-color: rgba(245, 207, 114, 0.22);
}

.bench-tray {
  padding: 16px;
}
```

- [ ] **Step 3: Restyle roster and modal surfaces**

Use the same card, row, and pill visual language for `LaRosa`, `AddPlayerModal`, and `PlayerSearchInput`. Keep the rosa empty by default; do not import or add mock players.

```css
.add-player-modal,
.player-search-panel,
.rosa-card,
.roster-player-card {
  border: 1px solid var(--lux-line);
  border-radius: var(--lux-radius-card);
  background:
    linear-gradient(180deg, rgba(255, 247, 234, 0.055), rgba(255, 247, 234, 0.024)),
    rgba(8, 12, 20, 0.88);
}
```

- [ ] **Step 4: Verify formation interactions compile**

Run: `npm run build`

Expected: Build succeeds; no DnD imports or Zustand setters changed.

- [ ] **Step 5: Commit Schieramento/Rosa changes**

```bash
git add src/pages/Schieramento.jsx src/pages/LaRosa.jsx src/components/formation src/components/ui/AddPlayerModal.jsx src/components/ui/PlayerSearchInput.jsx src/styles/design-system.css
git commit -m "style: restyle formation and roster"
```

## Task 6: Data Pages And Decision Flows

**Files:**
- Modify: `src/pages/Classifica.jsx`
- Modify: `src/pages/Calendario.jsx`
- Modify: `src/pages/News.jsx`
- Modify: `src/pages/Mercato.jsx`
- Modify: `src/pages/Scouting.jsx`
- Modify: `src/pages/WarRoom.jsx`
- Modify: `src/pages/Statistiche.jsx`
- Modify: `src/pages/HubAnalisi.jsx`
- Modify: `src/pages/LeagueCreation.jsx`
- Modify: `src/pages/LeagueSettings.jsx`
- Modify: `src/components/ui/KpiCard.jsx`
- Modify: `src/components/ui/AlertItem.jsx`
- Modify: `src/components/ui/RankItem.jsx`
- Modify: `src/styles/design-system.css`

- [ ] **Step 1: Add a page wrapper convention**

Wrap page root containers with one of these existing-compatible classes:

```jsx
<div className="lux-page-stack">
  <section className="lux-page-hero">
    <span className="lux-kicker">Classifica</span>
    <h1>La tua corsa in lega.</h1>
    <p>Posizione, trend e segnali utili prima della prossima giornata.</p>
  </section>
  {/* existing page content */}
</div>
```

Use page-specific Italian headings:

- `Classifica`: "La tua corsa in lega."
- `Calendario`: "Il calendario della giornata."
- `News`: "News dalla tua rosa."
- `Mercato`: "Mercato sotto controllo."
- `Scouting`: "Scouting mirato."
- `WarRoom`: "Piano partita."
- `Statistiche`: "Numeri che contano."
- `HubAnalisi`: "Centro analisi."
- `LeagueCreation`: "Crea la tua lega."
- `LeagueSettings`: "Gestisci la lega."

- [ ] **Step 2: Add page wrapper CSS**

```css
.lux-page-hero {
  position: relative;
  overflow: hidden;
  padding: 22px;
  border: 1px solid rgba(255, 247, 234, 0.12);
  border-radius: 28px;
  background:
    radial-gradient(circle at 84% 12%, rgba(245, 207, 114, 0.16), transparent 30%),
    linear-gradient(180deg, rgba(255, 247, 234, 0.055), rgba(255, 247, 234, 0.022));
}

.lux-page-hero h1 {
  margin: 10px 0 8px;
  color: var(--lux-milk);
  font-family: Georgia, 'Times New Roman', serif;
  font-size: clamp(32px, 9vw, 48px);
  line-height: 1;
  letter-spacing: 0;
}

.lux-page-hero p {
  max-width: 42ch;
  margin: 0;
  color: var(--lux-muted);
  font-size: 15px;
}

.kpi-card,
.alert-item,
.rank-item,
.market-card,
.scouting-card,
.warroom-card,
.league-card {
  border: 1px solid var(--lux-line);
  border-radius: var(--lux-radius-card);
  background:
    linear-gradient(180deg, rgba(255, 247, 234, 0.052), rgba(255, 247, 234, 0.02)),
    rgba(8, 12, 20, 0.78);
}
```

- [ ] **Step 3: Preserve page data flow**

Do not change imports from stores or services. For football pages, keep calls routed through `src/services/footballApi.js`. For league pages, keep `useLeagueStore` localStorage-only behavior.

- [ ] **Step 4: Run build**

Run: `npm run build`

Expected: Build succeeds and no page import is unused because of deleted JSX.

- [ ] **Step 5: Commit data and decision page changes**

```bash
git add src/pages/Classifica.jsx src/pages/Calendario.jsx src/pages/News.jsx src/pages/Mercato.jsx src/pages/Scouting.jsx src/pages/WarRoom.jsx src/pages/Statistiche.jsx src/pages/HubAnalisi.jsx src/pages/LeagueCreation.jsx src/pages/LeagueSettings.jsx src/components/ui/KpiCard.jsx src/components/ui/AlertItem.jsx src/components/ui/RankItem.jsx src/styles/design-system.css
git commit -m "style: restyle data and decision pages"
```

## Task 7: Private AI Coach Restyle

**Files:**
- Modify: `src/pages/AIAnalisi.jsx`
- Modify: `src/styles/design-system.css`

- [ ] **Step 1: Keep AI request path untouched**

Confirm this import and call remain:

```jsx
import { chatClaude, buildSystemPrompt } from '../lib/claudeApi'

const risposta = await chatClaude({
  messages: claudeMessages,
  systemPrompt,
  maxTokens: 600,
})
```

- [ ] **Step 2: Update visible AI hero and composer labels**

Keep the same state and handlers. Use Private AI Coach copy:

```jsx
<header className="coach-header coach-header--private">
  <div>
    <span className="coach-kicker">Private Analyst</span>
    <h1 className="coach-title">Coach, senza rumore.</h1>
    <p className="coach-subtitle">
      Giornata {giornataCorrente} · analisi privata sulla tua rosa.
    </p>
  </div>
  {/* existing actions */}
</header>
```

For the send button, use compact Italian copy or an arrow symbol with an `aria-label`:

```jsx
<button
  type="button"
  className="coach-send"
  onClick={() => invia()}
  disabled={loading || !input.trim()}
  aria-label="Invia messaggio"
>
  Invia
</button>
```

- [ ] **Step 3: Add AI Coach CSS**

```css
.coach-page {
  min-height: 100%;
  display: grid;
  position: relative;
}

.coach-shell {
  min-height: 100%;
  display: grid;
  grid-template-rows: auto auto auto 1fr auto;
  overflow: hidden;
  border: 1px solid rgba(155, 100, 255, 0.2);
  border-radius: 30px;
  background:
    radial-gradient(circle at 78% 20%, rgba(155, 100, 255, 0.28), transparent 28%),
    linear-gradient(180deg, rgba(255, 247, 234, 0.052), rgba(255, 247, 234, 0.018)),
    rgba(5, 7, 13, 0.94);
}

.coach-title {
  color: var(--lux-milk);
  font-family: Georgia, 'Times New Roman', serif;
  font-size: clamp(42px, 13vw, 68px);
  line-height: 0.94;
  letter-spacing: 0;
}

.coach-message--assistant .coach-message__bubble {
  border-color: rgba(155, 100, 255, 0.24);
  background: rgba(155, 100, 255, 0.1);
}

.coach-message--user .coach-message__bubble {
  border-color: rgba(245, 207, 114, 0.28);
  background: rgba(245, 207, 114, 0.09);
}

.coach-send {
  min-width: 76px;
  border: 0;
  border-radius: 999px;
  background: linear-gradient(135deg, var(--lux-gold-soft), var(--lux-gold));
  color: #07101b;
  font-weight: 950;
}
```

- [ ] **Step 4: Run build**

Run: `npm run build`

Expected: Build succeeds. No client-side direct Anthropic or Groq import is introduced.

- [ ] **Step 5: Commit AI Coach changes**

```bash
git add src/pages/AIAnalisi.jsx src/styles/design-system.css
git commit -m "style: restyle private ai coach"
```

## Task 8: Visual QA And Final Cleanup

**Files:**
- Modify if needed: `src/styles/design-system.css`
- Modify if needed: any page touched in Tasks 2-7
- Leave untracked or remove after user confirmation: `public/__brainstorm/`

- [ ] **Step 1: Run production build**

Run: `npm run build`

Expected: Build succeeds.

- [ ] **Step 2: Start or reuse local dev server**

If a dev server is already listening on `http://localhost:3000`, reuse it.

If not, run: `npm run dev -- --host 0.0.0.0 --port 3000`

Expected: Vite serves the app at `http://localhost:3000/`.

- [ ] **Step 3: Browser check core mobile routes**

Open these routes in the in-app browser at mobile width:

```text
http://localhost:3000/#/
http://localhost:3000/#/schieramento
http://localhost:3000/#/schieramento?tab=rosa
http://localhost:3000/#/ai-analisi
```

Expected:

- Header and bottom nav are visible and do not overlap core content.
- Home uses Luxury Matchday OS.
- Schieramento pitch remains usable.
- Rosa empty state remains Italian and does not show mock players.
- AI Coach uses Private AI Coach visual treatment.

- [ ] **Step 4: Browser check secondary routes**

Open:

```text
http://localhost:3000/#/classifica
http://localhost:3000/#/calendario
http://localhost:3000/#/news
http://localhost:3000/#/mercato
http://localhost:3000/#/scouting
http://localhost:3000/#/war-room
http://localhost:3000/#/statistiche
http://localhost:3000/#/crea-lega
http://localhost:3000/#/impostazioni-lega
```

Expected:

- Each page has a coherent luxury hero or section header.
- Lists and cards use dark glass surfaces with gold/violet/semantic accents.
- Text fits inside buttons and cards at 360px width.

- [ ] **Step 5: Commit final polish**

```bash
git add src
git commit -m "style: polish luxury mobile restyle"
```

## Self-Review Notes

- Spec coverage: Tasks 1-8 cover design system, shell, reusable patterns, Home, Schieramento, Rosa, data pages, decision flows, League pages, AI Coach, responsiveness, build, and browser checks.
- Data safety: No task changes persisted Zustand structure, league backend behavior, AI endpoints, or football proxy endpoints.
- Mock data safety: Task 5 and Task 8 explicitly preserve the empty default roster.
- Temporary visual board: `public/__brainstorm/` is excluded from production commits by this plan.
