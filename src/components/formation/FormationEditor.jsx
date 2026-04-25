import { useState } from 'react'
import { DndContext, DragOverlay, PointerSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core'
import { MODULI } from '../../data/moduli'
import FormationSlot from './FormationSlot'
import PlayerToken from './PlayerToken'

export default function FormationEditor({
  rosa,
  modulo,
  titolariIds,
  onTitolariChange,
  puntoAtteso,
  onModuloChipClick,
  onSlotTap,
}) {
  const [activeGiocatoreId, setActiveGiocatoreId] = useState(null)

  const moduloDef = MODULI[modulo] || MODULI['4-3-3']
  const slots = moduloDef.slots

  const slotMap = Object.fromEntries(
    titolariIds.map((giocatoreId, index) => [index, giocatoreId]).filter(([, giocatoreId]) => giocatoreId != null)
  )

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } })
  )

  function getGiocatoreBySlotIndex(index) {
    return rosa.find((giocatore) => giocatore.id === slotMap[index]) || null
  }

  function handleDragStart({ active }) {
    setActiveGiocatoreId(active.data.current?.giocatoreId ?? null)
  }

  function handleDragEnd({ active, over }) {
    setActiveGiocatoreId(null)
    if (!over) return

    const draggedId = active.data.current?.giocatoreId
    const targetSlotIdx = parseInt(over.id.replace('slot-', ''), 10)
    if (Number.isNaN(targetSlotIdx) || draggedId == null) return

    const newIds = [...titolariIds]
    const currentSlotIdx = newIds.indexOf(draggedId)
    const occupantId = newIds[targetSlotIdx]

    if (currentSlotIdx >= 0) {
      newIds[targetSlotIdx] = draggedId
      newIds[currentSlotIdx] = occupantId ?? null
    } else {
      newIds[targetSlotIdx] = draggedId
    }

    onTitolariChange(newIds.filter((id) => id != null))
  }

  function handleSlotClick(slotIdx) {
    if (slotMap[slotIdx]) {
      const newIds = titolariIds.filter((id) => id !== slotMap[slotIdx])
      onTitolariChange(newIds)
      return
    }

    onSlotTap?.(slotIdx, slots[slotIdx])
  }

  const rows = slots.reduce((accumulator, slot, index) => {
    ;(accumulator[slot.row] = accumulator[slot.row] || []).push({ slot, index })
    return accumulator
  }, {})

  const activeGiocatore = rosa.find((giocatore) => giocatore.id === activeGiocatoreId) || null
  const filledCount = titolariIds.length
  const emptyCount = Math.max(0, slots.length - filledCount)
  const statusLabel = emptyCount === 0 ? 'Formazione completa' : `${emptyCount} slot vuoti`
  const statusHint =
    emptyCount === 0
      ? 'Tocca un titolare per rimetterlo in panchina'
      : 'Tocca uno slot libero per aggiungere un giocatore'

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="formation-editor">
        <div className="campo-toolbar">
          <button
            type="button"
            className="modulo-chip"
            onClick={onModuloChipClick}
            aria-label={`Modulo attivo ${moduloDef.label}. Tocca per cambiare`}
          >
            <span className="modulo-chip__label">Modulo</span>
            <span>{moduloDef.label}</span>
            <span className="modulo-chip-arrow" aria-hidden="true">
              v
            </span>
          </button>

          <div className="campo-kpi">
            <span className="campo-kpi__label">Atteso</span>
            <strong>{puntoAtteso?.toFixed(1) ?? '--'}</strong>
          </div>
        </div>

        <div className="pitch-shell">
          <div className="pitch">
            <svg className="pitch__markings" viewBox="0 0 100 140" preserveAspectRatio="none" aria-hidden="true">
              <rect x="4" y="4" width="92" height="132" rx="8" fill="none" stroke="var(--pitch-line)" />
              <line x1="4" y1="70" x2="96" y2="70" stroke="var(--pitch-line-strong)" />
              <circle cx="50" cy="70" r="10" fill="none" stroke="var(--pitch-line)" />
              <rect x="26" y="4" width="48" height="18" rx="3" fill="none" stroke="var(--pitch-line)" />
              <rect x="26" y="118" width="48" height="18" rx="3" fill="none" stroke="var(--pitch-line)" />
              <rect x="38" y="4" width="24" height="8" rx="2" fill="none" stroke="var(--pitch-line)" />
              <rect x="38" y="128" width="24" height="8" rx="2" fill="none" stroke="var(--pitch-line)" />
            </svg>

            {Object.keys(rows)
              .sort((a, b) => b - a)
              .map((rowKey) => (
                <div key={rowKey} className="pitch__row">
                  {rows[rowKey].map(({ slot, index }) => (
                    <FormationSlot
                      key={slot.id}
                      slotId={`slot-${index}`}
                      slot={slot}
                      giocatore={getGiocatoreBySlotIndex(index)}
                      isSelected={false}
                      onClick={() => handleSlotClick(index)}
                    />
                  ))}
                </div>
              ))}
          </div>
        </div>

        <div className="formation-status-bar">
          <div className="formation-status-bar__text">
            <span className="formation-status-bar__title">{statusLabel}</span>
            <span className="formation-status-bar__hint">{statusHint}</span>
          </div>

          <div className={`formation-status-bar__badge${emptyCount === 0 ? ' is-complete' : ''}`}>
            {filledCount}/{slots.length}
          </div>
        </div>
      </div>

      <DragOverlay>{activeGiocatore ? <PlayerToken giocatore={activeGiocatore} /> : null}</DragOverlay>
    </DndContext>
  )
}
