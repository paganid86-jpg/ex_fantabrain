// src/components/patterns/HeroBlock.jsx

/**
 * HeroBlock — numero gigante + diff pill + stripe decorativa.
 * Usato in Home (hero punti ultima giornata) e (futuro) nel Recap domenica sera.
 *
 * Props:
 * - kicker: string breve in caps mono, es. "GIORNATA 28"
 * - value: number | string — il numero grande
 * - diff: number | null — differenza rispetto a un riferimento (es. media). Pill nascosta se null.
 * - label: string breve sotto il numero, es. "punti ultima"
 * - showStripe: bool, default true — se mostrare le linee decorative
 */
export default function HeroBlock({ kicker, value, diff, label, showStripe = true }) {
  const diffSign = diff == null ? null : diff > 0 ? 'pos' : diff < 0 ? 'neg' : 'zero';
  const diffText =
    diff == null
      ? null
      : diff > 0
        ? `+${diff} vs media`
        : diff < 0
          ? `${diff} vs media`
          : '= media';

  return (
    <div className="hero-block">
      {showStripe && <div className="stripe-decor" aria-hidden="true" />}
      <div className="hero-block-main">
        {kicker && <span className="hero-kicker">{kicker}</span>}
        <span className="hero-value">{value}</span>
        {label && <span className="hero-label">{label}</span>}
      </div>
      {diffText && (
        <span
          className={`diff-pill${diffSign !== 'zero' ? ` diff-pill--${diffSign}` : ''}`}
          aria-label={`Differenza vs media: ${diffText}`}
        >
          {diffText}
        </span>
      )}
    </div>
  );
}
