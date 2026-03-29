/**
 * Fanta Brain — Landing Page
 * Marketing landing page for waitlist conversion
 * Mobile-first · Dark theme · Green CTA
 *
 * Tracking placeholders:
 *   GA4 Measurement ID:   G-XXXXXXXXXX  (replace in index.html)
 *   Meta Pixel ID:        XXXXXXXXXX    (replace in index.html)
 *   TikTok Pixel ID:      XXXXXXXXXX    (replace in index.html)
 *
 * Form integration: swap mock fetch in WaitlistForm for
 *   Mailchimp / Brevo / ActiveCampaign API endpoint
 */

import { useEffect, useState } from 'react';
import './LandingPage.css';

import { LandingNav, HeroSection, ProblemSection, DemoSection } from './LandingPage_part1';
import {
  PricingSection,
  SocialProofSection,
  FAQSection,
  WaitlistForm,
  SecondCTASection,
  LandingFooter,
} from './LandingPage_part2';
import { SpiralAnimation } from '../components/ui/SpiralAnimation';
import { SpiralGate } from '../components/ui/SpiralGate';

/* ─── Scroll-reveal hook ───────────────────────────── */
function useScrollReveal() {
  useEffect(() => {
    const elements = document.querySelectorAll('.landing .reveal');
    if (!elements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}

/* ─── Scroll-depth tracker ─────────────────────────── */
function useScrollDepth() {
  useEffect(() => {
    const milestones = new Set();
    const targets = [25, 50, 75, 100];

    function onScroll() {
      const scrolled = window.scrollY;
      const total = document.documentElement.scrollHeight - window.innerHeight;
      if (total <= 0) return;
      const pct = Math.round((scrolled / total) * 100);

      targets.forEach((t) => {
        if (pct >= t && !milestones.has(t)) {
          milestones.add(t);
          window.gtag?.('event', 'scroll_depth', {
            event_category: 'Scroll',
            event_label: `${t}%`,
            value: t,
          });
        }
      });
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
}

/* ─── Spiral fade on scroll ────────────────────────── */
function useSpiralFade(hasEntered) {
  const [faded, setFaded] = useState(false);

  useEffect(() => {
    if (!hasEntered) return;

    function onScroll() {
      const scrolled = window.scrollY;
      const total = document.documentElement.scrollHeight - window.innerHeight;
      if (total <= 0) return;
      const pct = (scrolled / total) * 100;
      setFaded(pct >= 60);
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [hasEntered]);

  return faded;
}

/* ─── Waitlist Section wrapper (with form) ─────────── */
function WaitlistSection() {
  return (
    <section className="section" id="waitlist" aria-label="Iscrizione lista d'attesa">
      <div className="container">
        <div
          style={{
            background: 'rgba(34, 197, 94, 0.05)',
            border: '1px solid rgba(34, 197, 94, 0.20)',
            borderRadius: 20,
            padding: '48px 32px',
            maxWidth: 560,
            margin: '0 auto',
            textAlign: 'center',
          }}
        >
          <h2
            style={{
              fontFamily: "'Syne', sans-serif",
              fontSize: 32,
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              color: 'var(--text-primary)',
              marginBottom: 8,
            }}
          >
            Accedi in anteprima
          </h2>
          <p
            style={{
              fontSize: 16,
              color: 'var(--text-secondary)',
              marginBottom: 28,
              lineHeight: 1.6,
            }}
          >
            Iscriviti alla lista d'attesa — gratis, nessuna carta richiesta.
          </p>
          <WaitlistForm position="hero" />
        </div>
      </div>
    </section>
  );
}

/* ─── Main LandingPage component ───────────────────── */
export default function LandingPage() {
  useScrollReveal();
  useScrollDepth();

  const [hasEntered, setHasEntered] = useState(false);
  const spiralFaded = useSpiralFade(hasEntered);

  const spiralClass = [
    'spiral-bg',
    hasEntered ? 'spiral-bg--active' : '',
    spiralFaded ? 'spiral-bg--faded' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="landing">
      {/* ── Spiral — sempre montata, CSS gestisce visibilità ── */}
      <div className={spiralClass}>
        <SpiralAnimation />
      </div>

      {/* ── Gate overlay — solo il bottone "Entra →" ── */}
      {!hasEntered && (
        <SpiralGate onEnter={() => setHasEntered(true)} />
      )}

      {/* ── Contenuto landing — emerge dopo il click ── */}
      <div className={`landing-content${hasEntered ? ' landing-content--visible' : ''}`}>
        {/* 1 — Sticky nav */}
        <LandingNav />

        <main>
          {/* 2 — Hero */}
          <HeroSection />

          {/* 3 — Problem */}
          <ProblemSection />

          {/* 4 — Demo / Coach AI Mockup */}
          <DemoSection />

          {/* 5 — Pricing */}
          <PricingSection />

          {/* 6 — Social Proof */}
          <SocialProofSection />

          {/* 7 — FAQ */}
          <FAQSection />

          {/* 8 — Waitlist form (hero anchor #waitlist) */}
          <WaitlistSection />

          {/* 9 — Second CTA */}
          <SecondCTASection />
        </main>

        {/* 10 — Footer */}
        <LandingFooter />
      </div>
    </div>
  );
}
