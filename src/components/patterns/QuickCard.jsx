// src/components/patterns/QuickCard.jsx

import { Link } from 'react-router-dom';

/**
 * QuickCard — card della griglia 2x2 Home.
 *
 * Props:
 * - icon: string — emoji/simbolo (aria-hidden)
 * - label: string — titolo breve in caps
 * - value?: string | number — valore grande opzionale (es. punti, posizione)
 * - hint?: string — testo secondario
 * - to: string — path react-router
 * - accent?: bool — variante inversione colore (Milk pieno in dark)
 */
export default function QuickCard({ icon, label, value, hint, to, accent = false }) {
  return (
    <Link
      to={to}
      className={`quick-card${accent ? ' quick-card--accent' : ''}`}
      aria-label={`${label}${value != null ? ': ' + value : ''}`}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {icon && <span className="quick-card-icon" aria-hidden="true">{icon}</span>}
        <span className="quick-card-label">{label}</span>
      </div>
      {value != null && <span className="quick-card-value">{value}</span>}
      {hint && <span className="quick-card-hint">{hint}</span>}
    </Link>
  );
}
