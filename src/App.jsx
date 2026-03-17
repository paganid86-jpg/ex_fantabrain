import { HashRouter, Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import Sidebar from './components/layout/Sidebar';
import Topbar from './components/layout/Topbar';
import Dashboard from './pages/Dashboard';
import AIAnalisi from './pages/AIAnalisi';
import LaRosa from './pages/LaRosa';
import Schieramento from './pages/Schieramento';
import Classifica from './pages/Classifica';
import Calendario from './pages/Calendario';
import Mercato from './pages/Mercato';
import Scouting from './pages/Scouting';
import WarRoom from './pages/WarRoom';
import Statistiche from './pages/Statistiche';

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <HashRouter>
      <div className="app-layout">
        <Sidebar mobileOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="main-content">
          <Topbar onMenuClick={() => setSidebarOpen((o) => !o)} />
          <div className="page-content">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/ai-analisi" element={<AIAnalisi />} />
              <Route path="/la-rosa" element={<LaRosa />} />
              <Route path="/schieramento" element={<Schieramento />} />
              <Route path="/classifica" element={<Classifica />} />
              <Route path="/calendario" element={<Calendario />} />
              <Route path="/mercato" element={<Mercato />} />
              <Route path="/scouting" element={<Scouting />} />
              <Route path="/war-room" element={<WarRoom />} />
              <Route path="/statistiche" element={<Statistiche />} />
            </Routes>
          </div>
        </div>
      </div>
    </HashRouter>
  );
}
