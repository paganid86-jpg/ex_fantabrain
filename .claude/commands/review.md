# Code Review FantaBrain → /project:review

Esegui una review completa del codice modificato di recente.

## Step

1. Controlla tutti i file modificati nell'ultimo commit (`git diff HEAD~1`)
2. Verifica rispetto alle regole in `.claude/rules/code-style.md`
3. Controlla che le chiamate API rispettino `.claude/rules/api-conventions.md`
4. Cerca API key hardcodate o variabili `VITE_*` usate lato client impropriamente
5. Verifica che i testi UI siano in italiano
6. Proponi fix per ogni problema trovato

## Output

Lista problemi per file con severity:
- **CRITICAL** — sicurezza (chiavi esposte, XSS, injection)
- **WARNING** — violazioni di stile o convenzioni
- **INFO** — miglioramenti non urgenti

Patch pronte da applicare per i problemi CRITICAL.
