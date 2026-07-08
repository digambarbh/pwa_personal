import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Timer, BookOpen } from "lucide-react";
import BottomNav from "./components/BottomNav";
import Dashboard from "./pages/Dashboard";
import Roadmap from "./pages/Roadmap";
import PhaseDetail from "./pages/PhaseDetail";
import Journey from "./pages/Journey";
import Companies from "./pages/Companies";
import Scores from "./pages/Scores";
import Timer from "./pages/Timer";
import Settings from "./pages/Settings";
import Learning from "./pages/Learning";
import { TrackerProvider, useTracker } from "./TrackerContext";
import RealityCheckModal from "./components/RealityCheckModal";

function AppContent() {
  const { hideMode, toggleHideMode } = useTracker();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (hideMode) {
      if (location.pathname !== "/timer" && location.pathname !== "/learning") {
        navigate("/timer", { replace: true });
      }
    }
  }, [hideMode, location.pathname, navigate]);

  if (hideMode) {
    return (
      <>
        <Routes>
          <Route path="*" element={<Timer />} />
          <Route path="/timer" element={<Timer />} />
          <Route path="/learning" element={<Learning />} />
        </Routes>
        <div className="bottom-nav">
          <button className={`nav-item ${location.pathname.includes('/timer') || location.pathname === '/' ? 'active' : ''}`} onClick={() => navigate('/timer')}>
            <Timer size={28} strokeWidth={location.pathname.includes('/timer') || location.pathname === '/' ? 2.5 : 2} className="nav-icon" style={{ color: (location.pathname.includes('/timer') || location.pathname === '/') ? 'var(--green)' : 'var(--text)' }} />
          </button>
          <button className={`nav-item ${location.pathname.includes('/learning') ? 'active' : ''}`} onClick={() => navigate('/learning')}>
            <BookOpen size={28} strokeWidth={location.pathname.includes('/learning') ? 2.5 : 2} className="nav-icon" style={{ color: location.pathname.includes('/learning') ? 'var(--green)' : 'var(--text)' }} />
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <RealityCheckModal />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/roadmap" element={<Roadmap />} />
        <Route path="/roadmap/:phaseId" element={<PhaseDetail />} />
        <Route path="/journey" element={<Journey />} />
        <Route path="/companies" element={<Companies />} />
        <Route path="/scores" element={<Scores />} />
        <Route path="/timer" element={<Timer />} />
        <Route path="/learning" element={<Learning />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
      <BottomNav />
    </>
  );
}

export default function App() {
  return (
    <TrackerProvider>
      <AppContent />
    </TrackerProvider>
  );
}
