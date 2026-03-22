import { useState } from 'react';
import useAppStore from '../store/useAppStore';
import FormationEditor from '../components/formation/FormationEditor';
import { analizzaSchieramento } from '../lib/claudeApi';
import { MODULI } from '../data/moduli';

export default function Schieramento() {
  const rosa = useAppStore((s) => s.rosa);
  const modulo = useAppStore((s) => s.modulo);
  const setModulo = useAppStore((s) => s.setModulo);
  const titolariIds = useAppStore((s) => s.titolariIds);
  const setTitolariIds = useAppStore((s) => s.setTitolariIds);
  const giornataCorrente = useAppStore((s) => s.giornataCorrente);

  const [aiLoading, setAiLoading] = useState(false);
  const [aiRisultato, setAiRisultato] = useState('');
  const [aiError, setAiError] = useState('');

  const titolari = rosa.filter((g) => titolariIds.includes(g.id));
  const puntoAtteso = titolari.reduce((sum, g) => sum + (g.votoMedia || 0), 0);

  async function handleOttimizza() {
    if (aiLoading) return;
    setAiLoading(true);
    setAiError('');
    try {
      const moduloDef = MODULI[modulo];
      const schieramentoData = {
        modulo,
        titolari: titolari.map((g, i) => ({
          nome: `${g.nome} ${g.cognome}`,
          ruolo: g.ruoloMantra,
          slot: moduloDef?.slots[i]?.id,
          media: g.votoMedia,
          infortunato: g.infortunato,
          diffidato: g.diffidato,
        })),
      };
      const risultato = await analizzaSchieramento(schieramentoData, rosa, giornataCorrente);
      setAiRisultato(risultato);
    } catch (err) {
      setAiError(err.message);
    } finally {
      setAiLoading(false);
    }
  }

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 60px)', overflow: 'hidden' }}>
      {/* Formation Editor — takes remaining width */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <FormationEditor
          rosa={rosa}
          modulo={modulo}
          titolariIds={titolariIds}
          onModuloChange={setModulo}
          onTitolariChange={setTitolariIds}
          puntoAtteso={puntoAtteso}
        />
      </div>

      {/* AI Sidebar */}
      <div style={{ width: '280px', background: '#0E0E18', borderLeft: '1px solid #ffffff10', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto' }}>
        <h3 style={{ color: '#F59E0B', fontSize: '14px', fontWeight: 'bold', margin: 0 }}>⚡ Analisi AI</h3>
        <button
          onClick={handleOttimizza}
          disabled={aiLoading}
          className="btn-ai"
          style={{ width: '100%' }}
        >
          {aiLoading ? '⏳ Analisi in corso...' : '⚡ Ottimizza Schieramento'}
        </button>
        {aiError && <div style={{ color: '#EF4444', fontSize: '11px' }}>{aiError}</div>}
        {aiRisultato && (
          <div style={{ background: '#1A1200', border: '1px solid #F59E0B33', borderRadius: '8px', padding: '10px', fontSize: '11px', color: '#E2E8F0', lineHeight: '1.6' }}>
            {aiRisultato}
          </div>
        )}

        {/* Legenda */}
        <div style={{ marginTop: 'auto', fontSize: '10px', color: '#64748B' }}>
          <div style={{ marginBottom: '6px', fontWeight: 'bold', color: '#94A3B8' }}>Legenda ruoli</div>
          {[['Por', '#F59E0B'], ['DC/DD/DS', '#3B82F6'], ['M/C', '#22C55E'], ['T/A/W', '#06B6D4'], ['PC', '#EF4444']].map(([label, color]) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: color }} />
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
