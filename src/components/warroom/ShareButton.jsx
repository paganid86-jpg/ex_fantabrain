import { useState } from 'react';
import useAppStore from '../../store/useAppStore';

export default function ShareButton({ analysisText, matchContext }) {
  const token = useAppStore((s) => s.user.token);

  const [stato, setStato]         = useState('idle'); // 'idle' | 'loading' | 'done' | 'error'
  const [shareUrl, setShareUrl]   = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [copiato, setCopiato]     = useState(false);
  const [errMsg, setErrMsg]       = useState('');

  async function creaLink() {
    setStato('loading');
    setErrMsg('');
    try {
      const res = await fetch('/api/ai/warroom-share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ analysisText, matchContext }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Errore creazione link');
      }
      const data = await res.json();
      setShareUrl(data.url);
      setExpiresAt(new Date(data.expiresAt).toLocaleDateString('it-IT'));
      setStato('done');
    } catch (err) {
      setErrMsg(err.message);
      setStato('error');
    }
  }

  async function copiaLink() {
    try {
      await navigator.clipboard.writeText(shareUrl);
    } catch {
      const input = document.createElement('input');
      input.value = shareUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
    }
    setCopiato(true);
    setTimeout(() => setCopiato(false), 2000);
  }

  function inviaWhatsapp() {
    const text = encodeURIComponent(`⚔️ Analisi War Room FantaBrain\n${shareUrl}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  }

  if (stato !== 'done') {
    return (
      <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 6 }}>
        <button
          type="button"
          onClick={creaLink}
          disabled={stato === 'loading'}
          className="btn-secondary"
          style={{ fontSize: 12 }}
        >
          {stato === 'loading' ? '⏳ Generando link...' : '🔗 Condividi analisi'}
        </button>
        {stato === 'error' && (
          <span style={{ fontSize: 11, color: 'var(--danger)' }}>{errMsg}</span>
        )}
      </div>
    );
  }

  return (
    <div style={{
      marginTop: 16,
      background: 'rgba(0,212,255,0.06)',
      border: '1px solid rgba(0,212,255,0.2)',
      borderRadius: 10, padding: '12px 16px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{
          fontSize: 12, color: 'var(--text-muted)',
          fontFamily: 'var(--font-display)', letterSpacing: '0.06em',
        }}>
          LINK CONDIVISIBILE
        </span>
        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Scade il {expiresAt}</span>
      </div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 10 }}>
        <input
          readOnly
          value={shareUrl}
          onFocus={(e) => e.target.select()}
          style={{
            flex: 1, background: 'rgba(0,0,0,0.2)',
            border: '1px solid rgba(0,212,255,0.2)', borderRadius: 6,
            padding: '6px 10px', color: 'var(--accent-primary)',
            fontSize: 12, fontFamily: 'var(--font-display)', outline: 'none',
          }}
        />
        <button type="button" onClick={copiaLink} className="btn-secondary" style={{ fontSize: 12, padding: '6px 14px', flexShrink: 0 }}>
          {copiato ? '✓ Copiato' : 'Copia'}
        </button>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          type="button"
          onClick={inviaWhatsapp}
          style={{
            background: '#25D366', border: 'none', borderRadius: 7,
            padding: '7px 16px', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer',
          }}
        >
          WhatsApp
        </button>
        <button type="button" onClick={() => setStato('idle')} className="btn-secondary" style={{ fontSize: 12 }}>
          Chiudi
        </button>
      </div>
    </div>
  );
}
