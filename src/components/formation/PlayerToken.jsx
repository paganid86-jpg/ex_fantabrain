import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'

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

export default function PlayerToken({ giocatore, disabled }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `player-${giocatore.id}`,
    data: { giocatoreId: giocatore.id },
    disabled,
  })

  const primaryRole = giocatore.ruoloMantra?.split('/')[0].trim()
  const roleColor = ROLE_COLORS[primaryRole] || 'var(--fg-35)'

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`player-token${disabled ? ' player-token--disabled' : ''}${isDragging ? ' player-token--dragging' : ''}${
        giocatore.infortunato ? ' player-token--injured' : ''
      }`}
      style={{
        transform: CSS.Translate.toString(transform),
        '--player-token-role-color': roleColor,
      }}
    >
      <div className="player-token__text">
        <div className="player-token__name">{giocatore.cognome || giocatore.nome}</div>
        <div className="player-token__team">{giocatore.squadra}</div>
      </div>

      <div className="player-token__meta">
        <span className="player-token__role">{giocatore.ruoloMantra}</span>
        <span className="player-token__media">{giocatore.votoMedia?.toFixed(1) ?? '--'}</span>
        {giocatore.infortunato && <span className="player-token__status player-token__status--danger">!</span>}
        {giocatore.diffidato && !giocatore.infortunato && (
          <span className="player-token__status player-token__status--warn">!</span>
        )}
      </div>
    </div>
  )
}
