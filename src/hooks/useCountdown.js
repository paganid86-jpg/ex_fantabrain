// src/hooks/useCountdown.js
import { useState, useEffect } from 'react';

/**
 * Restituisce stringa 'HH:MM:SS' fino a targetIso, oppure null se è nel passato.
 * Aggiornato ogni secondo.
 */
export function useCountdown(targetIso) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (!targetIso) return undefined;
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [targetIso]);

  if (!targetIso) return null;
  const target = Date.parse(targetIso);
  if (!Number.isFinite(target)) return null;
  const diff = target - Date.now();
  if (diff <= 0) return null;
  const h = Math.floor(diff / 3_600_000);
  const m = Math.floor((diff % 3_600_000) / 60_000);
  const s = Math.floor((diff % 60_000) / 1_000);
  return [h, m, s].map((n) => String(n).padStart(2, '0')).join(':');
  // tick is referenced implicitly via closure — leave as-is to ensure re-render
}
