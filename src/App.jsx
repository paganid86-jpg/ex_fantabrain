import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import FloatingPanel from './components/layout/FloatingPanel';
import BottomNav from './components/layout/BottomNav';
import Dashboard from './pages/Dashboard';
import AIAnalisi from './pages/AIAnalisi';
import Schieramento from './pages/Schieramento';
import Classifica from './pages/Classifica';
import Calendario from './pages/Calendario';
import Mercato from './pages/Mercato';
import Scouting from './pages/Scouting';
import WarRoom from './pages/WarRoom';
import Statistiche from './pages/Statistiche';
import News from './pages/News';
import HubAnalisi from './pages/HubAnalisi';
import Login from './pages/Login';
import Register from './pages/Register';
import WarroomShare from './pages/WarroomShare';
import LeagueCreation from './pages/LeagueCreation';
import LeagueSettings from './pages/LeagueSettings';
import MatchdayDetail from './pages/MatchdayDetail';
import LandingPage from './pages/LandingPage';
import LuxurySportsOSPreview from './pages/LuxurySportsOSPreview';
import useAppStore from './store/useAppStore';

function RequireAuth({ children }) {
  const token = useAppStore((s) => s.user.token);
  return token ? children : <Navigate to="/login" replace />;
}

/**
 * Redirect /la-rosa → /schieramento?tab=rosa
 * Mantiene i deep link esistenti e li traduce nella nuova IA
 * (La Rosa vive come sub-tab dentro Schieramento).
 */
function LaRosaRedirect() {
  const location = useLocation();
  const search = new URLSearchParams(location.search);
  search.set('tab', 'rosa');
  return <Navigate to={`/schieramento?${search.toString()}`} replace />;
}

function AppLayout() {
  return (
    <div className="app-layout">
      <FloatingPanel>
        <Routes>
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="ai-analisi" element={<AIAnalisi />} />
          <Route path="la-rosa" element={<LaRosaRedirect />} />
          <Route path="schieramento" element={<Schieramento />} />
          <Route path="classifica" element={<Classifica />} />
          <Route path="news" element={<News />} />
          <Route path="calendario" element={<Calendario />} />
          <Route path="mercato" element={<Mercato />} />
          <Route path="scouting" element={<Scouting />} />
          <Route path="war-room" element={<WarRoom />} />
          <Route path="statistiche" element={<Statistiche />} />
          <Route path="hub/analisi" element={<HubAnalisi />} />
          <Route path="crea-lega" element={<LeagueCreation />} />
          <Route path="impostazioni-lega" element={<LeagueSettings />} />
          <Route path="giornata/:n" element={<MatchdayDetail />} />
        </Routes>
      </FloatingPanel>
      <BottomNav />
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
        <Route path="/landing" element={<LandingPage />} />
        <Route path="/luxury-os-preview" element={<LuxurySportsOSPreview />} />
        <Route path="/*" element={<RequireAuth><AppLayout /></RequireAuth>} />
      </Routes>
    </HashRouter>
  );
}
