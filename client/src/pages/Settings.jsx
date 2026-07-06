import { useState } from "react";
import TermHeader from "../components/TermHeader";
import { useTracker } from "../TrackerContext";

export default function Settings() {
  const { resetAll, total, doneCount } = useTracker();
  const [confirming, setConfirming] = useState(false);

  const handleReset = async () => {
    if (!confirming) {
      setConfirming(true);
      return;
    }
    await resetAll();
    setConfirming(false);
  };

  return (
    <div className="page">
      <TermHeader path="--settings" />
      <div className="card">
        <h1>Settings</h1>
        <div className="sub">data is stored in MongoDB Atlas</div>
        
        <div className="section-title">Storage</div>
        <div className="task" style={{ cursor: "default" }}>
          <span>Progress is shared across every device you open this app on — it's read from the same database, not local browser storage.</span>
        </div>

        <div className="section-title">Danger zone</div>
        <button className="danger-btn" onClick={handleReset}>
          {confirming ? `tap again to confirm — resets ${doneCount}/${total} tasks + streak` : "reset all progress"}
        </button>
        {confirming && (
          <div className="sub" style={{ marginTop: 8, textAlign: "center" }}>
            <span onClick={() => setConfirming(false)} style={{ cursor: "pointer" }}>cancel</span>
          </div>
        )}
      </div>
    </div>
  );
}
