import { Link } from 'react-router-dom';

export default function NoirActionRow({ primary, secondary }) {
  if (!primary?.to || !primary?.label) {
    return null;
  }

  return (
    <div className="noir-action-row">
      <Link to={primary.to} className="noir-action noir-action--primary">
        {primary.label}
      </Link>
      {secondary?.to && secondary?.label && (
        <Link to={secondary.to} className="noir-action noir-action--secondary">
          {secondary.label}
        </Link>
      )}
    </div>
  );
}
