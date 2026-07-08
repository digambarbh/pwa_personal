import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import TermHeader from "../components/TermHeader";
import { api } from "../api";

const PRESETS = [25, 50, 90];

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function formatTime(totalSeconds) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function Timer() {
  const [mode, setMode] = useState("focus"); // "focus" | "break"
  const [durationMin, setDurationMin] = useState(25);
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [endTime, setEndTime] = useState(null);
  
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState(null);
  const [justLogged, setJustLogged] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [objective, setObjective] = useState("");
  
  const intervalRef = useRef(null);

  const loadSummary = async () => {
    try {
      const s = await api.getStudySummary();
      setSummary(s);
    } catch (e) {
      setError(e.message);
    }
  };

  useEffect(() => { loadSummary(); }, []);

  const playChime = () => {
    if (isMuted) return;
    const audio = new Audio("https://actions.google.com/sounds/v1/alarms/digital_watch_alarm_long.ogg");
    audio.play().catch(() => {});
  };

  useEffect(() => {
    if (running && endTime) {
      intervalRef.current = setInterval(() => {
        const now = Date.now();
        const left = Math.max(0, Math.round((endTime - now) / 1000));
        setSecondsLeft(left);
        setElapsedSeconds(durationMin * 60 - left);
        
        if (left <= 0) {
          clearInterval(intervalRef.current);
          setRunning(false);
          playChime();
          handleComplete(durationMin);
        }
      }, 500);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, endTime, durationMin, isMuted]);

  const handleComplete = async (minutesToLog) => {
    if (mode === "break") {
      setJustLogged("Break completed!");
      return;
    }
    try {
      await api.logStudySession({ date: todayStr(), minutes: minutesToLog });
      setJustLogged(`✓ logged ${minutesToLog} min to your study time`);
      loadSummary();
    } catch (e) {
      setError(e.message);
    }
  };

  const selectPreset = (min) => {
    if (running) return;
    setDurationMin(min);
    setSecondsLeft(min * 60);
    setElapsedSeconds(0);
    setJustLogged(null);
  };

  const handleStart = () => {
    setJustLogged(null);
    setEndTime(Date.now() + secondsLeft * 1000);
    setRunning(true);
  };

  const handlePause = () => {
    setRunning(false);
    setEndTime(null);
  };

  const handleStopAndLog = async () => {
    setRunning(false);
    setEndTime(null);
    const minutesElapsed = Math.max(1, Math.round(elapsedSeconds / 60));
    if (elapsedSeconds >= 60 && mode === "focus") {
      await handleComplete(minutesElapsed);
    } else if (mode === "break") {
      setJustLogged("Break stopped early.");
    }
    setSecondsLeft(durationMin * 60);
    setElapsedSeconds(0);
  };

  const handleReset = () => {
    setRunning(false);
    setSecondsLeft(durationMin * 60);
    setElapsedSeconds(0);
    setJustLogged(null);
  };

  const pct = Math.round(((durationMin * 60 - secondsLeft) / (durationMin * 60)) * 100);
  const circumference = 2 * Math.PI * 100;
  const dashOffset = circumference - (pct / 100) * circumference;

  return (
    <div className="page">
      <TermHeader path="--timer" />
      <Link to="/" className="back-link">‹ dashboard</Link>

      <div className="card" style={{ textAlign: "center", position: "relative" }}>
        <button 
          onClick={() => setIsMuted(!isMuted)} 
          style={{ position: "absolute", top: 16, right: 16, background: "none", border: "none", color: isMuted ? "var(--dim)" : "var(--text)", cursor: "pointer", fontSize: 18 }}
        >
          {isMuted ? "🔇" : "🔊"}
        </button>
        
        <h1>{mode === "focus" ? "Focus Timer" : "Break Timer"}</h1>
        <div className="sub">{mode === "focus" ? "pick a duration, hit start, just study" : "relax and recharge"}</div>
        
        {mode === "focus" && !running && elapsedSeconds === 0 && (
          <div style={{ margin: "20px auto", width: "80%" }}>
            <input 
              type="text" 
              className="form-input" 
              placeholder="What is your focus objective? (e.g. Solve 2 DP problems)" 
              value={objective} 
              onChange={(e) => setObjective(e.target.value)}
              style={{ width: "100%", textAlign: "center", fontSize: "15px", padding: "14px", borderColor: "#1c2333", color: "#00f3ff", backgroundColor: "#0a0d14", boxShadow: "inset 0 2px 6px rgba(0,0,0,0.5)", borderRadius: "10px" }}
            />
          </div>
        )}

        {mode === "focus" && (running || elapsedSeconds > 0) && objective && (
          <div style={{
            margin: "20px auto",
            padding: "14px 24px",
            backgroundColor: "#0a0d14",
            border: "1px solid #00f3ff",
            borderRadius: "12px",
            color: "#00f3ff",
            fontSize: "16px",
            textAlign: "center",
            width: "fit-content",
            maxWidth: "90%",
            boxShadow: "0 0 12px rgba(0, 243, 255, 0.4)",
            textShadow: "0 0 6px rgba(0, 243, 255, 0.6)",
            wordBreak: "break-word"
          }}>
            🎯 {objective}
          </div>
        )}

        {error && <div className="error-banner">{error}</div>}

        <div style={{ display: "flex", justifyContent: "center", margin: "10px 0 30px" }}>
          <svg width="240" height="240" viewBox="0 0 240 240">
            <defs>
              <filter id="timerGlowGreen" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="5" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
              <filter id="timerGlowPurple" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="5" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
              <filter id="timerGlowAmber" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="5" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>
            <circle cx="120" cy="120" r="100" fill="none" stroke="#0a0d14" strokeWidth="8" style={{ filter: "drop-shadow(0 0 4px #000)" }} />
            <circle
              cx="120" cy="120" r="100" fill="none"
              stroke={running ? (mode === "focus" ? "#39ff14" : "#b142ff") : "#ffbd2e"}
              strokeWidth="10"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              strokeLinecap="round"
              transform="rotate(-90 120 120)"
              style={{ transition: "stroke-dashoffset 1s linear" }}
              filter={running ? (mode === "focus" ? "url(#timerGlowGreen)" : "url(#timerGlowPurple)") : "url(#timerGlowAmber)"}
            />
            <text x="120" y="112" textAnchor="middle" fontFamily="var(--mono)" fontSize="48" fontWeight="bold" fill={running ? (mode === "focus" ? "#39ff14" : "#b142ff") : "#ffbd2e"} style={{ textShadow: `0 0 12px ${running ? (mode === 'focus' ? 'rgba(57,255,20,0.6)' : 'rgba(177,66,255,0.6)') : 'rgba(255,189,46,0.6)'}` }}>
              {formatTime(secondsLeft)}
            </text>
            <text x="120" y="148" textAnchor="middle" fontFamily="var(--mono)" fontSize="13" fill="#7d8590" style={{ letterSpacing: '0.15em', textTransform: 'uppercase' }}>
              {running ? (mode === "focus" ? "focusing" : "on break") : secondsLeft === 0 ? "complete" : "ready"}
            </text>
          </svg>
        </div>

        <div style={{ display: "flex", justifyContent: "center", gap: 10, marginBottom: 16 }}>
          <button className={"status-pill" + (mode === "focus" ? " active" : "")} onClick={() => { setMode("focus"); selectPreset(25); }} disabled={running}>Focus</button>
          <button className={"status-pill" + (mode === "break" ? " active" : "")} onClick={() => { setMode("break"); selectPreset(5); }} disabled={running}>Break</button>
        </div>

        <div className="status-row" style={{ justifyContent: "center", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
          {(mode === "focus" ? PRESETS : [5, 10, 15]).map((p) => (
            <button
              key={p}
              className={"status-pill" + (durationMin === p ? " active" : "")}
              onClick={() => selectPreset(p)}
              disabled={running}
            >
              {p} min
            </button>
          ))}
          <input
            type="number"
            placeholder="Custom"
            disabled={running}
            className="form-input"
            style={{ width: 80, textAlign: "center", padding: "4px", fontSize: 13, height: 28 }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                const val = Number(e.target.value);
                if (!isNaN(val) && val > 0) selectPreset(val);
              }
            }}
          />
        </div>

        {!running && secondsLeft > 0 && elapsedSeconds === 0 && (
          <button className="submit-btn" onClick={handleStart}>▶ start session</button>
        )}
        {running && (
          <button className="checkin-btn" onClick={handlePause}>‖ pause</button>
        )}
        {!running && elapsedSeconds > 0 && secondsLeft > 0 && (
          <div className="form-row">
            <button className="submit-btn" onClick={handleStart}>▶ resume</button>
            <button className="danger-btn" onClick={handleStopAndLog}>■ stop & log</button>
          </div>
        )}
        {secondsLeft === 0 && (
          <button className="submit-btn" onClick={handleReset}>start another session</button>
        )}

        {justLogged && (
          <div className="progress-label" style={{ marginTop: 12, color: "#39d353" }}>
            {justLogged}
          </div>
        )}
      </div>

      {summary && (
        <div className="card plain">
          <div className="section-title">Total study time</div>
          <div className="stats">
            <div className="stat">
              <div className="n">{Math.floor(summary.totalMinutes / 60)}h {summary.totalMinutes % 60}m</div>
              <div className="l">all time</div>
            </div>
            <div className="stat">
              <div className="n">{summary.todayMinutes}m</div>
              <div className="l">today</div>
            </div>
            <div className="stat">
              <div className="n">{summary.daysStudied}</div>
              <div className="l">days studied</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
