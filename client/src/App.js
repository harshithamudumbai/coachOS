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
// Layout pattern:
// → Some pages have a sidebar (dashboard, clients)
// → Some pages don't (login, signup)
// → We use different layouts for each
// ============================================

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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
import Settings from './pages/Settings';

// Layout for authenticated pages (with sidebar)
function AppLayout() {
  const [theme, setTheme] = useState(localStorage.getItem('coachos_theme') || 'light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('coachos_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <div className="app-layout">
      <Sidebar onThemeToggle={toggleTheme} theme={theme} />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/clients" element={<Clients />} />
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
