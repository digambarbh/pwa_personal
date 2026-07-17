import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import TermHeader from "../components/TermHeader";
import SkeletonLoader from "../components/SkeletonLoader";
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
    addDailyMetricLog,
    updateDailyMetricLog,
    deleteDailyMetricLog,
    updateDailyTargetTime,
  } = useTracker();

  const [studySummary, setStudySummary] = useState(null);
  const [quote, setQuote] = useState(getQuoteOfDay());
  
  const [modalState, setModalState] = useState({ type: null });
  const [tempVal, setTempVal] = useState("");
  const [tempLabel, setTempLabel] = useState("");
  const [editingLogId, setEditingLogId] = useState(null);

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

  const phaseHeatmapData = useMemo(() => {
    return PHASES.map((phase) => {
      const cells = [];
      phase.weeks.forEach((w) => {
        for (let i = 1; i <= 7; i++) {
          const id = `${w}-day${i}`;
          const isDone = tasks.some(t => t.taskId === id && t.done);
          cells.push({ id, isDone });
        }
      });
      return { name: `Phase ${phase.id}`, cells };
    });
  }, [tasks]);

  if (loading) return <SkeletonLoader path="--status" />;

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
        <h1>Prep Insta</h1>
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', background: '#0a0d14', padding: '16px', borderRadius: '8px', border: '1px solid #1c2333', marginBottom: '14px' }}>
          {phaseHeatmapData.map(phase => (
            <div key={phase.name} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '60px', fontFamily: 'var(--mono)', fontSize: '11.5px', color: 'var(--dim)', textTransform: 'uppercase' }}>{phase.name}</div>
              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', flex: 1 }}>
                {phase.cells.map(c => (
                  <div key={c.id} style={{ 
                    width: '10px', height: '10px', borderRadius: '2px',
                    background: c.isDone ? '#00f3ff' : '#141a21',
                    boxShadow: c.isDone ? '0 0 6px rgba(0,243,255,0.6)' : 'none',
                    border: c.isDone ? 'none' : '1px solid #2b333d'
                  }} title={c.id} />
                ))}
              </div>
            </div>
          ))}
        </div>

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
            setTempVal("");
            setTempLabel("");
            setEditingLogId(null);
            setModalState({ type: "points" });
          }} style={{ cursor: "pointer" }}>
            <div className="n">{dailyMetric?.points || 0}</div>
            <div className="l">points today (click to add)</div>
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
        <div className="modal-overlay" onClick={() => { setModalState({ type: null }); setEditingLogId(null); }}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-title">
              {modalState.type === "target" ? "Set Daily Study Target" : "Add Extra Points"}
            </div>
            <div className="modal-desc">
              {modalState.type === "target" 
                ? "How many minutes do you want to target each day?" 
                : "What did you study and how many extra points is it worth?"}
            </div>
            
            {modalState.type === "points" && (
              <div style={{ marginBottom: 16 }}>
                {dailyMetric?.logs?.length > 0 && (
                  <div style={{ marginBottom: 12, background: "var(--surface2)", padding: 8, borderRadius: 6 }}>
                    <div style={{ fontSize: 11, color: "var(--dim)", textTransform: "uppercase", marginBottom: 6 }}>Today's Logs</div>
                    {dailyMetric.logs.map((log, i) => (
                      <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13, marginBottom: 4 }}>
                        <div style={{ flex: 1 }}>
                          <span>{log.label}</span>
                          <span style={{ color: "var(--amber)", fontFamily: "var(--mono)", marginLeft: 8 }}>+{log.points}</span>
                        </div>
                        <div style={{ display: "flex", gap: 8 }}>
                          <span style={{ cursor: "pointer", color: "var(--dim)" }} onClick={() => {
                            setEditingLogId(log._id);
                            setTempLabel(log.label);
                            setTempVal(String(log.points));
                          }}>✎</span>
                          <span style={{ cursor: "pointer", color: "var(--dim)" }} onClick={() => {
                            deleteDailyMetricLog(log._id);
                            if (editingLogId === log._id) {
                              setEditingLogId(null);
                              setTempLabel("");
                              setTempVal("");
                            }
                          }}>🗑️</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Topic (e.g. Advanced Trees)" 
                  value={tempLabel} 
                  onChange={e => setTempLabel(e.target.value)} 
                  autoFocus
                  style={{ marginBottom: 8 }}
                />
              </div>
            )}

            <input 
              type="number" 
              className="form-input" 
              placeholder={modalState.type === "points" ? "Points" : ""}
              value={tempVal} 
              onChange={e => setTempVal(e.target.value)} 
              autoFocus={modalState.type !== "points"}
              onKeyDown={e => {
                if (e.key === "Enter") {
                  const val = Number(tempVal);
                  if (!isNaN(val)) {
                    if (modalState.type === "target") {
                      updateDailyTargetTime(val);
                      setModalState({ type: null });
                      setEditingLogId(null);
                    } else if (modalState.type === "points" && tempLabel) {
                      if (editingLogId) updateDailyMetricLog(editingLogId, tempLabel, val);
                      else addDailyMetricLog(tempLabel, val);
                      
                      setTempLabel("");
                      setTempVal("");
                      setEditingLogId(null);
                      // keep modal open so they can add more if they want, or close it:
                      // setModalState({ type: null }); 
                    }
                  }
                }
              }}
            />
            <div className="modal-actions">
              <button className="modal-btn cancel" onClick={() => { setModalState({ type: null }); setEditingLogId(null); }}>Close</button>
              <button className="modal-btn primary" onClick={() => {
                const val = Number(tempVal);
                if (!isNaN(val)) {
                  if (modalState.type === "target") {
                    updateDailyTargetTime(val);
                    setModalState({ type: null });
                    setEditingLogId(null);
                  } else if (modalState.type === "points" && tempLabel) {
                    if (editingLogId) updateDailyMetricLog(editingLogId, tempLabel, val);
                    else addDailyMetricLog(tempLabel, val);
                    
                    setTempLabel("");
                    setTempVal("");
                    setEditingLogId(null);
                  }
                }
              }}>{editingLogId ? "Update" : "Save"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
