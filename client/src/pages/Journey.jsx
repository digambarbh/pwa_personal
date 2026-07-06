import { useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, Tooltip, CartesianGrid,
} from "recharts";
import TermHeader from "../components/TermHeader";
import { useTracker } from "../TrackerContext";
import { api } from "../api";
import { PHASES } from "../data/weekData";

const CHART_GRID = "#2b333d";
const CHART_TEXT = "#7d8590";
const CHART_GREEN = "#39d353";
const CHART_AMBER = "#d29922";

const SCORE_TYPES = ["aptitude", "dsa", "mock-interview", "gd"];
const SCORE_LABEL = { aptitude: "Aptitude", dsa: "DSA", "mock-interview": "Interview", gd: "GD" };

function tooltipStyle() {
  return {
    contentStyle: { background: "#141a21", border: "1px solid #2b333d", borderRadius: 6, fontSize: 12, fontFamily: "ui-monospace, monospace" },
    labelStyle: { color: "#7d8590" },
    itemStyle: { color: "#c9d1d9" },
  };
}

export default function Journey() {
  const { loading, streak, currentStreak, checkedToday, checkinToday, todayStr, tasks } = useTracker();
  const [scores, setScores] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [scoreType, setScoreType] = useState("aptitude");
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const [s, sess] = await Promise.all([api.getScores(), api.getStudySessions()]);
        setScores(s);
        setSessions(sess);
      } catch (e) {
        setError(e.message);
      }
    })();
  }, []);

  const phaseData = useMemo(() => {
    return PHASES.map((phase) => {
      const ids = [];
      phase.weeks.forEach((w) => ids.push(`${w}-dsa`, `${w}-core`, `${w}-project`));
      const doneCount = tasks.filter((t) => ids.includes(t.taskId) && t.done).length;
      const pct = ids.length ? Math.round((doneCount / ids.length) * 100) : 0;
      return { name: `P${phase.id}`, pct };
    });
  }, [tasks]);

  const studyChartData = useMemo(() => {
    const days = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      const mins = sessions.filter((s) => s.date === key).reduce((sum, s) => sum + s.minutes, 0);
      days.push({ day: String(d.getDate()), minutes: mins });
    }
    return days;
  }, [sessions]);

  const scoreChartData = useMemo(() => {
    return scores
      .filter((s) => s.type === scoreType)
      .slice()
      .sort((a, b) => (a.date > b.date ? 1 : -1))
      .map((s) => ({ date: s.date.slice(5), pct: Math.round((s.score / s.maxScore) * 100) }));
  }, [scores, scoreType]);

  if (loading) return <div className="loading">loading journey…</div>;

  const set = new Set(streak);
  const heatDays = [];
  for (let i = 69; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    heatDays.push({ key, hit: set.has(key), isToday: key === todayStr() });
  }

  return (
    <div className="page">
      <TermHeader path="--journey" />
      <div className="card">
        <h1>Your Journey</h1>
        <div className="sub">the full picture, at a glance</div>
        {error && <div className="error-banner">{error}</div>}

        <div className="stats">
          <div className="stat"><div className="n">{currentStreak}</div><div className="l">day streak</div></div>
          <div className="stat"><div className="n">{streak.length}</div><div className="l">total logged</div></div>
        </div>

        <div className="section-title">Check in</div>
        <button
          className={"checkin-btn" + (checkedToday ? " done" : "")}
          onClick={checkinToday}
          disabled={checkedToday}
        >
          {checkedToday ? "✓ logged today" : "log today — grinded DSA/aptitude"}
        </button>

        <div className="heatmap wide">
          {heatDays.map((d) => (
            <div key={d.key} className={"cell" + (d.hit ? " hit" : "") + (d.isToday ? " today" : "")} title={d.key} />
          ))}
        </div>
      </div>

      <div className="card plain">
        <h2>Roadmap progress by phase</h2>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={phaseData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
            <CartesianGrid stroke={CHART_GRID} vertical={false} />
            <XAxis dataKey="name" stroke={CHART_TEXT} fontSize={11} fontFamily="ui-monospace, monospace" />
            <YAxis stroke={CHART_TEXT} fontSize={11} domain={[0, 100]} />
            <Tooltip {...tooltipStyle()} formatter={(v) => [`${v}%`, "complete"]} />
            <Bar dataKey="pct" fill={CHART_GREEN} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="card plain">
        <h2>Study time — last 14 days</h2>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={studyChartData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
            <CartesianGrid stroke={CHART_GRID} vertical={false} />
            <XAxis dataKey="day" stroke={CHART_TEXT} fontSize={11} fontFamily="ui-monospace, monospace" />
            <YAxis stroke={CHART_TEXT} fontSize={11} />
            <Tooltip {...tooltipStyle()} formatter={(v) => [`${v} min`, "studied"]} />
            <Bar dataKey="minutes" fill={CHART_AMBER} radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="card plain">
        <h2>Mock score trend</h2>
        <div className="status-row" style={{ marginBottom: 10 }}>
          {SCORE_TYPES.map((t) => (
            <button
              key={t}
              className={"status-pill" + (scoreType === t ? " active" : "")}
              onClick={() => setScoreType(t)}
            >
              {SCORE_LABEL[t]}
            </button>
          ))}
        </div>
        {scoreChartData.length === 0 ? (
          <div className="empty">No {SCORE_LABEL[scoreType]} scores logged yet.</div>
        ) : (
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={scoreChartData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid stroke={CHART_GRID} vertical={false} />
              <XAxis dataKey="date" stroke={CHART_TEXT} fontSize={11} fontFamily="ui-monospace, monospace" />
              <YAxis stroke={CHART_TEXT} fontSize={11} domain={[0, 100]} />
              <Tooltip {...tooltipStyle()} formatter={(v) => [`${v}%`, "score"]} />
              <Line type="monotone" dataKey="pct" stroke={CHART_GREEN} strokeWidth={2} dot={{ r: 3, fill: CHART_GREEN }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
