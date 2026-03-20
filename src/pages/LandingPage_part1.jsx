import { useState, useEffect, useRef } from 'react';

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
    document.getElementById('waitlist')?.scrollIntoView({ behavior: 'smooth' });
    // Track CTA click
    window.gtag?.('event', 'cta_click', { event_category: 'CTA', event_label: 'nav' });
  }

  return (
    <nav className={`landing-nav${scrolled ? ' scrolled' : ''}`} role="navigation" aria-label="Navigazione principale">
      <div className="landing-nav__inner">
        <a href="/" className="landing-nav__logo" aria-label="Fanta Brain - Homepage">
          <div className="landing-nav__logo-icon" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="M10 2L13 8H19L14 12L16 18L10 14L4 18L6 12L1 8H7L10 2Z" fill="white" fillOpacity="0.9"/>
            </svg>
          </div>
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
  const heroRef = useRef(null);

  function scrollToWaitlist(e) {
    e.preventDefault();
    document.getElementById('waitlist')?.scrollIntoView({ behavior: 'smooth' });
    window.gtag?.('event', 'cta_click', { event_category: 'CTA', event_label: 'hero' });
    window.fbq?.('track', 'InitiateCheckout');
  }

  return (
    <section className="landing-hero" id="hero" ref={heroRef} aria-label="Hero">
      {/* Decorative background */}
      <div className="landing-hero__bg" aria-hidden="true">
        <div className="landing-hero__bg-gradient" />
        {/* Subtle football field lines SVG */}
        <svg
          style={{
            position: 'absolute',
            bottom: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: '900px',
            maxWidth: '100%',
            opacity: 0.04,
            pointerEvents: 'none',
          }}
          viewBox="0 0 900 500"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect x="50" y="30" width="800" height="440" rx="4" stroke="white" strokeWidth="2"/>
          <line x1="450" y1="30" x2="450" y2="470" stroke="white" strokeWidth="2"/>
          <circle cx="450" cy="250" r="80" stroke="white" strokeWidth="2"/>
          <rect x="50" y="150" width="120" height="200" stroke="white" strokeWidth="2"/>
          <rect x="730" y="150" width="120" height="200" stroke="white" strokeWidth="2"/>
          <rect x="50" y="190" width="50" height="120" stroke="white" strokeWidth="2"/>
          <rect x="800" y="190" width="50" height="120" stroke="white" strokeWidth="2"/>
          <circle cx="450" cy="250" r="4" fill="white"/>
          <circle cx="170" cy="250" r="4" fill="white"/>
          <circle cx="730" cy="250" r="4" fill="white"/>
        </svg>
      </div>

      <div className="container">
        <div className="landing-hero__content">
          {/* Badge */}
          <div className="landing-badge" role="note">
            🏆 La prima super-app italiana di fantacalcio
          </div>

          {/* Headline */}
          <h1 className="landing-hero__headline">
            Il primo fanta<br />
            con un <em>Coach AI</em>.<br />
            Gli altri giocano a caso.
          </h1>

          {/* Subheadline */}
          <p className="landing-hero__subheadline">
            Smetti di perdere la lega per un'intuizione sbagliata.
            Il Coach AI analizza statistiche, infortuni e form —
            e ti dice chi schierare.
          </p>

          {/* CTA */}
          <div className="landing-hero__cta-group">
            <button
              className="btn btn--primary btn--hero"
              onClick={scrollToWaitlist}
              aria-label="Iscriviti alla lista d'attesa"
            >
              Mettiti in lista d'attesa
            </button>
          </div>

          {/* Social proof counter */}
          <div className="hero-counter" aria-label="1.200+ fantallenatori già iscritti">
            <span aria-hidden="true">⚡</span>
            <span className="hero-counter__number">1.200+</span>
            <span>fantallenatori già iscritti</span>
          </div>

          {/* Stats row */}
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
   3. ProblemSection — pain / problem
───────────────────────────────────────────── */
export function ProblemSection() {
  return (
    <section className="landing-problem section reveal" id="problema">
      <div className="container">
        <h2 className="section-title">Perché perdi la lega ogni anno</h2>

        <p className="problem-lead">Ogni settimana ci perdi ore.</p>
        <p className="problem-body">
          Analizzi statistiche, guardi i pronostici, chiedi consiglio agli amici —
          e poi ti penti lo stesso.
        </p>

        <div className="problem-cards" role="list">
          <div className="problem-card reveal" role="listitem">
            <div className="problem-card__icon" aria-hidden="true">⏰</div>
            <h3 className="problem-card__title">Ore perse</h3>
            <p className="problem-card__desc">Analisi manuali che non finiscono mai</p>
          </div>
          <div className="problem-card reveal" role="listitem">
            <div className="problem-card__icon" aria-hidden="true">❌</div>
            <h3 className="problem-card__title">Intuizioni sbagliate</h3>
            <p className="problem-card__desc">
              Quel centrocampista che schieri sempre... e segna quando è in panchina
            </p>
          </div>
          <div className="problem-card reveal" role="listitem">
            <div className="problem-card__icon" aria-hidden="true">📊</div>
            <h3 className="problem-card__title">Informazioni sparse</h3>
            <p className="problem-card__desc">
              Infortuni, squalifiche, moduli — impossibile seguire tutto
            </p>
          </div>
        </div>

        <p className="problem-solution">
          Fanta Brain mette fine alla roulette:{' '}
          <strong>il Coach AI studia i dati al posto tuo</strong>{' '}
          e ti dice chi schierare, chi lasciare in panchina e chi prendere al mercato.
        </p>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   4. DemoSection — Coach AI mockup
───────────────────────────────────────────── */
export function DemoSection() {
  return (
    <section className="landing-demo section reveal" id="demo" aria-label="Demo Coach AI">
      <div className="container">
        <h2 className="section-title">Il Coach AI in azione</h2>
        <p className="section-subtitle">Consigli precisi, in tempo reale, sulla tua rosa</p>

        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div className="coach-mockup-wrapper reveal">
            {/* Glow effect */}
            <div className="coach-mockup-glow" aria-hidden="true" />

            {/* Mockup card */}
            <div className="coach-mockup" role="img" aria-label="Interfaccia Coach AI con consiglio su Vlahovic">
              {/* Header */}
              <div className="coach-mockup__header">
                <span className="coach-mockup__title">
                  <span className="coach-mockup__dot" aria-hidden="true" />
                  Coach AI
                </span>
                <span style={{ fontSize: 12, color: 'var(--accent-primary)', fontFamily: "'Syne', sans-serif", letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  LIVE
                </span>
              </div>
              <div className="coach-mockup__giornata">Giornata 28 — Serie A</div>

              {/* Player 1 — SCHIERA */}
              <div className="coach-player-card">
                <div className="coach-player-card__top">
                  <span className="coach-player-name">
                    D. Vlahovic
                    <span className="coach-player-number">#9</span>
                  </span>
                  <span className="coach-status-badge coach-status-badge--play">
                    ✓ SCHIERA
                  </span>
                </div>
                <p className="coach-ai-text">
                  3 gol nelle ultime 4 gare. Avversario (Frosinone) 17° difesa in trasferta. Forma eccellente.
                </p>
                <div className="confidence-bar" aria-label="Fiducia AI: 87%">
                  <span className="confidence-bar__label">Fiducia AI</span>
                  <div className="confidence-bar__track" aria-hidden="true">
                    <div className="confidence-bar__fill" style={{ width: '87%' }} />
                  </div>
                  <span className="confidence-bar__pct">87%</span>
                </div>
                <button className="coach-apply-btn" type="button">
                  Applica consiglio
                </button>
              </div>

              {/* Player 2 — PANCHINA */}
              <div className="coach-player-card coach-player-card--bench">
                <div className="coach-player-card__top">
                  <span className="coach-player-name">
                    R. Leão
                    <span className="coach-player-number">#17</span>
                  </span>
                  <span className="coach-status-badge coach-status-badge--bench">
                    ⚠ PANCHINA
                  </span>
                </div>
                <p className="coach-ai-text">
                  Partita difficile, forma in calo — rischio basso rendimento.
                </p>
                <div className="confidence-bar" aria-label="Fiducia AI: 71%">
                  <span className="confidence-bar__label">Fiducia AI</span>
                  <div className="confidence-bar__track" aria-hidden="true">
                    <div className="confidence-bar__fill confidence-bar__fill--amber" style={{ width: '71%' }} />
                  </div>
                  <span className="confidence-bar__pct confidence-bar__pct--amber">71%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <p className="demo-caption">
          Il Coach analizza xG, xA, infortuni, forma e modulo avversario —
          e ti dice cosa fare.
        </p>
      </div>
    </section>
  );
}
