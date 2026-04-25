// src/components/patterns/NewsPreviewStub.jsx

import { Link } from 'react-router-dom';

/**
 * NewsPreviewStub — placeholder della sezione News in Home.
 * Mostra 2 card mock + CTA "Tutte →". Verrà sostituito da NewsPreview
 * reale in Fase 3 quando arriverà useNewsStore con feed Pulse + AI Magazine.
 */
const MOCK_NEWS = [
  {
    id: 'stub-1',
    kicker: 'PULSE · GIORNATA 28',
    title: 'La tua squadra ha battuto la media lega di 12 punti.',
  },
  {
    id: 'stub-2',
    kicker: 'AI MAGAZINE',
    title: 'I 3 colpi di mercato che nessuno sta guardando.',
  },
];

export default function NewsPreviewStub() {
  return (
    <section className="news-preview" aria-label="Anteprima news">
      <header className="news-preview-header">
        <h2 className="section-title">News</h2>
        <Link to="/news" className="news-preview-cta">Tutte →</Link>
      </header>
      {MOCK_NEWS.map((item) => (
        <Link key={item.id} to="/news" className="news-preview-card">
          <span className="news-preview-kicker">{item.kicker}</span>
          <span className="news-preview-title">{item.title}</span>
        </Link>
      ))}
    </section>
  );
}
