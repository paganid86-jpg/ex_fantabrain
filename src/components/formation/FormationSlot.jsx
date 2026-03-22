import { useDroppable } from '@dnd-kit/core';
import { isCompatibile } from '../../data/moduli';

const RUOLO_COLORS = {
  Por: '#F59E0B', DD: '#3B82F6', DS: '#3B82F6', DC: '#3B82F6',
  'M/C': '#22C55E', M: '#22C55E', C: '#22C55E',
  'T/A': '#06B6D4', W: '#06B6D4', A: '#06B6D4',
  PC: '#EF4444',
};

function getColor(ruoloMantra) {
  if (!ruoloMantra) return '#64748B';
  const primary = ruoloMantra.split('/')[0].trim();
  return RUOLO_COLORS[primary] || RUOLO_COLORS[ruoloMantra] || '#64748B';
}

export default function FormationSlot({ slotId, slot, giocatore, isSelected, onClick }) {
  const { setNodeRef, isOver } = useDroppable({ id: slotId });

  const incompatibile = giocatore && !isCompatibile(giocatore.ruoloMantra, slot.ruoli);
  const borderColor = incompatibile
    ? '#EF4444'
    : isOver
    ? '#F59E0B'
    : isSelected
    ? '#F59E0B'
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
          background: giocatore ? getColor(giocatore.ruoloMantra) : '#1E1E2E',
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
          <span style={{ position: 'absolute', top: '-4px', right: '-4px', fontSize: '9px', background: '#EF4444', borderRadius: '50%', width: '14px', height: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</span>
        )}
        {giocatore?.diffidato && !giocatore?.infortunato && (
          <span style={{ position: 'absolute', top: '-4px', right: '-4px', fontSize: '9px', background: '#F59E0B', borderRadius: '50%', width: '14px', height: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>!</span>
        )}
      </div>
      {giocatore ? (
        <>
          <span style={{ fontSize: '8px', color: '#fff', fontWeight: 'bold', textShadow: '0 1px 3px #000', maxWidth: '50px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {giocatore.cognome || giocatore.nome}
          </span>
          <span style={{ fontSize: '7px', color: '#F59E0B' }}>{giocatore.votoMedia?.toFixed(1)}</span>
        </>
      ) : (
        <span style={{ fontSize: '7px', color: '#475569' }}>{slot.ruoli[0]}</span>
      )}
    </div>
  );
}
