import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import TermHeader from "../components/TermHeader";
import { api } from "../api";

const STATUSES = ["applied", "oa", "interview", "offer", "rejected"];
const STATUS_LABEL = { applied: "Applied", oa: "OA", interview: "Interview", offer: "Offer", rejected: "Rejected" };

export default function Companies() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", role: "", appliedDate: "", notes: "" });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      setError(null);
      const data = await api.getCompanies();
      setCompanies(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      const created = await api.addCompany(form);
      setCompanies((prev) => [created, ...prev]);
      setForm({ name: "", role: "", appliedDate: "", notes: "" });
      setShowForm(false);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (id, status) => {
    setCompanies((prev) => prev.map((c) => (c._id === id ? { ...c, status } : c)));
    try {
      await api.updateCompany(id, { status });
    } catch (e) {
      setError(e.message);
      load();
    }
  };

  const handleDelete = async (id) => {
    setCompanies((prev) => prev.filter((c) => c._id !== id));
    try {
      await api.deleteCompany(id);
    } catch (e) {
      setError(e.message);
      load();
    }
  };

  const counts = STATUSES.reduce((acc, s) => {
    acc[s] = companies.filter((c) => c.status === s).length;
    return acc;
  }, {});

  if (loading) return <div className="loading">loading companies…</div>;

  return (
    <div className="page">
      <TermHeader path="--companies" />
      <div className="card">
        <h1>Companies</h1>
        <div className="sub">track your applications through the pipeline</div>
        {error && <div className="error-banner">{error}</div>}

        <div className="stats">
          <div className="stat"><div className="n">{companies.length}</div><div className="l">total</div></div>
          <div className="stat"><div className="n">{counts.interview + counts.oa}</div><div className="l">in progress</div></div>
          <div className="stat"><div className="n">{counts.offer}</div><div className="l">offers</div></div>
        </div>
      </div>

      <button className="fab-toggle" onClick={() => setShowForm((s) => !s)}>
        {showForm ? "− cancel" : "+ add company"}
      </button>

      {showForm && (
        <div className="card plain">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Company name</label>
              <input
                className="form-input"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. TCS, Infosys"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Role</label>
              <input
                className="form-input"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                placeholder="e.g. Software Engineer Trainee"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Applied date</label>
              <input
                type="date"
                className="form-input"
                value={form.appliedDate}
                onChange={(e) => setForm({ ...form, appliedDate: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Notes</label>
              <textarea
                className="form-textarea"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="referral, round details, anything to remember"
              />
            </div>
            <button className="submit-btn" type="submit" disabled={saving}>
              {saving ? "saving…" : "save company"}
            </button>
          </form>
        </div>
      )}

      {companies.length === 0 && !showForm && (
        <div className="card plain"><div className="empty">No companies added yet. Tap "+ add company" above.</div></div>
      )}

      {companies.map((c) => (
        <div className="company-card" key={c._id}>
          <div className="company-top">
            <div>
              <div className="company-name">{c.name}</div>
              {c.role && <div className="company-role">{c.role}</div>}
              {c.appliedDate && <div className="company-date">Applied {c.appliedDate}</div>}
            </div>
            <span className={`badge ${c.status}`}>{STATUS_LABEL[c.status]}</span>
          </div>

          <div className="status-row">
            {STATUSES.map((s) => (
              <button
                key={s}
                className={"status-pill" + (c.status === s ? " active" : "")}
                onClick={() => handleStatusChange(c._id, s)}
              >
                {STATUS_LABEL[s]}
              </button>
            ))}
            <button className="icon-btn" onClick={() => handleDelete(c._id)} title="Delete">✕</button>
          </div>
        </div>
      ))}

      <Link to="/scores" className="back-link" style={{ display: "block", marginTop: 16, textAlign: "center" }}>
        view mock test scores →
      </Link>
    </div>
  );
}
