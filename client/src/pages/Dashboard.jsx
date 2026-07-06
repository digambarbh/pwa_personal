import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import TermHeader from "../components/TermHeader";
import { useTracker } from "../TrackerContext";
import { WEEK_DATA, PHASES, CATEGORY_LABEL } from "../data/weekData";
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
  } = useTracker();

  const [studySummary, setStudySummary] = useState(null);
  const quote = useMemo(() => getQuoteOfDay(), []);

  useEffect(() => {
    api.getStudySummary().then(setStudySummary).catch(() => {});
  }, []);

  const phaseData = useMemo(() => {
    return PHASES.map((phase) => {
      const ids = [];
      phase.weeks.forEach((w) => ids.push(`${w}-dsa`, `${w}-core`, `${w}-project`));
      const done = tasks.filter((t) => ids.includes(t.taskId) && t.done).length;
      const pctVal = ids.length ? Math.round((done / ids.length) * 100) : 0;
      return { name: `P${phase.id}`, pct: pctVal };
    });
  }, [tasks]);

  if (loading) return <div className="loading">connecting to database…</div>;

  let nextUp = null;
  outer: for (const phase of PHASES) {
    for (const week of phase.weeks) {
      for (const cat of ["dsa", "core", "project"]) {
        const id = `${week}-${cat}`;
        const t = taskMap[id];
        if (t && !t.done) {
          nextUp = { week, cat, label: WEEK_DATA[week][cat] };
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
            <span className="tag">{CATEGORY_LABEL[nextUp.cat]}</span>
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
    </div>
  );
}
