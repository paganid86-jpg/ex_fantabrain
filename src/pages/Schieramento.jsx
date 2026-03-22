import { useState } from 'react';
import useAppStore from '../store/useAppStore';
import { moduli } from '../data/mockData';
import { analizzaSchieramento } from '../lib/claudeApi';

const MODULO_SLOTS = {
  '4-3-3': {
    Por: 1, DC: 2, DD: 1, DS: 1, MC: 3, ATT: 3,
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

function isCompatibile(ruoloGiocatore, ruoloSlot) {
  if (!ruoloGiocatore) return false;
  const g = ruoloGiocatore.split('/');
  const s = ruoloSlot.split('/');
  return g.some((r) => s.some((sr) => r.trim() === sr.trim()));
}

export default function Schieramento() {
  const rosa = useAppStore((s) => s.rosa);
  const modulo = useAppStore((s) => s.modulo);
  const setModulo = useAppStore((s) => s.setModulo);
  const titolariIds = useAppStore((s) => s.titolariIds);
  const setTitolariIds = useAppStore((s) => s.setTitolariIds);
  const giornataCorrente = useAppStore((s) => s.giornataCorrente);
  const aiCrediti = useAppStore((s) => s.aiCrediti);

  const [selezionatoSlot, setSelezionatoSlot] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiRisultato, setAiRisultato] = useState(null);
  const [aiError, setAiError] = useState(null);
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);

  const config = MODULO_SLOTS[modulo] || MODULO_SLOTS['4-3-3'];
  const slotTotali = config.righe.flat().length;

  // Titolari assegnati in ordine per slot
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
    setTitolariIds(nuovi.filter((id, i) => i < slotTotali));
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
      const testo = await analizzaSchieramento(schieramentoData, rosa, giornataCorrente, apiKey);
      setAiRisultato(testo);
    } catch (err) {
      setAiError('Analisi non disponibile al momento. Verifica la API key.');
    } finally {
      setAiLoading(false);
    }
  }

  let slotCounter = 0;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 16 }}>
      {/* Main: pitch + panchina */}
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
            flex: 1, background: 'var(--bg-card)', borderRadius: 8, padding: '8px 16px',
            border: '1px solid var(--border)', display: 'flex', gap: 16,
          }}>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Punteggio atteso:</span>
            <span style={{ fontFamily: 'Barlow Condensed', fontWeight: 700, fontSize: 18, color: 'var(--accent-green)' }}>
              {punteggioAtteso.toFixed(1)}pt
            </span>
          </div>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            {selezionatoSlot !== null ? 'Clicca un giocatore dalla panchina' : 'Clicca uno slot per modificare'}
          </span>
        </div>

        {/* Pitch */}
        <div className="pitch" style={{ padding: '24px 16px', minHeight: 380 }}>
          {config.righe.map((riga, ri) => {
            const rigaSlot = riga.map((slot) => {
              const idx = slotCounter++;
              return { slot, idx };
            });
            return (
              <div key={ri} style={{ display: 'flex', justifyContent: 'center', gap: 20, marginBottom: ri < config.righe.length - 1 ? 24 : 0 }}>
                {rigaSlot.map(({ slot, idx }) => {
                  const giocatore = titolari[idx];
                  const isSelected = selezionatoSlot === idx;
                  const compat = giocatore ? isCompatibile(giocatore.ruoloMantra, slot.ruolo) : true;

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
                        background: giocatore ? (compat ? 'rgba(0,230,118,0.12)' : 'rgba(255,23,68,0.12)') : 'rgba(255,255,255,0.04)',
                        border: `2px solid ${isSelected ? 'var(--accent-amber)' : giocatore ? (compat ? 'rgba(0,230,118,0.5)' : 'var(--accent-red)') : 'rgba(255,255,255,0.15)'}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'all 0.15s', position: 'relative',
                        boxShadow: isSelected ? '0 0 12px rgba(255,171,0,0.4)' : 'none',
                      }}>
                        {giocatore ? (
                          <span style={{ fontFamily: 'Barlow Condensed', fontWeight: 700, fontSize: 10, color: compat ? 'var(--accent-green)' : 'var(--accent-red)' }}>
                            {giocatore.ruoloMantra}
                          </span>
                        ) : (
                          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{slot.label}</span>
                        )}
                        {giocatore?.infortunato && (
                          <span style={{ position: 'absolute', top: -3, right: -3, width: 14, height: 14, background: 'var(--accent-red)', borderRadius: '50%', fontSize: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700 }}>✕</span>
                        )}
                        {giocatore?.diffidato && !giocatore?.infortunato && (
                          <span style={{ position: 'absolute', top: -3, right: -3, width: 14, height: 14, background: 'var(--accent-amber)', borderRadius: '50%', fontSize: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontWeight: 700 }}>!</span>
                        )}
                      </div>
                      <span style={{ fontSize: 10, fontFamily: 'Barlow Condensed', fontWeight: 600, color: giocatore ? 'var(--text-primary)' : 'var(--text-muted)', textAlign: 'center', maxWidth: 60, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
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
        <div className="card" style={{ marginTop: 16 }}>
          <div style={{ fontFamily: 'Barlow Condensed', fontWeight: 700, fontSize: 14, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12 }}>
            PANCHINA ({panchina.length})
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {panchina.map((g) => (
              <div
                key={g.id}
                onClick={() => selezionatoSlot !== null && assignToSlot(selezionatoSlot, g.id)}
                style={{
                  background: selezionatoSlot !== null ? 'rgba(41,121,255,0.12)' : 'var(--bg-elevated)',
                  border: `1px solid ${selezionatoSlot !== null ? 'rgba(41,121,255,0.4)' : 'var(--border)'}`,
                  borderRadius: 8, padding: '6px 12px', cursor: selezionatoSlot !== null ? 'pointer' : 'default',
                  display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.15s',
                  opacity: g.infortunato ? 0.5 : 1,
                }}
              >
                <span className="badge badge-muted" style={{ fontSize: 10 }}>{g.ruoloMantra}</span>
                <span style={{ fontSize: 12, color: 'var(--text-primary)', fontWeight: 600 }}>{g.cognome}</span>
                <span style={{ fontSize: 11, color: 'var(--accent-amber)', fontFamily: 'Barlow Condensed', fontWeight: 700 }}>{g.votoMedia.toFixed(1)}</span>
                {g.infortunato && <span style={{ fontSize: 10 }}>🤕</span>}
                {g.diffidato && !g.infortunato && <span style={{ fontSize: 10 }}>⚠️</span>}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sidebar AI */}
      <div>
        <div className="card">
          <div style={{ fontFamily: 'Barlow Condensed', fontWeight: 700, fontSize: 16, color: 'var(--text-primary)', marginBottom: 4 }}>
            🤖 Ottimizza con AI
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>
            Analisi schieramento e suggerimenti tattici
          </div>

          {/* API Key */}
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'Barlow Condensed', letterSpacing: '0.06em', display: 'block', marginBottom: 4 }}>
              CLAUDE API KEY
            </label>
            <div style={{ display: 'flex', gap: 6 }}>
              <input
                type={showApiKey ? 'text' : 'password'}
                className="input-field"
                placeholder="sk-ant-..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
              <button onClick={() => setShowApiKey((s) => !s)} className="btn-secondary" style={{ padding: '8px 10px', flexShrink: 0 }}>
                {showApiKey ? '🙈' : '👁'}
              </button>
            </div>
          </div>

          <button
            className="btn-ai"
            onClick={ottimizzaConAI}
            disabled={aiLoading || aiCrediti === 0}
            style={{ width: '100%', marginBottom: 12 }}
          >
            {aiLoading ? '⏳ Analizzando...' : '⚡ Ottimizza Schieramento'}
          </button>

          {aiCrediti < 3 && (
            <div style={{ fontSize: 11, color: 'var(--accent-amber)', marginBottom: 12, padding: '6px 10px', background: 'rgba(255,171,0,0.08)', borderRadius: 6, border: '1px solid rgba(255,171,0,0.2)' }}>
              ⚠️ Solo {aiCrediti} crediti AI rimasti!
            </div>
          )}

          {aiError && (
            <div style={{ fontSize: 12, color: 'var(--accent-red)', padding: '10px', background: 'rgba(255,23,68,0.08)', borderRadius: 8, marginBottom: 12 }}>
              {aiError}
            </div>
          )}

          {aiRisultato && (
            <div className="ai-response" style={{ marginTop: 8 }}>
              {aiRisultato}
            </div>
          )}

          {!aiRisultato && !aiLoading && !aiError && (
            <div style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', padding: '20px 0' }}>
              Clicca il pulsante per ricevere suggerimenti AI sullo schieramento
            </div>
          )}
        </div>

        {/* Legenda */}
        <div className="card" style={{ marginTop: 16 }}>
          <div style={{ fontFamily: 'Barlow Condensed', fontWeight: 700, fontSize: 13, color: 'var(--text-muted)', letterSpacing: '0.08em', marginBottom: 10 }}>
            LEGENDA RUOLI
          </div>
          {[
            { ruolo: 'Por', color: '#ff9800', desc: 'Portiere' },
            { ruolo: 'DD/DS/DC', color: '#2979ff', desc: 'Difensori' },
            { ruolo: 'M/C', color: '#00e676', desc: 'Centrocampisti' },
            { ruolo: 'T/A', color: '#e040fb', desc: 'Trequarti/Ala' },
            { ruolo: 'PC', color: '#ff1744', desc: 'Prima Punta' },
          ].map((item) => (
            <div key={item.ruolo} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: item.color, flexShrink: 0 }} />
              <span style={{ fontFamily: 'Barlow Condensed', fontWeight: 600, fontSize: 13, color: 'var(--text-primary)' }}>{item.ruolo}</span>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>— {item.desc}</span>
            </div>
          ))}
          <div style={{ marginTop: 10, fontSize: 11, color: 'var(--accent-red)' }}>
            🔴 Bordo rosso = ruolo incompatibile con lo slot
          </div>
        </div>
      </div>
    </div>
  );
}
