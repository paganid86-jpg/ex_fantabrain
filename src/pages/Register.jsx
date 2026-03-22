import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAppStore from '../store/useAppStore';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const setUser = useAppStore((s) => s.setUser);
  const setAiCrediti = useAppStore((s) => s.setAiCrediti);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Errore registrazione'); return; }
      setUser({ ...data.user, token: data.token, league: 'La mia lega' });
      setAiCrediti(3);
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
        <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>Crea il tuo account</p>
        {error && <div className="text-red-400 text-sm mb-4 p-3 rounded bg-red-900/20">{error}</div>}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input className="input-field" type="text" placeholder="Nome" value={name} onChange={(e) => setName(e.target.value)} required />
          <input className="input-field" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input className="input-field" type="password" placeholder="Password (min 8 caratteri)" value={password} onChange={(e) => setPassword(e.target.value)} minLength={8} required />
          <button className="btn-primary" disabled={loading}>{loading ? 'Registrazione...' : 'Registrati'}</button>
        </form>
        <p className="text-sm mt-4 text-center" style={{ color: 'var(--text-secondary)' }}>
          Hai già un account? <Link to="/login" style={{ color: 'var(--gold)' }}>Accedi</Link>
        </p>
      </div>
    </div>
  );
}
