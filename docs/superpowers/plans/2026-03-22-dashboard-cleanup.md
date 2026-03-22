# Dashboard Cleanup — Dati Reali Lega Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rimuovere tutti i dati hardcodati dalla Dashboard e collegarla ai dati reali di `useLeagueStore`; quando la lega è vuota mostrare placeholder eleganti al posto di dati inventati.

**Architecture:** Si crea `useLeagueStore` (Zustand + persist) con `currentLeague: null` come stato iniziale (Stato B — placeholder). La Dashboard legge da questo store e gestisce 3 casi: nessuna lega, lega senza partite, lega con partite. I componenti UI esistenti (`KpiCard`, `RankItem`) vengono riutilizzati con dati derivati dallo store invece che da `mockData.js`.

**Tech Stack:** React 19, Zustand 4.5 (con `persist` middleware), Vite 5, CSS variables (`--accent-primary` non esiste — usare `--accent-blue` per cyan, `--accent-red` per rosso, `--bg-elevated` per glass)

> ⚠️ **Note sul design system**: le variabili CSS usate nel progetto sono: `--bg-deep`, `--bg-card`, `--bg-elevated`, `--border`, `--accent-green`, `--accent-blue`, `--accent-amber`, `--accent-red`, `--text-primary`, `--text-secondary`, `--text-muted`. NON esiste `--accent-primary` o `--danger` — usare `--accent-blue` e `--accent-red`.

> ⚠️ **Nessun test framework**: il progetto non ha Jest/Vitest configurati. Ogni task si verifica avviando il dev server con `npm run dev` nella cartella del progetto.

---

## File Map

| File | Azione | Responsabilità |
|------|--------|----------------|
| `src/store/useLeagueStore.js` | **CREA** | Store Zustand + persist per la lega corrente |
| `src/components/ui/NoLeagueBanner.jsx` | **CREA** | Banner quando `currentLeague === null` |
| `src/components/ui/LeagueStandingsEmpty.jsx` | **CREA** | Placeholder classifica (lega senza risultati) |
| `src/components/ui/PointsChartEmpty.jsx` | **CREA** | Skeleton barre grafico (lega senza risultati) |
| `src/pages/Dashboard.jsx` | **MODIFICA** | Legge da `useLeagueStore`; gestisce 3 stati |
| `src/components/layout/Topbar.jsx` | **MODIFICA** | Mostra `currentLeague.name` invece di `user.league` |

**File NON toccati**: `mockData.js`, `useAppStore.js`, `KpiCard.jsx`, `RankItem.jsx`, `AlertItem.jsx`, backend.

---

## Task 1: Crea `useLeagueStore`

**File:**
- Crea: `src/store/useLeagueStore.js`

Il store usa il `persist` middleware di Zustand (già disponibile in Zustand 4.x senza installazioni aggiuntive). Stato iniziale: `currentLeague: null` → Dashboard mostra Stato B.

La struttura di `currentLeague` quando popolata:
```js
{
  id: string,
  name: string,
  inviteCode: string,
  maxParticipants: number,
  participants: [
    { id: string, userName: string, teamName: string, joinedAt: string, isCurrentUser: boolean }
  ],
  results: [
    { matchday: number, date: string, scores: { [participantId]: number } }
  ]
}
```

- [ ] **Step 1: Crea il file**

```js
// src/store/useLeagueStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useLeagueStore = create(
  persist(
    (set) => ({
      currentLeague: null,

      setLeague: (league) => set({ currentLeague: league }),

      clearLeague: () => set({ currentLeague: null }),

      addResult: (result) =>
        set((state) => ({
          currentLeague: state.currentLeague
            ? {
                ...state.currentLeague,
                results: [...state.currentLeague.results, result],
              }
            : null,
        })),
    }),
    { name: 'fantabrain-league' }
  )
);

export default useLeagueStore;
```

- [ ] **Step 2: Verifica avvio senza errori**

Avvia il dev server:
```bash
cd /c/Users/DantePagani/Downloads/fantabrain-main/fantabrain-main
npm run dev
```
Expected: nessun errore di import. Il progetto gira normalmente (niente cambia ancora in UI perché il store non è ancora usato).

- [ ] **Step 3: Commit**

```bash
cd /c/Users/DantePagani/Downloads/fantabrain-main/fantabrain-main
git add src/store/useLeagueStore.js
git commit -m "feat: add useLeagueStore with Zustand persist"
```

---

## Task 2: Crea `NoLeagueBanner`

**File:**
- Crea: `src/components/ui/NoLeagueBanner.jsx`

Mostrato nella Dashboard quando `currentLeague === null`. Due bottoni che cambiano pagina via `setCurrentPage` di `useAppStore`.

- [ ] **Step 1: Crea il componente**

```jsx
// src/components/ui/NoLeagueBanner.jsx
import { useNavigate } from 'react-router-dom';

export default function NoLeagueBanner() {
  const navigate = useNavigate();

  return (
    <div style={{
      background: 'var(--bg-elevated)',
      border: '1px solid var(--border)',
      borderRadius: 12,
      padding: '32px 24px',
      textAlign: 'center',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 16,
    }}>
      <div style={{ fontSize: 32 }}>⚽</div>
      <div>
        <div style={{
          fontFamily: 'Barlow Condensed',
          fontWeight: 700,
          fontSize: 18,
          color: 'var(--text-primary)',
          marginBottom: 8,
        }}>
          Non fai ancora parte di una lega
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>
          Crea la tua lega e invita i tuoi amici,<br />
          oppure unisciti a una lega esistente.
        </div>
      </div>
      <div style={{ display: 'flex', gap: 12 }}>
        <button
          className="btn-primary"
          onClick={() => navigate('/classifica')}
        >
          Crea Lega
        </button>
        <button
          className="btn-secondary"
          onClick={() => navigate('/classifica')}
        >
          Unisciti
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ui/NoLeagueBanner.jsx
git commit -m "feat: add NoLeagueBanner placeholder component"
```

---

## Task 3: Crea `LeagueStandingsEmpty`

**File:**
- Crea: `src/components/ui/LeagueStandingsEmpty.jsx`

Mostrato quando `currentLeague` esiste ma `results.length === 0`. Mostra il numero di partecipanti iscritti e la lista dei loro nomi.

- [ ] **Step 1: Crea il componente**

```jsx
// src/components/ui/LeagueStandingsEmpty.jsx
export default function LeagueStandingsEmpty({ league }) {
  const partecipanti = league?.participants || [];
  const max = league?.maxParticipants || '?';

  return (
    <div style={{
      background: 'var(--bg-elevated)',
      border: '1px solid var(--border)',
      borderRadius: 12,
      padding: '24px',
      textAlign: 'center',
    }}>
      <div style={{ fontSize: 24, marginBottom: 12 }}>🏆</div>
      <div style={{
        fontFamily: 'Barlow Condensed',
        fontWeight: 700,
        fontSize: 16,
        color: 'var(--text-primary)',
        marginBottom: 6,
      }}>
        La classifica sarà disponibile dopo la prima giornata
      </div>
      <div style={{
        fontSize: 13,
        color: 'var(--text-muted)',
        marginBottom: 16,
      }}>
        Partecipanti iscritti: <strong style={{ color: 'var(--text-secondary)' }}>{partecipanti.length} / {max}</strong>
      </div>

      {partecipanti.length > 0 && (
        <div style={{ textAlign: 'left' }}>
          {partecipanti.map((p) => (
            <div key={p.id} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '6px 8px',
              borderRadius: 6,
              background: p.isCurrentUser ? 'rgba(0, 230, 118, 0.06)' : 'transparent',
              borderLeft: p.isCurrentUser ? '2px solid rgba(0, 230, 118, 0.4)' : '2px solid transparent',
              marginBottom: 4,
            }}>
              <span style={{ fontSize: 13, color: p.isCurrentUser ? 'var(--accent-green)' : 'var(--text-secondary)' }}>
                {p.teamName}
                {p.isCurrentUser && <span style={{ fontSize: 10, marginLeft: 6, color: 'var(--text-muted)' }}>TU</span>}
              </span>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                Iscritto il {new Date(p.joinedAt).toLocaleDateString('it-IT', { day: '2-digit', month: 'short' })}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ui/LeagueStandingsEmpty.jsx
git commit -m "feat: add LeagueStandingsEmpty placeholder component"
```

---

## Task 4: Crea `PointsChartEmpty`

**File:**
- Crea: `src/components/ui/PointsChartEmpty.jsx`

Skeleton con 5 barre a opacità bassa e label G1–G5, più testo esplicativo.

- [ ] **Step 1: Crea il componente**

```jsx
// src/components/ui/PointsChartEmpty.jsx
export default function PointsChartEmpty() {
  const skeletonBars = [
    { height: '60%' },
    { height: '80%' },
    { height: '45%' },
    { height: '70%' },
    { height: '55%' },
  ];

  return (
    <div>
      <div style={{
        display: 'flex',
        alignItems: 'flex-end',
        gap: 4,
        height: 50,
        marginBottom: 4,
      }}>
        {skeletonBars.map((bar, i) => (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
            <div style={{
              width: '100%',
              height: bar.height,
              background: 'var(--bg-elevated)',
              borderRadius: '2px 2px 0 0',
              opacity: 0.35,
              border: '1px solid var(--border)',
            }} />
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 4 }}>
        {skeletonBars.map((_, i) => (
          <div key={i} style={{
            flex: 1, textAlign: 'center',
            fontSize: 10, color: 'var(--text-muted)',
            fontFamily: 'Barlow Condensed',
          }}>
            G{i + 1}
          </div>
        ))}
      </div>
      <div style={{
        marginTop: 10,
        fontSize: 11,
        color: 'var(--text-muted)',
        lineHeight: 1.5,
      }}>
        I tuoi punti appariranno qui dopo la prima giornata di campionato
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ui/PointsChartEmpty.jsx
git commit -m "feat: add PointsChartEmpty skeleton placeholder component"
```

---

## Task 5: Refactora `BarChart` in Dashboard per dati dinamici

**File:**
- Modifica: `src/pages/Dashboard.jsx` — solo la funzione `BarChart` interna (righe 23–44)

Il nuovo `BarChart` accetta `data: [{matchday, score, isAboveAvg}]` e colora le barre: `--accent-blue` se `isAboveAvg`, `--accent-red` se sotto.

- [ ] **Step 1: Sostituisci la funzione `BarChart` in Dashboard.jsx**

Trova e sostituisci la funzione `BarChart` (righe 23–44 circa) con:

```jsx
function BarChart({ data, height = 60 }) {
  if (!data || data.length === 0) return null;
  const max = Math.max(...data.map((d) => d.score), 1);
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height }}>
        {data.map((d, i) => (
          <div
            key={i}
            title={`G${d.matchday}: ${d.score}pt`}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              height: '100%',
              justifyContent: 'flex-end',
            }}
          >
            <div style={{
              fontSize: 9,
              color: 'var(--text-muted)',
              fontFamily: 'Barlow Condensed',
              marginBottom: 2,
              lineHeight: 1,
            }}>
              {d.score}
            </div>
            <div
              style={{
                width: '100%',
                background: d.isAboveAvg ? 'var(--accent-blue)' : 'var(--accent-red)',
                borderRadius: '2px 2px 0 0',
                height: `${Math.max((d.score / max) * 100, 4)}%`,
                opacity: 0.8,
                transition: 'opacity 0.2s',
                cursor: 'default',
                minWidth: 4,
              }}
              onMouseEnter={(e) => { e.currentTarget.style.opacity = 1; }}
              onMouseLeave={(e) => { e.currentTarget.style.opacity = 0.8; }}
            />
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 3, marginTop: 4 }}>
        {data.map((d, i) => (
          <div key={i} style={{
            flex: 1, textAlign: 'center',
            fontSize: 9, color: 'var(--text-muted)',
            fontFamily: 'Barlow Condensed',
          }}>
            G{d.matchday}
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Nota — NON verificare il grafico in browser dopo questo step**

Il vecchio call site in Dashboard.jsx (Task 9) passa ancora `statisticheStagione.andamentoPunti.slice(-10)` (array di numeri `[57, 69, ...]`) alla nuova firma che si aspetta `[{matchday, score, isAboveAvg}]`. Il grafico renderà barre con altezza 0 e label `undefined` — questo è atteso e verrà risolto al Task 9. Non c'è crash, ma l'aspetto è visivamente rotto fino ad allora. Ignora questa cosa e procedi ai task successivi.

---

## Task 6: Refactora Dashboard — Importazioni e logica store

**File:**
- Modifica: `src/pages/Dashboard.jsx`

Aggiungi l'import di `useLeagueStore` e sostituisci la lettura da `useAppStore.classifica` + `statisticheStagione` con la logica derivata dallo store.

- [ ] **Step 1: Sostituisci le importazioni in cima a Dashboard.jsx**

Vecchio (riga 1–5):
```js
import useAppStore from '../store/useAppStore';
import KpiCard from '../components/ui/KpiCard';
import AlertItem from '../components/ui/AlertItem';
import RankItem from '../components/ui/RankItem';
import { statisticheStagione } from '../data/mockData';
```

Nuovo:
```js
import useAppStore from '../store/useAppStore';
import useLeagueStore from '../store/useLeagueStore';
import KpiCard from '../components/ui/KpiCard';
import AlertItem from '../components/ui/AlertItem';
import RankItem from '../components/ui/RankItem';
import NoLeagueBanner from '../components/ui/NoLeagueBanner';
import LeagueStandingsEmpty from '../components/ui/LeagueStandingsEmpty';
import PointsChartEmpty from '../components/ui/PointsChartEmpty';
```

- [ ] **Step 2: Sostituisci la logica nel corpo del componente `Dashboard`**

Vecchio (righe 109–115 circa):
```js
const rosa = useAppStore((s) => s.rosa);
const classifica = useAppStore((s) => s.classifica);
const giornataCorrente = useAppStore((s) => s.giornataCorrente);
const titolariIds = useAppStore((s) => s.titolariIds);

const titolari = titolariIds.map((id) => rosa.find((g) => g.id === id)).filter(Boolean);
const userRow = classifica.find((c) => c.isUser);
```

Nuovo (sostituisce tutto il blocco fino a `const portieri = ...`, le linee di calcolo portieri/difensori/etc. e alerts rimangono uguali):
```js
const rosa = useAppStore((s) => s.rosa);
const giornataCorrente = useAppStore((s) => s.giornataCorrente);
const titolariIds = useAppStore((s) => s.titolariIds);
const currentLeague = useLeagueStore((s) => s.currentLeague);

const titolari = titolariIds.map((id) => rosa.find((g) => g.id === id)).filter(Boolean);

// --- Logica lega ---
const hasLeague = currentLeague !== null;
const results = currentLeague?.results || [];
const hasResults = results.length > 0;
const participants = currentLeague?.participants || [];

// Classifica calcolata dai risultati reali
const standings = hasLeague
  ? participants
      .map((p) => ({
        ...p,
        totalPoints: results.reduce((sum, r) => sum + (r.scores[p.id] || 0), 0),
        lastScore:
          hasResults
            ? (results[results.length - 1].scores[p.id] ?? null)
            : null,
        avg:
          hasResults
            ? results.reduce((sum, r) => sum + (r.scores[p.id] || 0), 0) / results.length
            : 0,
      }))
      .sort((a, b) => b.totalPoints - a.totalPoints)
      .map((p, i) => ({ ...p, position: i + 1 }))
  : [];

const me = standings.find((p) => p.isCurrentUser);

// Dati grafico: ultime 8 giornate dell'utente corrente
const chartData = hasResults && me
  ? results.slice(-8).map((r) => {
      const allScores = Object.values(r.scores);
      const avg = allScores.reduce((a, b) => a + b, 0) / (allScores.length || 1);
      const myScore = r.scores[me.id] || 0;
      return { matchday: r.matchday, score: myScore, isAboveAvg: myScore >= avg };
    })
  : [];

// KPI values
const myPosition = me ? `${me.position}° / ${standings.length}` : '—';
const myPositionSub = hasResults ? `${me?.totalPoints ?? 0} punti totali` : 'Nessuna giornata giocata';
const myMedia = me && hasResults ? me.avg.toFixed(1) : '—';
const myLastScore = me && me.lastScore !== null ? `${me.lastScore}pt` : '—';
const myLastScoreSub = hasResults
  ? `Giornata ${results[results.length - 1].matchday}`
  : 'Prima giornata non ancora giocata';
const myBestScore = chartData.length > 0
  ? `${Math.max(...chartData.map((d) => d.score))}pt`
  : '—';
const myBestScoreSub = chartData.length > 0
  ? `Giornata ${chartData.reduce((best, d) => d.score > best.score ? d : best).matchday}`
  : '—';
```

- [ ] **Step 3: Verifica in browser** — nessun errore nel browser console. La Dashboard è visibile.

---

## Task 7: Refactora Dashboard — KPI Cards

**File:**
- Modifica: `src/pages/Dashboard.jsx` — sezione KPI Row (righe 142–167 circa)

- [ ] **Step 1: Sostituisci le 4 KpiCard**

Vecchio:
```jsx
<KpiCard
  label="Posizione in Classifica"
  value={`${classifica.findIndex((c) => c.isUser) + 1}° / ${classifica.length}`}
  sub={`${userRow?.punti} punti totali`}
  color="var(--accent-green)"
/>
<KpiCard
  label="Media Punti"
  value={userRow?.puntimedia?.toFixed(1)}
  sub="punti a giornata"
  color="var(--accent-blue)"
/>
<KpiCard
  label="Ultimo Turno"
  value={`${userRow?.ultimoTurno}pt`}
  sub={`Giornata ${giornataCorrente - 1}`}
  color="var(--accent-amber)"
/>
<KpiCard
  label="Record Stagione"
  value={`${statisticheStagione.miglioreGiornata.punti}pt`}
  sub={`Giornata ${statisticheStagione.miglioreGiornata.giornata}`}
  color="var(--accent-red)"
/>
```

Nuovo:
```jsx
<KpiCard
  label="Posizione in Classifica"
  value={myPosition}
  sub={myPositionSub}
  color="var(--accent-green)"
/>
<KpiCard
  label="Media Punti"
  value={myMedia}
  sub={myMedia !== '—' ? 'punti a giornata' : 'Nessuna giornata giocata'}
  color="var(--accent-blue)"
/>
<KpiCard
  label="Ultimo Turno"
  value={myLastScore}
  sub={myLastScoreSub}
  color="var(--accent-amber)"
/>
<KpiCard
  label="Record Stagione"
  value={myBestScore}
  sub={myBestScoreSub}
  color="var(--accent-red)"
/>
```

- [ ] **Step 2: Verifica in browser** — le 4 KPI card mostrano `"—"` per tutti i valori (store vuoto = Stato B)

---

## Task 8: Refactora Dashboard — Classifica Lega

**File:**
- Modifica: `src/pages/Dashboard.jsx` — sezione "Mini classifica" (righe 231–246 circa)

- [ ] **Step 1: Sostituisci la sezione Classifica Lega**

Vecchio:
```jsx
{/* Mini classifica */}
<div className="card">
  <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
    <span className="section-title" style={{ fontSize: 15 }}>Classifica Lega</span>
    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>G{giornataCorrente - 1}</span>
  </div>
  {classifica.map((team, i) => (
    <RankItem
      key={team.id}
      posizione={i + 1}
      nome={team.nome}
      punti={team.punti}
      isUser={team.isUser}
      ultimoTurno={team.ultimoTurno}
    />
  ))}
</div>
```

Nuovo:
```jsx
{/* Mini classifica */}
<div className="card">
  <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
    <span className="section-title" style={{ fontSize: 15 }}>Classifica Lega</span>
    {hasResults && (
      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
        G{results[results.length - 1]?.matchday}
      </span>
    )}
  </div>

  {!hasLeague ? (
    <NoLeagueBanner />
  ) : !hasResults ? (
    <LeagueStandingsEmpty league={currentLeague} />
  ) : (
    standings.map((team) => (
      <RankItem
        key={team.id}
        posizione={team.position}
        nome={team.teamName}
        punti={team.totalPoints}
        isUser={team.isCurrentUser}
        ultimoTurno={team.lastScore}
      />
    ))
  )}
</div>
```

- [ ] **Step 2: Verifica in browser** — con store vuoto si vede `NoLeagueBanner` nella card classifica

---

## Task 9: Refactora Dashboard — Grafico Andamento

**File:**
- Modifica: `src/pages/Dashboard.jsx` — sezione grafico (righe 257–263 circa)

- [ ] **Step 1: Sostituisci la sezione grafico**

Vecchio:
```jsx
{/* Grafico andamento */}
<div style={{ marginTop: 16 }}>
  <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'Barlow Condensed', letterSpacing: '0.08em', marginBottom: 8 }}>
    ANDAMENTO ULTIME 10 GIORNATE
  </div>
  <BarChart data={statisticheStagione.andamentoPunti.slice(-10)} height={50} />
</div>
```

Nuovo:
```jsx
{/* Grafico andamento */}
<div style={{ marginTop: 16 }}>
  <div style={{
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  }}>
    <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'Barlow Condensed', letterSpacing: '0.08em' }}>
      ANDAMENTO ULTIME {Math.min(chartData.length, 8)} GIORNATE
    </div>
    {hasResults && chartData.length > 0 && (
      <div style={{ display: 'flex', gap: 8, fontSize: 10, color: 'var(--text-muted)' }}>
        <span style={{ color: 'var(--accent-blue)' }}>■</span> Tu
        <span style={{ color: 'var(--accent-red)' }}>■</span> Sotto media
      </div>
    )}
  </div>
  {!hasLeague || !hasResults ? (
    <PointsChartEmpty />
  ) : (
    <BarChart data={chartData} height={50} />
  )}
</div>
```

- [ ] **Step 2: Verifica in browser** — con store vuoto si vede lo skeleton `PointsChartEmpty`

---

## Task 10: Aggiorna Topbar — Nome lega reale

**File:**
- Modifica: `src/components/layout/Topbar.jsx`

- [ ] **Step 1: Aggiungi import e sostituisci `user.league`**

Aggiungi l'import dopo la riga 2:
```js
import useLeagueStore from '../../store/useLeagueStore';
```

Nel corpo del componente, dopo `const giornataCorrente = ...`:
```js
const currentLeague = useLeagueStore((s) => s.currentLeague);
const leagueName = currentLeague?.name || 'Nessuna lega';
```

Sostituisci (riga 58):
```jsx
{user.league}
```
con:
```jsx
{leagueName}
```

- [ ] **Step 2: Verifica in browser** — la Topbar mostra "Nessuna lega" invece di "Serie A Fantasy Monza"

- [ ] **Step 3: Commit finale**

```bash
git add src/store/useLeagueStore.js \
        src/components/ui/NoLeagueBanner.jsx \
        src/components/ui/LeagueStandingsEmpty.jsx \
        src/components/ui/PointsChartEmpty.jsx \
        src/pages/Dashboard.jsx \
        src/components/layout/Topbar.jsx
git commit -m "feat: connect Dashboard to useLeagueStore, replace fake data with real/placeholder"
```

---

## Task 11: Verifica Stato B e Stato A

- [ ] **Step 1: Verifica Stato B (store vuoto)**

Con `npm run dev`:
- KPI cards: tutti `"—"` o testi vuoti corretti
- Classifica Lega: mostra `NoLeagueBanner` (⚽ con 2 bottoni)
- Grafico: mostra `PointsChartEmpty` (5 barre skeleton)
- Topbar: mostra `"Nessuna lega"`

- [ ] **Step 2: Simula Stato B-2 (lega senza partite) tramite DevTools**

Apri console browser e incolla:
```js
localStorage.setItem('fantabrain-league', JSON.stringify({
  state: {
    currentLeague: {
      id: "test-001",
      name: "Fantacalcio Amici",
      inviteCode: "TEST-001",
      maxParticipants: 8,
      participants: [
        { id: "u1", userName: "Dante", teamName: "FantaBrain FC", joinedAt: "2026-03-20", isCurrentUser: true },
        { id: "u2", userName: "Marco", teamName: "I Campioni", joinedAt: "2026-03-21", isCurrentUser: false }
      ],
      results: []
    }
  },
  version: 0
}));
location.reload();
```

Expected:
- Topbar: "Fantacalcio Amici"
- KPI cards: `"—"` con "Nessuna giornata giocata"
- Classifica: `LeagueStandingsEmpty` con lista partecipanti
- Grafico: `PointsChartEmpty`

- [ ] **Step 3: Simula Stato A (lega con partite) tramite DevTools**

```js
localStorage.setItem('fantabrain-league', JSON.stringify({
  state: {
    currentLeague: {
      id: "test-001",
      name: "Fantacalcio Amici",
      inviteCode: "TEST-001",
      maxParticipants: 8,
      participants: [
        { id: "u1", userName: "Dante", teamName: "FantaBrain FC", joinedAt: "2026-03-20", isCurrentUser: true },
        { id: "u2", userName: "Marco", teamName: "I Campioni", joinedAt: "2026-03-21", isCurrentUser: false }
      ],
      results: [
        { matchday: 1, date: "2026-03-01", scores: { "u1": 72, "u2": 65 } },
        { matchday: 2, date: "2026-03-08", scores: { "u1": 58, "u2": 71 } },
        { matchday: 3, date: "2026-03-15", scores: { "u1": 81, "u2": 60 } }
      ]
    }
  },
  version: 0
}));
location.reload();
```

Expected:
- Topbar: "Fantacalcio Amici"
- KPI "Posizione in Classifica": `"2° / 2"` (Marco ha 196, Dante ha 211 — dipende dai valori)
- KPI "Media Punti": media reale
- Classifica: classifica reale con `RankItem`, riga Dante evidenziata
- Grafico: 3 barre colorate (blu/rosso)

- [ ] **Step 4: Reset localStorage per tornare a Stato B**

```js
localStorage.removeItem('fantabrain-league');
location.reload();
```

- [ ] **Step 5: Verifica nessun file modificato**

Se la verifica non ha richiesto modifiche al codice, salta il commit (la working tree è pulita). Se hai dovuto correggere qualcosa, committa solo i file modificati con un messaggio descrittivo.

---

## Checklist Finale

- [ ] Store vuoto → Stato B visibile (NoLeagueBanner + PointsChartEmpty)
- [ ] Lega senza risultati → LeagueStandingsEmpty con lista partecipanti
- [ ] Lega con risultati → dati reali in KPI, Classifica, Grafico
- [ ] Nessun dato hardcodato visibile (FC Drago, 487, G7-G14, ecc.)
- [ ] Topbar mostra nome lega reale o "Nessuna lega"
- [ ] Nessun errore in console browser
- [ ] Altri componenti (AIAnalisi, LaRosa, ecc.) non toccati e funzionanti
