// ============================================
// components/Sidebar.js — Navigation Sidebar
// ============================================
// 📚 LEARNING NOTES:
//
// What is useLocation()?
// → React Router hook that tells you the current URL
// → Used to highlight the active nav item
//
// What is useNavigate()?
// → React Router hook that lets you programmatically navigate
// → navigate('/clients') → goes to clients page
//
// Phase 2 additions:
// → isOpen prop controls mobile visibility
// → onClose prop lets parent close the sidebar
// → CSS class "open" slides the sidebar in on mobile
// ============================================

import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ onThemeToggle, theme, isOpen, onClose }) {
  const { coach, logout } = useAuth();

  // Get initials for avatar (e.g., "Harshitha M" → "HM")
  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      {/* Logo */}
      <div className="sidebar-header">
        <span style={{ fontSize: '1.5rem' }}>🧑‍⚕️</span>
        <span className="sidebar-logo">CoachOS</span>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <div className="sidebar-section-title">Main</div>
        
        <NavLink to="/" end className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <span className="nav-icon">📊</span>
          <span>Dashboard</span>
        </NavLink>

        <NavLink to="/clients" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <span className="nav-icon">👥</span>
          <span>Clients</span>
        </NavLink>

        <div className="sidebar-section-title">Coming Soon</div>
        
        <div className="nav-item" style={{ opacity: 0.4, cursor: 'default' }}>
          <span className="nav-icon">🥗</span>
          <span>Meal Plans</span>
        </div>

        <div className="nav-item" style={{ opacity: 0.4, cursor: 'default' }}>
          <span className="nav-icon">📅</span>
          <span>Schedule</span>
        </div>

        <div className="nav-item" style={{ opacity: 0.4, cursor: 'default' }}>
          <span className="nav-icon">💳</span>
          <span>Payments</span>
        </div>

        <div className="sidebar-section-title">Settings</div>

        <NavLink to="/settings" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <span className="nav-icon">⚙️</span>
          <span>Settings</span>
        </NavLink>
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        {/* Theme Toggle */}
        <div className="nav-item" onClick={onThemeToggle}>
          <span className="nav-icon">{theme === 'dark' ? '☀️' : '🌙'}</span>
          <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
        </div>

        {/* Logout */}
        <div className="nav-item" onClick={logout} style={{ color: 'var(--error)' }}>
          <span className="nav-icon">🚪</span>
          <span>Logout</span>
        </div>

        {/* Profile */}
        <div className="sidebar-profile">
          <div className="profile-avatar">
            {getInitials(coach?.full_name)}
          </div>
          <div className="profile-info">
            <div className="profile-name">{coach?.full_name}</div>
            <div className="profile-role">{coach?.business_name || 'Health Coach'}</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
