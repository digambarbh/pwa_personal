import { NavLink } from "react-router-dom";

const items = [
  { to: "/", icon: "▣", label: "Home", end: true },
  { to: "/roadmap", icon: "☰", label: "Roadmap" },
  { to: "/learning", icon: "📖", label: "Notes" },
  { to: "/companies", icon: "🏢", label: "Companies" },
  { to: "/journey", icon: "◈", label: "Journey" },
  { to: "/settings", icon: "⚙", label: "Settings" },
];

export default function BottomNav() {
  return (
    <nav className="bottom-nav">
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={({ isActive }) => "nav-item" + (isActive ? " active" : "")}
        >
          <span className="nav-icon">{item.icon}</span>
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
