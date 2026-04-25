# FantaBrain Luxury Sports OS

Stato: concept approvato per sperimentazione su branch `Codex/ios-restyle-poc-20260424`.

## Direzione

Luxury Sports OS e' il nuovo linguaggio premium di FantaBrain: meno dashboard MVP, piu' prodotto sportivo di fascia alta. L'app deve sembrare un centro operativo personale per il fantacalcio, con tensione match-day, superfici scolpite e informazioni rapide.

## Principi

- Mobile-first reale: il campo, le card giocatore e le CTA devono funzionare prima su viewport strette.
- Gerarchia forte: pochi elementi dominanti, numeri e stati leggibili in un colpo d'occhio.
- Premium pragmatico: lusso non significa decorazione gratuita, ma ordine, densita' controllata e scelte tipografiche nette.
- News proprietarie: `Rosa Wire` e `Ieri in rosa` devono sembrare un prodotto editoriale interno, non una lista generica.
- Logica invariata: il primo rollout cambia presentazione, non store, auth, API o dati persistiti.

## Palette

- Obsidian: `#0f1216`
- Pitch Green: `#0e281c`, `#143322`
- Ivory: `#f4efe6`
- Champagne: `#c7a56d`
- Champagne Light: `#e8d0a5`
- Signal Red: `#d65252`
- Signal Green: `#72b58c`

## Componenti Chiave

- Page shell: sfondo obsidian, superficie app scolpita, header essenziale.
- Titoli: gradiente `white -> ivory -> champagne` su dark, `obsidian -> graphite -> champagne` su light.
- Player card: ruolo, media, codice/cognome, squadra. Variante campo compatta, variante panchina piu' neutra.
- Pitch: campo scuro, marcature sottili, griglia compatta mobile-first.
- Rosa Wire: feed scrollabile stile timeline, con avatar iniziali e tag impatto.
- Daily digest: label singola del giorno precedente, es. `Sabato - Formazione inserita OK, Assist di Barella`.
- CTA bar: messaggio stato formazione + azione primaria.

## Rollout

1. `Schieramento`: prima pagina reale da migrare, per validare card giocatore, pitch e CTA.
2. `Home`: hero punteggio, Rosa Wire e daily digest.
3. `AI Coach`: private analyst, insight cards, input premium.
4. Pulizia: rimozione del restyle intermedio e consolidamento nel design system.
