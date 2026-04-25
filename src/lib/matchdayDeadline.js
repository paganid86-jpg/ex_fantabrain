// src/lib/matchdayDeadline.js

/**
 * Calcola la prossima deadline di schieramento — venerdì 18:00 Europe/Rome.
 *
 * Implementazione: costruisce la data in fuso Rome usando Intl.DateTimeFormat,
 * evitando dipendenze esterne (date-fns, dayjs). Gestisce correttamente DST
 * perché Intl.DateTimeFormat con timeZone:'Europe/Rome' ritorna sempre l'ora
 * locale corretta.
 *
 * @param {Date} [now=new Date()] — ora corrente, iniettabile per test
 * @returns {Date} — prossimo venerdì 18:00 Rome (UTC timestamp interno)
 */
export function getNextMatchdayDeadline(now = new Date()) {
  // Leggi parti della data in Europe/Rome
  const fmt = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Rome',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    weekday: 'short',
    hour12: false,
  });
  const parts = Object.fromEntries(
    fmt
      .formatToParts(now)
      .filter((p) => p.type !== 'literal')
      .map((p) => [p.type, p.value])
  );

  // parts.weekday ∈ {Mon, Tue, Wed, Thu, Fri, Sat, Sun}
  const DAY_INDEX = { Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6, Sun: 0 };
  const todayIdxRome = DAY_INDEX[parts.weekday];
  const hourRome = parseInt(parts.hour, 10);

  // Giorni fino al prossimo venerdì 18:00 Rome.
  // Se oggi è venerdì prima delle 18:00 → 0. Altrimenti 7.
  let daysUntilFriday;
  if (todayIdxRome < 5) {
    daysUntilFriday = 5 - todayIdxRome;
  } else if (todayIdxRome === 5) {
    daysUntilFriday = hourRome < 18 ? 0 : 7;
  } else {
    // sabato (6) o domenica (0)
    daysUntilFriday = 7 - todayIdxRome + 5;
  }

  const y = parseInt(parts.year, 10);
  const m = parseInt(parts.month, 10); // 1..12
  const d = parseInt(parts.day, 10) + daysUntilFriday;

  // Costruisci prima una data "come se fosse 18:00 UTC" in quel giorno.
  const candidateUtc = new Date(Date.UTC(y, m - 1, d, 18, 0, 0));

  // Leggi l'ora Rome della candidateUtc: se mostra "20:00", Rome è UTC+2 e
  // dobbiamo sottrarre 2h per ottenere 18:00 Rome reale.
  const checkFmt = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Rome',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  const checkParts = Object.fromEntries(
    checkFmt
      .formatToParts(candidateUtc)
      .filter((p) => p.type !== 'literal')
      .map((p) => [p.type, p.value])
  );
  const romeHour = parseInt(checkParts.hour, 10);
  const romeMinute = parseInt(checkParts.minute, 10);
  const offsetMin = (romeHour - 18) * 60 + romeMinute;
  return new Date(candidateUtc.getTime() - offsetMin * 60 * 1000);
}
