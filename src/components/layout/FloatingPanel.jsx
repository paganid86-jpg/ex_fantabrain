import { useEffect, useRef } from 'react'
import PanelHeader from './PanelHeader'
import { y2kInit } from '../../lib/y2kAnimations'

export default function FloatingPanel({ children }) {
  const cleanupRef = useRef(null)

  useEffect(() => {
    cleanupRef.current = y2kInit()
    return () => { if (cleanupRef.current) cleanupRef.current() }
  }, [])

  return (
    <div className="floating-panel chrome-line">
      <PanelHeader />
      <main className="page-content">
        {children}
      </main>
    </div>
  )
}
