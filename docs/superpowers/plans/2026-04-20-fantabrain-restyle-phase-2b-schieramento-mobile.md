# Restyle Phase 2b — Schieramento Mobile-first Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Trasformare la pagina Schieramento in un'esperienza mobile-first con sub-tab Campo/Rosa, BottomSheet per la selezione modulo, campo fullscreen e slot preservation al cambio modulo.

**Architecture:** `Schieramento.jsx` gestisce il routing dei sub-tab via `useSearchParams(?tab=campo|rosa)`. Il tab Campo mostra `FormationEditor` fullscreen (senza sidebar laterale). Il tab Rosa mostra `LaRosa` inline. Un `BottomSheet` generico gestisce sia la selezione modulo che il picker giocatori al tap su slot vuoto.

**Tech Stack:** React 19, React Router v6 `useSearchParams` (compatibile con HashRouter), @dnd-kit/core (già installato), CSS custom properties Stadium Electric.

---

## Contesto codebase

**Recon eseguito — shape attuale:**

- `src/pages/Schieramento.jsx` (93 righe): layout desktop flex-row con `FormationEditor` + AI sidebar 280px. Da riscrivere.
- `src/components/formation/FormationEditor.jsx` (159 righe): DnD kit con TouchSensor. Contiene `<select>` modulo + `PlayerList` lateral panel. Da aggiornare (rimuovere select e panel, aggiungere callback).
- `src/pages/LaRosa.jsx` (413 righe): gestione rosa con tabella, filtri, modali. Manteniamo invariata — la montiamo come sub-tab Rosa.
- `src/data/moduli.js`: 15 moduli, esporta `MODULI`, `MODULI_LIST`, `isCompatibile`.
- Redirect `/la-rosa` → `/schieramento?tab=rosa` già in `App.jsx` da Fase 1.
- Store: `useAppStore` → `modulo`, `setModulo`, `titolariIds`, `setTitolariIds`, `rosa`.

**Token CSS già disponibili:** `--fg`, `--bg`, `--surface`, `--surface-hover`, `--border-subtle`, `--border`, `--fg-70`, `--fg-55`, `--radius-xl`, `--radius-lg`, `--radius-md`, `--radius-full`, `--space-*`, `--font-display`, `--font-mono`, `--font-body`, `--motion-micro`, `--color-danger`, `pulseDanger` keyframe.

---

## File Structure

| File | Operazione | Responsabilità |
|------|-----------|----------------|
| `src/styles/design-system.css` | Modifica (append) | Classi `.schiera-page`, `.schiera-tab-bar`, `.tab-btn`, `.bottom-sheet-*`, `.modulo-chip`, `.campo-toolbar` |
| `src/components/patterns/BottomSheet.jsx` | Crea | Sheet generico slide-up con backdrop e close button |
| `src/components/patterns/SchieraTabBar.jsx` | Crea | Tab bar Campo/Rosa con URL sync |
| `src/components/formation/FormationEditor.jsx` | Modifica | Rimuove `<select>` e `PlayerList` panel, aggiunge `onModuloChipClick` e `onSlotTap` |
| `src/pages/Schieramento.jsx` | Riscrive | Orchestrazione tab, BottomSheet modulo, BottomSheet player picker, slot preservation |

---

## Task 1 — CSS patterns Fase 2b in `design-system.css`

**Files:**
- Modify: `src/styles/design-system.css` (append prima del blocco `RESPONSIVE`)

- [ ] **Step 1: Inserire il blocco CSS**

Trova la riga con `/* ══ RESPONSIVE` e inserisci il blocco **prima** di essa (stesso punto di Task 3 Fase 2a — metti il nuovo blocco subito dopo la fine di `/* PATTERN LIBRARY — Fase 2a */`).

```css
/* ══════════════════════════════════════════════════════════
   PATTERN LIBRARY — Fase 2b
   BottomSheet · SchieraTabBar · ModuloChip · CampoToolbar
   ══════════════════════════════════════════════════════════ */

/* ── BottomSheet ────────────────────────────────────────── */
.bottom-sheet-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  z-index: 200;
  animation: fadeIn 180ms ease-out;
}

.bottom-sheet {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 201;
  background: var(--surface);
  border-top: 1px solid var(--border-subtle);
  border-radius: var(--radius-xl) var(--radius-xl) 0 0;
  padding: var(--space-5) var(--space-5) calc(var(--space-5) + env(safe-area-inset-bottom));
  max-height: 70vh;
  overflow-y: auto;
  animation: slideUp 220ms ease-out;
}

.bottom-sheet-handle {
  width: 40px;
  height: 4px;
  border-radius: 2px;
  background: var(--fg-55);
  margin: 0 auto var(--space-4);
}

.bottom-sheet-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-4);
}

.bottom-sheet-title {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 16px;
  color: var(--fg);
}

.bottom-sheet-close {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--surface-hover);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 14px;
  color: var(--fg-70);
  flex-shrink: 0;
}

/* ── SchieraTabBar ──────────────────────────────────────── */
.schiera-tab-bar {
  display: flex;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-4);
  background: var(--bg);
  border-bottom: 1px solid var(--border-subtle);
}

.tab-btn {
  flex: 1;
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-md);
  border: 1px solid transparent;
  background: transparent;
  font-family: var(--font-display);
  font-size: 13px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--fg-55);
  cursor: pointer;
  transition: background var(--motion-micro) ease-out,
              color var(--motion-micro) ease-out,
              border-color var(--motion-micro) ease-out;
}

.tab-btn:hover {
  background: var(--surface-hover);
  color: var(--fg);
}

.tab-btn--active {
  background: var(--fg);
  color: var(--bg);
  border-color: var(--fg);
}

/* ── Modulo chip (nel toolbar del campo) ────────────────── */
.campo-toolbar {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  background: var(--bg);
  border-bottom: 1px solid var(--border-subtle);
  flex-shrink: 0;
}

.modulo-chip {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-full);
  background: var(--surface);
  border: 1px solid var(--border);
  font-family: var(--font-display);
  font-size: 13px;
  font-weight: 700;
  color: var(--fg);
  cursor: pointer;
  transition: background var(--motion-micro) ease-out,
              border-color var(--motion-micro) ease-out;
}

.modulo-chip:hover {
  background: var(--surface-hover);
  border-color: var(--fg-55);
}

.modulo-chip-arrow {
  font-size: 10px;
  opacity: 0.6;
  margin-left: 2px;
}

.campo-kpi {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--fg-55);
  margin-left: auto;
}

.campo-kpi strong {
  color: var(--fg);
  font-weight: 600;
}

/* ── Modulo list nel BottomSheet ────────────────────────── */
.modulo-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.modulo-list-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-md);
  background: var(--surface);
  border: 1px solid var(--border-subtle);
  cursor: pointer;
  font-family: var(--font-display);
  font-size: 14px;
  font-weight: 700;
  color: var(--fg);
  transition: background var(--motion-micro) ease-out,
              border-color var(--motion-micro) ease-out;
}

.modulo-list-item:hover {
  background: var(--surface-hover);
  border-color: var(--border);
}

.modulo-list-item--active {
  background: var(--fg);
  color: var(--bg);
  border-color: var(--fg);
}

/* ── Player picker nel BottomSheet ──────────────────────── */
.player-picker-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.player-picker-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-md);
  background: var(--surface);
  border: 1px solid var(--border-subtle);
  cursor: pointer;
  transition: background var(--motion-micro) ease-out;
}

.player-picker-item:hover {
  background: var(--surface-hover);
}

.player-picker-item--infortunato {
  opacity: 0.5;
}

.player-picker-role {
  font-family: var(--font-mono);
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--fg-55);
  min-width: 32px;
}

.player-picker-name {
  flex: 1;
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 600;
  color: var(--fg);
}

.player-picker-media {
  font-family: var(--font-mono);
  font-size: 12px;
  font-weight: 600;
  color: var(--fg-70);
}

/* ── Schiera page wrapper ───────────────────────────────── */
.schiera-page {
  display: flex;
  flex-direction: column;
  height: calc(100vh - var(--bottom-nav-height, 72px));
  overflow: hidden;
}

.schiera-tab-content {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
}

.schiera-tab-content--campo {
  overflow: hidden;
}
```

- [ ] **Step 2: Build check**

Run: `npm run build`
Expected: exit code 0. Nessun errore CSS.

- [ ] **Step 3: Commit**

```bash
git add src/styles/design-system.css
git commit -m "feat(restyle): add Fase 2b CSS patterns (BottomSheet, TabBar, ModuloChip)"
```

---

## Task 2 — `BottomSheet.jsx`

**Files:**
- Create: `src/components/patterns/BottomSheet.jsx`

- [ ] **Step 1: Creare il file**

```jsx
// src/components/patterns/BottomSheet.jsx

import { useEffect } from 'react';

/**
 * BottomSheet — sheet generico slide-up.
 *
 * Props:
 * - isOpen: bool
 * - onClose: () => void
 * - title: string
 * - children: ReactNode
 */
export default function BottomSheet({ isOpen, onClose, title, children }) {
  // Blocca lo scroll del body quando il sheet è aperto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      <div
        className="bottom-sheet-backdrop"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className="bottom-sheet"
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="bottom-sheet-handle" aria-hidden="true" />
        <div className="bottom-sheet-header">
          <span className="bottom-sheet-title">{title}</span>
          <button
            className="bottom-sheet-close"
            onClick={onClose}
            aria-label="Chiudi"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </>
  );
}
```

- [ ] **Step 2: Build check**

Run: `npm run build`
Expected: exit code 0.

- [ ] **Step 3: Commit**

```bash
git add src/components/patterns/BottomSheet.jsx
git commit -m "feat(restyle): add BottomSheet generic component (slide-up sheet)"
```

---

## Task 3 — `SchieraTabBar.jsx`

**Files:**
- Create: `src/components/patterns/SchieraTabBar.jsx`

- [ ] **Step 1: Creare il file**

```jsx
// src/components/patterns/SchieraTabBar.jsx

/**
 * SchieraTabBar — tab bar Campo / Rosa.
 *
 * Props:
 * - activeTab: 'campo' | 'rosa'
 * - onTabChange: (tab: 'campo' | 'rosa') => void
 * - rosaCount?: number — badge opzionale sul tab Rosa
 */
export default function SchieraTabBar({ activeTab, onTabChange, rosaCount }) {
  return (
    <nav className="schiera-tab-bar" role="tablist" aria-label="Schieramento sezioni">
      <button
        role="tab"
        aria-selected={activeTab === 'campo'}
        className={`tab-btn${activeTab === 'campo' ? ' tab-btn--active' : ''}`}
        onClick={() => onTabChange('campo')}
      >
        Campo
      </button>
      <button
        role="tab"
        aria-selected={activeTab === 'rosa'}
        className={`tab-btn${activeTab === 'rosa' ? ' tab-btn--active' : ''}`}
        onClick={() => onTabChange('rosa')}
      >
        Rosa{rosaCount != null ? ` (${rosaCount})` : ''}
      </button>
    </nav>
  );
}
```

- [ ] **Step 2: Build check**

Run: `npm run build`
Expected: exit code 0.

- [ ] **Step 3: Commit**

```bash
git add src/components/patterns/SchieraTabBar.jsx
git commit -m "feat(restyle): add SchieraTabBar component (Campo/Rosa sub-tab)"
```

---

## Task 4 — Aggiornamento `FormationEditor.jsx`

Rimuovere il `<select>` modulo e il `PlayerList` lateral panel. Aggiungere:
- `onModuloChipClick` prop: chiamata quando si tocca il chip modulo
- `onSlotTap(slotIdx, slot)` prop: chiamata quando si tocca uno slot **vuoto** (non occupato)

Il drag-and-drop rimane invariato.

**Files:**
- Modify: `src/components/formation/FormationEditor.jsx`

- [ ] **Step 1: Leggere il file attuale** (già letto in recon, shape confermata)

- [ ] **Step 2: Sovrascrivere `FormationEditor.jsx`**

```jsx
// src/components/formation/FormationEditor.jsx

import { useState } from 'react';
import { DndContext, DragOverlay, PointerSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
import { MODULI, isCompatibile } from '../../data/moduli';
import FormationSlot from './FormationSlot';
import PlayerToken from './PlayerToken';

/**
 * FormationEditor — campo drag-and-drop.
 *
 * Props:
 * - rosa: array giocatori
 * - modulo: string chiave modulo attivo
 * - titolariIds: number[] (lunghezza = numero slot)
 * - onTitolariChange: (ids: number[]) => void
 * - puntoAtteso: number
 * - onModuloChipClick: () => void — apre il BottomSheet modulo
 * - onSlotTap: (slotIdx: number, slot: object) => void — tocco su slot vuoto (player picker)
 */
export default function FormationEditor({
  rosa,
  modulo,
  titolariIds,
  onTitolariChange,
  puntoAtteso,
  onModuloChipClick,
  onSlotTap,
}) {
  const [activeGiocatoreId, setActiveGiocatoreId] = useState(null);

  const moduloDef = MODULI[modulo] || MODULI['4-3-3'];
  const slots = moduloDef.slots;

  // Map: slotIndex → giocatoreId
  const slotMap = Object.fromEntries(
    titolariIds.map((gId, idx) => [idx, gId]).filter(([, gId]) => gId != null)
  );

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
    const targetSlotIdx = parseInt(over.id.replace('slot-', ''), 10);
    if (isNaN(targetSlotIdx) || draggedId == null) return;

    const newIds = [...titolariIds];
    const currentSlotIdx = newIds.indexOf(draggedId);
    const occupantId = newIds[targetSlotIdx];

    if (currentSlotIdx >= 0) {
      newIds[targetSlotIdx] = draggedId;
      newIds[currentSlotIdx] = occupantId ?? null;
    } else {
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
      // Slot vuoto: apri player picker
      onSlotTap?.(slotIdx, slots[slotIdx]);
    }
  }

  // Group slots by row
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

        {/* Campo */}
        <div style={{
          flex: 1,
          background: 'linear-gradient(180deg, #0F3320 0%, #155228 30%, #1A6030 50%, #155228 70%, #0F3320 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-around',
          padding: '16px 8px',
          position: 'relative',
          overflowY: 'auto',
        }}>
          {/* Linea di centrocampo */}
          <div style={{
            position: 'absolute', top: '50%', left: '10%', right: '10%',
            height: '1px', background: '#ffffff15', pointerEvents: 'none',
          }} />

          {Object.keys(rows).sort((a, b) => b - a).map((rowKey) => (
            <div key={rowKey} style={{ display: 'flex', gap: '16px', alignItems: 'center', zIndex: 1 }}>
              {rows[rowKey].map(({ slot, idx }) => (
                <FormationSlot
                  key={slot.id}
                  slotId={`slot-${idx}`}
                  slot={slot}
                  giocatore={getGiocatoreBySlotIndex(idx)}
                  isSelected={false}
                  onClick={() => handleSlotClick(idx)}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      <DragOverlay>
        {activeGiocatore ? <PlayerToken giocatore={activeGiocatore} /> : null}
      </DragOverlay>
    </DndContext>
  );
}
```

**Diff rispetto all'originale:**
- Rimossi: import `PlayerList`, `useState` per `selectedSlotId`/`highlightedIds`, l'intero block `<PlayerList />`
- Rimosso: `<select>` nel toolbar → sostituito con `<button className="modulo-chip">`
- Aggiunto: `onModuloChipClick` e `onSlotTap` props
- `handleSlotClick`: slot occupato → rimuovi; slot vuoto → `onSlotTap`
- Il campo prende tutta la larghezza disponibile

- [ ] **Step 3: Build check**

Run: `npm run build`
Expected: exit code 0. `PlayerList` viene ancora importato da `Schieramento` (Task 5) — non warning.

- [ ] **Step 4: Commit**

```bash
git add src/components/formation/FormationEditor.jsx
git commit -m "feat(restyle): update FormationEditor — modulo chip + onSlotTap, rimuovi PlayerList panel"
```

---

## Task 5 — Rewrite `Schieramento.jsx`

Il componente orchestratore. Gestisce:
1. Sub-tab routing via `useSearchParams`
2. BottomSheet modulo (selezione tra 15 moduli + slot preservation)
3. BottomSheet player picker (slot tap → mostra giocatori compatibili)
4. Tab Campo: `<FormationEditor>` fullscreen
5. Tab Rosa: `<LaRosa>` inline

**Files:**
- Modify: `src/pages/Schieramento.jsx` (rewrite completo)

- [ ] **Step 1: Leggere il file** (già letto in recon — 93 righe, layout desktop)

- [ ] **Step 2: Sovrascrivere `Schieramento.jsx`**

```jsx
// src/pages/Schieramento.jsx

import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import useAppStore from '../store/useAppStore';
import { MODULI, MODULI_LIST, isCompatibile } from '../data/moduli';
import FormationEditor from '../components/formation/FormationEditor';
import SchieraTabBar from '../components/patterns/SchieraTabBar';
import BottomSheet from '../components/patterns/BottomSheet';
import LaRosa from './LaRosa';

export default function Schieramento() {
  // ── URL tab sync ───────────────────────────────────────
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') === 'rosa' ? 'rosa' : 'campo';

  function handleTabChange(tab) {
    setSearchParams(tab === 'campo' ? {} : { tab });
  }

  // ── Store ──────────────────────────────────────────────
  const rosa = useAppStore((s) => s.rosa);
  const modulo = useAppStore((s) => s.modulo);
  const setModulo = useAppStore((s) => s.setModulo);
  const titolariIds = useAppStore((s) => s.titolariIds);
  const setTitolariIds = useAppStore((s) => s.setTitolariIds);

  // ── Bottom sheet state ─────────────────────────────────
  const [moduloSheetOpen, setModuloSheetOpen] = useState(false);
  const [pickerSlot, setPickerSlot] = useState(null); // { slotIdx, slot } | null

  // ── Calcoli ────────────────────────────────────────────
  const titolari = rosa.filter((g) => titolariIds.includes(g.id));
  const puntoAtteso = titolari.reduce((sum, g) => sum + (g.votoMedia || 0), 0);

  // ── Handlers ───────────────────────────────────────────

  /** Cambia modulo con slot preservation: mantieni il giocatore in slot[i]
   *  solo se il suo ruolo è compatibile con il nuovo slot[i]. */
  function handleModuloChange(newModulo) {
    const newSlots = MODULI[newModulo]?.slots ?? [];
    const newIds = newSlots.map((newSlot, idx) => {
      const currentId = titolariIds[idx];
      if (currentId == null) return null;
      const giocatore = rosa.find((g) => g.id === currentId);
      if (!giocatore) return null;
      return isCompatibile(giocatore.ruoloMantra, newSlot.ruoli) ? currentId : null;
    });
    setModulo(newModulo);
    setTitolariIds(newIds.filter(Boolean));
    setModuloSheetOpen(false);
  }

  /** Tap su slot vuoto → apri player picker */
  function handleSlotTap(slotIdx, slot) {
    setPickerSlot({ slotIdx, slot });
  }

  /** Scelta giocatore nel picker → assegna allo slot */
  function handlePickerSelect(gId) {
    if (pickerSlot == null) return;
    const newIds = [...titolariIds];
    // Rimuovi il giocatore da un altro slot se già titolare
    const existingIdx = newIds.indexOf(gId);
    if (existingIdx >= 0) newIds[existingIdx] = null;
    newIds[pickerSlot.slotIdx] = gId;
    setTitolariIds(newIds.filter(Boolean));
    setPickerSlot(null);
  }

  // ── Player picker: giocatori compatibili non titolari ──
  const compatibiliPicker = pickerSlot
    ? rosa.filter(
        (g) =>
          !titolariIds.includes(g.id) &&
          isCompatibile(g.ruoloMantra, pickerSlot.slot.ruoli)
      )
    : [];

  return (
    <div className="schiera-page">
      {/* Sub-tab bar */}
      <SchieraTabBar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        rosaCount={rosa.length > 0 ? rosa.length : undefined}
      />

      {/* Tab: Campo */}
      {activeTab === 'campo' && (
        <div className="schiera-tab-content schiera-tab-content--campo">
          <FormationEditor
            rosa={rosa}
            modulo={modulo}
            titolariIds={titolariIds}
            onTitolariChange={setTitolariIds}
            puntoAtteso={puntoAtteso}
            onModuloChipClick={() => setModuloSheetOpen(true)}
            onSlotTap={handleSlotTap}
          />
        </div>
      )}

      {/* Tab: Rosa */}
      {activeTab === 'rosa' && (
        <div className="schiera-tab-content">
          <LaRosa />
        </div>
      )}

      {/* BottomSheet: selezione modulo */}
      <BottomSheet
        isOpen={moduloSheetOpen}
        onClose={() => setModuloSheetOpen(false)}
        title="Scegli modulo"
      >
        <div className="modulo-list">
          {MODULI_LIST.map((m) => (
            <button
              key={m}
              className={`modulo-list-item${m === modulo ? ' modulo-list-item--active' : ''}`}
              onClick={() => handleModuloChange(m)}
            >
              {MODULI[m].label}
              {m === modulo && <span aria-hidden="true">✓</span>}
            </button>
          ))}
        </div>
      </BottomSheet>

      {/* BottomSheet: player picker */}
      <BottomSheet
        isOpen={pickerSlot != null}
        onClose={() => setPickerSlot(null)}
        title={
          pickerSlot
            ? `Scegli giocatore — ${pickerSlot.slot.ruoli.join('/')}`
            : 'Scegli giocatore'
        }
      >
        {compatibiliPicker.length === 0 ? (
          <p style={{ color: 'var(--fg-55)', fontSize: 14, textAlign: 'center', padding: 'var(--space-4)' }}>
            Nessun giocatore compatibile disponibile in panchina.
          </p>
        ) : (
          <div className="player-picker-list">
            {compatibiliPicker
              .sort((a, b) => (b.votoMedia || 0) - (a.votoMedia || 0))
              .map((g) => (
                <button
                  key={g.id}
                  className={`player-picker-item${g.infortunato ? ' player-picker-item--infortunato' : ''}`}
                  onClick={() => !g.infortunato && handlePickerSelect(g.id)}
                  disabled={g.infortunato}
                  aria-label={`${g.nome} ${g.cognome}${g.infortunato ? ' (infortunato)' : ''}`}
                >
                  <span className="player-picker-role">{g.ruoloMantra}</span>
                  <span className="player-picker-name">
                    {g.nome} {g.cognome}
                    {g.infortunato && <span style={{ fontSize: 11, marginLeft: 6, color: 'var(--color-danger)' }}>⚠ infort.</span>}
                  </span>
                  <span className="player-picker-media">{g.votoMedia?.toFixed(1) ?? '—'}</span>
                </button>
              ))}
          </div>
        )}
      </BottomSheet>
    </div>
  );
}
```

**Cambiamenti rispetto al file precedente:**
- Rimosso: AI sidebar 280px (analisi AI → `/ai-analisi` via QuickCard in Home)
- Rimosso: `handleOttimizza`, `aiLoading`, `aiRisultato`, `aiError` state
- Rimosso: `analizzaSchieramento` import (non più chiamato da questa pagina)
- Aggiunto: `useSearchParams` per routing tab
- Aggiunto: `BottomSheet` modulo con slot preservation
- Aggiunto: `BottomSheet` player picker su slot tap
- Aggiunto: `SchieraTabBar` + `LaRosa` nel tab Rosa
- Layout: flex colonna fullscreen, non più flex-row desktop

- [ ] **Step 3: Build check**

Run: `npm run build`
Expected: exit code 0. Il bundle JS dovrebbe scendere ancora (~5-10kB, rimozione AI sidebar import).

- [ ] **Step 4: Commit**

```bash
git add src/pages/Schieramento.jsx
git commit -m "feat(restyle): rewrite Schieramento — mobile-first, sub-tab Campo/Rosa, BottomSheet modulo+picker

- Tab Campo: FormationEditor fullscreen, toolbar con ModuloChip
- Tab Rosa: LaRosa inline (redirect /la-rosa?tab=rosa funziona gia')
- BottomSheet modulo: 15 moduli con slot preservation al cambio
- BottomSheet player picker: tap slot vuoto -> giocatori compatibili ordinati per media
- Rimossa AI sidebar (analisi AI gia' in /ai-analisi via QuickCard Home)"
```

---

## Task 6 — Smoke test + tag `restyle-phase-2b-complete`

**Files:** nessuno (solo verifica + tag)

- [ ] **Step 1: Build pulito**

```bash
npm run build
```
Expected: exit code 0. Annotare bundle size.

- [ ] **Step 2: Smoke manuale — Tab Campo**

Run: `npm run dev`. Naviga a `/schieramento` (o tasto "Schiera" in BottomNav).

- [ ] Tab bar "Campo" e "Rosa" visibili in cima
- [ ] "Campo" è active di default (sfondo pieno)
- [ ] Chip modulo mostra es. "4-3-3 ▼"
- [ ] Tap sul chip → BottomSheet slide-up con lista 15 moduli
- [ ] Modulo attivo ha checkmark ✓ e sfondo invertito
- [ ] Seleziona "3-5-2" → sheet si chiude, campo ridisegna con 3+5+2, giocatori incompatibili rimossi
- [ ] Campo occulta tutta la larghezza, nessuna sidebar
- [ ] Tap su slot vuoto → BottomSheet player picker con giocatori compatibili
- [ ] Tap giocatore nel picker → si schiera nello slot, sheet si chiude
- [ ] Drag-and-drop tra slot funziona ancora (PointerSensor + TouchSensor)
- [ ] Tap su slot occupato → lo rimuove dalla formazione
- [ ] `puntoAtteso` nel toolbar si aggiorna

- [ ] **Step 3: Smoke manuale — Tab Rosa**

- [ ] Tap "Rosa" → LaRosa si carica nella tab
- [ ] URL diventa `#/schieramento?tab=rosa`
- [ ] Navigare a `#/la-rosa` → redirect corretto a `#/schieramento?tab=rosa` (Fase 1)
- [ ] Aggiunta/rimozione giocatore nella tab Rosa funziona
- [ ] Tornare a tab "Campo" → formazione preservata

- [ ] **Step 4: Regressione Home**

- [ ] Home (`/`) → BottomNav tab "Home" attivo, HeroBlock visibile
- [ ] QuickCard "Schiera" → naviga a `/schieramento` (tab Campo)
- [ ] QuickCard "Infortuni" → naviga a `/la-rosa` → redirect a `/schieramento?tab=rosa`

- [ ] **Step 5: Tag**

```bash
git tag restyle-phase-2b-complete
```

---

## Nota su `LaRosa.jsx` nel tab Rosa

`LaRosa.jsx` viene montato inline nel tab Rosa senza modifiche. La tabella è orizzontalmente scrollabile su mobile (CSS `overflow-x: auto` già presente nel componente). Il pannello dettaglio laterale (`.glass-elevated` sticky) si sovrappone correttamente su mobile. Non c'è bisogno di un componente separato `RosaTab.jsx` — YAGNI. Se in Fase 3 si vuole una lista card mobile-first, si può sostituire `<LaRosa />` con il nuovo componente senza toccare la logica.

---

## Esecuzione consigliata

Eseguire Task-by-Task inline nella sessione principale (dati i timeout subagent osservati su questa harness Windows in Fase 1 e 2a). 6 task + smoke + tag.
