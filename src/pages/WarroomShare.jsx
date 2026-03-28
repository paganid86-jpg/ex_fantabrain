import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

export default function WarroomShare() {
  const { id }    = useParams();
  const [stato, setStato] = useState('loading'); // 'loading' | 'ok' | 'notfound' | 'expired'
  const [data,  setData]  = useState(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/ai/warroom-share/${id}`)
      .then((res) => {
        if (res.status === 404) return Promise.reject({ type: 'notfound' });
        if (res.status === 410) return Promise.reject({ type: 'expired' });
        if (!res.ok)            return Promise.reject({ type: 'notfound' });
        return res.json();
      })
      .then((json) => { if (!cancelled) { setData(json); setStato('ok'); } })
      .catch((err) => { if (!cancelled) setStato(err?.type || 'notfound'); });
    return () => { cancelled = true; };
  }, [id]);

  const base = {
    minHeight: '100vh',
    background: 'var(--bg-deep)',
    color: 'var(--text-primary)',
    fontFamily: 'var(--font-body)',
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    padding: '40px 20px',
  };

  if (stato === 'loading') {
    return (
      <div style={base}>
        <div style={{ marginTop: 80, fontSize: 36 }}>⏳</div>
        <div style={{ marginTop: 16, color: 'var(--text-muted)', fontSize: 14 }}>Caricamento analisi...</div>
      </div>
    );
  }

  if (stato === 'expired') {
    return (
      <div style={base}>
        <div style={{ marginTop: 80, fontSize: 36 }}>⏰</div>
        <div style={{ marginTop: 16, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20 }}>Link scaduto</div>
        <div style={{ marginTop: 8, color: 'var(--text-muted)', fontSize: 14 }}>
          Questo link non è più valido. Chiedi un nuovo link al tuo alleato.
        </div>
      </div>
    );
  }

  if (stato === 'notfound') {
    return (
      <div style={base}>
        <div style={{ marginTop: 80, fontSize: 36 }}>🔍</div>
        <div style={{ marginTop: 16, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20 }}>Analisi non trovata</div>
        <div style={{ marginTop: 8, color: 'var(--text-muted)', fontSize: 14 }}>Verifica che il link sia corretto.</div>
      </div>
    );
  }

  const ctx    = data.matchContext || {};
  const sezioni = (data.analysisText || '').split('\n\n---\n\n');
  const titoli  = ['🔍 Analisi Avversario', '⚡ Vantaggi e Rischi', '🗺️ Piano Tattico'];
  const colori  = [
    { color: 'var(--blue)',  bg: 'rgba(96,165,250,0.05)',  border: 'rgba(96,165,250,0.2)'  },
    { color: 'var(--green)', bg: 'rgba(74,222,128,0.05)', border: 'rgba(74,222,128,0.2)'  },
    { color: 'var(--gold)',  bg: 'rgba(245,158,11,0.05)', border: 'rgba(245,158,11,0.2)'  },
  ];

  return (
    <div style={base}>
      <div style={{ width: '100%', maxWidth: 900 }}>
        {/* App header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 22 }}>⚡ FantaBrain</span>
          <span style={{
            background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.25)',
            borderRadius: 5, padding: '2px 10px',
            color: 'var(--accent-primary)', fontSize: 11, fontWeight: 700,
          }}>
            ANALISI WAR ROOM
          </span>
        </div>

        {/* Match context */}
        {ctx.avversario && (
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, marginBottom: 4 }}>
            ⚔️ vs {ctx.avversario}
            {ctx.giornata && (
              <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: 14 }}>
                {' '}· Giornata {ctx.giornata}
              </span>
            )}
          </div>
        )}
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 24 }}>
          {data.expiresAt && `Scade il ${new Date(data.expiresAt).toLocaleDateString('it-IT')} · `}Sola lettura
        </div>

        {/* Analysis panels */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
          {sezioni.map((testo, i) => (
            <div
              key={i}
              style={{
                background: colori[i]?.bg || 'rgba(255,255,255,0.03)',
                border: `1px solid ${colori[i]?.border || 'var(--border-glass)'}`,
                borderRadius: 12, padding: 16, backdropFilter: 'blur(10px)',
              }}
            >
              <div style={{
                fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15,
                color: colori[i]?.color || 'var(--text-primary)',
                marginBottom: 12, letterSpacing: '0.03em',
              }}>
                {titoli[i] || `Sezione ${i + 1}`}
              </div>
              <div style={{ fontSize: 13, lineHeight: 1.7, color: 'var(--text-primary)', whiteSpace: 'pre-wrap' }}>
                {testo}
              </div>
            </div>
          ))}
        </div>

        {/* CTA footer */}
        <div style={{
          marginTop: 32, textAlign: 'center', padding: 20,
          background: 'var(--bg-glass)', border: '1px solid var(--border-glass)',
          borderRadius: 12,
        }}>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 10 }}>
            Analisi generata con FantaBrain AI — il copilota per il tuo Fantacalcio
          </div>
          <a
            href="https://webapp-fantabrain.onrender.com"
            style={{
              display: 'inline-block',
              background: 'var(--accent-primary)', color: '#0a0a0a',
              padding: '10px 24px', borderRadius: 8,
              fontWeight: 700, fontSize: 14, textDecoration: 'none',
              fontFamily: 'var(--font-display)',
            }}
          >
            Prova FantaBrain →
          </a>
        </div>
      </div>
    </div>
  );
}
