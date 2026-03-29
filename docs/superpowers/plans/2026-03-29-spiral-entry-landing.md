# Spiral Entry Animation — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Aggiungere un'animazione spirale full-screen come gate d'ingresso alla LandingPage di FantaBrain, con la spirale che resta come sfondo vivo dopo il click "Entra".

**Architecture:** Un singolo `hasEntered` state in `LandingPage` gestisce tutto. `SpiralAnimation` è sempre montata (z-index 0). `SpiralGate` è un overlay (z-index 50) con solo il bottone, che sfrutta la spirale sottostante come background. Al click, il gate svanisce (CSS transition 800ms), la spirale si riduce a 12% opacità, e il contenuto della landing page emerge con fade+slide.

**Tech Stack:** React 19 JSX, GSAP 3, Tailwind CSS v4, CSS custom properties FantaBrain design system.

---

## File Map

| File | Azione | Responsabilità |
|------|--------|----------------|
| `src/components/ui/SpiralAnimation.jsx` | **Crea** | Canvas animation GSAP — port da TSX 21dev a JSX puro |
| `src/components/ui/SpiralGate.jsx` | **Crea** | Overlay full-screen con bottone "Entra →" |
| `src/pages/LandingPage.css` | **Modifica** | Aggiunge classi CSS per gate, spiral-bg, landing-content, form pills |
| `src/pages/LandingPage.jsx` | **Modifica** | Aggiunge `hasEntered` state, hook `useSpiralFade`, struttura JSX con spirale |
| `src/pages/LandingPage_part2.jsx` | **Modifica** | Aggiorna `WaitlistForm` con toggle modalità + campo codice amico |
| `src/App.jsx` | **Modifica** | Aggiunge route pubblica `/landing` |

---

## Task 1 — Installa dipendenza GSAP

**Files:**
- Modify: `package.json` (via npm)

- [ ] **Step 1: Installa gsap**

```bash
cd /c/Users/DantePagani/ex_fantabrain && npm install gsap
```

Expected output (circa): `added 1 package [...] found 0 vulnerabilities`

- [ ] **Step 2: Verifica installazione**

```bash
cat /c/Users/DantePagani/ex_fantabrain/node_modules/gsap/package.json | grep '"version"'
```

Expected: `"version": "3.x.x"`

- [ ] **Step 3: Commit**

```bash
cd /c/Users/DantePagani/ex_fantabrain
git add package.json package-lock.json
git commit -m "feat: install gsap for spiral animation"
```

---

## Task 2 — Crea `SpiralAnimation.jsx`

Port del componente 21dev da TypeScript a JSX puro. Le classi JS non usano access modifiers (`private`, `public`) — le proprietà sono assegnate nel costruttore. La prop `'use client'` di Next.js va rimossa (non necessaria in Vite).

**Files:**
- Create: `src/components/ui/SpiralAnimation.jsx`

- [ ] **Step 1: Crea il file**

```jsx
// src/components/ui/SpiralAnimation.jsx
import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'

class Vector2D {
  constructor(x, y) {
    this.x = x
    this.y = y
  }
  static random(min, max) {
    return min + Math.random() * (max - min)
  }
}

class Vector3D {
  constructor(x, y, z) {
    this.x = x
    this.y = y
    this.z = z
  }
  static random(min, max) {
    return min + Math.random() * (max - min)
  }
}

class AnimationController {
  constructor(canvas, ctx, dpr, size) {
    this.canvas = canvas
    this.ctx = ctx
    this.dpr = dpr
    this.size = size
    this.timeline = gsap.timeline({ repeat: -1 })
    this.time = 0
    this.stars = []

    this.changeEventTime = 0.32
    this.cameraZ = -400
    this.cameraTravelDistance = 3400
    this.startDotYOffset = 28
    this.viewZoom = 100
    this.numberOfStars = 5000
    this.trailLength = 80

    this.setupRandomGenerator()
    this.createStars()
    this.setupTimeline()
  }

  setupRandomGenerator() {
    const originalRandom = Math.random
    const customRandom = () => {
      let seed = 1234
      return () => {
        seed = (seed * 9301 + 49297) % 233280
        return seed / 233280
      }
    }
    Math.random = customRandom()
    this.createStars()
    Math.random = originalRandom
  }

  createStars() {
    for (let i = 0; i < this.numberOfStars; i++) {
      this.stars.push(new Star(this.cameraZ, this.cameraTravelDistance))
    }
  }

  setupTimeline() {
    this.timeline.to(this, {
      time: 1,
      duration: 15,
      repeat: -1,
      ease: 'none',
      onUpdate: () => this.render(),
    })
  }

  ease(p, g) {
    if (p < 0.5) return 0.5 * Math.pow(2 * p, g)
    return 1 - 0.5 * Math.pow(2 * (1 - p), g)
  }

  easeOutElastic(x) {
    const c4 = (2 * Math.PI) / 4.5
    if (x <= 0) return 0
    if (x >= 1) return 1
    return Math.pow(2, -8 * x) * Math.sin((x * 8 - 0.75) * c4) + 1
  }

  map(value, start1, stop1, start2, stop2) {
    return start2 + (stop2 - start2) * ((value - start1) / (stop1 - start1))
  }

  constrain(value, min, max) {
    return Math.min(Math.max(value, min), max)
  }

  lerp(start, end, t) {
    return start * (1 - t) + end * t
  }

  spiralPath(p) {
    p = this.constrain(1.2 * p, 0, 1)
    p = this.ease(p, 1.8)
    const numberOfSpiralTurns = 6
    const theta = 2 * Math.PI * numberOfSpiralTurns * Math.sqrt(p)
    const r = 170 * Math.sqrt(p)
    return new Vector2D(
      r * Math.cos(theta),
      r * Math.sin(theta) + this.startDotYOffset
    )
  }

  rotate(v1, v2, p, orientation) {
    const middle = new Vector2D((v1.x + v2.x) / 2, (v1.y + v2.y) / 2)
    const dx = v1.x - middle.x
    const dy = v1.y - middle.y
    const angle = Math.atan2(dy, dx)
    const o = orientation ? -1 : 1
    const r = Math.sqrt(dx * dx + dy * dy)
    const bounce = Math.sin(p * Math.PI) * 0.05 * (1 - p)
    return new Vector2D(
      middle.x + r * (1 + bounce) * Math.cos(angle + o * Math.PI * this.easeOutElastic(p)),
      middle.y + r * (1 + bounce) * Math.sin(angle + o * Math.PI * this.easeOutElastic(p))
    )
  }

  showProjectedDot(position, sizeFactor) {
    const t2 = this.constrain(this.map(this.time, this.changeEventTime, 1, 0, 1), 0, 1)
    const newCameraZ = this.cameraZ + this.ease(Math.pow(t2, 1.2), 1.8) * this.cameraTravelDistance
    if (position.z > newCameraZ) {
      const dotDepthFromCamera = position.z - newCameraZ
      const x = this.viewZoom * position.x / dotDepthFromCamera
      const y = this.viewZoom * position.y / dotDepthFromCamera
      const sw = 400 * sizeFactor / dotDepthFromCamera
      this.ctx.lineWidth = sw
      this.ctx.beginPath()
      this.ctx.arc(x, y, 0.5, 0, Math.PI * 2)
      this.ctx.fill()
    }
  }

  drawStartDot() {
    if (this.time > this.changeEventTime) {
      const dy = this.cameraZ * this.startDotYOffset / this.viewZoom
      const position = new Vector3D(0, dy, this.cameraTravelDistance)
      this.showProjectedDot(position, 2.5)
    }
  }

  render() {
    const ctx = this.ctx
    if (!ctx) return
    ctx.fillStyle = 'black'
    ctx.fillRect(0, 0, this.size, this.size)
    ctx.save()
    ctx.translate(this.size / 2, this.size / 2)
    const t1 = this.constrain(this.map(this.time, 0, this.changeEventTime + 0.25, 0, 1), 0, 1)
    const t2 = this.constrain(this.map(this.time, this.changeEventTime, 1, 0, 1), 0, 1)
    ctx.rotate(-Math.PI * this.ease(t2, 2.7))
    this.drawTrail(t1)
    ctx.fillStyle = 'white'
    for (const star of this.stars) {
      star.render(t1, this)
    }
    this.drawStartDot()
    ctx.restore()
  }

  drawTrail(t1) {
    for (let i = 0; i < this.trailLength; i++) {
      const f = this.map(i, 0, this.trailLength, 1.1, 0.1)
      const sw = (1.3 * (1 - t1) + 3.0 * Math.sin(Math.PI * t1)) * f
      this.ctx.fillStyle = 'white'
      this.ctx.lineWidth = sw
      const pathTime = t1 - 0.00015 * i
      const position = this.spiralPath(pathTime)
      const basePos = position
      const offset = new Vector2D(position.x + 5, position.y + 5)
      const rotated = this.rotate(
        basePos,
        offset,
        Math.sin(this.time * Math.PI * 2) * 0.5 + 0.5,
        i % 2 === 0
      )
      this.ctx.beginPath()
      this.ctx.arc(rotated.x, rotated.y, sw / 2, 0, Math.PI * 2)
      this.ctx.fill()
    }
  }

  pause() { this.timeline.pause() }
  resume() { this.timeline.play() }
  destroy() { this.timeline.kill() }
}

class Star {
  constructor(cameraZ, cameraTravelDistance) {
    this.angle = Math.random() * Math.PI * 2
    this.distance = 30 * Math.random() + 15
    this.rotationDirection = Math.random() > 0.5 ? 1 : -1
    this.expansionRate = 1.2 + Math.random() * 0.8
    this.finalScale = 0.7 + Math.random() * 0.6
    this.dx = this.distance * Math.cos(this.angle)
    this.dy = this.distance * Math.sin(this.angle)
    this.spiralLocation = (1 - Math.pow(1 - Math.random(), 3.0)) / 1.3
    this.z = Vector2D.random(0.5 * cameraZ, cameraTravelDistance + cameraZ)
    const lerp = (start, end, t) => start * (1 - t) + end * t
    this.z = lerp(this.z, cameraTravelDistance / 2, 0.3 * this.spiralLocation)
    this.strokeWeightFactor = Math.pow(Math.random(), 2.0)
  }

  render(p, controller) {
    const spiralPos = controller.spiralPath(this.spiralLocation)
    const q = p - this.spiralLocation
    if (q <= 0) return

    const displacementProgress = controller.constrain(4 * q, 0, 1)
    const linearEasing = displacementProgress
    const elasticEasing = controller.easeOutElastic(displacementProgress)
    const powerEasing = Math.pow(displacementProgress, 2)

    let easing
    if (displacementProgress < 0.3) {
      easing = controller.lerp(linearEasing, powerEasing, displacementProgress / 0.3)
    } else if (displacementProgress < 0.7) {
      const t = (displacementProgress - 0.3) / 0.4
      easing = controller.lerp(powerEasing, elasticEasing, t)
    } else {
      easing = elasticEasing
    }

    let screenX, screenY

    if (displacementProgress < 0.3) {
      screenX = controller.lerp(spiralPos.x, spiralPos.x + this.dx * 0.3, easing / 0.3)
      screenY = controller.lerp(spiralPos.y, spiralPos.y + this.dy * 0.3, easing / 0.3)
    } else if (displacementProgress < 0.7) {
      const midProgress = (displacementProgress - 0.3) / 0.4
      const curveStrength = Math.sin(midProgress * Math.PI) * this.rotationDirection * 1.5
      const baseX = spiralPos.x + this.dx * 0.3
      const baseY = spiralPos.y + this.dy * 0.3
      const targetX = spiralPos.x + this.dx * 0.7
      const targetY = spiralPos.y + this.dy * 0.7
      const perpX = -this.dy * 0.4 * curveStrength
      const perpY = this.dx * 0.4 * curveStrength
      screenX = controller.lerp(baseX, targetX, midProgress) + perpX * midProgress
      screenY = controller.lerp(baseY, targetY, midProgress) + perpY * midProgress
    } else {
      const finalProgress = (displacementProgress - 0.7) / 0.3
      const baseX = spiralPos.x + this.dx * 0.7
      const baseY = spiralPos.y + this.dy * 0.7
      const targetDistance = this.distance * this.expansionRate * 1.5
      const spiralTurns = 1.2 * this.rotationDirection
      const spiralAngle = this.angle + spiralTurns * finalProgress * Math.PI
      const targetX = spiralPos.x + targetDistance * Math.cos(spiralAngle)
      const targetY = spiralPos.y + targetDistance * Math.sin(spiralAngle)
      screenX = controller.lerp(baseX, targetX, finalProgress)
      screenY = controller.lerp(baseY, targetY, finalProgress)
    }

    const vx = (this.z - controller.cameraZ) * screenX / controller.viewZoom
    const vy = (this.z - controller.cameraZ) * screenY / controller.viewZoom
    const position = new Vector3D(vx, vy, this.z)

    let sizeMultiplier = 1.0
    if (displacementProgress < 0.6) {
      sizeMultiplier = 1.0 + displacementProgress * 0.2
    } else {
      const t = (displacementProgress - 0.6) / 0.4
      sizeMultiplier = 1.2 * (1.0 - t) + this.finalScale * t
    }

    const dotSize = 8.5 * this.strokeWeightFactor * sizeMultiplier
    controller.showProjectedDot(position, dotSize)
  }
}

export function SpiralAnimation() {
  const canvasRef = useRef(null)
  const animationRef = useRef(null)
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  })

  useEffect(() => {
    const handleResize = () => {
      setDimensions({ width: window.innerWidth, height: window.innerHeight })
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const size = Math.max(dimensions.width, dimensions.height)

    canvas.width = size * dpr
    canvas.height = size * dpr
    canvas.style.width = `${dimensions.width}px`
    canvas.style.height = `${dimensions.height}px`
    ctx.scale(dpr, dpr)

    animationRef.current = new AnimationController(canvas, ctx, dpr, size)

    return () => {
      if (animationRef.current) {
        animationRef.current.destroy()
        animationRef.current = null
      }
    }
  }, [dimensions])

  return (
    <div className="spiral-canvas-wrapper">
      <canvas ref={canvasRef} className="spiral-canvas" />
    </div>
  )
}
```

- [ ] **Step 2: Verifica che il file sia stato creato correttamente**

```bash
head -5 /c/Users/DantePagani/ex_fantabrain/src/components/ui/SpiralAnimation.jsx
```

Expected: prima riga `// src/components/ui/SpiralAnimation.jsx`

- [ ] **Step 3: Commit**

```bash
cd /c/Users/DantePagani/ex_fantabrain
git add src/components/ui/SpiralAnimation.jsx
git commit -m "feat: add SpiralAnimation canvas component (port from 21dev TSX)"
```

---

## Task 3 — Crea `SpiralGate.jsx`

Overlay full-screen puro (no canvas al suo interno — sfrutta `SpiralAnimation` che sta nel layer sotto in `LandingPage`). Gestisce l'animazione del bottone "Entra →" e l'exit transition.

**Files:**
- Create: `src/components/ui/SpiralGate.jsx`

- [ ] **Step 1: Crea il file**

```jsx
// src/components/ui/SpiralGate.jsx
import { useState, useEffect } from 'react'

export function SpiralGate({ onEnter }) {
  const [buttonVisible, setButtonVisible] = useState(false)
  const [exiting, setExiting] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setButtonVisible(true), 2000)
    return () => clearTimeout(timer)
  }, [])

  function handleEnter() {
    setExiting(true)
    setTimeout(() => onEnter(), 800)
  }

  return (
    <div className={`spiral-gate${exiting ? ' spiral-gate--exiting' : ''}`}>
      <button
        className={`spiral-gate__btn${buttonVisible ? ' spiral-gate__btn--visible' : ''}`}
        onClick={handleEnter}
        type="button"
        aria-label="Entra nella waiting list di FantaBrain"
      >
        Entra →
      </button>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
cd /c/Users/DantePagani/ex_fantabrain
git add src/components/ui/SpiralGate.jsx
git commit -m "feat: add SpiralGate overlay component"
```

---

## Task 4 — Aggiunge classi CSS a `LandingPage.css`

Aggiunge tutte le classi necessarie per: canvas wrapper, gate overlay, spiral background, landing content transition, e pills modalità nel form.

**Files:**
- Modify: `src/pages/LandingPage.css`

- [ ] **Step 1: Aggiungi il blocco CSS alla fine di `LandingPage.css`**

Apri `src/pages/LandingPage.css` e **appendi in fondo**:

```css
/* ─── Spiral Canvas ─────────────────────────────── */
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

/* ─── Spiral Background Layer ───────────────────── */
.spiral-bg {
  position: fixed;
  inset: 0;
  z-index: 0;
  opacity: 1;
  transition: opacity 1s ease;
  pointer-events: none;
}

.spiral-bg--active {
  opacity: 0.12;
}

.spiral-bg--faded {
  opacity: 0;
}

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
  font-family: 'Syne', sans-serif;
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

.spiral-gate__btn:hover {
  letter-spacing: 0.32em;
}

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

/* ─── WaitlistForm — Modalità Pills ─────────────── */
.waitlist-form__modalita {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 4px 0 8px;
}

.waitlist-form__modalita-label {
  font-size: 14px;
  color: var(--text-secondary, #94A3B8);
  white-space: nowrap;
  flex-shrink: 0;
}

.waitlist-form__modalita-pills {
  display: flex;
  gap: 8px;
}

.waitlist-form__pill {
  padding: 7px 20px;
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  background: transparent;
  color: var(--text-secondary, #94A3B8);
  font-size: 14px;
  font-family: inherit;
  cursor: pointer;
  transition: border-color 0.2s ease, color 0.2s ease, background 0.2s ease;
}

.waitlist-form__pill:hover:not(:disabled) {
  border-color: rgba(255, 255, 255, 0.4);
  color: var(--text-primary, #F1F5F9);
}

.waitlist-form__pill--active {
  background: var(--accent-primary, #00d4ff);
  border-color: var(--accent-primary, #00d4ff);
  color: #050A14;
  font-weight: 600;
}

.waitlist-form__pill:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

- [ ] **Step 2: Commit**

```bash
cd /c/Users/DantePagani/ex_fantabrain
git add src/pages/LandingPage.css
git commit -m "feat: add spiral gate, spiral-bg, and form pill CSS classes"
```

---

## Task 5 — Aggiorna `LandingPage.jsx`

Aggiunge `hasEntered` state, hook `useSpiralFade`, importa `SpiralAnimation` e `SpiralGate`, e ristruttura il JSX con i layer sovrapposti.

**Files:**
- Modify: `src/pages/LandingPage.jsx`

- [ ] **Step 1: Sostituisci il contenuto del file con la versione aggiornata**

```jsx
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
        {/* Tracking scripts placeholder */}
        {/*
          GA4: Add to index.html <head>:
          <script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
          ...

          Meta Pixel: Add to index.html <head>:
          ...

          TikTok Pixel: Add to index.html <head>:
          ...
        */}

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
```

- [ ] **Step 2: Verifica che il file abbia i nuovi import**

```bash
head -30 /c/Users/DantePagani/ex_fantabrain/src/pages/LandingPage.jsx
```

Expected: righe con import di `SpiralAnimation` e `SpiralGate`

- [ ] **Step 3: Commit**

```bash
cd /c/Users/DantePagani/ex_fantabrain
git add src/pages/LandingPage.jsx
git commit -m "feat: integrate spiral gate and background into LandingPage"
```

---

## Task 6 — Aggiorna `WaitlistForm` in `LandingPage_part2.jsx`

Aggiunge toggle modalità (Mantra/Classica) e campo codice amico al form esistente. Solo la funzione `WaitlistForm` viene modificata — il resto del file rimane invariato.

**Files:**
- Modify: `src/pages/LandingPage_part2.jsx` — solo la funzione `WaitlistForm` (righe ~325–443)

- [ ] **Step 1: Sostituisci la funzione `WaitlistForm`**

Trova e sostituisci l'intera funzione `WaitlistForm` (dalla riga `export function WaitlistForm` fino alla parentesi di chiusura) con:

```jsx
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
        style={{ minHeight: '52px' }}
      >
        {loading ? 'Iscrizione in corso…' : "Mettiti in lista d'attesa →"}
      </button>
    </form>
  );
}
```

- [ ] **Step 2: Commit**

```bash
cd /c/Users/DantePagani/ex_fantabrain
git add src/pages/LandingPage_part2.jsx
git commit -m "feat: add modalita toggle and codice amico to WaitlistForm"
```

---

## Task 7 — Aggiunge route pubblica `/landing` in `App.jsx`

La `LandingPage` non era ancora nel router. Aggiunge una route pubblica (senza `RequireAuth`) prima della catch-all autenticata.

**Files:**
- Modify: `src/App.jsx`

- [ ] **Step 1: Aggiungi import e route in `App.jsx`**

Nella sezione degli import in cima al file, aggiungi:
```jsx
import LandingPage from './pages/LandingPage';
```

Nel blocco `<Routes>`, aggiungi la route **prima** di `<Route path="/*" element={<RequireAuth>...`:
```jsx
<Route path="/landing" element={<LandingPage />} />
```

Il blocco Routes risultante deve avere questo ordine:
```jsx
<Routes>
  <Route path="/login" element={<Login />} />
  <Route path="/register" element={<Register />} />
  <Route path="/warroom/:id" element={<WarroomShare />} />
  <Route path="/landing" element={<LandingPage />} />
  <Route path="/*" element={<RequireAuth><AppLayout /></RequireAuth>} />
</Routes>
```

- [ ] **Step 2: Commit**

```bash
cd /c/Users/DantePagani/ex_fantabrain
git add src/App.jsx
git commit -m "feat: add public /landing route for waiting list"
```

---

## Task 8 — Build & Smoke Test Manuale

Verifica che tutto compili e funzioni visivamente.

**Files:** nessuno (solo comandi)

- [ ] **Step 1: Avvia il dev server**

```bash
cd /c/Users/DantePagani/ex_fantabrain && npm run dev
```

Expected: `VITE vX.X.X ready` senza errori TypeScript o import mancanti.

- [ ] **Step 2: Apri `http://localhost:5173/#/landing` nel browser**

Verifica checklist visiva:
- [ ] Spirale 3D animata occupa tutto lo schermo su sfondo nero
- [ ] Dopo ~2 secondi compare il bottone "Entra →" con pulsazione
- [ ] Hover sul bottone allarga il letter-spacing
- [ ] Click su "Entra →":
  - [ ] Gate svanisce in ~800ms
  - [ ] Spirale rimane visibile ma si dimezza l'intensità
  - [ ] Contenuto landing page appare con slide-up
- [ ] Scroll fino al 60%+ della pagina: spirale svanisce completamente
- [ ] Nella sezione waitlist: toggle Mantra/Classica funziona (pill attiva evidenziata in cyan)
- [ ] Campo "Codice amico (opzionale)" presente
- [ ] Submit senza email mostra errore "Inserisci la tua email."
- [ ] Submit senza GDPR mostra errore Privacy Policy
- [ ] Submit valido mostra messaggio di successo "✅ Sei dentro!"

- [ ] **Step 3: Build di produzione**

```bash
cd /c/Users/DantePagani/ex_fantabrain && npm run build
```

Expected: `✓ built in Xs` senza errori.

- [ ] **Step 4: Commit finale (se non già fatto)**

```bash
cd /c/Users/DantePagani/ex_fantabrain
git status
# se ci sono modifiche non committate:
git add -A
git commit -m "chore: verify build for spiral entry landing feature"
```

---

## Note per l'implementatore

- **Importazioni**: `SpiralAnimation` e `SpiralGate` usano named export (`export function ...`) — importare con `{ SpiralAnimation }` e `{ SpiralGate }`.
- **GSAP**: importato come `import { gsap } from 'gsap'` — usare i singoli simboli necessari per evitare bundle bloat.
- **Canvas sizing**: il canvas si ridimensiona via `useEffect` sul cambio di `dimensions` — è normale che riavvii l'animazione al resize.
- **Route**: `/landing` è accessibile senza login — non serve token JWT. Per il deploy production, Render servirà questa route dal SPA fallback in `server.js` già configurato.
- **`'use client'`** rimosso perché direttiva Next.js, non necessaria in Vite.
