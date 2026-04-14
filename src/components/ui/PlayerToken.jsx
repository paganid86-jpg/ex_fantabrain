export default function PlayerToken({ giocatore, size = 'sm', onClick, selected }) {
  const isInf = giocatore?.infortunato;
  const isDiff = giocatore?.diffidato;

  const colors = {
    Por: 'var(--role-gk)', DD: 'var(--role-def)', DS: 'var(--role-def)', DC: 'var(--role-def)',
    'M/C': 'var(--role-mid)', C: 'var(--role-mid)', 'T/A': 'var(--role-fwd)', T: 'var(--role-fwd)',
    A: 'var(--role-fwd)', W: 'var(--role-fwd)', PC: 'var(--role-pk)',
  };
  const ruolo = giocatore?.ruoloMantra || 'C';
  const color = colors[ruolo] || 'var(--text-secondary)';

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
        background: 'rgba(0,0,0,0.25)',
        border: `2px solid ${selected ? color : 'rgba(255,255,255,0.15)'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative',
        transition: 'border-color 0.2s',
        boxShadow: selected ? `0 0 12px rgba(126,173,212,0.27)` : 'none',
      }}>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: sz * 0.27, color }}>
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
          fontSize: size === 'lg' ? 12 : 10, fontFamily: 'var(--font-display)',
          fontWeight: 600, color: 'var(--text-primary)', textAlign: 'center',
          maxWidth: sz + 16, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {giocatore.cognome}
        </div>
      )}
    </div>
  );
}
