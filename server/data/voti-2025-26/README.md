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
