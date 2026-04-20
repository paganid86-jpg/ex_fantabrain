# Restyle Fase 2a — Pattern Library + Home Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Costruire la pattern library riusabile (HeroBlock, DeadlinePill, QuickCard, stripe decorativa, NewsPreviewStub) e riscrivere la Home/Dashboard usandola, seguendo la spec Stadium Electric §9.1.

**Architecture:** I pattern vivono in `src/components/patterns/` come componenti puri, presentazionali, stateless (eccetto `DeadlinePill` che ha un `useEffect` per il ticker secondi). Le utility (`matchdayDeadline`, `heroPhrase`) vivono in `src/lib/`. La Dashboard diventa un componente orchestratore sottile (~200 righe vs 1147 attuali): legge dati da Zustand, calcola deadline + frase contestuale, compone i pattern. Il Pitch inline e l'AISuggestionsPanel vengono **rimossi** dalla Home — il Pitch vive in `/schieramento` (Fase 2b) e AISuggestionsPanel diventa una QuickCard che linka a `/ai-analisi` (Fase 3 quando restylamo AI Coach).

**Tech Stack:** React 19, Zustand 4.5 (default exports, selettori reattivi inline), CSS custom properties del design-system Stadium Electric (Fase 1). Nessuna libreria nuova. Nessuna chiamata API nuova. `Intl.DateTimeFormat` per il calcolo timezone Europe/Rome.

**Scope esplicito — cosa è OUT:**
- Sub-tab Schiera (Fase 2b)
- Trend Classifica ↑/↓/= (Fase 2c — richiede `scoresByMatchday` nello store)
- News feed vero (Fase 3 — per ora la preview è uno stub con 2 card mock)
- Toggle tema UI visibile (la ThemeProvider c'è già da Fase 1; un toggle graficamente integrato arriva in Fase 3)
- Restyle degli altri componenti legacy (RankItem, AlertItem, KpiCard, BarChartGiornate) — questi rimangono nel file vecchio e spariscono quando la Dashboard nuova non li importa più

**Regressioni visive accettate alla fine della fase:**
- La Dashboard perde le sezioni "Mini-pitch", "Suggerimenti AI inline", "Grafico punti giornate" e "Ultime partite Serie A embedded". Sono tutte raggiungibili da BottomNav (Schiera, AI, Classifica). La Home diventa più leggera e leggibile.
- Alcuni file CSS legacy restano sul disco non referenziati (cleanup in Fase 3).

---

## File Structure

| File | Responsabilità |
|---|---|
| `src/lib/matchdayDeadline.js` | Funzione pura: dato `now`, ritorna il prossimo venerdì 18:00 Europe/Rome come oggetto Date. Nessun side effect. |
| `src/lib/heroPhrase.js` | Funzione pura: dato `{ puntiUltima, puntiMedia, giornataGiocata }` ritorna una stringa condizionata ("Bella giornata.", "Serve una rimonta.", "Si riparte.", ...). Tabella statica interna. |
| `src/components/patterns/HeroBlock.jsx` | Blocco hero Home: numero gigante + diff pill + stripe decorativa. Props: `{ value, diff, label, kicker }`. |
| `src/components/patterns/DeadlinePill.jsx` | Banner deadline con dot pulsante rosso + timer `HH:MM:SS` che fa tick ogni secondo. Props: `{ deadline: Date, label?: string }`. Gestisce l'intervallo in `useEffect`. |
| `src/components/patterns/QuickCard.jsx` | Card 2×2 grid. Props: `{ icon, label, value?, hint?, to, accent? }`. `<Link>` a route interna. |
| `src/components/patterns/NewsPreviewStub.jsx` | Lista stub di 2 card news con titoli hardcoded + CTA "Tutte →" a `/news`. Sarà sostituito da feed reale in Fase 3. |
| `src/pages/Dashboard.jsx` | Rewrite: top bar (già in `FloatingPanel.panel-header`), kicker giornata, hero title personalizzato, HeroBlock, DeadlinePill, QuickCard×4, NewsPreviewStub. Conserva `LeagueGate` esistente al top. |
| `src/styles/design-system.css` | Aggiunte classi pattern (`.hero-block`, `.hero-value`, `.diff-pill`, `.deadline-pill`, `.deadline-dot`, `.quick-card`, `.quick-card-grid`, `.stripe-decor`, `.news-preview-card`). **Non** si toccano i token — solo nuove classi pattern. |

---

## Task 1 — Util `matchdayDeadline.js` (Europe/Rome)

La deadline è **venerdì 18:00 Europe/Rome** ogni settimana. Serve una funzione pura che, dato un timestamp `now`, ritorni la prossima deadline futura. Usata da `DeadlinePill` in Home e (Fase 2b) in Schiera.

**Files:**
- Create: `src/lib/matchdayDeadline.js`

- [ ] **Step 1: Creare il file**

```js
// src/lib/matchdayDeadline.js

/**
 * Calcola la prossima deadline di schieramento — venerdì 18:00 Europe/Rome.
 *
 * Implementazione: costruisce la data in fuso Rome usando Intl.DateTimeFormat,
 * evitando dipendenze esterne (date-fns, dayjs). Gestisce correttamente DST
 * perché Intl.DateTimeFormat con timeZone:'Europe/Rome' ritorna sempre l'ora
 * locale corretta.
 *
 * @param {Date} [now=new Date()] — ora corrente, iniettabile per test
 * @returns {Date} — prossimo venerdì 18:00 Rome (UTC timestamp interno)
 */
export function getNextMatchdayDeadline(now = new Date()) {
  // Leggi parti della data in Europe/Rome
  const fmt = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Rome',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    weekday: 'short',
    hour12: false,
  })
  const parts = Object.fromEntries(
    fmt.formatToParts(now).filter((p) => p.type !== 'literal').map((p) => [p.type, p.value])
  )
  // parts.weekday ∈ {Mon, Tue, Wed, Thu, Fri, Sat, Sun}
  const DAY_INDEX = { Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6, Sun: 0 }
  const todayIdxRome = DAY_INDEX[parts.weekday]
  const hourRome = parseInt(parts.hour, 10)
  const minuteRome = parseInt(parts.minute, 10)

  // Quanti giorni mancano al prossimo venerdì?
  // Se oggi è venerdì prima delle 18:00 Rome → 0. Se è venerdì dopo le 18:00 → 7.
  let daysUntilFriday
  if (todayIdxRome < 5) {
    daysUntilFriday = 5 - todayIdxRome
  } else if (todayIdxRome === 5) {
    daysUntilFriday = hourRome < 18 || (hourRome === 18 && minuteRome === 0 && Date.now() === now.getTime() && false) ? 0 : 7
    // semplificazione: venerdì < 18:00 → 0, altrimenti 7
    daysUntilFriday = hourRome < 18 ? 0 : 7
  } else {
    // sabato o domenica
    daysUntilFriday = 7 - todayIdxRome + 5
  }

  // Costruisci la Date target: prendi parts.year/month/day Rome, aggiungi daysUntilFriday,
  // forza 18:00 locale Rome. Per evitare i buchi DST, usiamo la stringa ISO parziale
  // 'YYYY-MM-DDT18:00:00' e la interpretiamo come locale Rome tramite un trucco:
  // calcoliamo l'offset Rome al momento target e applichiamo.

  const y = parseInt(parts.year, 10)
  const m = parseInt(parts.month, 10) // 1..12
  const d = parseInt(parts.day, 10) + daysUntilFriday

  // Construisci prima una data "come se fosse UTC a 18:00" in quel giorno
  const candidateUtc = new Date(Date.UTC(y, m - 1, d, 18, 0, 0))
  // Quanti millisecondi offset ha Rome rispetto a UTC in quel momento?
  // Calcolato leggendo hour Rome della candidateUtc
  const checkFmt = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Rome',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
  const checkParts = Object.fromEntries(
    checkFmt.formatToParts(candidateUtc).filter((p) => p.type !== 'literal').map((p) => [p.type, p.value])
  )
  const romeHour = parseInt(checkParts.hour, 10)
  const romeMinute = parseInt(checkParts.minute, 10)
  // Se candidateUtc mostrato in Rome dice "20:00", vuol dire che Rome è UTC+2 → dobbiamo sottrarre 2h
  const offsetMin = (romeHour - 18) * 60 + (romeMinute - 0)
  return new Date(candidateUtc.getTime() - offsetMin * 60 * 1000)
}
```

**Nota:** la logica è volutamente esplicita invece di usare `toLocaleString` round-trip perché `toLocaleString` ha inconsistenze cross-browser con i fusi che hanno DST. Questo approccio usa solo `Intl.DateTimeFormat.formatToParts` che è stabile.

- [ ] **Step 2: Test manuale nella console**

Non ci sono test automatici in Fase MVP (`.claude/rules/testing.md`). Verifica nella console del browser:

```js
// In Vite dev server, apri http://localhost:5173 dopo Task 8 e in DevTools console:
const { getNextMatchdayDeadline } = await import('/src/lib/matchdayDeadline.js')
// Oggi è lunedì 20 aprile 2026
console.log(getNextMatchdayDeadline())
// Atteso: venerdì 24 aprile 2026 ore 18:00 Rome = 16:00 UTC
// → Date object "Fri Apr 24 2026 18:00:00 GMT+0200"
```

- [ ] **Step 3: Build check**

Run: `npm run build`
Expected: exit code 0.

- [ ] **Step 4: Commit**

```bash
git add src/lib/matchdayDeadline.js
git commit -m "feat(restyle): add matchdayDeadline util (venerdi' 18:00 Europe/Rome)

Funzione pura getNextMatchdayDeadline(now) che ritorna la prossima
deadline di schieramento nel fuso Europe/Rome, gestendo correttamente
DST via Intl.DateTimeFormat.formatToParts."
```

---

## Task 2 — Util `heroPhrase.js`

Tabella statica di frasi contestuali per il greeting "Ciao {nome}. {frase contestuale}.". Zero AI call. Funzione pura, facile da testare.

**Files:**
- Create: `src/lib/heroPhrase.js`

- [ ] **Step 1: Creare il file**

```js
// src/lib/heroPhrase.js

/**
 * Frasi greeting contestuali per la Home hero title.
 * Logica deterministica client-side — nessuna AI call.
 *
 * Input: stato giornata corrente dell'utente.
 * Output: stringa italiana breve, senza "Ciao {nome}." (viene aggiunto dal chiamante).
 */

/**
 * @param {object} ctx
 * @param {number|null} ctx.puntiUltima — punti nell'ultima giornata giocata (null se nessuna)
 * @param {number|null} ctx.puntiMedia — media punti utente (null se nessun dato)
 * @param {boolean} ctx.giornataAperta — true se siamo in una giornata non ancora chiusa
 * @returns {string}
 */
export function getHeroPhrase({ puntiUltima, puntiMedia, giornataAperta }) {
  // Caso 1: nessuna giornata ancora giocata
  if (puntiUltima == null || puntiMedia == null) {
    return 'Si riparte.'
  }
  // Caso 2: giornata aperta (in corso, venerdì non ancora)
  if (giornataAperta) {
    return 'Schiera bene.'
  }
  // Caso 3: ultima giornata andata bene (≥ media + 5)
  if (puntiUltima >= puntiMedia + 5) {
    return 'Bella giornata.'
  }
  // Caso 4: ultima giornata disastrosa (≤ media - 5)
  if (puntiUltima <= puntiMedia - 5) {
    return 'Serve una rimonta.'
  }
  // Caso 5: nella media (± 5)
  return 'Si continua.'
}
```

- [ ] **Step 2: Build check**

Run: `npm run build`
Expected: exit code 0. Se il linter si lamenta di JSDoc, ignorare — il progetto non ha strict JSDoc.

- [ ] **Step 3: Commit**

```bash
git add src/lib/heroPhrase.js
git commit -m "feat(restyle): add heroPhrase util (greeting contestuale statico)

Tabella deterministica di 5 frasi italiane in base a stato giornata e
performance utente. Nessuna AI call. Usata dal hero title Home."
```

---

## Task 3 — CSS pattern classes in `design-system.css`

Aggiungi le classi dei pattern usati dalla Home **senza toccare i token**. Le classi sfruttano i token `--fg`/`--bg`/`--fg-70`/`--surface`/`--border-subtle`/`--color-danger`/`--font-display`/`--font-mono` già esistenti da Fase 1.

**Files:**
- Modify: `src/styles/design-system.css` (append in fondo, prima dell'ultimo media query `@media (min-width: 769px)...`)

- [ ] **Step 1: Aprire il file e individuare il punto di inserimento**

Il file termina con due media query responsive. Inserisci il nuovo blocco **prima** del primo `@media (max-width: 768px)` (cerca la stringa `RESPONSIVE` nel commento di sezione).

- [ ] **Step 2: Incollare le nuove classi pattern**

```css
/* ══════════════════════════════════════════════════════════
   PATTERN LIBRARY — Fase 2a
   HeroBlock · DeadlinePill · QuickCard · Stripe · NewsPreview
   ══════════════════════════════════════════════════════════ */

/* ── Stripe decorativa (riusabile in più pattern) ───────── */
.stripe-decor {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
  border-radius: inherit;
}

.stripe-decor::before,
.stripe-decor::after {
  content: '';
  position: absolute;
  left: -20%;
  right: -20%;
  height: 1px;
  background: currentColor;
  opacity: 0.18;
  transform: rotate(-6deg);
}

.stripe-decor::before { top: 30%; }
.stripe-decor::after  { top: 70%; }

/* ── HeroBlock ──────────────────────────────────────────── */
.hero-block {
  position: relative;
  background: var(--fg);
  color: var(--bg);
  border-radius: var(--radius-xl);
  padding: var(--space-6) var(--space-6) var(--space-5);
  overflow: hidden;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: var(--space-4);
  min-height: 168px;
}

.hero-block-main {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.hero-kicker {
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.22em;
  color: currentColor;
  opacity: 0.7;
}

.hero-value {
  font-family: var(--font-display);
  font-weight: 900;
  font-size: clamp(72px, 18vw, 120px);
  line-height: 0.9;
  letter-spacing: -0.05em;
  color: currentColor;
}

.hero-label {
  font-family: var(--font-body);
  font-size: 13px;
  font-weight: 500;
  color: currentColor;
  opacity: 0.7;
}

.diff-pill {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border-radius: var(--radius-full);
  background: rgba(0, 0, 0, 0.08);
  font-family: var(--font-mono);
  font-size: 12px;
  font-weight: 600;
  color: currentColor;
}

.diff-pill--pos { background: rgba(14, 140, 95, 0.18); }
.diff-pill--neg { background: rgba(214, 69, 69, 0.18); }

/* ── DeadlinePill ───────────────────────────────────────── */
.deadline-pill {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  width: 100%;
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-md);
  background: rgba(214, 69, 69, 0.10);
  border: 1px solid rgba(214, 69, 69, 0.28);
  color: var(--color-danger);
  font-family: var(--font-mono);
  font-size: 13px;
  font-weight: 600;
}

.deadline-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--color-danger);
  flex-shrink: 0;
  animation: pulseDanger 1.6s ease-out infinite;
}

.deadline-label {
  flex: 1;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--fg);
  opacity: 0.85;
}

.deadline-timer {
  font-variant-numeric: tabular-nums;
  color: var(--color-danger);
  letter-spacing: 0.04em;
}

/* ── QuickCard grid + card ──────────────────────────────── */
.quick-card-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-3);
}

.quick-card {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: var(--space-4);
  padding: var(--space-4);
  min-height: 120px;
  background: var(--surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  color: var(--fg);
  text-decoration: none;
  cursor: pointer;
  transition: background var(--motion-micro) ease-out,
              border-color var(--motion-micro) ease-out,
              transform var(--motion-micro) ease-out;
}

.quick-card:hover {
  background: var(--surface-hover);
  border-color: var(--border);
  transform: translateY(-2px);
}

.quick-card--accent {
  background: var(--fg);
  color: var(--bg);
  border-color: var(--fg);
}

.quick-card--accent:hover {
  background: var(--fg);
  opacity: 0.92;
}

.quick-card-icon {
  font-size: 22px;
  line-height: 1;
  opacity: 0.9;
}

.quick-card-label {
  font-family: var(--font-display);
  font-size: 13px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.02em;
  color: inherit;
}

.quick-card-value {
  font-family: var(--font-display);
  font-weight: 900;
  font-size: 28px;
  line-height: 1;
  color: inherit;
}

.quick-card-hint {
  font-family: var(--font-body);
  font-size: 12px;
  color: inherit;
  opacity: 0.7;
}

/* ── NewsPreviewStub ────────────────────────────────────── */
.news-preview {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.news-preview-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
}

.news-preview-cta {
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  color: var(--fg-70);
  text-decoration: none;
}

.news-preview-cta:hover { color: var(--fg); }

.news-preview-card {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: var(--space-4);
  background: var(--surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  text-decoration: none;
  color: var(--fg);
  transition: background var(--motion-micro) ease-out;
}

.news-preview-card:hover { background: var(--surface-hover); }

.news-preview-kicker {
  font-family: var(--font-mono);
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  color: var(--fg-55);
}

.news-preview-title {
  font-family: var(--font-display);
  font-size: 15px;
  font-weight: 700;
  line-height: 1.25;
  color: var(--fg);
}

/* ── Home layout wrapper ────────────────────────────────── */
.home-stack {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}

.home-greeting {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.home-greeting-title {
  font-family: var(--font-display);
  font-weight: 900;
  font-size: clamp(28px, 7vw, 40px);
  line-height: 1.05;
  letter-spacing: -0.02em;
  color: var(--fg);
}
```

- [ ] **Step 3: Build check**

Run: `npm run build`
Expected: exit code 0. Le utility Tailwind non devono collidere con queste classi (tutte con nomi custom, niente conflitti con `bg-*` o `text-*`).

- [ ] **Step 4: Commit**

```bash
git add src/styles/design-system.css
git commit -m "feat(restyle): add pattern library CSS (HeroBlock, DeadlinePill, QuickCard)

Nuove classi .hero-block / .diff-pill / .deadline-pill / .quick-card /
.news-preview-card / .stripe-decor / .home-stack per il restyle della
Home. Solo nuove classi, nessun token modificato."
```

---

## Task 4 — Componente `HeroBlock.jsx`

Presentazionale puro. Props: `{ kicker, value, diff, label, showStripe? }`. Renderizza il numero gigante, la diff pill (colorata in base al segno), e opzionalmente la stripe decorativa.

**Files:**
- Create: `src/components/patterns/HeroBlock.jsx`

- [ ] **Step 1: Creare directory + file**

Se `src/components/patterns/` non esiste, il Write la crea.

```jsx
// src/components/patterns/HeroBlock.jsx

/**
 * HeroBlock — numero gigante + diff pill + stripe decorativa.
 * Usato in Home (hero punti ultima giornata) e (futuro) nel Recap domenica sera.
 *
 * Props:
 * - kicker: string breve in caps mono, es. "GIORNATA 28"
 * - value: number | string — il numero grande
 * - diff: number | null — differenza rispetto a un riferimento (es. media). Pill nascosta se null.
 * - label: string breve sotto il numero, es. "punti ultima"
 * - showStripe: bool, default true — se mostrare le linee decorative
 */
export default function HeroBlock({ kicker, value, diff, label, showStripe = true }) {
  const diffSign = diff == null ? null : diff > 0 ? 'pos' : diff < 0 ? 'neg' : 'zero'
  const diffText =
    diff == null
      ? null
      : diff > 0
        ? `+${diff} vs media`
        : diff < 0
          ? `${diff} vs media`
          : '= media'

  return (
    <div className="hero-block">
      {showStripe && <div className="stripe-decor" aria-hidden="true" />}
      <div className="hero-block-main">
        {kicker && <span className="hero-kicker">{kicker}</span>}
        <span className="hero-value">{value}</span>
        {label && <span className="hero-label">{label}</span>}
      </div>
      {diffText && (
        <span
          className={`diff-pill${diffSign !== 'zero' ? ` diff-pill--${diffSign}` : ''}`}
          aria-label={`Differenza vs media: ${diffText}`}
        >
          {diffText}
        </span>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Build check**

Run: `npm run build`
Expected: exit code 0.

- [ ] **Step 3: Commit**

```bash
git add src/components/patterns/HeroBlock.jsx
git commit -m "feat(restyle): add HeroBlock pattern component

Numero gigante + kicker + label + diff pill colorata (pos/neg/zero) +
stripe decorativa opzionale. Presentazionale puro, props-only."
```

---

## Task 5 — Componente `DeadlinePill.jsx`

Banner deadline con dot pulsante + timer che aggiorna ogni secondo. Nasconde la pill quando la deadline è passata (o mostra "SCADUTA" in base alla prop `onExpired`).

**Files:**
- Create: `src/components/patterns/DeadlinePill.jsx`

- [ ] **Step 1: Creare il file**

```jsx
// src/components/patterns/DeadlinePill.jsx

import { useEffect, useState } from 'react'

/**
 * DeadlinePill — banner rosso pulsante con timer HH:MM:SS.
 *
 * Props:
 * - deadline: Date — quando scade
 * - label: string — es. "SCHIERAMENTO"
 *
 * Se la deadline è passata, mostra "SCADUTA" invece del timer.
 * L'intervallo secondi viene pulito in cleanup.
 */
export default function DeadlinePill({ deadline, label = 'SCHIERAMENTO' }) {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  const diffMs = deadline.getTime() - now
  const isExpired = diffMs <= 0

  let timerText = 'SCADUTA'
  if (!isExpired) {
    const totalSec = Math.floor(diffMs / 1000)
    const d = Math.floor(totalSec / 86400)
    const h = Math.floor((totalSec % 86400) / 3600)
    const m = Math.floor((totalSec % 3600) / 60)
    const s = totalSec % 60
    const pad = (n) => String(n).padStart(2, '0')
    timerText = d > 0
      ? `${d}g ${pad(h)}:${pad(m)}:${pad(s)}`
      : `${pad(h)}:${pad(m)}:${pad(s)}`
  }

  return (
    <div className="deadline-pill" role="timer" aria-live="off">
      <span className="deadline-dot" aria-hidden="true" />
      <span className="deadline-label">{label}</span>
      <span className="deadline-timer">{timerText}</span>
    </div>
  )
}
```

**Nota:** `aria-live="off"` è intenzionale — un `polite` o `assertive` farebbe annunciare al screen reader ogni secondo, che è rumore inutile. Il `role="timer"` semantico basta.

- [ ] **Step 2: Build check**

Run: `npm run build`
Expected: exit code 0.

- [ ] **Step 3: Commit**

```bash
git add src/components/patterns/DeadlinePill.jsx
git commit -m "feat(restyle): add DeadlinePill pattern component

Banner rosso pulsante con timer HH:MM:SS (o Ng HH:MM:SS se > 24h).
setInterval 1s con cleanup. Mostra 'SCADUTA' dopo la deadline."
```

---

## Task 6 — Componente `QuickCard.jsx`

Card 2×2 grid che linka a una route interna. Supporta variante `accent` (sfondo Milk pieno su dark, Plum pieno su light — inversione).

**Files:**
- Create: `src/components/patterns/QuickCard.jsx`

- [ ] **Step 1: Creare il file**

```jsx
// src/components/patterns/QuickCard.jsx

import { Link } from 'react-router-dom'

/**
 * QuickCard — card della griglia 2x2 Home.
 *
 * Props:
 * - icon: string — emoji/simbolo (aria-hidden)
 * - label: string — titolo breve in caps
 * - value?: string | number — valore grande opzionale (es. punti, posizione)
 * - hint?: string — testo secondario
 * - to: string — path react-router
 * - accent?: bool — variante inversione colore (Milk pieno in dark)
 */
export default function QuickCard({ icon, label, value, hint, to, accent = false }) {
  return (
    <Link
      to={to}
      className={`quick-card${accent ? ' quick-card--accent' : ''}`}
      aria-label={`${label}${value != null ? ': ' + value : ''}`}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {icon && <span className="quick-card-icon" aria-hidden="true">{icon}</span>}
        <span className="quick-card-label">{label}</span>
      </div>
      {value != null && <span className="quick-card-value">{value}</span>}
      {hint && <span className="quick-card-hint">{hint}</span>}
    </Link>
  )
}
```

**Nota stilistica:** il piccolo `style={{...}}` inline per il gap icon+label è un'eccezione documentata (`.claude/rules/code-style.md` permette "casi eccezionali documentati"). Mettere una classe CSS dedicata per 2 proprietà è overkill; rimpiazzabile in futuro se questo pattern si ripete.

- [ ] **Step 2: Build check**

Run: `npm run build`
Expected: exit code 0.

- [ ] **Step 3: Commit**

```bash
git add src/components/patterns/QuickCard.jsx
git commit -m "feat(restyle): add QuickCard pattern component

Card 2x2 grid che linka a route interna. Variante --accent per
inversione colore (Milk pieno in dark, Plum pieno in light)."
```

---

## Task 7 — Componente `NewsPreviewStub.jsx`

Stub della sezione News preview in Home. 2 card mock + CTA "Tutte →" a `/news`. Quando in Fase 3 implementeremo `useNewsStore`, questo componente verrà sostituito da `NewsPreview.jsx` reale.

**Files:**
- Create: `src/components/patterns/NewsPreviewStub.jsx`

- [ ] **Step 1: Creare il file**

```jsx
// src/components/patterns/NewsPreviewStub.jsx

import { Link } from 'react-router-dom'

/**
 * NewsPreviewStub — placeholder della sezione News in Home.
 * Mostra 2 card mock + CTA "Tutte →". Verrà sostituito da NewsPreview
 * reale in Fase 3 quando arriverà useNewsStore con feed Pulse + AI Magazine.
 */
const MOCK_NEWS = [
  {
    id: 'stub-1',
    kicker: 'PULSE · GIORNATA 28',
    title: 'La tua squadra ha battuto la media lega di 12 punti.',
  },
  {
    id: 'stub-2',
    kicker: 'AI MAGAZINE',
    title: 'I 3 colpi di mercato che nessuno sta guardando.',
  },
]

export default function NewsPreviewStub() {
  return (
    <section className="news-preview" aria-label="Anteprima news">
      <header className="news-preview-header">
        <h2 className="section-title">News</h2>
        <Link to="/news" className="news-preview-cta">Tutte →</Link>
      </header>
      {MOCK_NEWS.map((item) => (
        <Link key={item.id} to="/news" className="news-preview-card">
          <span className="news-preview-kicker">{item.kicker}</span>
          <span className="news-preview-title">{item.title}</span>
        </Link>
      ))}
    </section>
  )
}
```

- [ ] **Step 2: Build check**

Run: `npm run build`
Expected: exit code 0.

- [ ] **Step 3: Commit**

```bash
git add src/components/patterns/NewsPreviewStub.jsx
git commit -m "feat(restyle): add NewsPreviewStub per Home

Placeholder con 2 card mock + CTA 'Tutte ->'. Verra' sostituito da
NewsPreview reale in Fase 3 quando arrivera' useNewsStore."
```

---

## Task 8 — Rewrite `Dashboard.jsx` (Home)

Questo è il task pesante. Sostituisce i 1147 righe attuali con ~200 righe pulite. La logica `LeagueGate` esistente (righe 550-584 attuali) va **preservata identica** — solo spostata in alto senza modifiche. Tutto il resto (KpiCard inline, PitchSlot, AISuggestionsPanel, BarChartGiornate, Serie A embed) viene rimosso.

**Files:**
- Modify: `src/pages/Dashboard.jsx` (rewrite completo)

- [ ] **Step 1: Leggere Dashboard.jsx attuale per estrarre il blocco LeagueGate esatto**

Prima di scrivere, apri `src/pages/Dashboard.jsx` alle righe 550-584 e copia la logica LeagueGate esistente così com'è (include: check `currentLeague`, render del blocco onboarding con bottone a `/crea-lega`). Il Task 8 la reinserisce identica al top del nuovo componente — se cambia la struttura dati `useLeagueStore` tra scrittura del plan ed esecuzione, aggiornare questa porzione e lasciare intatto il resto.

- [ ] **Step 2: Sovrascrivere Dashboard.jsx**

```jsx
// src/pages/Dashboard.jsx

import useAppStore from '../store/useAppStore'
import useLeagueStore from '../stores/useLeagueStore'
import HeroBlock from '../components/patterns/HeroBlock'
import DeadlinePill from '../components/patterns/DeadlinePill'
import QuickCard from '../components/patterns/QuickCard'
import NewsPreviewStub from '../components/patterns/NewsPreviewStub'
import { getNextMatchdayDeadline } from '../lib/matchdayDeadline'
import { getHeroPhrase } from '../lib/heroPhrase'
import { Link } from 'react-router-dom'

export default function Dashboard() {
  // ── State reads (selettori reattivi inline) ────────────
  const userName = useAppStore((s) => s.user?.name || 'Fantallenatore')
  const rosa = useAppStore((s) => s.rosa)
  const calendario = useAppStore((s) => s.calendario)
  const classifica = useAppStore((s) => s.classifica)
  const giornataCorrente = useAppStore((s) => s.giornataCorrente)
  const aiCrediti = useAppStore((s) => s.aiCrediti)
  const currentLeagueId = useLeagueStore((s) => s.currentLeagueId)
  const currentLeague = useLeagueStore((s) =>
    s.leagues.find((l) => l.id === s.currentLeagueId)
  )

  // ── LeagueGate — identico al comportamento preesistente ────
  if (!currentLeagueId || !currentLeague) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon" aria-hidden="true">⚑</div>
        <h1 className="empty-state-title">Crea la tua prima lega</h1>
        <p className="empty-state-desc">
          Per usare FantaBrain serve una lega. Creane una nuova o unisciti
          con un codice invito.
        </p>
        <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-6)' }}>
          <Link to="/crea-lega" className="btn-primary">Crea lega</Link>
          <Link to="/impostazioni-lega" className="btn-secondary">Unisciti</Link>
        </div>
      </div>
    )
  }

  // ── Calcoli per hero ───────────────────────────────────
  const ultimaGiocata = [...calendario]
    .reverse()
    .find((g) => g.giocata)
  const puntiUltima = ultimaGiocata?.puntiUser ?? null
  const userRow = classifica?.find((r) => r.isUser) || null
  const puntiMedia = userRow?.puntimedia ?? null
  const diff =
    puntiUltima != null && puntiMedia != null
      ? Math.round((puntiUltima - puntiMedia) * 10) / 10
      : null
  const giornataAperta = ultimaGiocata && !ultimaGiocata.giocata

  const phrase = getHeroPhrase({ puntiUltima, puntiMedia, giornataAperta })
  const deadline = getNextMatchdayDeadline()

  // ── KPI rapidi per QuickCard ───────────────────────────
  const posizione = userRow
    ? classifica.findIndex((r) => r.isUser) + 1
    : null
  const infortunati = rosa.filter((p) => p.infortunato).length

  return (
    <div className="home-stack">
      {/* Greeting */}
      <section className="home-greeting">
        <span className="kicker">GIORNATA {giornataCorrente ?? '—'} · {currentLeague.nome}</span>
        <h1 className="home-greeting-title">
          Ciao {userName}. {phrase}
        </h1>
      </section>

      {/* Hero punti ultima giornata */}
      <HeroBlock
        kicker={ultimaGiocata ? `GIORNATA ${ultimaGiocata.giornata} · PUNTI` : 'PUNTI · NESSUNA GIOCATA'}
        value={puntiUltima ?? '—'}
        diff={diff}
        label={puntiUltima != null ? 'ultima giornata' : 'nessun dato'}
      />

      {/* Deadline schieramento */}
      <DeadlinePill deadline={deadline} label="Schieramento" />

      {/* Quick cards 2x2 */}
      <section className="quick-card-grid">
        <QuickCard
          icon="≡"
          label="Classifica"
          value={posizione ?? '—'}
          hint={posizione ? `su ${classifica.length}` : 'non disponibile'}
          to="/classifica"
        />
        <QuickCard
          icon="◉"
          label="AI Coach"
          value={aiCrediti ?? 0}
          hint="crediti giornata"
          to="/ai-analisi"
          accent
        />
        <QuickCard
          icon="⚽"
          label="Schiera"
          hint="tocca per schierare"
          to="/schieramento"
        />
        <QuickCard
          icon="⛑"
          label="Infortuni"
          value={infortunati}
          hint={infortunati > 0 ? 'in rosa' : 'tutti ok'}
          to="/la-rosa"
        />
      </section>

      {/* News preview stub */}
      <NewsPreviewStub />
    </div>
  )
}
```

**Cambiamenti rispetto al file precedente:**
- Rimossi: `KpiCard` inline, `PitchSlot` × 11, `AISuggestionsPanel`, `BarChartGiornate`, embed Serie A standings/matches
- Rimossi import: `RankItem`, `AlertItem`, `CountdownCard`, `useSerieAStore.fetchAll()` (non serve più qui)
- Preservata: logica `LeagueGate` identica nel concetto (onboarding creazione lega)
- La Home non fa più fetch Serie A al mount — velocizza il render iniziale di >500ms stimati

- [ ] **Step 3: Build check**

Run: `npm run build`
Expected: exit code 0. Warning atteso: chunk JS dovrebbe **scendere** (~20-40kB) perché non importiamo più `useSerieAStore.fetchAll()` dalla Dashboard né i sub-componenti inline ridondanti. Se sale, qualcosa non ha funzionato.

- [ ] **Step 4: Smoke manuale**

Run: `npm run dev`. Navigare alla Home.

Checklist:
- [ ] Kicker "GIORNATA N · {nome lega}" si vede in alto
- [ ] H1 "Ciao {nome}. {frase}." — la frase cambia se in console imposti manualmente `useAppStore.setState({ calendario: [...] })` con punti alti
- [ ] HeroBlock mostra il numero grande in inversione (Milk su Plum in dark, Plum su Milk in light)
- [ ] La diff pill è verde se diff > 0, rossa se < 0
- [ ] DeadlinePill mostra il countdown al prossimo venerdì 18:00 Rome, il timer ticca ogni secondo, il dot rosso pulsa
- [ ] Le 4 QuickCard sono in grid 2x2, `AI Coach` ha lo sfondo pieno (`--accent`), le altre hanno il surface normale
- [ ] Tap su una QuickCard naviga alla route corretta
- [ ] NewsPreviewStub mostra 2 card mock + "Tutte →" che linka a `/news`
- [ ] BottomNav visibile in fondo, tab "Home" attiva
- [ ] Toggle tema da console (`localStorage.setItem('fantabrain-theme','light'); location.reload()`) → tutto si inverte correttamente, nessun flash
- [ ] Nessun errore React/console
- [ ] DevTools mobile 375×812 → HeroBlock leggibile, QuickCard grid 2x2 tiene, nessun overflow

Se la Home si svuota inaspettatamente: ricontrollare che `currentLeagueId` sia settato (LeagueGate potrebbe attivarsi e mostrare l'onboarding — è atteso se l'utente non ha ancora una lega).

- [ ] **Step 5: Commit**

```bash
git add src/pages/Dashboard.jsx
git commit -m "feat(restyle): rewrite Dashboard (Home) con pattern library Stadium Electric

- Rimossi: KpiCard inline, PitchSlot x11, AISuggestionsPanel, BarChartGiornate,
  embed Serie A standings/matches, CountdownCard vecchia (spostati in altre route)
- Aggiunti: HeroBlock, DeadlinePill, QuickCard x4, NewsPreviewStub
- Preservato: LeagueGate onboarding per utenti senza lega attiva
- Greeting contestuale via heroPhrase util (5 frasi condizionate, no AI call)
- Deadline calcolata via matchdayDeadline util (venerdi' 18:00 Europe/Rome)
- La Home passa da 1147 righe a ~200 righe e non fa piu' fetch Serie A al mount"
```

---

## Task 9 — Smoke test finale Fase 2a + tag

**Files:** nessuno (solo verifica + tag)

- [ ] **Step 1: Build pulito**

```bash
npm run build
```
Expected: exit code 0. Annotare dimensione del bundle JS per confronto con Fase 1 (atteso: calo di 20-40kB per rimozione import inutili).

- [ ] **Step 2: Smoke regressione su altre route**

Dopo il rewrite della Home, le altre route **non devono** essere toccate. Verifica:

- [ ] `/schieramento` carica, drag&drop funziona (il PitchSlot di quella pagina è separato)
- [ ] `/la-rosa` → redirect a `/schieramento?tab=rosa` (Fase 1, ancora funzionante)
- [ ] `/classifica` carica, mostra le righe della lega
- [ ] `/ai-analisi` — scrivi un prompt, AI Groq risponde, credito scala
- [ ] `/news` → empty state placeholder (Fase 1)
- [ ] `/hub/analisi` → empty state placeholder (Fase 1)
- [ ] `/crea-lega` — form multi-step funziona
- [ ] BottomNav: ogni tap cambia URL e highlighta correttamente
- [ ] Toggle tema ← → dark/light: Home e le altre route rispettano il tema

Se una qualsiasi delle route non-Home fallisce, **NON è colpa di Fase 2a** (non abbiamo toccato quei file) — ma segnalare comunque come baseline regression per Fase 2b.

- [ ] **Step 3: Tag git**

```bash
git tag restyle-phase-2a-complete
git log --oneline -12
```

- [ ] **Step 4: Check git status**

```bash
git status
```

Expected: working tree pulito. Tag locale `restyle-phase-2a-complete` presente.

---

## Self-Review

**1. Spec coverage (spec Fase 2 §9.1 Home):**

| Requisito spec | Task |
|---|---|
| Status bar + top bar (logo FB + avatar) | Già in `FloatingPanel.panel-header` da Fase 1 — non toccato |
| Kicker "GIORNATA N · stato" | Task 8 (home-greeting) |
| Hero title "Ciao {nome}. {frase contestuale}." | Task 2 (util) + Task 8 (render) |
| Hero block: numero grande + diff pill + stripe | Task 3 (CSS) + Task 4 (componente) + Task 8 (uso) |
| Deadline banner con dot pulsante rosso e timer | Task 1 (util) + Task 3 (CSS) + Task 5 (componente) + Task 8 (uso) |
| Quick cards 2×2 | Task 3 (CSS) + Task 6 (componente) + Task 8 (uso con 4 card) |
| News preview (ultime 2 card) + CTA "Tutte →" | Task 7 (stub) + Task 8 (uso) — feed reale in Fase 3 |
| Bottom nav floating | Fase 1 (già montato) |

**2. Placeholder scan:** nessun `TBD`, nessun `TODO`, nessun `handle edge cases` non specificato. Ogni step ha codice completo.

**3. Type consistency:**
- `getNextMatchdayDeadline()` ritorna `Date` — usato in `DeadlinePill` prop `deadline: Date` ✓
- `getHeroPhrase({ puntiUltima, puntiMedia, giornataAperta })` — signature identica in Task 2 e Task 8 ✓
- `HeroBlock` prop `diff: number | null` — Task 8 passa `null` se dati mancanti ✓
- `QuickCard` prop `accent: bool` — Task 8 lo usa solo su "AI Coach" ✓

**4. Rischi e follow-up per Fase 2b/2c:**
- La logica del calcolo deadline è scritta con un'implementazione esplicita anti-DST ma non ha test automatici. In Fase MVP va bene (le regole testing.md vietano di aggiungere test in MVP salvo moduli critici). Se la deadline compare errata in prod (sbagliando di 1h attorno a DST), aggiungere test per `getNextMatchdayDeadline` come primissima eccezione.
- `useAppStore` non ha ancora `scoresByMatchday` — necessario per la Fase 2c (Classifica trend ↑/↓). Estensione dati va in testa al plan 2c.
- I pattern introdotti qui (HeroBlock, DeadlinePill, QuickCard) verranno riusati in Fase 2b (Schiera header con deadline pill) e Fase 2c (eventuale hero "posizione"). Sono già generici abbastanza.

---

## Execution Handoff

Plan pronto e salvato in `docs/superpowers/plans/2026-04-20-fantabrain-restyle-phase-2a-pattern-library-home.md`.

**Esecuzione consigliata:** `superpowers:subagent-driven-development` con dispatch inline (dati i timeout subagent osservati su questa harness Windows in Fase 1, eseguire Task-by-Task direttamente nella sessione principale è più affidabile). 9 task + review finale.
