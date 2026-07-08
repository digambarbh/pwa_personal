import { useTracker } from "../TrackerContext";
import { Sun, Moon } from "lucide-react";

export default function TermHeader({ path }) {
  const { theme, toggleTheme, toggleHideMode } = useTracker();

  return (
    <div className="term-header">
      <div className="term-header-left">
        <span className="dot r"></span>
        <span className="dot y"></span>
        <span className="dot g"></span>
        <span 
          className="term-title" 
          onClick={toggleHideMode} 
          style={{ cursor: "default", userSelect: "none" }}
        >
          digs-space {path}
        </span>
      </div>
      <button className="theme-toggle" onClick={toggleTheme} type="button" aria-label="Toggle theme" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: 'none', color: 'var(--text)', cursor: 'pointer', padding: '4px' }}>
        {theme === "dark" ? <Sun size={18} strokeWidth={2.5} /> : <Moon size={18} strokeWidth={2.5} />}
      </button>
    </div>
  );
}
