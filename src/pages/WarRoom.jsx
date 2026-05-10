import { useState } from 'react';
import useAppStore from '../store/useAppStore';
import { warRoomAnalisi } from '../lib/claudeApi';
import ShareButton from '../components/warroom/ShareButton';

const LOADING_STEPS = [
  'Analizzando avversario...',
  'Valutando vantaggi...',
  'Generando piano tattico...',
];

export default function WarRoom() {
  const rosa = useAppStore((s) => s.rosa);
  const classifica = useAppStore((s) => s.classifica);
  const giornataCorrente = useAppStore((s) => s.giornataCorrente);
  const aiCrediti = useAppStore((s) => s.aiCrediti);

  const avversariLista = classifica.filter((team) => !team.isUser).map((team) => team.nome);
  const [avversario, setAvversario] = useState(avversariLista[0] || '');
  const [avversarioLibero, setAvversarioLibero] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [risultato, setRisultato] = useState(null);
  const [error, setError] = useState(null);

  const nomeAvversario = avversariLista.length > 0 ? avversario : avversarioLibero;
  const canLaunch = !loading && aiCrediti >= 3 && nomeAvversario.trim();

  async function lanciaAnalisi() {
    if (!nomeAvversario.trim()) return;
    setLoading(true);
    setError(null);
    setRisultato(null);
    setLoadingStep(0);

    try {
      setLoadingStep(0);
      const { analisiAvversario, vantaggi, pianoTattico } = await warRoomAnalisi(
        rosa,
        [],
        nomeAvversario,
        giornataCorrente,
      );
      setLoadingStep(2);
      setRisultato({ analisiAvversario, vantaggi, pianoTattico });
    } catch (err) {
      setError(`Analisi non disponibile: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  function salvaAnalisi() {
    if (risultato) {
      sessionStorage.setItem(
        `war-room-g${giornataCorrente}`,
        JSON.stringify({ avversario: nomeAvversario, risultato, timestamp: Date.now() }),
      );
    }
  }

  return (
    <div className="ops-page war-page">
      <section className="ops-hero war-hero">
        <div className="ops-hero__copy">
          <span className="lux-kicker">War Room</span>
          <h1>Piano partita.</h1>
          <p>
            Scegli l'avversario, lancia l'analisi e ottieni un piano tattico
            pronto per la giornata.
          </p>
        </div>
        <div className="ops-hero__mark" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
      </section>

      <section className="ops-stat-grid" aria-label="Sintesi War Room">
        <div className="ops-stat">
          <span>Giornata</span>
          <strong>{giornataCorrente}</strong>
          <small>matchday</small>
        </div>
        <div className="ops-stat">
          <span>Rosa</span>
          <strong>{rosa.length}</strong>
          <small>profili letti</small>
        </div>
        <div className="ops-stat">
          <span>Crediti AI</span>
          <strong>{aiCrediti}</strong>
          <small>ne servono 3</small>
        </div>
      </section>

      <section className="ops-panel war-config-panel">
        <div className="war-config-grid">
          <div>
            <label className="lux-kicker" htmlFor="war-opponent">Avversario</label>
            {avversariLista.length > 0 ? (
              <select
                id="war-opponent"
                className="input-field"
                value={avversario}
                onChange={(event) => {
                  setAvversario(event.target.value);
                  setRisultato(null);
                }}
              >
                {avversariLista.map((name) => <option key={name} value={name}>{name}</option>)}
              </select>
            ) : (
              <input
                id="war-opponent"
                className="input-field"
                placeholder="Nome avversario"
                value={avversarioLibero}
                onChange={(event) => {
                  setAvversarioLibero(event.target.value);
                  setRisultato(null);
                }}
              />
            )}
            {avversariLista.length === 0 && (
              <p className="ops-note">Aggiungi classifica per selezionare avversari dalla lista.</p>
            )}
          </div>

          <div className="war-launch-card">
            <span className="lux-kicker">Analisi privata</span>
            <button
              type="button"
              className="home-lux-hero__cta war-launch-btn"
              onClick={lanciaAnalisi}
              disabled={!canLaunch}
            >
              {loading ? 'Analizzando...' : 'Lancia analisi AI'}
            </button>
            {aiCrediti < 3 && <small>Crediti insufficienti per questa analisi.</small>}
          </div>
        </div>

        {rosa.length === 0 && (
          <div className="ops-error ops-error--info">
            Aggiungi giocatori per un'analisi personalizzata. Puoi comunque eseguire un'analisi generica.
          </div>
        )}

        {loading && (
          <div className="war-loading-steps">
            {LOADING_STEPS.map((step, index) => (
              <div key={step} className={index <= loadingStep ? 'is-active' : ''}>
                <span>{index + 1}</span>
                {step}
              </div>
            ))}
          </div>
        )}
      </section>

      {error && <div className="ops-error">{error}</div>}

      {risultato ? (
        <section className="war-result-section">
          <header className="ops-panel__header war-result-header">
            <div>
              <span className="lux-kicker">War Room - G{giornataCorrente}</span>
              <h2>vs {nomeAvversario}</h2>
            </div>
            <button type="button" onClick={salvaAnalisi} className="btn-secondary">Salva</button>
          </header>

          <div className="war-result-grid">
            {[
              { title: 'Analisi avversario', content: risultato.analisiAvversario, tone: 'blue' },
              { title: 'Vantaggi e rischi', content: risultato.vantaggi, tone: 'green' },
              { title: 'Piano tattico', content: risultato.pianoTattico, tone: 'gold' },
            ].map((section) => (
              <article key={section.title} className={`ops-panel war-result-card is-${section.tone}`}>
                <span className="lux-kicker">{section.title}</span>
                <p>{section.content}</p>
              </article>
            ))}
          </div>

          <ShareButton
            analysisText={[risultato.analisiAvversario, risultato.vantaggi, risultato.pianoTattico].join('\n\n---\n\n')}
            matchContext={{ avversario: nomeAvversario, giornata: giornataCorrente }}
          />
        </section>
      ) : (
        !loading && !error && (
          <section className="ops-empty war-empty">
            <span className="lux-kicker">Pronta al lancio</span>
            <h2>Seleziona l'avversario.</h2>
            <p>La War Room generera lettura avversario, vantaggi e piano tattico personalizzato.</p>
          </section>
        )
      )}
    </div>
  );
}
