import { useState } from "react";
import { subscribeToPush, isPushSupported } from "../pushNotifications";

export default function NotificationOptIn() {
  const [status, setStatus] = useState("idle");
  if (!isPushSupported()) return null;

  async function handleClick() {
    setStatus("loading");
    try {
      await subscribeToPush();
      setStatus("done");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div style={{ padding: "16px" }}>
      <button
        onClick={handleClick}
        disabled={status === "loading" || status === "done"}
        style={{ padding: "12px 20px", borderRadius: "8px", border: "none", background: "#f4c873", color: "#1c2e22", fontWeight: "bold", cursor: "pointer" }}
      >
        {status === "done" ? "Notifications On" : status === "loading" ? "Enabling..." : "Enable Daily Reminders"}
      </button>
      {status === "error" && <p style={{ color: "#e07856" }}>Couldn't enable. Check browser permissions.</p>}
    </div>
  );
}