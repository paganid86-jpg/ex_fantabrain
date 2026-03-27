# Deploy FantaBrain → /project:deploy

Prepara il progetto per il deploy su Render.

## Step

1. Esegui `npm run build` e verifica assenza di errori
2. Scansiona `dist/` per API key o segreti hardcodati
3. Verifica che il bundle non contenga variabili `ANTHROPIC_API_KEY`, `GROQ_API_KEY`, `FOOTBALL_DATA_API_KEY`
4. Controlla dimensione bundle (warning se > 500KB gzipped)
5. Conferma a Dante con summary dimensioni e status

## Checklist obbligatoria prima del deploy

- [ ] `npm run build` passa senza errori
- [ ] Nessuna API key Anthropic nel bundle client
- [ ] Nessuna API key Groq nel bundle client
- [ ] Nessuna API key football-data.org nel bundle client
- [ ] Route HashRouter funzionano correttamente
- [ ] Le variabili d'ambiente su Render sono aggiornate (controlla con Dante)

## Blocchi automatici

- Build fallisce → stop, mostra errori completi
- API key trovata nel bundle → stop immediato, indica file e riga
