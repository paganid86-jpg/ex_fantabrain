// src/components/patterns/DeadlinePill.jsx

import { useEffect, useState } from 'react';

/**
 * DeadlinePill — banner rosso pulsante con timer HH:MM:SS.
 *
 * Props:
 * - deadline: Date — quando scade
 * - label: string — es. "SCHIERAMENTO"
 *
 * Se la deadline è passata, mostra "SCADUTA" invece del timer.
 * L'intervallo secondi viene pulito in cleanup.
 */
export default function DeadlinePill({ deadline, label = 'SCHIERAMENTO' }) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const diffMs = deadline.getTime() - now;
  const isExpired = diffMs <= 0;
  const hoursLeft = diffMs / (1000 * 60 * 60);
  const urgencyClass = isExpired
    ? 'deadline-pill--expired'
    : hoursLeft <= 12
      ? 'deadline-pill--danger'
      : hoursLeft <= 24
        ? 'deadline-pill--warning'
        : 'deadline-pill--safe';

  let timerText = 'SCADUTA';
  if (!isExpired) {
    const totalSec = Math.floor(diffMs / 1000);
    const d = Math.floor(totalSec / 86400);
    const h = Math.floor((totalSec % 86400) / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    const pad = (n) => String(n).padStart(2, '0');
    timerText =
      d > 0
        ? `${d}g ${pad(h)}:${pad(m)}:${pad(s)}`
        : `${pad(h)}:${pad(m)}:${pad(s)}`;
  }

  return (
    <div className={`deadline-pill ${urgencyClass}`} role="timer" aria-live="off">
      <span className="deadline-dot" aria-hidden="true" />
      <span className="deadline-label">{label}</span>
      <span className="deadline-timer">{timerText}</span>
    </div>
  );
}
