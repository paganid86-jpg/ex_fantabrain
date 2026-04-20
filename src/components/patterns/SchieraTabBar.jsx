// src/components/patterns/SchieraTabBar.jsx

/**
 * SchieraTabBar — tab bar Campo / Rosa.
 *
 * Props:
 * - activeTab: 'campo' | 'rosa'
 * - onTabChange: (tab: 'campo' | 'rosa') => void
 * - rosaCount?: number — badge opzionale sul tab Rosa
 */
export default function SchieraTabBar({ activeTab, onTabChange, rosaCount }) {
  return (
    <nav className="schiera-tab-bar" role="tablist" aria-label="Schieramento sezioni">
      <button
        role="tab"
        aria-selected={activeTab === 'campo'}
        className={`tab-btn${activeTab === 'campo' ? ' tab-btn--active' : ''}`}
        onClick={() => onTabChange('campo')}
      >
        Campo
      </button>
      <button
        role="tab"
        aria-selected={activeTab === 'rosa'}
        className={`tab-btn${activeTab === 'rosa' ? ' tab-btn--active' : ''}`}
        onClick={() => onTabChange('rosa')}
      >
        Rosa{rosaCount != null ? ` (${rosaCount})` : ''}
      </button>
    </nav>
  );
}
