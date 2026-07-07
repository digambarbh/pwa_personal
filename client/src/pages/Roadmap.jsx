import { Link } from "react-router-dom";
import TermHeader from "../components/TermHeader";
import SkeletonLoader from "../components/SkeletonLoader";
import { useTracker } from "../TrackerContext";
import { PHASES } from "../data/weekData";

export default function Roadmap() {
  const { loading, error, taskMap, refresh } = useTracker();

  if (loading) return <SkeletonLoader path="--roadmap" />;

  return (
    <div className="page">
      <TermHeader path="--roadmap" />
      <div className="card">
        <h1>Roadmap</h1>
        <div className="sub">20 weeks · 4 phases</div>
      </div>

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
    </div>
  );
}
