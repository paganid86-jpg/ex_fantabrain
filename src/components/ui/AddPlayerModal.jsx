import { useState } from 'react';
import { RUOLI_MANTRA, SQUADRE_SERIE_A } from '../../data/mockData';
import useAppStore from '../../store/useAppStore';
import PlayerSearchInput from './PlayerSearchInput';

const DEFAULT = {
  nome: '',
  cognome: '',
  squadra: '',
  ruoloMantra: 'M/C',
  quotazione: 1,
  votoMedia: 6.0,
  votiUltimi5: [0, 0, 0, 0, 0],
  infortunato: false,
  diffidato: false,
  imgUrl: null,
};

function FormField({ label, children, error }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{
        display: 'block',
        fontFamily: "'Syne', sans-serif",
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: '0.10em',
        textTransform: 'uppercase',
        color: 'var(--text-muted)',
        marginBottom: 6,
      }}>
        {label}
      </label>
      {children}
      {error && (
        <div style={{ fontSize: 11, color: 'var(--accent-red, #f87171)', marginTop: 4 }}>{error}</div>
      )}
    </div>
  );
}

export default function AddPlayerModal({ onClose, giocatoreEsistente }) {
  const addGiocatore = useAppStore((s) => s.addGiocatore);
  const updateGiocatore = useAppStore((s) => s.updateGiocatore);

  const isEdit = Boolean(giocatoreEsistente);
  const [form, setForm] = useState(isEdit ? { ...giocatoreEsistente } : { ...DEFAULT });
  const [errors, setErrors] = useState({});
  const [saved, setSaved] = useState(false);

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: null }));
  }

  function setVoto(idx, value) {
    const nuovi = [...form.votiUltimi5];
    nuovi[idx] = parseFloat(value) || 0;
    setForm((f) => ({ ...f, votiUltimi5: nuovi }));
  }

  function valida() {
    const e = {};
    if (!form.cognome.trim()) e.cognome = 'Il cognome è obbligatorio';
    if (!form.squadra) e.squadra = 'Seleziona una squadra';
    if (!form.ruoloMantra) e.ruoloMantra = 'Seleziona un ruolo';
    if (form.quotazione < 1 || form.quotazione > 500) e.quotazione = 'Quotazione tra 1 e 500';
    if (form.votoMedia < 0 || form.votoMedia > 10) e.votoMedia = 'Media tra 0 e 10';
    return e;
  }

  function salva() {
    const e = valida();
    if (Object.keys(e).length > 0) { setErrors(e); return; }

    const dati = {
      ...form,
      nome: form.nome.trim(),
      cognome: form.cognome.trim(),
      quotazione: Number(form.quotazione),
      votoMedia: Number(form.votoMedia),
    };

    if (isEdit) {
      updateGiocatore(giocatoreEsistente.id, dati);
    } else {
      addGiocatore(dati);
    }

    setSaved(true);
    setTimeout(onClose, 400);
  }

  const ruoloColors = {
    Por: '#f97316', DD: '#60a5fa', DS: '#60a5fa', DC: '#60a5fa',
    'M/C': '#4ade80', C: '#4ade80', 'T/A': '#e879f9', W: '#e879f9',
    T: '#e879f9', A: '#e879f9', PC: '#f87171',
  };
  const selectedColor = ruoloColors[form.ruoloMantra] || 'var(--gold)';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <div style={{
              fontFamily: "'Syne', sans-serif",
              fontWeight: 800,
              fontSize: 22,
              color: 'var(--text-primary)',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
            }}>
              {isEdit ? '✏️ Modifica Giocatore' : '➕ Aggiungi Giocatore'}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
              {isEdit ? 'Aggiorna i dati del giocatore' : 'Inserimento rapido — puoi modificare i dettagli in seguito'}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 22, padding: 4, lineHeight: 1 }}
          >
            ✕
          </button>
        </div>

        {/* Indicatore ruolo */}
        {form.ruoloMantra && (
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: `${selectedColor}18`,
            border: `1px solid ${selectedColor}44`,
            borderRadius: 10, padding: '6px 14px', marginBottom: 20,
          }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: selectedColor, boxShadow: `0 0 8px ${selectedColor}` }} />
            <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 14, color: selectedColor }}>
              {form.ruoloMantra}
            </span>
          </div>
        )}

        {/* Cerca giocatore Serie A */}
        <div style={{ marginBottom: 'var(--space-lg)' }}>
          <label style={{
            color: 'var(--text-secondary)',
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            marginBottom: 'var(--space-sm)',
            display: 'block',
          }}>
            Cerca Giocatore Serie A
          </label>
          <PlayerSearchInput
            onPlayerSelect={(player) => {
              const positionMap = {
                Goalkeeper: 'Por',
                Defence: 'DC',
                Midfield: 'M/C',
                Offence: 'PC',
              };
              setForm((prev) => ({
                ...prev,
                nome: player.name.split(' ').slice(0, -1).join(' '),
                cognome: player.name.split(' ').slice(-1)[0],
                squadra: player.teamName,
                ruoloMantra: positionMap[player.position] || prev.ruoloMantra,
              }));
            }}
            placeholder="Cerca un giocatore Serie A..."
          />
          <p style={{
            color: 'var(--text-muted)',
            fontSize: '0.75rem',
            marginTop: 'var(--space-sm)',
          }}>
            Seleziona un giocatore per pre-compilare i campi, poi regola il ruolo Mantra.
          </p>
        </div>

        {/* FORM */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>

          <FormField label="Nome" error={errors.nome}>
            <input
              className="input-field"
              placeholder="es. Nicolò"
              value={form.nome}
              onChange={(e) => set('nome', e.target.value)}
            />
          </FormField>

          <FormField label="Cognome *" error={errors.cognome}>
            <input
              className="input-field"
              placeholder="es. Barella"
              value={form.cognome}
              onChange={(e) => set('cognome', e.target.value)}
              autoFocus
            />
          </FormField>

          <FormField label="Ruolo Mantra *" error={errors.ruoloMantra}>
            <select className="input-field" value={form.ruoloMantra} onChange={(e) => set('ruoloMantra', e.target.value)}>
              {RUOLI_MANTRA.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </FormField>

          <FormField label="Squadra Serie A *" error={errors.squadra}>
            <select className="input-field" value={form.squadra} onChange={(e) => set('squadra', e.target.value)}>
              <option value="">— Seleziona —</option>
              {SQUADRE_SERIE_A.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </FormField>

          <FormField label="Quotazione (M)" error={errors.quotazione}>
            <input
              className="input-field"
              type="number"
              min={1}
              max={500}
              step={1}
              value={form.quotazione}
              onChange={(e) => set('quotazione', e.target.value)}
            />
          </FormField>

          <FormField label="Media Voti" error={errors.votoMedia}>
            <input
              className="input-field"
              type="number"
              min={0}
              max={10}
              step={0.1}
              value={form.votoMedia}
              onChange={(e) => set('votoMedia', e.target.value)}
            />
          </FormField>

        </div>

        {/* Voti ultimi 5 */}
        <FormField label="Voti ultimi 5 turni (0 = non giocato)">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
            {form.votiUltimi5.map((v, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: "'Syne', sans-serif", marginBottom: 4 }}>
                  G-{5 - i}
                </div>
                <input
                  className="input-field"
                  type="number"
                  min={0}
                  max={10}
                  step={0.5}
                  value={v}
                  onChange={(e) => setVoto(i, e.target.value)}
                  style={{ textAlign: 'center', padding: '8px 6px' }}
                />
              </div>
            ))}
          </div>
        </FormField>

        {/* Toggle stati */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 24, marginTop: 4 }}>
          {[
            { field: 'infortunato', label: '🤕 Infortunato', color: 'var(--accent-red, #f87171)' },
            { field: 'diffidato', label: '⚠️ Diffidato', color: 'var(--accent-amber, #fbbf24)' },
          ].map(({ field, label, color }) => (
            <button
              key={field}
              onClick={() => set(field, !form[field])}
              style={{
                flex: 1,
                padding: '9px',
                borderRadius: 9,
                border: `1px solid ${form[field] ? color : 'rgba(255,255,255,0.08)'}`,
                background: form[field] ? `${color}18` : 'rgba(255,255,255,0.03)',
                color: form[field] ? color : 'var(--text-muted)',
                fontFamily: "'Syne', sans-serif",
                fontWeight: 600,
                fontSize: 13,
                cursor: 'pointer',
                transition: 'all 0.2s',
                letterSpacing: '0.03em',
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onClose} className="btn-secondary" style={{ flex: 1 }}>
            Annulla
          </button>
          <button
            onClick={salva}
            className="btn-primary"
            style={{ flex: 2, opacity: saved ? 0.6 : 1 }}
            disabled={saved}
          >
            {saved ? '✓ Salvato!' : isEdit ? 'Salva modifiche' : 'Aggiungi alla Rosa'}
          </button>
        </div>

      </div>
    </div>
  );
}
