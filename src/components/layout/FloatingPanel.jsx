import PanelHeader from './PanelHeader'

export default function FloatingPanel({ children }) {
  return (
    <div className="floating-panel chrome-line">
      <PanelHeader />
      <main className="page-content">
        {children}
      </main>
    </div>
  )
}
