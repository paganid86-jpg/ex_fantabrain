# Testing — FantaBrain

## Strategia MVP

In fase MVP, priorità ai test manuali sui flussi critici:

1. Login / Register con JWT
2. Caricamento dati Serie A (standings, partite, marcatori)
3. CRUD giocatori nella rosa
4. Formation Editor — aggiunta, rimozione, drag & drop titolari
5. AI Coach — chiamata Groq ricevuta correttamente, crediti decrementati
6. chatClaude — chiamata Anthropic ricevuta correttamente (piano Gold)
7. Creazione lega e accesso con codice invito (localStorage)
8. PlayerSearchInput — autocomplete da dati Serie A reali

## Smoke test prima di ogni deploy

- [ ] `npm run build` senza errori
- [ ] Dashboard carica con LeagueGate se no lega attiva
- [ ] `/la-rosa` — aggiunta e rimozione giocatori
- [ ] `/schieramento` — cambio modulo e selezione titolari
- [ ] `/ai-analisi` — risposta AI ricevuta, crediti scalati
- [ ] `/crea-lega` — form multi-step completo, codice invito generato
- [ ] Badge GIORNATA in Topbar mostra dato reale

## Quando aggiungere test automatici

- Prima del lancio App Store / Google Play (agosto 2026)
- Ogni volta che un modulo viene refactorizzato significativamente
- Per ogni nuova route o componente critico

## Note

- Non usare dati mock nella rosa durante i test — inserire giocatori reali manualmente
- Il sistema leghe è localStorage: per testare multi-utente serve browser separato (non tab diversi)
