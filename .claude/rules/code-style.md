# Regole di Stile — FantaBrain

## Lingua

- UI (labels, messaggi, placeholder, tooltip): **sempre italiano**
- Codice (variabili, funzioni, commenti tecnici): inglese

## React

- Componenti funzionali con hooks — zero class components
- Props distruttorate sempre nella firma del componente
- Zustand per state globale, `useState` solo per state locale al componente
- **Tutti gli store Zustand usano default export** — importare SEMPRE senza `{}`
- Selettori reattivi inline nei componenti — non chiamare getter non-reattivi fuori da useStore
- Lazy loading per le pagine con `React.lazy` + `Suspense`

## CSS / Tailwind

- Tailwind CSS v4 utility-first
- Design system: `src/styles/design-system.css` — usare le classi e custom properties già definite
- Colori: deep navy background, electric blue primario (`--accent-primary: #00d4ff`), cyan accenti, gold premium (`--gold: #f5c518`)
- Font: `Syne` per titoli/numeri (`--font-display`), `Inter` per testo normale (`--font-body`)
- NO librerie UI esterne (no shadcn, no MUI, no Chakra)
- NO librerie chart esterne — solo SVG/CSS custom
- NO inline styles salvo casi eccezionali documentati

## Naming

- Componenti: PascalCase (`PlayerCard.jsx`)
- Hook custom: camelCase prefissati con `use` (`useLeagueStore.js`)
- Costanti: SCREAMING_SNAKE_CASE (`MAX_ROSE_SIZE`)
- Store Zustand: `use*Store.js` (`useAppStore.js`, `useSerieAStore.js`, `useLeagueStore.js`)
- Store v4 con persist: specificare sempre `name` e `version` nel middleware persist

## Struttura file

- Componenti UI riusabili: `src/components/ui/`
- Componenti layout: `src/components/layout/`
- Componenti formazione: `src/components/formation/`
- Pagine: `src/pages/`
- Store: `src/store/` (useAppStore) e `src/stores/` (useSerieAStore, useLeagueStore)
- Servizi API: `src/services/`
- Client AI: `src/lib/claudeApi.js`
- Dati statici/mock: `src/data/`

## Fix minimali

- Non refactorizzare codice non coinvolto nel task
- Non aggiungere commenti o docstring a codice non modificato
- Non aggiungere feature non richieste
- Non cambiare design system senza conferma di Dante
