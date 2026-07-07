import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import TermHeader from "../components/TermHeader";
import SkeletonLoader from "../components/SkeletonLoader";
import { api } from "../api";

const TYPES = ["aptitude", "dsa", "mock-interview", "gd"];
const TYPE_LABEL = { aptitude: "Aptitude", dsa: "DSA", "mock-interview": "Mock Interview", gd: "GD" };

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function Scores() {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    type: "aptitude",
    score: "",
    maxScore: "100",
    date: todayStr(),
    notes: "",
  });

  const load = async () => {
    try {
      setError(null);
      const data = await api.getScores();
      setScores(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.score) return;
    setSaving(true);
    try {
      const created = await api.addScore(form);
      setScores((prev) => [created, ...prev]);
      setForm({ type: "aptitude", score: "", maxScore: "100", date: todayStr(), notes: "" });
      setShowForm(false);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    setScores((prev) => prev.filter((s) => s._id !== id));
    try {
      await api.deleteScore(id);
    } catch (e) {
      setError(e.message);
      load();
    }
  };

  const avgPct = (type) => {
    const list = scores.filter((s) => s.type === type);
    if (list.length === 0) return null;
    const pct = list.reduce((sum, s) => sum + (s.score / s.maxScore) * 100, 0) / list.length;
    return Math.round(pct);
  };

  if (loading) return <SkeletonLoader path="--scores" />;

  return (
    <div className="page">
      <TermHeader path="--scores" />
      <Link to="/companies" className="back-link">‹ companies</Link>

      <div className="card">
        <h1>Mock Scores</h1>
        <div className="sub">track aptitude, DSA, and interview mock performance</div>
        {error && <div className="error-banner">{error}</div>}

        <div className="stats">
          {TYPES.map((t) => {
            const avg = avgPct(t);
            return (
              <div className="stat" key={t}>
                <div className="n">{avg !== null ? `${avg}%` : "—"}</div>
                <div className="l">{TYPE_LABEL[t]}</div>
              </div>
            );
          })}
        </div>
      </div>

      <button className="fab-toggle" onClick={() => setShowForm((s) => !s)}>
        {showForm ? "− cancel" : "+ log a score"}
      </button>

      {showForm && (
        <div className="card plain">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Type</label>
              <select
                className="form-select"
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
              >
                {TYPES.map((t) => (
                  <option key={t} value={t}>{TYPE_LABEL[t]}</option>
                ))}
              </select>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Score</label>
                <input
                  type="number"
                  className="form-input"
                  value={form.score}
                  onChange={(e) => setForm({ ...form, score: e.target.value })}
                  placeholder="72"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Out of</label>
                <input
                  type="number"
                  className="form-input"
                  value={form.maxScore}
                  onChange={(e) => setForm({ ...form, maxScore: e.target.value })}
                  placeholder="100"
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Date</label>
              <input
                type="date"
                className="form-input"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Notes</label>
              <textarea
                className="form-textarea"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="topics weak in, time taken, etc."
              />
            </div>
            <button className="submit-btn" type="submit" disabled={saving}>
              {saving ? "saving…" : "save score"}
            </button>
          </form>
        </div>
      )}

      {scores.length === 0 && !showForm && (
        <div className="card plain"><div className="empty">No scores logged yet. Tap "+ log a score" above.</div></div>
      )}

      {scores.map((s) => (
        <div className="score-card" key={s._id}>
          <div>
            <div className="score-type">{TYPE_LABEL[s.type]}</div>
            <div className="score-date">{s.date}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div className="score-value">{s.score}/{s.maxScore}</div>
            <div className="score-pct">{Math.round((s.score / s.maxScore) * 100)}%</div>
          </div>
          <button className="icon-btn" onClick={() => handleDelete(s._id)} title="Delete">✕</button>
        </div>
      ))}
    </div>
  );
}
