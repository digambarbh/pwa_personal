import { useState, useEffect } from "react";

const BASE = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? "/api" : "https://pwa-personal-backend.onrender.com/api");
const STORAGE_KEY = "app_pin";

async function verify(candidate) {
  try {
    const res = await fetch(`${BASE}/streak`, { headers: { "x-app-pin": candidate } });
    return res.ok;
  } catch {
    return false;
  }
}

export default function PinLock({ children }) {
  const [pin, setPin] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return setChecking(false);
    verify(saved).then((ok) => {
      if (ok) setUnlocked(true);
      else localStorage.removeItem(STORAGE_KEY);
      setChecking(false);
    });
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    const ok = await verify(pin);
    if (ok) {
      localStorage.setItem(STORAGE_KEY, pin);
      setUnlocked(true);
    } else {
      setError("Wrong PIN");
      setPin("");
    }
  }

  if (checking) return null;
  if (unlocked) return children;

  return (
    <div style={styles.wrap}>
      <form onSubmit={handleSubmit} style={styles.card}>
        <h2 style={styles.title}>Enter PIN</h2>
        <input
          type="password"
          inputMode="numeric"
          autoFocus
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          style={styles.input}
          placeholder="••••"
        />
        {error && <p style={styles.error}>{error}</p>}
        <button type="submit" style={styles.button}>Unlock</button>
      </form>
    </div>
  );
}

const styles = {
  wrap: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#1c2e22" },
  card: { background: "#24382c", padding: "32px", borderRadius: "16px", display: "flex", flexDirection: "column", gap: "12px", width: "min(90vw, 320px)" },
  title: { color: "#f4c873", fontFamily: "Georgia, serif", margin: 0, textAlign: "center" },
  input: { padding: "12px", borderRadius: "8px", border: "1px solid #3a4f40", background: "#1c2e22", color: "#f4c873", fontSize: "20px", textAlign: "center", letterSpacing: "6px" },
  button: { padding: "12px", borderRadius: "8px", border: "none", background: "#f4c873", color: "#1c2e22", fontWeight: "bold", cursor: "pointer" },
  error: { color: "#e07856", fontSize: "13px", textAlign: "center", margin: 0 },
};