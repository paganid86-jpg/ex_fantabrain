# FantaBrain — Restyle UI/UX · Design Spec

**Data:** 2026-04-19
**Autore:** Dante Pagani + Claude (brainstorming session)
**Stato:** Approved, pending implementation plan
**Target release:** versione estetica stabile prima del lancio store 16 agosto 2026

---

## 1. Contesto e motivazione

FantaBrain è oggi una webapp React live su `webapp-fantabrain.onrender.com` con design-system glassmorphism dark su base verde+indigo. Il prodotto sta virando verso un'app nativa (Capacitor, iOS + Android) con lancio pianificato per il 16 agosto 2026, in corrispondenza dell'inizio della Serie A 2026/27.

Il design attuale è stato costruito incrementalmente ed è funzionalmente completo ma non esprime un'identità di brand distintiva. Con il lancio store il prodotto deve avere una personalità visiva forte, riconoscibile negli screenshot dello store, coerente col tono del fantacalcio, e funzionante su smartphone come prima piattaforma.

Questo spec definisce la **direzione di design completa** (tono, palette, tipografia, tokens, information architecture, pattern schermate chiave). Non è un plan di implementazione: quello verrà prodotto separatamente via `writing-plans` dopo la review di questo documento.

## 2. Obiettivi del restyle

- **Identità visiva distintiva** · FantaBrain deve avere un look riconoscibile al primo screenshot, non confondibile con altre app di fantasy football.
- **Mobile-first vero** · tutte le decisioni partono dalla viewport 375×812, il desktop è una conseguenza (non il contrario).
- **Leggibilità intergenerazionale** · type scale e contrasto devono funzionare per un 15enne e per un 55enne. Niente microcopy criptico.
- **Momento emotivo chiaro per match day** · il cuore del prodotto è la giornata di Serie A. Il design deve amplificarla (numeri giganti, head-to-head live, condivisibilità).
- **Preparazione al wrap Capacitor** · palette, componenti e tokens devono reggere su splash, push notifications, store screenshots.

## 3. Scope

**In scope**
- Design tokens completi (colori, tipografia, spacing, radius, shadow, motion)
- Redesign delle schermate principali: Home, Schieramento (+ La Rosa integrata), Classifica, News, AI Coach
- Information Architecture: bottom nav a 5 tab, consolidamento di route secondarie in "Hub" (ex War Room / Scouting / Statistiche fuse)
- Palette light mode + dark mode con inversione Plum/Milk
- Pattern riusabili (hero block, player token, card news, chat AI, bottom nav floating)
- Match day flow completo in 4 momenti (schieramento ven 18:00, live head-to-head, recap serale, classifica lunedì)

**Out of scope**
- Refactor backend, store Zustand, routing
- Supabase migration (fase successiva)
- Nuove feature funzionali oltre quelle già esistenti (eccezione: tab News è una nuova feature contenutistica, non una nuova capability tecnica — richiede solo feed di eventi già tracciabili)
- Il sistema live match head-to-head richiede una sport API con eventi real-time (API-Football o simile) — menzionato ma pianificato separatamente
- Notifiche push native — pianificate nella fase Capacitor
- Generazione immagine IG Stories per share — menzionata, pianificata separatamente

## 4. Decisioni chiave (approvate durante il brainstorming)

| Decisione | Scelta | Note |
|---|---|---|
| Direzione aesthetica | **Stadium Electric** con twist geometrico | Palette Plum/Milk, stripe diagonali, numeri giganti, mood adrenalina |
| Palette core | Plum `#381932`, Milk `#FFF3E6` | Light mode = Milk bg + Plum fg. Dark mode = Plum bg + Milk fg |
| Font display | **Unbounded 900** (Google Fonts) | Per titoli e numeri. Geometrico, moderno, distintivo |
| Font body | **Inter** | Leggibilità massima 14-16px |
| Font monospace | **JetBrains Mono** | Kicker, tag, deadline, metadati tecnici |
| Scope restyle | Visual + Information Architecture | No full redesign funzionale |
| Bottom nav | 5 tab: **Home / Schiera / Classif. / News / AI** | Mobile-first, floating con inversione colore vs sfondo |
| La Rosa | Dentro "Schiera" come sub-tab | 2 sub-tab: Schieramento (campo+panchina) · La Rosa (elenco) |
| Hub consolidato | War Room + Scouting + Statistiche → singolo Hub | Accessibile via menu secondario, non in bottom nav |
| Modalità News | Pulse lega + AI Magazine, timeline cronologica unica | Chip filtro in alto per segmentare |
| Deadline schieramento | **Venerdì 18:00** | Fix rispetto alla precedente ipotesi "sabato" |
| Match day flow | 4 step | ven (schieri) · dom live (H2H) · dom sera (recap 87) · lun (classifica) |

## 5. Aesthetic direction — Stadium Electric

Il tono dominante è quello dell'adrenalina da match day, declinato in modo pulito e geometrico anziché vintage/ultras:

- **Numeri come protagonisti** · il punteggio è la cosa più grande sullo schermo quando conta (hero home, recap, live score)
- **Stripe diagonali decorative** · 1-2 px, a -6°/-8°, opacità bassa. Evocano il manifesto di un evento sportivo senza invadere
- **Inversione colore per i blocchi focus** · in light mode il blocco focus è Plum su Milk, in dark è Milk su Plum. Stesso pattern visivo in entrambe le modalità
- **Tipografia a due velocità** · titoli e numeri in Unbounded 900 (impact), body in Inter, label tecniche in JetBrains Mono (uppercase, tracking 0.2em)
- **Microcopy diretto in italiano** · "Schiera l'undici", "Bella giornata", "2 slot vuoti · COMPLETA". Niente gergo per chi apre l'app per la prima volta

**Anti-patterns** · niente gradienti sfumati decorativi, niente emoji-pesanti come stile (solo come iconografia leggera per status), niente glassmorphism residuo dal vecchio design, niente accent color aggiuntivi oltre ai semantic (success/danger/gold/info).

## 6. Design tokens

### 6.1 Palette core

```css
--color-plum:      #381932;  /* core brand */
--color-milk:      #FFF3E6;  /* core brand */
```

**Modalità light** — background Milk, foreground Plum, blocchi focus con inversione.
**Modalità dark** — background Plum, foreground Milk, blocchi focus con inversione.

Trasparenze riusabili (da generare su entrambe le mode):

```css
/* Dark mode */
--bg:                 #381932;
--fg:                 #FFF3E6;
--fg-70:              rgba(255,243,230,.70);
--fg-55:              rgba(255,243,230,.55);
--fg-15:              rgba(255,243,230,.15);
--fg-08:              rgba(255,243,230,.08);
--surface:            rgba(255,243,230,.04);
--surface-hover:      rgba(255,243,230,.08);
--border-subtle:      rgba(255,243,230,.08);
--border:             rgba(255,243,230,.15);

/* Light mode — speculare */
--bg:                 #FFF3E6;
--fg:                 #381932;
--fg-70:              rgba(56,25,50,.70);
--fg-55:              rgba(56,25,50,.55);
--fg-15:              rgba(56,25,50,.15);
--fg-08:              rgba(56,25,50,.08);
--surface:            rgba(56,25,50,.04);
--surface-hover:      rgba(56,25,50,.08);
--border-subtle:      rgba(56,25,50,.08);
--border:             rgba(56,25,50,.15);
```

### 6.2 Semantic colors

| Token | Hex | Uso |
|---|---|---|
| `--color-success` | `#0E8C5F` | Bonus gol, +punti, trend up |
| `--color-danger` | `#D64545` | Malus, espulsioni, deadline scaduta |
| `--color-gold` | `#E6B325` | AI Coach, piano Gold, premium markers |
| `--color-info` | `#3B5B8C` | Tooltip, note neutre |

**Role Mantra** — colori stessi semantici:
- Portiere → gold
- Difesa → info
- Centrocampo → plum/milk (neutro)
- Attacco → danger
- Centravanti puro → gold

### 6.3 Typography

Font via Google Fonts:
```html
<link href="https://fonts.googleapis.com/css2?family=Unbounded:wght@400;600;700;900&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
```

Tokens:
```css
--font-display: 'Unbounded', sans-serif;
--font-body:    'Inter', sans-serif;
--font-mono:    'JetBrains Mono', ui-monospace, monospace;
```

Scale:

| Livello | Font | Size / weight | Letter-spacing | Uso |
|---|---|---|---|---|
| Display Giant | Unbounded 900 | 72-120px | -0.05em | Hero numero (87), live score, recap |
| H1 | Unbounded 900 | 28-34px | -0.04em | Page title ("Schiera.", "News.") |
| H2 | Unbounded 700 | 18px | -0.02em | Sezioni ("La Rosa", "Attaccanti") |
| Button | Unbounded 700 | 11-13px | +0.02em UPPERCASE | CTA primari e secondari |
| Body L | Inter 600 | 16px | default | Titoli card |
| Body | Inter 500 | 14px | default | Testo principale |
| Body S | Inter 400 | 12px | default | Descrizioni, bio |
| Caption | Inter 500 | 11px | default | Help text, meta |
| Kicker | JetBrains Mono 600 | 10-12px UPPERCASE | +0.22em | "GIORNATA 32", "PULSE · LEGA" |
| Deadline | JetBrains Mono 500 | 9-11px UPPERCASE | +0.12em | "VEN 18:00", "2h fa" |
| Data | JetBrains Mono 400 | 10px | +0.08em | "+12", "-0.5", numeri inline |

**Regola d'oro** · Unbounded = impatto (titoli + numeri), Inter = leggibilità (tutto ciò che si legge in prosa), Mono = metadati tecnici.

### 6.4 Spacing · base 4px

```css
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;   /* default gap card */
--space-5: 20px;
--space-6: 24px;   /* default padding schermata */
--space-8: 32px;
--space-10: 40px;
```

### 6.5 Radius

```css
--radius-sm: 6px;    /* chip, tag, bench chip */
--radius-md: 12px;   /* button, input, player row, small card */
--radius-lg: 18px;   /* card, hero block, panel */
--radius-xl: 28px;   /* bottom nav, phone frame decorative */
```

### 6.6 Shadow · elevation

```css
--shadow-sm: 0 2px 8px rgba(0,0,0,.25);          /* chip hover */
--shadow-md: 0 8px 24px rgba(0,0,0,.35);         /* bottom nav floating */
--shadow-lg: 0 20px 60px rgba(0,0,0,.50);        /* modal, bottom sheet */
```

In light mode le shadow sono più morbide (`rgba(56,25,50,.12/.18/.25)`) perché il fondo Milk non sopporta ombre profonde.

### 6.7 Motion

| Nome | Durata | Easing | Uso |
|---|---|---|---|
| micro | 120ms | ease-out | hover, tap, toggle |
| standard | 240ms | `cubic-bezier(.2,.8,.2,1)` | transizione schermate, tab change |
| expressive | 600ms | spring soft | counter-up numero, score live animato |
| stripe idle | 8s loop | linear | stripe decorativa stadium in background |
| modal | 320ms | ease-out | bottom sheet, modal, paywall |

**Principio** · il movimento sottolinea il **risultato**, non il percorso. Numeri che salgono, stripe che scorrono lente, transizioni tab brevi. Niente animazioni decorative sui contenuti statici.

## 7. Information Architecture

### 7.1 Route mapping vecchio → nuovo

Le URL esistenti restano sostanzialmente invariate per non rompere deep link, bookmark e la logica di `HashRouter`. Cambia la **navigazione logica** (bottom nav e sub-tab).

| URL | Ruolo nella nuova IA | Note |
|---|---|---|
| `/` | Home (Tier 1 nav) | Restylata con hero, deadline, quick cards, news preview |
| `/schieramento` | Tab "Schiera" (Tier 1 nav), sub-tab default "Schieramento" | Contiene 2 sub-tab: Schieramento · La Rosa |
| `/la-rosa` | Deep link che apre `/schieramento` con sub-tab Rosa attiva | Mantenuta per compatibilità; internamente reindirizza |
| `/classifica` | Tab "Classif." (Tier 1 nav) | Restylata |
| `/news` | Tab "News" (Tier 1 nav) | **Nuova route** — feed Pulse + AI Magazine |
| `/ai-analisi` | Tab "AI" (Tier 1 nav) | Restylata, logica gating Gold invariata |
| `/calendario` | Tier 2 (drawer/Hub) | Invariata |
| `/mercato` | Tier 2 (drawer/Hub) | Invariata |
| `/scouting`, `/war-room`, `/statistiche` | Tier 2 fusi in "Hub analisi" | 3 pagine attuali confluiscono in una pagina tabulare unica `/hub/analisi` (nuova route) — le vecchie route restano come redirect |
| `/crea-lega`, `/impostazioni-lega` | Tier 2 (drawer) | Invariate |

### 7.2 Bottom nav · 5 tab

1. **Home** (⌂) · landing dopo login, riassunto stato
2. **Schiera** (⚽) · campo + rosa, sub-tab interne
3. **Classifica** (≡) · posizioni lega + trend
4. **News** (✦) · feed timeline Pulse + AI Magazine
5. **AI** (◉) · chatbot coach, gated Gold

**Hub** e impostazioni lega sono raggiungibili da un'icona menu in top bar (hamburger o avatar tap).

## 8. Match day flow

Il cuore emotivo del prodotto. Quattro momenti in una settimana di Serie A:

### 8.1 Venerdì — Schieramento

- Deadline visibile in ogni schermata con pulsazione rossa <24h
- Home mostra banner "VEN · 18:00 · 3h"
- Tab Schiera · campo verticale 3/4 con token compatti (numero + cognome breve + role chip)
- Barra CTA warning se 11 non completo ("2 slot vuoti · COMPLETA")
- Quando completo, CTA diventa "CONFERMA FORMAZIONE" in solid primary
- Modulo chip tappabile apre bottom sheet coi 15 moduli Mantra (da `moduli.js`)

### 8.2 Domenica — Live head-to-head

- Score bar totali in alto (tuo totale vs avversario) in Unbounded giant
- Chi vince è in pieno colore, chi perde a opacità 55%
- Bubble evento live in Milk pieno per 6s quando accade qualcosa (gol, assist, amm)
- Feed eventi: lista cronologica con icona + player + tempo + impatto in punti
- Head-to-head raggruppato per ruolo (Attaccanti / Centrocampo / Difesa / Portiere)
- Ogni row è uno slot contro uno slot — chi sta vincendo l'istante è in Milk pieno
- Status microcopy chiaro: "⚽ 28'", "🟨 ammonito", "in campo · pulito", "non in campo"
- Footer "X partite ancora da giocare"

### 8.3 Domenica sera — Recap

- Schermata full-screen con numero della giornata in Display Giant (es. "87")
- Diff vs media come pill bold colorata (success se positivo, danger se negativo)
- Stripe stadium diagonali decorative
- Top 3 performer come lista concisa
- Commento AI sintetico (es. "3 su 11 sotto la sufficienza — rivedi la difesa")
- CTA "Condividi" → genera immagine IG stories (pianificato separatamente)

### 8.4 Lunedì — Classifica

- Header "Classifica — Giornata 32 chiusa · Gazzetta"
- Riga utente evidenziata in Milk pieno con "Tu" + trend ↑/↓/= vs settimana scorsa
- Posizione · nome · trend · punti totali
- CTA "Condividi salita" se posizione migliorata

## 9. Schermate chiave — pattern

### 9.1 Home

- Status bar + top bar (logo "FB" sinistra + avatar utente destra)
- Kicker "GIORNATA N · stato"
- Hero title "Ciao {nome}. {frase contestuale}."
- Hero block: numero grande (punti ultima giornata) + diff vs media in pill, con inversione colore vs schermata + stripe decorativa
- Deadline banner con dot pulsante rosso e timer
- Quick cards 2×2 (Classifica, AI Coach, + 2 extra contestuali)
- News preview (ultime 2 card), CTA "Tutte →"
- Bottom nav floating

### 9.2 Schiera (2 sub-tab)

Header condiviso · kicker giornata + deadline pill + H1 + chip modulo tappabile.

**Sub-tab Schieramento**
- Campo verticale 3/4 (aspect-ratio 3:4), griglia per linea secondo modulo
- Token compatti: numero maglia grande, cognome breve, role chip in top-right
- Token empty per slot non riempiti (bordo dashed)
- Sotto il campo: panchina in grid 3-col con bench-chip (ruolo piccolo sopra, cognome sotto)
- Interazione drag&drop tra bench e campo (invariata rispetto a `@dnd-kit` esistente)
- CTA bar in basso con stato formazione (completa/incompleta)

**Sub-tab La Rosa**
- Sezioni per ruolo (Portieri, Difensori, Centrocampisti, Attaccanti) con count + TIT totali
- Player row: avatar iniziali (Unbounded), nome, team + ruolo in mono, fantamedia, tag "TIT" se titolare
- I titolari sono evidenziati in Milk pieno (inverted)
- Pulsante "+ Aggiungi giocatore" in dashed border

### 9.3 Classifica

- H1 "Classifica." + kicker "Giornata N chiusa"
- Row per partecipante: posizione in Unbounded 700, nome, trend microcopy, punti totali
- Riga utente in Milk pieno con offset laterale leggero per "promuoverla"
- Corona 👑 sulla posizione #1
- CTA "Condividi salita" se utente migliorato

### 9.4 News

- Chip filtro scroll orizzontale (Tutte / Pulse / AI Magazine / Giornata)
- Feed cronologico unico
- Card Pulse "big" in Milk pieno con metric row quando l'evento è forte (sorpasso, exploit, K.O.)
- Card Pulse "small" in dark surface per eventi minori
- Card AI Magazine con cover full-width (aspect 2:1) + numero giornata gigante e stripe stadium + titolo + abstract

### 9.5 AI Coach

- Header kicker "Il tuo coach AI · Gold"
- Credit dots in badge Gold (3/giornata)
- Quick prompts scroll orizzontale (es. "Chi schiero oggi?", "Colpo di mercato", "Chi vendere")
- Chat messages: AI con avatar dorato "AI" + meta "COACH", user con bubble Milk pieno
- Insight card dentro messaggio AI: quando suggerisce modifiche formazione, 2-3 player suggest row con bottone "APPLICA" che agisce direttamente sullo store
- Input bar floating sopra la bottom nav con blur
- Paywall Gold invariato come logica, restylato con palette

## 10. Pattern e componenti riusabili

| Componente | Uso | Dove |
|---|---|---|
| Hero Block | Numero giant + diff pill + stripe | Home, Recap |
| Deadline Pill | Banner rosso pulsante con timer | Home, Schiera |
| Player Token | Card compatta numero+cognome+role chip | Schiera, La Rosa preview |
| Player Row | Lista espansa con avatar + stats | La Rosa, Hub analisi |
| Pulse Card (big/small) | Card news con o senza metric row | News, Home preview |
| AI Magazine Cover | Cover 2:1 con numero giornata + stripe | News |
| Bottom Nav Floating | 5 tab con inversione colore | Globale |
| Insight Card | Suggerimenti AI inline | AI chat |
| Module Chip | Tappable chip modulo con bottom sheet | Schiera |
| Head-to-Head Row | Due player card side-by-side con separator "vs" | Live |
| CTA Bar | Sticky bottom con stato azione | Schiera, forms |

## 11. Note tecniche di base

- File principale da aggiornare: `src/styles/design-system.css` (sostituire completamente con nuovo set di tokens)
- Fonts: sostituire import `Plus Jakarta Sans + Outfit` con `Unbounded + Inter + JetBrains Mono`
- Rimuovere variabili obsolete (--green, --indigo, --grad, --bg-glass, --accent-*) e tutti i riferimenti nei componenti
- Tailwind v4 `@theme` block da aggiornare per esporre i nuovi token come classi utility
- Nuova route `/news` e nuova route `/hub/analisi` (fusione scouting+warroom+statistiche) — aggiunte al router esistente
- Store per eventi Pulse (mocking iniziale in localStorage via nuovo `useNewsStore` Zustand persist) + servizio AI Magazine (placeholder con mock content iniziale)
- Nuovo componente layout: `BottomNav.jsx` in `src/components/layout/`, sostituisce `Dock.jsx`
- Nessuna modifica alla logica di auth, backend API, schema DB
- Zustand store esistenti (`useAppStore`, `useSerieAStore`, `useLeagueStore`) restano invariati nel data shape: solo nuovi selettori o azioni dove necessario

Il plan di implementazione dettagliato (fasi, file toccati, ordine, test) sarà prodotto separatamente via `writing-plans`.

## 12. Domande aperte / decisioni rinviate

1. **Live match API** · per lo step 2 (head-to-head live) serve una sport API con eventi in tempo reale (gol, assist, ammonizioni). Football-data.org piano Free non li fornisce. Candidato: API-Football (RapidAPI). Pianificare migrazione separatamente.
2. **Punteggio live stimato** · prima dei voti Gazzetta (lunedì) possiamo mostrare solo i bonus calcolati (gol=+3, assist=+1, amm=-0.5). Il "base voto" (6, 6.5, 7…) manca. Va comunicato esplicitamente come "stima".
3. **Push notifications** · ("Hai preso 87 punti") va valutata nella fase Capacitor, non in questo restyle.
4. **Share IG stories** · generazione immagine lato client va prototipata a parte.
5. **Calendario di lega** · il match-up "vs avversario della giornata" presuppone un calendario lega a coppie. Oggi leghe sono MVP localStorage senza calendario interno. Va pianificato (probabilmente con la migrazione Supabase).
6. **Light mode come default** · lasciamo la scelta all'utente via toggle o sistema operativo (prefers-color-scheme)?
7. **Logo FANTABRAIN vs FB** · "FB" scelto per top bar compatta, ma "FANTABRAIN" full resta per splash screen e store listing.

## 13. Rischi

| Rischio | Probabilità | Impatto | Mitigazione |
|---|---|---|---|
| Cambiare tutte le pagine rompe la rosa utente esistente | Media | Alto | Mantenere store Zustand invariato, toccare solo componenti di presentazione |
| Capacitor non regge bottom nav floating su safe area iPhone | Media | Medio | Testare su device reale in fase Capacitor, aggiungere env(safe-area-inset-bottom) |
| Utenti attuali spaesati dalla nuova IA | Medio | Basso | Changelog in-app alla prima apertura post-update |
| Unbounded + Inter + Mono aumentano il peso font | Alto | Basso | Subset Latin, preload display, lazy Mono |

## 14. Criteri di successo

- Screenshot di Home, Schiera e Live head-to-head sono distintivi e comunicano "Stadium Electric" senza bisogno di copy
- Un utente 50+ riesce a schierare la formazione la prima volta senza bisogno di guida
- Tempo percepito in Home < 800ms (hero render con numero immediato)
- Il match day flow (ven → dom → lun) è riconoscibile come un'unica esperienza coerente

---

**Prossimo step** · review di questo spec, poi invocazione della skill `writing-plans` per produrre il plan di implementazione dettagliato (fasi, file, dipendenze, checkpoint).
