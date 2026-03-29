# Design Spec — Spiral Entry Animation per FantaBrain Landing

**Data:** 2026-03-29
**Progetto:** ex_fantabrain
**Feature:** Animazione d'ingresso spirale sulla waiting list landing page

---

## Obiettivo

Aggiungere un'animazione d'effetto full-screen come gate di ingresso alla landing page/waiting list di FantaBrain. L'utente vede la spirale, clicca "Entra", la spirale rimane come sfondo vivo mentre il contenuto della landing page emerge sopra.

---

## Approccio scelto

**Approccio A — Gate di stato in LandingPage.**
`hasEntered` state in `LandingPage`. Spirale full-screen prima del click; dopo il click diventa sfondo fisso a bassa opacità mentre il contenuto emerge con transizione CSS.

---

## Architettura & Componenti

### File nuovi

#### `src/components/ui/SpiralAnimation.jsx`
- Canvas animation portata dal TSX 21dev a JSX puro (no TypeScript, no shadcn)
- Classi interne: `Vector2D`, `Vector3D`, `AnimationController`, `Star`
- Dipendenza: `gsap` (timeline `repeat: -1`, durata 15s per ciclo)
- Props: nessuna — self-contained, dimensioni dal viewport
- Gestione DPR per display retina
- Cleanup corretto via `useEffect` return (destroy timeline)

#### `src/components/ui/SpiralGate.jsx`
- Wrapper full-screen per la spirale d'ingresso
- Props: `onEnter: () => void`
- Bottone "Entra →" appare con fade-in dopo 2000ms (`setTimeout`)
- Styling: `position: fixed, inset: 0, z-index: 50, background: black`
- Bottone: testo bianco, `tracking-[0.2em]`, uppercase, `animate-pulse`, hover espande `letter-spacing`
- Click bottone → chiama `onEnter()`, poi auto-nasconde con `opacity: 0` (800ms)

### File modificati

#### `src/pages/LandingPage.jsx`
- Aggiunge `hasEntered` state (`useState(false)`) — unico state necessario
- Struttura JSX:
  ```jsx
  <div className="landing">
    {/* Spirale sfondo fisso — sempre montata, CSS la gestisce */}
    <div className={`spiral-bg ${hasEntered ? 'spiral-bg--active' : ''}`}>
      <SpiralAnimation />
    </div>

    {/* Gate intro — visibile solo se !hasEntered */}
    {!hasEntered && (
      <SpiralGate onEnter={() => setHasEntered(true)} />
    )}

    {/* Contenuto landing — emerge dopo hasEntered */}
    <div className={`landing-content ${hasEntered ? 'landing-content--visible' : ''}`}>
      <LandingNav />
      <main>...</main>
      <LandingFooter />
    </div>
  </div>
  ```
- CSS classes per transizioni:
  - `.spiral-bg`: `position: fixed, inset: 0, z-index: 0, opacity: 0, transition: opacity 1s`
  - `.spiral-bg--active`: `opacity: 0.12`
  - `.landing-content`: `opacity: 0, transform: translateY(20px), transition: opacity 0.6s 0.2s, transform 0.6s 0.2s`
  - `.landing-content--visible`: `opacity: 1, transform: translateY(0)`
- Scroll handler: spiral opacity → 0 oltre 60% scroll depth (riusa pattern `useScrollDepth` già presente)

#### `src/pages/LandingPage_part2.jsx` — WaitlistForm
Aggiunge 2 nuovi campi al form esistente (nome + email + GDPR):

1. **Toggle Modalità** (obbligatorio, default: `'mantra'`)
   - Due pill button `Mantra` / `Classica`
   - Styled con classi design system: `btn` base + stato attivo con `btn--primary`
   - State: `const [modalita, setModalita] = useState('mantra')`

2. **Codice Amico** (opzionale)
   - Input testuale, placeholder `"Codice amico (opzionale)"`
   - State: `const [codiceAmico, setCodiceAmico] = useState('')`
   - Nessuna validazione richiesta (campo opzionale)

Entrambi i campi passati nel payload del submit (attualmente mock `setTimeout`, pronti per endpoint reale).

#### `src/App.jsx`
- Aggiunge route pubblica **`/landing`** prima delle route autenticate:
  ```jsx
  <Route path="/landing" element={<LandingPage />} />
  ```
- LandingPage non richiede auth (è pubblica per acquisizione waitlist)

---

## Dipendenze

| Package | Versione | Note |
|---------|----------|------|
| `gsap` | latest | `npm install gsap` in `ex_fantabrain/` |

---

## Transizione "Enter" — sequenza dettagliata

1. Utente vede spirale full screen (gate), bottone "Entra →" appare dopo 2s
2. Click → `setHasEntered(true)`
3. `SpiralGate`: `opacity: 0, pointer-events: none` (CSS transition 800ms) → poi `display: none`
4. `SpiralAnimation`: riposizionata come sfondo fisso (z-index 0, opacity 0.12)
5. Contenuto landing: `opacity: 1, translateY: 0` (transition 600ms, delay 200ms)
6. Scroll > 60%: spirale si dissolve (`opacity: 0`, smooth transition 1s)

---

## Regole progetto rispettate

- JSX puro (no TypeScript) — portato da `.tsx` a `.jsx`
- No shadcn — styling con Tailwind v4 + design system esistente (`LandingPage.css`)
- No inline styles salvo eccezioni documentate
- Componenti nuovi in `src/components/ui/`
- Naming: PascalCase per componenti
- UI labels in italiano (`"Entra →"`, `"Mantra"`, `"Classica"`, `"Codice amico (opzionale)"`)

---

## Out of scope

- Integrazione backend per il submit del form (già prevista come TODO esistente — swap mock fetch)
- Deploy Vercel della landing separata
- Tracking GA4/Meta/TikTok pixel (già come placeholder in LandingPage.jsx)
