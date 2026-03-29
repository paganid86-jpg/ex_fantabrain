// src/components/ui/SpiralGate.jsx
import { useState, useEffect } from 'react'

export function SpiralGate({ onEnter }) {
  const [buttonVisible, setButtonVisible] = useState(false)
  const [exiting, setExiting] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setButtonVisible(true), 2000)
    return () => clearTimeout(timer)
  }, [])

  function handleEnter() {
    setExiting(true)
    setTimeout(() => onEnter(), 800)
  }

  return (
    <div className={`spiral-gate${exiting ? ' spiral-gate--exiting' : ''}`}>
      <button
        className={`spiral-gate__btn${buttonVisible ? ' spiral-gate__btn--visible' : ''}`}
        onClick={handleEnter}
        type="button"
        aria-label="Entra nella waiting list di FantaBrain"
      >
        Entra →
      </button>
    </div>
  )
}
