// src/components/formation/FormationEditor.jsx

import { useState } from 'react';
import { DndContext, DragOverlay, PointerSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
import { MODULI } from '../../data/moduli';
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
      // Slot vuoto: apri player picker
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
