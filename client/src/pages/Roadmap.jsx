import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import TermHeader from "../components/TermHeader";
import SkeletonLoader from "../components/SkeletonLoader";
import { useTracker } from "../TrackerContext";
import { PHASES } from "../data/weekData";
import { api } from "../api";

export default function Roadmap() {
  const { loading, error, taskMap, refresh } = useTracker();
  const [reports, setReports] = useState([]);
  const [showAllReports, setShowAllReports] = useState(false);

  useEffect(() => {
    api.getReports().then(setReports).catch(console.error);
  }, []);

  if (loading) return <SkeletonLoader path="--roadmap" />;

  const latestReport = reports[0];

  return (
    <div className="page">
      <TermHeader path="--roadmap" />
      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1 style={{ margin: 0 }}>Roadmap</h1>
            <div className="sub">20 weeks · 4 phases</div>
          </div>
          {reports.length > 0 && (
            <button className="status-pill" onClick={() => setShowAllReports(true)}>
              See All Reports
            </button>
          )}
        </div>
      </div>

      {latestReport && (
        <div className="card" style={{ background: "var(--surface2)", border: "1px solid var(--border)" }}>
          <div className="section-title">Latest Reality Check</div>
          <div style={{ fontSize: 13, color: "var(--dim)", marginBottom: 8 }}>
            {new Date(latestReport.startDate).toLocaleDateString()} - {new Date(latestReport.endDate).toLocaleDateString()}
          </div>
          <div style={{ fontSize: 14, color: "var(--text)", lineHeight: 1.5 }}>
            {latestReport.message}
          </div>
          <div className="stats" style={{ marginTop: 12 }}>
            <div className="stat">
              <div className="n">{Math.floor(latestReport.totalMinutes / 60)}h {latestReport.totalMinutes % 60}m</div>
              <div className="l">studied</div>
            </div>
            <div className="stat">
              <div className="n">{latestReport.tasksCompleted}</div>
              <div className="l">tasks done</div>
            </div>
            <div className="stat">
              <div className="n">{latestReport.pointsEarned}</div>
              <div className="l">points</div>
            </div>
          </div>
        </div>
      )}

      {PHASES.map((phase) => {
        const ids = [];
        phase.weeks.forEach((w) => {
          for (let i = 1; i <= 7; i++) {
            ids.push(`${w}-day${i}`);
          }
        });
        const done = ids.filter((id) => taskMap[id]?.done).length;

        return (
          <Link key={phase.id} to={`/roadmap/${phase.id}`} className="phase-link">
            <div>
              <div className="phase-title">Phase {phase.id} — {phase.name}</div>
              <div className="phase-meta">Weeks {phase.weeks[0]}–{phase.weeks[phase.weeks.length - 1]} · {done}/{ids.length} done</div>
            </div>
            <div className="chev">›</div>
          </Link>
        );
      })}

      {showAllReports && (
        <div className="modal-overlay" onClick={() => setShowAllReports(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 600, maxHeight: "80vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ margin: 0, fontSize: 18 }}>Past Reports</h2>
              <button className="icon-btn" onClick={() => setShowAllReports(false)}>×</button>
            </div>
            {reports.map(report => (
              <div key={report._id} style={{ padding: 16, borderBottom: "1px solid var(--border)", marginBottom: 8, background: "var(--surface)", borderRadius: 8 }}>
                <div style={{ fontSize: 12, color: "var(--dim)", marginBottom: 4 }}>
                  {new Date(report.startDate).toLocaleDateString()} - {new Date(report.endDate).toLocaleDateString()}
                </div>
                <div style={{ fontSize: 14, color: "var(--text)", marginBottom: 8 }}>
                  {report.message}
                </div>
                <div style={{ display: "flex", gap: 16, fontSize: 12, color: "var(--text)", fontFamily: "var(--mono)" }}>
                  <span>⏱ {Math.floor(report.totalMinutes / 60)}h {report.totalMinutes % 60}m</span>
                  <span>✅ {report.tasksCompleted} tasks</span>
                  <span>🎯 {report.pointsEarned} pts</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
