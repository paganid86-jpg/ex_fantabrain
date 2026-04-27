# FantaBrain Luxury Mobile App Restyle Design

## Decision

Restyle esteso di tutta l'app mobile-first usando due direzioni approvate:

- **A - Luxury Matchday OS** per tutte le pagine e per la shell applicativa.
- **C - Private AI Coach** solo per la chat AI in `AIAnalisi`.

Il risultato deve sembrare un prodotto premium nero/oro dedicato al fantacalcio, con gerarchia forte, superfici compatte, azioni grandi e navigazione da app mobile. La chat AI deve mantenere lo stesso brand, ma avere una voce piu privata e conversazionale.

## Scope

Il restyle copre:

- Shell: `FloatingPanel`, `PanelHeader`, `BottomNav`, layout e scroll mobile.
- Home: `Dashboard` e pattern collegati.
- Schieramento: `Schieramento`, `FormationEditor`, `FormationSlot`, `PlayerToken`, panchina, tab campo/rosa.
- Rosa: `LaRosa`, modal e input giocatori.
- Dati e calendario: `Classifica`, `Calendario`, `News`, `Statistiche`.
- Flussi decisionali: `Mercato`, `Scouting`, `WarRoom`, `HubAnalisi`.
- Leghe: `LeagueCreation`, `LeagueSettings`.
- AI: `AIAnalisi` con linguaggio Private AI Coach.
- Design system: `src/styles/design-system.css` come fonte principale di token e classi.

Fuori scope:

- Modifiche alle API AI o calcio.
- Modifiche alla struttura dati persistita Zustand.
- Reinserimento di mock data per la rosa.
- Nuove dipendenze UI salvo necessita emersa durante l'implementazione.

## Visual System

La base globale usa:

- Background nero profondo con leggere luci radiali oro/viola.
- Logo FB oro come segnale sempre visibile nell'header.
- Superfici vetro scuro con bordo sottile oro o latte.
- CTA primarie oro pieno, CTA secondarie vetro scuro.
- Titoli principali in serif editoriale dove serve impatto; testo operativo in sans leggibile; metadata in mono.
- Stati semantici chiari: verde per ok, rosso per rischio, viola per AI, oro per priorita e premiumness.

La palette deve restare multipolare: nero/oro come brand, viola come AI, verde/rosso per stati. Evitare una UI tutta viola o tutta oro.

## App Shell

La shell diventa piu mobile-app:

- `PanelHeader` mostra logo, contesto pagina, crediti AI, stato live e avatar.
- `FloatingPanel` mantiene il vincolo mobile centrale su desktop, ma con bordi e profondita coerenti col nuovo sistema.
- `BottomNav` passa a cinque sezioni stabili: Home, Rosa, Partite/Schiera, AI Assistant, Lega. La voce attiva ha trattamento oro.
- La nav deve restare leggibile e non coprire contenuti importanti su viewport piccoli.

Il sistema deve continuare a usare `HashRouter` e le route esistenti.

## Page Patterns

Le pagine non-chat usano un set di pattern coerenti:

- Hero compatto o medio con kicker, titolo, insight e azione.
- Card metrica per numeri importanti, ma senza annidare card dentro card.
- Liste operative con righe alte e leggibili.
- Prompt o suggerimenti AI come blocchi viola/oro, non come chat completa.
- Empty state premium ma pratici, sempre in italiano.

La Home e Schieramento possono avere piu impatto visuale; pagine come Classifica, Calendario e Statistiche privilegiano scansione e densita.

## AI Coach

`AIAnalisi` usa la direzione Private AI Coach:

- Hero narrativo "Coach, senza rumore." con contesto giornata.
- Crediti e contesto in pill/strip chiare.
- Thread con bubble assistant viola scuro e bubble utente oro scuro.
- Quick actions orizzontali prima del composer.
- Composer fisso/ancorato nel flusso mobile con bottone invio iconico o compatto.
- Pannello contesto rosa apribile senza rompere la conversazione.

Le chiamate restano su `chatClaude` e backend `/api/ai/chat`; nessuna chiamata diretta dal frontend.

## Data And State

Il restyle non cambia:

- Struttura di `useAppStore`, `useSerieAStore`, `useLeagueStore`.
- Persist keys e versioni.
- Logica localStorage-only delle leghe.
- Proxy football-data tramite `/api/football/`.
- Client AI tramite backend.

I componenti devono continuare a usare selettori Zustand inline.

## Accessibility And Responsiveness

Requisiti:

- UI in italiano.
- Codice e naming in inglese.
- Touch target comodi su mobile.
- Testo mai tagliato nei bottoni principali.
- Contrasto sufficiente su superfici scure.
- Layout stabile fra 360px mobile e desktop centrale.
- Preferire icone/simboli dove gia presenti o implementabili senza nuove dipendenze.

## Implementation Strategy

Implementazione consigliata in fasi:

1. Aggiornare token e primitive del design system.
2. Restylare shell, header e bottom nav.
3. Restylare Home e pattern riusabili.
4. Restylare Schieramento e Rosa.
5. Restylare pagine dati e flussi decisionali.
6. Restylare AI Coach con il linguaggio C.
7. Verificare build e screenshot mobile/desktop.

Le modifiche devono essere incrementali e mantenere l'app funzionante a ogni fase.

## Testing

Verifica minima:

- `npm run build`
- Browser check su mobile width per Home, Schieramento, AI Coach.
- Browser check rapido sulle altre route principali.
- Controllo che la rosa vuota resti vuota e che gli empty state siano coerenti.

## Open Notes

La tavola visuale usata per la decisione e' disponibile in `public/__brainstorm/restyle-directions.html` come riferimento temporaneo di brainstorming. Non fa parte del prodotto finale.
