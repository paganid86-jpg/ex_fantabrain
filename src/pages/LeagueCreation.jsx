// src/pages/LeagueCreation.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useLeagueStore from '../stores/useLeagueStore';

const STEPS = [
  'Informazioni Base',
  'Impostazioni Rosa',
  'Regolamento',
  'Partite',
  'Conferma',
];

export default function LeagueCreation() {
  const [view, setView] = useState('home'); // 'home' | 'create' | 'join'
  const [step, setStep] = useState(0);
  const [showConfirm, setShowConfirm] = useState(false);
  const [createdLeague, setCreatedLeague] = useState(null);
  const [joinCode, setJoinCode] = useState('');
  const [joinError, setJoinError] = useState('');
  const createLeague = useLeagueStore((s) => s.createLeague);
  const joinLeague = useLeagueStore((s) => s.joinLeague);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    // Step 1
    nome: '', tipo: 'privata', descrizione: '', numPartecipanti: 8, modalitaGioco: 'mantra',
    // Step 2
    creditiIniziali: 500, disponibilitaCalciatori: 'singola', numGiocatoriRosa: 25, numeroPanchina: 12,
    // Step 3
    fonteVoti: 'fantabrain', dFactor: true, dFactorIncludePortiere: true,
    modificatoreRendimento: false, fattoreFairPlay: false, fattoreCapitano: false,
    bonusMalus: {
      golSegnato: 3, golSubitoPortiere: -1, assist: 1, ammonizione: -0.5,
      espulsione: -1, rigoreSegnato: 3, rigoreSbagliato: -3, rigoreParato: 3,
      autogol: -2, cleanSheetPortiere: 1, assistDaFermo: 1,
    },
    // Step 4
    tipoCalendario: 'andata_ritorno', fasceGol: 'progressive',
    modalitaSostituzioni: 'basic', numSostituzioni: 5, riservaUfficio: true, votoRiserva: 4,
  });

  const update = (field, value) => setForm((p) => ({ ...p, [field]: value }));
  const updateBM = (field, value) =>
    setForm((p) => ({ ...p, bonusMalus: { ...p.bonusMalus, [field]: parseFloat(value) || 0 } }));

  const handleCreate = () => {
    const league = createLeague(form);
    setCreatedLeague(league);
    setShowConfirm(true);
  };

  const handleJoin = () => {
    const result = joinLeague(joinCode);
    if (result.success) {
      navigate('/');
    } else {
      setJoinError(result.error);
    }
  };

  const copyToClipboard = (text) => navigator.clipboard.writeText(text);

  // ---- Render ----
  if (showConfirm && createdLeague) {
    return <ConfirmModal league={createdLeague} onNavigate={() => navigate('/')} copyToClipboard={copyToClipboard} />;
  }

  if (view === 'home') {
    return <HomeView onCreate={() => setView('create')} onJoin={() => setView('join')} />;
  }

  if (view === 'join') {
    return (
      <JoinView
        joinCode={joinCode}
        setJoinCode={setJoinCode}
        joinError={joinError}
        onJoin={handleJoin}
        onBack={() => setView('home')}
      />
    );
  }

  // View 'create' — form multi-step
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-deep)', padding: 'var(--space-lg)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ width: '100%', maxWidth: '640px' }}>
        {/* Header */}
        <button onClick={() => setView('home')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', marginBottom: 'var(--space-md)', fontSize: '0.875rem' }}>
          ← Indietro
        </button>
        <h1 style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)', fontSize: '1.75rem', marginBottom: 'var(--space-lg)' }}>
          ⚽ Crea la tua Lega
        </h1>

        {/* Step Indicator */}
        <StepIndicator steps={STEPS} current={step} />

        {/* Step Content */}
        <div className="glass-card" style={{ padding: 'var(--space-lg)', marginTop: 'var(--space-lg)', borderRadius: 'var(--radius-lg)' }}>
          {step === 0 && <Step1 form={form} update={update} />}
          {step === 1 && <Step2 form={form} update={update} />}
          {step === 2 && <Step3 form={form} update={update} updateBM={updateBM} />}
          {step === 3 && <Step4 form={form} update={update} />}
          {step === 4 && <Step5 form={form} onCreate={handleCreate} />}
        </div>

        {/* Navigation */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'var(--space-md)' }}>
          {step > 0 && (
            <button className="btn-secondary" onClick={() => setStep((s) => s - 1)}>
              ← Precedente
            </button>
          )}
          <div style={{ marginLeft: 'auto' }}>
            {step < 4 ? (
              <button
                className="btn-primary"
                onClick={() => setStep((s) => s + 1)}
                disabled={step === 0 && !form.nome.trim()}
              >
                Avanti →
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

// ---- StepIndicator ----
function StepIndicator({ steps, current }) {
  return (
    <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
      {steps.map((label, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', flex: i < steps.length - 1 ? 1 : 0 }}>
          <div style={{
            width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: '0.75rem', fontWeight: 600, flexShrink: 0,
            background: i < current ? 'var(--accent-secondary)' : i === current ? 'var(--accent-primary)' : 'var(--bg-elevated)',
            color: i <= current ? '#000' : 'var(--text-muted)',
            boxShadow: i === current ? 'var(--shadow-glow)' : 'none',
          }}>
            {i < current ? '✓' : i + 1}
          </div>
          {i < steps.length - 1 && (
            <div style={{ flex: 1, height: '2px', background: i < current ? 'var(--accent-secondary)' : 'var(--border-glass)', margin: '0 4px' }} />
          )}
        </div>
      ))}
    </div>
  );
}

// ---- HomeView ----
function HomeView({ onCreate, onJoin }) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-deep)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-lg)' }}>
      <h1 style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)', fontSize: '2rem', marginBottom: '0.5rem', textAlign: 'center' }}>
        🧠⚽ FantaBrain AI
      </h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-lg)', textAlign: 'center' }}>
        Inizia creando la tua lega o unisciti a una esistente
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 'var(--space-lg)', width: '100%', maxWidth: '600px' }}>
        {/* Card Crea */}
        <div className="glass-card glass-card--accent" onClick={onCreate} style={{ padding: 'var(--space-lg)', borderRadius: 'var(--radius-lg)', cursor: 'pointer', textAlign: 'center', transition: 'transform 0.2s' }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}>
          <div className="league-choice-mark" aria-hidden="true">CL</div>
          <h2 style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)', marginBottom: 'var(--space-sm)' }}>Crea una Lega</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: 'var(--space-lg)' }}>
            Crea la tua lega e invita i tuoi amici
          </p>
          <button className="btn-primary" style={{ width: '100%' }}>Crea Lega</button>
        </div>
        {/* Card Unisciti */}
        <div className="glass-card" onClick={onJoin} style={{ padding: 'var(--space-lg)', borderRadius: 'var(--radius-lg)', cursor: 'pointer', textAlign: 'center', transition: 'transform 0.2s' }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}>
          <div className="league-choice-mark" aria-hidden="true">IN</div>
          <h2 style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)', marginBottom: 'var(--space-sm)' }}>Unisciti a una Lega</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: 'var(--space-lg)' }}>
            Hai un codice invito? Entra in una lega esistente
          </p>
          <button className="btn-secondary" style={{ width: '100%' }}>Inserisci Codice</button>
        </div>
      </div>
    </div>
  );
}

// ---- JoinView ----
function JoinView({ joinCode, setJoinCode, joinError, onJoin, onBack }) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-deep)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-lg)' }}>
      <button onClick={onBack} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', marginBottom: 'var(--space-md)', fontSize: '0.875rem', alignSelf: 'flex-start', maxWidth: '480px', width: '100%' }}>
        ← Indietro
      </button>
      <div className="glass-card glass-card--accent" style={{ padding: 'var(--space-lg)', borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: '480px' }}>
        <h2 style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)', marginBottom: 'var(--space-lg)' }}>🔗 Unisciti a una Lega</h2>
        <label style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Codice invito
        </label>
        <input
          type="text"
          value={joinCode}
          onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
          placeholder="Es. FBRAIN-X7K9M2"
          style={{ width: '100%', marginTop: 'var(--space-sm)', marginBottom: 'var(--space-md)', padding: '10px var(--space-md)', background: 'var(--bg-glass)', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)', fontSize: '1rem', fontFamily: 'monospace', outline: 'none', boxSizing: 'border-box' }}
        />
        {joinError && <p style={{ color: 'var(--danger)', fontSize: '0.875rem', marginBottom: 'var(--space-md)' }}>{joinError}</p>}
        <button className="btn-primary" onClick={onJoin} style={{ width: '100%' }} disabled={joinCode.length < 6}>
          Unisciti
        </button>
      </div>
    </div>
  );
}

// ---- Step1 — Info Base ----
function Step1({ form, update }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
      <h2 style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>Informazioni Base</h2>
      <FormField label="Nome lega *">
        <input type="text" value={form.nome} onChange={(e) => update('nome', e.target.value)} maxLength={30} placeholder="Es. La Banda del Lunedì" style={inputStyle} />
      </FormField>
      <FormField label="Tipo lega *">
        <ToggleSwitch value={form.tipo} options={[{ value: 'privata', label: 'Privata' }, { value: 'pubblica', label: 'Pubblica' }]} onChange={(v) => update('tipo', v)} />
      </FormField>
      {form.tipo === 'pubblica' && (
        <FormField label="Descrizione (opzionale)">
          <textarea value={form.descrizione} onChange={(e) => update('descrizione', e.target.value)} maxLength={200} placeholder="Descrivi la tua lega..." style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }} />
        </FormField>
      )}
      <FormField label="Numero partecipanti *">
        <select value={form.numPartecipanti} onChange={(e) => update('numPartecipanti', parseInt(e.target.value))} style={inputStyle}>
          {[4, 6, 8, 10, 12, 14, 16, 20].map((n) => <option key={n} value={n}>{n} squadre</option>)}
        </select>
      </FormField>
      <FormField label="Modalità di gioco *">
        <select value={form.modalitaGioco} onChange={(e) => update('modalitaGioco', e.target.value)} style={inputStyle}>
          <option value="mantra">Mantra (consigliato)</option>
          <option value="classic">Classic</option>
        </select>
      </FormField>
    </div>
  );
}

// ---- Step2 — Rosa ----
function Step2({ form, update }) {
  const minRosa = form.modalitaGioco === 'mantra' ? 23 : 25;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
      <h2 style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>Impostazioni Rosa</h2>
      <FormField label="Crediti iniziali per squadra *">
        <input type="number" value={form.creditiIniziali} onChange={(e) => update('creditiIniziali', parseInt(e.target.value))} min={100} max={1000} step={10} style={inputStyle} />
      </FormField>
      <FormField label="Disponibilità calciatori *">
        <ToggleSwitch value={form.disponibilitaCalciatori} options={[{ value: 'singola', label: 'Singola' }, { value: 'multipla', label: 'Multipla' }]} onChange={(v) => update('disponibilitaCalciatori', v)} />
      </FormField>
      <FormField label={`Giocatori per rosa * (min ${minRosa})`}>
        <input type="number" value={form.numGiocatoriRosa} onChange={(e) => update('numGiocatoriRosa', parseInt(e.target.value))} min={minRosa} max={31} style={inputStyle} />
      </FormField>
      <FormField label="Panchina">
        <input type="number" value={form.numeroPanchina} onChange={(e) => update('numeroPanchina', parseInt(e.target.value))} min={0} max={15} style={inputStyle} />
      </FormField>
    </div>
  );
}

// ---- Step3 — Regolamento ----
function Step3({ form, update, updateBM }) {
  const BONUS_LABELS = {
    golSegnato: 'Gol segnato', golSubitoPortiere: 'Gol subito (portiere)', assist: 'Assist',
    ammonizione: 'Ammonizione', espulsione: 'Espulsione', rigoreSegnato: 'Rigore segnato',
    rigoreSbagliato: 'Rigore sbagliato', rigoreParato: 'Rigore parato', autogol: 'Autogol',
    cleanSheetPortiere: 'Clean sheet portiere', assistDaFermo: 'Assist da fermo',
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
      <h2 style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>Regolamento e Modificatori</h2>
      <FormField label="Fonte voti *">
        <select value={form.fonteVoti} onChange={(e) => update('fonteVoti', e.target.value)} style={inputStyle}>
          <option value="fantabrain">FantaBrain (interno)</option>
          <option value="redazione">Redazione Fantacalcio</option>
          <option value="alvin">Alvin (statistico)</option>
          <option value="italia">Italia (media)</option>
        </select>
      </FormField>
      <FormField label="Modificatore Difesa (D-Factor)">
        <ToggleSwitch value={form.dFactor ? 'si' : 'no'} options={[{ value: 'si', label: 'SÌ' }, { value: 'no', label: 'NO' }]} onChange={(v) => update('dFactor', v === 'si')} />
      </FormField>
      {form.dFactor && (
        <FormField label="Includi portiere nel D-Factor">
          <ToggleSwitch value={form.dFactorIncludePortiere ? 'si' : 'no'} options={[{ value: 'si', label: 'SÌ' }, { value: 'no', label: 'NO' }]} onChange={(v) => update('dFactorIncludePortiere', v === 'si')} />
        </FormField>
      )}
      <FormField label="Modificatore Rendimento">
        <ToggleSwitch value={form.modificatoreRendimento ? 'si' : 'no'} options={[{ value: 'si', label: 'SÌ' }, { value: 'no', label: 'NO' }]} onChange={(v) => update('modificatoreRendimento', v === 'si')} />
      </FormField>
      <FormField label="Fattore Fair Play">
        <ToggleSwitch value={form.fattoreFairPlay ? 'si' : 'no'} options={[{ value: 'si', label: 'SÌ' }, { value: 'no', label: 'NO' }]} onChange={(v) => update('fattoreFairPlay', v === 'si')} />
      </FormField>
      <FormField label="Fattore Capitano">
        <ToggleSwitch value={form.fattoreCapitano ? 'si' : 'no'} options={[{ value: 'si', label: 'SÌ' }, { value: 'no', label: 'NO' }]} onChange={(v) => update('fattoreCapitano', v === 'si')} />
      </FormField>

      {/* Tabella Bonus/Malus */}
      <div>
        <label style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 'var(--space-sm)' }}>
          Bonus / Malus
        </label>
        <div style={{ border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
          {Object.entries(form.bonusMalus).map(([key, val], i) => (
            <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px var(--space-md)', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)', borderBottom: i < Object.keys(form.bonusMalus).length - 1 ? '1px solid var(--border-glass)' : 'none' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{BONUS_LABELS[key]}</span>
              <input type="number" value={val} onChange={(e) => updateBM(key, e.target.value)} step={0.5} style={{ width: '70px', padding: '4px 8px', background: 'var(--bg-glass)', border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-sm)', color: val >= 0 ? 'var(--success)' : 'var(--danger)', fontSize: '0.875rem', textAlign: 'right', outline: 'none', fontWeight: 600 }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---- Step4 — Partite ----
function Step4({ form, update }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
      <h2 style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>Impostazioni Partite</h2>
      <FormField label="Tipo calendario *">
        <select value={form.tipoCalendario} onChange={(e) => update('tipoCalendario', e.target.value)} style={inputStyle}>
          <option value="andata_ritorno">Andata e Ritorno</option>
          <option value="all_italiana">All'italiana</option>
        </select>
      </FormField>
      <FormField label="Fasce gol *">
        <select value={form.fasceGol} onChange={(e) => update('fasceGol', e.target.value)} style={inputStyle}>
          <option value="progressive">Progressive (66-72-77...)</option>
          <option value="fisse">Fisse</option>
          <option value="custom">Custom</option>
        </select>
      </FormField>
      <FormField label="Modalità sostituzioni Mantra *">
        <select value={form.modalitaSostituzioni} onChange={(e) => update('modalitaSostituzioni', e.target.value)} style={inputStyle}>
          <option value="basic">Basic (default)</option>
          <option value="master">Master</option>
          <option value="easy">Easy</option>
        </select>
      </FormField>
      <FormField label="Numero sostituzioni *">
        <input type="number" value={form.numSostituzioni} onChange={(e) => update('numSostituzioni', parseInt(e.target.value))} min={1} max={10} style={inputStyle} />
      </FormField>
      <FormField label="Riserva d'ufficio">
        <ToggleSwitch value={form.riservaUfficio ? 'si' : 'no'} options={[{ value: 'si', label: 'SÌ' }, { value: 'no', label: 'NO' }]} onChange={(v) => update('riservaUfficio', v === 'si')} />
      </FormField>
      {form.riservaUfficio && (
        <FormField label="Voto riserva d'ufficio">
          <input type="number" value={form.votoRiserva} onChange={(e) => update('votoRiserva', parseFloat(e.target.value))} min={1} max={6} step={0.5} style={inputStyle} />
        </FormField>
      )}
    </div>
  );
}

// ---- Step5 — Riepilogo ----
function Step5({ form, onCreate }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
      <h2 style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>Conferma e Creazione</h2>
      <div style={{ background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', padding: 'var(--space-md)' }}>
        {[
          ['Nome', form.nome],
          ['Tipo', form.tipo === 'privata' ? 'Privata' : 'Pubblica'],
          ['Partecipanti', `${form.numPartecipanti} squadre`],
          ['Modalità', form.modalitaGioco === 'mantra' ? 'Mantra' : 'Classic'],
          ['Crediti iniziali', `${form.creditiIniziali} crediti`],
          ['Giocatori per rosa', `${form.numGiocatoriRosa} giocatori`],
          ['Calendario', form.tipoCalendario === 'andata_ritorno' ? 'Andata e Ritorno' : "All'italiana"],
          ['Sostituzioni', `${form.numSostituzioni} per giornata`],
        ].map(([label, val]) => (
          <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border-glass)' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{label}</span>
            <span style={{ color: 'var(--text-primary)', fontSize: '0.875rem', fontWeight: 500 }}>{val}</span>
          </div>
        ))}
      </div>
      <button className="btn-primary" onClick={onCreate} style={{ width: '100%', padding: 'var(--space-md)', fontSize: '1rem', fontWeight: 700, boxShadow: 'var(--shadow-glow)' }}>
        🚀 Crea la Lega
      </button>
    </div>
  );
}

// ---- ConfirmModal ----
function ConfirmModal({ league, onNavigate, copyToClipboard }) {
  const [copied, setCopied] = useState(null);
  const copy = (text, key) => {
    copyToClipboard(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };
  const whatsappMsg = encodeURIComponent(
    `Unisciti alla mia lega su FantaBrain AI! 🧠⚽\nLega: ${league.settings.nome}\nCodice: ${league.inviteCode}\nEntra qui: ${league.inviteUrl}`
  );
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-deep)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-lg)' }}>
      <div className="glass-card glass-card--accent" style={{ padding: 'var(--space-lg)', borderRadius: 'var(--radius-lg)', maxWidth: '480px', width: '100%', textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: 'var(--space-sm)' }}>🎉</div>
        <h2 style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)', marginBottom: 'var(--space-sm)' }}>La tua lega è stata creata!</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-lg)' }}>Condividi il codice invito con i tuoi amici</p>

        {/* Codice invito */}
        <div style={{ background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', padding: 'var(--space-md)', marginBottom: 'var(--space-md)' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '4px' }}>CODICE INVITO</p>
          <p style={{ color: 'var(--accent-primary)', fontFamily: 'monospace', fontSize: '1.5rem', fontWeight: 700, letterSpacing: '0.1em' }}>{league.inviteCode}</p>
          <button className="btn-secondary" onClick={() => copy(league.inviteCode, 'code')} style={{ marginTop: 'var(--space-sm)', padding: '6px 16px', fontSize: '0.75rem' }}>
            {copied === 'code' ? '✓ Copiato!' : '📋 Copia Codice'}
          </button>
        </div>

        {/* URL */}
        <div style={{ background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', padding: 'var(--space-sm) var(--space-md)', marginBottom: 'var(--space-md)', display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', justifyContent: 'space-between' }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{league.inviteUrl}</span>
          <button className="btn-secondary" onClick={() => copy(league.inviteUrl, 'url')} style={{ padding: '4px 12px', fontSize: '0.75rem', flexShrink: 0 }}>
            {copied === 'url' ? '✓' : '📋'}
          </button>
        </div>

        {/* Condivisione */}
        <div style={{ display: 'flex', gap: 'var(--space-sm)', justifyContent: 'center', marginBottom: 'var(--space-lg)' }}>
          <a href={`https://wa.me/?text=${whatsappMsg}`} target="_blank" rel="noopener noreferrer" className="btn-secondary" style={{ textDecoration: 'none', padding: '8px 16px', fontSize: '0.875rem' }}>
            💬 WhatsApp
          </a>
          <a href={`https://t.me/share/url?url=${encodeURIComponent(league.inviteUrl)}&text=${encodeURIComponent(`Unisciti alla mia lega FantaBrain: ${league.settings.nome}`)}`} target="_blank" rel="noopener noreferrer" className="btn-secondary" style={{ textDecoration: 'none', padding: '8px 16px', fontSize: '0.875rem' }}>
            ✈️ Telegram
          </a>
          <button className="btn-secondary" onClick={() => copy(league.inviteUrl, 'share')} style={{ padding: '8px 16px', fontSize: '0.875rem' }}>
            {copied === 'share' ? '✓ Copiato' : '🔗 Link'}
          </button>
        </div>

        <button className="btn-primary" onClick={onNavigate} style={{ width: '100%' }}>
          Vai alla Dashboard →
        </button>
      </div>
    </div>
  );
}

// ---- Utility components ----
const inputStyle = {
  width: '100%', padding: '10px var(--space-md)', background: 'var(--bg-glass)',
  border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-md)',
  color: 'var(--text-primary)', fontSize: '0.875rem', outline: 'none',
  fontFamily: 'inherit', boxSizing: 'border-box',
  transition: 'border-color 0.2s, box-shadow 0.2s',
};

function FormField({ label, children }) {
  return (
    <div>
      <label style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 'var(--space-sm)' }}>
        {label}
      </label>
      {children}
    </div>
  );
}

function ToggleSwitch({ value, options, onChange }) {
  return (
    <div style={{ display: 'flex', gap: '2px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', padding: '3px', width: 'fit-content' }}>
      {options.map((opt) => (
        <button key={opt.value} onClick={() => onChange(opt.value)} style={{
          padding: '6px 16px', borderRadius: 'calc(var(--radius-md) - 2px)', border: 'none', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500, transition: 'all 0.2s',
          background: value === opt.value ? 'var(--accent-primary)' : 'transparent',
          color: value === opt.value ? '#000' : 'var(--text-muted)',
          boxShadow: value === opt.value ? 'var(--shadow-glow)' : 'none',
        }}>
          {opt.label}
        </button>
      ))}
    </div>
  );
}
