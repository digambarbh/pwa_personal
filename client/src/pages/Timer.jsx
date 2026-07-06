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
  const [durationMin, setDurationMin] = useState(25);
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState(null);
  const [justLogged, setJustLogged] = useState(null);
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

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            setRunning(false);
            handleComplete(durationMin);
            return 0;
          }
          return prev - 1;
        });
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  const handleComplete = async (minutesToLog) => {
    try {
      await api.logStudySession({ date: todayStr(), minutes: minutesToLog });
      setJustLogged(minutesToLog);
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
    setRunning(true);
  };

  const handlePause = () => setRunning(false);

  const handleStopAndLog = async () => {
    setRunning(false);
    const minutesElapsed = Math.max(1, Math.round(elapsedSeconds / 60));
    if (elapsedSeconds >= 60) {
      await handleComplete(minutesElapsed);
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
  const circumference = 2 * Math.PI * 90;
  const dashOffset = circumference - (pct / 100) * circumference;

  return (
    <div className="page">
      <TermHeader path="--timer" />
      <Link to="/" className="back-link">‹ dashboard</Link>

      <div className="card" style={{ textAlign: "center" }}>
        <h1>Focus Timer</h1>
        <div className="sub">pick a duration, hit start, just study</div>
        {error && <div className="error-banner">{error}</div>}

        <div style={{ display: "flex", justifyContent: "center", margin: "10px 0 20px" }}>
          <svg width="220" height="220" viewBox="0 0 220 220">
            <circle cx="110" cy="110" r="90" fill="none" stroke="#1c232c" strokeWidth="14" />
            <circle
              cx="110" cy="110" r="90" fill="none"
              stroke={running ? "#39d353" : "#d29922"}
              strokeWidth="14"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              strokeLinecap="round"
              transform="rotate(-90 110 110)"
              style={{ transition: "stroke-dashoffset 1s linear" }}
            />
            <text x="110" y="103" textAnchor="middle" fontFamily="ui-monospace, monospace" fontSize="34" fill="#c9d1d9">
              {formatTime(secondsLeft)}
            </text>
            <text x="110" y="128" textAnchor="middle" fontFamily="ui-monospace, monospace" fontSize="12" fill="#7d8590">
              {running ? "focusing…" : secondsLeft === 0 ? "session complete" : "ready"}
            </text>
          </svg>
        </div>

        <div className="status-row" style={{ justifyContent: "center", marginBottom: 16 }}>
          {PRESETS.map((p) => (
            <button
              key={p}
              className={"status-pill" + (durationMin === p ? " active" : "")}
              onClick={() => selectPreset(p)}
              disabled={running}
            >
              {p} min
            </button>
          ))}
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
            ✓ logged {justLogged} min to your study time
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
