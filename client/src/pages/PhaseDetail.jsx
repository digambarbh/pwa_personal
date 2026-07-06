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
          return (
            <div className="week" key={week}>
              <div className="week-label">Week {week}</div>
              {["dsa", "core", "project"].map((cat) => {
                const id = `${week}-${cat}`;
                const t = taskMap[id];
                const done = !!t?.done;
                return (
                  <label className="task" key={id}>
                    <input type="checkbox" checked={done} onChange={() => toggleTask(id)} />
                    <span className="tag">{CATEGORY_LABEL[cat]}</span>
                    <span className={done ? "done" : ""}>{wd[cat]}</span>
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
