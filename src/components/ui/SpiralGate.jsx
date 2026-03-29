// src/components/ui/SpiralGate.jsx
import { useState, useEffect, useRef } from 'react'

export function SpiralGate({ onEnter }) {
  const [buttonVisible, setButtonVisible] = useState(false)
  const [exiting, setExiting] = useState(false)
  const exitTimerRef = useRef(null)

  useEffect(() => {
    const timer = setTimeout(() => setButtonVisible(true), 2000)
    return () => {
      clearTimeout(timer)
      if (exitTimerRef.current) clearTimeout(exitTimerRef.current)
    }
  }, [])

  function handleEnter() {
    setExiting(true)
    exitTimerRef.current = setTimeout(() => onEnter(), 800)
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
