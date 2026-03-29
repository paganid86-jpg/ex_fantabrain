# Waiting List Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Riscrivere `public/waiting-list.html` con il nuovo design system Gradient SaaS (Emerald→Indigo, Plus Jakarta Sans + Outfit, background minimal) preservando tutta la logica JS esistente.

**Architecture:** Riscrittura completa del solo file HTML (CSS + markup). Il JS è diviso in due operazioni: rimozione del blocco particelle da `waiting-list.js`, resto del file invariato. Nessuna dipendenza da React o dal bundle Vite — la waiting list è una pagina statica servita direttamente da Express.

**Tech Stack:** HTML5, CSS custom properties, vanilla JS (già esistente in `waiting-list.js`), Google Fonts (Plus Jakarta Sans + Outfit).

**Spec di riferimento:** `docs/superpowers/specs/2026-03-29-waiting-list-redesign-design.md`
**Mockup approvato:** `.superpowers/brainstorm/5784-1774795592/content/full-mockup.html`

---

## File map

| File | Azione |
|------|--------|
| `public/waiting-list.js` | Rimuovere righe 1–50 (IIFE particelle) |
| `public/waiting-list.html` | Riscrittura completa |

---

## Task 1: Rimuovere IIFE particelle da `waiting-list.js`

**Files:**
- Modify: `public/waiting-list.js` righe 1–50

- [ ] **Step 1: Verifica che le righe 1–50 siano solo il blocco particelle**

  ```bash
  head -52 public/waiting-list.js
  ```
  Expected: L'output mostra `/* ── Particles ──` alla riga 1 e la IIFE che si chiude con `})();` alla riga 50, seguita da una riga vuota e `/* ── Typing Effect ──` alla riga 52.

- [ ] **Step 2: Rimuovere le righe 1–51 (blocco + riga vuota)**

  Aprire `public/waiting-list.js` e cancellare tutto da riga 1 a riga 51 (inclusa la riga vuota dopo `})();`).

  Il file deve iniziare esattamente così dopo la modifica:
  ```js
  /* ── Typing Effect ─────────────────────────────────── */
  (function () {
    const phrases = ['I dati ci sono sempre stati. Ora li capisci.', ...
  ```

- [ ] **Step 3: Verificare che il file inizi correttamente**

  ```bash
  head -5 public/waiting-list.js
  ```
  Expected:
  ```
  /* ── Typing Effect ─────────────────────────────────── */
  (function () {
    const phrases = ['I dati ci sono sempre stati. Ora li capisci.',
  ```

- [ ] **Step 4: Commit**

  ```bash
  git add public/waiting-list.js
  git commit -m "refactor(waiting-list): remove particle canvas IIFE"
  ```

---

## Task 2: Riscrivere `public/waiting-list.html`

**Files:**
- Modify (full rewrite): `public/waiting-list.html`

- [ ] **Step 1: Sostituire il contenuto completo del file**

  Sovrascrivere `public/waiting-list.html` con il seguente contenuto:

  ```html
  <!DOCTYPE html>
  <html lang="it">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>FantaBrain — Lista d'attesa</title>
    <meta name="description" content="La prima app AI italiana per il Fantacalcio. Formazioni ottimali, consigli sui titolari, strategie di mercato — in tempo reale." />
    <meta property="og:title" content="FantaBrain — La prima app di Fantacalcio con AI integrata" />
    <meta property="og:description" content="Competi nella tua lega sfruttando analisi fornite dall'intelligenza artificiale. Entra in lista d'attesa." />
    <meta property="og:type" content="website" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,700&family=Outfit:wght@400;500;600;700&display=swap" rel="stylesheet" />

    <style>
      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

      :root {
        --bg:           #080808;
        --bg-surface:   #0d0d0d;
        --bg-card:      #101010;
        --bg-card-hover:#151515;

        --green:        #10b981;
        --indigo:       #6366f1;
        --grad:         linear-gradient(135deg, #10b981 0%, #6366f1 100%);

        --text:         #f4f4f5;
        --text-soft:    #71717a;
        --text-muted:   #3f3f46;

        --border:       rgba(255,255,255,0.06);
        --border-md:    rgba(255,255,255,0.09);

        --radius-sm:    8px;
        --radius-md:    12px;
        --radius-lg:    16px;
        --radius-xl:    20px;
        --radius-2xl:   24px;
        --ease:         cubic-bezier(0.16,1,0.3,1);

        --font-display: 'Plus Jakarta Sans', sans-serif;
        --font-body:    'Outfit', sans-serif;
      }

      html { scroll-behavior: smooth; }

      body {
        font-family: var(--font-body);
        background: var(--bg);
        color: var(--text);
        line-height: 1.6;
        -webkit-font-smoothing: antialiased;
        overflow-x: hidden;
      }

      .container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 0 clamp(20px, 5vw, 48px);
      }

      .grad-text {
        background: var(--grad);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }

      /* ── NAV ── */
      .nav {
        position: sticky; top: 0; z-index: 50;
        background: rgba(8,8,8,0.82);
        backdrop-filter: blur(14px);
        -webkit-backdrop-filter: blur(14px);
        border-bottom: 1px solid var(--border);
      }
      .nav-inner {
        display: flex; align-items: center; justify-content: space-between;
        height: 60px;
      }
      .logo {
        display: flex; align-items: center; gap: 9px;
        text-decoration: none;
      }
      .logo-dot {
        width: 26px; height: 26px;
        background: var(--grad);
        border-radius: 7px;
        display: flex; align-items: center; justify-content: center;
        font-size: 14px;
      }
      .logo-name {
        font-family: var(--font-display);
        font-weight: 800; font-size: 1rem;
        color: var(--text); letter-spacing: -0.02em;
      }
      .nav-cta {
        font-family: var(--font-display);
        font-weight: 700; font-size: 0.8rem;
        color: #fff;
        background: var(--grad);
        border: none; border-radius: var(--radius-md);
        padding: 8px 18px; cursor: pointer;
        transition: opacity 150ms ease;
      }
      .nav-cta:hover { opacity: 0.88; }

      /* ── HERO ── */
      .hero {
        padding: 90px 0 80px;
        position: relative; overflow: hidden;
      }
      .hero-glow-1 {
        position: absolute; top: -120px; right: -80px;
        width: 500px; height: 500px;
        background: radial-gradient(circle, rgba(16,185,129,0.07) 0%, transparent 65%);
        pointer-events: none; filter: blur(1px);
      }
      .hero-glow-2 {
        position: absolute; bottom: -100px; left: -80px;
        width: 420px; height: 420px;
        background: radial-gradient(circle, rgba(99,102,241,0.06) 0%, transparent 65%);
        pointer-events: none; filter: blur(1px);
      }
      .hero-inner {
        position: relative; z-index: 1;
        max-width: 700px; margin: 0 auto; text-align: center;
      }

      /* Badge */
      .badge {
        display: inline-flex; align-items: center; gap: 7px;
        background: var(--bg-card);
        border: 1px solid var(--border-md);
        border-radius: 999px;
        padding: 6px 16px;
        font-family: var(--font-body); font-size: 0.78rem; font-weight: 500;
        color: var(--text-soft);
        margin-bottom: 28px;
      }
      .badge-dot {
        width: 6px; height: 6px;
        background: var(--green); border-radius: 50%; flex-shrink: 0;
      }

      /* Headline */
      .hero-title {
        font-family: var(--font-display);
        font-weight: 800;
        font-size: clamp(2.8rem, 6vw, 5rem);
        line-height: 1.04; letter-spacing: -0.04em;
        color: var(--text); margin-bottom: 0;
      }
      .hero-typed-row { margin: 14px 0 26px; }
      .typed-text {
        font-family: var(--font-display);
        font-style: italic; font-weight: 700;
        font-size: clamp(1.5rem, 3.5vw, 2.6rem);
        line-height: 1.2;
      }
      .cursor {
        display: inline-block;
        width: 3px; height: 0.8em;
        background: var(--green); border-radius: 2px;
        vertical-align: middle; margin-left: 3px;
        animation: blink 0.7s ease-in-out infinite;
      }

      /* Sub */
      .hero-sub {
        font-size: clamp(1rem, 2.5vw, 1.1rem);
        color: var(--text-soft); line-height: 1.75;
        max-width: 520px; margin: 0 auto 36px;
        font-weight: 400;
      }

      /* Form */
      .waitlist-form {
        display: flex; flex-direction: column; gap: 10px;
        max-width: 580px; margin: 0 auto 20px;
      }
      .form-row {
        display: grid; grid-template-columns: 1fr 1fr; gap: 10px;
      }
      .form-input {
        width: 100%; padding: 13px 16px;
        font-family: var(--font-body); font-size: 0.9rem;
        color: var(--text);
        background: var(--bg-card);
        border: 1px solid var(--border-md);
        border-radius: var(--radius-md);
        outline: none;
        transition: border-color 200ms ease, box-shadow 200ms ease;
        appearance: none; -webkit-appearance: none;
      }
      .form-input::placeholder { color: var(--text-muted); }
      .form-input:focus {
        border-color: var(--green);
        box-shadow: 0 0 0 3px rgba(16,185,129,0.12);
      }
      select.form-input {
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%2352525B' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
        background-repeat: no-repeat;
        background-position: right 14px center;
        padding-right: 40px; cursor: pointer;
      }
      select.form-input option { background: var(--bg-card); color: var(--text); }

      .form-error {
        font-size: 0.85rem; color: #f87171;
        text-align: center; padding: 10px 16px;
        background: rgba(239,68,68,0.08);
        border: 1px solid rgba(239,68,68,0.2);
        border-radius: var(--radius-md); display: none;
      }

      .cta-btn {
        position: relative; overflow: hidden;
        width: 100%; padding: 15px 24px;
        font-family: var(--font-display); font-weight: 700; font-size: 1rem;
        color: #fff;
        background: var(--grad);
        border: none; border-radius: var(--radius-md); cursor: pointer;
        display: flex; align-items: center; justify-content: center; gap: 8px;
        transition: opacity 180ms ease, transform 200ms var(--ease), box-shadow 200ms ease;
        margin-top: 2px;
      }
      .cta-btn:hover {
        opacity: 0.92;
        transform: translateY(-2px);
        box-shadow: 0 12px 36px rgba(99,102,241,0.22);
      }
      .cta-btn:active { transform: translateY(0); }
      .cta-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; box-shadow: none; }

      /* Spinner */
      .spinner {
        width: 17px; height: 17px;
        border: 2px solid rgba(255,255,255,0.25);
        border-top-color: #fff;
        border-radius: 50%;
        animation: spin 0.7s linear infinite;
        display: inline-block; flex-shrink: 0;
      }

      /* Counter */
      .counter {
        display: inline-flex; align-items: center; gap: 9px;
        font-size: 0.82rem; font-weight: 500;
        color: var(--text-soft); margin-bottom: 56px;
      }
      .counter-dot {
        width: 7px; height: 7px;
        background: var(--green); border-radius: 50%;
        animation: pulse-dot 2s ease-in-out infinite;
      }

      /* Stats */
      .stats-row {
        display: flex; align-items: center; justify-content: center;
        padding: 28px 0; border-top: 1px solid var(--border);
      }
      .stat-item { flex: 1; text-align: center; padding: 0 12px; }
      .stat-value {
        font-family: var(--font-display); font-weight: 800;
        font-size: clamp(1.5rem, 3vw, 2rem);
        letter-spacing: -0.03em; line-height: 1; margin-bottom: 5px;
      }
      .stat-label {
        font-size: 0.78rem; color: var(--text-muted);
        line-height: 1.4; font-weight: 400;
      }
      .stat-divider {
        width: 1px; height: 36px;
        background: var(--border); flex-shrink: 0;
      }

      /* ── FEATURES ── */
      .features-section { padding: 96px 0; background: var(--bg); }

      .section-header { text-align: center; margin-bottom: 52px; }
      .section-label {
        font-family: var(--font-display);
        font-size: 0.7rem; font-weight: 700;
        text-transform: uppercase; letter-spacing: 0.12em;
        color: var(--green); margin-bottom: 12px;
      }
      .section-title {
        font-family: var(--font-display); font-weight: 800;
        font-size: clamp(1.8rem, 4vw, 2.8rem);
        color: var(--text); letter-spacing: -0.03em;
        line-height: 1.1; margin-bottom: 12px;
      }
      .section-sub {
        font-size: 1rem; color: var(--text-soft);
        max-width: 480px; margin: 0 auto;
        line-height: 1.7; font-weight: 400;
      }

      .features-grid {
        display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px;
      }
      .feature-card {
        background: var(--bg-card);
        border: 1px solid var(--border);
        border-radius: var(--radius-xl);
        padding: 28px 24px;
        transition: border-color 250ms ease, box-shadow 250ms ease,
                    transform 250ms var(--ease), background 250ms ease;
        cursor: default;
      }
      .feature-card:hover {
        border-color: rgba(99,102,241,0.25);
        background: var(--bg-card-hover);
        box-shadow: 0 8px 40px rgba(99,102,241,0.07);
        transform: translateY(-3px);
      }
      .feature-icon-box {
        display: inline-flex; align-items: center; justify-content: center;
        width: 44px; height: 44px;
        background: linear-gradient(135deg, rgba(16,185,129,0.1), rgba(99,102,241,0.1));
        border: 1px solid rgba(99,102,241,0.2);
        border-radius: var(--radius-md); margin-bottom: 16px;
      }
      .feature-icon-box svg { width: 20px; height: 20px; stroke: var(--indigo); }
      .feature-title {
        font-family: var(--font-display); font-weight: 700;
        font-size: 0.95rem; color: var(--text); margin-bottom: 7px;
      }
      .feature-text {
        font-size: 0.85rem; color: var(--text-soft);
        line-height: 1.72; font-weight: 400;
      }

      /* ── HOW IT WORKS ── */
      .hiw-section { padding: 96px 0; background: var(--bg-surface); }

      .steps-row {
        display: flex; align-items: flex-start;
        max-width: 860px; margin: 0 auto 64px;
      }
      .step {
        flex: 1; display: flex; flex-direction: column;
        align-items: center; text-align: center; padding: 0 16px;
      }
      .step-num-box {
        width: 56px; height: 56px;
        display: flex; align-items: center; justify-content: center;
        background: var(--grad); color: #fff;
        font-family: var(--font-display); font-weight: 800; font-size: 1rem;
        border-radius: 16px; margin-bottom: 20px; flex-shrink: 0;
        box-shadow: 0 4px 20px rgba(99,102,241,0.25);
      }
      .step-line-h {
        flex: 1; height: 1px; background: var(--border); margin-top: 27px;
      }
      .step-title {
        font-family: var(--font-display); font-weight: 700;
        font-size: 0.95rem; color: var(--text); margin-bottom: 7px;
      }
      .step-text {
        font-size: 0.84rem; color: var(--text-soft);
        line-height: 1.65; max-width: 180px;
        margin: 0 auto; font-weight: 400;
      }

      /* CTA Card */
      .cta-card {
        background: var(--bg-card);
        border: 1px solid var(--border-md);
        border-radius: var(--radius-2xl);
        padding: clamp(32px, 5vw, 56px) clamp(24px, 5vw, 64px);
        text-align: center; max-width: 820px; margin: 0 auto;
        position: relative; overflow: hidden;
      }
      .cta-card::before {
        content: ''; position: absolute;
        top: -80px; left: 50%; transform: translateX(-50%);
        width: 400px; height: 300px;
        background: radial-gradient(ellipse, rgba(99,102,241,0.08) 0%, transparent 70%);
        pointer-events: none;
      }
      .cta-card-title {
        font-family: var(--font-display); font-weight: 800;
        font-size: clamp(1.5rem, 3.5vw, 2.2rem);
        color: var(--text); letter-spacing: -0.03em;
        line-height: 1.15; margin-bottom: 12px; position: relative;
      }
      .cta-card-sub {
        font-size: 1rem; color: var(--text-soft);
        margin-bottom: 28px; line-height: 1.65;
        font-weight: 400; position: relative;
      }
      .btn-grad {
        display: inline-flex; align-items: center; gap: 8px;
        padding: 13px 32px;
        font-family: var(--font-display); font-weight: 700; font-size: 1rem;
        color: #fff; background: var(--grad);
        border: none; border-radius: var(--radius-md); cursor: pointer;
        transition: opacity 180ms, transform 200ms var(--ease), box-shadow 200ms;
        margin-bottom: 24px; position: relative;
      }
      .btn-grad:hover {
        opacity: 0.9; transform: translateY(-2px);
        box-shadow: 0 10px 30px rgba(99,102,241,0.25);
      }

      .trust-signals {
        display: flex; align-items: center; justify-content: center;
        flex-wrap: wrap; gap: 20px;
        font-size: 0.85rem; color: var(--text-soft);
        position: relative;
      }
      .trust-signals span { display: flex; align-items: center; gap: 7px; font-weight: 400; }
      .check {
        background: var(--grad);
        -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        font-weight: 700;
      }

      /* ── FOOTER ── */
      .footer { background: #050505; border-top: 1px solid var(--border); padding: 44px 0; }
      .footer-inner {
        display: flex; align-items: center; justify-content: space-between;
        flex-wrap: wrap; gap: 20px;
        margin-bottom: 32px; padding-bottom: 32px;
        border-bottom: 1px solid var(--border);
      }
      .footer-nav { display: flex; flex-wrap: wrap; gap: 20px; }
      .footer-nav a {
        font-size: 0.85rem; color: var(--text-muted);
        text-decoration: none; font-weight: 400;
        transition: color 150ms ease;
      }
      .footer-nav a:hover { color: var(--text-soft); }
      .footer-social { display: flex; gap: 14px; }
      .footer-social a { color: var(--text-muted); transition: color 150ms ease; }
      .footer-social a:hover { color: var(--text-soft); }
      .footer-social svg { width: 18px; height: 18px; fill: currentColor; }
      .footer-bottom { text-align: center; }
      .footer-bottom p { font-size: 0.78rem; color: var(--text-muted); font-weight: 400; }

      /* ── SUCCESS OVERLAY ── */
      #success-overlay {
        display: none; position: fixed; inset: 0; z-index: 100;
        background: rgba(8,8,8,0.92);
        backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
        align-items: center; justify-content: center; padding: 24px;
        animation: fadeIn 0.3s var(--ease);
      }
      .success-card {
        background: var(--bg-card); border: 1px solid var(--border-md);
        border-radius: var(--radius-2xl); padding: 48px 40px;
        max-width: 460px; width: 100%; text-align: center; position: relative;
        animation: slideUp 0.35s var(--ease);
      }
      .success-close {
        position: absolute; top: 16px; right: 16px;
        width: 32px; height: 32px;
        display: flex; align-items: center; justify-content: center;
        font-size: 1rem; color: var(--text-muted);
        background: none; border: none; border-radius: 50%; cursor: pointer;
        transition: background 150ms ease, color 150ms ease;
      }
      .success-close:hover { background: var(--bg-card-hover); color: var(--text); }
      .success-emoji { font-size: 52px; display: block; margin-bottom: 16px; }
      .success-title {
        font-family: var(--font-display); font-weight: 800; font-size: 1.9rem;
        color: var(--text); letter-spacing: -0.02em; margin-bottom: 8px;
      }
      .success-pos { font-size: 1rem; color: var(--text-soft); margin-bottom: 6px; }
      .success-pos strong { color: var(--green); font-weight: 700; }
      .success-note {
        font-size: 0.875rem; color: var(--text-muted);
        margin-bottom: 24px; line-height: 1.6;
      }
      .success-divider { height: 1px; background: var(--border); margin-bottom: 22px; }
      .success-ref-label {
        font-size: 0.75rem; font-weight: 600; color: var(--text-soft);
        text-transform: uppercase; letter-spacing: 0.07em; margin-bottom: 10px;
      }
      .success-ref-code {
        display: inline-block;
        font-family: var(--font-display); font-weight: 700; font-size: 1.4rem;
        background: var(--grad); -webkit-background-clip: text;
        -webkit-text-fill-color: transparent; background-clip: text;
        border: 1.5px solid rgba(99,102,241,0.3);
        border-radius: var(--radius-md); padding: 10px 24px;
        letter-spacing: 0.06em; margin-bottom: 8px;
      }
      .success-ref-hint { font-size: 0.8rem; color: var(--text-muted); margin-bottom: 22px; }
      .share-btns { display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; }
      .share-btn {
        display: inline-flex; align-items: center; gap: 7px;
        padding: 10px 18px;
        font-family: var(--font-body); font-weight: 600; font-size: 0.875rem;
        border: none; border-radius: var(--radius-sm); cursor: pointer;
        transition: transform 150ms ease, opacity 150ms ease;
      }
      .share-btn:hover { transform: translateY(-1px); opacity: 0.88; }
      .share-wa { background: #25d366; color: #fff; }
      .share-copy { background: var(--grad); color: #fff; }

      /* ── REVEAL ── */
      .reveal {
        opacity: 0; transform: translateY(28px);
        transition: opacity 0.65s var(--ease), transform 0.65s var(--ease);
      }
      .reveal.visible { opacity: 1; transform: translateY(0); }

      .features-grid .feature-card {
        opacity: 0; transform: translateY(22px);
        transition: opacity 0.55s var(--ease), transform 0.55s var(--ease),
                    border-color 250ms ease, box-shadow 250ms ease,
                    background 250ms ease;
      }
      .features-grid.visible .feature-card { opacity: 1; transform: translateY(0); }
      .features-grid.visible .feature-card:nth-child(1) { transition-delay: 0ms; }
      .features-grid.visible .feature-card:nth-child(2) { transition-delay: 70ms; }
      .features-grid.visible .feature-card:nth-child(3) { transition-delay: 140ms; }
      .features-grid.visible .feature-card:nth-child(4) { transition-delay: 70ms; }
      .features-grid.visible .feature-card:nth-child(5) { transition-delay: 140ms; }
      .features-grid.visible .feature-card:nth-child(6) { transition-delay: 210ms; }

      .steps-row .step {
        opacity: 0; transform: translateY(20px);
        transition: opacity 0.55s var(--ease), transform 0.55s var(--ease);
      }
      .steps-row.visible .step { opacity: 1; transform: translateY(0); }
      .steps-row.visible .step:nth-child(1) { transition-delay: 0ms; }
      .steps-row.visible .step:nth-child(3) { transition-delay: 120ms; }
      .steps-row.visible .step:nth-child(5) { transition-delay: 240ms; }

      /* ── KEYFRAMES ── */
      @keyframes blink { 0%,100% { opacity:1; } 50% { opacity:0; } }
      @keyframes spin { to { transform: rotate(360deg); } }
      @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
      @keyframes slideUp { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
      @keyframes pulse-dot {
        0% { box-shadow: 0 0 0 0 rgba(16,185,129,0.5); }
        70% { box-shadow: 0 0 0 8px rgba(16,185,129,0); }
        100% { box-shadow: 0 0 0 0 rgba(16,185,129,0); }
      }

      /* ── RESPONSIVE ── */
      @media (max-width: 900px) {
        .features-grid { grid-template-columns: repeat(2, 1fr); }
      }
      @media (max-width: 768px) {
        .steps-row { flex-direction: column; align-items: center; gap: 32px; }
        .step-line-h { display: none; }
        .step { max-width: 280px; }
        .trust-signals { gap: 14px; }
      }
      @media (max-width: 580px) {
        .form-row { grid-template-columns: 1fr; }
        .features-grid { grid-template-columns: 1fr; }
        .success-card { padding: 36px 24px; }
        .footer-inner { flex-direction: column; align-items: flex-start; }
        .stats-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; padding: 20px 0; }
        .stat-divider { display: none; }
      }
      @media (prefers-reduced-motion: reduce) {
        *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
        .reveal, .features-grid .feature-card, .steps-row .step { opacity: 1; transform: none; }
      }
    </style>
  </head>
  <body>

  <!-- NAV -->
  <nav class="nav">
    <div class="container">
      <div class="nav-inner">
        <a class="logo" href="/waiting-list">
          <div class="logo-dot">⚡</div>
          <span class="logo-name">FantaBrain</span>
        </a>
        <button class="nav-cta" onclick="document.getElementById('waitlist-form-anchor').scrollIntoView({behavior:'smooth'})">
          Entra in lista →
        </button>
      </div>
    </div>
  </nav>

  <!-- HERO -->
  <section class="hero" id="waitlist-form-anchor">
    <div class="hero-glow-1"></div>
    <div class="hero-glow-2"></div>
    <div class="container">
      <div class="hero-inner">

        <div class="badge">
          <span class="badge-dot"></span>
          Prima app italiana di fantacalcio con AI integrata
        </div>

        <h1 class="hero-title">Fanta<span class="grad-text">Brain</span></h1>
        <div class="hero-typed-row">
          <span id="typed" class="grad-text typed-text"></span><span class="cursor"></span>
        </div>

        <p class="hero-sub">
          Analisi tattiche, consigli sui titolari, strategie di mercato.<br>
          In tempo reale. Ti forniamo i dati mancanti per rendere la tua formazione efficace, per davvero.
        </p>

        <form class="waitlist-form" id="waitlist-form" novalidate>
          <div class="form-row">
            <input class="form-input" type="text" id="inp-name" placeholder="Il tuo nome" autocomplete="given-name" />
            <input class="form-input" type="email" id="inp-email" placeholder="La tua email" autocomplete="email" />
          </div>
          <div class="form-row">
            <select class="form-input" id="inp-lega">
              <option value="">Che lega giochi?</option>
              <option value="classico">Fantacalcio Classico</option>
              <option value="mantra">Fantacalcio Mantra</option>
              <option value="entrambi">Entrambi</option>
            </select>
            <input class="form-input" type="text" id="inp-referral" placeholder="Codice amico (opzionale)" />
          </div>
          <div class="form-error" id="form-error"></div>
          <button class="cta-btn" id="cta-btn" type="submit">
            <span id="btn-label">Voglio l'accesso beta</span>
            <span id="btn-arrow" class="btn-arrow">→</span>
          </button>
        </form>

        <div class="counter">
          <span class="counter-dot"></span>
          <span><span id="count-num">—</span> fanta-allenatori già in lista &middot; posti limitati</span>
        </div>

        <div class="stats-row">
          <div class="stat-item">
            <div class="stat-value grad-text">#1</div>
            <div class="stat-label">AI italiana per<br>il Fantacalcio</div>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <div class="stat-value grad-text">38</div>
            <div class="stat-label">Giornate di<br>Serie A coperte</div>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <div class="stat-value grad-text">550+</div>
            <div class="stat-label">Giocatori<br>analizzati</div>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <div class="stat-value grad-text">Gratis</div>
            <div class="stat-label">Accesso durante<br>la beta</div>
          </div>
        </div>

      </div>
    </div>
  </section>

  <!-- FEATURES -->
  <section class="features-section" id="features">
    <div class="container">
      <div class="section-header reveal">
        <p class="section-label">Feature</p>
        <h2 class="section-title">L'AI analizza.<br><span class="grad-text">Tu scegli</span>, sempre.</h2>
        <p class="section-sub">Strumenti pensati per darti il vantaggio competitivo in ogni giornata.</p>
      </div>

      <div class="features-grid">
        <div class="feature-card">
          <div class="feature-icon-box">
            <svg viewBox="0 0 24 24" fill="none" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"/>
              <path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"/>
              <path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4"/>
            </svg>
          </div>
          <h3 class="feature-title">Formazione AI</h3>
          <p class="feature-text">L'AI analizza la tua rosa ogni giornata e ti consiglia chi schierare, con quale modulo e perché. Tu decidi.</p>
        </div>

        <div class="feature-card">
          <div class="feature-icon-box">
            <svg viewBox="0 0 24 24" fill="none" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </div>
          <h3 class="feature-title">Chat Strategica</h3>
          <p class="feature-text">Fai domande in linguaggio naturale, ricevi risposte in secondi. Hai un esperto sempre a disposizione.</p>
        </div>

        <div class="feature-card">
          <div class="feature-icon-box">
            <svg viewBox="0 0 24 24" fill="none" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="20" x2="18" y2="10"/>
              <line x1="12" y1="20" x2="12" y2="4"/>
              <line x1="6" y1="20" x2="6" y2="14"/>
            </svg>
          </div>
          <h3 class="feature-title">Dati Serie A Live</h3>
          <p class="feature-text">Statistiche reali e aggiornate. Nessun dato allucinato.</p>
        </div>

        <div class="feature-card">
          <div class="feature-icon-box">
            <svg viewBox="0 0 24 24" fill="none" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <circle cx="12" cy="12" r="3"/>
              <line x1="12" y1="2" x2="12" y2="5"/>
              <line x1="12" y1="19" x2="12" y2="22"/>
              <line x1="2" y1="12" x2="5" y2="12"/>
              <line x1="19" y1="12" x2="22" y2="12"/>
            </svg>
          </div>
          <h3 class="feature-title">Consigli Titolari</h3>
          <p class="feature-text">Dubbio sull'ultimo titolare? L'AI confronta i giocatori e ti dà la risposta in base alle statistiche analizzate.</p>
        </div>

        <div class="feature-card">
          <div class="feature-icon-box">
            <svg viewBox="0 0 24 24" fill="none" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
              <polyline points="17 6 23 6 23 12"/>
            </svg>
          </div>
          <h3 class="feature-title">Strategia di Mercato</h3>
          <p class="feature-text">Dall'asta al mercato di riparazione, l'AI ti aiuta a costruire la rosa più forte secondo il tuo budget ed esigenze.</p>
        </div>

        <div class="feature-card">
          <div class="feature-icon-box">
            <svg viewBox="0 0 24 24" fill="none" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
          <h3 class="feature-title">Supporto Mantra/Classico</h3>
          <p class="feature-text">Il primo tool AI a supportare il sistema Mantra nella sua interezza. Tutti i ruoli, tutti i moduli.</p>
        </div>
      </div>
    </div>
  </section>

  <!-- HOW IT WORKS -->
  <section class="hiw-section" id="how-it-works">
    <div class="container">
      <div class="section-header reveal">
        <p class="section-label">Come funziona</p>
        <h2 class="section-title">Setup semplice,<br>risultati potenti.</h2>
        <p class="section-sub">Inizia in pochi minuti e lascia che l'AI faccia il lavoro pesante.</p>
      </div>

      <div class="steps-row">
        <div class="step">
          <div class="step-num-box">01</div>
          <h3 class="step-title">Iscriviti in lista</h3>
          <p class="step-text">Inserisci nome e email. Ci vuole 30 secondi.</p>
        </div>
        <div class="step-line-h"></div>
        <div class="step">
          <div class="step-num-box">02</div>
          <h3 class="step-title">Ricevi l'invito</h3>
          <p class="step-text">Ti contatteremo via email non appena il tuo posto è pronto.</p>
        </div>
        <div class="step-line-h"></div>
        <div class="step">
          <div class="step-num-box">03</div>
          <h3 class="step-title">Vinci la lega</h3>
          <p class="step-text">Usa l'AI ogni giornata. Strategie migliori, più punti, più vittorie.</p>
        </div>
      </div>

      <div class="cta-card reveal">
        <h3 class="cta-card-title">Giochi al fantacalcio da anni?<br>Da oggi giochi con le carte in mano.</h3>
        <p class="cta-card-sub">Unisciti alla lista d'attesa. Accesso completamente gratuito durante la beta.</p>
        <button class="btn-grad" id="final-cta-btn">Entra in lista →</button>
        <div class="trust-signals">
          <span><span class="check">✓</span> Iscrizione gratuita</span>
          <span><span class="check">✓</span> Nessuna carta richiesta</span>
          <span><span class="check">✓</span> Accesso anticipato garantito</span>
        </div>
      </div>
    </div>
  </section>

  <!-- FOOTER -->
  <footer class="footer">
    <div class="container">
      <div class="footer-inner">
        <a class="logo" href="/waiting-list">
          <div class="logo-dot">⚡</div>
          <span class="logo-name">FantaBrain</span>
        </a>
        <nav class="footer-nav">
          <a href="#features">Feature</a>
          <a href="#how-it-works">Come funziona</a>
          <a href="#">Privacy Policy</a>
          <a href="#">Contatti</a>
        </nav>
        <div class="footer-social">
          <a href="#" aria-label="X / Twitter">
            <svg viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
          </a>
          <a href="#" aria-label="Instagram">
            <svg viewBox="0 0 24 24"><path fill-rule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clip-rule="evenodd"/></svg>
          </a>
        </div>
      </div>
      <div class="footer-bottom">
        <p>© 2026 FantaBrain. Tutti i diritti riservati. La prima app con AI integrata per il Fantacalcio.</p>
      </div>
    </div>
  </footer>

  <!-- SUCCESS OVERLAY -->
  <div id="success-overlay">
    <div class="success-card">
      <button class="success-close" id="success-close">✕</button>
      <span class="success-emoji">🎉</span>
      <h2 class="success-title">Sei in lista!</h2>
      <p class="success-pos">Posizione <strong id="position-num">#—</strong> in lista.</p>
      <p class="success-note">Ti avviseremo via email non appena il tuo accesso è pronto.<br>Più amici porti, più sali in lista.</p>
      <div class="success-divider"></div>
      <p class="success-ref-label">Il tuo codice referral</p>
      <div class="success-ref-code" id="referral-display">FB-——</div>
      <p class="success-ref-hint">Condividilo con gli amici per scalare la lista più velocemente</p>
      <div class="share-btns">
        <button class="share-btn share-wa" id="share-wa">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          Condividi su WhatsApp
        </button>
        <button class="share-btn share-copy" id="share-copy">
          <span id="copy-icon">📋</span> <span id="copy-label">Copia link</span>
        </button>
      </div>
    </div>
  </div>

  <script src="/waiting-list.js"></script>
  </body>
  </html>
  ```

- [ ] **Step 2: Verificare che tutti gli ID JS-critici siano presenti nel nuovo file**

  Eseguire questi grep — ognuno deve restituire almeno una riga:
  ```bash
  grep -E 'id="(typed|count-num|waitlist-form|inp-name|inp-email|inp-lega|inp-referral|cta-btn|btn-label|btn-arrow|form-error|success-overlay|success-close|position-num|referral-display|share-wa|share-copy|copy-icon|copy-label|final-cta-btn)"' public/waiting-list.html
  ```
  Expected: 19 match (uno per ID). Se qualcuno manca, aggiungerlo al markup corrispondente.

- [ ] **Step 3: Commit**

  ```bash
  git add public/waiting-list.html
  git commit -m "feat(waiting-list): redesign estetico Gradient SaaS — Jakarta Sans + Outfit, Emerald→Indigo"
  ```

---

## Task 3: Smoke test manuale

**Files:** nessun file da modificare — solo verifica visiva e funzionale.

- [ ] **Step 1: Avviare il server locale**

  ```bash
  node server.js
  ```
  Aprire `http://localhost:3000/waiting-list` nel browser.

- [ ] **Step 2: Checklist visiva (Hero)**

  - [ ] Nav sticky visibile con logo ⚡ FantaBrain e CTA gradient
  - [ ] H1 "Fanta**Brain**" con "Brain" in gradiente verde→indigo
  - [ ] Typed text animato sotto l'H1 in gradiente
  - [ ] Cursore lampeggiante visibile
  - [ ] Subtitle in grigio, leggibile
  - [ ] Form con 4 campi: Nome / Email / Select lega / Codice amico
  - [ ] Bottone CTA con gradiente verde→indigo
  - [ ] Counter "— fanta-allenatori già in lista" con dot pulsante
  - [ ] Stats row: `#1` / `38` / `550+` / `Gratis` tutti in gradiente
  - [ ] Radial glow verde top-right e indigo bottom-left visibili (sfumati)
  - [ ] NESSUN canvas / particle animation

- [ ] **Step 3: Checklist visiva (Features + How it works)**

  - [ ] Sezione Features: titolo "L'AI analizza. **Tu scegli**, sempre." con "Tu scegli" in gradiente
  - [ ] 6 card con icon box indigo, hover border indigo + lift
  - [ ] Sezione How it works: 3 step con num-box gradient, connettore orizzontale
  - [ ] CTA card con glow indigo interna
  - [ ] Checkmark `✓` in gradiente nei trust signals

- [ ] **Step 4: Test form**

  - [ ] Premere "Voglio l'accesso beta" con campi vuoti → errore in rosso "Inserisci il tuo nome."
  - [ ] Inserire nome, email invalida → errore "Inserisci un'email valida."
  - [ ] Inserire nome + email + lega senza selezionare lega → errore "Seleziona che tipo di lega giochi."
  - [ ] Compilare tutti i campi obbligatori + submit → spinner nel bottone durante la chiamata

- [ ] **Step 5: Test mobile (DevTools → 390px)**

  - [ ] Form a colonna singola
  - [ ] Stats row in griglia 2×2
  - [ ] Steps in colonna verticale, connettori orizzontali nascosti
  - [ ] Font leggibili, nessun overflow orizzontale

- [ ] **Step 6: Commit finale se tutto ok**

  ```bash
  git add -A
  git commit -m "chore: smoke test passed — waiting list redesign complete"
  ```
  _(Solo se ci sono file residui non committati. Se non ci sono modifiche, skip.)_

---

## Checklist spec coverage

- [x] Stile Gradient SaaS → task 2
- [x] Palette Emerald→Indigo + CSS variables → task 2 (`:root`)
- [x] Font Plus Jakarta Sans + Outfit → task 2 (`<link>` + `--font-display/body`)
- [x] Background minimal radial glow → task 2 (`.hero-glow-1/2`)
- [x] `.grad-text` applicato a Brain, typed, Tu scegli, stats, CTA, step-num, check → task 2
- [x] Rimozione particle IIFE → task 1
- [x] Tutti gli ID JS preservati → task 2 step 2
- [x] `#final-cta-btn` sul bottone CTA card → task 2
- [x] Scroll reveal IntersectionObserver (`.reveal`, `.features-grid`, `.steps-row`) → task 2 (CSS presente, JS già in `waiting-list.js`)
- [x] Success overlay con referral code gradient → task 2
- [x] Responsive breakpoints → task 2 + smoke test task 3
