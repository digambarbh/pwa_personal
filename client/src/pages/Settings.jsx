import { useState } from "react";
import TermHeader from "../components/TermHeader";
import { useTracker } from "../TrackerContext";
import NotificationOptIn from "../components/NotificationOptIn";
import { sendTestNotification } from "../pushNotifications";

export default function Settings() {
  const { resetAll, total, doneCount } = useTracker();
  const [confirming, setConfirming] = useState(false);
  const [notifyStatus, setNotifyStatus] = useState("idle");

  const handleReset = async () => {
    if (!confirming) {
      setConfirming(true);
      return;
    }
    await resetAll();
    setConfirming(false);
  };

  const handleSendTest = async () => {
    setNotifyStatus("loading");
    try {
      await sendTestNotification();
      setNotifyStatus("success");
    } catch {
      setNotifyStatus("error");
    }
  };

  return (
    <div className="page">
      <TermHeader path="--settings" />
      <div className="card">
        <h1>Settings</h1>
        <div className="sub">data is stored in MongoDB Atlas</div>
        <NotificationOptIn />
        <button
          className="submit-btn"
          type="button"
          onClick={handleSendTest}
          disabled={notifyStatus === "loading"}
          style={{ marginTop: 12 }}
        >
          {notifyStatus === "loading" ? "Sending test..." : "Send test notification"}
        </button>
        {notifyStatus === "success" && <div className="sub" style={{ marginTop: 8, color: "#39d353" }}>Test notification sent.</div>}
        {notifyStatus === "error" && <div className="sub" style={{ marginTop: 8, color: "#ff7b72" }}>Could not send test notification.</div>}
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
