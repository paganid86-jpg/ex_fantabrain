// src/components/ui/NoLeagueBanner.jsx
import { useNavigate } from 'react-router-dom';

export default function NoLeagueBanner() {
  const navigate = useNavigate();

  return (
    <div style={{
      background: 'var(--bg-elevated)',
      border: '1px solid var(--border)',
      borderRadius: 12,
      padding: '32px 24px',
      textAlign: 'center',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 16,
    }}>
      <div style={{ fontSize: 32 }}>⚽</div>
      <div>
        <div style={{
          fontFamily: 'Barlow Condensed',
          fontWeight: 700,
          fontSize: 18,
          color: 'var(--text-primary)',
          marginBottom: 8,
        }}>
          Non fai ancora parte di una lega
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>
          Crea la tua lega e invita i tuoi amici,<br />
          oppure unisciti a una lega esistente.
        </div>
      </div>
      <div style={{ display: 'flex', gap: 12 }}>
        <button
          className="btn-primary"
          onClick={() => navigate('/classifica')}
        >
          Crea Lega
        </button>
        <button
          className="btn-secondary"
          onClick={() => navigate('/classifica')}
        >
          Unisciti
        </button>
      </div>
    </div>
  );
}
