import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
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
import Login from './pages/Login';
import Register from './pages/Register';
import WarroomShare from './pages/WarroomShare';
import LeagueCreation from './pages/LeagueCreation';
import LeagueSettings from './pages/LeagueSettings';
import useAppStore from './store/useAppStore';

function RequireAuth({ children }) {
  const token = useAppStore((s) => s.user.token);
  return token ? children : <Navigate to="/login" replace />;
}

function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-layout">
      <Sidebar mobileOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="main-content">
        <Topbar onMenuClick={() => setSidebarOpen((o) => !o)} />
        <div className="page-content">
          <Routes>
            <Route index element={<Dashboard />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="ai-analisi" element={<AIAnalisi />} />
            <Route path="la-rosa" element={<LaRosa />} />
            <Route path="schieramento" element={<Schieramento />} />
            <Route path="classifica" element={<Classifica />} />
            <Route path="calendario" element={<Calendario />} />
            <Route path="mercato" element={<Mercato />} />
            <Route path="scouting" element={<Scouting />} />
            <Route path="war-room" element={<WarRoom />} />
            <Route path="statistiche" element={<Statistiche />} />
            <Route path="crea-lega" element={<LeagueCreation />} />
            <Route path="impostazioni-lega" element={<LeagueSettings />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/warroom/:id" element={<WarroomShare />} />
        <Route path="/*" element={<RequireAuth><AppLayout /></RequireAuth>} />
      </Routes>
    </HashRouter>
  );
}
