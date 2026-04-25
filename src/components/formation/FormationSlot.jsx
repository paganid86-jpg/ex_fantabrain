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
  const slotClassName = [
    'slot',
    'slot--luxury',
    giocatore ? 'slot--filled' : 'slot--empty',
    isOver ? 'slot--over' : '',
    isIncompatible ? 'slot--incompatible' : '',
    isSelected ? 'slot--selected' : '',
  ]
    .filter(Boolean)
    .join(' ')
  const playerName = giocatore?.cognome || giocatore?.nome || slot.ruoli[0]
  const playerTeam = giocatore?.squadra || 'Slot'
  const playerRole = giocatore?.ruoloMantra || slot.ruoli.join('/')
  const playerScore = giocatore?.votoMedia?.toFixed(1) ?? '--'

  return (
    <div
      ref={setNodeRef}
      onClick={onClick}
      className={slotClassName}
      style={{ '--slot-role-color': getRoleColor(giocatore?.ruoloMantra || slot.ruoli[0]) }}
    >
      <span className="slot__topline">
        <span className="slot__role">{playerRole}</span>
        <span className="slot__media">{playerScore}</span>
      </span>
      <strong className="slot__name">{giocatore ? playerName : '+'}</strong>
      <span className="slot__team">{playerTeam}</span>

      {giocatore?.infortunato && <span className="slot__badge slot__badge--danger">!</span>}
      {giocatore?.diffidato && !giocatore?.infortunato && (
        <span className="slot__badge slot__badge--warn">!</span>
      )}
    </div>
  )
}
