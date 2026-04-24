# FantaBrain Restyle — Fase 2b-Campo — Stadium Electric Pitch

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rendere la Campo view di Schieramento più interattiva e piena: campo Plum/Milk con markings reali, slot 56×56px a tema, animazione pulse sugli slot vuoti, sidebar panchina fissa destra con bottone "Analisi AI" (stub) e lista giocatori draggabili.

**Architecture:** Il campo mantiene @dnd-kit (PointerSensor + TouchSensor già in piedi da Fase 2b). Si sostituisce il gradient verde hardcoded con un layer di sfondo theme-aware + overlay SVG PitchMarkings. Si introduce un nuovo componente `BenchSidebar` che riusa `useDraggable` per permettere il drag dei panchinari nel campo, affiancato al campo in un layout split. Il bottone "Analisi AI" è UI-ready ma collegato a un BottomSheet stub (backend rimandato a sessione dedicata, già loggata su Notion "Da fare Dante"). Il BottomSheet player picker esistente rimane come fallback tap-to-place.

**Tech Stack:** React 19, @dnd-kit/core, CSS custom properties (design-system.css), SVG inline per i markings.

**Scope boundaries:**
- NON tocchiamo la tab "Rosa" (render inline `<LaRosa />` come oggi)
- NON tocchiamo la logica store (`useAppStore.titolariIds`, `setTitolariIds`, `modulo`)
- NON implementiamo il backend Analisi AI (tracciato su Notion "Da fare Dante", sarà collegato in sessione futura)
- NON introduciamo nuove dipendenze

---

## File Structure

**Created:**
- `src/components/formation/PitchMarkings.jsx` — overlay SVG markings (linee, cerchio, aree, archi, dischetto)
- `src/components/formation/BenchSidebar.jsx` — sidebar destra con header + bottone AI + filtro ruolo + lista giocatori draggabili
- `src/components/formation/BenchItem.jsx` — singolo item draggabile nella sidebar (avatar + nome + squadra + media)

**Modified:**
- `src/styles/design-system.css` — aggiunto blocco `PATTERN LIBRARY FASE 2b-CAMPO` con tokens pitch/slot/sidebar, classi e keyframe pulse
- `src/components/formation/FormationSlot.jsx` — restyle: 56×56px, colori theme-aware, pulse su slot vuoti, label 2 righe sotto (cognome + media)
- `src/components/formation/FormationEditor.jsx` — layout split (campo left + sidebar right), sostituisce gradient verde con `.pitch` theme-aware, monta `<PitchMarkings />` e `<BenchSidebar />`
- `src/pages/Schieramento.jsx` — aggiunge stato `aiStubOpen` + `BottomSheet` stub "Analisi AI — in arrivo", passa `onAiAnalysisClick` al `FormationEditor`

---

## Task 1: Design system tokens + classi + pulse keyframe

**Files:**
- Modify: `src/styles/design-system.css` (append in coda, prima dell'ultimo blocco esistente)

- [ ] **Step 1: Aprire `design-system.css` e individuare la fine del blocco PATTERN LIBRARY Fase 2b** (ultima classe relativa a BottomSheet / SchieraTabBar / player picker). Appendere un nuovo blocco subito dopo.

- [ ] **Step 2: Aggiungere tokens pitch (dark + light)**

In dark mode (blocco `:root, html[data-theme="dark"]`) aggiungere alla fine del blocco, prima della `}`:

```css
  /* Pitch (dark) */
  --pitch-bg: radial-gradient(ellipse at 50% 50%, #451F3E 0%, #2B1127 70%, #1F0C1D 100%);
  --pitch-line: rgba(255, 243, 230, 0.22);
  --pitch-line-strong: rgba(255, 243, 230, 0.35);
```

In light mode (blocco `html[data-theme="light"]`) aggiungere prima della `}`:

```css
  /* Pitch (light) */
  --pitch-bg: radial-gradient(ellipse at 50% 50%, #FFF9F0 0%, #FFEDD6 70%, #F7E0C2 100%);
  --pitch-line: rgba(56, 25, 50, 0.28);
  --pitch-line-strong: rgba(56, 25, 50, 0.45);
```

- [ ] **Step 3: Aggiungere blocco CSS classi e keyframe in coda al file**

```css
/* ══════════════════════════════════════════════════════════
   PATTERN LIBRARY — FASE 2b-CAMPO (Stadium Electric Pitch)
   ══════════════════════════════════════════════════════════ */

/* ── Layout split Campo + Sidebar ───────────────────────── */
.campo-layout {
  display: flex;
  flex-direction: row;
  gap: var(--space-2);
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.campo-layout__field {
  flex: 1 1 auto;
  min-width: 0;
  position: relative;
  display: flex;
  flex-direction: column;
}

.campo-layout__sidebar {
  flex: 0 0 140px;
  width: 140px;
  display: flex;
  flex-direction: column;
  background: var(--surface);
  border-left: 1px solid var(--border-subtle);
  overflow: hidden;
}

@media (min-width: 768px) {
  .campo-layout__sidebar {
    flex-basis: 220px;
    width: 220px;
  }
}

/* ── Pitch (campo) ─────────────────────────────────────── */
.pitch {
  flex: 1;
  position: relative;
  background: var(--pitch-bg);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  align-items: center;
  padding: var(--space-4) var(--space-2);
}

.pitch__markings {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
}

.pitch__row {
  position: relative;
  z-index: 1;
  display: flex;
  gap: var(--space-4);
  align-items: center;
  justify-content: center;
  width: 100%;
}

/* ── Slot (56×56) ──────────────────────────────────────── */
.slot {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-1);
  cursor: pointer;
  min-width: 60px;
}

.slot__disc {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  transition: border-color var(--motion-micro) var(--ease-standard),
              transform var(--motion-micro) var(--ease-standard);
}

.slot__disc--filled {
  background: var(--fg-08);
  border: 2px solid var(--slot-role-color, var(--fg-35));
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.18);
}

.slot__disc--empty {
  background: transparent;
  border: 2px dashed var(--fg-35);
  animation: slotPulse 1800ms var(--ease-standard) infinite;
}

.slot__disc--over {
  border-color: var(--color-gold) !important;
  transform: scale(1.06);
}

.slot__disc--incompatible {
  border-color: var(--color-danger) !important;
}

.slot__initial {
  font-family: var(--font-display);
  font-size: 18px;
  font-weight: 700;
  color: var(--fg);
  line-height: 1;
}

.slot__empty-plus {
  font-size: 22px;
  font-weight: 300;
  color: var(--fg-55);
  line-height: 1;
}

.slot__badge {
  position: absolute;
  top: -4px;
  right: -4px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  color: #fff;
}
.slot__badge--danger { background: var(--color-danger); }
.slot__badge--warn   { background: var(--color-gold); }

.slot__label {
  font-family: var(--font-body);
  font-size: 10px;
  font-weight: 700;
  color: var(--fg);
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.35);
  max-width: 64px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.slot__media {
  font-family: var(--font-display);
  font-size: 11px;
  font-weight: 700;
  color: var(--color-gold);
  line-height: 1;
}

.slot__role-hint {
  font-family: var(--font-mono);
  font-size: 9px;
  color: var(--fg-55);
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

@keyframes slotPulse {
  0%, 100% {
    transform: scale(1);
    border-color: var(--fg-35);
  }
  50% {
    transform: scale(1.06);
    border-color: var(--fg-55);
  }
}

@media (prefers-reduced-motion: reduce) {
  .slot__disc--empty { animation: none; }
}

/* ── Sidebar Panchina ──────────────────────────────────── */
.bench-header {
  position: sticky;
  top: 0;
  background: var(--surface);
  padding: var(--space-2) var(--space-3);
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  border-bottom: 1px solid var(--border-subtle);
  z-index: 2;
}

.bench-header__title {
  font-family: var(--font-display);
  font-size: 13px;
  font-weight: 700;
  color: var(--fg);
}

.bench-header__count {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--fg-55);
}

.bench-ai-button {
  margin: var(--space-2);
  height: 40px;
  border-radius: var(--radius-md);
  background: linear-gradient(135deg, var(--color-plum) 0%, rgba(56, 25, 50, 0.7) 100%);
  border: 1px solid var(--gold-border);
  color: var(--color-milk);
  font-family: var(--font-display);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.03em;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  cursor: pointer;
  transition: box-shadow var(--motion-micro) var(--ease-standard),
              transform var(--motion-micro) var(--ease-standard);
}

html[data-theme="light"] .bench-ai-button {
  background: linear-gradient(135deg, var(--color-milk) 0%, rgba(255, 243, 230, 0.7) 100%);
  color: var(--color-plum);
}

.bench-ai-button:hover {
  box-shadow: 0 0 0 2px var(--gold-glow);
  transform: translateY(-1px);
}

.bench-ai-button__icon {
  font-size: 14px;
  color: var(--color-gold);
}

.bench-filter {
  display: flex;
  gap: var(--space-1);
  padding: 0 var(--space-2) var(--space-2);
  overflow-x: auto;
  scrollbar-width: none;
}
.bench-filter::-webkit-scrollbar { display: none; }

.bench-filter__chip {
  flex-shrink: 0;
  padding: 4px 10px;
  border-radius: var(--radius-full);
  background: var(--fg-08);
  border: 1px solid transparent;
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--fg-70);
  cursor: pointer;
  transition: all var(--motion-micro) var(--ease-standard);
}

.bench-filter__chip--active {
  background: var(--fg);
  color: var(--bg);
  border-color: var(--fg);
}

.bench-list {
  flex: 1;
  overflow-y: auto;
  padding: 0 var(--space-2) var(--space-3);
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.bench-list__empty {
  padding: var(--space-4);
  text-align: center;
  font-size: 12px;
  color: var(--fg-55);
}

/* ── Bench item ────────────────────────────────────────── */
.bench-item {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2);
  border-radius: var(--radius-sm);
  background: var(--surface);
  border: 1px solid var(--border-subtle);
  cursor: grab;
  touch-action: none;
  transition: background var(--motion-micro) var(--ease-standard);
}

.bench-item:hover { background: var(--surface-hover); }
.bench-item:active { cursor: grabbing; }

.bench-item--infortunato {
  opacity: 0.5;
  cursor: not-allowed;
}
.bench-item--infortunato:active { cursor: not-allowed; }

.bench-item__avatar {
  flex: 0 0 32px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--fg-08);
  border: 2px solid var(--bench-item-color, var(--fg-35));
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-display);
  font-size: 11px;
  font-weight: 700;
  color: var(--fg);
}

@media (min-width: 768px) {
  .bench-item__avatar { flex-basis: 36px; width: 36px; height: 36px; font-size: 12px; }
}

.bench-item__text {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.bench-item__name {
  font-family: var(--font-body);
  font-size: 12px;
  font-weight: 700;
  color: var(--fg);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.bench-item__meta {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: var(--space-1);
}

.bench-item__team {
  font-family: var(--font-mono);
  font-size: 9px;
  color: var(--fg-55);
  text-transform: uppercase;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.bench-item__media {
  font-family: var(--font-display);
  font-size: 12px;
  font-weight: 700;
  color: var(--color-gold);
}

.bench-item__status {
  flex: 0 0 auto;
  font-size: 12px;
}
.bench-item__status--danger { color: var(--color-danger); }
.bench-item__status--warn   { color: var(--color-gold); }
```

- [ ] **Step 4: Build per verificare che il CSS non rompa nulla**

Run: `npm run build`
Expected: build OK, nessun errore di parsing CSS.

- [ ] **Step 5: Commit**

```bash
git add src/styles/design-system.css
git commit -m "feat(restyle): aggiungi tokens e classi per Stadium Electric pitch

Blocco PATTERN LIBRARY Fase 2b-CAMPO con:
- Tokens pitch (dark/light) radial gradient
- Classi .campo-layout (split field+sidebar 140/220px)
- Classi .pitch, .pitch__markings, .pitch__row
- Classi .slot + keyframe slotPulse + prefers-reduced-motion
- Classi .bench-* (sidebar, header, AI button, filter chips, list, item)"
```

---

## Task 2: Componente PitchMarkings (SVG overlay)

**Files:**
- Create: `src/components/formation/PitchMarkings.jsx`

- [ ] **Step 1: Creare il file con SVG viewBox 100×150 (proporzioni campo verticale)**

```jsx
// src/components/formation/PitchMarkings.jsx

/**
 * PitchMarkings — overlay SVG del campo.
 * Linee in `--pitch-line`, elementi accentati in `--pitch-line-strong`.
 * Il viewBox 100×150 segue proporzioni campo verticale (tipo FIFA top-down).
 */
export default function PitchMarkings() {
  return (
    <svg
      className="pitch__markings"
      viewBox="0 0 100 150"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      {/* Perimetro */}
      <rect
        x="2" y="2" width="96" height="146"
        fill="none"
        stroke="var(--pitch-line)"
        strokeWidth="0.6"
      />
      {/* Linea mediana */}
      <line
        x1="2" y1="75" x2="98" y2="75"
        stroke="var(--pitch-line)"
        strokeWidth="0.5"
      />
      {/* Cerchio di centrocampo */}
      <circle
        cx="50" cy="75" r="10"
        fill="none"
        stroke="var(--pitch-line)"
        strokeWidth="0.5"
      />
      <circle
        cx="50" cy="75" r="0.8"
        fill="var(--pitch-line-strong)"
      />
      {/* Area di rigore — alta */}
      <rect
        x="25" y="2" width="50" height="20"
        fill="none"
        stroke="var(--pitch-line)"
        strokeWidth="0.5"
      />
      {/* Area piccola — alta */}
      <rect
        x="38" y="2" width="24" height="8"
        fill="none"
        stroke="var(--pitch-line)"
        strokeWidth="0.5"
      />
      {/* Dischetto — alto */}
      <circle cx="50" cy="15" r="0.8" fill="var(--pitch-line-strong)" />
      {/* Arco di porta — alto */}
      <path
        d="M 40,22 A 10,10 0 0 0 60,22"
        fill="none"
        stroke="var(--pitch-line)"
        strokeWidth="0.5"
      />
      {/* Area di rigore — bassa */}
      <rect
        x="25" y="128" width="50" height="20"
        fill="none"
        stroke="var(--pitch-line)"
        strokeWidth="0.5"
      />
      {/* Area piccola — bassa */}
      <rect
        x="38" y="140" width="24" height="8"
        fill="none"
        stroke="var(--pitch-line)"
        strokeWidth="0.5"
      />
      {/* Dischetto — basso */}
      <circle cx="50" cy="135" r="0.8" fill="var(--pitch-line-strong)" />
      {/* Arco di porta — basso */}
      <path
        d="M 40,128 A 10,10 0 0 1 60,128"
        fill="none"
        stroke="var(--pitch-line)"
        strokeWidth="0.5"
      />
    </svg>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/formation/PitchMarkings.jsx
git commit -m "feat(restyle): PitchMarkings SVG overlay con perimetro, mediana, aree e archi porta"
```

---

## Task 3: FormationSlot restyle (56px, theme-aware, pulse, 2-line label)

**Files:**
- Modify: `src/components/formation/FormationSlot.jsx`

- [ ] **Step 1: Riscrivere il componente usando le classi CSS del Task 1**

Sostituire TUTTO il contenuto di `src/components/formation/FormationSlot.jsx` con:

```jsx
// src/components/formation/FormationSlot.jsx

import { useDroppable } from '@dnd-kit/core';
import { isCompatibile } from '../../data/moduli';

const RUOLO_COLORS = {
  Por: 'var(--role-gk)', DD: 'var(--role-def)', DS: 'var(--role-def)', DC: 'var(--role-def)',
  'M/C': 'var(--role-mid)', M: 'var(--role-mid)', C: 'var(--role-mid)',
  'T/A': 'var(--role-fwd)', W: 'var(--role-fwd)', A: 'var(--role-fwd)',
  PC: 'var(--role-pk)',
};

function getRoleColor(ruoloMantra) {
  if (!ruoloMantra) return 'var(--fg-35)';
  const primary = ruoloMantra.split('/')[0].trim();
  return RUOLO_COLORS[primary] || RUOLO_COLORS[ruoloMantra] || 'var(--fg-35)';
}

export default function FormationSlot({ slotId, slot, giocatore, onClick }) {
  const { setNodeRef, isOver } = useDroppable({ id: slotId });

  const incompatibile = giocatore && !isCompatibile(giocatore.ruoloMantra, slot.ruoli);
  const roleColor = giocatore ? getRoleColor(giocatore.ruoloMantra) : null;

  const discClasses = ['slot__disc'];
  if (giocatore) discClasses.push('slot__disc--filled');
  else discClasses.push('slot__disc--empty');
  if (isOver) discClasses.push('slot__disc--over');
  if (incompatibile) discClasses.push('slot__disc--incompatible');

  const initial = giocatore
    ? (giocatore.cognome || giocatore.nome || '?').charAt(0).toUpperCase()
    : null;

  return (
    <div ref={setNodeRef} className="slot" onClick={onClick}>
      <div
        className={discClasses.join(' ')}
        style={roleColor ? { '--slot-role-color': roleColor } : undefined}
      >
        {giocatore ? (
          <span className="slot__initial">{initial}</span>
        ) : (
          <span className="slot__empty-plus" aria-hidden="true">+</span>
        )}
        {giocatore?.infortunato && (
          <span className="slot__badge slot__badge--danger" aria-label="Infortunato">✕</span>
        )}
        {giocatore?.diffidato && !giocatore?.infortunato && (
          <span className="slot__badge slot__badge--warn" aria-label="Diffidato">!</span>
        )}
      </div>
      {giocatore ? (
        <>
          <span className="slot__label">{giocatore.cognome || giocatore.nome}</span>
          <span className="slot__media">{giocatore.votoMedia?.toFixed(1) ?? '—'}</span>
        </>
      ) : (
        <span className="slot__role-hint">{slot.ruoli[0]}</span>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Build per verificare import e rendering**

Run: `npm run build`
Expected: build OK.

- [ ] **Step 3: Commit**

```bash
git add src/components/formation/FormationSlot.jsx
git commit -m "feat(restyle): FormationSlot 56px theme-aware con pulse su slot vuoti

- Rimossi inline styles hardcoded
- Classi CSS design-system (.slot, .slot__disc, .slot__label)
- Bordo 2px colore ruolo via CSS var --slot-role-color
- Animazione slotPulse su slot vuoti (rispetta prefers-reduced-motion)
- Badge infortunato/diffidato con classi semantiche"
```

---

## Task 4: BenchItem + BenchSidebar components

**Files:**
- Create: `src/components/formation/BenchItem.jsx`
- Create: `src/components/formation/BenchSidebar.jsx`

- [ ] **Step 1: Creare BenchItem (draggable)**

```jsx
// src/components/formation/BenchItem.jsx

import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

const RUOLO_COLORS = {
  Por: 'var(--role-gk)', DD: 'var(--role-def)', DS: 'var(--role-def)', DC: 'var(--role-def)',
  'M/C': 'var(--role-mid)', M: 'var(--role-mid)', C: 'var(--role-mid)',
  'T/A': 'var(--role-fwd)', W: 'var(--role-fwd)', A: 'var(--role-fwd)',
  PC: 'var(--role-pk)',
};

function getRoleColor(ruoloMantra) {
  if (!ruoloMantra) return 'var(--fg-35)';
  const primary = ruoloMantra.split('/')[0].trim();
  return RUOLO_COLORS[primary] || RUOLO_COLORS[ruoloMantra] || 'var(--fg-35)';
}

/**
 * BenchItem — singolo giocatore in panchina, draggabile verso il campo.
 * Disabilitato se infortunato (opacity + cursor not-allowed).
 */
export default function BenchItem({ giocatore }) {
  const disabled = !!giocatore.infortunato;
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `player-${giocatore.id}`,
    data: { giocatoreId: giocatore.id },
    disabled,
  });

  const roleColor = getRoleColor(giocatore.ruoloMantra);
  const initial = (giocatore.cognome || giocatore.nome || '?').charAt(0).toUpperCase();

  const classes = ['bench-item'];
  if (disabled) classes.push('bench-item--infortunato');

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={classes.join(' ')}
      style={{
        '--bench-item-color': roleColor,
        transform: CSS.Translate.toString(transform),
        opacity: isDragging ? 0.4 : undefined,
      }}
    >
      <div className="bench-item__avatar">{initial}</div>
      <div className="bench-item__text">
        <span className="bench-item__name">{giocatore.cognome || giocatore.nome}</span>
        <div className="bench-item__meta">
          <span className="bench-item__team">{giocatore.squadra || ''}</span>
          <span className="bench-item__media">{giocatore.votoMedia?.toFixed(1) ?? '—'}</span>
        </div>
      </div>
      {giocatore.infortunato && (
        <span className="bench-item__status bench-item__status--danger" aria-label="Infortunato">⚠</span>
      )}
      {giocatore.diffidato && !giocatore.infortunato && (
        <span className="bench-item__status bench-item__status--warn" aria-label="Diffidato">!</span>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Creare BenchSidebar con header, bottone AI, chip filtro, lista**

```jsx
// src/components/formation/BenchSidebar.jsx

import { useState } from 'react';
import BenchItem from './BenchItem';

const ROLE_FILTERS = [
  { key: 'all', label: 'Tutti', match: () => true },
  { key: 'por', label: 'POR', match: (g) => g.ruoloMantra?.split('/')[0].trim() === 'Por' },
  { key: 'dif', label: 'DIF', match: (g) => ['DD', 'DS', 'DC'].includes(g.ruoloMantra?.split('/')[0].trim()) },
  { key: 'cen', label: 'CEN', match: (g) => ['M/C', 'M', 'C'].includes(g.ruoloMantra?.split('/')[0].trim()) },
  { key: 'att', label: 'ATT', match: (g) => ['T/A', 'W', 'A', 'PC'].includes(g.ruoloMantra?.split('/')[0].trim()) },
];

/**
 * BenchSidebar — sidebar destra del Campo view.
 *
 * Props:
 * - panchinari: array di giocatori NON schierati
 * - onAiAnalysisClick: () => void — apre il BottomSheet stub "Analisi AI"
 */
export default function BenchSidebar({ panchinari, onAiAnalysisClick }) {
  const [filter, setFilter] = useState('all');

  const activeFilter = ROLE_FILTERS.find((f) => f.key === filter) || ROLE_FILTERS[0];
  const filtered = panchinari
    .filter(activeFilter.match)
    .sort((a, b) => (b.votoMedia || 0) - (a.votoMedia || 0));

  return (
    <aside className="campo-layout__sidebar" aria-label="Panchina">
      <div className="bench-header">
        <span className="bench-header__title">Panchina</span>
        <span className="bench-header__count">({panchinari.length})</span>
      </div>

      <button
        type="button"
        className="bench-ai-button"
        onClick={onAiAnalysisClick}
        aria-label="Analisi AI probabili titolari"
      >
        <span className="bench-ai-button__icon" aria-hidden="true">⚡</span>
        Analisi AI
      </button>

      <div className="bench-filter" role="tablist" aria-label="Filtro ruolo panchina">
        {ROLE_FILTERS.map((f) => (
          <button
            key={f.key}
            role="tab"
            aria-selected={filter === f.key}
            className={`bench-filter__chip${filter === f.key ? ' bench-filter__chip--active' : ''}`}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="bench-list">
        {filtered.length === 0 ? (
          <p className="bench-list__empty">
            {panchinari.length === 0 ? 'Tutti in campo! 🔥' : 'Nessun giocatore per questo ruolo.'}
          </p>
        ) : (
          filtered.map((g) => <BenchItem key={g.id} giocatore={g} />)
        )}
      </div>
    </aside>
  );
}
```

- [ ] **Step 3: Build per verificare i componenti**

Run: `npm run build`
Expected: build OK.

- [ ] **Step 4: Commit**

```bash
git add src/components/formation/BenchItem.jsx src/components/formation/BenchSidebar.jsx
git commit -m "feat(restyle): BenchSidebar + BenchItem per Campo view

- BenchItem draggabile via @dnd-kit, item 2 righe (cognome + team/media)
- BenchSidebar con header sticky, bottone Analisi AI, chip filtro ruolo
- Ordinamento per votoMedia desc
- Empty state 'Tutti in campo!'
- Bordo avatar colorato per ruolo via CSS var --bench-item-color"
```

---

## Task 5: FormationEditor layout split + PitchMarkings

**Files:**
- Modify: `src/components/formation/FormationEditor.jsx`

- [ ] **Step 1: Riscrivere il componente con il layout split e il nuovo pitch**

Sostituire TUTTO il contenuto di `src/components/formation/FormationEditor.jsx` con:

```jsx
// src/components/formation/FormationEditor.jsx

import { useState } from 'react';
import { DndContext, DragOverlay, PointerSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
import { MODULI } from '../../data/moduli';
import FormationSlot from './FormationSlot';
import PlayerToken from './PlayerToken';
import PitchMarkings from './PitchMarkings';
import BenchSidebar from './BenchSidebar';

/**
 * FormationEditor — campo Stadium Electric + sidebar panchina.
 *
 * Props:
 * - rosa: array giocatori
 * - modulo: string chiave modulo attivo
 * - titolariIds: number[]
 * - onTitolariChange: (ids: number[]) => void
 * - puntoAtteso: number
 * - onModuloChipClick: () => void
 * - onSlotTap: (slotIdx: number, slot: object) => void
 * - onAiAnalysisClick: () => void
 */
export default function FormationEditor({
  rosa,
  modulo,
  titolariIds,
  onTitolariChange,
  puntoAtteso,
  onModuloChipClick,
  onSlotTap,
  onAiAnalysisClick,
}) {
  const [activeGiocatoreId, setActiveGiocatoreId] = useState(null);

  const moduloDef = MODULI[modulo] || MODULI['4-3-3'];
  const slots = moduloDef.slots;

  // Map: slotIndex → giocatoreId
  const slotMap = Object.fromEntries(
    titolariIds.map((gId, idx) => [idx, gId]).filter(([, gId]) => gId != null)
  );

  const titolariSet = new Set(titolariIds);
  const panchinari = rosa.filter((g) => !titolariSet.has(g.id));

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } })
  );

  function getGiocatoreBySlotIndex(idx) {
    return rosa.find((g) => g.id === slotMap[idx]) || null;
  }

  function handleDragStart({ active }) {
    setActiveGiocatoreId(active.data.current?.giocatoreId ?? null);
  }

  function handleDragEnd({ active, over }) {
    setActiveGiocatoreId(null);
    if (!over) return;

    const draggedId = active.data.current?.giocatoreId;
    const targetSlotIdx = parseInt(String(over.id).replace('slot-', ''), 10);
    if (isNaN(targetSlotIdx) || draggedId == null) return;

    const newIds = [...titolariIds];
    const currentSlotIdx = newIds.indexOf(draggedId);
    const occupantId = newIds[targetSlotIdx];

    if (currentSlotIdx >= 0) {
      // Drag da slot in campo: swap
      newIds[targetSlotIdx] = draggedId;
      newIds[currentSlotIdx] = occupantId ?? null;
    } else {
      // Drag dalla panchina: piazza nello slot
      newIds[targetSlotIdx] = draggedId;
    }
    onTitolariChange(newIds.filter((id) => id != null));
  }

  function handleSlotClick(slotIdx) {
    if (slotMap[slotIdx]) {
      // Slot occupato: rimuovi (manda in panchina)
      const newIds = titolariIds.filter((id) => id !== slotMap[slotIdx]);
      onTitolariChange(newIds);
    } else {
      // Slot vuoto: apri player picker (fallback tap)
      onSlotTap?.(slotIdx, slots[slotIdx]);
    }
  }

  // Raggruppa gli slot per riga
  const rows = slots.reduce((acc, slot, idx) => {
    (acc[slot.row] = acc[slot.row] || []).push({ slot, idx });
    return acc;
  }, {});

  const activeGiocatore = rosa.find((g) => g.id === activeGiocatoreId) || null;

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

        {/* Toolbar: modulo chip + punteggio atteso */}
        <div className="campo-toolbar">
          <button
            className="modulo-chip"
            onClick={onModuloChipClick}
            aria-label={`Modulo attivo: ${moduloDef.label}. Tocca per cambiare`}
          >
            {moduloDef.label}
            <span className="modulo-chip-arrow" aria-hidden="true">▼</span>
          </button>
          <span className="campo-kpi">
            Atteso: <strong>{puntoAtteso?.toFixed(1) ?? '—'}</strong>
          </span>
        </div>

        {/* Split: Campo + Sidebar */}
        <div className="campo-layout">
          <div className="campo-layout__field">
            <div className="pitch">
              <PitchMarkings />
              {Object.keys(rows).sort((a, b) => b - a).map((rowKey) => (
                <div key={rowKey} className="pitch__row">
                  {rows[rowKey].map(({ slot, idx }) => (
                    <FormationSlot
                      key={slot.id}
                      slotId={`slot-${idx}`}
                      slot={slot}
                      giocatore={getGiocatoreBySlotIndex(idx)}
                      onClick={() => handleSlotClick(idx)}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>

          <BenchSidebar
            panchinari={panchinari}
            onAiAnalysisClick={onAiAnalysisClick}
          />
        </div>
      </div>

      <DragOverlay>
        {activeGiocatore ? <PlayerToken giocatore={activeGiocatore} /> : null}
      </DragOverlay>
    </DndContext>
  );
}
```

- [ ] **Step 2: Build completo**

Run: `npm run build`
Expected: build OK.

- [ ] **Step 3: Commit**

```bash
git add src/components/formation/FormationEditor.jsx
git commit -m "feat(restyle): FormationEditor con layout split Campo + Sidebar Panchina

- Rimosso gradient verde hardcoded, sostituito con .pitch theme-aware
- Montato PitchMarkings SVG overlay
- Montata BenchSidebar affiancata (140px mobile / 220px desktop)
- Passata lista panchinari calcolata da rosa + titolariSet
- Nuova prop onAiAnalysisClick inoltrata alla sidebar"
```

---

## Task 6: Schieramento — BottomSheet stub Analisi AI

**Files:**
- Modify: `src/pages/Schieramento.jsx`

- [ ] **Step 1: Aprire `src/pages/Schieramento.jsx` e aggiungere stato + handler**

Dopo la dichiarazione di `pickerSlot` (riga `const [pickerSlot, setPickerSlot] = useState(null);`), aggiungere:

```jsx
const [aiStubOpen, setAiStubOpen] = useState(false);
```

- [ ] **Step 2: Passare la prop `onAiAnalysisClick` a `<FormationEditor>`**

Nel blocco `<FormationEditor ...>` nel tab Campo, aggiungere dopo `onSlotTap={handleSlotTap}`:

```jsx
            onAiAnalysisClick={() => setAiStubOpen(true)}
```

- [ ] **Step 3: Aggiungere il BottomSheet stub prima della chiusura `</div>` finale**

Subito prima del `</div>` che chiude `<div className="schiera-page">`, aggiungere:

```jsx
      {/* BottomSheet: Analisi AI stub (backend in arrivo) */}
      <BottomSheet
        isOpen={aiStubOpen}
        onClose={() => setAiStubOpen(false)}
        title="Analisi AI — Probabili titolari"
      >
        <div style={{
          padding: 'var(--space-4)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-3)',
          alignItems: 'center',
          textAlign: 'center',
        }}>
          <span style={{ fontSize: 32 }} aria-hidden="true">⚡</span>
          <p style={{ fontSize: 14, color: 'var(--fg-70)', margin: 0 }}>
            L'analisi AI calcolerà la probabilità di partenza da titolare per ogni
            giocatore della tua rosa basandosi sulle ultime news e sulle probabili formazioni.
          </p>
          <p style={{ fontSize: 13, color: 'var(--color-gold)', fontWeight: 700, margin: 0 }}>
            Feature in arrivo — disponibile con il piano Gold.
          </p>
        </div>
      </BottomSheet>
```

- [ ] **Step 4: Build + smoke test manuale**

Run: `npm run build`
Expected: build OK.

Smoke test manuale (`npm run dev` e verificare):
- Tab Campo mostra campo Plum/Milk con markings visibili (non più verde)
- Sidebar destra mostra "Panchina (N)" + bottone "⚡ Analisi AI" + chip filtro + lista panchinari
- Slot vuoti pulsano (se modulo scelto ma pochi titolari)
- Click sul bottone Analisi AI apre BottomSheet stub
- Drag da sidebar a slot: funziona, giocatore schierato
- Drag tra due slot del campo: swap funziona
- Click su slot occupato: rimanda in panchina (appare nella sidebar)
- Click su slot vuoto: apre player picker (comportamento esistente)
- Chip filtro POR/DIF/CEN/ATT filtra la lista sidebar
- Cambio modulo da BottomSheet: slot preservation funziona
- Switch theme dark/light: campo, markings, slot, sidebar cambiano tema correttamente

- [ ] **Step 5: Commit**

```bash
git add src/pages/Schieramento.jsx
git commit -m "feat(restyle): collega bottone Analisi AI a BottomSheet stub

Stub mostra messaggio 'feature in arrivo, disponibile con piano Gold'.
Backend tracked su Notion 'Da fare Dante'."
```

---

## Task 7: Tag fase + smoke test finale

**Files:** nessuno

- [ ] **Step 1: Build finale + verifica bundle**

Run: `npm run build`
Expected: build OK, aumento bundle contenuto rispetto a 2b complete (537 kB).

- [ ] **Step 2: Re-check smoke test completo**

Run tutti i check dello Step 4 del Task 6 anche in light mode.

- [ ] **Step 3: Tag git della fase**

```bash
git tag restyle-phase-2b-campo-complete
```

- [ ] **Step 4: Aggiornare Notion**

Aggiornare la sessione 5.5 nel "Documento di Monitoraggio" (page id `32ba07f30ee481c49a5ef8c03a4e08c8`) spuntando la "Fase in corso — Redesign Campo View" come completata e aggiungere il tag.
