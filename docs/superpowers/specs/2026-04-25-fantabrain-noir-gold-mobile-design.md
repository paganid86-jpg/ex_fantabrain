# FantaBrain - Noir Gold Mobile Restyle Design Spec

**Data:** 2026-04-25  
**Autore:** Dante Pagani + Codex  
**Stato:** Self-reviewed, ready for user review  
**Direzione approvata:** Noir Gold minimal-lux  
**Mockup di riferimento:** `.superpowers/brainstorm/51880-1777149240/content/noir-gold-screens.html`

---

## 1. Contesto

FantaBrain ha gia' una base mobile-first con React, HashRouter, Zustand, Tailwind CSS v4 e un design system custom in `src/styles/design-system.css`. La UI attuale ha una direzione premium sportiva chiamata "Luxury Sports OS", ma l'ultima review visuale ha chiarito una preferenza piu' precisa: meno cockpit, meno rumore, piu' minimalismo con un accento moderno e luxury.

La nuova direzione scelta e' **Noir Gold**: nero caldo come superficie principale, latte come colore di testo, oro solo per azioni e segnali importanti. Il prodotto deve sembrare un assistente personale di alto livello per il fantacalcio, non una dashboard piena di widget.

Questa spec definisce il design da implementare. Non modifica ancora codice applicativo.

## 2. Obiettivi

- Rendere l'app piu' pulita, adulta e riconoscibile su mobile.
- Ridurre la densita' decorativa mantenendo una forte identita' premium.
- Far emergere una sola decisione principale per schermata.
- Migliorare ergonomia mobile: touch target ampi, safe area, CTA leggibili.
- Preservare logica, store, API e route esistenti.
- Consolidare il design system invece di aggiungere stili isolati pagina per pagina.

## 3. Non obiettivi

- Nessun cambio a backend, auth, credits, AI calls o proxy calcio.
- Nessun cambio alla struttura persistita degli store Zustand.
- Nessuna chiamata backend per le leghe: il sistema resta localStorage-only.
- Nessun nuovo dato mock per la rosa.
- Nessuna nuova feature funzionale oltre al restyle e alla razionalizzazione UI.
- Nessuna migrazione a librerie UI esterne.

## 4. Principi di design

### 4.1 Minimal-lux pragmatico

Il lusso non deve arrivare da texture, glow pesanti o molte card decorative. Deve arrivare da:

- spazio verticale controllato;
- gerarchia tipografica chiara;
- bordi sottili;
- superfici scure calde;
- oro usato raramente;
- CTA primarie inequivocabili.

### 4.2 Una metrica dominante

Ogni schermata principale deve avere un solo elemento dominante:

- Home: punteggio o indice giornata.
- Schieramento: modulo/punteggio atteso + campo.
- AI Coach: contesto letto + thread.
- Classifica: posizione o trend utente.
- News: evento o insight piu' recente.

Le informazioni secondarie vanno in righe compatte, non in griglie affollate.

### 4.3 Oro come comando, non come decorazione

L'oro identifica:

- CTA primaria;
- piano Gold;
- AI premium;
- stato attivo selezionato solo quando serve;
- segnali di valore positivo.

Non va usato per tutti i bordi, tutte le icone o tutte le card. Se tutto e' oro, nulla e' importante.

### 4.4 Mobile-first reale

Target base: 375px di larghezza. Tutto deve funzionare prima in una mano:

- touch target minimi 44px;
- bottom nav con 5 voci massimo;
- niente interazioni hover-only;
- contenuto non nascosto dietro nav o safe area;
- CTA primaria raggiungibile senza precision tap;
- testo italiano leggibile senza truncation aggressiva.

### 4.5 Continuita' con FantaBrain

Noir Gold non deve cancellare il brand. Deve evolvere i token attuali:

- mantenere il rapporto scuro/latte;
- mantenere l'accento oro gia' presente;
- ridurre plum a firma secondaria o legacy bridge;
- preservare componenti come `HeroBlock`, `DeadlinePill`, `QuickCard`, `BottomSheet`, `SchieraTabBar`, `FormationEditor` dove possibile.

## 5. Palette

### 5.1 Core tokens

```css
--color-noir: #0a090b;
--color-noir-panel: #121013;
--color-noir-elevated: #181417;
--color-milk: #fff3e6;
--color-gold: #d8b46a;
--color-gold-light: #f0dba7;
--color-plum: #381932;
```

### 5.2 Semantic tokens

```css
--color-success: #82aa8b;
--color-danger: #d97872;
--color-info: #7f92ad;
--color-warning: var(--color-gold);
```

### 5.3 Surface tokens

```css
--bg: var(--color-noir);
--fg: var(--color-milk);
--fg-70: rgba(255, 243, 230, 0.70);
--fg-55: rgba(255, 243, 230, 0.55);
--fg-35: rgba(255, 243, 230, 0.35);
--fg-15: rgba(255, 243, 230, 0.15);
--fg-08: rgba(255, 243, 230, 0.08);
--fg-04: rgba(255, 243, 230, 0.04);
--surface: rgba(255, 243, 230, 0.045);
--surface-hover: rgba(255, 243, 230, 0.075);
--border-subtle: rgba(255, 243, 230, 0.09);
--border: rgba(255, 243, 230, 0.14);
--border-gold: rgba(216, 180, 106, 0.26);
```

### 5.4 Background formula

Default app background:

```css
background:
  radial-gradient(circle at 20% -10%, rgba(216, 180, 106, 0.12), transparent 34%),
  radial-gradient(circle at 90% 18%, rgba(255, 243, 230, 0.05), transparent 30%),
  linear-gradient(135deg, #151015 0%, #080708 68%, #120f0c 100%);
```

This should be defined once in the design system or shell class, not repeated per page.

## 6. Typography

The selected mockup uses a serif display tone for the luxury signal and a neutral sans for utility. Implementation can use the current fonts initially, but the final direction should support:

- display: editorial serif for hero titles and big metrics;
- body: existing readable sans;
- mono: metadata, labels, score tags, deadlines.

Recommended tokens:

```css
--font-display: Georgia, "Times New Roman", serif;
--font-body: "Inter", system-ui, sans-serif;
--font-mono: "JetBrains Mono", ui-monospace, monospace;
```

Default decision: do not change the global app font in the first pass. Introduce Noir Gold classes that use the serif only for redesigned page titles, hero metrics and selected editorial headings.

Type rules:

- Hero metric: 72-96px mobile, serif, weight 400, tight line-height.
- Page title: 36-44px mobile, serif, weight 400.
- Section title: 16-20px, sans or display depending on context.
- Body: 13-15px, line-height 1.4-1.55.
- Kicker: 10-11px, mono, uppercase, letter spacing positive.
- Buttons: 14px, sans, 850-950 weight, no uppercase requirement.

Do not use negative letter spacing on body text.

## 7. Layout system

### 7.1 App shell

Keep the existing `FloatingPanel` + `BottomNav` architecture for now, but visually simplify it:

- reduce chrome effects and radial clutter;
- use one warm black app surface;
- keep max width for desktop preview;
- maintain bottom inset for nav and safe area;
- keep panel header compact and optional on deeply immersive pages.

### 7.2 Cards and surfaces

Cards should be simple repeated items, not nested visual containers. Preferred surface:

```css
background: rgba(255, 243, 230, 0.045);
border: 1px solid rgba(255, 243, 230, 0.09);
border-radius: 18px;
```

Hero surfaces can use radius 28-30px and a subtle gold radial highlight.

### 7.3 Bottom navigation

Keep 5 tabs with the current product labels:

- Home
- Schiera
- Classif.
- News
- AI

Rules:

- active item uses milk translucent fill, not full gold by default;
- AI can use gold accent only when the menu is open or Gold state matters;
- labels must remain Italian and short;
- touch target min 44px;
- bottom safe area preserved.
- `XI` and `Lega` can remain visual shorthand inside mockups and internal notes, but implementation should keep `Schiera` and `Classif.` unless user explicitly approves a navigation rename.

## 8. Screen designs

### 8.1 Home

Purpose: answer "what should I do now?" in one glance.

Structure:

1. Compact top row: brand/league + AI credits.
2. Editorial title: "Matchday essenziale." or dynamic Italian greeting.
3. Hero metric: last score, expected index, or nearest matchday status.
4. Two actions: primary `Schiera ora`, secondary `Coach`.
5. Three signal rows:
   - deadline schieramento;
   - formation completeness;
   - risk/injury alert.

Design changes from current dashboard:

- reduce 2x2 quick-card grid prominence;
- avoid four equal cards above the fold;
- use alert rows for secondary info;
- make deadline and action more immediate.

Acceptance criteria:

- On 375px width, primary CTA visible without scrolling after title and hero.
- No emoji structural icons.
- No text overlap in greeting, hero or action row.
- Empty league state still offers `Crea lega` and `Unisciti`.

### 8.2 Schieramento

Purpose: build the XI with the least possible friction.

Structure:

1. Top row: page context + current module.
2. Title: "Forma il tuo undici."
3. Toolbar with two large chips:
   - modulo;
   - punteggio atteso / titolari count.
4. Pitch as the main visual object.
5. Status rows below pitch:
   - missing starters;
   - bench readiness;
   - incompatible role warnings.
6. CTA when incomplete: `Completa formazione`.

Interaction:

- Tapping module opens existing `BottomSheet`.
- Tapping slot opens existing player picker.
- Formation drag/drop behavior should remain unchanged.
- The Rosa tab remains inside Schieramento.

Acceptance criteria:

- Pitch remains usable on 375px width.
- Slot labels remain readable.
- Player picker buttons are at least 44px high.
- Injured players are disabled and visually distinct.

### 8.3 AI Coach

Purpose: make AI feel like a private analyst, not a sci-fi console.

Structure:

1. Top row: `Private Analyst` + credits or Gold state.
2. Title: "Coach, senza rumore."
3. Context card: what the AI has read.
4. Chat thread.
5. Prompt grid: four compact prompt actions.
6. Composer fixed at bottom of the coach shell.

Behavior:

- Keep calls through backend only: `/api/ai/chat` or `/api/ai/groq` via existing client.
- Keep credit gating.
- Keep reset chat action, but make it visually secondary.
- Error and loading states remain inline.

Acceptance criteria:

- Composer stays usable above bottom nav and safe area.
- Prompt buttons are touch-friendly.
- Loading state is visible within 300ms.
- Credit exhaustion state gives a clear recovery/reset date.

### 8.4 Classifica

Purpose: understand position, trend and next threat quickly.

Structure:

1. Segmented control: `Lega` / `Serie A`.
2. Hero position card for the user's team.
3. Compact standings rows.
4. Mini trend sparkline or recent result tags.

Changes:

- Remove inline style sprawl over time.
- Replace wide tables on mobile with ranked cards first.
- Keep Serie A table available, but optimized for horizontal scroll only when necessary.

Acceptance criteria:

- User row is visually discoverable.
- Serie A error/loading states remain clear.
- No emoji legends; use text and color with accessible labels.

### 8.5 League creation and settings

Purpose: make setup feel guided and premium.

Changes:

- Replace emoji-based cards with vector/letter marks.
- Use a clean stepper with numbers/checks.
- Keep labels visible; no placeholder-only fields.
- Keep final confirmation and invite code copy.

Acceptance criteria:

- All inputs have visible labels.
- Step navigation is reachable and clear.
- Join code errors appear near the field.

## 9. Components to introduce or adapt

Prefer adapting existing components before creating new abstractions.

### 9.1 `MetricHero`

Reusable hero for Home/Classifica:

Props:

- `kicker`
- `value`
- `label`
- `delta`
- `tone`
- `action`

Can evolve from `HeroBlock`.

### 9.2 `SignalRow`

Compact row for alerts and state:

Props:

- `tone`: neutral | success | warning | danger | gold
- `label`
- `value`
- `to`

Use instead of overusing full cards.

### 9.3 `NoirActionRow`

Two-button row:

- primary full CTA;
- secondary subdued CTA.

Must wrap correctly on narrow widths.

### 9.4 `ContextCard`

AI Coach context summary:

- kicker;
- short body;
- optional count chips.

### 9.5 Bottom nav refinements

Existing `BottomNav` can stay. Visual changes:

- active state becomes milk translucent;
- remove heavy gold fill except AI overlay or premium state;
- keep current routes.

## 10. Data flow and state

No new data source is required.

Use existing selectors inline in components:

- `useAppStore` for auth, rosa, schieramento, credits.
- `useLeagueStore` for current league and localStorage-only leagues.
- `useSerieAStore` for Serie A data via football proxy.

No persisted store shape change is planned. If implementation later changes persisted fields, increment `fantabrain-store-vN` and add migration, per repo rule.

AI client calls must remain backend mediated through `src/lib/claudeApi.js`.

Football data must remain proxied through `/api/football/`.

## 11. Accessibility and mobile UX

Required checks:

- Normal text contrast at least WCAG AA.
- Touch targets at least 44px high/wide.
- Icon-only buttons require `aria-label`.
- Focus states remain visible.
- Reduced motion is respected for decorative transitions.
- Forms keep visible labels.
- No UI meaning conveyed by color alone.
- No horizontal scroll except intentional data tables.
- Bottom nav does not obscure scroll content.

Motion guidance:

- 120-180ms for tap feedback.
- 220-280ms for tab/sheet transitions.
- Avoid decorative infinite motion.
- Use transform/opacity only for animated transitions.

## 12. Rollout plan

This is design scope, not implementation instructions, but the recommended rollout is:

1. Foundation tokens and Noir Gold shell adjustments.
2. Home restyle using hero metric + signal rows.
3. Schieramento restyle using cleaner pitch shell and toolbar chips.
4. AI Coach restyle using context card, calmer chat and prompt grid.
5. Classifica mobile cleanup.
6. League creation/settings cleanup.
7. Visual QA and accessibility pass.

Each phase should avoid backend changes unless a bug is discovered.

## 13. Testing strategy

Manual and automated checks should cover:

- `npm run build`
- visual check at 375px, 390px, 430px, 768px and desktop panel width;
- Home with active league and no league;
- Schieramento with empty rosa and populated rosa;
- AI Coach with credits, no credits and Gold user;
- Classifica with empty league, local league data, Serie A loading and error states;
- keyboard focus through bottom nav and forms.

Recommended browser QA:

- verify no text overlap;
- verify bottom nav safe area;
- verify buttons remain tappable;
- verify pitch and composer are not hidden behind fixed UI.

## 14. Default decisions for implementation

These defaults remove ambiguity for the implementation plan. The user can still override them during review.

1. Bottom nav labels stay `Home / Schiera / Classif. / News / AI`.
2. Serif display styling applies only to redesigned page titles, hero metrics and selected editorial headings.
3. Dark Noir Gold is the primary target for this phase. Light mode should remain functional, but full light-mode polish is deferred until the dark mobile experience is stable.

## 15. Approval checkpoint

This spec is ready for user review. After approval, the next step is to create an implementation plan that breaks the rollout into small commits and verification checkpoints.
