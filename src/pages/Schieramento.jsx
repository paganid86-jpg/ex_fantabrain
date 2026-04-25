import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import useAppStore from '../store/useAppStore'
import { MODULI, MODULI_LIST, isCompatibile } from '../data/moduli'
import FormationEditor from '../components/formation/FormationEditor'
import SchieraTabBar from '../components/patterns/SchieraTabBar'
import BottomSheet from '../components/patterns/BottomSheet'
import LaRosa from './LaRosa'

export default function Schieramento() {
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab = searchParams.get('tab') === 'rosa' ? 'rosa' : 'campo'

  function handleTabChange(tab) {
    setSearchParams(tab === 'campo' ? {} : { tab })
  }

  const rosa = useAppStore((state) => state.rosa)
  const modulo = useAppStore((state) => state.modulo)
  const setModulo = useAppStore((state) => state.setModulo)
  const titolariIds = useAppStore((state) => state.titolariIds)
  const setTitolariIds = useAppStore((state) => state.setTitolariIds)

  const [moduloSheetOpen, setModuloSheetOpen] = useState(false)
  const [pickerSlot, setPickerSlot] = useState(null)

  const titolari = rosa.filter((giocatore) => titolariIds.includes(giocatore.id))
  const puntoAtteso = titolari.reduce((sum, giocatore) => sum + (giocatore.votoMedia || 0), 0)

  function handleModuloChange(newModulo) {
    const newSlots = MODULI[newModulo]?.slots ?? []
    const newIds = newSlots.map((newSlot, index) => {
      const currentId = titolariIds[index]
      if (currentId == null) return null

      const giocatore = rosa.find((item) => item.id === currentId)
      if (!giocatore) return null

      return isCompatibile(giocatore.ruoloMantra, newSlot.ruoli) ? currentId : null
    })

    setModulo(newModulo)
    setTitolariIds(newIds.filter(Boolean))
    setModuloSheetOpen(false)
  }

  function handleSlotTap(slotIdx, slot) {
    setPickerSlot({ slotIdx, slot })
  }

  function handlePickerSelect(giocatoreId) {
    if (pickerSlot == null) return

    const newIds = [...titolariIds]
    const existingIdx = newIds.indexOf(giocatoreId)
    if (existingIdx >= 0) newIds[existingIdx] = null

    newIds[pickerSlot.slotIdx] = giocatoreId
    setTitolariIds(newIds.filter(Boolean))
    setPickerSlot(null)
  }

  const compatibiliPicker = pickerSlot
    ? rosa
        .filter(
          (giocatore) =>
            !titolariIds.includes(giocatore.id) &&
            isCompatibile(giocatore.ruoloMantra, pickerSlot.slot.ruoli)
        )
        .sort((a, b) => (b.votoMedia || 0) - (a.votoMedia || 0))
    : []

  return (
    <div className="schiera-page">
      <SchieraTabBar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        rosaCount={rosa.length > 0 ? rosa.length : undefined}
      />

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

      {activeTab === 'rosa' && (
        <div className="schiera-tab-content">
          <LaRosa />
        </div>
      )}

      <BottomSheet
        isOpen={moduloSheetOpen}
        onClose={() => setModuloSheetOpen(false)}
        title="Scegli modulo"
      >
        <div className="modulo-list">
          {MODULI_LIST.map((item) => (
            <button
              key={item}
              type="button"
              className={`modulo-list-item${item === modulo ? ' modulo-list-item--active' : ''}`}
              onClick={() => handleModuloChange(item)}
            >
              <span>{MODULI[item].label}</span>
              {item === modulo && <span aria-hidden="true">OK</span>}
            </button>
          ))}
        </div>
      </BottomSheet>

      <BottomSheet
        isOpen={pickerSlot != null}
        onClose={() => setPickerSlot(null)}
        title={pickerSlot ? `Scegli ${pickerSlot.slot.ruoli.join('/')}` : 'Scegli giocatore'}
      >
        {compatibiliPicker.length === 0 ? (
          <p className="player-picker-empty">Nessun giocatore compatibile disponibile in panchina.</p>
        ) : (
          <div className="player-picker-list">
            {compatibiliPicker.map((giocatore) => (
              <button
                key={giocatore.id}
                type="button"
                className={`player-picker-item${giocatore.infortunato ? ' player-picker-item--infortunato' : ''}`}
                onClick={() => !giocatore.infortunato && handlePickerSelect(giocatore.id)}
                disabled={giocatore.infortunato}
                aria-label={`${giocatore.nome} ${giocatore.cognome}${giocatore.infortunato ? ' infortunato' : ''}`}
              >
                <span className="player-picker-role">{giocatore.ruoloMantra}</span>
                <span className="player-picker-name">
                  {giocatore.nome} {giocatore.cognome}
                  {giocatore.infortunato && <span className="player-picker-flag">infort.</span>}
                </span>
                <span className="player-picker-media">{giocatore.votoMedia?.toFixed(1) ?? '--'}</span>
              </button>
            ))}
          </div>
        )}
      </BottomSheet>
    </div>
  )
}
