import { Link } from 'react-router-dom';

export default function MetricHero({
  kicker,
  value,
  label,
  delta,
  action,
  tone = 'default',
}) {
  const deltaClass =
    delta == null ? '' : delta > 0 ? ' metric-hero__delta--pos' : delta < 0 ? ' metric-hero__delta--neg' : '';
  const deltaText =
    delta == null ? null : delta > 0 ? `+${delta} sulla media` : delta < 0 ? `${delta} sulla media` : 'in media';
  const hasAction = action?.to && action?.label;

  return (
    <section className={`metric-hero metric-hero--luxury metric-hero--${tone}`}>
      {kicker && <span className="metric-hero__kicker lux-kicker">{kicker}</span>}
      <strong className="metric-hero__value">{value}</strong>
      <div className="metric-hero__footer">
        {label && <span>{label}</span>}
        {deltaText && <span className={`metric-hero__delta${deltaClass}`}>{deltaText}</span>}
      </div>
      {hasAction && (
        <Link to={action.to} className="metric-hero__action">
          {action.label}
        </Link>
      )}
    </section>
  );
}
