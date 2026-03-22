export default function PlayerToken({ giocatore, size = 'sm', onClick, selected }) {
  const isInf = giocatore?.infortunato;
  const isDiff = giocatore?.diffidato;

  const colors = {
    Por: '#ff9800', DD: '#2979ff', DS: '#2979ff', DC: '#2979ff',
    'M/C': '#00e676', C: '#00e676', 'T/A': '#e040fb', T: '#e040fb',
    A: '#e040fb', W: '#e040fb', PC: '#ff1744',
  };
  const ruolo = giocatore?.ruoloMantra || 'C';
  const color = colors[ruolo] || '#7a92b0';

  const sz = size === 'lg' ? 56 : size === 'md' ? 44 : 36;

  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
        cursor: onClick ? 'pointer' : 'default',
        opacity: isInf ? 0.5 : 1,
      }}
    >
      <div style={{
        width: sz, height: sz, borderRadius: '50%',
        background: `${color}22`,
        border: `2px solid ${selected ? color : `${color}66`}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative',
        transition: 'border-color 0.2s',
        boxShadow: selected ? `0 0 12px ${color}44` : 'none',
      }}>
        <span style={{ fontFamily: 'Barlow Condensed', fontWeight: 700, fontSize: sz * 0.27, color }}>
          {ruolo}
        </span>
        {isInf && (
          <span style={{
            position: 'absolute', top: -4, right: -4,
            background: 'var(--accent-red)', borderRadius: '50%',
            width: 14, height: 14, fontSize: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 700,
          }}>✕</span>
        )}
        {isDiff && !isInf && (
          <span style={{
            position: 'absolute', top: -4, right: -4,
            background: 'var(--accent-amber)', borderRadius: '50%',
            width: 14, height: 14, fontSize: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#000', fontWeight: 700,
          }}>!</span>
        )}
      </div>
      {giocatore && (
        <div style={{
          fontSize: size === 'lg' ? 12 : 10, fontFamily: 'Barlow Condensed',
          fontWeight: 600, color: 'var(--text-primary)', textAlign: 'center',
          maxWidth: sz + 16, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {giocatore.cognome}
        </div>
      )}
    </div>
  );
}
