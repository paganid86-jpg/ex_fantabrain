import { useState, useEffect } from 'react';

/* ─────────────────────────────────────────────
   1. LandingNav — sticky navbar
───────────────────────────────────────────── */
export function LandingNav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 20);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  function scrollToWaitlist(e) {
    e.preventDefault();
    document.getElementById('iscriviti')?.scrollIntoView({ behavior: 'smooth' });
    window.gtag?.('event', 'cta_click', { event_category: 'CTA', event_label: 'nav' });
  }

  return (
    <nav className={`landing-nav${scrolled ? ' scrolled' : ''}`} role="navigation" aria-label="Navigazione principale">
      <div className="landing-nav__inner">
        <a href="/" className="landing-nav__logo" aria-label="Fanta Brain - Homepage">
          <div className="landing-nav__logo-dot" aria-hidden="true" />
          <span className="landing-nav__logo-text">
            Fanta<span>Brain</span>
          </span>
        </a>

        <button
          className="btn btn--primary btn--nav"
          onClick={scrollToWaitlist}
          aria-label="Inizia gratis — vai alla lista d'attesa"
        >
          Inizia gratis
        </button>
      </div>
    </nav>
  );
}

/* ─────────────────────────────────────────────
   2. HeroSection — above the fold
───────────────────────────────────────────── */
export function HeroSection() {
  function scrollToWaitlist(e) {
    e.preventDefault();
    document.getElementById('iscriviti')?.scrollIntoView({ behavior: 'smooth' });
    window.gtag?.('event', 'cta_click', { event_category: 'CTA', event_label: 'hero' });
    window.fbq?.('track', 'InitiateCheckout');
  }

  return (
    <section className="landing-hero" id="hero" aria-label="Hero">
      <div className="landing-hero__bg" aria-hidden="true">
        <div className="landing-hero__bg-gradient" />
      </div>

      <div className="container">
        <div className="landing-hero__content">
          <div className="landing-badge" role="note">
            🏆 La prima super-app italiana di fantacalcio
          </div>

          <h1 className="landing-hero__headline">
            Il primo fanta<br />
            con un <em><span className="grad-text">Coach AI</span></em>.<br />
            Gli altri giocano a caso.
          </h1>

          <p className="landing-hero__subheadline">
            Smetti di perdere la lega per un&apos;intuizione sbagliata.
            Il Coach AI analizza statistiche, infortuni e form —
            e ti dice chi schierare.
          </p>

          <div className="landing-hero__cta-group">
            <button
              className="btn btn--primary btn--hero"
              onClick={scrollToWaitlist}
              aria-label="Iscriviti alla lista d'attesa"
            >
              Mettiti in lista d&apos;attesa
            </button>
          </div>

          <div className="hero-counter" aria-label="1.200+ fantallenatori già iscritti">
            <span aria-hidden="true">⚡</span>
            <span className="hero-counter__number">1.200+</span>
            <span>fantallenatori già iscritti</span>
          </div>

          <div className="landing-hero__stats" role="list" aria-label="Funzionalità chiave" style={{ marginTop: 32 }}>
            <span className="landing-hero__stats-item" role="listitem">Analisi in tempo reale</span>
            <span className="landing-hero__stats-item" role="listitem">Consigli personalizzati</span>
            <span className="landing-hero__stats-item" role="listitem">Gratis per sempre</span>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   3. FeatureSection (was: ProblemSection)
───────────────────────────────────────────── */
export function FeatureSection() {
  return (
    <section className="landing-features section reveal" id="problema">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">Perché perdi la lega ogni anno</h2>
          <p className="section-subtitle">
            Ogni settimana ci perdi ore. Analizzi statistiche, guardi i pronostici —
            e poi ti penti lo stesso.
          </p>
        </div>

        <div className="feature-cards" role="list">
          <div className="feature-card reveal" role="listitem">
            <div className="feature-card__icon" aria-hidden="true">⏰</div>
            <h3 className="feature-card__title">Ore perse</h3>
            <p className="feature-card__desc">Analisi manuali che non finiscono mai</p>
          </div>
          <div className="feature-card reveal" role="listitem">
            <div className="feature-card__icon" aria-hidden="true">❌</div>
            <h3 className="feature-card__title">Intuizioni sbagliate</h3>
            <p className="feature-card__desc">
              Quel centrocampista che schieri sempre... e segna quando è in panchina
            </p>
          </div>
          <div className="feature-card reveal" role="listitem">
            <div className="feature-card__icon" aria-hidden="true">📊</div>
            <h3 className="feature-card__title">Informazioni sparse</h3>
            <p className="feature-card__desc">
              Infortuni, squalifiche, moduli — impossibile seguire tutto
            </p>
          </div>
        </div>

        <p className="feature-solution">
          Fanta Brain mette fine alla roulette:{' '}
          <strong>il Coach AI studia i dati al posto tuo</strong>{' '}
          e ti dice chi schierare, chi lasciare in panchina e chi prendere al mercato.
        </p>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   4. HowItWorksSection (was: DemoSection)
───────────────────────────────────────────── */
export function HowItWorksSection() {
  return (
    <section className="landing-how section reveal" id="demo" aria-label="Come funziona">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">
            Il modo più <span className="grad-text">semplice</span> per ottenere risultati{' '}
            <span className="grad-text">potenti</span>
          </h2>
          <p className="section-subtitle">Consigli precisi, in tempo reale, sulla tua rosa</p>
        </div>

        <div className="steps-row">
          <div className="step-item reveal">
            <div className="step-number" aria-hidden="true">1</div>
            <h3 className="step-title">Inserisci la tua rosa</h3>
            <p className="step-desc">
              Carica i tuoi giocatori in pochi secondi. Il Coach impara la tua lega e il tuo modulo.
            </p>
          </div>
          <div className="step-item reveal">
            <div className="step-number" aria-hidden="true">2</div>
            <h3 className="step-title">Il Coach analizza tutto</h3>
            <p className="step-desc">
              xG, xA, infortuni, forma e modulo avversario — ogni dato rilevante, ogni giornata.
            </p>
          </div>
          <div className="step-item reveal">
            <div className="step-number" aria-hidden="true">3</div>
            <h3 className="step-title">Schiera e vinci</h3>
            <p className="step-desc">
              Ricevi i consigli personalizzati e applica la formazione ottimale con un click.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
