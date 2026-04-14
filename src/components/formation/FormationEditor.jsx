import { useState } from 'react';
import { DndContext, DragOverlay, PointerSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
import { MODULI, MODULI_LIST, isCompatibile } from '../../data/moduli';
import FormationSlot from './FormationSlot';
import PlayerToken from './PlayerToken';
import PlayerList from './PlayerList';

export default function FormationEditor({ rosa, modulo, titolariIds, onModuloChange, onTitolariChange, puntoAtteso }) {
  const [activeGiocatoreId, setActiveGiocatoreId] = useState(null);
  const [selectedSlotId, setSelectedSlotId] = useState(null);
  const [highlightedIds, setHighlightedIds] = useState([]);

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
      // Drag from field slot: swap
      newIds[targetSlotIdx] = draggedId;
      newIds[currentSlotIdx] = occupantId ?? null;
    } else {
      // Drag from roster list: place, kick existing to bench if any
      newIds[targetSlotIdx] = draggedId;
    }
    onTitolariChange(newIds.filter((id) => id != null));
  }

  function handleSlotClick(slotIdx) {
    const slot = slots[slotIdx];
    if (slotMap[slotIdx]) {
      // Deselect
      setSelectedSlotId(null);
      setHighlightedIds([]);
    } else {
      setSelectedSlotId(slotIdx);
      // Highlight compatible players not yet in starting XI
      const compatible = rosa
        .filter((g) => !titolariIds.includes(g.id) && isCompatibile(g.ruoloMantra, slot.ruoli))
        .map((g) => g.id);
      setHighlightedIds(compatible);
    }
  }

  function handlePlayerListClick(gId) {
    if (selectedSlotId == null) return;
    const newIds = [...titolariIds];
    newIds[selectedSlotId] = gId;
    onTitolariChange(newIds);
    setSelectedSlotId(null);
    setHighlightedIds([]);
  }

  // Group slots by row
  const rows = slots.reduce((acc, slot, idx) => {
    (acc[slot.row] = acc[slot.row] || []).push({ slot, idx });
    return acc;
  }, {});

  const activeGiocatore = rosa.find((g) => g.id === activeGiocatoreId) || null;

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#0A0A12' }}>

        {/* Toolbar */}
        <div style={{ background: '#12121A', borderBottom: '1px solid #ffffff10', padding: '8px 12px', display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          <select
            value={modulo}
            onChange={(e) => onModuloChange(e.target.value)}
            style={{ background: 'var(--bg-elevated)', border: '1px solid rgba(184,134,11,0.33)', borderRadius: '6px', padding: '5px 10px', fontSize: '12px', color: 'var(--gold)', cursor: 'pointer', outline: 'none' }}
          >
            {MODULI_LIST.map((m) => (
              <option key={m} value={m}>{MODULI[m].label}</option>
            ))}
          </select>
          <div style={{ background: 'var(--bg-elevated)', borderRadius: '6px', padding: '5px 10px', fontSize: '10px', color: 'var(--text-secondary)' }}>
            Punteggio atteso: <span style={{ color: '#22C55E', fontWeight: 'bold' }}>{puntoAtteso?.toFixed(1) ?? '—'}</span>
          </div>
        </div>

        {/* Field + Lateral panel */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

          {/* Field */}
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
            {/* Center line */}
            <div style={{ position: 'absolute', top: '50%', left: '10%', right: '10%', height: '1px', background: '#ffffff15', pointerEvents: 'none' }} />

            {Object.keys(rows).sort((a, b) => b - a).map((rowKey) => (
              <div key={rowKey} style={{ display: 'flex', gap: '16px', alignItems: 'center', zIndex: 1 }}>
                {rows[rowKey].map(({ slot, idx }) => (
                  <FormationSlot
                    key={slot.id}
                    slotId={`slot-${idx}`}
                    slot={slot}
                    giocatore={getGiocatoreBySlotIndex(idx)}
                    isSelected={selectedSlotId === idx}
                    onClick={() => handleSlotClick(idx)}
                  />
                ))}
              </div>
            ))}
          </div>

          {/* Lateral panel */}
          <PlayerList
            rosa={rosa}
            titolariIds={titolariIds}
            onPlayerClick={handlePlayerListClick}
            highlightedIds={highlightedIds}
          />
        </div>
      </div>

      <DragOverlay>
        {activeGiocatore ? <PlayerToken giocatore={activeGiocatore} /> : null}
      </DragOverlay>
    </DndContext>
  );
}
