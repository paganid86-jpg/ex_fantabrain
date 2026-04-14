import { useDroppable } from '@dnd-kit/core';
import { isCompatibile } from '../../data/moduli';

const RUOLO_COLORS = {
  Por: 'var(--role-gk)', DD: 'var(--role-def)', DS: 'var(--role-def)', DC: 'var(--role-def)',
  'M/C': 'var(--role-mid)', M: 'var(--role-mid)', C: 'var(--role-mid)',
  'T/A': 'var(--role-fwd)', W: 'var(--role-fwd)', A: 'var(--role-fwd)',
  PC: 'var(--role-pk)',
};

function getColor(ruoloMantra) {
  if (!ruoloMantra) return 'var(--text-secondary)';
  const primary = ruoloMantra.split('/')[0].trim();
  return RUOLO_COLORS[primary] || RUOLO_COLORS[ruoloMantra] || 'var(--text-secondary)';
}

export default function FormationSlot({ slotId, slot, giocatore, isSelected, onClick }) {
  const { setNodeRef, isOver } = useDroppable({ id: slotId });

  const incompatibile = giocatore && !isCompatibile(giocatore.ruoloMantra, slot.ruoli);
  const borderColor = incompatibile
    ? 'var(--danger)'
    : isOver
    ? 'var(--gold)'
    : isSelected
    ? 'var(--gold)'
    : 'transparent';

  return (
    <div
      ref={setNodeRef}
      onClick={onClick}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '3px',
        cursor: 'pointer',
        minWidth: '44px',
      }}
    >
      <div
        style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          background: giocatore ? getColor(giocatore.ruoloMantra) : 'var(--bg-elevated)',
          border: `2px solid ${borderColor || (giocatore ? '#fff' : '#334155')}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '9px',
          color: '#fff',
          fontWeight: 'bold',
          boxShadow: giocatore ? `0 2px 8px ${getColor(giocatore.ruoloMantra)}66` : 'none',
          transition: 'border-color 0.15s',
          position: 'relative',
        }}
      >
        {giocatore ? giocatore.ruoloMantra?.split('/')[0] : slot.ruoli[0]}
        {giocatore?.infortunato && (
          <span style={{ position: 'absolute', top: '-4px', right: '-4px', fontSize: '9px', background: 'var(--danger)', borderRadius: '50%', width: '14px', height: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</span>
        )}
        {giocatore?.diffidato && !giocatore?.infortunato && (
          <span style={{ position: 'absolute', top: '-4px', right: '-4px', fontSize: '9px', background: 'var(--gold)', borderRadius: '50%', width: '14px', height: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>!</span>
        )}
      </div>
      {giocatore ? (
        <>
          <span style={{ fontSize: '8px', color: '#fff', fontWeight: 'bold', textShadow: '0 1px 3px #000', maxWidth: '50px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {giocatore.cognome || giocatore.nome}
          </span>
          <span style={{ fontSize: '7px', color: 'var(--gold)' }}>{giocatore.votoMedia?.toFixed(1)}</span>
        </>
      ) : (
        <span style={{ fontSize: '7px', color: '#475569' }}>{slot.ruoli[0]}</span>
      )}
    </div>
  );
}
