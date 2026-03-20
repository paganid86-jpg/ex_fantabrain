import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAppStore from '../store/useAppStore';
import useSerieAStore from '../stores/useSerieAStore';
import RankItem from '../components/ui/RankItem';
import AlertItem from '../components/ui/AlertItem';
import { formatMatchDate, statusLabel } from '../services/footballDataMapper';

/* ── Sub-componenti ──────────────────────────────────────── */

function KpiCard({ label, value, sub, color, icon }) {
  return (
    <div
      className="glass-card"
      style={{
        flex: '1 1 200px',
        borderTop: `3px solid ${color}`,
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
      }}
    >
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
      }}>
        <div style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 700,
          fontSize: 11,
          color: 'var(--text-muted)',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
        }}>
          {label}
        </div>
        <span style={{ fontSize: 22, opacity: 0.35 }}>{icon}</span>
      </div>
      <div style={{
        fontFamily: 'var(--font-display)',
        fontWeight: 900,
        fontSize: 42,
        color,
        lineHeight: 1,
        marginTop: 4,
      }}>
        {value}
      </div>
      <div style={{
        fontSize: 12,
        fontFamily: 'var(--font-body)',
        color: 'var(--text-muted)',
        marginTop: 2,
      }}>
        {sub}
      </div>
    </div>
  );
}

const RUOLO_COLORS = {
  Por: '#f97316',
  DD: 'var(--blue)',
  DS: 'var(--blue)',
  DC: 'var(--blue)',
  'M/C': 'var(--success)',
  C: 'var(--success)',
  'T/A': 'var(--accent-primary)',
  W: 'var(--accent-primary)',
  T: 'var(--accent-primary)',
  A: 'var(--accent-primary)',
  PC: 'var(--danger)',
};

function PitchSlot({ giocatore }) {
  if (!giocatore) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
        <div style={{
          width: 50,
          height: 50,
          borderRadius: '50%',
          border: '2px dashed rgba(0, 212, 255, 0.20)',
          background: 'rgba(0, 212, 255, 0.03)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 18,
          color: 'rgba(0, 212, 255, 0.30)',
        }}>
          +
        </div>
        <span style={{
          fontSize: 10,
          color: 'var(--text-muted)',
          fontFamily: 'var(--font-display)',
        }}>
          VUOTO
        </span>
      </div>
    );
  }

  const color = RUOLO_COLORS[giocatore.ruoloMantra] || 'var(--gold)';
  const initials = (giocatore.cognome || '?').slice(0, 2).toUpperCase();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      <div style={{
        width: 50,
        height: 50,
        borderRadius: '50%',
        background: `${color}18`,
        border: `2px solid ${color}`,
        boxShadow: `0 0 14px ${color}30`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        backdropFilter: 'blur(6px)',
      }}>
        <span style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 800,
          fontSize: 13,
          color,
        }}>
          {initials}
        </span>
        {giocatore.infortunato && (
          <span style={{
            position: 'absolute',
            top: -2,
            right: -2,
            width: 14,
            height: 14,
            borderRadius: '50%',
            background: 'var(--danger)',
            fontSize: 7,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-primary)',
            fontWeight: 700,
            border: '1px solid var(--bg-deep)',
          }}>
            ✕
          </span>
        )}
        {giocatore.diffidato && !giocatore.infortunato && (
          <span style={{
            position: 'absolute',
            top: -2,
            right: -2,
            width: 14,
            height: 14,
            borderRadius: '50%',
            background: 'var(--amber)',
            fontSize: 7,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--bg-deep)',
            fontWeight: 700,
            border: '1px solid var(--bg-deep)',
          }}>
            !
          </span>
        )}
        {giocatore.votoMedia >= 7.5 && (
          <span style={{
            position: 'absolute',
            bottom: -2,
            right: -2,
            width: 14,
            height: 14,
            borderRadius: '50%',
            background: 'var(--gold)',
            fontSize: 7,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--bg-deep)',
            fontWeight: 800,
            border: '1px solid var(--bg-deep)',
          }}>
            {giocatore.votoMedia.toFixed(1)}
          </span>
        )}
      </div>
      <span style={{
        fontSize: 10,
        fontFamily: 'var(--font-display)',
        fontWeight: 600,
        color: 'var(--text-primary)',
        textAlign: 'center',
        maxWidth: 56,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }}>
        {giocatore.cognome}
      </span>
      <span style={{
        fontSize: 9,
        color: 'var(--text-muted)',
        fontFamily: 'var(--font-display)',
      }}>
        {giocatore.ruoloMantra}
      </span>
    </div>
  );
}

function AISuggestionsPanel({ rosa, giornataCorrente, aiCrediti }) {
  // Genera suggerimenti dinamici basati sulla rosa reale
  const suggestions = [];

  const infortunati = rosa.filter((g) => g.infortunato);
  const diffidati = rosa.filter((g) => g.diffidato && !g.infortunato);
  const topForm = [...rosa]
    .filter((g) => !g.infortunato && g.votiUltimi5?.length)
    .sort((a, b) => {
      const avgA = (a.votiUltimi5 || []).reduce((s, v) => s + v, 0) / (a.votiUltimi5?.length || 1);
      const avgB = (b.votiUltimi5 || []).reduce((s, v) => s + v, 0) / (b.votiUltimi5?.length || 1);
      return avgB - avgA;
    });
  const attaccanti = rosa.filter((g) => ['PC', 'A', 'T', 'W', 'T/A'].includes(g.ruoloMantra) && !g.infortunato);
  const topAttaccante = attaccanti.sort((a, b) => b.votoMedia - a.votoMedia)[0];

  let intro = `Ho analizzato la tua rosa per la giornata ${giornataCorrente}.`;

  if (infortunati.length > 0) {
    const nomi = infortunati.map((g) => g.cognome).join(', ');
    intro += ` ${nomi} ${infortunati.length === 1 ? 'è' : 'sono'} in dubbio — valuta i sostituti dalla panchina.`;
    infortunati.slice(0, 2).forEach((g) => {
      suggestions.push({
        icon: '🔄',
        title: `Sostituisci ${g.cognome}`,
        sub: `${g.ruoloMantra} · ${g.squadra} · infortunato`,
        delta: -5,
        color: 'var(--danger)',
      });
    });
  }

  if (topAttaccante) {
    const media3 = (topAttaccante.votiUltimi5 || []).slice(-3).reduce((s, v) => s + v, 0) / 3;
    suggestions.push({
      icon: '🎯',
      title: `${topAttaccante.cognome} capitano`,
      sub: `${topAttaccante.ruoloMantra} · ${topAttaccante.squadra} · media ${topAttaccante.votoMedia.toFixed(1)}`,
      delta: Math.round((media3 - 6) * 4) || 8,
      color: 'var(--gold)',
    });
  }

  if (diffidati.length > 0) {
    const g = diffidati[0];
    suggestions.push({
      icon: '⚠️',
      title: `Attenzione diffida: ${g.cognome}`,
      sub: `${g.ruoloMantra} · ${g.squadra} · un'ammonizione = squalifica`,
      delta: -3,
      color: 'var(--amber)',
    });
  }

  if (topForm.length > 0 && suggestions.length < 3) {
    const g = topForm[0];
    suggestions.push({
      icon: '🔥',
      title: `${g.cognome} in gran forma`,
      sub: `${g.ruoloMantra} · ${g.squadra} · schieralo titolare`,
      delta: Math.round((g.votoMedia - 6) * 5) || 6,
      color: 'var(--success)',
    });
  }

  if (suggestions.length === 0) {
    suggestions.push(
      { icon: '✅', title: 'Rosa al completo', sub: 'Nessun infortunato o diffidato', delta: 0, color: 'var(--success)' },
      { icon: '📊', title: 'Analizza il calendario', sub: 'Controlla i prossimi avversari', delta: 0, color: 'var(--blue)' },
      { icon: '💡', title: 'Ottimizza lo schieramento', sub: "Usa la pagina Schieramento per l'AI", delta: 0, color: 'var(--accent-primary)' },
    );
    intro = `Ho analizzato la tua rosa per la giornata ${giornataCorrente}. Tutto in ordine — usa i consigli qui sotto per ottimizzare!`;
  }

  return (
    <div
      className="glass-card glass-card--accent"
      style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
    >
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        marginBottom: 14,
        paddingBottom: 12,
        borderBottom: '1px solid var(--border-glass)',
      }}>
        <span style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: 'var(--success)',
          flexShrink: 0,
          boxShadow: '0 0 6px var(--success)',
        }} />
        <span style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 800,
          fontSize: 14,
          color: 'var(--text-primary)',
          letterSpacing: '0.04em',
        }}>
          FANTABRAIN AI · GIORNATA {giornataCorrente}
        </span>
        <span
          className={`badge ${aiCrediti < 3 ? 'badge-red' : 'badge-gold'}`}
          style={{ marginLeft: 'auto', fontSize: 10 }}
        >
          {aiCrediti} analisi
        </span>
      </div>

      {/* Intro text */}
      <div style={{
        fontSize: 13,
        fontFamily: 'var(--font-body)',
        color: 'var(--text-secondary)',
        lineHeight: 1.65,
        marginBottom: 16,
      }}>
        {intro}
      </div>

      {/* Action cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
        {suggestions.slice(0, 3).map((s, i) => (
          <div key={i} style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid var(--border-glass)',
            borderRadius: 'var(--radius-md)',
            padding: '10px 14px',
            backdropFilter: 'blur(4px)',
          }}>
            <span style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: `${s.color}15`,
              border: `1px solid ${s.color}40`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 15,
              flexShrink: 0,
            }}>
              {s.icon}
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: 13,
                fontWeight: 600,
                fontFamily: 'var(--font-body)',
                color: 'var(--text-primary)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>
                {s.title}
              </div>
              <div style={{
                fontSize: 11,
                fontFamily: 'var(--font-body)',
                color: 'var(--text-muted)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>
                {s.sub}
              </div>
            </div>
            {s.delta !== 0 && (
              <span style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 800,
                fontSize: 16,
                color: s.delta > 0 ? 'var(--success)' : 'var(--danger)',
                flexShrink: 0,
              }}>
                {s.delta > 0 ? '+' : ''}{s.delta}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function BarChartGiornate({ giornate }) {
  if (!giornate || giornate.length === 0) return null;
  const giocate = giornate.filter((g) => g.giocata && g.puntiUser != null);
  if (giocate.length === 0) return null;

  const ultimi = giocate.slice(-8);
  const max = Math.max(...ultimi.map((g) => g.puntiUser), 1);
  const media = ultimi.reduce((s, g) => s + g.puntiUser, 0) / ultimi.length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 90 }}>
        {ultimi.map((g, i) => {
          const h = Math.max((g.puntiUser / max) * 100, 5);
          const isBelow = g.puntiUser < media;
          return (
            <div key={i} style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              height: '100%',
              justifyContent: 'flex-end',
            }}>
              <span style={{
                fontSize: 9,
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                color: 'var(--text-muted)',
                marginBottom: 3,
              }}>
                {g.puntiUser}
              </span>
              <div
                title={`G${g.giornata}: ${g.puntiUser}pt`}
                style={{
                  width: '100%',
                  height: `${h}%`,
                  background: isBelow
                    ? 'linear-gradient(180deg, var(--danger), rgba(239, 68, 68, 0.45))'
                    : 'linear-gradient(180deg, var(--accent-primary), rgba(0, 212, 255, 0.35))',
                  borderRadius: '3px 3px 0 0',
                  minHeight: 4,
                  transition: 'opacity 0.2s',
                  cursor: 'default',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.opacity = 0.75; }}
                onMouseLeave={(e) => { e.currentTarget.style.opacity = 1; }}
              />
            </div>
          );
        })}
      </div>
      <div style={{ display: 'flex', gap: 6 }}>
        {ultimi.map((g, i) => (
          <div key={i} style={{
            flex: 1,
            textAlign: 'center',
            fontSize: 9,
            fontFamily: 'var(--font-display)',
            color: 'var(--text-muted)',
            paddingTop: 4,
          }}>
            G{g.giornata}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Componente principale ───────────────────────────────── */

export default function Dashboard() {
  const navigate = useNavigate();
  const rosa = useAppStore((s) => s.rosa);

  // Dati reali Serie A
  const serieAStandings    = useSerieAStore((s) => s.standings);
  const serieAMatchday     = useSerieAStore((s) => s.currentMatchday);
  const serieALoading      = useSerieAStore((s) => s.loading);
  const serieAErrors       = useSerieAStore((s) => s.errors);
  const fetchAll           = useSerieAStore((s) => s.fetchAll);
  const getNextMatchday    = useSerieAStore((s) => s.getNextMatchdayMatches);
  const getLastResults     = useSerieAStore((s) => s.getLastResults);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const nextMatches  = getNextMatchday();
  const lastResults  = getLastResults(5);
  const classifica = useAppStore((s) => s.classifica);
  const calendario = useAppStore((s) => s.calendario);
  const giornataCorrente = useAppStore((s) => s.giornataCorrente);
  const titolariIds = useAppStore((s) => s.titolariIds);
  const aiCrediti = useAppStore((s) => s.aiCrediti);
  const modulo = useAppStore((s) => s.modulo);

  const userRow = classifica.find((c) => c.isUser);
  const posizione = classifica.findIndex((c) => c.isUser) + 1;

  const titolari = titolariIds.map((id) => rosa.find((g) => g.id === id)).filter(Boolean);
  const portieri = titolari.filter((g) => g.ruoloMantra === 'Por');
  const difensori = titolari.filter((g) => ['DD', 'DS', 'DC'].some((r) => g.ruoloMantra.startsWith(r) || g.ruoloMantra === r));
  const centrocampisti = titolari.filter((g) => ['M/C', 'C', 'M'].some((r) => g.ruoloMantra === r || g.ruoloMantra.startsWith(r)));
  const attaccanti = titolari.filter((g) => ['T/A', 'PC', 'T', 'A', 'W'].some((r) => g.ruoloMantra === r));

  const infortunati = rosa.filter((g) => g.infortunato);
  const diffidati = rosa.filter((g) => g.diffidato && !g.infortunato);

  const pitchRows = [
    attaccanti.slice(0, 4),
    centrocampisti.slice(0, 4),
    difensori.slice(0, 5),
    portieri.slice(0, 1),
  ];

  // Alert dinamici da rosa
  const alerts = [
    ...infortunati.map((g) => ({
      tipo: 'infortunio',
      giocatore: `${g.cognome}`,
      messaggio: `${g.cognome} è infortunato e non disponibile per la giornata ${giornataCorrente}.`,
    })),
    ...diffidati.map((g) => ({
      tipo: 'diffida',
      giocatore: `${g.cognome}`,
      messaggio: `${g.cognome} è in diffida — un'ammonizione lo squalificherà.`,
    })),
  ];

  const mediaGiornate = userRow?.puntimedia;
  const variazionePos = userRow?.ultimoTurno;

  /* ── Empty state ─────────────────────────────────────── */
  if (rosa.length === 0) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div className="empty-state">
          <div className="empty-state-icon">⚽</div>
          <div className="empty-state-title">Nessun giocatore in rosa</div>
          <div className="empty-state-desc">
            Vai su La Rosa per aggiungere i tuoi giocatori e iniziare a giocare.
          </div>
          <button
            className="btn-primary"
            style={{ marginTop: 24 }}
            onClick={() => navigate('/la-rosa')}
          >
            Vai alla Rosa
          </button>
        </div>
      </div>
    );
  }

  /* ── Layout principale ───────────────────────────────── */
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* KPI Row */}
      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
        <KpiCard
          label="Posizione in Lega"
          value={posizione > 0 ? `${posizione}°` : '—'}
          sub={posizione > 0 ? `↑ rispetto all'ultima giornata` : 'Classifica non disponibile'}
          color="var(--success)"
          icon="🥉"
        />
        <KpiCard
          label="Punti Totali"
          value={userRow?.punti ?? '—'}
          sub={mediaGiornate != null ? `Media: ${mediaGiornate.toFixed(1)} pt/g` : 'Nessun dato'}
          color="var(--blue)"
          icon="⭐"
        />
        <KpiCard
          label="Crediti AI"
          value={aiCrediti}
          sub={aiCrediti > 0 ? 'analisi disponibili' : 'Crediti esauriti'}
          color="var(--gold)"
          icon="💰"
        />
        <KpiCard
          label="Infortuni Rosa"
          value={infortunati.length}
          sub={infortunati.length > 0 ? infortunati.map((g) => g.cognome).join(' · ') : 'Nessun infortunato'}
          color={infortunati.length > 0 ? 'var(--danger)' : 'var(--success)'}
          icon="🤕"
        />
      </div>

      {/* Middle row: Pitch + AI */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 16, alignItems: 'stretch' }}>
        {/* Pitch */}
        <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{
            padding: '14px 18px',
            borderBottom: '1px solid var(--gold-border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{
                width: 10,
                height: 10,
                borderRadius: 2,
                background: 'var(--success)',
                display: 'inline-block',
              }} />
              <span style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: 15,
                color: 'var(--text-primary)',
                letterSpacing: '0.02em',
              }}>
                SCHIERAMENTO ATTUALE — {modulo}
              </span>
            </div>
            <button
              className="btn-secondary"
              style={{ fontSize: 12, padding: '4px 12px' }}
              onClick={() => navigate('/schieramento')}
            >
              Modifica →
            </button>
          </div>

          <div className="pitch" style={{
            margin: 14,
            padding: '20px 8px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: 18,
            minHeight: 300,
          }}>
            {pitchRows.map((riga, ri) => (
              <div key={ri} style={{
                display: 'flex',
                justifyContent: 'center',
                gap: 16,
                flexWrap: 'wrap',
              }}>
                {(riga.length > 0 ? riga : [null]).map((g, i) => (
                  <PitchSlot key={i} giocatore={g} />
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* AI Suggestions */}
        <AISuggestionsPanel rosa={rosa} giornataCorrente={giornataCorrente} aiCrediti={aiCrediti} />
      </div>

      {/* Bottom row: Classifica + Alert */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Classifica Lega */}
        <div className="glass-card">
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 14,
          }}>
            <span style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: 15,
              color: 'var(--text-primary)',
              letterSpacing: '0.02em',
            }}>
              🏆 CLASSIFICA LEGA
            </span>
            <button
              className="btn-secondary"
              style={{ fontSize: 12, padding: '4px 12px' }}
              onClick={() => navigate('/classifica')}
            >
              Vedi tutto →
            </button>
          </div>
          {classifica.length === 0 ? (
            <div style={{
              padding: '24px 0',
              textAlign: 'center',
              color: 'var(--text-muted)',
              fontSize: 13,
              fontStyle: 'italic',
            }}>
              Classifica non ancora disponibile
            </div>
          ) : (
            classifica.slice(0, 6).map((team, i) => {
              const diffPunti = userRow ? team.punti - userRow.punti : null;
              const subText = team.isUser
                ? `Tu · +${team.ultimoTurno ?? 0} da G${giornataCorrente - 1}`
                : diffPunti != null
                  ? diffPunti > 0 ? `+${diffPunti} pt da te` : `${diffPunti} da te`
                  : null;
              return (
                <div key={team.id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '8px 10px',
                  borderRadius: 'var(--radius-sm)',
                  background: team.isUser
                    ? 'rgba(0, 212, 255, 0.06)'
                    : 'transparent',
                  border: team.isUser
                    ? '1px solid rgba(0, 212, 255, 0.18)'
                    : '1px solid transparent',
                  boxShadow: team.isUser
                    ? '0 0 14px rgba(0, 212, 255, 0.08)'
                    : 'none',
                  marginBottom: 2,
                }}>
                  {/* Position badge */}
                  <div style={{
                    width: 26,
                    height: 26,
                    borderRadius: '50%',
                    flexShrink: 0,
                    background: i < 3 ? 'var(--gold)' : 'var(--bg-elevated)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'var(--font-display)',
                    fontWeight: 800,
                    fontSize: 13,
                    color: i < 3 ? 'var(--bg-deep)' : 'var(--text-muted)',
                    boxShadow: i < 3 ? 'var(--shadow-gold)' : 'none',
                  }}>
                    {i + 1}
                  </div>
                  {/* Avatar */}
                  <div style={{
                    width: 30,
                    height: 30,
                    borderRadius: '50%',
                    flexShrink: 0,
                    background: team.isUser
                      ? 'rgba(0, 212, 255, 0.15)'
                      : 'var(--bg-elevated)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'var(--font-display)',
                    fontWeight: 800,
                    fontSize: 13,
                    color: team.isUser ? 'var(--accent-primary)' : 'var(--text-muted)',
                  }}>
                    {(team.nome || '?')[0].toUpperCase()}
                  </div>
                  {/* Name */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: 13,
                      fontWeight: 600,
                      fontFamily: 'var(--font-body)',
                      color: team.isUser ? 'var(--accent-primary)' : 'var(--text-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}>
                      {team.nome}
                      {team.isUser && <span style={{ fontSize: 12 }}>⚡</span>}
                    </div>
                    {subText && (
                      <div style={{
                        fontSize: 11,
                        fontFamily: 'var(--font-body)',
                        color: 'var(--text-muted)',
                      }}>
                        {subText}
                      </div>
                    )}
                  </div>
                  {/* Points */}
                  <div style={{
                    fontFamily: 'var(--font-display)',
                    fontWeight: 800,
                    fontSize: 18,
                    color: 'var(--text-primary)',
                    flexShrink: 0,
                  }}>
                    {team.punti}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Alert & Notizie */}
        <div className="glass-card">
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 14,
          }}>
            <span style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: 15,
              color: 'var(--text-primary)',
              letterSpacing: '0.02em',
            }}>
              🔔 ALERT & NOTIZIE
            </span>
            <button
              className="btn-secondary"
              style={{ fontSize: 12, padding: '4px 12px' }}
              onClick={() => navigate('/la-rosa')}
            >
              Tutte →
            </button>
          </div>

          {alerts.length === 0 ? (
            <div style={{
              padding: '16px 0',
              textAlign: 'center',
              color: 'var(--text-muted)',
              fontSize: 13,
              fontStyle: 'italic',
            }}>
              Nessun alert attivo. Tutti i giocatori sono disponibili.
            </div>
          ) : (
            alerts.slice(0, 5).map((a, i) => (
              <AlertItem key={i} tipo={a.tipo} messaggio={a.messaggio} giocatore={a.giocatore} />
            ))
          )}

          {alerts.length === 0 && (
            <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { dot: 'var(--success)', title: 'AI Pronto', desc: `Analisi G${giornataCorrente} disponibile — vai su AI Analisi`, time: 'ora' },
                { dot: 'var(--blue)', title: 'Schieramento', desc: "Ottimizza la tua formazione con l'AI", time: '—' },
              ].map((item, i) => (
                <div key={i} style={{
                  display: 'flex',
                  gap: 10,
                  alignItems: 'flex-start',
                  padding: '8px 0',
                  borderBottom: '1px solid var(--border-subtle)',
                }}>
                  <span style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: item.dot,
                    flexShrink: 0,
                    marginTop: 4,
                  }} />
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontSize: 13,
                      fontWeight: 600,
                      fontFamily: 'var(--font-body)',
                      color: 'var(--text-primary)',
                    }}>
                      {item.title}
                    </div>
                    <div style={{
                      fontSize: 11,
                      fontFamily: 'var(--font-body)',
                      color: 'var(--text-muted)',
                    }}>
                      {item.desc}
                    </div>
                  </div>
                  <span style={{
                    fontSize: 11,
                    fontFamily: 'var(--font-body)',
                    color: 'var(--text-muted)',
                    flexShrink: 0,
                  }}>
                    {item.time}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── SERIE A LIVE ─────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Classifica Serie A (top 8) */}
        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: 'var(--text-primary)', letterSpacing: '0.02em' }}>
              ⚽ SERIE A — GIORNATA {serieAMatchday ?? '…'}
            </span>
            {serieALoading.standings && (
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>caricamento…</span>
            )}
          </div>

          {serieAErrors.standings && (
            <div style={{ fontSize: 12, color: 'var(--red)', marginBottom: 8 }}>
              {serieAErrors.standings.includes('non configurata')
                ? '⚙️ Aggiungi VITE_FOOTBALL_DATA_API_KEY nel file .env'
                : `Errore: ${serieAErrors.standings}`}
            </div>
          )}

          {!serieAStandings && !serieALoading.standings && !serieAErrors.standings && (
            <div style={{ fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic' }}>
              Classifica non disponibile — controlla la connessione.
            </div>
          )}

          {serieAStandings?.slice(0, 8).map((team, i) => (
            <div key={team.id} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '6px 0',
              borderBottom: '1px solid rgba(0,212,255,0.07)',
            }}>
              <div style={{
                width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                background: i < 3 ? 'var(--gold)' : 'var(--bg-elevated)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 11,
                color: i < 3 ? 'var(--bg-deep)' : 'var(--text-muted)',
              }}>
                {team.position}
              </div>
              {team.crest && (
                <img src={team.crest} alt="" style={{ width: 18, height: 18, objectFit: 'contain', flexShrink: 0 }} />
              )}
              <span style={{ flex: 1, fontSize: 13, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {team.shortName}
              </span>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 15, color: 'var(--text-primary)', flexShrink: 0 }}>
                {team.points}
              </span>
              <span style={{ fontSize: 11, color: 'var(--text-muted)', flexShrink: 0, minWidth: 28, textAlign: 'right' }}>
                {team.played}G
              </span>
            </div>
          ))}
        </div>

        {/* Prossime partite + Ultimi risultati */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Prossima giornata */}
          <div className="glass-card" style={{ flex: 1 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: 'var(--text-primary)', marginBottom: 10, letterSpacing: '0.02em' }}>
              📅 PROSSIMA GIORNATA
            </div>
            {serieALoading.matches && (
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>caricamento…</div>
            )}
            {nextMatches.length === 0 && !serieALoading.matches && (
              <div style={{ fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic' }}>
                Nessuna partita in programma
              </div>
            )}
            {nextMatches.slice(0, 5).map((m) => (
              <div key={m.id} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '5px 0', borderBottom: '1px solid rgba(0,212,255,0.07)',
                fontSize: 12,
              }}>
                {m.homeTeam.crest && <img src={m.homeTeam.crest} alt="" style={{ width: 14, height: 14, objectFit: 'contain' }} />}
                <span style={{ flex: 1, color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {m.homeTeam.shortName} vs {m.awayTeam.shortName}
                </span>
                {m.awayTeam.crest && <img src={m.awayTeam.crest} alt="" style={{ width: 14, height: 14, objectFit: 'contain' }} />}
                <span style={{ fontSize: 10, color: 'var(--text-muted)', flexShrink: 0, marginLeft: 4 }}>
                  {['IN_PLAY', 'PAUSED'].includes(m.status)
                    ? <span style={{ color: 'var(--green)', fontWeight: 700 }}>LIVE</span>
                    : formatMatchDate(m.date).split(',')[0]}
                </span>
              </div>
            ))}
          </div>

          {/* Ultimi risultati */}
          <div className="glass-card" style={{ flex: 1 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: 'var(--text-primary)', marginBottom: 10, letterSpacing: '0.02em' }}>
              🏁 ULTIMI RISULTATI
            </div>
            {lastResults.length === 0 && !serieALoading.matches && (
              <div style={{ fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic' }}>
                Nessun risultato disponibile
              </div>
            )}
            {lastResults.slice(0, 5).map((m) => (
              <div key={m.id} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '5px 0', borderBottom: '1px solid rgba(0,212,255,0.07)',
                fontSize: 12,
              }}>
                {m.homeTeam.crest && <img src={m.homeTeam.crest} alt="" style={{ width: 14, height: 14, objectFit: 'contain' }} />}
                <span style={{ flex: 1, color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {m.homeTeam.shortName}
                </span>
                <span style={{
                  fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 13,
                  color: m.winner === 'DRAW' ? 'var(--amber)' : 'var(--text-primary)',
                  flexShrink: 0, margin: '0 4px',
                }}>
                  {m.score.home} - {m.score.away}
                </span>
                <span style={{ flex: 1, textAlign: 'right', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {m.awayTeam.shortName}
                </span>
                {m.awayTeam.crest && <img src={m.awayTeam.crest} alt="" style={{ width: 14, height: 14, objectFit: 'contain' }} />}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Andamento punti bar chart */}
      {calendario.some((g) => g.giocata && g.puntiUser != null) && (
        <div className="glass-card">
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 16,
          }}>
            <span style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: 15,
              color: 'var(--text-primary)',
              letterSpacing: '0.02em',
            }}>
              📈 ANDAMENTO PUNTI — ULTIME 8 GIORNATE
            </span>
            <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{
                  width: 10,
                  height: 10,
                  borderRadius: 2,
                  background: 'var(--accent-primary)',
                  display: 'inline-block',
                }} />
                <span style={{
                  fontSize: 11,
                  fontFamily: 'var(--font-body)',
                  color: 'var(--text-muted)',
                }}>
                  Tu
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{
                  width: 10,
                  height: 10,
                  borderRadius: 2,
                  background: 'var(--danger)',
                  display: 'inline-block',
                }} />
                <span style={{
                  fontSize: 11,
                  fontFamily: 'var(--font-body)',
                  color: 'var(--text-muted)',
                }}>
                  Sotto media
                </span>
              </div>
            </div>
          </div>
          <BarChartGiornate giornate={calendario} />
        </div>
      )}
    </div>
  );
}
