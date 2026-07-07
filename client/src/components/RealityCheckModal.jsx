import { useTracker } from "../TrackerContext";

export default function RealityCheckModal() {
  const { unackReport, acknowledgeReport } = useTracker();

  if (!unackReport) return null;

  return (
    <div className="modal-overlay" style={{ zIndex: 10000, background: "rgba(13, 17, 23, 0.95)", backdropFilter: "blur(10px)" }}>
      <div className="modal-content" style={{ maxWidth: 500, padding: 32, border: "1px solid var(--border)", boxShadow: "0 10px 40px rgba(0,0,0,0.8)" }}>
        
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
          <h1 style={{ margin: 0, fontSize: 24, color: "var(--text)" }}>Reality Check</h1>
          <div style={{ color: "var(--dim)", fontSize: 13, marginTop: 8 }}>
            Your 3-day progress report ({new Date(unackReport.startDate).toLocaleDateString()} - {new Date(unackReport.endDate).toLocaleDateString()})
          </div>
        </div>

        <div style={{ background: "var(--surface2)", padding: 20, borderRadius: 8, marginBottom: 24 }}>
          <div style={{ fontSize: 16, lineHeight: 1.5, color: "var(--text)", fontWeight: 500, textAlign: "center" }}>
            {unackReport.message}
          </div>
        </div>

        <div className="stats" style={{ marginBottom: 24 }}>
          <div className="stat">
            <div className="n">{Math.floor(unackReport.totalMinutes / 60)}h {unackReport.totalMinutes % 60}m</div>
            <div className="l">studied</div>
          </div>
          <div className="stat">
            <div className="n">{unackReport.tasksCompleted}</div>
            <div className="l">tasks done</div>
          </div>
          <div className="stat">
            <div className="n">{unackReport.pointsEarned}</div>
            <div className="l">points</div>
          </div>
        </div>

        <div style={{ marginBottom: 32, borderTop: "1px solid var(--border)", paddingTop: 24 }}>
          <div className="section-title" style={{ textAlign: "center" }}>Next Up</div>
          <div style={{ background: "var(--bg)", padding: 16, borderRadius: 8, border: "1px solid var(--border)", textAlign: "center", fontFamily: "var(--mono)", fontSize: 13 }}>
            {unackReport.nextTaskLabel}
          </div>
        </div>

        <button 
          className="submit-btn" 
          style={{ width: "100%", padding: 16, fontSize: 16 }}
          onClick={() => acknowledgeReport(unackReport._id)}
        >
          I understand, let's get back to work
        </button>
      </div>
    </div>
  );
}
