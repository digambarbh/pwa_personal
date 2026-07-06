const BASE = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? "/api" : "https://pwa-personal-backend.onrender.com/api");

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
    },
    ...options,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API ${path} failed: ${res.status} ${text}`);
  }
  return res.json();
}

export const api = {
  getTasks: () => request("/tasks"),
  toggleTask: (taskId) => request(`/tasks/${taskId}/toggle`, { method: "PUT" }),
  getProgress: () => request("/progress"),
  getStreak: () => request("/streak"),
  checkinToday: () => request("/streak/checkin", { method: "POST" }),
  resetAll: () => request("/reset", { method: "POST" }),
  getCompanies: () => request("/companies"),
  addCompany: (data) => request("/companies", { method: "POST", body: JSON.stringify(data) }),
  updateCompany: (id, data) => request(`/companies/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteCompany: (id) => request(`/companies/${id}`, { method: "DELETE" }),
  getScores: () => request("/scores"),
  addScore: (data) => request("/scores", { method: "POST", body: JSON.stringify(data) }),
  deleteScore: (id) => request(`/scores/${id}`, { method: "DELETE" }),
  getStudySessions: () => request("/study"),
  logStudySession: (data) => request("/study", { method: "POST", body: JSON.stringify(data) }),
  getStudySummary: () => request("/study/summary"),
};