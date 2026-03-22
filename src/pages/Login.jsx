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
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-deep)' }}>
      <div className="glass-card p-8 w-full max-w-sm">
        <h1 className="text-2xl font-bold text-white mb-2">FantaBrain</h1>
        <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>Accedi al tuo account</p>
        {error && <div className="text-red-400 text-sm mb-4 p-3 rounded bg-red-900/20">{error}</div>}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            className="input-field"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            className="input-field"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button className="btn-primary" disabled={loading}>
            {loading ? 'Accesso...' : 'Accedi'}
          </button>
        </form>
        <p className="text-sm mt-4 text-center" style={{ color: 'var(--text-secondary)' }}>
          Non hai un account?{' '}
          <Link to="/register" style={{ color: 'var(--gold)' }}>Registrati</Link>
        </p>
      </div>
    </div>
  );
}
