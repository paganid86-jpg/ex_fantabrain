// src/components/patterns/BottomSheet.jsx

import { useEffect } from 'react';

/**
 * BottomSheet — sheet generico slide-up.
 *
 * Props:
 * - isOpen: bool
 * - onClose: () => void
 * - title: string
 * - children: ReactNode
 */
export default function BottomSheet({ isOpen, onClose, title, children }) {
  // Blocca lo scroll del body quando il sheet è aperto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      <div
        className="bottom-sheet-backdrop"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className="bottom-sheet"
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="bottom-sheet-handle" aria-hidden="true" />
        <div className="bottom-sheet-header">
          <span className="bottom-sheet-title">{title}</span>
          <button
            className="bottom-sheet-close"
            onClick={onClose}
            aria-label="Chiudi"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </>
  );
}
