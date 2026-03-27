# Fix Issue FantaBrain → /project:fix-issue

Ricevi il numero o la descrizione del bug e risolvilo.

## Step

1. Localizza il file/componente coinvolto
2. Leggi il codice e riproduci il problema mentalmente
3. Applica il fix minimo necessario (no refactor non richiesti)
4. Verifica che il fix non rompa altri moduli correlati
5. Aggiorna i commenti solo se la logica non è auto-evidente

## Regole

- Mantieni la lingua UI in italiano
- Non toccare i file `.env`
- Non cambiare il design system senza conferma di Dante
- Non toccare i file `.claude/` o `CLAUDE.md`
- Fix minimale — non aggiungere feature non richieste
- Se il bug è nei dati delle leghe: ricorda che è sistema localStorage-only (MVP)
