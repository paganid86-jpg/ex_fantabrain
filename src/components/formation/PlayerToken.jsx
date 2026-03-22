import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

const RUOLO_COLORS = {
  Por: '#F59E0B', DD: '#3B82F6', DS: '#3B82F6', DC: '#3B82F6',
  'M/C': '#22C55E', M: '#22C55E', C: '#22C55E',
  'T/A': '#06B6D4', W: '#06B6D4', A: '#06B6D4',
  PC: '#EF4444',
};

export default function PlayerToken({ giocatore, disabled }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `player-${giocatore.id}`,
    data: { giocatoreId: giocatore.id },
    disabled,
  });

  const primary = giocatore.ruoloMantra?.split('/')[0].trim();
  const color = RUOLO_COLORS[primary] || '#64748B';

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={{
        background: '#1E1E2E',
        borderRadius: '6px',
        padding: '6px 8px',
        cursor: disabled ? 'not-allowed' : isDragging ? 'grabbing' : 'grab',
        opacity: isDragging ? 0.4 : giocatore.infortunato ? 0.5 : 1,
        border: '1px solid transparent',
        transform: CSS.Translate.toString(transform),
        touchAction: 'none',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '6px',
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '11px', color: '#fff', fontWeight: 'bold', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {giocatore.cognome || giocatore.nome}
        </div>
        <div style={{ fontSize: '9px', color: '#64748B' }}>{giocatore.squadra}</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
        <span style={{ fontSize: '8px', color, background: `${color}22`, borderRadius: '3px', padding: '1px 4px' }}>
          {giocatore.ruoloMantra}
        </span>
        <span style={{ fontSize: '9px', color: '#F59E0B' }}>{giocatore.votoMedia?.toFixed(1)}</span>
        {giocatore.infortunato && <span style={{ fontSize: '9px', color: '#EF4444' }}>✕</span>}
        {giocatore.diffidato && !giocatore.infortunato && <span style={{ fontSize: '9px', color: '#F59E0B' }}>!</span>}
      </div>
    </div>
  );
}
