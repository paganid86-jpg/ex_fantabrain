import { Link } from 'react-router-dom';

export default function SignalRow({ tone = 'neutral', label, value, hint, to }) {
  const content = (
    <>
      <span className={`signal-row__dot signal-row__dot--${tone}`} aria-hidden="true" />
      <span className="signal-row__body">
        <span className="signal-row__label">{label}</span>
        {hint && <span className="signal-row__hint">{hint}</span>}
      </span>
      {value != null && <strong className="signal-row__value">{value}</strong>}
    </>
  );

  if (to) {
    return (
      <Link to={to} className={`signal-row signal-row--${tone}`} aria-label={`${label}${value != null ? `: ${value}` : ''}`}>
        {content}
      </Link>
    );
  }

  return <div className={`signal-row signal-row--${tone}`}>{content}</div>;
}
