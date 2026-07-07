import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import TermHeader from "../components/TermHeader";
import { useTracker } from "../TrackerContext";
import { WEEK_DATA, PHASES } from "../data/weekData";
import { getQuoteOfDay } from "../data/quotes";
import { api } from "../api";

const CHART_GRID = "#2b333d";
const CHART_TEXT = "#7d8590";
const CHART_GREEN = "#39d353";

export default function Dashboard() {
  const {
    loading,
    error,
    pct,
    doneCount,
    total,
    currentStreak,
    checkedToday,
    checkinToday,
    taskMap,
    tasks,
    dailyMetric,
    dailyTargetTime,
    updateDailyPoints,
    updateDailyTargetTime,
  } = useTracker();

  const [studySummary, setStudySummary] = useState(null);
  const [quote, setQuote] = useState(getQuoteOfDay());
  
  const [modalState, setModalState] = useState({ type: null });
  const [tempVal, setTempVal] = useState("");

  useEffect(() => {
    fetch("https://dummyjson.com/quotes/random")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.quote) {
          setQuote(data.quote);
        }
      })
      .catch((err) => console.error("Failed to fetch quote:", err));
    
    api.getStudySummary().then(setStudySummary).catch(() => {});
  }, []);

  const phaseData = useMemo(() => {
    return PHASES.map((phase) => {
      const ids = [];
      phase.weeks.forEach((w) => {
        for (let i = 1; i <= 7; i++) ids.push(`${w}-day${i}`);
      });
      const done = tasks.filter((t) => ids.includes(t.taskId) && t.done).length;
      const pctVal = ids.length ? Math.round((done / ids.length) * 100) : 0;
      return { name: `P${phase.id}`, pct: pctVal };
    });
  }, [tasks]);

  if (loading) return <div className="loading">connecting to database…</div>;

  let nextUp = null;
  outer: for (const phase of PHASES) {
    for (const week of phase.weeks) {
      const wd = WEEK_DATA[week];
      if (!wd || !wd.days) continue;
      for (const d of wd.days) {
        const id = `${week}-day${d.day}`;
        const t = taskMap[id];
        if (t && !t.done) {
          nextUp = { week, day: d.day, label: d.topics };
          break outer;
        }
      }
    }
  }

  return (
    <div className="page">
      <TermHeader path="--status" />

      <div className="card plain quote-card">
        <div className="quote-mark">“</div>
        <div className="quote-text">{quote}</div>
      </div>

      <div className="card">
        <h1>Placement Prep Tracker</h1>
        <div className="sub">synced to MongoDB · updates in real time</div>

        {error && <div className="error-banner">{error}</div>}

        <div className="progress-row">
          <div className="bar">
            <div className="bar-fill" style={{ width: `${pct}%` }} />
          </div>
          <div className="pct">{pct}%</div>
        </div>
        <div className="progress-label">{doneCount} / {total} tasks complete</div>

        <div className="stats">
          <div className="stat"><div className="n">{currentStreak}</div><div className="l">day streak</div></div>
          <div className="stat"><div className="n">{doneCount}</div><div className="l">done</div></div>
          <div className="stat"><div className="n">{total - doneCount}</div><div className="l">left</div></div>
        </div>

        <div className="section-title">Progress by phase</div>
        <ResponsiveContainer width="100%" height={130}>
          <BarChart data={phaseData} margin={{ top: 4, right: 8, left: -24, bottom: 0 }}>
            <CartesianGrid stroke={CHART_GRID} vertical={false} />
            <XAxis dataKey="name" stroke={CHART_TEXT} fontSize={11} fontFamily="ui-monospace, monospace" />
            <YAxis stroke={CHART_TEXT} fontSize={11} domain={[0, 100]} />
            <Tooltip
              formatter={(v) => [`${v}%`, "complete"]}
              contentStyle={{ background: "#141a21", border: "1px solid #2b333d", borderRadius: 6, fontSize: 12, fontFamily: "ui-monospace, monospace" }}
              labelStyle={{ color: "#7d8590" }}
              itemStyle={{ color: "#c9d1d9" }}
            />
            <Bar dataKey="pct" fill={CHART_GREEN} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>

        <div className="section-title">Daily Goals</div>
        <div className="stats" style={{ marginBottom: 20 }}>
          <div className="stat" onClick={() => {
            setTempVal(String(dailyTargetTime || 120));
            setModalState({ type: "target" });
          }} style={{ cursor: "pointer", position: "relative" }}>
            <div className="n">{studySummary ? studySummary.todayMinutes : 0} <span style={{ fontSize: "0.6em", color: "var(--dim)" }}>/ {dailyTargetTime}m</span></div>
            <div className="l">time today (click to set target)</div>
            <div className="bar" style={{ height: 4, marginTop: 8, background: "var(--border)" }}>
              <div className="bar-fill" style={{ width: `${Math.min(100, ((studySummary?.todayMinutes || 0) / (dailyTargetTime || 1)) * 100)}%`, background: CHART_GREEN, height: "100%" }} />
            </div>
          </div>
          <div className="stat" onClick={() => {
            setTempVal(String(dailyMetric?.points || 0));
            setModalState({ type: "points" });
          }} style={{ cursor: "pointer" }}>
            <div className="n">{dailyMetric?.points || 0}</div>
            <div className="l">points today (click to update)</div>
          </div>
        </div>

        <div className="section-title">Daily check-in</div>
        <button
          className={"checkin-btn" + (checkedToday ? " done" : "")}
          onClick={checkinToday}
          disabled={checkedToday}
        >
          {checkedToday ? "✓ logged today" : "log today — grinded DSA/aptitude"}
        </button>
      </div>

      <Link to="/timer" className="card plain timer-widget">
        <div>
          <div className="timer-widget-title">Focus Timer</div>
          <div className="timer-widget-sub">
            {studySummary ? `${Math.floor(studySummary.totalMinutes / 60)}h ${studySummary.totalMinutes % 60}m studied all time` : "start a study session"}
          </div>
        </div>
        <div className="timer-widget-cta">▶ start</div>
      </Link>

      {nextUp && (
        <div className="card plain">
          <h2>Next up — Week {nextUp.week}</h2>
          <div className="task">
            <span className="tag">Day {nextUp.day}</span>
            <span>{nextUp.label}</span>
          </div>
          <Link to="/roadmap" className="back-link" style={{ marginTop: 10 }}>
            open full roadmap →
          </Link>
        </div>
      )}

      {!nextUp && total > 0 && (
        <div className="card plain">
          <div className="empty">All 20 weeks complete. You're placement-ready. 🎯</div>
        </div>
      )}

      {modalState.type && (
        <div className="modal-overlay" onClick={() => setModalState({ type: null })}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-title">
              {modalState.type === "target" ? "Set Daily Study Target" : "Set Extra Points"}
            </div>
            <div className="modal-desc">
              {modalState.type === "target" 
                ? "How many minutes do you want to target each day?" 
                : "How many extra points did you study today?"}
            </div>
            <input 
              type="number" 
              className="form-input" 
              value={tempVal} 
              onChange={e => setTempVal(e.target.value)} 
              autoFocus
              onKeyDown={e => {
                if (e.key === "Enter") {
                  const val = Number(tempVal);
                  if (!isNaN(val)) {
                    if (modalState.type === "target") updateDailyTargetTime(val);
                    else if (modalState.type === "points") updateDailyPoints(val);
                  }
                  setModalState({ type: null });
                }
              }}
            />
            <div className="modal-actions">
              <button className="modal-btn cancel" onClick={() => setModalState({ type: null })}>Cancel</button>
              <button className="modal-btn primary" onClick={() => {
                const val = Number(tempVal);
                if (!isNaN(val)) {
                  if (modalState.type === "target") updateDailyTargetTime(val);
                  else if (modalState.type === "points") updateDailyPoints(val);
                }
                setModalState({ type: null });
              }}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
