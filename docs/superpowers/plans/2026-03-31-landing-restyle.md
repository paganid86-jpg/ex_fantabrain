# LandingPage React — Restyle Waiting List

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restyle `src/pages/LandingPage.jsx` to visually match `public/waiting-list.html` — same tokens, fonts, and component patterns — while keeping all existing content and logic.

**Architecture:** Replace `LandingPage.css` entirely with the waiting-list token system. Update JSX classNames and structure to match: ProblemSection → FeatureCards, DemoSection → HowItWorks (3 steps), SocialProofSection → StatsSection. Keep all routing/state logic untouched. Keep Spiral/Gate CSS at bottom of file.

**Tech Stack:** React 19, CSS custom properties, Plus Jakarta Sans + Outfit (Google Fonts)

---

## File Map

| File | Action |
|---|---|
| `index.html` | Replace fonts (Syne+DM Sans → Plus Jakarta Sans+Outfit) |
| `src/pages/LandingPage.css` | Full rewrite (keep Spiral/Gate block at bottom) |
| `src/pages/LandingPage_part1.jsx` | Nav dot, Hero grad-text, ProblemSection→FeatureSection, DemoSection→HowItWorksSection |
| `src/pages/LandingPage_part2.jsx` | SocialProofSection→StatsSection, SecondCTA grad-text, CSS classname cleanup |
| `src/pages/LandingPage.jsx` | Update renamed imports, WaitlistSection inline→class |

---

## Task 1: Google Fonts — Plus Jakarta Sans + Outfit

**Files:**
- Modify: `index.html:27-31`

- [ ] **Step 1: Replace the font link tag**

Find this block in `index.html`:
```html
    <!-- Fonts — Syne (display/headlines) + DM Sans (body) -->
    <link
      href="https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&display=swap"
      rel="stylesheet"
    />
```

Replace with:
```html
    <!-- Fonts — Plus Jakarta Sans (headings) + Outfit (body) -->
    <link
      href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Outfit:wght@400;500;600;700&display=swap"
      rel="stylesheet"
    />
```

- [ ] **Step 2: Verify build runs without errors**

Run: `npm run build`
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "style: replace fonts with Plus Jakarta Sans + Outfit"
```

---

## Task 2: LandingPage.css — Full Rewrite

**Files:**
- Modify: `src/pages/LandingPage.css` (full replace, keep Spiral/Gate block from line 1358 onward)

- [ ] **Step 1: Replace the CSS file**

Replace the ENTIRE file with the following. This preserves the Spiral/Gate/Content CSS at the bottom and replaces all other styles with the waiting-list token system.

```css
/* =====================================================
   FANTABRAIN — Landing Page CSS (Waiting List Style)
   ===================================================== */

/* ─── Tokens ──────────────────────────────────────── */
.landing {
  --bg: #080808;
  --surface: #111111;
  --surface-2: #181818;
  --border: rgba(255,255,255,0.06);
  --text: #f5f5f5;
  --text-muted: rgba(255,255,255,0.45);
  --green: #10b981;
  --indigo: #6366f1;
  --green-muted: rgba(16,185,129,0.12);

  font-family: 'Outfit', sans-serif;
  font-size: 16px;
  line-height: 1.6;
  color: var(--text);
  background-color: var(--bg);
  min-height: 100vh;
  overflow-x: hidden;
}

.landing *,
.landing *::before,
.landing *::after { box-sizing: border-box; }

.landing h1,
.landing h2,
.landing h3,
.landing h4 {
  font-family: 'Plus Jakarta Sans', sans-serif;
  line-height: 1.15;
}

/* ─── Container ──────────────────────────────────── */
.landing .container {
  width: 100%;
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 24px;
}

/* ─── Section base ───────────────────────────────── */
.landing .section { padding: 96px 0; }

.landing .section-header {
  text-align: center;
  margin-bottom: 56px;
}

.landing .section-label {
  display: inline-block;
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--green);
  margin-bottom: 12px;
}

.landing .section-title {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: clamp(1.8rem, 4vw, 2.6rem);
  font-weight: 800;
  color: var(--text);
  margin-bottom: 16px;
  text-align: center;
}

.landing .section-subtitle {
  font-size: 1.05rem;
  color: var(--text-muted);
  max-width: 520px;
  margin: 0 auto;
  line-height: 1.7;
  text-align: center;
}

/* ─── Scroll Reveal ──────────────────────────────── */
.landing .reveal {
  opacity: 0;
  transform: translateY(28px);
  transition: opacity 0.6s ease, transform 0.6s ease;
}
.landing .reveal.revealed {
  opacity: 1;
  transform: translateY(0);
}

/* ─── Gradient Text ──────────────────────────────── */
.landing .grad-text {
  background: linear-gradient(135deg, #10b981 0%, #6366f1 38%, #34d399 65%, #818cf8 100%);
  background-size: 300% 300%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: grad-flow 6s ease-in-out infinite;
}

@keyframes grad-flow {
  0%, 100% { background-position: 0% 50%; }
  50%       { background-position: 100% 50%; }
}

/* ─── Keyframes ──────────────────────────────────── */
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(32px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes glowPulse {
  0%, 100% { box-shadow: 0 0 16px rgba(16,185,129,0.30), 0 4px 24px rgba(0,0,0,0.4); }
  50%       { box-shadow: 0 0 32px rgba(16,185,129,0.55), 0 4px 24px rgba(0,0,0,0.4); }
}

/* ─── Buttons ────────────────────────────────────── */
.landing .btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: none;
  border-radius: 10px;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-weight: 700;
  font-size: 16px;
  cursor: pointer;
  padding: 14px 28px;
  transition: transform 0.15s ease, box-shadow 0.2s ease, opacity 0.15s;
  white-space: nowrap;
  text-decoration: none;
}
.landing .btn:active { transform: scale(0.97); }
.landing .btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

.landing .btn--primary {
  background: var(--green);
  color: #fff;
  animation: glowPulse 3s ease-in-out infinite;
}
.landing .btn--primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 0 36px rgba(16,185,129,0.5), 0 6px 28px rgba(0,0,0,0.4);
}

.landing .btn--outlined {
  background: transparent;
  color: var(--text);
  border: 1px solid var(--border);
}
.landing .btn--outlined:hover {
  border-color: rgba(255,255,255,0.3);
  transform: translateY(-1px);
}

.landing .btn--silver {
  border: 1px solid rgba(255,255,255,0.15);
  background: transparent;
  color: var(--text-muted);
}
.landing .btn--silver:hover {
  border-color: rgba(255,255,255,0.35);
  color: var(--text);
}

.landing .btn--gold {
  background: linear-gradient(135deg, #f5c842 0%, #e8a800 100%);
  color: #080808;
  font-weight: 700;
}
.landing .btn--gold:hover {
  transform: translateY(-2px);
  box-shadow: 0 0 28px rgba(245,200,66,0.5), 0 6px 20px rgba(0,0,0,0.4);
}

.landing .btn--full-width { width: 100%; }

.landing .btn--hero {
  min-height: 52px;
  font-size: 17px;
  padding: 15px 40px;
  border-radius: 12px;
}

.landing .btn--nav {
  min-height: 38px;
  font-size: 14px;
  padding: 7px 18px;
  border-radius: 8px;
  animation: none;
}
.landing .btn--nav:hover {
  transform: translateY(-1px);
  box-shadow: 0 0 16px rgba(16,185,129,0.35);
}

/* ─── Navbar ─────────────────────────────────────── */
.landing-nav {
  position: fixed;
  top: 0; left: 0; right: 0;
  z-index: 100;
  height: 64px;
  display: flex;
  align-items: center;
  padding: 0 24px;
  transition: background 0.3s ease, backdrop-filter 0.3s ease;
}
.landing-nav.scrolled {
  background: rgba(8,8,8,0.85);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--border);
}
.landing-nav__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  max-width: 1100px;
  margin: 0 auto;
}
.landing-nav__logo {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
}
.landing-nav__logo-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--green);
  box-shadow: 0 0 8px rgba(16,185,129,0.7);
  flex-shrink: 0;
}
.landing-nav__logo-text {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-weight: 800;
  font-size: 20px;
  color: var(--text);
}
.landing-nav__logo-text span { color: var(--green); }

/* ─── Hero ───────────────────────────────────────── */
.landing-hero {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  padding: 100px 0 80px;
  overflow: hidden;
}
.landing-hero__bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}
.landing-hero__bg-gradient {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse 70% 50% at 50% 0%, rgba(16,185,129,0.07) 0%, transparent 60%),
    radial-gradient(ellipse 50% 40% at 80% 80%, rgba(99,102,241,0.05) 0%, transparent 55%);
}
.landing-hero__content {
  position: relative;
  z-index: 1;
  text-align: center;
  max-width: 720px;
  margin: 0 auto;
  animation: fadeInUp 0.8s ease both;
}
.landing-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(16,185,129,0.08);
  border: 1px solid rgba(16,185,129,0.2);
  border-radius: 100px;
  padding: 6px 16px;
  color: var(--green);
  font-size: 0.85rem;
  font-weight: 500;
  margin-bottom: 28px;
}
.landing-hero__headline {
  font-size: clamp(2.4rem, 6vw, 4.2rem);
  font-weight: 800;
  line-height: 1.1;
  color: var(--text);
  margin-bottom: 20px;
}
.landing-hero__headline em { font-style: normal; }
.landing-hero__subheadline {
  font-size: 1.1rem;
  color: var(--text-muted);
  line-height: 1.7;
  margin: 0 auto 36px;
  max-width: 540px;
}
.landing-hero__cta-group {
  display: flex;
  justify-content: center;
  margin-bottom: 24px;
}
.hero-counter {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  color: var(--text-muted);
  margin-bottom: 32px;
}
.hero-counter__number {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-weight: 700;
  color: var(--text);
}
.landing-hero__stats {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 8px;
}
.landing-hero__stats-item {
  font-size: 0.82rem;
  color: var(--text-muted);
  padding: 5px 14px;
  border: 1px solid var(--border);
  border-radius: 100px;
  background: rgba(255,255,255,0.02);
}

/* ─── Feature Cards (was: Problem) ──────────────── */
.landing-features { background: var(--bg); }
.feature-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
  margin-bottom: 40px;
}
.feature-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 28px;
  transition: border-color 0.2s ease, transform 0.2s ease;
}
.feature-card:hover {
  border-color: rgba(16,185,129,0.25);
  transform: translateY(-3px);
}
.feature-card__icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(135deg, rgba(16,185,129,0.12) 0%, rgba(99,102,241,0.12) 100%);
  border: 1px solid rgba(16,185,129,0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  margin-bottom: 16px;
}
.feature-card__title {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--text);
  margin-bottom: 8px;
}
.feature-card__desc {
  font-size: 0.9rem;
  color: var(--text-muted);
  line-height: 1.6;
  margin: 0;
}
.feature-solution {
  text-align: center;
  font-size: 1rem;
  color: var(--text-muted);
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.7;
}
.feature-solution strong { color: var(--text); }

/* ─── How It Works (was: Demo) ───────────────────── */
.landing-how { background: var(--surface); }
.steps-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 24px;
}
.step-item {
  text-align: center;
  padding: 32px 24px;
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 16px;
  transition: border-color 0.2s ease, transform 0.2s ease;
}
.step-item:hover {
  border-color: rgba(16,185,129,0.2);
  transform: translateY(-2px);
}
.step-number {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(16,185,129,0.12) 0%, rgba(99,102,241,0.12) 100%);
  border: 1px solid rgba(16,185,129,0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-weight: 800;
  font-size: 1rem;
  color: var(--green);
  margin: 0 auto 16px;
}
.step-title {
  font-size: 1rem;
  font-weight: 700;
  color: var(--text);
  margin-bottom: 8px;
}
.step-desc {
  font-size: 0.88rem;
  color: var(--text-muted);
  line-height: 1.6;
  margin: 0;
}

/* ─── Stats (was: Social Proof) ──────────────────── */
.landing-stats { background: var(--bg); }
.stats-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
}
.stat-item {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 28px 20px;
  text-align: center;
  transition: border-color 0.2s ease;
}
.stat-item:hover { border-color: rgba(16,185,129,0.2); }
.stat-value {
  display: block;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 2rem;
  font-weight: 800;
  line-height: 1;
  margin-bottom: 6px;
}
.stat-label {
  font-size: 0.85rem;
  color: var(--text-muted);
}

/* ─── Pricing ────────────────────────────────────── */
.pricing-section { background: var(--surface); }
.pricing-toggle-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 40px;
  flex-wrap: wrap;
}
.pricing-toggle-btn {
  background: transparent;
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 8px 18px;
  color: var(--text-muted);
  font-family: 'Outfit', sans-serif;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
}
.pricing-toggle-btn--active {
  background: rgba(16,185,129,0.1);
  border-color: rgba(16,185,129,0.3);
  color: var(--green);
}
.pricing-cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
  align-items: start;
}
.pricing-card {
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 20px;
  padding: 28px;
  position: relative;
  transition: border-color 0.2s ease;
}
.pricing-card:hover { border-color: rgba(255,255,255,0.12); }
.pricing-card--silver {
  border-color: rgba(148,163,184,0.12);
}
.pricing-card--silver:hover { border-color: rgba(148,163,184,0.28); }
.pricing-card--gold {
  border-color: rgba(245,200,66,0.18);
  background: linear-gradient(160deg, rgba(245,200,66,0.04) 0%, var(--surface-2) 50%);
}
.pricing-card--gold:hover { border-color: rgba(245,200,66,0.38); }
.pricing-card__badges {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}
.pricing-card__header { margin-bottom: 20px; }
.pricing-card__title {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--text);
  margin-bottom: 8px;
}
.pricing-card__price {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 1.9rem;
  font-weight: 800;
  color: var(--text);
  line-height: 1.15;
}
.pricing-card__period {
  font-size: 1rem;
  font-weight: 400;
  color: var(--text-muted);
}
.pricing-card__annual-note {
  font-size: 0.82rem;
  color: var(--text-muted);
  margin-top: 4px;
}
.pricing-badge {
  display: inline-flex;
  align-items: center;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  padding: 3px 10px;
  border-radius: 100px;
}
.pricing-badge--popular {
  background: rgba(16,185,129,0.1);
  border: 1px solid rgba(16,185,129,0.25);
  color: var(--green);
}
.pricing-badge--complete {
  background: rgba(99,102,241,0.08);
  border: 1px solid rgba(99,102,241,0.22);
  color: #818cf8;
}
.pricing-badge--savings {
  background: rgba(245,200,66,0.08);
  border: 1px solid rgba(245,200,66,0.2);
  color: #f5c842;
  font-size: 0.72rem;
}
.pricing-features-list {
  list-style: none;
  padding: 0;
  margin: 0 0 24px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.pricing-feature {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  font-size: 0.875rem;
  color: var(--text-muted);
  line-height: 1.5;
}
.pricing-feature__icon {
  flex-shrink: 0;
  width: 18px;
  font-size: 0.75rem;
  margin-top: 2px;
}
.pricing-feature--check { color: var(--text); }
.pricing-feature--check .pricing-feature__icon { color: var(--green); }
.pricing-feature--cross { opacity: 0.35; }
.pricing-feature--partial { color: var(--text-muted); }
.pricing-card__footer {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.pricing-card__note {
  font-size: 0.78rem;
  color: var(--text-muted);
  text-align: center;
  margin: 0;
}
.pricing-disclaimer,
.pricing-all-plans-note {
  text-align: center;
  font-size: 0.83rem;
  color: var(--text-muted);
  margin-top: 16px;
}

/* ─── FAQ ────────────────────────────────────────── */
.faq-section { background: var(--bg); }
.faq-list {
  max-width: 720px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.faq-item {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  overflow: hidden;
  transition: border-color 0.2s;
}
.faq-item--open { border-color: rgba(16,185,129,0.2); }
.faq-item__question {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 18px 20px;
  background: transparent;
  border: none;
  cursor: pointer;
  text-align: left;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text);
  transition: color 0.2s;
}
.faq-item--open .faq-item__question { color: var(--green); }
.faq-item__arrow {
  color: var(--text-muted);
  flex-shrink: 0;
  font-size: 0.7rem;
}
.faq-item__answer { padding: 0 20px; }
.faq-item__answer p {
  font-size: 0.9rem;
  color: var(--text-muted);
  line-height: 1.7;
  padding-bottom: 18px;
  margin: 0;
}

/* ─── CTA / Second CTA ───────────────────────────── */
.second-cta-section { background: var(--surface); }
.second-cta-panel {
  background: linear-gradient(160deg, rgba(16,185,129,0.06) 0%, rgba(99,102,241,0.04) 100%);
  border: 1px solid rgba(16,185,129,0.15);
  border-radius: 24px;
  padding: 56px 40px;
  max-width: 600px;
  margin: 0 auto;
  text-align: center;
}
.second-cta-section__headline {
  font-size: clamp(1.8rem, 4vw, 2.6rem);
  font-weight: 800;
  color: var(--text);
  margin-bottom: 12px;
  line-height: 1.15;
}
.second-cta-section__subheadline {
  font-size: 1rem;
  color: var(--text-muted);
  margin-bottom: 32px;
}
.second-cta-section__reassurance {
  font-size: 0.85rem;
  color: var(--text-muted);
  margin-top: 16px;
}

/* ─── Waitlist Section (inline panel) ───────────── */
.waitlist-section-panel {
  background: rgba(16,185,129,0.04);
  border: 1px solid rgba(16,185,129,0.15);
  border-radius: 20px;
  padding: 48px 32px;
  max-width: 560px;
  margin: 0 auto;
  text-align: center;
}
.waitlist-section-panel h2 {
  font-size: clamp(1.5rem, 3vw, 1.9rem);
  font-weight: 800;
  color: var(--text);
  margin-bottom: 8px;
}
.waitlist-section-panel p {
  font-size: 0.95rem;
  color: var(--text-muted);
  margin-bottom: 28px;
  line-height: 1.6;
}

/* ─── Waitlist Form ──────────────────────────────── */
.waitlist-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.waitlist-form__fields {
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
}
.waitlist-form__input {
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 12px 16px;
  font-family: 'Outfit', sans-serif;
  font-size: 0.95rem;
  color: var(--text);
  outline: none;
  transition: border-color 0.2s;
  width: 100%;
}
.waitlist-form__input:focus { border-color: rgba(16,185,129,0.4); }
.waitlist-form__input::placeholder { color: var(--text-muted); }
.waitlist-form__modalita {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 4px 0 8px;
}
.waitlist-form__modalita-label {
  font-size: 0.85rem;
  color: var(--text-muted);
  white-space: nowrap;
  flex-shrink: 0;
}
.waitlist-form__modalita-pills { display: flex; gap: 8px; }
.waitlist-form__pill {
  padding: 6px 16px;
  border-radius: 100px;
  border: 1px solid var(--border);
  background: transparent;
  color: var(--text-muted);
  font-family: 'Outfit', sans-serif;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s;
}
.waitlist-form__pill:hover:not(:disabled) {
  border-color: rgba(255,255,255,0.25);
  color: var(--text);
}
.waitlist-form__pill--active {
  background: rgba(16,185,129,0.1);
  border-color: rgba(16,185,129,0.3);
  color: var(--green);
  font-weight: 600;
}
.waitlist-form__pill:disabled { opacity: 0.5; cursor: not-allowed; }
.waitlist-form__gdpr {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  font-size: 0.8rem;
  color: var(--text-muted);
  line-height: 1.5;
  cursor: pointer;
  text-align: left;
}
.waitlist-form__gdpr input[type="checkbox"] {
  flex-shrink: 0;
  margin-top: 2px;
  accent-color: var(--green);
}
.waitlist-form__link {
  color: var(--green);
  text-decoration: underline;
  text-underline-offset: 2px;
}
.waitlist-form__error {
  font-size: 0.85rem;
  color: #f87171;
  margin: 0;
}
.waitlist-form__submit { min-height: 52px; }
.waitlist-form--success {
  padding: 24px;
  background: rgba(16,185,129,0.08);
  border: 1px solid rgba(16,185,129,0.2);
  border-radius: 12px;
  text-align: center;
}
.waitlist-form__success-message {
  color: var(--green);
  font-weight: 600;
  margin: 0;
}

/* ─── Footer ─────────────────────────────────────── */
.landing-footer {
  background: var(--bg);
  border-top: 1px solid var(--border);
  padding: 48px 0 32px;
}
.landing-footer__top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 24px;
  margin-bottom: 32px;
}
.landing-footer__logo {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-weight: 800;
  font-size: 18px;
  color: var(--text);
}
.landing-footer__tagline {
  font-size: 0.85rem;
  color: var(--text-muted);
  margin: 4px 0 0;
}
.landing-footer__links {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}
.landing-footer__link {
  font-size: 0.85rem;
  color: var(--text-muted);
  text-decoration: none;
  transition: color 0.2s;
}
.landing-footer__link:hover { color: var(--text); }
.landing-footer__separator { color: var(--border); }
.landing-footer__middle { margin-bottom: 24px; }
.landing-footer__email {
  font-size: 0.9rem;
  color: var(--text-muted);
  text-decoration: none;
  transition: color 0.2s;
}
.landing-footer__email:hover { color: var(--green); }
.landing-footer__pricing-note {
  font-size: 0.8rem;
  color: var(--text-muted);
  margin: 4px 0 0;
}
.landing-footer__bottom {
  border-top: 1px solid var(--border);
  padding-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.landing-footer__copyright,
.landing-footer__disclaimer {
  font-size: 0.78rem;
  color: var(--text-muted);
  margin: 0;
}

/* ─── Responsive ─────────────────────────────────── */
@media (max-width: 768px) {
  .landing .section { padding: 64px 0; }
  .pricing-cards-grid { grid-template-columns: 1fr; }
  .steps-row { grid-template-columns: 1fr; }
  .stats-row { grid-template-columns: repeat(2, 1fr); }
  .second-cta-panel { padding: 36px 20px; }
  .waitlist-form__modalita { flex-direction: column; align-items: flex-start; }
  .landing-footer__top { flex-direction: column; }
}

/* ─── Spiral Canvas ──────────────────────────────── */
.spiral-canvas-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
}
.spiral-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  display: block;
}

/* ─── Spiral Background Layer ────────────────────── */
.spiral-bg {
  position: fixed;
  inset: 0;
  z-index: 0;
  opacity: 1;
  transition: opacity 1s ease;
  pointer-events: none;
}
.spiral-bg--active { opacity: 0.12; }
.spiral-bg--faded  { opacity: 0; }

/* ─── Spiral Gate Overlay ────────────────────────── */
.spiral-gate {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.8s ease;
}
.spiral-gate--exiting {
  opacity: 0;
  pointer-events: none;
}
.spiral-gate__btn {
  color: white;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 1.5rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  font-weight: 200;
  background: transparent;
  border: none;
  cursor: pointer;
  opacity: 0;
  transform: translateY(8px);
  transition: opacity 1s ease, transform 1s ease, letter-spacing 0.7s ease;
}
.spiral-gate__btn--visible {
  opacity: 1;
  transform: translateY(0);
  animation: gatePulse 2.5s ease-in-out infinite;
}
.spiral-gate__btn:hover { letter-spacing: 0.32em; }

@keyframes gatePulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.45; }
}

/* ─── Landing Content (post-enter) ──────────────── */
.landing-content {
  position: relative;
  z-index: 10;
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.6s ease 0.2s, transform 0.6s ease 0.2s;
}
.landing-content--visible {
  opacity: 1;
  transform: translateY(0);
}
```

- [ ] **Step 2: Verify build runs without errors**

Run: `npm run build`
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add src/pages/LandingPage.css
git commit -m "style: rewrite LandingPage.css with waiting-list token system"
```

---

## Task 3: LandingPage_part1.jsx — Nav, Hero, FeatureSection, HowItWorksSection

**Files:**
- Modify: `src/pages/LandingPage_part1.jsx`

- [ ] **Step 1: Replace the entire file**

```jsx
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
    document.getElementById('waitlist')?.scrollIntoView({ behavior: 'smooth' });
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
    document.getElementById('waitlist')?.scrollIntoView({ behavior: 'smooth' });
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
```

- [ ] **Step 2: Verify build runs without errors**

Run: `npm run build`
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add src/pages/LandingPage_part1.jsx
git commit -m "refactor: restyle Nav, Hero, FeatureSection, HowItWorksSection"
```

---

## Task 4: LandingPage_part2.jsx — Stats, Pricing, FAQ, Form, CTA, Footer

**Files:**
- Modify: `src/pages/LandingPage_part2.jsx`

- [ ] **Step 1: Replace the entire file**

```jsx
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
    { value: '1.200+', label: 'Fantallenatori in lista d\'attesa' },
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
```

- [ ] **Step 2: Verify build runs without errors**

Run: `npm run build`
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add src/pages/LandingPage_part2.jsx
git commit -m "refactor: restyle Stats, Pricing, FAQ, CTA, Footer; SocialProof→Stats"
```

---

## Task 5: LandingPage.jsx — Update imports and WaitlistSection

**Files:**
- Modify: `src/pages/LandingPage.jsx`

- [ ] **Step 1: Update the import from LandingPage_part1**

Find:
```jsx
import { LandingNav, HeroSection, ProblemSection, DemoSection } from './LandingPage_part1';
```

Replace with:
```jsx
import { LandingNav, HeroSection, FeatureSection, HowItWorksSection } from './LandingPage_part1';
```

- [ ] **Step 2: Update the import from LandingPage_part2**

Find:
```jsx
import {
  PricingSection,
  SocialProofSection,
  FAQSection,
  WaitlistForm,
  SecondCTASection,
  LandingFooter,
} from './LandingPage_part2';
```

Replace with:
```jsx
import {
  PricingSection,
  StatsSection,
  FAQSection,
  WaitlistForm,
  SecondCTASection,
  LandingFooter,
} from './LandingPage_part2';
```

- [ ] **Step 3: Replace WaitlistSection to use CSS class instead of inline styles**

Find and replace the `WaitlistSection` function:
```jsx
function WaitlistSection() {
  return (
    <section className="section" id="waitlist" aria-label="Iscrizione lista d'attesa">
      <div className="container">
        <div className="waitlist-section-panel">
          <h2>Accedi in anteprima</h2>
          <p>Iscriviti alla lista d&apos;attesa — gratis, nessuna carta richiesta.</p>
          <WaitlistForm position="hero" />
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Update JSX in LandingPage render to use renamed components**

Find:
```jsx
          {/* 3 — Problem */}
          <ProblemSection />

          {/* 4 — Demo / Coach AI Mockup */}
          <DemoSection />
```

Replace with:
```jsx
          {/* 3 — Features */}
          <FeatureSection />

          {/* 4 — How It Works */}
          <HowItWorksSection />
```

Find:
```jsx
          {/* 6 — Social Proof */}
          <SocialProofSection />
```

Replace with:
```jsx
          {/* 6 — Stats */}
          <StatsSection />
```

- [ ] **Step 5: Verify build runs without errors**

Run: `npm run build`
Expected: no errors

- [ ] **Step 6: Smoke test at /#/landing**

Start dev server: `npm run dev`
Open: `http://localhost:5173/#/landing`

Check:
- [ ] Fonts: Plus Jakarta Sans on headings, Outfit on body text
- [ ] Background: `#080808` dark
- [ ] Nav: green dot logo, scrolled state shows frosted glass
- [ ] Hero: "Coach AI" animated gradient text
- [ ] Feature Cards: 3 cards with gradient icon squares
- [ ] How It Works: 3 numbered step cards
- [ ] Stats: 4 stat boxes with animated gradient numbers
- [ ] Pricing: 3-card grid, toggle works, gold card has gold border
- [ ] FAQ: accordion open/close, open items show green question
- [ ] CTA panel: "Entra in lista ora." animated gradient
- [ ] Footer: dark background, matching waiting list style
- [ ] SpiralGate still works (gate appears on load, content revealed on click)

- [ ] **Step 7: Commit**

```bash
git add src/pages/LandingPage.jsx
git commit -m "refactor: update LandingPage imports and WaitlistSection markup"
```
