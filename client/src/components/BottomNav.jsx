import { NavLink } from "react-router-dom";
import { Home, Map, BookOpen, Building2, MapPin, Settings } from "lucide-react";

const items = [
  { to: "/", icon: Home, end: true },
  { to: "/roadmap", icon: Map },
  { to: "/learning", icon: BookOpen },
  { to: "/companies", icon: Building2 },
  { to: "/journey", icon: MapPin },
  { to: "/settings", icon: Settings },
];

export default function BottomNav() {
  return (
    <nav className="bottom-nav">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) => "nav-item" + (isActive ? " active" : "")}
          >
            {({ isActive }) => (
              <Icon 
                size={28} 
                strokeWidth={isActive ? 2.5 : 2} 
                className="nav-icon"
                style={{ 
                  color: isActive ? 'var(--green)' : 'var(--text)',
                  transition: 'all 0.2s ease'
                }} 
              />
            )}
          </NavLink>
        );
      })}
    </nav>
  );
}
