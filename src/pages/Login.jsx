import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAppStore from '../store/useAppStore';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const setUser = useAppStore((s) => s.setUser);
  const setAiCrediti = useAppStore((s) => s.setAiCrediti);
  const setResetAt = useAppStore((s) => s.setResetAt);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Errore login'); return; }
      setUser({ ...data.user, token: data.token, league: 'La mia lega' });
      setAiCrediti(data.credits.remaining);
      setResetAt(data.credits.resetAt);
      navigate('/');
    } catch {
      setError('Errore di rete');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--y2k-bg)',
      padding: '20px',
    }}>
      <div className="y2k-panel" style={{ width: '100%', maxWidth: 360, padding: 32 }}>
        {/* Header */}
        <div style={{ marginBottom: 28, textAlign: 'center' }}>
          <div className="y2k-page-title" style={{ fontSize: 18, textAlign: 'center' }}>FANTABRAIN</div>
          <div className="y2k-page-sub" style={{ textAlign: 'center', marginTop: 6 }}>// ACCEDI AL TUO ACCOUNT</div>
        </div>

        {error && (
          <div style={{
            fontSize: 11,
            fontFamily: 'var(--font-mono)',
            color: 'var(--y2k-danger)',
            padding: '8px 12px',
            background: 'rgba(255,59,48,0.08)',
            border: '1px solid rgba(255,59,48,0.2)',
            borderRadius: 'var(--radius-sm)',
            marginBottom: 16,
            letterSpacing: '0.5px',
          }}>
            ⚠ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label className="y2k-input-label">Email</label>
            <input
              className="input-field"
              type="email"
              placeholder="nome@esempio.it"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="y2k-input-label">Password</label>
            <input
              className="input-field"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button className="btn-primary" disabled={loading} style={{ marginTop: 8, width: '100%' }}>
            {loading ? 'ACCESSO IN CORSO...' : 'ACCEDI'}
          </button>
        </form>

        <div style={{
          fontSize: 11,
          fontFamily: 'var(--font-mono)',
          color: 'var(--y2k-chrome-dim)',
          textAlign: 'center',
          marginTop: 20,
          letterSpacing: '0.5px',
        }}>
          Non hai un account?{' '}
          <Link to="/register" style={{ color: 'var(--y2k-blue-glow)', textDecoration: 'none' }}>
            REGISTRATI
          </Link>
        </div>
      </div>
    </div>
  );
}
