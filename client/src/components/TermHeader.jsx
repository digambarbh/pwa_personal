import { useTracker } from "../TrackerContext";

export default function TermHeader({ path }) {
  const { theme, toggleTheme } = useTracker();

  return (
    <div className="term-header">
      <div className="term-header-left">
        <span className="dot r"></span>
        <span className="dot y"></span>
        <span className="dot g"></span>
        <span className="term-title">placement-tracker {path}</span>
      </div>
      <button className="theme-toggle" onClick={toggleTheme} type="button" aria-label="Toggle theme">
        {theme === "dark" ? "☀ Light" : "🌙 Dark"}
      </button>
    </div>
  );
}
