// ============================================
// App.js — Main Application with Routing
// ============================================
// 📚 LEARNING NOTES:
//
// What is React Router?
// → A library that enables navigation between "pages" in React
// → React is a Single Page Application (SPA) — only 1 HTML file
// → React Router swaps components based on the URL
//
// Key components:
// → <BrowserRouter> = wraps the app, enables routing
// → <Routes>        = container for route definitions
// → <Route>         = maps a URL path to a component
// → <Navigate>      = redirects to another path
//
// Phase 2 additions:
// → /clients/:id route — dynamic route with URL parameter
// → Mobile sidebar toggle with hamburger button
// → Sidebar closes on navigation for mobile
// ============================================

import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { useState, useEffect } from 'react';

// Components
import Sidebar from './components/Sidebar';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import ClientDetail from './pages/ClientDetail';
import Settings from './pages/Settings';

// Layout for authenticated pages (with sidebar)
function AppLayout() {
  const [theme, setTheme] = useState(localStorage.getItem('coachos_theme') || 'light');
  const [sidebarOpen, setSidebarOpen] = useState(false);  // 📚 Mobile sidebar state
  const location = useLocation();  // 📚 Track current URL

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('coachos_theme', theme);
  }, [theme]);

  // 📚 Close sidebar when navigating (mobile only)
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <div className="app-layout">
      {/* Mobile hamburger button */}
      <button
        className="mobile-menu-btn"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label="Toggle menu"
      >
        {sidebarOpen ? '✕' : '☰'}
      </button>

      {/* Sidebar overlay for mobile */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      <Sidebar
        onThemeToggle={toggleTheme}
        theme={theme}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/clients" element={<Clients />} />
          <Route path="/clients/:id" element={<ClientDetail />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </main>
    </div>
  );
}

// Auth redirect — if already logged in, go to dashboard
function AuthRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null;
  if (isAuthenticated) return <Navigate to="/" replace />;
  return children;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes (login/signup) */}
          <Route path="/login" element={<AuthRoute><Login /></AuthRoute>} />
          <Route path="/signup" element={<AuthRoute><Signup /></AuthRoute>} />

          {/* Protected routes (need login) */}
          <Route path="/*" element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          } />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
