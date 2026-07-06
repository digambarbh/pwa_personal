import { Routes, Route } from "react-router-dom";
import BottomNav from "./components/BottomNav";
import Dashboard from "./pages/Dashboard";
import Roadmap from "./pages/Roadmap";
import PhaseDetail from "./pages/PhaseDetail";
import Journey from "./pages/Journey";
import Companies from "./pages/Companies";
import Scores from "./pages/Scores";
import Timer from "./pages/Timer";
import Settings from "./pages/Settings";
import { TrackerProvider } from "./TrackerContext";

export default function App() {
  return (
    <TrackerProvider>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/roadmap" element={<Roadmap />} />
        <Route path="/roadmap/:phaseId" element={<PhaseDetail />} />
        <Route path="/journey" element={<Journey />} />
        <Route path="/companies" element={<Companies />} />
        <Route path="/scores" element={<Scores />} />
        <Route path="/timer" element={<Timer />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
      <BottomNav />
    </TrackerProvider>
  );
}
