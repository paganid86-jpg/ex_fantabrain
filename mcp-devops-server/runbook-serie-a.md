---
# Runbook: Picco Serie A Weekend

## Trigger
- Traffico HTTP superiore al 200% della media settimanale
- ErrorRate superiore a 5 per piu di 2 minuti consecutivi
- ResponseTime superiore a 2000ms per piu di 3 minuti

## Contesto applicazione
FantaBrain e un'app Fantacalcio italiana su Node.js + Express.
Database: PostgreSQL su Render (max 10 connessioni free tier).
AI: Anthropic API Claude Haiku.
Deploy: Render (512MB RAM, instance che si addormenta dopo 15min inattivita).

## Orari critici
- Sabato 09:00-12:00 IT: aste Fantacalcio, picco massimo
- Domenica 12:00-15:00 IT: calcolo punteggi live Serie A
- Domenica 20:00-22:00 IT: fine giornata calcistica

## Checklist intervento in ordine di priorita

### 1. Controlla se Render e sveglio
curl https://webapp-fantabrain.onrender.com/health
Se risponde con errore o timeout: il servizio
si e addormentato, aspetta 30 secondi e riprova.

### 2. Controlla PostgreSQL connection pool
Cerca nei log Render errori tipo:
"remaining connection slots are reserved"
"too many clients"
Se presenti: il pool e saturo (max 10 connessioni).
Soluzione: riavvia il servizio su Render dashboard.

### 3. Controlla memoria Render
Cerca nei log: "JavaScript heap out of memory"
o "ENOMEM"
Se presenti: memoria esaurita.
Soluzione: riavvia istanza da Render dashboard.

### 4. Controlla Anthropic API rate limits
Cerca nei log: "rate_limit_error" o "529"
Se presenti: troppe chiamate API.
Soluzione: attendi 60 secondi prima di rispondere
a nuove richieste AI.

### 5. Controlla ultimo deployment
Se l'incident coincide con un deploy recente:
git log --oneline -5
Valuta rollback con: git revert HEAD

## Escalation
Se non risolto entro 10 minuti:
Notifica Dante Pagani su Slack con summary completo
includendo: orario incident, metriche CloudWatch,
ultimo deployment, errori nei log.

## Post-incident
Dopo la risoluzione, aggiorna le metriche CloudWatch
con una metrica manuale: IncidentResolved=1
---
