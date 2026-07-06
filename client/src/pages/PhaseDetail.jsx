import { Link, useParams, Navigate } from "react-router-dom";
import TermHeader from "../components/TermHeader";
import { useTracker } from "../TrackerContext";
import { WEEK_DATA, PHASES, CATEGORY_LABEL } from "../data/weekData";

export default function PhaseDetail() {
  const { phaseId } = useParams();
  const { loading, taskMap, toggleTask } = useTracker();
  const phase = PHASES.find((p) => String(p.id) === phaseId);

  if (!phase) return <Navigate to="/roadmap" replace />;
  if (loading) return <div className="loading">loading…</div>;

  return (
    <div className="page">
      <TermHeader path={`--phase ${phase.id}`} />
      <Link to="/roadmap" className="back-link">‹ all phases</Link>

      <div className="card">
        <h1>Phase {phase.id}</h1>
        <div className="sub">{phase.name}</div>

        {phase.weeks.map((week) => {
          const wd = WEEK_DATA[week];
          if (!wd || !wd.days) return null;
          return (
            <div className="week" key={week}>
              <div className="week-label">Week {week}</div>
              {wd.days.map((d) => {
                const id = `${week}-day${d.day}`;
                const t = taskMap[id];
                const done = !!t?.done;
                return (
                  <label className="task" key={id} style={{ alignItems: 'flex-start', padding: '12px 16px' }}>
                    <input type="checkbox" checked={done} onChange={() => toggleTask(id)} style={{ marginTop: '4px' }} />
                    <span className="tag" style={{ minWidth: '50px', textAlign: 'center' }}>Day {d.day}</span>
                    <div className={done ? "done" : ""} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span style={{ fontWeight: '500' }}>{d.topics}</span>
                      <span style={{ fontSize: '0.85em', color: 'var(--dim)' }}>{d.exercise}</span>
                    </div>
                  </label>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
