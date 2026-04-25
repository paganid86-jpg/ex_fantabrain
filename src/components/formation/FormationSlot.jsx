import { useDroppable } from '@dnd-kit/core'
import { isCompatibile } from '../../data/moduli'

const ROLE_COLORS = {
  Por: 'var(--role-gk)',
  DD: 'var(--role-def)',
  DS: 'var(--role-def)',
  DC: 'var(--role-def)',
  'M/C': 'var(--role-mid)',
  M: 'var(--role-mid)',
  C: 'var(--role-mid)',
  'T/A': 'var(--role-fwd)',
  W: 'var(--role-fwd)',
  A: 'var(--role-fwd)',
  PC: 'var(--role-pk)',
}

function getRoleColor(ruoloMantra) {
  if (!ruoloMantra) return 'var(--fg-35)'
  const primaryRole = ruoloMantra.split('/')[0].trim()
  return ROLE_COLORS[primaryRole] || ROLE_COLORS[ruoloMantra] || 'var(--fg-35)'
}

export default function FormationSlot({ slotId, slot, giocatore, isSelected, onClick }) {
  const { setNodeRef, isOver } = useDroppable({ id: slotId })

  const isIncompatible = giocatore && !isCompatibile(giocatore.ruoloMantra, slot.ruoli)
  const discClassName = [
    'slot__disc',
    giocatore ? 'slot__disc--filled' : 'slot__disc--empty',
    isOver ? 'slot__disc--over' : '',
    isIncompatible ? 'slot__disc--incompatible' : '',
    isSelected ? 'slot__disc--selected' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div
      ref={setNodeRef}
      onClick={onClick}
      className="slot"
      style={{ '--slot-role-color': getRoleColor(giocatore?.ruoloMantra || slot.ruoli[0]) }}
    >
      <div className={discClassName}>
        {giocatore ? (
          <span className="slot__initial">{giocatore.ruoloMantra?.split('/')[0]}</span>
        ) : (
          <span className="slot__empty-plus">+</span>
        )}

        {giocatore?.infortunato && <span className="slot__badge slot__badge--danger">!</span>}
        {giocatore?.diffidato && !giocatore?.infortunato && (
          <span className="slot__badge slot__badge--warn">!</span>
        )}
      </div>

      {giocatore ? (
        <>
          <span className="slot__label">{giocatore.cognome || giocatore.nome}</span>
          <span className="slot__media">{giocatore.votoMedia?.toFixed(1) ?? '--'}</span>
        </>
      ) : (
        <span className="slot__role-hint">{slot.ruoli[0]}</span>
      )}
    </div>
  )
}
