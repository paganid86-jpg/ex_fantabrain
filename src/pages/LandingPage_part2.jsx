import { useState } from 'react';

/* ─────────────────────────────────────────────
   1. PricingSection
───────────────────────────────────────────── */
export function PricingSection() {
  const [annual, setAnnual] = useState(true);

  const freeFeatures = [
    { icon: '✓', text: 'Gestione lega completa' },
    { icon: '✓', text: 'Voti live & classifica' },
    { icon: '✓', text: 'News calciatori' },
    { icon: '■', text: 'Statistiche base (gol, assist, voti)' },
    { icon: '■', text: 'Confronto calciatori: 1/settimana' },
    { icon: '■', text: 'Consiglio rosa: 1/settimana' },
    { icon: '■', text: 'Scambio AI: 1/mese' },
  ];

  const silverFeatures = [
    { icon: '✓', text: 'Tutto il piano Free' },
    { icon: '✓', text: 'Statistiche complete (xG, xA, heatmap, forma)' },
    { icon: '✓', text: 'Confronto calciatori: 2/settimana' },
    { icon: '✓', text: 'Consiglio rosa: 3/settimana' },
    { icon: '✓', text: 'Scambio AI: 3/mese' },
    { icon: '✗', text: 'Analisi predittiva ML' },
    { icon: '✗', text: 'Asta Planner AI' },
    { icon: '✗', text: 'Formazione AI settimanale' },
  ];

  const goldFeatures = [
    { icon: '✓', text: 'Tutto il piano Silver' },
    { icon: '✓', text: 'Statistiche ML predittiva (esclusivo)' },
    { icon: '✓', text: 'Confronto calciatori: illimitato' },
    { icon: '✓', text: 'Consiglio rosa: illimitato' },
    { icon: '✓', text: 'Scambio AI: illimitato' },
    { icon: '✓', text: 'Asta Planner AI (esclusivo)' },
    { icon: '✓', text: 'Formazione AI settimanale' },
    { icon: '✓', text: 'Creazione rosa AI (esclusivo)' },
    { icon: '✓', text: 'Accesso anticipato beta' },
    { icon: '✓', text: 'Supporto prioritario Gold' },
  ];

  function getIconClass(icon) {
    if (icon === '✓') return 'pricing-feature--check';
    if (icon === '✗') return 'pricing-feature--cross';
    return 'pricing-feature--partial';
  }

  return (
    <section className="pricing-section section reveal" id="prezzi">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">Scegli il tuo piano</h2>
        </div>

        <div className="pricing-toggle-wrapper">
          <button
            className={`pricing-toggle-btn${!annual ? ' pricing-toggle-btn--active' : ''}`}
            onClick={() => setAnnual(false)}
            type="button"
          >
            Mensile
          </button>
          <button
            className={`pricing-toggle-btn${annual ? ' pricing-toggle-btn--active' : ''}`}
            onClick={() => setAnnual(true)}
            type="button"
          >
            Annuale — risparmi fino a €31
          </button>
        </div>

        <div className="pricing-cards-grid">

          {/* FREE */}
          <div className="pricing-card">
            <div className="pricing-card__header">
              <h3 className="pricing-card__title">Free</h3>
              <div className="pricing-card__price">€0 <span className="pricing-card__period">/ sempre</span></div>
            </div>
            <ul className="pricing-features-list">
              {freeFeatures.map((f, i) => (
                <li key={i} className={`pricing-feature ${getIconClass(f.icon)}`}>
                  <span className="pricing-feature__icon" aria-hidden="true">{f.icon}</span>
                  <span>{f.text}</span>
                </li>
              ))}
            </ul>
            <div className="pricing-card__footer">
              <button className="btn btn--outlined" type="button">Inizia gratis</button>
              <p className="pricing-card__note">Sempre gratis, nessuna carta</p>
            </div>
          </div>

          {/* SILVER */}
          <div className="pricing-card pricing-card--silver">
            <div className="pricing-card__header">
              <h3 className="pricing-card__title">🥈 Silver</h3>
              <div className="pricing-card__price">
                {annual ? (
                  <>
                    €3,99 <span className="pricing-card__period">/mese</span>
                    <div className="pricing-card__annual-note">€47,90/anno</div>
                  </>
                ) : (
                  <>€4,99 <span className="pricing-card__period">/mese</span></>
                )}
              </div>
              {annual && (
                <span className="pricing-badge pricing-badge--savings">Risparmi €12</span>
              )}
            </div>
            <ul className="pricing-features-list">
              {silverFeatures.map((f, i) => (
                <li key={i} className={`pricing-feature ${getIconClass(f.icon)}`}>
                  <span className="pricing-feature__icon" aria-hidden="true">{f.icon}</span>
                  <span>{f.text}</span>
                </li>
              ))}
            </ul>
            <div className="pricing-card__footer">
              <button className="btn btn--outlined btn--silver" type="button">Prova Silver</button>
            </div>
          </div>

          {/* GOLD */}
          <div className="pricing-card pricing-card--gold">
            <div className="pricing-card__badges">
              <span className="pricing-badge pricing-badge--popular">Più scelto</span>
              <span className="pricing-badge pricing-badge--complete">Più completo</span>
            </div>
            <div className="pricing-card__header">
              <h3 className="pricing-card__title">🏆 Gold</h3>
              <div className="pricing-card__price">
                {annual ? (
                  <>
                    €10,39 <span className="pricing-card__period">/mese</span>
                    <div className="pricing-card__annual-note">€124,70/anno</div>
                  </>
                ) : (
                  <>€12,99 <span className="pricing-card__period">/mese</span></>
                )}
              </div>
              {annual && (
                <span className="pricing-badge pricing-badge--savings">Risparmi €31</span>
              )}
            </div>
            <ul className="pricing-features-list">
              {goldFeatures.map((f, i) => (
                <li key={i} className={`pricing-feature ${getIconClass(f.icon)}`}>
                  <span className="pricing-feature__icon" aria-hidden="true">{f.icon}</span>
                  <span>{f.text}</span>
                </li>
              ))}
            </ul>
            <div className="pricing-card__footer">
              <button className="btn btn--gold" type="button">Scegli Gold</button>
            </div>
          </div>

        </div>

        <p className="pricing-disclaimer">
          Disdici in qualsiasi momento · Nessun vincolo · Prezzi IVA inclusa
        </p>
        <p className="pricing-all-plans-note">
          Tutti i piani includono banner non invasivi.
        </p>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   2. StatsSection (was: SocialProofSection)
───────────────────────────────────────────── */
export function StatsSection() {
  const stats = [
    { value: '#1', label: 'App fantacalcio con Coach AI in Italia' },
    { value: '1.200+', label: "Fantallenatori in lista d'attesa" },
    { value: '4.9★', label: 'Valutazione dai beta tester' },
    { value: '18%', label: 'Miglioramento medio punteggio' },
  ];

  return (
    <section className="landing-stats section reveal" id="recensioni">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">I numeri parlano chiaro</h2>
        </div>
        <div className="stats-row" role="list">
          {stats.map((s, i) => (
            <div key={i} className="stat-item reveal" role="listitem">
              <span className="stat-value grad-text">{s.value}</span>
              <span className="stat-label">{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   3. FAQSection
───────────────────────────────────────────── */
export function FAQSection() {
  const [openIndex, setOpenIndex] = useState([0, 1]);

  const faqs = [
    {
      q: 'Funziona anche per la mia lega classica con il voto di fantacalcio.it?',
      a: 'Sì, Fanta Brain supporta tutte le leghe Mantra e Classic. Basta inserire la tua lega al momento della registrazione e il Coach si adatta al tuo sistema di punteggio.',
    },
    {
      q: 'Il Coach AI è davvero utile o è solo marketing?',
      a: 'Il Coach analizza dati reali: xG, xA, statistiche di forma, infortuni confermati, moduli avversari. Nei test beta, gli utenti che hanno seguito i consigli hanno migliorato il loro punteggio medio del 18% nelle giornate analizzate.',
    },
    {
      q: "Posso disdire l'abbonamento quando voglio?",
      a: 'Assolutamente sì. Nessun vincolo, nessuna penale. Puoi disdire in qualsiasi momento direttamente dal tuo profilo. Il piano Free rimane sempre gratuito.',
    },
    {
      q: 'Qual è la differenza principale tra Silver e Gold?',
      a: "Gold aggiunge l'analisi predittiva ML, l'Asta Planner AI per gestire il mercato, la creazione rosa AI e i consigli di formazione settimanali illimitati. Se sei serio nella tua lega, Gold è il piano giusto.",
    },
    {
      q: 'I consigli sono personalizzati per la mia rosa o sono generici?',
      a: "Sono completamente personalizzati. Il Coach conosce la tua rosa, i tuoi titolari abituali, il tuo modulo preferito e l'avversario della settimana. Ogni consiglio è specifico per la tua situazione.",
    },
    {
      q: 'Funziona anche per la Champions League?',
      a: 'Non ancora — ma è nella nostra roadmap per la stagione 2025/26. Per ora Fanta Brain è ottimizzato per la Serie A. Ti avviseremo non appena sarà disponibile.',
    },
  ];

  function toggle(index) {
    setOpenIndex((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  }

  return (
    <section className="faq-section section reveal" id="faq">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">Domande frequenti</h2>
        </div>
        <div className="faq-list">
          {faqs.map((faq, i) => {
            const isOpen = openIndex.includes(i);
            return (
              <div
                key={i}
                className={`faq-item${isOpen ? ' faq-item--open' : ''}`}
              >
                <button
                  className="faq-item__question"
                  onClick={() => toggle(i)}
                  type="button"
                  aria-expanded={isOpen}
                >
                  <span>{faq.q}</span>
                  <span
                    className="faq-item__arrow"
                    aria-hidden="true"
                    style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s ease' }}
                  >
                    ▼
                  </span>
                </button>
                <div
                  className="faq-item__answer"
                  style={{
                    maxHeight: isOpen ? '400px' : '0',
                    overflow: 'hidden',
                    transition: 'max-height 0.35s ease',
                  }}
                >
                  <p>{faq.a}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   4. WaitlistForm
───────────────────────────────────────────── */
export function WaitlistForm({ position = 'hero' }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [modalita, setModalita] = useState('mantra');
  const [codiceAmico, setCodiceAmico] = useState('');
  const [gdpr, setGdpr] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function validate() {
    if (!email.trim()) return 'Inserisci la tua email.';
    if (!EMAIL_REGEX.test(email.trim())) return "Inserisci un'email valida.";
    if (!gdpr) return 'Devi accettare la Privacy Policy per continuare.';
    return null;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      // TODO: sostituire con endpoint reale (Brevo/Mailchimp)
      await new Promise((resolve) => setTimeout(resolve, 800));

      window.gtag?.('event', 'form_submit', {
        event_category: 'Form',
        event_label: position,
        modalita,
      });
      window.fbq?.('track', 'Lead');
      window.ttq?.track?.('SubmitForm');

      setSubmitted(true);
    } catch {
      setError('Ops! Qualcosa è andato storto. Riprova.');
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="waitlist-form waitlist-form--success" role="alert">
        <p className="waitlist-form__success-message">
          ✅ Sei dentro! Ti avvisiamo non appena Fanta Brain è disponibile.
        </p>
      </div>
    );
  }

  return (
    <form
      className={`waitlist-form waitlist-form--${position}`}
      onSubmit={handleSubmit}
      noValidate
    >
      <div className="waitlist-form__fields">
        <input
          className="waitlist-form__input"
          type="text"
          placeholder="Nome (opzionale)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="given-name"
          disabled={loading}
        />
        <input
          className="waitlist-form__input"
          type="email"
          placeholder="La tua email per accedere in anteprima"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          required
          disabled={loading}
        />
      </div>

      <div className="waitlist-form__modalita">
        <span className="waitlist-form__modalita-label">Modalità</span>
        <div className="waitlist-form__modalita-pills">
          <button
            type="button"
            className={`waitlist-form__pill${modalita === 'mantra' ? ' waitlist-form__pill--active' : ''}`}
            onClick={() => setModalita('mantra')}
            disabled={loading}
          >
            Mantra
          </button>
          <button
            type="button"
            className={`waitlist-form__pill${modalita === 'classica' ? ' waitlist-form__pill--active' : ''}`}
            onClick={() => setModalita('classica')}
            disabled={loading}
          >
            Classica
          </button>
        </div>
      </div>

      <input
        className="waitlist-form__input"
        type="text"
        placeholder="Codice amico (opzionale)"
        value={codiceAmico}
        onChange={(e) => setCodiceAmico(e.target.value)}
        disabled={loading}
      />

      <label className="waitlist-form__gdpr">
        <input
          type="checkbox"
          checked={gdpr}
          onChange={(e) => setGdpr(e.target.checked)}
          disabled={loading}
        />
        <span>
          Ho letto e accetto la{' '}
          <a href="/privacy" className="waitlist-form__link">
            Privacy Policy
          </a>
          . Acconsento al trattamento dei dati per ricevere aggiornamenti su Fanta Brain.
        </span>
      </label>

      {error && (
        <p className="waitlist-form__error" role="alert">
          {error}
        </p>
      )}

      <button
        className="btn btn--primary btn--full-width waitlist-form__submit"
        type="submit"
        disabled={loading}
      >
        {loading ? 'Iscrizione in corso…' : "Mettiti in lista d'attesa →"}
      </button>
    </form>
  );
}

/* ─────────────────────────────────────────────
   5. SecondCTASection
───────────────────────────────────────────── */
export function SecondCTASection({ WaitlistFormComponent }) {
  const FormToRender = WaitlistFormComponent || WaitlistForm;

  return (
    <section className="second-cta-section section reveal" id="iscriviti">
      <div className="container">
        <div className="second-cta-panel">
          <h2 className="second-cta-section__headline">
            <span className="grad-text">Entra in lista ora.</span>
          </h2>
          <p className="second-cta-section__subheadline">
            Unisciti ai 1.200+ fantallenatori che hanno già scelto il Coach AI.
          </p>

          <FormToRender position="footer" />

          <p className="second-cta-section__reassurance">
            <span aria-hidden="true">🛡️</span>{' '}
            Gratis per sempre. Nessuna carta richiesta.
          </p>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   6. LandingFooter
───────────────────────────────────────────── */
export function LandingFooter() {
  return (
    <footer className="landing-footer" role="contentinfo">
      <div className="container">
        <div className="landing-footer__top">
          <div className="landing-footer__brand">
            <span className="landing-footer__logo">Fanta Brain</span>
            <p className="landing-footer__tagline">
              Il primo Coach AI per il fantacalcio italiano
            </p>
          </div>

          <nav className="landing-footer__links" aria-label="Link footer">
            <a href="/privacy" className="landing-footer__link">Privacy Policy</a>
            <span className="landing-footer__separator" aria-hidden="true">|</span>
            <a href="/termini" className="landing-footer__link">Termini di Servizio</a>
            <span className="landing-footer__separator" aria-hidden="true">|</span>
            <a href="/contatti" className="landing-footer__link">Contatti</a>
          </nav>
        </div>

        <div className="landing-footer__middle">
          <a
            href="mailto:info@fantabrain.it"
            className="landing-footer__email"
            aria-label="Invia email a Fanta Brain"
          >
            info@fantabrain.it
          </a>
          <p className="landing-footer__pricing-note">
            Prezzi IVA inclusa — disdici in qualsiasi momento
          </p>
        </div>

        <div className="landing-footer__bottom">
          <p className="landing-footer__copyright">
            © 2025 Fanta Brain — Tutti i diritti riservati
          </p>
          <p className="landing-footer__disclaimer">
            Fanta Brain non è affiliata con la Lega Serie A o fantacalcio.it
          </p>
        </div>
      </div>
    </footer>
  );
}
