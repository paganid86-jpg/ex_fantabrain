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

import { LandingNav, HeroSection, FeatureSection, HowItWorksSection } from './LandingPage_part1';
import {
  PricingSection,
  StatsSection,
  FAQSection,
  WaitlistForm,
  SecondCTASection,
  LandingFooter,
} from './LandingPage_part2';
import { SpiralAnimation } from '../components/ui/SpiralAnimation';
import { SpiralGate } from '../components/ui/SpiralGate';

/* ─── Scroll-reveal hook ───────────────────────────── */
function useScrollReveal(active) {
  useEffect(() => {
    if (!active) return;
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
  }, [active]);
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

/* ─── Spiral fade — 3s timer after enter ───────────── */
function useSpiralFade(hasEntered) {
  const [faded, setFaded] = useState(false);

  useEffect(() => {
    if (!hasEntered) return;
    const timer = setTimeout(() => setFaded(true), 3000);
    return () => clearTimeout(timer);
  }, [hasEntered]);

  return faded;
}


/* ─── Main LandingPage component ───────────────────── */
export default function LandingPage() {
  useScrollDepth();

  const [hasEntered, setHasEntered] = useState(false);
  useScrollReveal(hasEntered);
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

          {/* 3 — Feature / Problem */}
          <FeatureSection />

          {/* 4 — How It Works */}
          <HowItWorksSection />

          {/* 5 — Pricing */}
          <PricingSection />

          {/* 6 — Social Proof */}
          <StatsSection />

          {/* 7 — FAQ */}
          <FAQSection />

          {/* 8 — Second CTA */}
          <SecondCTASection />
        </main>

        {/* 10 — Footer */}
        <LandingFooter />
      </div>
    </div>
  );
}
