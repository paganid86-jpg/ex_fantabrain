import { useState } from 'react';
import useAppStore from '../store/useAppStore';
import { moduli } from '../data/mockData';
import { analizzaSchieramento } from '../lib/claudeApi';

/* ── Definizione slot per modulo ─────────────────────────── */

const MODULO_SLOTS = {
  '4-3-3': {
    righe: [
      [{ ruolo: 'Por', label: 'Por' }],
      [{ ruolo: 'DD', label: 'DD' }, { ruolo: 'DC', label: 'DC' }, { ruolo: 'DC', label: 'DC' }, { ruolo: 'DS', label: 'DS' }],
      [{ ruolo: 'M/C', label: 'M' }, { ruolo: 'M/C', label: 'M' }, { ruolo: 'M/C', label: 'M' }],
      [{ ruolo: 'T/A', label: 'A' }, { ruolo: 'PC', label: 'PC' }, { ruolo: 'T/A', label: 'A' }],
    ],
  },
  '3-4-3': {
    righe: [
      [{ ruolo: 'Por', label: 'Por' }],
      [{ ruolo: 'DC', label: 'DC' }, { ruolo: 'DC', label: 'DC' }, { ruolo: 'DC', label: 'DC' }],
      [{ ruolo: 'DS', label: 'W' }, { ruolo: 'M/C', label: 'M' }, { ruolo: 'M/C', label: 'M' }, { ruolo: 'DD', label: 'W' }],
      [{ ruolo: 'T/A', label: 'A' }, { ruolo: 'PC', label: 'PC' }, { ruolo: 'T/A', label: 'A' }],
    ],
  },
  '4-4-2': {
    righe: [
      [{ ruolo: 'Por', label: 'Por' }],
      [{ ruolo: 'DD', label: 'DD' }, { ruolo: 'DC', label: 'DC' }, { ruolo: 'DC', label: 'DC' }, { ruolo: 'DS', label: 'DS' }],
      [{ ruolo: 'T/A', label: 'C' }, { ruolo: 'M/C', label: 'M' }, { ruolo: 'M/C', label: 'M' }, { ruolo: 'T/A', label: 'C' }],
      [{ ruolo: 'PC', label: 'PC' }, { ruolo: 'PC', label: 'PC' }],
    ],
  },
  '3-5-2': {
    righe: [
      [{ ruolo: 'Por', label: 'Por' }],
      [{ ruolo: 'DC', label: 'DC' }, { ruolo: 'DC', label: 'DC' }, { ruolo: 'DC', label: 'DC' }],
      [{ ruolo: 'DS', label: 'W' }, { ruolo: 'M/C', label: 'M' }, { ruolo: 'M/C', label: 'M' }, { ruolo: 'M/C', label: 'M' }, { ruolo: 'DD', label: 'W' }],
      [{ ruolo: 'PC', label: 'PC' }, { ruolo: 'PC', label: 'PC' }],
    ],
  },
  '4-2-3-1': {
    righe: [
      [{ ruolo: 'Por', label: 'Por' }],
      [{ ruolo: 'DD', label: 'DD' }, { ruolo: 'DC', label: 'DC' }, { ruolo: 'DC', label: 'DC' }, { ruolo: 'DS', label: 'DS' }],
      [{ ruolo: 'M/C', label: 'M' }, { ruolo: 'M/C', label: 'M' }],
      [{ ruolo: 'T/A', label: 'T' }, { ruolo: 'M/C', label: 'T' }, { ruolo: 'T/A', label: 'T' }],
      [{ ruolo: 'PC', label: 'PC' }],
    ],
  },
  '5-3-2': {
    righe: [
      [{ ruolo: 'Por', label: 'Por' }],
      [{ ruolo: 'DS', label: 'W' }, { ruolo: 'DC', label: 'DC' }, { ruolo: 'DC', label: 'DC' }, { ruolo: 'DC', label: 'DC' }, { ruolo: 'DD', label: 'W' }],
      [{ ruolo: 'M/C', label: 'M' }, { ruolo: 'M/C', label: 'M' }, { ruolo: 'M/C', label: 'M' }],
      [{ ruolo: 'PC', label: 'PC' }, { ruolo: 'PC', label: 'PC' }],
    ],
  },
};

/* ── Utilità ─────────────────────────────────────────────── */

function isCompatibile(ruoloGiocatore, ruoloSlot) {
  if (!ruoloGiocatore) return false;
  const g = ruoloGiocatore.split('/');
  const s = ruoloSlot.split('/');
  return g.some((r) => s.some((sr) => r.trim() === sr.trim()));
}

/* ── Componente principale ───────────────────────────────── */

export default function Schieramento() {
  const rosa = useAppStore((s) => s.rosa);
  const modulo = useAppStore((s) => s.modulo);
  const setModulo = useAppStore((s) => s.setModulo);
  const titolariIds = useAppStore((s) => s.titolariIds);
  const setTitolariIds = useAppStore((s) => s.setTitolariIds);
  const giornataCorrente = useAppStore((s) => s.giornataCorrente);

  const [selezionatoSlot, setSelezionatoSlot] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiRisultato, setAiRisultato] = useState(null);
  const [aiError, setAiError] = useState(null);

  const config = MODULO_SLOTS[modulo] || MODULO_SLOTS['4-3-3'];
  const slotTotali = config.righe.flat().length;

  const titolari = titolariIds.slice(0, slotTotali).map((id) => rosa.find((g) => g.id === id) || null);
  const panchina = rosa.filter((g) => !titolariIds.slice(0, slotTotali).includes(g.id));
  const punteggioAtteso = titolari.filter(Boolean).reduce((sum, g) => sum + g.votoMedia, 0);

  function assignToSlot(slotIdx, giocatoreId) {
    const nuovi = [...titolariIds];
    while (nuovi.length <= slotIdx) nuovi.push(null);
    const prevInSlot = nuovi[slotIdx];
    const altroIdx = nuovi.findIndex((id, i) => id === giocatoreId && i !== slotIdx);
    if (altroIdx !== -1) nuovi[altroIdx] = prevInSlot;
    nuovi[slotIdx] = giocatoreId;
    setTitolariIds(nuovi.filter((_, i) => i < slotTotali));
    setSelezionatoSlot(null);
  }

  async function ottimizzaConAI() {
    setAiLoading(true);
    setAiError(null);
    setAiRisultato(null);
    try {
      const schieramentoData = titolari.filter(Boolean).map((g) => ({
        nome: `${g.nome} ${g.cognome}`,
        ruolo: g.ruoloMantra,
        squadra: g.squadra,
        media: g.votoMedia,
        infortunato: g.infortunato,
        diffidato: g.diffidato,
      }));
      const testo = await analizzaSchieramento(schieramentoData, rosa, giornataCorrente);
      setAiRisultato(testo);
    } catch {
      setAiError('Analisi non disponibile al momento. Riprova più tardi.');
    } finally {
      setAiLoading(false);
    }
  }

  /* ── Empty state ─────────────────────────────────────── */
  if (rosa.length === 0) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div className="empty-state">
          <div className="empty-state-icon">🏟️</div>
          <div className="empty-state-title">Rosa vuota</div>
          <div className="empty-state-desc">
            Aggiungi giocatori alla rosa per poter creare il tuo schieramento.
          </div>
        </div>
      </div>
    );
  }

  /* ── Layout principale ───────────────────────────────── */
  let slotCounter = 0;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 16 }}>

      {/* Colonna principale: pitch + panchina */}
      <div>
        {/* Toolbar */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 16, alignItems: 'center', flexWrap: 'wrap' }}>
          <select
            className="input-field"
            value={modulo}
            onChange={(e) => { setModulo(e.target.value); setSelezionatoSlot(null); }}
            style={{ maxWidth: 140 }}
          >
            {moduli.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>

          <div style={{
            flex: 1, background: 'var(--bg-glass)', borderRadius: 8,
            padding: '8px 16px', border: '1px solid var(--gold-border)',
            display: 'flex', gap: 16, alignItems: 'center', backdropFilter: 'blur(4px)',
          }}>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Punteggio atteso:</span>
            <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 20, color: 'var(--gold)' }}>
              {punteggioAtteso.toFixed(1)}pt
            </span>
          </div>

          <span style={{ fontSize: 12, color: selezionatoSlot !== null ? 'var(--accent-primary)' : 'var(--text-muted)' }}>
            {selezionatoSlot !== null ? '👆 Clicca un giocatore dalla panchina' : 'Clicca uno slot per modificare'}
          </span>
        </div>

        {/* Pitch glassmorphism */}
        <div className="pitch" style={{ padding: '24px 16px', minHeight: 380 }}>
          {config.righe.map((riga, ri) => {
            const rigaSlot = riga.map((slot) => {
              const idx = slotCounter++;
              return { slot, idx };
            });

            return (
              <div
                key={ri}
                style={{
                  display: 'flex', justifyContent: 'center', gap: 20,
                  marginBottom: ri < config.righe.length - 1 ? 24 : 0,
                }}
              >
                {rigaSlot.map(({ slot, idx }) => {
                  const giocatore = titolari[idx];
                  const isSelected = selezionatoSlot === idx;
                  const compat = giocatore ? isCompatibile(giocatore.ruoloMantra, slot.ruolo) : true;

                  const borderColor = isSelected
                    ? 'var(--gold)'
                    : giocatore
                      ? (compat ? 'var(--gold-border)' : 'var(--red)')
                      : 'rgba(0,212,255,0.25)';

                  const bgColor = isSelected
                    ? 'rgba(245, 158, 11,0.1)'
                    : giocatore
                      ? (compat ? 'rgba(245, 158, 11,0.06)' : 'rgba(248,113,113,0.1)')
                      : 'rgba(0,212,255,0.03)';

                  const ruoloColors = {
                    Por: '#f97316', DD: 'var(--blue)', DS: 'var(--blue)', DC: 'var(--blue)',
                    'M/C': 'var(--green)', C: 'var(--green)', 'T/A': 'var(--accent-primary)', PC: 'var(--red)',
                  };
                  const ruoloColor = giocatore
                    ? (ruoloColors[giocatore.ruoloMantra] || 'var(--gold)')
                    : 'rgba(0,212,255,0.35)';

                  return (
                    <div
                      key={idx}
                      onClick={() => setSelezionatoSlot(isSelected ? null : idx)}
                      style={{
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                        cursor: 'pointer', minWidth: 56,
                      }}
                    >
                      <div style={{
                        width: 48, height: 48, borderRadius: '50%',
                        background: bgColor,
                        border: `2px ${giocatore ? 'solid' : 'dashed'} ${borderColor}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'all 0.15s', position: 'relative',
                        backdropFilter: 'blur(6px)',
                        boxShadow: isSelected ? '0 0 14px rgba(245, 158, 11,0.4)' : giocatore && compat ? '0 0 8px rgba(245, 158, 11,0.1)' : 'none',
                      }}>
                        <span style={{
                          fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: giocatore ? 9 : 11,
                          color: ruoloColor, letterSpacing: '0.03em',
                        }}>
                          {giocatore ? giocatore.ruoloMantra : slot.label}
                        </span>
                        {giocatore?.infortunato && (
                          <span style={{
                            position: 'absolute', top: -3, right: -3, width: 14, height: 14,
                            background: 'var(--red)', borderRadius: '50%',
                            fontSize: 7, display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#fff', fontWeight: 700, border: '1px solid var(--bg-deep)',
                          }}>✕</span>
                        )}
                        {giocatore?.diffidato && !giocatore?.infortunato && (
                          <span style={{
                            position: 'absolute', top: -3, right: -3, width: 14, height: 14,
                            background: 'var(--amber)', borderRadius: '50%',
                            fontSize: 7, display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#000', fontWeight: 700, border: '1px solid var(--bg-deep)',
                          }}>!</span>
                        )}
                      </div>
                      <span style={{
                        fontSize: 10, fontFamily: 'Syne, sans-serif', fontWeight: 600,
                        color: giocatore ? 'var(--text-primary)' : 'var(--text-muted)',
                        textAlign: 'center', maxWidth: 60,
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {giocatore ? giocatore.cognome : '—'}
                      </span>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Panchina */}
        <div className="glass-card" style={{ marginTop: 16 }}>
          <div style={{
            fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 13,
            color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12,
          }}>
            Panchina ({panchina.length})
            {selezionatoSlot !== null && (
              <span style={{ marginLeft: 10, color: 'var(--accent-primary)', fontSize: 11, fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>
                — seleziona un giocatore da schierare
              </span>
            )}
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {panchina.map((g) => (
              <div
                key={g.id}
                onClick={() => selezionatoSlot !== null && assignToSlot(selezionatoSlot, g.id)}
                style={{
                  background: selezionatoSlot !== null ? 'rgba(0,212,255,0.1)' : 'var(--bg-glass)',
                  border: `1px solid ${selezionatoSlot !== null ? 'rgba(0,212,255,0.4)' : 'var(--gold-border)'}`,
                  borderRadius: 8, padding: '6px 12px',
                  cursor: selezionatoSlot !== null ? 'pointer' : 'default',
                  display: 'flex', alignItems: 'center', gap: 8,
                  transition: 'all 0.15s',
                  opacity: g.infortunato ? 0.5 : 1,
                  backdropFilter: 'blur(4px)',
                }}
              >
                <span className="badge badge-muted" style={{ fontSize: 10 }}>{g.ruoloMantra}</span>
                <span style={{ fontSize: 12, color: 'var(--text-primary)', fontWeight: 600 }}>{g.cognome}</span>
                <span style={{ fontSize: 11, color: 'var(--gold)', fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>
                  {g.votoMedia.toFixed(1)}
                </span>
                {g.infortunato && <span style={{ fontSize: 10 }}>🤕</span>}
                {g.diffidato && !g.infortunato && <span style={{ fontSize: 10 }}>⚠️</span>}
              </div>
            ))}
            {panchina.length === 0 && (
              <span style={{ fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic' }}>
                Tutti i giocatori sono già schierati.
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Sidebar AI */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div className="glass-card">
          <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 16, color: 'var(--text-primary)', marginBottom: 4 }}>
            Ottimizza con AI
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>
            Analisi schieramento e suggerimenti tattici per la giornata {giornataCorrente}.
          </div>

          <button
            className="btn-ai"
            onClick={ottimizzaConAI}
            disabled={aiLoading}
            style={{ width: '100%', marginBottom: 12 }}
          >
            {aiLoading ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
                <span className="spinner" /> Analizzando...
              </span>
            ) : '⚡ Ottimizza Schieramento'}
          </button>

          {aiError && (
            <div style={{
              fontSize: 12, color: 'var(--red)', padding: '10px 12px',
              background: 'rgba(248,113,113,0.08)', borderRadius: 8,
              border: '1px solid rgba(248,113,113,0.2)', marginBottom: 12,
            }}>
              {aiError}
            </div>
          )}

          {aiRisultato && (
            <div className="ai-response" style={{ marginTop: 8 }}>
              {aiRisultato}
            </div>
          )}

          {!aiRisultato && !aiLoading && !aiError && (
            <div style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', padding: '16px 0', fontStyle: 'italic' }}>
              Clicca il pulsante per ricevere suggerimenti tattici personalizzati.
            </div>
          )}
        </div>

        {/* Legenda ruoli */}
        <div className="glass-card">
          <div style={{
            fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 12,
            color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12,
          }}>
            Legenda Ruoli
          </div>
          {[
            { ruolo: 'Por', color: '#f97316', desc: 'Portiere' },
            { ruolo: 'DD / DS / DC', color: 'var(--blue)', desc: 'Difensori' },
            { ruolo: 'M/C', color: 'var(--green)', desc: 'Centrocampisti' },
            { ruolo: 'T/A', color: 'var(--accent-primary)', desc: 'Trequarti / Ala' },
            { ruolo: 'PC', color: 'var(--red)', desc: 'Prima Punta' },
          ].map((item) => (
            <div key={item.ruolo} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: item.color, flexShrink: 0, boxShadow: `0 0 6px ${item.color}66` }} />
              <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 600, fontSize: 13, color: 'var(--text-primary)' }}>{item.ruolo}</span>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>— {item.desc}</span>
            </div>
          ))}
          <div style={{ marginTop: 10, fontSize: 11, color: 'var(--red)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', border: '2px solid var(--red)', flexShrink: 0 }} />
            Bordo rosso = ruolo incompatibile con lo slot
          </div>
        </div>
      </div>
    </div>
  );
}
