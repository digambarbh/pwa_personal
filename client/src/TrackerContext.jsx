import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api } from "./api";

const TrackerContext = createContext(null);

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

function computeStreak(dates) {
  if (!dates || dates.length === 0) return 0;
  const set = new Set(dates);
  let d = new Date();
  let streak = 0;
  if (!set.has(todayStr())) d.setDate(d.getDate() - 1);
  while (true) {
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
      d.getDate()
    ).padStart(2, "0")}`;
    if (set.has(key)) {
      streak++;
      d.setDate(d.getDate() - 1);
    } else break;
  }
  return streak;
}

export function TrackerProvider({ children }) {
  const [tasks, setTasks] = useState([]);
  const [streak, setStreak] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [theme, setTheme] = useState("dark");

  useEffect(() => {
    const saved = window.localStorage.getItem("theme");
    if (saved === "light" || saved === "dark") {
      setTheme(saved);
    }
  }, []);

  useEffect(() => {
    document.documentElement.className = theme;
    window.localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  }, []);

  const loadAll = useCallback(async () => {
    try {
      setError(null);
      const [t, s] = await Promise.all([api.getTasks(), api.getStreak()]);
      setTasks(t);
      setStreak(s);
    } catch (e) {
      setError(e.message || "Failed to reach the server. Is the backend running?");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const toggleTask = useCallback(async (taskId) => {
    // optimistic update
    setTasks((prev) => prev.map((t) => (t.taskId === taskId ? { ...t, done: !t.done } : t)));
    try {
      const updated = await api.toggleTask(taskId);
      setTasks((prev) => prev.map((t) => (t.taskId === taskId ? updated : t)));
    } catch (e) {
      setError(e.message);
      loadAll();
    }
  }, [loadAll]);

  const checkinToday = useCallback(async () => {
    const t = todayStr();
    setStreak((prev) => (prev.includes(t) ? prev : [...prev, t]));
    try {
      const updated = await api.checkinToday();
      setStreak(updated);
    } catch (e) {
      setError(e.message);
      loadAll();
    }
  }, [loadAll]);

  const resetAll = useCallback(async () => {
    setTasks((prev) => prev.map((t) => ({ ...t, done: false })));
    setStreak([]);
    try {
      await api.resetAll();
      loadAll();
    } catch (e) {
      setError(e.message);
    }
  }, [loadAll]);

  const taskMap = useMemo(() => {
    const m = {};
    tasks.forEach((t) => (m[t.taskId] = t));
    return m;
  }, [tasks]);

  const doneCount = tasks.filter((t) => t.done).length;
  const total = tasks.length;
  const pct = total ? Math.round((doneCount / total) * 100) : 0;
  const currentStreak = computeStreak(streak);
  const checkedToday = streak.includes(todayStr());

  const value = {
    tasks,
    taskMap,
    streak,
    loading,
    error,
    doneCount,
    total,
    pct,
    currentStreak,
    checkedToday,
    toggleTask,
    checkinToday,
    resetAll,
    refresh: loadAll,
    todayStr,
    theme,
    toggleTheme,
  };

  return <TrackerContext.Provider value={value}>{children}</TrackerContext.Provider>;
}

export function useTracker() {
  const ctx = useContext(TrackerContext);
  if (!ctx) throw new Error("useTracker must be used within TrackerProvider");
  return ctx;
}
