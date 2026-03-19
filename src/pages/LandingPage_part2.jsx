import { useState, useEffect } from 'react';

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
        <h2 className="section-title">Scegli il tuo piano</h2>

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
   2. SocialProofSection
───────────────────────────────────────────── */
export function SocialProofSection() {
  const testimonials = [
    {
      quote:
        'Il Coach mi ha fatto schierare Lookman invece di Leao — ha fatto 12 punti. Ho vinto la giornata.',
      author: 'Marco R.',
      location: 'Milano',
      stars: 5,
    },
    {
      quote:
        'Finalmente smetto di perdere ore sui pronostici. Il Coach decide meglio di me.',
      author: 'Andrea F.',
      location: 'Roma',
      stars: 5,
    },
    {
      quote: 'Ho vinto la lega di ufficio per la prima volta in 5 anni.',
      author: 'Giulia T.',
      location: 'Torino',
      stars: 5,
    },
  ];

  return (
    <section className="social-proof-section section reveal" id="recensioni">
      <div className="container">
        <h2 className="section-title">Cosa dicono i fantallenatori</h2>

        <div className="social-proof-stats">
          <div className="social-proof-counter">
            <span className="social-proof-counter__number">1.200+</span>
            <span className="social-proof-counter__label">fantallenatori in lista d&apos;attesa</span>
          </div>
          <div className="social-proof-rating">
            <span className="social-proof-rating__stars" aria-label="5 stelle su 5">
              ★★★★★
            </span>
            <span className="social-proof-rating__label">4.9/5 dai beta tester</span>
          </div>
        </div>

        <div className="testimonials-grid">
          {testimonials.map((t, i) => (
            <div key={i} className="testimonial-card reveal">
              <p className="testimonial-card__quote">&ldquo;{t.quote}&rdquo;</p>
              <div className="testimonial-card__footer">
                <span className="testimonial-card__author">
                  — {t.author}, {t.location}
                </span>
                <span className="testimonial-card__stars" aria-label={`${t.stars} stelle`}>
                  {'⭐'.repeat(t.stars)}
                </span>
              </div>
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
      a: 'Sì, FantaAI supporta tutte le leghe Mantra e Classic. Basta inserire la tua lega al momento della registrazione e il Coach si adatta al tuo sistema di punteggio.',
    },
    {
      q: 'Il Coach AI è davvero utile o è solo marketing?',
      a: 'Il Coach analizza dati reali: xG, xA, statistiche di forma, infortuni confermati, moduli avversari. Nei test beta, gli utenti che hanno seguito i consigli hanno migliorato il loro punteggio medio del 18% nelle giornate analizzate.',
    },
    {
      q: 'Posso disdire l\'abbonamento quando voglio?',
      a: 'Assolutamente sì. Nessun vincolo, nessuna penale. Puoi disdire in qualsiasi momento direttamente dal tuo profilo. Il piano Free rimane sempre gratuito.',
    },
    {
      q: 'Qual è la differenza principale tra Silver e Gold?',
      a: 'Gold aggiunge l\'analisi predittiva ML, l\'Asta Planner AI per gestire il mercato, la creazione rosa AI e i consigli di formazione settimanali illimitati. Se sei serio nella tua lega, Gold è il piano giusto.',
    },
    {
      q: 'I consigli sono personalizzati per la mia rosa o sono generici?',
      a: 'Sono completamente personalizzati. Il Coach conosce la tua rosa, i tuoi titolari abituali, il tuo modulo preferito e l\'avversario della settimana. Ogni consiglio è specifico per la tua situazione.',
    },
    {
      q: 'Funziona anche per la Champions League?',
      a: 'Non ancora — ma è nella nostra roadmap per la stagione 2025/26. Per ora FantaAI è ottimizzato per la Serie A. Ti avviseremo non appena sarà disponibile.',
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
        <h2 className="section-title">Domande frequenti</h2>
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
  const [gdpr, setGdpr] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function validate() {
    if (!email.trim()) return 'Inserisci la tua email.';
    if (!EMAIL_REGEX.test(email.trim())) return 'Inserisci un\'email valida.';
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
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Analytics tracking
      window.gtag?.('event', 'form_submit', {
        event_category: 'Form',
        event_label: position,
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
          ✅ Sei dentro! Ti avvisiamo non appena FantaAI è disponibile.
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
          . Acconsento al trattamento dei dati per ricevere aggiornamenti su FantaAI.
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
        style={{ minHeight: '52px' }}
      >
        {loading ? 'Iscrizione in corso…' : 'Mettiti in lista d\'attesa →'}
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
        <div className="second-cta-panel glass-panel">
          <h2 className="second-cta-section__headline">
            Smetti di perdere la lega.
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
            <span className="landing-footer__logo">FantaAI</span>
            <p className="landing-footer__tagline">
              Il primo Coach AI per il fantacalcio italiano
            </p>
          </div>

          <nav className="landing-footer__links" aria-label="Link footer">
            <a href="/privacy" className="landing-footer__link">
              Privacy Policy
            </a>
            <span className="landing-footer__separator" aria-hidden="true">|</span>
            <a href="/termini" className="landing-footer__link">
              Termini di Servizio
            </a>
            <span className="landing-footer__separator" aria-hidden="true">|</span>
            <a href="/contatti" className="landing-footer__link">
              Contatti
            </a>
          </nav>
        </div>

        <div className="landing-footer__middle">
          <a
            href="mailto:info@fantaai.it"
            className="landing-footer__email"
            aria-label="Invia email a FantaAI"
          >
            info@fantaai.it
          </a>
          <p className="landing-footer__pricing-note">
            Prezzi IVA inclusa — disdici in qualsiasi momento
          </p>
        </div>

        <div className="landing-footer__bottom">
          <p className="landing-footer__copyright">
            © 2025 FantaAI — Tutti i diritti riservati
          </p>
          <p className="landing-footer__disclaimer">
            FantaAI non è affiliata con la Lega Serie A o fantacalcio.it
          </p>
        </div>
      </div>
    </footer>
  );
}
