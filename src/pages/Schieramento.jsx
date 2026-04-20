// src/pages/Schieramento.jsx

import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import useAppStore from '../store/useAppStore';
import { MODULI, MODULI_LIST, isCompatibile } from '../data/moduli';
import FormationEditor from '../components/formation/FormationEditor';
import SchieraTabBar from '../components/patterns/SchieraTabBar';
import BottomSheet from '../components/patterns/BottomSheet';
import LaRosa from './LaRosa';

export default function Schieramento() {
  // ── URL tab sync ───────────────────────────────────────
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') === 'rosa' ? 'rosa' : 'campo';

  function handleTabChange(tab) {
    setSearchParams(tab === 'campo' ? {} : { tab });
  }

  // ── Store ──────────────────────────────────────────────
  const rosa = useAppStore((s) => s.rosa);
  const modulo = useAppStore((s) => s.modulo);
  const setModulo = useAppStore((s) => s.setModulo);
  const titolariIds = useAppStore((s) => s.titolariIds);
  const setTitolariIds = useAppStore((s) => s.setTitolariIds);

  // ── Bottom sheet state ─────────────────────────────────
  const [moduloSheetOpen, setModuloSheetOpen] = useState(false);
  const [pickerSlot, setPickerSlot] = useState(null); // { slotIdx, slot } | null

  // ── Calcoli ────────────────────────────────────────────
  const titolari = rosa.filter((g) => titolariIds.includes(g.id));
  const puntoAtteso = titolari.reduce((sum, g) => sum + (g.votoMedia || 0), 0);

  // ── Handlers ───────────────────────────────────────────

  /** Cambia modulo con slot preservation: mantieni il giocatore in slot[i]
   *  solo se il suo ruolo è compatibile con il nuovo slot[i]. */
  function handleModuloChange(newModulo) {
    const newSlots = MODULI[newModulo]?.slots ?? [];
    const newIds = newSlots.map((newSlot, idx) => {
      const currentId = titolariIds[idx];
      if (currentId == null) return null;
      const giocatore = rosa.find((g) => g.id === currentId);
      if (!giocatore) return null;
      return isCompatibile(giocatore.ruoloMantra, newSlot.ruoli) ? currentId : null;
    });
    setModulo(newModulo);
    setTitolariIds(newIds.filter(Boolean));
    setModuloSheetOpen(false);
  }

  /** Tap su slot vuoto → apri player picker */
  function handleSlotTap(slotIdx, slot) {
    setPickerSlot({ slotIdx, slot });
  }

  /** Scelta giocatore nel picker → assegna allo slot */
  function handlePickerSelect(gId) {
    if (pickerSlot == null) return;
    const newIds = [...titolariIds];
    // Rimuovi il giocatore da un altro slot se già titolare
    const existingIdx = newIds.indexOf(gId);
    if (existingIdx >= 0) newIds[existingIdx] = null;
    newIds[pickerSlot.slotIdx] = gId;
    setTitolariIds(newIds.filter(Boolean));
    setPickerSlot(null);
  }

  // ── Giocatori compatibili per il player picker ─────────
  const compatibiliPicker = pickerSlot
    ? rosa
        .filter(
          (g) =>
            !titolariIds.includes(g.id) &&
            isCompatibile(g.ruoloMantra, pickerSlot.slot.ruoli)
        )
        .sort((a, b) => (b.votoMedia || 0) - (a.votoMedia || 0))
    : [];

  return (
    <div className="schiera-page">
      {/* Sub-tab bar */}
      <SchieraTabBar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        rosaCount={rosa.length > 0 ? rosa.length : undefined}
      />

      {/* Tab: Campo */}
      {activeTab === 'campo' && (
        <div className="schiera-tab-content schiera-tab-content--campo">
          <FormationEditor
            rosa={rosa}
            modulo={modulo}
            titolariIds={titolariIds}
            onTitolariChange={setTitolariIds}
            puntoAtteso={puntoAtteso}
            onModuloChipClick={() => setModuloSheetOpen(true)}
            onSlotTap={handleSlotTap}
          />
        </div>
      )}

      {/* Tab: Rosa */}
      {activeTab === 'rosa' && (
        <div className="schiera-tab-content">
          <LaRosa />
        </div>
      )}

      {/* BottomSheet: selezione modulo */}
      <BottomSheet
        isOpen={moduloSheetOpen}
        onClose={() => setModuloSheetOpen(false)}
        title="Scegli modulo"
      >
        <div className="modulo-list">
          {MODULI_LIST.map((m) => (
            <button
              key={m}
              className={`modulo-list-item${m === modulo ? ' modulo-list-item--active' : ''}`}
              onClick={() => handleModuloChange(m)}
            >
              {MODULI[m].label}
              {m === modulo && <span aria-hidden="true">✓</span>}
            </button>
          ))}
        </div>
      </BottomSheet>

      {/* BottomSheet: player picker */}
      <BottomSheet
        isOpen={pickerSlot != null}
        onClose={() => setPickerSlot(null)}
        title={
          pickerSlot
            ? `Scegli — ${pickerSlot.slot.ruoli.join('/')}`
            : 'Scegli giocatore'
        }
      >
        {compatibiliPicker.length === 0 ? (
          <p style={{
            color: 'var(--fg-55)',
            fontSize: 14,
            textAlign: 'center',
            padding: 'var(--space-4)',
          }}>
            Nessun giocatore compatibile disponibile in panchina.
          </p>
        ) : (
          <div className="player-picker-list">
            {compatibiliPicker.map((g) => (
              <button
                key={g.id}
                className={`player-picker-item${g.infortunato ? ' player-picker-item--infortunato' : ''}`}
                onClick={() => !g.infortunato && handlePickerSelect(g.id)}
                disabled={g.infortunato}
                aria-label={`${g.nome} ${g.cognome}${g.infortunato ? ' (infortunato)' : ''}`}
              >
                <span className="player-picker-role">{g.ruoloMantra}</span>
                <span className="player-picker-name">
                  {g.nome} {g.cognome}
                  {g.infortunato && (
                    <span style={{ fontSize: 11, marginLeft: 6, color: 'var(--color-danger)' }}>
                      ⚠ infort.
                    </span>
                  )}
                </span>
                <span className="player-picker-media">{g.votoMedia?.toFixed(1) ?? '—'}</span>
              </button>
            ))}
          </div>
        )}
      </BottomSheet>
    </div>
  );
}
