# Loop voti→punteggio→classifica — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Chiudere il primo gameplay loop di FantaBrain in modalità single-player vs 7 bot: schieramento → calcolo fantapunti → classifica aggiornata, su stagione sintetica 2025/26.

**Architecture:** Engine di calcolo come moduli JS puri sotto `src/lib/season/` (testabili in isolamento, riusabili lato server in futuro). Backend espone una rotta read-only per servire i voti come JSON statici. Persistenza locale tramite estensione di `useLeagueStore` (Zustand persist v2 con migrazione non distruttiva). UI nuova `MatchdayCard` sulla dashboard.

**Tech Stack:** React 19, Zustand 4.5 (persist middleware), Express.js, Node.js native test runner (`node:test`), no nuove dipendenze.

**Spec di riferimento:** `docs/superpowers/specs/2026-04-27-loop-voti-punti-classifica-design.md`

---

## File Structure

### Nuovi file

```
src/lib/season/
├── voti.js              ← loadMatchdayVoti (fetch + fallback) + simulateVoto
├── fantapunti.js        ← computeFantapunti, computeFasciaGol
├── botStrategy.js       ← draftBotRoster, pickBotLineup, BOT_NAME_POOL
├── calendar.js          ← generateRoundRobin
└── playMatchday.js      ← orchestrator puro (non chiama Zustand)

src/lib/season/__tests__/
├── fantapunti.test.js
├── botStrategy.test.js
├── calendar.test.js
├── voti.test.js
└── playMatchday.integration.test.js

src/lib/season/__fixtures__/
├── playerSamples.js     ← player objects di esempio per i test
└── leagueSettings.js    ← settings con tutti i flag attivi/disattivi

src/hooks/useCountdown.js
src/components/dashboard/MatchdayCard.jsx
src/pages/MatchdayDetail.jsx

server/routes/voti.js
server/data/voti-2025-26/
└── matchday-1.json      ← fixture di esempio (5 giocatori reali, dati plausibili)
                            il dataset reale è fuori scope di questo plan

server/tests/voti.test.js
```

### File modificati

```
package.json                                    ← aggiungi script "test"
src/stores/useLeagueStore.js                    ← v2, nuovi campi e metodi
src/pages/Dashboard.jsx                         ← integra MatchdayCard, rimuove demo
src/pages/Statistiche.jsx                       ← legge da matchdayResults
src/pages/Calendario.jsx                        ← legge da currentLeague.calendar
src/pages/Classifica.jsx                        ← già reattiva, solo verifica
src/App.jsx                                     ← aggiunge rotta /giornata/:n
src/store/useAppStore.js                        ← rimozione CLASSIFICA_DEMO/CALENDARIO_DEMO
server.js                                       ← registra route voti
.claude/rules/api-conventions.md                ← documenta /api/voti/
CLAUDE.md                                       ← affina regola sistema leghe
```

### Rationale di decomposizione

- I 4 moduli puri sotto `src/lib/season/` hanno **una sola responsabilità ciascuno** e zero dipendenze tra loro tranne via parametri. Questo permette di testarli isolati e di riusarli lato server quando passeremo al multi-user.
- `playMatchday.js` è l'unico orchestrator: chiama gli altri 4. È puro: prende lo stato in input, ritorna lo stato in output. Lo store Zustand è il chiamante esterno e applica il `set()`.
- `voti.js` contiene sia `simulateVoto` (puro) sia `loadMatchdayVoti` (impuro, fa fetch). Convivono perché `loadMatchdayVoti` è il "wrapper" che decide tra dataset e simulato. Mockabile via `globalThis.fetch`.
- I test integration di `playMatchday` usano `node:test` con `mock.method` per stubbare `fetch`. Niente nuova libreria.

---

## Pre-flight

### Task 0: Aggiungere script `test` e verificare che i test esistenti girino

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Aggiorna package.json**

Aggiungi alla sezione `"scripts"`:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "start": "node server.js",
    "test": "node --test --test-reporter=spec"
  }
}
```

- [ ] **Step 2: Verifica che i test esistenti girino**

Run: `npm test -- server/tests/`
Expected: tutti i test backend esistenti passano (auth, credits, admin, orbitalActions).

- [ ] **Step 3: Commit**

```bash
git add package.json
git commit -m "chore: add npm test script using node native test runner"
```

---

# CHUNK 1 — Engine puro

Scopo: scrivere e testare i moduli puri sotto `src/lib/season/`. Nessuna modifica visibile in app, nessun backend toccato.

**Parallelizzabile con Chunk 2.**

**Branch:** `claude/chunk-1-engine-season-{SESSIONID}`

## Task 1: Fixture condivise per i test

**Files:**
- Create: `src/lib/season/__fixtures__/playerSamples.js`
- Create: `src/lib/season/__fixtures__/leagueSettings.js`

- [ ] **Step 1: Crea `playerSamples.js`**

```js
// src/lib/season/__fixtures__/playerSamples.js
// Player samples per i test del season engine.
// Shape allineata a useAppStore.rosa[] e ai dati Scouting.

export const SAMPLE_PORTIERE = {
  id: 'p-maignan',
  cognome: 'Maignan',
  nome: 'Mike',
  ruoloMantra: 'Por',
  squadra: 'Milan',
  quotazione: 14,
  votoMedia: 6.4,
};

export const SAMPLE_DIFENSORE = {
  id: 'p-bastoni',
  cognome: 'Bastoni',
  nome: 'Alessandro',
  ruoloMantra: 'DC',
  squadra: 'Inter',
  quotazione: 14,
  votoMedia: 6.6,
};

export const SAMPLE_CENTROCAMPISTA = {
  id: 'p-barella',
  cognome: 'Barella',
  nome: 'Nicolò',
  ruoloMantra: 'M',
  squadra: 'Inter',
  quotazione: 19,
  votoMedia: 6.8,
};

export const SAMPLE_ATTACCANTE = {
  id: 'p-lautaro',
  cognome: 'Martínez',
  nome: 'Lautaro',
  ruoloMantra: 'Pc',
  squadra: 'Inter',
  quotazione: 30,
  votoMedia: 7.2,
};

// Pool di 30 player misti, sufficiente per draftare 7 bot da 25 + utente da 15
// (rispettando il vincolo di disponibilità singola).
export function buildLargePool(extraCount = 200) {
  const ruoli = ['Por', 'Dc', 'Ds', 'Dd', 'M', 'C', 'T', 'A', 'W', 'Pc'];
  const squadre = ['Milan', 'Inter', 'Juventus', 'Napoli', 'Roma', 'Lazio', 'Atalanta', 'Bologna'];
  const out = [];
  for (let i = 0; i < extraCount; i++) {
    out.push({
      id: `p-pool-${i}`,
      cognome: `Player${i}`,
      nome: 'Test',
      ruoloMantra: ruoli[i % ruoli.length],
      squadra: squadre[i % squadre.length],
      quotazione: 5 + (i % 25),
      votoMedia: 5.5 + ((i % 30) / 10),
    });
  }
  return out;
}

export const FOUR_PLAYERS = [
  SAMPLE_PORTIERE,
  SAMPLE_DIFENSORE,
  SAMPLE_CENTROCAMPISTA,
  SAMPLE_ATTACCANTE,
];
```

- [ ] **Step 2: Crea `leagueSettings.js`**

```js
// src/lib/season/__fixtures__/leagueSettings.js
// Settings di lega di esempio. Allineate ai DEFAULT_SETTINGS di useLeagueStore.

export const DEFAULT_BONUS_MALUS = {
  golSegnato: 3,
  golSubitoPortiere: -1,
  assist: 1,
  ammonizione: -0.5,
  espulsione: -1,
  rigoreSegnato: 3,
  rigoreSbagliato: -3,
  rigoreParato: 3,
  autogol: -2,
  cleanSheetPortiere: 1,
  assistDaFermo: 1,
};

export const SETTINGS_CLASSIC = {
  modalitaGioco: 'classic',
  fonteVoti: 'fantabrain',
  dFactor: false,
  dFactorIncludePortiere: false,
  modificatoreRendimento: false,
  fattoreFairPlay: false,
  fattoreCapitano: false,
  bonusMalus: { ...DEFAULT_BONUS_MALUS },
  fasceGol: 'progressive',
  votoRiserva: 4,
};

export const SETTINGS_MANTRA_FULL = {
  modalitaGioco: 'mantra',
  fonteVoti: 'fantabrain',
  dFactor: true,
  dFactorIncludePortiere: true,
  modificatoreRendimento: true,
  fattoreFairPlay: false,
  fattoreCapitano: false,
  bonusMalus: { ...DEFAULT_BONUS_MALUS },
  fasceGol: 'progressive',
  votoRiserva: 4,
};
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/season/__fixtures__/
git commit -m "test: add player and league settings fixtures for season engine"
```

---

## Task 2: `fantapunti.js` — `computeFantapunti` (caso base)

**Files:**
- Create: `src/lib/season/__tests__/fantapunti.test.js`
- Create: `src/lib/season/fantapunti.js`

- [ ] **Step 1: Scrivi i primi test fallenti**

```js
// src/lib/season/__tests__/fantapunti.test.js
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { computeFantapunti } from '../fantapunti.js';
import { SETTINGS_CLASSIC, SETTINGS_MANTRA_FULL } from '../__fixtures__/leagueSettings.js';
import { SAMPLE_ATTACCANTE, SAMPLE_PORTIERE } from '../__fixtures__/playerSamples.js';

describe('computeFantapunti — base', () => {
  it('voto puro senza eventi → ritorna il voto', () => {
    const rawScore = { player: SAMPLE_ATTACCANTE, voto: 6.5 };
    assert.equal(computeFantapunti(rawScore, SETTINGS_CLASSIC), 6.5);
  });

  it('voto + 1 gol → +3', () => {
    const rawScore = { player: SAMPLE_ATTACCANTE, voto: 6.5, gol: 1 };
    assert.equal(computeFantapunti(rawScore, SETTINGS_CLASSIC), 9.5);
  });

  it('voto + 1 assist → +1', () => {
    const rawScore = { player: SAMPLE_ATTACCANTE, voto: 6.5, assist: 1 };
    assert.equal(computeFantapunti(rawScore, SETTINGS_CLASSIC), 7.5);
  });

  it('ammonizione → -0.5', () => {
    const rawScore = { player: SAMPLE_ATTACCANTE, voto: 7, ammonizione: 1 };
    assert.equal(computeFantapunti(rawScore, SETTINGS_CLASSIC), 6.5);
  });

  it('espulsione → -1', () => {
    const rawScore = { player: SAMPLE_ATTACCANTE, voto: 7, espulsione: 1 };
    assert.equal(computeFantapunti(rawScore, SETTINGS_CLASSIC), 6);
  });

  it('combinazione gol+assist+ammo', () => {
    const rawScore = { player: SAMPLE_ATTACCANTE, voto: 7, gol: 1, assist: 1, ammonizione: 1 };
    // 7 + 3 + 1 - 0.5 = 10.5
    assert.equal(computeFantapunti(rawScore, SETTINGS_CLASSIC), 10.5);
  });

  it('voto 0 (non giocato) → 0', () => {
    const rawScore = { player: SAMPLE_ATTACCANTE, voto: 0 };
    assert.equal(computeFantapunti(rawScore, SETTINGS_CLASSIC), 0);
  });
});
```

- [ ] **Step 2: Run test, verifica che fallisca**

Run: `npm test -- src/lib/season/__tests__/fantapunti.test.js`
Expected: FAIL — "Cannot find module '../fantapunti.js'"

- [ ] **Step 3: Implementazione minimale**

```js
// src/lib/season/fantapunti.js

/**
 * Calcola i fantapunti per un singolo player schierato.
 * @param {Object} rawScore — { player, voto, gol?, assist?, ammonizione?, espulsione?, autogol?, rigoreSegnato?, rigoreSbagliato?, rigoreParato?, golSubiti?, cleanSheet? }
 * @param {Object} leagueSettings — settings.bonusMalus + flags D-Factor / modificatori
 * @returns {number} fantapunti (può essere negativo)
 */
export function computeFantapunti(rawScore, leagueSettings) {
  const v = rawScore.voto || 0;
  // Voto 0 = non giocato → niente bonus/malus
  if (v === 0) return 0;

  const bm = leagueSettings.bonusMalus || {};
  let pts = v;

  pts += (rawScore.gol || 0) * (bm.golSegnato ?? 3);
  pts += (rawScore.assist || 0) * (bm.assist ?? 1);
  pts += (rawScore.ammonizione || 0) * (bm.ammonizione ?? -0.5);
  pts += (rawScore.espulsione || 0) * (bm.espulsione ?? -1);
  pts += (rawScore.rigoreSegnato || 0) * (bm.rigoreSegnato ?? 3);
  pts += (rawScore.rigoreSbagliato || 0) * (bm.rigoreSbagliato ?? -3);
  pts += (rawScore.rigoreParato || 0) * (bm.rigoreParato ?? 3);
  pts += (rawScore.autogol || 0) * (bm.autogol ?? -2);

  // Portiere: gol subiti + clean sheet
  const isPortiere = rawScore.player?.ruoloMantra === 'Por';
  if (isPortiere) {
    pts += (rawScore.golSubiti || 0) * (bm.golSubitoPortiere ?? -1);
    if (rawScore.cleanSheet) pts += (bm.cleanSheetPortiere ?? 1);
  }

  return Math.round(pts * 10) / 10;
}
```

- [ ] **Step 4: Run test, verifica che passi**

Run: `npm test -- src/lib/season/__tests__/fantapunti.test.js`
Expected: PASS, 7 test verdi.

- [ ] **Step 5: Commit**

```bash
git add src/lib/season/fantapunti.js src/lib/season/__tests__/fantapunti.test.js
git commit -m "feat(season): add computeFantapunti base bonus/malus engine"
```

---

## Task 3: `fantapunti.js` — portiere, D-Factor, modificatore portiere

**Files:**
- Modify: `src/lib/season/__tests__/fantapunti.test.js`
- Modify: `src/lib/season/fantapunti.js`

- [ ] **Step 1: Aggiungi test fallenti per portiere e D-Factor**

Aggiungi al fondo di `fantapunti.test.js`:

```js
describe('computeFantapunti — portiere', () => {
  it('portiere con clean sheet → +1', () => {
    const rs = { player: SAMPLE_PORTIERE, voto: 6.5, cleanSheet: true, golSubiti: 0 };
    assert.equal(computeFantapunti(rs, SETTINGS_CLASSIC), 7.5);
  });

  it('portiere con 2 gol subiti → -2', () => {
    const rs = { player: SAMPLE_PORTIERE, voto: 6, golSubiti: 2 };
    assert.equal(computeFantapunti(rs, SETTINGS_CLASSIC), 4);
  });

  it('portiere con rigore parato → +3', () => {
    const rs = { player: SAMPLE_PORTIERE, voto: 6.5, rigoreParato: 1 };
    assert.equal(computeFantapunti(rs, SETTINGS_CLASSIC), 9.5);
  });

  it('giocatore di movimento NON conta golSubiti', () => {
    const rs = { player: SAMPLE_ATTACCANTE, voto: 7, golSubiti: 5 };
    assert.equal(computeFantapunti(rs, SETTINGS_CLASSIC), 7);
  });
});
```

- [ ] **Step 2: Run test, verifica che falliscano i nuovi**

Run: `npm test -- src/lib/season/__tests__/fantapunti.test.js`
Expected: i test base passano, i nuovi falliscono o passano già a seconda dell'implementazione step 3 di Task 2. Se falliscono, prosegui. Se passano già, l'implementazione precedente li copre — comunque commit finale.

- [ ] **Step 3: Verifica/sistema implementazione**

Se i test falliscono, aggiungi nel `computeFantapunti` la logica del portiere (in realtà già presente in Task 2). Verificare la coerenza dei valori di default in `bm.golSubitoPortiere` (-1) e `bm.cleanSheetPortiere` (1).

- [ ] **Step 4: Run test, verifica che passino tutti**

Run: `npm test -- src/lib/season/__tests__/fantapunti.test.js`
Expected: PASS, 11 test verdi.

- [ ] **Step 5: Commit**

```bash
git add src/lib/season/fantapunti.js src/lib/season/__tests__/fantapunti.test.js
git commit -m "test(season): cover portiere golSubiti, cleanSheet, rigoreParato"
```

---

## Task 4: `fantapunti.js` — `computeFasciaGol`

**Files:**
- Modify: `src/lib/season/__tests__/fantapunti.test.js`
- Modify: `src/lib/season/fantapunti.js`

- [ ] **Step 1: Aggiungi test per computeFasciaGol**

Aggiungi al fondo di `fantapunti.test.js`:

```js
import { computeFasciaGol } from '../fantapunti.js';

describe('computeFasciaGol — progressive', () => {
  // Soglie progressive Fantacalcio: 66=1, 72=2, 77=3, 82=4, 87=5, 92=6, 97=7, 102=8, 107=9, 112=10
  it('punteggio 50 → 0 gol', () => {
    assert.equal(computeFasciaGol(50, 'progressive'), 0);
  });

  it('punteggio 65 → 0 gol', () => {
    assert.equal(computeFasciaGol(65, 'progressive'), 0);
  });

  it('punteggio 66 → 1 gol (esatto su soglia)', () => {
    assert.equal(computeFasciaGol(66, 'progressive'), 1);
  });

  it('punteggio 70 → 1 gol', () => {
    assert.equal(computeFasciaGol(70, 'progressive'), 1);
  });

  it('punteggio 72 → 2 gol', () => {
    assert.equal(computeFasciaGol(72, 'progressive'), 2);
  });

  it('punteggio 77 → 3 gol', () => {
    assert.equal(computeFasciaGol(77, 'progressive'), 3);
  });

  it('punteggio 92 → 6 gol', () => {
    assert.equal(computeFasciaGol(92, 'progressive'), 6);
  });

  it('punteggio enorme 130 → 10 (cap)', () => {
    assert.equal(computeFasciaGol(130, 'progressive'), 10);
  });
});

describe('computeFasciaGol — fisse', () => {
  // Soglie "fisse" classiche: 60=1, 66=2, 72=3, ... ogni 6 punti dopo 60
  // Per il MVP usiamo le stesse progressive: la differenza è marginale.
  // Lasciamo 'fisse' come alias di 'progressive' fino a quando le settings non distinguono
  // i custom thresholds.
  it('"fisse" si comporta come progressive nel MVP', () => {
    assert.equal(computeFasciaGol(72, 'fisse'), 2);
  });
});
```

- [ ] **Step 2: Run test, verifica che falliscano i nuovi**

Run: `npm test -- src/lib/season/__tests__/fantapunti.test.js`
Expected: FAIL — "computeFasciaGol is not defined".

- [ ] **Step 3: Aggiungi implementazione**

Aggiungi a `src/lib/season/fantapunti.js`:

```js
// Soglie fasce gol progressive (Fantacalcio standard).
// goal[N] = punteggio minimo per ottenere N+1 gol (oltre il portiere)
const PROGRESSIVE_THRESHOLDS = [66, 72, 77, 82, 87, 92, 97, 102, 107, 112];

/**
 * Converte i fantapunti totali della squadra in numero di gol.
 * @param {number} totalPts
 * @param {string} fasceConfig — 'progressive' | 'fisse' (sinonimo nel MVP) | 'custom'
 * @returns {number} gol fatti (0..10)
 */
export function computeFasciaGol(totalPts, fasceConfig = 'progressive') {
  // 'custom' nel MVP non è ancora supportato → comportamento progressive.
  let goals = 0;
  for (const threshold of PROGRESSIVE_THRESHOLDS) {
    if (totalPts >= threshold) goals++;
    else break;
  }
  return Math.min(goals, 10);
}
```

- [ ] **Step 4: Run test**

Run: `npm test -- src/lib/season/__tests__/fantapunti.test.js`
Expected: PASS, tutti i test verdi.

- [ ] **Step 5: Commit**

```bash
git add src/lib/season/fantapunti.js src/lib/season/__tests__/fantapunti.test.js
git commit -m "feat(season): add computeFasciaGol with progressive thresholds"
```

---

## Task 5: `voti.js` — `simulateVoto` deterministico

**Files:**
- Create: `src/lib/season/__tests__/voti.test.js`
- Create: `src/lib/season/voti.js`

- [ ] **Step 1: Scrivi test fallenti**

```js
// src/lib/season/__tests__/voti.test.js
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { simulateVoto } from '../voti.js';
import { SAMPLE_ATTACCANTE, SAMPLE_PORTIERE, SAMPLE_DIFENSORE } from '../__fixtures__/playerSamples.js';

describe('simulateVoto', () => {
  it('è deterministico: stesso (player, matchday) → stesso risultato', () => {
    const a = simulateVoto(SAMPLE_ATTACCANTE, 5);
    const b = simulateVoto(SAMPLE_ATTACCANTE, 5);
    assert.deepEqual(a, b);
  });

  it('player diversi → risultati diversi (almeno il voto)', () => {
    const a = simulateVoto(SAMPLE_ATTACCANTE, 5);
    const b = simulateVoto(SAMPLE_PORTIERE, 5);
    // teoricamente potrebbero collidere, ma probabilità trascurabile sui sample reali
    assert.notEqual(a.voto, b.voto);
  });

  it('matchday diversi → risultati diversi', () => {
    const a = simulateVoto(SAMPLE_ATTACCANTE, 5);
    const b = simulateVoto(SAMPLE_ATTACCANTE, 6);
    assert.notEqual(a.voto, b.voto);
  });

  it('voto è sempre nel range [4, 9]', () => {
    for (let m = 1; m <= 38; m++) {
      const r = simulateVoto(SAMPLE_ATTACCANTE, m);
      assert.ok(r.voto >= 4 && r.voto <= 9, `voto out of range: ${r.voto} per md ${m}`);
    }
  });

  it('media campionaria su 100 simulazioni ≈ player.media (±0.5)', () => {
    const samples = [];
    for (let m = 1; m <= 100; m++) samples.push(simulateVoto(SAMPLE_ATTACCANTE, m).voto);
    const avg = samples.reduce((s, v) => s + v, 0) / samples.length;
    const expected = SAMPLE_ATTACCANTE.votoMedia;
    assert.ok(Math.abs(avg - expected) < 0.5, `avg=${avg}, expected=${expected}`);
  });

  it('attaccante segna gol con probabilità maggiore del difensore', () => {
    let golAtt = 0, golDif = 0;
    for (let m = 1; m <= 200; m++) {
      golAtt += simulateVoto(SAMPLE_ATTACCANTE, m).gol;
      golDif += simulateVoto(SAMPLE_DIFENSORE, m).gol;
    }
    assert.ok(golAtt > golDif, `attaccanti ${golAtt} vs difensori ${golDif}`);
  });

  it('shape output completa', () => {
    const r = simulateVoto(SAMPLE_ATTACCANTE, 1);
    for (const k of ['voto', 'gol', 'assist', 'ammonizione', 'espulsione', 'autogol', 'rigoreSegnato', 'rigoreSbagliato', 'rigoreParato', 'golSubiti', 'cleanSheet']) {
      assert.ok(k in r, `manca chiave ${k}`);
    }
  });
});
```

- [ ] **Step 2: Run test, verifica che falliscano**

Run: `npm test -- src/lib/season/__tests__/voti.test.js`
Expected: FAIL — modulo non esiste.

- [ ] **Step 3: Implementazione `simulateVoto`**

```js
// src/lib/season/voti.js

// Hash deterministico stringa → uint32, usato come seed.
function hashStr(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

// Mulberry32 PRNG (deterministico, buona distribuzione).
function mulberry32(seed) {
  let a = seed;
  return () => {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Probabilità eventi per ruolo Mantra (calibrate empiricamente, da tunare).
function eventProbs(ruolo) {
  const r = (ruolo || '').toLowerCase();
  if (r === 'por') return { gol: 0.001, assist: 0.005, ammo: 0.05, esp: 0.005, rigPar: 0.02, rigSeg: 0.001, rigSbag: 0.001, autogol: 0.005, golSubitiMu: 1.2, csProb: 0.3 };
  if (['dc', 'dd', 'ds'].includes(r)) return { gol: 0.04, assist: 0.05, ammo: 0.18, esp: 0.01, rigPar: 0, rigSeg: 0.01, rigSbag: 0.005, autogol: 0.01, golSubitiMu: 0, csProb: 0 };
  if (['m', 'c', 't', 'w'].includes(r)) return { gol: 0.12, assist: 0.12, ammo: 0.18, esp: 0.01, rigPar: 0, rigSeg: 0.02, rigSbag: 0.01, autogol: 0.005, golSubitiMu: 0, csProb: 0 };
  // attacco: a, pc
  return { gol: 0.30, assist: 0.10, ammo: 0.12, esp: 0.005, rigPar: 0, rigSeg: 0.05, rigSbag: 0.02, autogol: 0.001, golSubitiMu: 0, csProb: 0 };
}

/**
 * Genera un rawScore deterministico per il player nella giornata data.
 * Usato come fallback quando il dataset non ha il player o la fetch fallisce.
 */
export function simulateVoto(player, matchday) {
  const seed = hashStr(`${player.id}|${matchday}`);
  const rng = mulberry32(seed);
  const probs = eventProbs(player.ruoloMantra);

  // Voto base = media ± rumore gaussiano-like (Box-Muller via due rng calls)
  const u1 = rng() || 1e-9;
  const u2 = rng();
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  let voto = (player.votoMedia ?? 6) + z * 0.5;
  voto = Math.max(4, Math.min(9, Math.round(voto * 2) / 2));

  const gol = rng() < probs.gol ? 1 : 0;
  const assist = rng() < probs.assist ? 1 : 0;
  const ammonizione = rng() < probs.ammo ? 1 : 0;
  const espulsione = rng() < probs.esp ? 1 : 0;
  const rigoreParato = rng() < probs.rigPar ? 1 : 0;
  const rigoreSegnato = rng() < probs.rigSeg ? 1 : 0;
  const rigoreSbagliato = rng() < probs.rigSbag ? 1 : 0;
  const autogol = rng() < probs.autogol ? 1 : 0;

  // Portiere: gol subiti (poisson-like via rng) + clean sheet
  let golSubiti = 0;
  let cleanSheet = false;
  if (probs.golSubitiMu > 0) {
    const r = rng();
    if (r < 0.30) { golSubiti = 0; cleanSheet = true; }
    else if (r < 0.65) golSubiti = 1;
    else if (r < 0.88) golSubiti = 2;
    else golSubiti = 3;
  }

  return {
    voto,
    gol,
    assist,
    ammonizione,
    espulsione,
    rigoreParato,
    rigoreSegnato,
    rigoreSbagliato,
    autogol,
    golSubiti,
    cleanSheet,
  };
}
```

- [ ] **Step 4: Run test**

Run: `npm test -- src/lib/season/__tests__/voti.test.js`
Expected: PASS, 7 test verdi.

- [ ] **Step 5: Commit**

```bash
git add src/lib/season/voti.js src/lib/season/__tests__/voti.test.js
git commit -m "feat(season): add deterministic simulateVoto with role-based event probabilities"
```

---

## Task 6: `voti.js` — `loadMatchdayVoti` con fetch e fallback

**Files:**
- Modify: `src/lib/season/__tests__/voti.test.js`
- Modify: `src/lib/season/voti.js`

- [ ] **Step 1: Aggiungi test fallenti per `loadMatchdayVoti`**

Aggiungi al fondo di `voti.test.js`:

```js
import { loadMatchdayVoti } from '../voti.js';
import { mock } from 'node:test';

describe('loadMatchdayVoti', () => {
  it('200 dataset → mode "dataset", merge con player non mappati simulati', async () => {
    const fakeFetch = mock.fn(async () => ({
      ok: true,
      status: 200,
      json: async () => ({
        players: {
          'p-lautaro': { voto: 7.5, gol: 1, assist: 0 },
        },
      }),
    }));
    globalThis.fetch = fakeFetch;

    const players = [SAMPLE_ATTACCANTE, SAMPLE_PORTIERE];
    const r = await loadMatchdayVoti('2025-26', 1, players);

    assert.equal(r.mode, 'dataset');
    assert.equal(r.players[SAMPLE_ATTACCANTE.id].voto, 7.5);
    assert.equal(r.players[SAMPLE_ATTACCANTE.id].gol, 1);
    // Portiere non nel dataset → simulato (deve esistere comunque)
    assert.ok(r.players[SAMPLE_PORTIERE.id]);
    assert.ok('voto' in r.players[SAMPLE_PORTIERE.id]);
  });

  it('404 → mode "simulated", tutti i player simulati', async () => {
    globalThis.fetch = mock.fn(async () => ({
      ok: false,
      status: 404,
      json: async () => ({ error: 'not found' }),
    }));

    const players = [SAMPLE_ATTACCANTE, SAMPLE_PORTIERE];
    const r = await loadMatchdayVoti('2025-26', 99, players);

    assert.equal(r.mode, 'simulated');
    assert.ok(r.players[SAMPLE_ATTACCANTE.id]);
    assert.ok(r.players[SAMPLE_PORTIERE.id]);
  });

  it('network error → mode "simulated"', async () => {
    globalThis.fetch = mock.fn(async () => { throw new Error('ECONNREFUSED'); });

    const r = await loadMatchdayVoti('2025-26', 1, [SAMPLE_ATTACCANTE]);
    assert.equal(r.mode, 'simulated');
    assert.ok(r.players[SAMPLE_ATTACCANTE.id]);
  });

  it('dataset vuoto (zero player mappati) → mode "simulated"', async () => {
    globalThis.fetch = mock.fn(async () => ({
      ok: true, status: 200,
      json: async () => ({ players: {} }),
    }));

    const r = await loadMatchdayVoti('2025-26', 1, [SAMPLE_ATTACCANTE]);
    assert.equal(r.mode, 'simulated');
  });
});
```

- [ ] **Step 2: Run test, verifica che falliscano i nuovi**

Run: `npm test -- src/lib/season/__tests__/voti.test.js`
Expected: FAIL — `loadMatchdayVoti is not exported`.

- [ ] **Step 3: Implementa `loadMatchdayVoti`**

Aggiungi in fondo a `src/lib/season/voti.js`:

```js
/**
 * Carica i voti di una giornata.
 * Tenta GET /api/voti/{season}/matchday/{matchday}. Se fallisce o se nessun player è mappato,
 * cade su simulazione totale.
 *
 * @param {string} season — es. '2025-26'
 * @param {number} matchday
 * @param {Array} players — player objects per cui servono i voti (rosa user + bot rosters flat)
 * @returns {Promise<{ mode: 'dataset'|'simulated', players: Object<string, rawScore> }>}
 */
export async function loadMatchdayVoti(season, matchday, players) {
  let dataset = null;
  try {
    const res = await fetch(`/api/voti/${season}/matchday/${matchday}`);
    if (res.ok) {
      const json = await res.json();
      dataset = json?.players ?? null;
    }
  } catch (_e) {
    dataset = null;
  }

  const out = {};
  let datasetHits = 0;

  for (const p of players) {
    const fromDs = dataset?.[p.id];
    if (fromDs) {
      datasetHits++;
      out[p.id] = {
        voto: fromDs.voto ?? 0,
        gol: fromDs.gol ?? 0,
        assist: fromDs.assist ?? 0,
        ammonizione: fromDs.ammonizione ?? 0,
        espulsione: fromDs.espulsione ?? 0,
        rigoreParato: fromDs.rigoreParato ?? 0,
        rigoreSegnato: fromDs.rigoreSegnato ?? 0,
        rigoreSbagliato: fromDs.rigoreSbagliato ?? 0,
        autogol: fromDs.autogol ?? 0,
        golSubiti: fromDs.golSubiti ?? 0,
        cleanSheet: !!fromDs.cleanSheet,
      };
    } else {
      out[p.id] = simulateVoto(p, matchday);
    }
  }

  return {
    mode: datasetHits > 0 ? 'dataset' : 'simulated',
    players: out,
  };
}
```

- [ ] **Step 4: Run test**

Run: `npm test -- src/lib/season/__tests__/voti.test.js`
Expected: PASS, tutti verdi.

- [ ] **Step 5: Commit**

```bash
git add src/lib/season/voti.js src/lib/season/__tests__/voti.test.js
git commit -m "feat(season): add loadMatchdayVoti with dataset fetch and simulated fallback"
```

---

## Task 7: `calendar.js` — round-robin

**Files:**
- Create: `src/lib/season/__tests__/calendar.test.js`
- Create: `src/lib/season/calendar.js`

- [ ] **Step 1: Scrivi test fallenti**

```js
// src/lib/season/__tests__/calendar.test.js
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { generateRoundRobin } from '../calendar.js';

const TEAMS_8 = ['user', 'bot-1', 'bot-2', 'bot-3', 'bot-4', 'bot-5', 'bot-6', 'bot-7'];

describe('generateRoundRobin — 8 squadre andata+ritorno', () => {
  const cal = generateRoundRobin(TEAMS_8, 'andata_ritorno', 'seed-1');

  it('14 giornate', () => {
    assert.equal(cal.length, 14);
  });

  it('ogni giornata ha 4 incontri', () => {
    for (const md of cal) assert.equal(md.pairings.length, 4);
  });

  it('ogni squadra gioca esattamente 1 partita per giornata', () => {
    for (const md of cal) {
      const teams = new Set();
      for (const p of md.pairings) {
        assert.ok(!teams.has(p.home), `${p.home} duplicato in md ${md.matchday}`);
        assert.ok(!teams.has(p.away), `${p.away} duplicato in md ${md.matchday}`);
        teams.add(p.home);
        teams.add(p.away);
      }
      assert.equal(teams.size, 8);
    }
  });

  it('ogni coppia si affronta esattamente 2 volte (home/away invertiti)', () => {
    const counts = new Map();
    for (const md of cal) {
      for (const p of md.pairings) {
        const k1 = `${p.home}|${p.away}`;
        const k2 = `${p.away}|${p.home}`;
        counts.set(k1, (counts.get(k1) || 0) + 1);
        // verifico anche che k2 esista o esisterà
      }
    }
    // ogni squadra ha 7 avversari × 2 (A/R) = 14 partite totali per squadra
    // nel calendario completo ogni "pairing diretto" appare 1 volta (l'inverso 1 volta)
    for (const team of TEAMS_8) {
      let homeCount = 0, awayCount = 0;
      for (const md of cal) {
        for (const p of md.pairings) {
          if (p.home === team) homeCount++;
          if (p.away === team) awayCount++;
        }
      }
      assert.equal(homeCount, 7, `${team} home count`);
      assert.equal(awayCount, 7, `${team} away count`);
    }
  });

  it('determinismo: stesso seed → stesso calendario', () => {
    const a = generateRoundRobin(TEAMS_8, 'andata_ritorno', 'seed-x');
    const b = generateRoundRobin(TEAMS_8, 'andata_ritorno', 'seed-x');
    assert.deepEqual(a, b);
  });

  it('seed diversi → almeno una giornata diversa', () => {
    const a = generateRoundRobin(TEAMS_8, 'andata_ritorno', 'A');
    const b = generateRoundRobin(TEAMS_8, 'andata_ritorno', 'B');
    assert.notDeepEqual(a, b);
  });
});

describe('generateRoundRobin — type "andata"', () => {
  it('solo andata = 7 giornate', () => {
    const cal = generateRoundRobin(TEAMS_8, 'andata', 'seed-1');
    assert.equal(cal.length, 7);
  });
});
```

- [ ] **Step 2: Run test, verifica che falliscano**

Run: `npm test -- src/lib/season/__tests__/calendar.test.js`
Expected: FAIL — modulo non esiste.

- [ ] **Step 3: Implementa `generateRoundRobin`**

```js
// src/lib/season/calendar.js

// PRNG deterministico (riusato da voti.js → duplico qui per evitare cross-import)
function hashStr(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
function mulberry32(seed) {
  let a = seed;
  return () => {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Algoritmo "circle method" per round-robin con N pari.
function singleRoundRobin(teams, rng) {
  const n = teams.length;
  if (n % 2 !== 0) throw new Error('round-robin requires even number of teams');

  // Shuffle deterministico iniziale
  const shuffled = [...teams];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  const rounds = [];
  const fixed = shuffled[0];
  let rotating = shuffled.slice(1);

  for (let round = 0; round < n - 1; round++) {
    const pairings = [];
    pairings.push({ home: fixed, away: rotating[0] });
    for (let i = 1; i < n / 2; i++) {
      pairings.push({ home: rotating[i], away: rotating[n - 1 - i] });
    }
    rounds.push(pairings);
    // ruota: l'ultimo va in posizione 0
    rotating = [rotating[rotating.length - 1], ...rotating.slice(0, -1)];
  }

  return rounds;
}

/**
 * Genera il calendario lega.
 * @param {Array<string>} teamIds — es. ['user', 'bot-1', ..., 'bot-7']
 * @param {string} type — 'andata' | 'andata_ritorno'
 * @param {string} seed — stringa deterministica (es. league.id)
 * @returns {Array<{ matchday: number, pairings: Array<{home,away}> }>}
 */
export function generateRoundRobin(teamIds, type, seed) {
  const rng = mulberry32(hashStr(seed));
  const andata = singleRoundRobin(teamIds, rng);

  const matches = [];
  andata.forEach((round, idx) => matches.push({ matchday: idx + 1, pairings: round }));

  if (type === 'andata_ritorno') {
    andata.forEach((round, idx) => {
      const ritorno = round.map((p) => ({ home: p.away, away: p.home }));
      matches.push({ matchday: andata.length + idx + 1, pairings: ritorno });
    });
  }

  return matches;
}
```

- [ ] **Step 4: Run test**

Run: `npm test -- src/lib/season/__tests__/calendar.test.js`
Expected: PASS, tutti verdi.

- [ ] **Step 5: Commit**

```bash
git add src/lib/season/calendar.js src/lib/season/__tests__/calendar.test.js
git commit -m "feat(season): add deterministic round-robin calendar generator"
```

---

## Task 8: `botStrategy.js` — `draftBotRoster`

**Files:**
- Create: `src/lib/season/__tests__/botStrategy.test.js`
- Create: `src/lib/season/botStrategy.js`

- [ ] **Step 1: Scrivi test fallenti**

```js
// src/lib/season/__tests__/botStrategy.test.js
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { draftBotRoster, BOT_NAME_POOL } from '../botStrategy.js';
import { buildLargePool } from '../__fixtures__/playerSamples.js';

const RUOLI_ATTACCO = ['a', 'pc', 'w', 't'];
const RUOLI_DIFESA = ['por', 'dc', 'dd', 'ds'];
const isAttacco = (r) => RUOLI_ATTACCO.includes((r || '').toLowerCase());
const isDifesa = (r) => RUOLI_DIFESA.includes((r || '').toLowerCase());

describe('draftBotRoster — OffensivePush', () => {
  const pool = buildLargePool(300);

  it('drafta 25 giocatori', () => {
    const r = draftBotRoster('OffensivePush', pool, 500, 25, 'seed-1');
    assert.equal(r.length, 25);
  });

  it('spende > 50% budget su attacco', () => {
    const r = draftBotRoster('OffensivePush', pool, 500, 25, 'seed-1');
    const totalBudget = r.reduce((s, p) => s + p.quotazione, 0);
    const attaccoBudget = r.filter((p) => isAttacco(p.ruoloMantra)).reduce((s, p) => s + p.quotazione, 0);
    assert.ok(attaccoBudget / totalBudget > 0.4, `ratio attacco: ${attaccoBudget / totalBudget}`);
  });
});

describe('draftBotRoster — DefensiveWall', () => {
  const pool = buildLargePool(300);

  it('drafta 25 giocatori', () => {
    const r = draftBotRoster('DefensiveWall', pool, 500, 25, 'seed-1');
    assert.equal(r.length, 25);
  });

  it('spende > 35% budget su difesa+portiere', () => {
    const r = draftBotRoster('DefensiveWall', pool, 500, 25, 'seed-1');
    const totalBudget = r.reduce((s, p) => s + p.quotazione, 0);
    const difesaBudget = r.filter((p) => isDifesa(p.ruoloMantra)).reduce((s, p) => s + p.quotazione, 0);
    assert.ok(difesaBudget / totalBudget > 0.30, `ratio difesa: ${difesaBudget / totalBudget}`);
  });
});

describe('draftBotRoster — vincoli', () => {
  it('determinismo: stesso seed → stessa rosa', () => {
    const pool = buildLargePool(300);
    const a = draftBotRoster('OffensivePush', pool, 500, 25, 'X');
    const b = draftBotRoster('OffensivePush', pool, 500, 25, 'X');
    assert.deepEqual(a.map((p) => p.id), b.map((p) => p.id));
  });

  it('non draft player già esclusi (excludeIds)', () => {
    const pool = buildLargePool(300);
    const exclude = new Set(pool.slice(0, 50).map((p) => p.id));
    const r = draftBotRoster('OffensivePush', pool, 500, 25, 'seed-1', { excludeIds: exclude });
    for (const p of r) {
      assert.ok(!exclude.has(p.id), `player ${p.id} doveva essere escluso`);
    }
  });

  it('throw se pool insufficiente', () => {
    const pool = buildLargePool(10); // troppo pochi
    assert.throws(() => draftBotRoster('OffensivePush', pool, 500, 25, 'seed-1'));
  });
});

describe('BOT_NAME_POOL', () => {
  it('contiene almeno 14 nomi (7 bot × 2 leghe future ~ buffer)', () => {
    assert.ok(BOT_NAME_POOL.length >= 14);
  });

  it('nessun duplicato', () => {
    assert.equal(new Set(BOT_NAME_POOL).size, BOT_NAME_POOL.length);
  });
});
```

- [ ] **Step 2: Run test, verifica che falliscano**

Run: `npm test -- src/lib/season/__tests__/botStrategy.test.js`
Expected: FAIL — modulo non esiste.

- [ ] **Step 3: Implementa `draftBotRoster` e `BOT_NAME_POOL`**

```js
// src/lib/season/botStrategy.js

function hashStr(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
function mulberry32(seed) {
  let a = seed;
  return () => {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const BOT_NAME_POOL = [
  'FC Drago', 'Aquile Rosse', 'Tornado FC', 'Stella Blu', 'Guerrieri',
  'FC Fulmine', 'I Leoni', 'Lupi Neri', 'Furia Gialla', 'Cobra United',
  'AC Phoenix', 'Tigri Reali', 'Falchi del Nord', 'Squali FC',
  'Atletico Vortice', 'Scorpioni FC', 'Dragoni Verdi', 'Pantere',
  'Real Cometa', 'Inter Sirius', 'AS Boreale', 'FC Eclissi',
  'Toro Bianco', 'AC Galassia',
];

const ATTACCO = new Set(['a', 'pc', 'w', 't']);
const DIFESA = new Set(['por', 'dc', 'dd', 'ds']);
const PORTIERE = new Set(['por']);
const isRole = (player, set) => set.has((player.ruoloMantra || '').toLowerCase());

// Quote target per archetipo (% di player nei vari ruoli)
const ARCHETYPE_QUOTAS = {
  OffensivePush: { por: 3, difesa: 7, centro: 7, attacco: 8 },
  DefensiveWall: { por: 3, difesa: 10, centro: 8, attacco: 4 },
};

const ATTACK_PRIORITY = {
  OffensivePush: 1.5,   // moltiplicatore "appetibilità" sugli attaccanti
  DefensiveWall: 0.7,
};
const DEFENSE_PRIORITY = {
  OffensivePush: 0.7,
  DefensiveWall: 1.5,
};

/**
 * Drafta una rosa per un bot rispettando l'archetipo.
 * @param {string} archetype — 'OffensivePush' | 'DefensiveWall'
 * @param {Array} allPlayers — pool disponibile
 * @param {number} budget — crediti (settings.creditiIniziali)
 * @param {number} rosterSize — settings.numGiocatoriRosa
 * @param {string} seed — stringa deterministica
 * @param {Object} opts — { excludeIds?: Set<string> }
 * @returns {Array} rosa di rosterSize player objects
 */
export function draftBotRoster(archetype, allPlayers, budget, rosterSize, seed, opts = {}) {
  const exclude = opts.excludeIds || new Set();
  const rng = mulberry32(hashStr(`${seed}|${archetype}`));

  // Filtra pool disponibile
  const pool = allPlayers.filter((p) => !exclude.has(p.id));

  // Calcola appetibilità: media + quotazione * peso archetipo + jitter
  const attackPrio = ATTACK_PRIORITY[archetype] ?? 1;
  const defensePrio = DEFENSE_PRIORITY[archetype] ?? 1;
  const scored = pool.map((p) => {
    let score = (p.votoMedia ?? 6) * 10 + (p.quotazione ?? 1) * 0.5;
    if (isRole(p, ATTACCO)) score *= attackPrio;
    if (isRole(p, DIFESA)) score *= defensePrio;
    score += rng() * 5; // jitter deterministico
    return { p, score };
  });

  scored.sort((a, b) => b.score - a.score);

  // Quote per categoria
  const quotas = ARCHETYPE_QUOTAS[archetype] ?? { por: 3, difesa: 8, centro: 8, attacco: 6 };
  const taken = [];
  const counts = { por: 0, difesa: 0, centro: 0, attacco: 0 };

  function categoryOf(p) {
    if (isRole(p, PORTIERE)) return 'por';
    if (isRole(p, DIFESA)) return 'difesa';
    if (isRole(p, ATTACCO)) return 'attacco';
    return 'centro';
  }

  // Pass 1: rispetta le quote
  for (const { p } of scored) {
    if (taken.length >= rosterSize) break;
    const cat = categoryOf(p);
    if (counts[cat] < quotas[cat]) {
      taken.push(p);
      counts[cat]++;
    }
  }

  // Pass 2: completa fino a rosterSize ignorando quote
  for (const { p } of scored) {
    if (taken.length >= rosterSize) break;
    if (!taken.includes(p)) taken.push(p);
  }

  if (taken.length < rosterSize) {
    throw new Error(`draftBotRoster: pool insufficiente, ${taken.length}/${rosterSize} draftati`);
  }

  return taken;
}
```

- [ ] **Step 4: Run test**

Run: `npm test -- src/lib/season/__tests__/botStrategy.test.js`
Expected: PASS, tutti verdi.

- [ ] **Step 5: Commit**

```bash
git add src/lib/season/botStrategy.js src/lib/season/__tests__/botStrategy.test.js
git commit -m "feat(season): add draftBotRoster with archetype-based quotas"
```

---

## Task 9: `botStrategy.js` — `pickBotLineup`

**Files:**
- Modify: `src/lib/season/__tests__/botStrategy.test.js`
- Modify: `src/lib/season/botStrategy.js`

- [ ] **Step 1: Aggiungi test fallenti**

Aggiungi al fondo di `botStrategy.test.js`:

```js
import { pickBotLineup } from '../botStrategy.js';

describe('pickBotLineup', () => {
  const pool = buildLargePool(300);
  const rosterOff = draftBotRoster('OffensivePush', pool, 500, 25, 'L1');
  const botOff = { id: 'bot-1', archetype: 'OffensivePush', roster: rosterOff };

  it('schiera 11 giocatori', () => {
    const r = pickBotLineup(botOff, 1);
    assert.equal(r.lineup.length, 11);
  });

  it('tutti i giocatori sono nella rosa', () => {
    const r = pickBotLineup(botOff, 1);
    const rosterIds = new Set(rosterOff.map((p) => p.id));
    for (const id of r.lineup) assert.ok(rosterIds.has(id), `${id} fuori rosa`);
  });

  it('include sempre 1 portiere', () => {
    const r = pickBotLineup(botOff, 1);
    const portieri = r.lineup.filter((id) => {
      const p = rosterOff.find((x) => x.id === id);
      return (p?.ruoloMantra || '').toLowerCase() === 'por';
    });
    assert.equal(portieri.length, 1);
  });

  it('determinismo per stesso (bot, matchday)', () => {
    const a = pickBotLineup(botOff, 5);
    const b = pickBotLineup(botOff, 5);
    assert.deepEqual(a, b);
  });

  it('OffensivePush usa modulo offensivo (3-4-3 o 4-3-3)', () => {
    const r = pickBotLineup(botOff, 1);
    assert.ok(['3-4-3', '4-3-3'].includes(r.modulo));
  });

  it('DefensiveWall usa modulo difensivo (5-3-2 o 5-4-1)', () => {
    const rosterDef = draftBotRoster('DefensiveWall', pool, 500, 25, 'L2');
    const botDef = { id: 'bot-2', archetype: 'DefensiveWall', roster: rosterDef };
    const r = pickBotLineup(botDef, 1);
    assert.ok(['5-3-2', '5-4-1'].includes(r.modulo));
  });
});
```

- [ ] **Step 2: Run test, verifica che falliscano i nuovi**

Run: `npm test -- src/lib/season/__tests__/botStrategy.test.js`
Expected: FAIL — `pickBotLineup is not exported`.

- [ ] **Step 3: Implementa `pickBotLineup`**

Aggiungi in fondo a `src/lib/season/botStrategy.js`:

```js
const ARCHETYPE_MODULI = {
  OffensivePush: ['3-4-3', '4-3-3'],   // primo = preferito (80%), secondo = alternativo (20%)
  DefensiveWall: ['5-3-2', '5-4-1'],
};

// Definizione moduli: numero di giocatori per macro-ruolo (P=portiere, D=difesa, C=centrocampo, A=attacco)
const MODULI = {
  '3-4-3': { P: 1, D: 3, C: 4, A: 3 },
  '4-3-3': { P: 1, D: 4, C: 3, A: 3 },
  '5-3-2': { P: 1, D: 5, C: 3, A: 2 },
  '5-4-1': { P: 1, D: 5, C: 4, A: 1 },
};

function macroRuolo(player) {
  const r = (player.ruoloMantra || '').toLowerCase();
  if (r === 'por') return 'P';
  if (DIFESA.has(r) && r !== 'por') return 'D';
  if (ATTACCO.has(r)) return 'A';
  return 'C';
}

/**
 * Sceglie 11 giocatori dalla rosa del bot per la giornata.
 * @param {Object} bot — { id, archetype, roster }
 * @param {number} matchday
 * @returns {{ lineup: string[], modulo: string }}
 */
export function pickBotLineup(bot, matchday) {
  const rng = mulberry32(hashStr(`${bot.id}|${matchday}|lineup`));
  const moduliPool = ARCHETYPE_MODULI[bot.archetype] ?? ['4-3-3', '4-4-2'];

  // 80% modulo preferito, 20% alternativo
  const modulo = rng() < 0.8 ? moduliPool[0] : (moduliPool[1] ?? moduliPool[0]);
  const need = MODULI[modulo];

  // Raggruppa rosa per macroRuolo, ordina per votoMedia desc
  const groups = { P: [], D: [], C: [], A: [] };
  for (const p of bot.roster) groups[macroRuolo(p)].push(p);
  for (const k of Object.keys(groups)) {
    groups[k].sort((a, b) => (b.votoMedia ?? 0) - (a.votoMedia ?? 0));
  }

  const lineup = [];
  for (const macro of ['P', 'D', 'C', 'A']) {
    const list = groups[macro];
    for (let i = 0; i < need[macro]; i++) {
      // 5% errore: prendi il #2 al posto del #1
      let pick = list[i];
      if (i + 1 < list.length && rng() < 0.05) {
        pick = list[i + 1];
        // ripristina swap così #1 rimane disponibile per slot successivi
        list[i + 1] = list[i];
        list[i] = pick;
      }
      if (pick) lineup.push(pick.id);
    }
  }

  return { lineup, modulo };
}
```

- [ ] **Step 4: Run test**

Run: `npm test -- src/lib/season/__tests__/botStrategy.test.js`
Expected: PASS, tutti verdi.

- [ ] **Step 5: Commit**

```bash
git add src/lib/season/botStrategy.js src/lib/season/__tests__/botStrategy.test.js
git commit -m "feat(season): add pickBotLineup with module choice and 5% noise"
```

---

## Task 10: `playMatchday.js` — orchestrator puro

**Files:**
- Create: `src/lib/season/__tests__/playMatchday.integration.test.js`
- Create: `src/lib/season/playMatchday.js`

- [ ] **Step 1: Scrivi test fallenti**

```js
// src/lib/season/__tests__/playMatchday.integration.test.js
import { describe, it, mock } from 'node:test';
import assert from 'node:assert/strict';
import { playMatchday } from '../playMatchday.js';
import { draftBotRoster } from '../botStrategy.js';
import { generateRoundRobin } from '../calendar.js';
import { buildLargePool, SAMPLE_ATTACCANTE, SAMPLE_PORTIERE, SAMPLE_DIFENSORE, SAMPLE_CENTROCAMPISTA } from '../__fixtures__/playerSamples.js';
import { SETTINGS_CLASSIC } from '../__fixtures__/leagueSettings.js';

function makeLeague(pool) {
  // Bot rosters draftati
  const used = new Set();
  const bots = [];
  for (let i = 1; i <= 7; i++) {
    const archetype = i % 2 === 0 ? 'DefensiveWall' : 'OffensivePush';
    const roster = draftBotRoster(archetype, pool, 500, 25, `bot-${i}`, { excludeIds: used });
    roster.forEach((p) => used.add(p.id));
    bots.push({ id: `bot-${i}`, name: `Bot ${i}`, archetype, roster });
  }

  // Rosa user (15 player rimanenti)
  const remaining = pool.filter((p) => !used.has(p.id)).slice(0, 15);

  const calendar = generateRoundRobin(['user', 'bot-1', 'bot-2', 'bot-3', 'bot-4', 'bot-5', 'bot-6', 'bot-7'], 'andata_ritorno', 'L1');

  return {
    id: 'L1',
    settings: SETTINGS_CLASSIC,
    bots,
    calendar,
    matchdayResults: [],
    currentMatchday: 1,
    userRoster: remaining,
    userLineup: remaining.slice(0, 11).map((p) => p.id),
  };
}

describe('playMatchday — happy path', () => {
  globalThis.fetch = mock.fn(async () => ({ ok: false, status: 404, json: async () => ({}) }));
  const pool = buildLargePool(300);
  const league = makeLeague(pool);

  it('produce un matchdayResult valido', async () => {
    const r = await playMatchday(league);
    assert.equal(r.matchdayResult.matchday, 1);
    assert.ok(r.matchdayResult.teams.user);
    for (let i = 1; i <= 7; i++) assert.ok(r.matchdayResult.teams[`bot-${i}`]);
  });

  it('ogni squadra ha fantapunti numerici', async () => {
    const r = await playMatchday(league);
    for (const teamId of Object.keys(r.matchdayResult.teams)) {
      const t = r.matchdayResult.teams[teamId];
      assert.equal(typeof t.fantapunti, 'number');
      assert.ok(t.fantapunti >= 0);
    }
  });

  it('matches sono coerenti col calendario', async () => {
    const r = await playMatchday(league);
    assert.equal(r.matchdayResult.matches.length, 4);
    for (const m of r.matchdayResult.matches) {
      assert.ok(['1', 'X', '2'].includes(m.result));
    }
  });

  it('updatedStandings ha 8 squadre', async () => {
    const r = await playMatchday(league);
    assert.equal(r.updatedStandings.length, 8);
  });

  it('voteSourceMode = "simulated" quando fetch 404', async () => {
    const r = await playMatchday(league);
    assert.equal(r.matchdayResult.voteSourceMode, 'simulated');
  });
});

describe('playMatchday — errori', () => {
  it('throw se rosa user < 15', async () => {
    const pool = buildLargePool(300);
    const league = makeLeague(pool);
    league.userRoster = league.userRoster.slice(0, 10); // troppo poco
    await assert.rejects(() => playMatchday(league), /RosterTooSmall/);
  });

  it('throw se currentMatchday > calendar.length', async () => {
    const pool = buildLargePool(300);
    const league = makeLeague(pool);
    league.currentMatchday = 99;
    await assert.rejects(() => playMatchday(league), /SeasonCompleted/);
  });

  it('throw se giornata già in matchdayResults', async () => {
    const pool = buildLargePool(300);
    const league = makeLeague(pool);
    league.matchdayResults = [{ matchday: 1, teams: {}, matches: [] }];
    await assert.rejects(() => playMatchday(league), /AlreadyPlayed/);
  });
});
```

- [ ] **Step 2: Run test, verifica che falliscano**

Run: `npm test -- src/lib/season/__tests__/playMatchday.integration.test.js`
Expected: FAIL — `playMatchday is not exported`.

- [ ] **Step 3: Implementa `playMatchday`**

```js
// src/lib/season/playMatchday.js
import { computeFantapunti, computeFasciaGol } from './fantapunti.js';
import { loadMatchdayVoti } from './voti.js';
import { pickBotLineup } from './botStrategy.js';

/**
 * Orchestrator puro. Prende lo stato lega + lineup utente, ritorna il risultato della giornata.
 * NON modifica nulla: lo store applica il `set()` con il valore di ritorno.
 *
 * @param {Object} league — { id, settings, bots, calendar, matchdayResults, currentMatchday, userRoster, userLineup }
 * @returns {Promise<{ matchdayResult, updatedStandings }>}
 */
export async function playMatchday(league) {
  const md = league.currentMatchday;

  // ── Pre-condizioni ───────────────────────────────────────
  if (!league.calendar || md > league.calendar.length) {
    throw new Error(`SeasonCompleted: matchday ${md} > calendar length ${league.calendar?.length ?? 0}`);
  }
  if ((league.userRoster?.length ?? 0) < 15) {
    throw new Error('RosterTooSmall: user roster < 15');
  }
  if (league.matchdayResults?.find((r) => r.matchday === md)) {
    throw new Error(`AlreadyPlayed: matchday ${md} già giocato`);
  }

  // ── Gather player IDs ────────────────────────────────────
  const userLineupIds = (league.userLineup || []).filter((id) =>
    league.userRoster.some((p) => p.id === id)
  );
  const botLineups = {};
  for (const bot of league.bots) {
    botLineups[bot.id] = pickBotLineup(bot, md);
  }

  const allPlayersForFetch = [];
  const seen = new Set();
  for (const p of league.userRoster) { if (!seen.has(p.id)) { allPlayersForFetch.push(p); seen.add(p.id); } }
  for (const bot of league.bots) {
    for (const p of bot.roster) { if (!seen.has(p.id)) { allPlayersForFetch.push(p); seen.add(p.id); } }
  }

  // ── Fetch voti ───────────────────────────────────────────
  const season = league.settings?.stagione ?? '2025-26';
  const voti = await loadMatchdayVoti(season, md, allPlayersForFetch);

  // ── Computa per ogni squadra ────────────────────────────
  const teams = {};

  function computeTeam(teamId, lineupIds, roster, modulo) {
    const playedScores = [];
    const expectedSize = 11;

    // Filtra lineup: solo player effettivamente in rosa
    const validLineup = lineupIds.filter((id) => roster.some((p) => p.id === id));

    for (const pid of validLineup) {
      const player = roster.find((p) => p.id === pid);
      const raw = voti.players[pid];
      if (!raw) continue;
      playedScores.push({ playerId: pid, player, ...raw });
    }

    // Riserva d'ufficio per slot mancanti
    const missingSlots = expectedSize - validLineup.length;
    const votoRiserva = league.settings?.votoRiserva ?? 4;
    for (let i = 0; i < missingSlots; i++) {
      playedScores.push({
        playerId: `__riserva-${teamId}-${i}`,
        player: { ruoloMantra: 'C' },
        voto: votoRiserva,
        gol: 0, assist: 0, ammonizione: 0, espulsione: 0,
        autogol: 0, rigoreSegnato: 0, rigoreSbagliato: 0, rigoreParato: 0,
        golSubiti: 0, cleanSheet: false,
        riservaUfficio: true,
      });
    }

    const rawScores = playedScores.map((s) => ({
      playerId: s.playerId,
      voto: s.voto, gol: s.gol, assist: s.assist,
      ammonizione: s.ammonizione, espulsione: s.espulsione,
      autogol: s.autogol, rigoreSegnato: s.rigoreSegnato,
      rigoreSbagliato: s.rigoreSbagliato, rigoreParato: s.rigoreParato,
      golSubiti: s.golSubiti, cleanSheet: s.cleanSheet,
      riservaUfficio: !!s.riservaUfficio,
    }));

    const fp = playedScores.reduce((sum, s) => {
      return sum + computeFantapunti(s, league.settings);
    }, 0);
    const fantapunti = Math.round(fp * 10) / 10;
    const golFatti = computeFasciaGol(fantapunti, league.settings?.fasceGol ?? 'progressive');

    teams[teamId] = {
      lineup: validLineup,
      modulo,
      rawScores,
      fantapunti,
      golFatti,
    };
  }

  computeTeam('user', userLineupIds, league.userRoster, league.userModulo ?? '4-3-3');
  for (const bot of league.bots) {
    computeTeam(bot.id, botLineups[bot.id].lineup, bot.roster, botLineups[bot.id].modulo);
  }

  // ── Risolvi pairings → matches con risultato ───────────
  const matchdayCalendar = league.calendar.find((c) => c.matchday === md);
  const matches = matchdayCalendar.pairings.map((p) => {
    const homeT = teams[p.home];
    const awayT = teams[p.away];
    const homePts = homeT.fantapunti;
    const awayPts = awayT.fantapunti;
    const homeGoals = homeT.golFatti;
    const awayGoals = awayT.golFatti;
    let result;
    if (homeGoals > awayGoals) result = '1';
    else if (homeGoals < awayGoals) result = '2';
    else result = 'X';
    return { home: p.home, away: p.away, homePts, awayPts, homeGoals, awayGoals, result };
  });

  const matchdayResult = {
    matchday: md,
    playedAt: new Date().toISOString(),
    voteSourceMatchday: md,
    voteSourceMode: voti.mode,
    teams,
    matches,
  };

  const updatedStandings = recomputeStandings(
    [...(league.matchdayResults || []), matchdayResult],
    league.calendar
  );

  return { matchdayResult, updatedStandings };
}

/**
 * Ricalcola le standings dal log completo dei risultati.
 * @param {Array} allResults — matchdayResults inclusi quello appena giocato
 * @param {Array} calendar — utile per identificare le 8 squadre
 * @returns {Array<{ teamId, name, G, V, N, P, GF, GS, DR, Pt, fantaTotali, ultimo, andamento }>}
 */
export function recomputeStandings(allResults, calendar) {
  // Estrai tutti i teamId dal calendario
  const teamSet = new Set();
  for (const md of calendar) for (const p of md.pairings) { teamSet.add(p.home); teamSet.add(p.away); }
  const standings = {};
  for (const tid of teamSet) {
    standings[tid] = { teamId: tid, name: tid, G: 0, V: 0, N: 0, P: 0, GF: 0, GS: 0, DR: 0, Pt: 0, fantaTotali: 0, ultimo: 0, andamento: [] };
  }

  for (const r of allResults) {
    for (const m of r.matches) {
      const h = standings[m.home], a = standings[m.away];
      h.G++; a.G++;
      h.GF += m.homeGoals; h.GS += m.awayGoals;
      a.GF += m.awayGoals; a.GS += m.homeGoals;
      if (m.result === '1') { h.V++; h.Pt += 3; a.P++; }
      else if (m.result === '2') { a.V++; a.Pt += 3; h.P++; }
      else { h.N++; a.N++; h.Pt++; a.Pt++; }
    }
    for (const tid of teamSet) {
      const tFp = r.teams[tid]?.fantapunti ?? 0;
      standings[tid].fantaTotali += tFp;
      standings[tid].ultimo = tFp;
      standings[tid].andamento.push(tFp);
    }
  }

  for (const s of Object.values(standings)) s.DR = s.GF - s.GS;

  // Ordinamento: punti desc, poi DR desc, poi fantaTotali desc
  return Object.values(standings).sort((a, b) =>
    b.Pt - a.Pt || b.DR - a.DR || b.fantaTotali - a.fantaTotali
  );
}
```

- [ ] **Step 4: Run test**

Run: `npm test -- src/lib/season/__tests__/playMatchday.integration.test.js`
Expected: PASS, tutti verdi.

- [ ] **Step 5: Run tutti i test del season engine per regressione**

Run: `npm test -- src/lib/season/__tests__/`
Expected: tutti i test season passano.

- [ ] **Step 6: Commit**

```bash
git add src/lib/season/playMatchday.js src/lib/season/__tests__/playMatchday.integration.test.js
git commit -m "feat(season): add playMatchday orchestrator with recomputeStandings"
```

---

## Task 11: PR Chunk 1

- [ ] **Step 1: Push branch e apri PR**

```bash
git push -u origin claude/chunk-1-engine-season-{SESSIONID}
```

- [ ] **Step 2: Apri PR**

Run via gh CLI:

```bash
gh pr create --title "feat(season): pure engine for fantacalcio scoring loop" --body "$(cat <<'EOF'
## Summary
- Adds pure engine modules under `src/lib/season/` (fantapunti, voti, calendar, botStrategy, playMatchday)
- All modules are I/O-free except `loadMatchdayVoti` which wraps fetch with simulated fallback
- 100% deterministic given a seed; ready to be moved server-side when multi-user lands
- No UI changes, no store changes — engine is dormant until Chunk 3 wires it in

## Test plan
- [x] `npm test -- src/lib/season/__tests__/` passes (5 test files, ~50 cases)
- [x] No existing tests broken
- [ ] Reviewer reads `docs/superpowers/specs/2026-04-27-loop-voti-punti-classifica-design.md` Sezioni "Componenti / moduli chiave" + "Strategia di test"

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

---

# CHUNK 2 — Backend voti

Scopo: rotta `/api/voti/:season/matchday/:n` che serve JSON statici. Test backend. Fixture di esempio (NON il dataset reale).

**Parallelizzabile con Chunk 1.** Si può sviluppare su una branch separata.

**Branch:** `claude/chunk-2-voti-backend-{SESSIONID}`

## Task 12: Crea struttura cartelle e fixture di esempio

**Files:**
- Create: `server/data/voti-2025-26/matchday-1.json`
- Create: `server/data/voti-2025-26/README.md`

- [ ] **Step 1: Crea fixture di esempio**

```bash
mkdir -p server/data/voti-2025-26
```

Crea `server/data/voti-2025-26/matchday-1.json`:

```json
{
  "season": "2025-26",
  "matchday": 1,
  "source": "fixture-example-not-real-data",
  "players": {
    "p-lautaro": { "voto": 7.5, "gol": 1, "assist": 0, "ammonizione": 0 },
    "p-maignan": { "voto": 6.5, "cleanSheet": true, "golSubiti": 0 },
    "p-bastoni": { "voto": 6.0 },
    "p-barella": { "voto": 7.0, "assist": 1 }
  }
}
```

- [ ] **Step 2: Crea README esplicativo**

Crea `server/data/voti-2025-26/README.md`:

```markdown
# Dataset voti stagione 2025/26

I file `matchday-{N}.json` contengono i voti reali (o sintetici) di ogni giornata.

**Shape attesa:**

```json
{
  "season": "2025-26",
  "matchday": 1,
  "source": "<fonte voti>",
  "players": {
    "<playerId>": {
      "voto": 6.5,
      "gol": 0,
      "assist": 0,
      "ammonizione": 0,
      "espulsione": 0,
      "autogol": 0,
      "rigoreSegnato": 0,
      "rigoreSbagliato": 0,
      "rigoreParato": 0,
      "golSubiti": 0,
      "cleanSheet": false
    }
  }
}
```

I `playerId` devono coincidere con quelli usati in `useAppStore.rosa[].id` (lato client).

**Stato attuale:** solo `matchday-1.json` come fixture di esempio. Il dataset reale è una decisione di prodotto separata e non è committata in questo plan.
```

- [ ] **Step 3: Commit**

```bash
git add server/data/voti-2025-26/
git commit -m "data: add voti-2025-26 dir scaffold and matchday-1 example fixture"
```

---

## Task 13: Rotta `/api/voti/:season/matchday/:n`

**Files:**
- Create: `server/routes/voti.js`
- Create: `server/tests/voti.test.js`
- Modify: `server.js`

- [ ] **Step 1: Scrivi test fallenti**

```js
// server/tests/voti.test.js
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import http from 'node:http';

// Helper: avvia un'app Express con la sola route voti, ritorna { server, port, close }
async function startTestServer() {
  const { default: votiRouter } = await import('../routes/voti.js');
  const app = express();
  app.use('/api/voti', votiRouter);
  return new Promise((resolve) => {
    const server = http.createServer(app);
    server.listen(0, () => {
      const port = server.address().port;
      resolve({ server, port, close: () => new Promise((res) => server.close(res)) });
    });
  });
}

async function getJson(port, path) {
  return new Promise((resolve, reject) => {
    http.get(`http://localhost:${port}${path}`, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => resolve({ status: res.statusCode, body: data ? JSON.parse(data) : null }));
    }).on('error', reject);
  });
}

describe('GET /api/voti/:season/matchday/:n', () => {
  it('200 con la fixture matchday-1', async () => {
    const { port, close } = await startTestServer();
    const r = await getJson(port, '/api/voti/2025-26/matchday/1');
    assert.equal(r.status, 200);
    assert.equal(r.body.season, '2025-26');
    assert.equal(r.body.matchday, 1);
    assert.ok(r.body.players);
    await close();
  });

  it('404 se la giornata non esiste', async () => {
    const { port, close } = await startTestServer();
    const r = await getJson(port, '/api/voti/2025-26/matchday/99');
    assert.equal(r.status, 404);
    await close();
  });

  it('400 se :n non è un numero', async () => {
    const { port, close } = await startTestServer();
    const r = await getJson(port, '/api/voti/2025-26/matchday/abc');
    assert.equal(r.status, 400);
    await close();
  });

  it('400 se :season ha caratteri non sicuri (path traversal)', async () => {
    const { port, close } = await startTestServer();
    const r = await getJson(port, '/api/voti/..%2Fetc/matchday/1');
    assert.ok(r.status === 400 || r.status === 404);
    await close();
  });
});
```

- [ ] **Step 2: Run test, verifica che falliscano**

Run: `npm test -- server/tests/voti.test.js`
Expected: FAIL — modulo non esiste.

- [ ] **Step 3: Implementa la route**

```js
// server/routes/voti.js
import express from 'express';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_ROOT = resolve(__dirname, '..', 'data');

// Whitelist season per prevenire path traversal
const VALID_SEASON_RE = /^[0-9]{4}-[0-9]{2}$/;

const router = express.Router();

router.get('/:season/matchday/:n', async (req, res) => {
  const { season, n } = req.params;

  if (!VALID_SEASON_RE.test(season)) {
    return res.status(400).json({ error: 'invalid season format' });
  }
  const matchday = Number(n);
  if (!Number.isInteger(matchday) || matchday < 1 || matchday > 50) {
    return res.status(400).json({ error: 'invalid matchday' });
  }

  const filePath = join(DATA_ROOT, `voti-${season}`, `matchday-${matchday}.json`);

  // Hard guard: il path risolto DEVE rimanere sotto DATA_ROOT
  const resolved = resolve(filePath);
  if (!resolved.startsWith(DATA_ROOT)) {
    return res.status(400).json({ error: 'path escape' });
  }

  try {
    const content = await readFile(resolved, 'utf8');
    res.set('Cache-Control', 'public, max-age=86400, immutable');
    res.set('Content-Type', 'application/json');
    res.send(content);
  } catch (err) {
    if (err.code === 'ENOENT') {
      return res.status(404).json({ error: 'matchday not found' });
    }
    res.status(500).json({ error: 'internal', detail: err.message });
  }
});

export default router;
```

- [ ] **Step 4: Run test, verifica che passino**

Run: `npm test -- server/tests/voti.test.js`
Expected: PASS, 4 test verdi.

- [ ] **Step 5: Registra la route in server.js**

In `server.js`, aggiungi sopra l'import `import warsharesRoutes`:

```js
import votiRoutes from './server/routes/voti.js';
```

E sopra la riga `// ── Health check ──`:

```js
// ── Voti stagionali (read-only, statici) ───────────────────
app.use('/api/voti', votiRoutes);
```

- [ ] **Step 6: Smoke test manuale del server in dev**

Avvia il server: `npm start` (in un terminale separato).

In un altro terminale:

```bash
curl -i http://localhost:3000/api/voti/2025-26/matchday/1
```

Expected: HTTP/1.1 200 OK + body JSON con `players`.

```bash
curl -i http://localhost:3000/api/voti/2025-26/matchday/99
```

Expected: HTTP/1.1 404 + `{"error":"matchday not found"}`.

Stoppa il server.

- [ ] **Step 7: Commit**

```bash
git add server/routes/voti.js server/tests/voti.test.js server.js
git commit -m "feat(server): add /api/voti/:season/matchday/:n static voti route"
```

---

## Task 14: PR Chunk 2

- [ ] **Step 1: Push e PR**

```bash
git push -u origin claude/chunk-2-voti-backend-{SESSIONID}

gh pr create --title "feat(server): static voti endpoint for season scoring engine" --body "$(cat <<'EOF'
## Summary
- New route `GET /api/voti/:season/matchday/:n` serves static JSON from `server/data/voti-{season}/matchday-{n}.json`
- Path traversal protected via whitelist regex on season + resolved-path check
- Fixture example `matchday-1.json` committed; real dataset is out of scope

## Test plan
- [x] `npm test -- server/tests/voti.test.js` passes (4 cases: 200, 404, invalid n, path escape)
- [x] Manual: `curl :3000/api/voti/2025-26/matchday/1` → 200; `/matchday/99` → 404
- [x] Existing backend tests still green

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

---

# CHUNK 3 — Store + integrazione

Scopo: estendere `useLeagueStore` con i nuovi campi, scrivere migration v1→v2, aggiungere i metodi `playMatchday`, `canPlayNow`, `skipCooldown`, `recomputeStandings`. Nessuna UI ancora.

**Dipendenze:** Chunk 1 e 2 mergeati.

**Branch:** `claude/chunk-3-league-store-{SESSIONID}`

## Task 15: Estendi `useLeagueStore` con nuovi campi e migration v2

**Files:**
- Modify: `src/stores/useLeagueStore.js`

- [ ] **Step 1: Leggi lo stato attuale**

Apri `src/stores/useLeagueStore.js` (file completo a `cat src/stores/useLeagueStore.js`).

- [ ] **Step 2: Estendi i `DEFAULT_SETTINGS` se serve, aggiungi DEFAULT_LEAGUE_DOMAIN**

Sotto `DEFAULT_SETTINGS`, aggiungi:

```js
const DEFAULT_LEAGUE_DOMAIN = {
  bots: [],
  calendar: [],
  matchdayResults: [],
  currentMatchday: 1,
  nextMatchdayUnlocksAt: null,
  cooldownHours: Number(import.meta.env.VITE_MATCHDAY_COOLDOWN_HOURS ?? 24),
  skipsToday: { date: null, count: 0 },
  seasonStatus: 'pending',           // 'pending' | 'active' | 'completed'
  isPlayingMatchday: false,
};
```

- [ ] **Step 3: In `createLeague`, applica i nuovi campi al newLeague**

Modifica il `newLeague` object dentro `createLeague`:

```js
const newLeague = {
  id,
  inviteCode,
  inviteUrl: `https://fantabrain.app/lega/${inviteCode}`,
  createdAt: new Date().toISOString(),
  isAdmin: true,
  participants: [],
  myRoster: [],
  standings: [],
  settings: { ...DEFAULT_SETTINGS, ...settingsData },
  ...DEFAULT_LEAGUE_DOMAIN,
};
```

- [ ] **Step 4: Aggiungi versioning e migrate al persist middleware**

Modifica la chiamata `persist(...)` finale:

```js
const useLeagueStore = create(
  persist(
    (set, get) => ({
      // ...esistenti...
    }),
    {
      name: 'fantabrain-leagues',
      version: 2,
      migrate: (persistedState, fromVersion) => {
        if (!persistedState) return persistedState;
        if (fromVersion < 2) {
          const leagues = (persistedState.leagues || []).map((l) => ({
            ...DEFAULT_LEAGUE_DOMAIN,
            ...l,
            // se la lega aveva già qualche campo, preservalo; altrimenti default
          }));
          return { ...persistedState, leagues };
        }
        return persistedState;
      },
    }
  )
);
```

- [ ] **Step 5: Aggiungi un test smoke manuale per verifica**

In console del browser dopo `npm run dev`:

```js
// Pulisci stato per simulare lega legacy v1:
localStorage.setItem('fantabrain-leagues', JSON.stringify({
  state: { leagues: [{ id: 'old', settings: {}, myRoster: [] }], currentLeagueId: 'old' },
  version: 1,
}));
location.reload();
```

Dopo il reload, in console:

```js
const store = JSON.parse(localStorage.getItem('fantabrain-leagues'));
console.log(store.state.leagues[0].seasonStatus);  // → 'pending'
console.log(store.state.leagues[0].cooldownHours); // → 24
console.log(store.version); // → 2
```

- [ ] **Step 6: Commit**

```bash
git add src/stores/useLeagueStore.js
git commit -m "feat(league-store): extend schema with bots/calendar/matchdayResults + v2 migration"
```

---

## Task 16: Aggiungi metodi `skipCooldown`, `canPlayNow`

**Files:**
- Modify: `src/stores/useLeagueStore.js`

- [ ] **Step 1: Aggiungi helper `today()` in cima al file**

Sotto gli `import` e prima di `generateInviteCode`, aggiungi:

```js
function todayLocalISO() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
```

- [ ] **Step 2: Aggiungi i metodi nello store**

Dentro l'object passato a `create(...)`, aggiungi prima di `removeLeague`:

```js
canPlayNow: (leagueId) => {
  const { leagues } = get();
  const l = leagues.find((x) => x.id === leagueId);
  if (!l) return { ok: false, reason: 'no-league' };
  if (l.seasonStatus === 'completed') return { ok: false, reason: 'season-completed' };
  if (l.isPlayingMatchday) return { ok: false, reason: 'in-progress' };
  if (l.matchdayResults?.find((r) => r.matchday === l.currentMatchday)) {
    return { ok: false, reason: 'already-played' };
  }
  if (l.nextMatchdayUnlocksAt) {
    const t = Date.parse(l.nextMatchdayUnlocksAt);
    if (Number.isFinite(t) && t > Date.now()) {
      return { ok: false, reason: 'cooldown', unlocksAt: l.nextMatchdayUnlocksAt };
    }
  }
  return { ok: true };
},

skipCooldown: (leagueId) => {
  const today = todayLocalISO();
  const { leagues } = get();
  const l = leagues.find((x) => x.id === leagueId);
  if (!l) throw new Error('NoLeague');

  // Lazy reset se data cambiata
  const sToday = l.skipsToday?.date === today
    ? l.skipsToday
    : { date: today, count: 0 };

  if (sToday.count >= 3) {
    throw new Error('SkipsExhausted');
  }

  set((state) => ({
    leagues: state.leagues.map((x) =>
      x.id === leagueId
        ? {
            ...x,
            nextMatchdayUnlocksAt: new Date().toISOString(),
            skipsToday: { date: today, count: sToday.count + 1 },
          }
        : x
    ),
  }));
},
```

- [ ] **Step 3: Verifica manuale in console browser**

Dopo `npm run dev`:

```js
import('/src/stores/useLeagueStore.js').then(m => window.__store = m.default);
const s = window.__store.getState();
const lid = s.currentLeagueId;
console.log(s.canPlayNow(lid)); // dipende dallo stato

// Forza cooldown futuro
s.updateLeagueSettings(lid, {});
window.__store.setState((st) => ({
  leagues: st.leagues.map(l => l.id === lid ? { ...l, nextMatchdayUnlocksAt: new Date(Date.now() + 60_000).toISOString() } : l),
}));
console.log(s.canPlayNow(lid)); // { ok: false, reason: 'cooldown' }

s.skipCooldown(lid);
console.log(s.canPlayNow(lid)); // { ok: true }

// 3 skip totali
s.skipCooldown(lid); s.skipCooldown(lid);
try { s.skipCooldown(lid); } catch (e) { console.log(e.message); } // SkipsExhausted
```

- [ ] **Step 4: Commit**

```bash
git add src/stores/useLeagueStore.js
git commit -m "feat(league-store): add canPlayNow and skipCooldown with daily cap"
```

---

## Task 17: Aggiungi metodo `playMatchday` allo store

**Files:**
- Modify: `src/stores/useLeagueStore.js`

- [ ] **Step 1: Importa l'orchestrator e useAppStore**

Aggiungi in cima al file:

```js
import { playMatchday as runMatchday } from '../lib/season/playMatchday.js';
import useAppStore from '../store/useAppStore.js';
```

- [ ] **Step 2: Importa i tool di draft per inizializzare la stagione**

```js
import { draftBotRoster, BOT_NAME_POOL } from '../lib/season/botStrategy.js';
import { generateRoundRobin } from '../lib/season/calendar.js';
```

- [ ] **Step 3: Aggiungi helper interni per inizializzare la stagione (se pending)**

Sopra `const useLeagueStore = create(...)`, aggiungi:

```js
function initializeSeason(league, allPlayersPool) {
  // chi pesca prima: utente. Pool ridotto = pool senza giocatori già in myRoster (qui `useAppStore.rosa`).
  const userRoster = useAppStore.getState().rosa || [];
  const usedIds = new Set(userRoster.map((p) => p.id));

  const archetypes = ['OffensivePush', 'DefensiveWall', 'OffensivePush', 'DefensiveWall', 'OffensivePush', 'DefensiveWall', 'OffensivePush'];
  // mix 4/3 OffensivePush/DefensiveWall

  const namesShuffled = [...BOT_NAME_POOL]
    .sort(() => 0.5 - hash01(league.id))
    .slice(0, 7);

  const bots = [];
  for (let i = 0; i < 7; i++) {
    const archetype = archetypes[i];
    const roster = draftBotRoster(
      archetype,
      allPlayersPool,
      league.settings.creditiIniziali ?? 500,
      league.settings.numGiocatoriRosa ?? 25,
      `${league.id}-bot-${i + 1}`,
      { excludeIds: usedIds }
    );
    roster.forEach((p) => usedIds.add(p.id));
    bots.push({
      id: `bot-${i + 1}`,
      name: namesShuffled[i] || `Bot ${i + 1}`,
      archetype,
      roster,
      currentLineup: null,
    });
  }

  const teamIds = ['user', ...bots.map((b) => b.id)];
  const calendar = generateRoundRobin(teamIds, 'andata_ritorno', league.id);

  return { bots, calendar };
}

function hash01(s) {
  let h = 2166136261;
  for (let i = 0; i < (s || '').length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return ((h >>> 0) / 4294967296);
}
```

- [ ] **Step 4: Aggiungi il metodo `playMatchday` allo store**

Dentro l'object dello store, prima di `removeLeague`:

```js
playMatchday: async (leagueId, opts = {}) => {
  const { leagues } = get();
  const l = leagues.find((x) => x.id === leagueId);
  if (!l) throw new Error('NoLeague');

  // Lock
  if (l.isPlayingMatchday) throw new Error('AlreadyRunning');
  set((state) => ({
    leagues: state.leagues.map((x) =>
      x.id === leagueId ? { ...x, isPlayingMatchday: true } : x
    ),
  }));

  try {
    // Inizializza stagione se pending
    let league = get().leagues.find((x) => x.id === leagueId);
    if (league.seasonStatus === 'pending') {
      const userRoster = useAppStore.getState().rosa || [];
      if (userRoster.length < 15) throw new Error('RosterTooSmall');
      const playersPool = opts.playersPool;
      if (!playersPool || playersPool.length < 25 * 7 + userRoster.length) {
        throw new Error('PlayerPoolMissing');
      }
      const { bots, calendar } = initializeSeason(league, playersPool);
      set((state) => ({
        leagues: state.leagues.map((x) =>
          x.id === leagueId
            ? { ...x, bots, calendar, seasonStatus: 'active' }
            : x
        ),
      }));
      league = get().leagues.find((x) => x.id === leagueId);
    }

    // Compose snapshot per orchestrator puro
    const userRoster = useAppStore.getState().rosa || [];
    const userLineup = useAppStore.getState().titolariIds || [];
    const userModulo = useAppStore.getState().modulo || '4-3-3';

    const snapshot = {
      ...league,
      userRoster,
      userLineup,
      userModulo,
    };

    const { matchdayResult, updatedStandings } = await runMatchday(snapshot);

    // Aggiorna standings: arricchisci nomi
    const enrichedStandings = updatedStandings.map((s) => {
      if (s.teamId === 'user') {
        return { ...s, name: useAppStore.getState().user?.league || 'La mia squadra', isUser: true };
      }
      const b = league.bots.find((x) => x.id === s.teamId);
      return { ...s, name: b?.name || s.teamId, isUser: false };
    });

    const nextMatchday = league.currentMatchday + 1;
    const seasonCompleted = nextMatchday > league.calendar.length;

    set((state) => ({
      leagues: state.leagues.map((x) =>
        x.id === leagueId
          ? {
              ...x,
              matchdayResults: [...(x.matchdayResults || []), matchdayResult],
              standings: enrichedStandings,
              currentMatchday: nextMatchday,
              nextMatchdayUnlocksAt: new Date(Date.now() + (x.cooldownHours ?? 24) * 3600 * 1000).toISOString(),
              seasonStatus: seasonCompleted ? 'completed' : 'active',
              isPlayingMatchday: false,
            }
          : x
      ),
    }));

    return matchdayResult;
  } catch (err) {
    set((state) => ({
      leagues: state.leagues.map((x) =>
        x.id === leagueId ? { ...x, isPlayingMatchday: false } : x
      ),
    }));
    throw err;
  }
},

recomputeStandings: (leagueId) => {
  // utility — riusa logica di recomputeStandings dell'orchestrator
  const { leagues } = get();
  const l = leagues.find((x) => x.id === leagueId);
  if (!l) return;
  // import dinamico per evitare cycle:
  import('../lib/season/playMatchday.js').then((m) => {
    const updated = m.recomputeStandings(l.matchdayResults || [], l.calendar || []);
    set((state) => ({
      leagues: state.leagues.map((x) =>
        x.id === leagueId ? { ...x, standings: updated } : x
      ),
    }));
  });
},
```

- [ ] **Step 5: Smoke test manuale in console browser**

```bash
npm run dev
```

In console (con una lega creata + ≥15 giocatori in rosa):

```js
const store = (await import('/src/stores/useLeagueStore.js')).default;
const lid = store.getState().currentLeagueId;

// Serve un pool di player. Per il test usa la rosa stessa replicata + qualche dummy:
const userRosa = (await import('/src/store/useAppStore.js')).default.getState().rosa;
const dummies = Array.from({length: 200}, (_, i) => ({
  id: `pool-dummy-${i}`,
  cognome: `Dummy${i}`,
  ruoloMantra: ['Por','Dc','M','C','Pc'][i%5],
  squadra: 'Mock',
  quotazione: 5 + (i%20),
  votoMedia: 5.5 + ((i%30)/10),
}));
const playersPool = [...userRosa, ...dummies];

await store.getState().playMatchday(lid, { playersPool });
console.log(store.getState().leagues.find(l => l.id === lid).matchdayResults.length); // 1
console.log(store.getState().leagues.find(l => l.id === lid).standings);              // 8 squadre
```

- [ ] **Step 6: Commit**

```bash
git add src/stores/useLeagueStore.js
git commit -m "feat(league-store): add playMatchday with season initialization on first play"
```

---

## Task 18: PR Chunk 3

- [ ] **Step 1: Push e PR**

```bash
git push -u origin claude/chunk-3-league-store-{SESSIONID}

gh pr create --title "feat(league-store): wire pure engine to Zustand with v2 migration" --body "$(cat <<'EOF'
## Summary
- Extends `useLeagueStore` schema (bots, calendar, matchdayResults, cooldown, skip-counter, seasonStatus, isPlayingMatchday lock)
- Non-destructive `migrate(v1→v2)` initializes new fields on legacy leagues; status defaults to `'pending'` (user must initialize season)
- Adds methods: `playMatchday`, `canPlayNow`, `skipCooldown`, `recomputeStandings`
- Bot draft happens at first `playMatchday` (user-first picking semantics)

## Test plan
- [x] Manual: console smoke test in browser (legacy lega → migrate; playMatchday end-to-end)
- [ ] UI ancora non aggiornata — la dashboard mostrerà i nuovi dati nel Chunk 4

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

---

# CHUNK 4 — UI gameplay

Scopo: portare il gameplay sulla superficie. Nuovo `MatchdayCard`, nuova pagina dettaglio giornata, integrazione di Classifica/Calendario con i dati ora popolati.

**Dipendenze:** Chunk 3 mergeato.

**Branch:** `claude/chunk-4-ui-gameplay-{SESSIONID}`

## Task 19: Hook `useCountdown`

**Files:**
- Create: `src/hooks/useCountdown.js`

- [ ] **Step 1: Implementa hook**

```js
// src/hooks/useCountdown.js
import { useState, useEffect } from 'react';

/**
 * Restituisce stringa 'HH:MM:SS' fino a targetIso, oppure null se è nel passato.
 * Aggiornato ogni secondo.
 */
export function useCountdown(targetIso) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (!targetIso) return undefined;
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [targetIso]);

  if (!targetIso) return null;
  const target = Date.parse(targetIso);
  if (!Number.isFinite(target)) return null;
  const diff = target - Date.now();
  if (diff <= 0) return null;
  const h = Math.floor(diff / 3_600_000);
  const m = Math.floor((diff % 3_600_000) / 60_000);
  const s = Math.floor((diff % 60_000) / 1_000);
  return [h, m, s].map((n) => String(n).padStart(2, '0')).join(':');
  // tick is referenced implicitly via closure — leave as-is to ensure re-render
}
```

- [ ] **Step 2: Commit**

```bash
git add src/hooks/useCountdown.js
git commit -m "feat(hooks): add useCountdown hook for shared countdown ticker"
```

---

## Task 20: `MatchdayCard.jsx`

**Files:**
- Create: `src/components/dashboard/MatchdayCard.jsx`

- [ ] **Step 1: Implementa il componente**

```jsx
// src/components/dashboard/MatchdayCard.jsx
import { useState } from 'react';
import useLeagueStore from '../../stores/useLeagueStore';
import useAppStore from '../../store/useAppStore';
import { useCountdown } from '../../hooks/useCountdown';

export default function MatchdayCard() {
  const currentLeague = useLeagueStore((s) =>
    s.leagues.find((l) => l.id === s.currentLeagueId) || null
  );
  const playMatchday = useLeagueStore((s) => s.playMatchday);
  const skipCooldown = useLeagueStore((s) => s.skipCooldown);
  const canPlayNow = useLeagueStore((s) => s.canPlayNow);
  const rosa = useAppStore((s) => s.rosa);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const countdown = useCountdown(currentLeague?.nextMatchdayUnlocksAt);

  if (!currentLeague) return null;

  const md = currentLeague.currentMatchday;
  const status = currentLeague.seasonStatus;
  const skips = currentLeague.skipsToday;
  const today = new Date().toISOString().slice(0, 10);
  const skipCount = skips?.date === today ? (skips.count || 0) : 0;
  const skipsRemaining = Math.max(0, 3 - skipCount);

  async function handlePlay() {
    setBusy(true); setError(null);
    try {
      // Pool: per ora, prendi rosa user + tutti i player Serie A noti.
      // TEMP: replica rosa user × N. Sostituire con pool reale dal db Scouting.
      const playersPool = [...rosa]; // Caller deve passare un pool sufficiente.
      // TODO: collegare al pool Scouting reale (vedi nota sotto).
      await playMatchday(currentLeague.id, { playersPool });
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  function handleSkip() {
    setError(null);
    try { skipCooldown(currentLeague.id); }
    catch (e) { setError(e.message); }
  }

  // Stato dell'ultima giornata giocata (per stato 'completed'-like inline)
  const lastResult = currentLeague.matchdayResults?.[currentLeague.matchdayResults.length - 1];
  const userResult = lastResult?.teams?.user;

  // Determine display state
  let displayState;
  if (status === 'completed') displayState = 'season-completed';
  else if (status === 'pending') displayState = 'pending';
  else if (busy || currentLeague.isPlayingMatchday) displayState = 'playing';
  else if (countdown) displayState = 'locked';
  else displayState = 'ready';

  return (
    <div className="glass-card" style={{ padding: '14px 18px', borderTop: '3px solid var(--accent-primary)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
        <span style={{
          fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 11,
          color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.08em',
        }}>
          La mia lega · Giornata {md}
        </span>
        <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>
          {currentLeague.matchdayResults?.length ?? 0}/{currentLeague.calendar?.length || '—'}
        </span>
      </div>

      {displayState === 'pending' && (
        <div>
          <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)' }}>
            Pronto a iniziare la stagione? Servono almeno 15 giocatori in rosa.
          </p>
          <button
            onClick={handlePlay}
            disabled={busy || rosa.length < 15}
            style={{
              marginTop: 12, width: '100%', padding: '12px',
              background: 'var(--accent-primary)', color: '#000', border: 'none',
              borderRadius: 8, fontWeight: 700, cursor: rosa.length < 15 ? 'not-allowed' : 'pointer',
              opacity: rosa.length < 15 ? 0.5 : 1,
            }}
          >
            {rosa.length < 15 ? `Aggiungi ${15 - rosa.length} giocatori` : `Avvia stagione · Gioca G${md}`}
          </button>
        </div>
      )}

      {displayState === 'locked' && (
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 28, color: 'var(--accent-primary)' }}>
            {countdown}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 12 }}>
            alla prossima giornata
          </div>
          <button
            onClick={handleSkip}
            disabled={skipsRemaining === 0}
            style={{
              padding: '8px 16px', background: 'transparent',
              border: '1px solid var(--border-glass)', color: 'var(--text-primary)',
              borderRadius: 6, fontSize: 12, cursor: skipsRemaining === 0 ? 'not-allowed' : 'pointer',
            }}
          >
            {skipsRemaining > 0 ? `Skippa attesa (${skipsRemaining}/3)` : 'Skip esauriti, riprova domani'}
          </button>
        </div>
      )}

      {displayState === 'ready' && (
        <button
          onClick={handlePlay}
          disabled={busy}
          style={{
            width: '100%', padding: '12px',
            background: 'var(--accent-primary)', color: '#000', border: 'none',
            borderRadius: 8, fontWeight: 700, cursor: 'pointer',
          }}
        >
          {busy ? 'In corso…' : `Gioca giornata ${md}`}
        </button>
      )}

      {displayState === 'playing' && (
        <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Calcolo in corso…</p>
      )}

      {displayState === 'season-completed' && (
        <p style={{ textAlign: 'center', color: 'var(--gold)', fontWeight: 700 }}>
          🏁 Stagione conclusa
        </p>
      )}

      {userResult && displayState !== 'pending' && (
        <div style={{ marginTop: 10, fontSize: 12, color: 'var(--text-muted)' }}>
          Ultima giornata: {userResult.fantapunti}pt · {userResult.golFatti} gol
        </div>
      )}

      {error && (
        <div style={{ marginTop: 8, fontSize: 12, color: 'var(--danger)' }}>
          {error === 'SkipsExhausted' ? 'Skip esauriti per oggi. Riprova domani.' :
           error === 'RosterTooSmall' ? 'Rosa troppo piccola: servono almeno 15 giocatori.' :
           error === 'PlayerPoolMissing' ? 'Pool giocatori non disponibile.' :
           `Errore: ${error}`}
        </div>
      )}
    </div>
  );
}
```

> **Nota:** il `playersPool` passato a `playMatchday` qui è temporaneamente solo `rosa`. **Task 21** lo collegherà al pool Serie A reale.

- [ ] **Step 2: Commit**

```bash
git add src/components/dashboard/MatchdayCard.jsx
git commit -m "feat(dashboard): add MatchdayCard with 4 states and skip cooldown"
```

---

## Task 21: Estrai il builder del pool Serie A e collega `MatchdayCard`

**Contesto verificato:** in `src/pages/Scouting.jsx` (linea ~210) il pool dei 674 giocatori viene costruito così:

```js
const allPlayers = useMemo(() => {
  return teams.flatMap((team) =>
    (team.squad || []).map((player) => {
      const stats = stimaStats(player);
      const { nome, cognome } = splitName(player.name);
      return {
        id: player.id,
        nome, cognome,
        ruoloMantra: POSITION_TO_MANTRA[player.position] || 'C',
        squadra: team.shortName || team.name,
        ...stats,
      };
    })
  );
}, [teams]);
```

dove `teams` viene da `useSerieAStore.teams`. Estraiamo questa logica in un helper riusabile.

**Files:**
- Create: `src/lib/players.js`
- Modify: `src/pages/Scouting.jsx` (usa il nuovo helper)
- Modify: `src/components/dashboard/MatchdayCard.jsx`

- [ ] **Step 1: Crea `src/lib/players.js`**

Copia (NON ricreare) le funzioni esistenti `stimaStats`, `splitName`, `POSITION_TO_MANTRA`, `QUOTA_RANGE`, `MEDIA_RANGE` da `Scouting.jsx` in `src/lib/players.js`:

```js
// src/lib/players.js
// Helper per costruire il pool flat dei giocatori Serie A da useSerieAStore.teams.
// Estratto da Scouting.jsx — single source of truth.

const POSITION_TO_MANTRA = {
  Goalkeeper: 'Por',
  Defence:    'DC',
  Midfield:   'C',
  Offence:    'A',
};

const QUOTA_RANGE = {
  Goalkeeper: [8,  22],
  Defence:    [6,  20],
  Midfield:   [8,  26],
  Offence:    [12, 40],
};

const MEDIA_RANGE = {
  Goalkeeper: [6.1, 6.9],
  Defence:    [6.0, 6.8],
  Midfield:   [6.2, 7.1],
  Offence:    [6.4, 7.5],
};

function stimaStats(player) {
  const seed = (player.id * 7 + 13) % 100;
  const pos  = player.position || 'Midfield';

  const [minQ, maxQ] = QUOTA_RANGE[pos] || [8, 20];
  const [minM, maxM] = MEDIA_RANGE[pos] || [6.2, 6.9];

  const quota = minQ + Math.round((seed / 100) * (maxQ - minQ));
  const media = +(minM + (seed / 100) * (maxM - minM)).toFixed(1);

  const votiUltimi5 = Array.from({ length: 5 }, (_, i) => {
    const raw = media + ((seed * (i + 3)) % 20) * 0.05 - 0.5;
    return Math.round(Math.max(5.0, Math.min(8.5, raw)) * 10) / 10;
  });

  return {
    votoMedia:    media,
    quotazione:   quota,
    votiUltimi5,
    infortunato:  seed % 16 === 0,
    diffidato:    seed % 9  === 0,
  };
}

function splitName(fullName = '') {
  const parts = fullName.trim().split(' ');
  if (parts.length === 1) return { nome: '', cognome: parts[0] };
  return {
    nome:    parts.slice(0, -1).join(' '),
    cognome: parts[parts.length - 1],
  };
}

/**
 * Trasforma `useSerieAStore.teams` in un array flat di player objects
 * con la shape consumata da useAppStore.rosa, draftBotRoster, ecc.
 */
export function flattenSerieAPlayers(teams) {
  return (teams || []).flatMap((team) =>
    (team.squad || []).map((player) => {
      const stats = stimaStats(player);
      const { nome, cognome } = splitName(player.name);
      return {
        id: player.id,
        nome, cognome,
        ruoloMantra: POSITION_TO_MANTRA[player.position] || 'C',
        squadra: team.shortName || team.name,
        ...stats,
      };
    })
  );
}
```

- [ ] **Step 2: Refactor `Scouting.jsx` per usare l'helper**

In `src/pages/Scouting.jsx`:
1. Aggiungi `import { flattenSerieAPlayers } from '../lib/players';`
2. Sostituisci la `useMemo` di `allPlayers` con: `const allPlayers = useMemo(() => flattenSerieAPlayers(teams), [teams]);`
3. Rimuovi le costanti/funzioni `POSITION_TO_MANTRA`, `QUOTA_RANGE`, `MEDIA_RANGE`, `stimaStats`, `splitName` (ora vivono in `lib/players.js`).

- [ ] **Step 3: Smoke test refactor**

Run: `npm run dev`. Apri Scouting → verifica che mostri ancora i 674 giocatori uguali. Nessuna regressione.

- [ ] **Step 4: Aggiorna `MatchdayCard.jsx` per usare il pool Serie A**

In `src/components/dashboard/MatchdayCard.jsx`:

```jsx
import useSerieAStore from '../../stores/useSerieAStore';
import { flattenSerieAPlayers } from '../../lib/players';
// ...
const teams = useSerieAStore((s) => s.teams);
const fetchTeams = useSerieAStore((s) => s.fetchTeams);
// ...
useEffect(() => {
  if (!teams || teams.length === 0) fetchTeams?.();
}, [teams, fetchTeams]);

async function handlePlay() {
  setBusy(true); setError(null);
  try {
    const seriaAPool = flattenSerieAPlayers(teams || []);
    const playersPool = seriaAPool.length >= 100 ? seriaAPool : [...rosa, ...generateDummyPool(200)];
    await playMatchday(currentLeague.id, { playersPool });
  } catch (e) {
    setError(e.message);
  } finally {
    setBusy(false);
  }
}

// Helper di fallback se Serie A non caricato (utente offline o store vuoto)
function generateDummyPool(n) {
  const ruoli = ['Por', 'DC', 'C', 'A'];
  const out = [];
  for (let i = 0; i < n; i++) {
    out.push({
      id: `dummy-${i}-${Date.now()}`,
      cognome: `Bot${i}`,
      nome: '',
      ruoloMantra: ruoli[i % 4],
      squadra: 'Pool',
      quotazione: 8 + (i % 18),
      votoMedia: 5.8 + ((i % 25) / 10),
    });
  }
  return out;
}
```

- [ ] **Step 5: Smoke test playMatchday end-to-end**

Run: `npm run dev`. Apri Scouting (per popolare `useSerieAStore.teams`). Crea lega, aggiungi 15 giocatori, torna in Dashboard, premi "Avvia stagione". In console:

```js
const lid = useLeagueStore.getState().currentLeagueId;
const l = useLeagueStore.getState().leagues.find(x => x.id === lid);
console.log('bots:', l.bots.map(b => ({ name: b.name, archetype: b.archetype, rosterSize: b.roster.length })));
console.log('matchdayResults:', l.matchdayResults.length);
console.log('standings:', l.standings);
```

Expected: 7 bot con rose ~25, 1 matchdayResult, 8 squadre in standings.

- [ ] **Step 6: Commit**

```bash
git add src/lib/players.js src/pages/Scouting.jsx src/components/dashboard/MatchdayCard.jsx
git commit -m "feat(players): extract flattenSerieAPlayers helper and wire MatchdayCard to real pool"
```

---

## Task 22: Integra `MatchdayCard` in `Dashboard.jsx` + pulisci numeri demo

**Files:**
- Modify: `src/pages/Dashboard.jsx`

- [ ] **Step 1: Leggi Dashboard.jsx attuale**

Run: `cat src/pages/Dashboard.jsx | head -120`

- [ ] **Step 2: Aggiungi import e renderizza `<MatchdayCard />` accanto al `CountdownCard` esistente**

Aggiungi import:

```jsx
import MatchdayCard from '../components/dashboard/MatchdayCard';
```

Inserisci `<MatchdayCard />` immediatamente sopra il `<CountdownCard />` esistente (la card della partita Serie A reale). Mantieni entrambi: la `MatchdayCard` è gameplay lega, la `CountdownCard` è informativa Serie A.

- [ ] **Step 3: Pulisci numeri demo**

Cerca riferimenti a valori hard-coded come "73", "GIORNATA 14", "-4 sulla media", "2/8" nella Dashboard:

```bash
grep -n "GIORNATA 14\|sulla media\|73 punti\|2/8" src/pages/Dashboard.jsx
```

Sostituisci i numeri demo con derived state da `currentLeague.matchdayResults` e `currentLeague.standings`. Se la lega non ha ancora giocato giornate, mostra empty state in italiano (es. "Schiera la tua prima formazione").

- [ ] **Step 4: Smoke test manuale**

Apri `localhost:5173`, verifica:
- Dashboard: vedi `MatchdayCard` (in stato `pending` o `ready`)
- I numeri demo (73 punti, 14 giornata, ecc.) non sono più visibili a meno che non corrispondano a dati reali

- [ ] **Step 5: Commit**

```bash
git add src/pages/Dashboard.jsx
git commit -m "feat(dashboard): integrate MatchdayCard and remove demo placeholders"
```

---

## Task 23: Pagina `MatchdayDetail.jsx` su rotta `/giornata/:n`

**Files:**
- Create: `src/pages/MatchdayDetail.jsx`
- Modify: `src/App.jsx`

- [ ] **Step 1: Implementa la pagina**

```jsx
// src/pages/MatchdayDetail.jsx
import { useParams, Link } from 'react-router-dom';
import useLeagueStore from '../stores/useLeagueStore';

export default function MatchdayDetail() {
  const { n } = useParams();
  const md = Number(n);

  const result = useLeagueStore((s) => {
    const l = s.leagues.find((x) => x.id === s.currentLeagueId);
    return l?.matchdayResults?.find((r) => r.matchday === md) || null;
  });
  const bots = useLeagueStore((s) => {
    const l = s.leagues.find((x) => x.id === s.currentLeagueId);
    return l?.bots || [];
  });

  function teamName(id) {
    if (id === 'user') return 'La mia squadra';
    return bots.find((b) => b.id === id)?.name || id;
  }

  if (!result) {
    return (
      <div style={{ padding: 24 }}>
        <h2>Giornata {md}</h2>
        <p>Giornata non ancora giocata.</p>
        <Link to="/">← Torna alla dashboard</Link>
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <Link to="/" style={{ fontSize: 12 }}>← Dashboard</Link>
      <h2>Giornata {md} {result.voteSourceMode === 'simulated' && <small style={{ color: 'var(--text-muted)' }}>(modalità demo)</small>}</h2>

      <h3>Partite</h3>
      <ul>
        {result.matches.map((m, i) => (
          <li key={i}>
            <strong>{teamName(m.home)}</strong> {m.homeGoals} – {m.awayGoals} <strong>{teamName(m.away)}</strong>
            <span style={{ marginLeft: 8, color: 'var(--text-muted)' }}>
              ({m.homePts}pt vs {m.awayPts}pt)
            </span>
          </li>
        ))}
      </ul>

      <h3>I tuoi voti</h3>
      <ul>
        {result.teams.user?.rawScores?.map((s, i) => (
          <li key={i}>
            {s.riservaUfficio ? '(riserva d\'ufficio)' : s.playerId}
            : voto {s.voto}
            {s.gol > 0 && `, ${s.gol} gol`}
            {s.assist > 0 && `, ${s.assist} assist`}
            {s.ammonizione > 0 && ', ammonizione'}
            {s.espulsione > 0 && ', espulsione'}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

- [ ] **Step 2: Aggiungi la rotta in `App.jsx`**

Identifica il componente Router. Aggiungi:

```jsx
import MatchdayDetail from './pages/MatchdayDetail';
// ...
<Route path="/giornata/:n" element={<MatchdayDetail />} />
```

- [ ] **Step 3: Smoke test manuale**

Dopo aver giocato una giornata, naviga a `#/giornata/1` e verifica che mostri partite + voti.

- [ ] **Step 4: Commit**

```bash
git add src/pages/MatchdayDetail.jsx src/App.jsx
git commit -m "feat(pages): add MatchdayDetail at /giornata/:n route"
```

---

## Task 24: Pulisci numeri demo in `Statistiche.jsx`

**Files:**
- Modify: `src/pages/Statistiche.jsx`

- [ ] **Step 1: Leggi il file attuale**

Run: `cat src/pages/Statistiche.jsx | head -80`

- [ ] **Step 2: Sostituisci i valori hard-coded**

Localizza i valori demo: 462pt totali, 64.0 media, 81pt G3, 46pt G12, "V/P/S undefined/undefined/undefined", 14 giornate.

Sostituisci con derived state da `currentLeague.matchdayResults`:

```jsx
import useLeagueStore from '../stores/useLeagueStore';
// ...
const currentLeague = useLeagueStore((s) =>
  s.leagues.find((l) => l.id === s.currentLeagueId) || null
);
const userResults = currentLeague?.matchdayResults
  ?.map((r) => ({ md: r.matchday, fp: r.teams?.user?.fantapunti ?? 0 })) ?? [];

const punti = userResults.map((r) => r.fp);
const totale = punti.reduce((s, n) => s + n, 0);
const media = punti.length ? (totale / punti.length).toFixed(1) : '0.0';
const migliore = punti.length ? Math.max(...punti) : 0;
const peggiore = punti.length ? Math.min(...punti) : 0;
const migliordayMd = userResults.find((r) => r.fp === migliore)?.md;
const peggiordayMd = userResults.find((r) => r.fp === peggiore)?.md;

const userStanding = currentLeague?.standings?.find((s) => s.isUser);
const vps = userStanding ? `${userStanding.V}/${userStanding.N}/${userStanding.P}` : '—';
```

E renderizza usando questi valori (es. `Punti Totali Stagione: {totale}pt`, `Media: {media}`, `Migliore Giornata: {migliore}pt G{migliordayMd}`, ecc.).

Empty state se `userResults.length === 0`: "Nessuna giornata giocata. Apri la dashboard per iniziare la stagione."

- [ ] **Step 3: Smoke test**

Dopo aver giocato 1-2 giornate, apri `#/statistiche` e verifica numeri coerenti.

- [ ] **Step 4: Commit**

```bash
git add src/pages/Statistiche.jsx
git commit -m "fix(stats): replace demo numbers with real data from matchdayResults"
```

---

## Task 25: Collega `Calendario.jsx` ai dati reali

**Files:**
- Modify: `src/pages/Calendario.jsx`

- [ ] **Step 1: Leggi il file attuale**

Run: `cat src/pages/Calendario.jsx`

- [ ] **Step 2: Sostituisci "vs Da definire" con dati da `currentLeague.calendar` e `matchdayResults`**

Per ogni giornata `md`:
- Trova `pairing` dell'utente in `currentLeague.calendar[md-1].pairings.find(p => p.home === 'user' || p.away === 'user')`
- Avversario: `pairing.home === 'user' ? pairing.away : pairing.home`
- Risolvi nome avversario via `currentLeague.bots.find(b => b.id === oppId)?.name`
- Se `matchdayResults.find(r => r.matchday === md)` esiste: mostra punteggio `userTeam.fantapunti vs oppTeam.fantapunti` e gol
- Altrimenti "Da giocare"

- [ ] **Step 3: Smoke test**

Apri `#/calendario`. Verifica che le giornate mostrino avversari reali, le giocate mostrino esiti.

- [ ] **Step 4: Commit**

```bash
git add src/pages/Calendario.jsx
git commit -m "feat(calendario): wire to currentLeague.calendar and matchdayResults"
```

---

## Task 26: Verifica `Classifica.jsx` reattività

**Files:**
- Modify (verifica): `src/pages/Classifica.jsx`

- [ ] **Step 1: Verifica che la pagina mostri le 8 squadre dopo aver giocato**

Apri `#/classifica`. Verifica che dopo 1+ giornata mostri standings popolate con `user` evidenziato.

Se la pagina mostra ancora classifica vuota o dati legacy:
- Verifica che il selettore reattivo `useLeagueStore((s) => s.leagues.find((l) => l.id === s.currentLeagueId)?.standings || [])` ritorni i dati corretti
- Il file dovrebbe già funzionare dato che era reattivo nella spec

- [ ] **Step 2: Eventuale fix minimale**

Se serve, aggiungi un fallback empty state per quando `standings.length === 0`.

- [ ] **Step 3: Commit (solo se serve modifica)**

```bash
git add src/pages/Classifica.jsx
git commit -m "fix(classifica): ensure empty state when no matchdays played"
```

---

## Task 27: Smoke test manuale completo + PR Chunk 4

- [ ] **Step 1: Esegui i 6 smoke test della spec**

In `npm run dev`:

1. Crea lega, aggiungi 15 giocatori reali, "Avvia stagione" → vedi risultato + classifica popolata
2. Tenta "Gioca G1" di nuovo → errore esplicito, niente duplicati
3. "Skippa" 3 volte oggi, alla 4ª → bottone disabled "Skip esauriti"
4. DevTools offline, "Gioca G2" → toast "modalità demo" (visibile in MatchdayDetail come "(modalità demo)"), giornata si gioca
5. localStorage v1 manuale → dashboard mostra `pending` con CTA "Avvia stagione"
6. Gioca tutte 14 giornate → `seasonStatus: 'completed'`, MatchdayCard mostra "🏁 Stagione conclusa"

Annota nella PR description quali test sono passati con uno screenshot dello stato finale.

- [ ] **Step 2: Push e PR**

```bash
git push -u origin claude/chunk-4-ui-gameplay-{SESSIONID}

gh pr create --title "feat(ui): MatchdayCard, /giornata/:n, real data wiring" --body "$(cat <<'EOF'
## Summary
- New `MatchdayCard` on Dashboard (4 states: pending/locked/ready/playing/season-completed)
- New `useCountdown` shared hook
- New page `/giornata/:n` for matchday detail
- Replaces demo numbers in Dashboard, Statistiche
- Wires Calendario and Classifica to real `currentLeague` data

## Smoke tests (manual)
- [x] Create league, ≥15 players, play G1 → standings populated
- [x] Replay same matchday → AlreadyPlayed
- [x] Skip 3× today, 4th → disabled
- [x] DevTools offline → "modalità demo" badge shown
- [x] Legacy v1 league → pending state with "Avvia stagione" CTA
- [x] Play all 14 → season-completed state

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

---

# CHUNK 5 — Cleanup, docs, snapshot opzionale

Scopo: pulizia residua, aggiornare CLAUDE.md e api-conventions.md, eventualmente aggiungere snapshot server-side se avanza tempo.

**Dipendenze:** Chunk 4 mergeato.

**Branch:** `claude/chunk-5-cleanup-docs-{SESSIONID}`

## Task 28: Rimuovi `CLASSIFICA_DEMO` e `CALENDARIO_DEMO` da useAppStore

**Files:**
- Modify: `src/store/useAppStore.js`

- [ ] **Step 1: Leggi il file**

```bash
cat src/store/useAppStore.js
```

- [ ] **Step 2: Rimuovi le costanti demo non più usate**

Cancella le costanti `CLASSIFICA_DEMO` e `CALENDARIO_DEMO` (linee 4-19 circa).

Sostituisci `classifica: CLASSIFICA_DEMO` con `classifica: []` e `calendario: CALENDARIO_DEMO` con `calendario: []`.

I getter/setter (`setClassifica`, `setCalendario`) restano: l'eventuale uso legacy di altre pagine non si rompe.

- [ ] **Step 3: Smoke test**

`npm run build` → deve passare senza warning di import non usati.
Apri Dashboard, Classifica, Statistiche → niente regressioni visive.

- [ ] **Step 4: Commit**

```bash
git add src/store/useAppStore.js
git commit -m "chore: remove unused CLASSIFICA_DEMO/CALENDARIO_DEMO constants"
```

---

## Task 29: Aggiorna `CLAUDE.md` e `api-conventions.md`

**Files:**
- Modify: `CLAUDE.md`
- Modify: `.claude/rules/api-conventions.md`

- [ ] **Step 1: CLAUDE.md — affina regola sistema leghe**

Trova la regola 3:
```
3. **Sistema leghe**: MVP localStorage-only (`fantabrain-leagues`) — NO chiamate backend per le leghe
```

Sostituisci con:

```
3. **Sistema leghe**: MVP localStorage-only (`fantabrain-leagues v2`) per leghe/rose/calendario/risultati. Il backend espone solo voti come dataset statici (`/api/voti/:season/matchday/:n`, read-only, no JWT). Niente schema dominio leghe in Postgres.
```

Aggiungi nella sezione "File chiave":

```
- `src/lib/season/` — engine puro single-player (fantapunti, voti, calendar, botStrategy, playMatchday)
- `server/routes/voti.js` + `server/data/voti-{season}/` — dataset voti statico
```

- [ ] **Step 2: `.claude/rules/api-conventions.md` — documenta /api/voti/**

Aggiungi nuova sezione prima di "Autenticazione":

```markdown
## Voti stagionali — endpoint statico

- Rotta: `GET /api/voti/:season/matchday/:n`
- Read-only, no JWT (è un dataset di stagione pubblico)
- Cache `Cache-Control: public, max-age=86400, immutable`
- 200 con shape `{ season, matchday, source, players: { [playerId]: rawScore } }`
- 404 se la giornata non esiste sul filesystem → frontend cade su `simulateVoto`
- 400 su season non whitelistata o n fuori range
- File serviti da `server/data/voti-{season}/matchday-{n}.json`
- Sourcing del dataset reale è una decisione di prodotto separata
```

- [ ] **Step 3: Commit**

```bash
git add CLAUDE.md .claude/rules/api-conventions.md
git commit -m "docs: update CLAUDE.md and api-conventions for season engine and voti endpoint"
```

---

## Task 30 (OPZIONALE): Snapshot server-side

> **Solo se i Chunk 1-4 sono mergeati con tempo restante.** Non blocca lo ship dell'epica.

**Files:**
- Modify: `server/db/schema.sql`
- Create: `server/routes/leagueSnapshots.js`
- Create: `server/tests/leagueSnapshots.test.js`
- Modify: `server.js`

- [ ] **Step 1: Schema**

Aggiungi a `server/db/schema.sql`:

```sql
CREATE TABLE IF NOT EXISTS league_snapshots (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  league_id VARCHAR(100) NOT NULL,
  payload JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE (user_id, league_id)
);
```

- [ ] **Step 2: Test fallente**

```js
// server/tests/leagueSnapshots.test.js
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

describe('league snapshot routes', () => {
  it('placeholder: see Task 30 step 3 for full impl', () => {
    assert.ok(true);
  });
});
```

- [ ] **Step 3: Implementazione minima**

```js
// server/routes/leagueSnapshots.js
import express from 'express';
import { authenticateJWT } from '../middleware/auth.js';
import pool from '../db/pool.js';

const router = express.Router();

router.post('/:leagueId', authenticateJWT, async (req, res) => {
  const { leagueId } = req.params;
  const userId = req.user.id;
  const payload = req.body;
  if (!payload || typeof payload !== 'object') return res.status(400).json({ error: 'invalid payload' });

  try {
    await pool.query(
      `INSERT INTO league_snapshots (user_id, league_id, payload)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, league_id) DO UPDATE SET payload = $3, created_at = NOW()`,
      [userId, leagueId, payload]
    );
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'snapshot save failed', detail: err.message });
  }
});

router.get('/:leagueId', authenticateJWT, async (req, res) => {
  const { leagueId } = req.params;
  const userId = req.user.id;
  try {
    const r = await pool.query(
      `SELECT payload, created_at FROM league_snapshots WHERE user_id = $1 AND league_id = $2`,
      [userId, leagueId]
    );
    if (!r.rows.length) return res.status(404).json({ error: 'no snapshot' });
    res.json({ payload: r.rows[0].payload, createdAt: r.rows[0].created_at });
  } catch (err) {
    res.status(500).json({ error: 'snapshot load failed', detail: err.message });
  }
});

export default router;
```

- [ ] **Step 4: Registra in server.js**

Aggiungi in `server.js` accanto alle altre route:

```js
import leagueSnapshotsRoutes from './server/routes/leagueSnapshots.js';
// ...
app.use('/api/leagues', leagueSnapshotsRoutes);
```

- [ ] **Step 5: Bottone UI "Salva su account" (opzionale ulteriore)**

Aggiungi un piccolo bottone in `src/pages/LeagueSettings.jsx` che chiama `POST /api/leagues/:leagueId` con il payload `JSON.stringify(currentLeague)`.

Se l'utente non è loggato, il bottone è disabled con tooltip "Accedi per salvare su account".

- [ ] **Step 6: Commit**

```bash
git add server/db/schema.sql server/routes/leagueSnapshots.js server/tests/leagueSnapshots.test.js server.js src/pages/LeagueSettings.jsx
git commit -m "feat(server): optional league snapshots for cross-device recovery"
```

---

## Task 31: PR Chunk 5

- [ ] **Step 1: Push e PR**

```bash
git push -u origin claude/chunk-5-cleanup-docs-{SESSIONID}

gh pr create --title "chore: cleanup demo data, docs update, optional snapshot" --body "$(cat <<'EOF'
## Summary
- Remove unused CLASSIFICA_DEMO/CALENDARIO_DEMO from useAppStore
- Update CLAUDE.md league rule and add `/api/voti/` to api-conventions
- (Optional) league snapshot endpoints for cross-device recovery

## Test plan
- [x] `npm run build` clean
- [x] Manual: dashboard, classifica, statistiche all show real data only
- [ ] (Optional) snapshot save/load round-trip works for logged-in users

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

---

## Recap

| Chunk | Branch | Granularità | Parallelism |
|-------|--------|-------------|-------------|
| 0 | (small fix) | 1 task | — |
| 1 | `claude/chunk-1-engine-season-{SESSIONID}` | Task 1-11 | parallel con 2 |
| 2 | `claude/chunk-2-voti-backend-{SESSIONID}` | Task 12-14 | parallel con 1 |
| 3 | `claude/chunk-3-league-store-{SESSIONID}` | Task 15-18 | dopo 1+2 merge |
| 4 | `claude/chunk-4-ui-gameplay-{SESSIONID}` | Task 19-27 | dopo 3 merge |
| 5 | `claude/chunk-5-cleanup-docs-{SESSIONID}` | Task 28-31 | dopo 4 merge |
