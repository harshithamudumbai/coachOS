// ============================================
// components/ProtectedRoute.js
// ============================================
// 📚 LEARNING NOTES:
//
// What is a Protected Route?
// → A route that only logged-in users can see
// → If not logged in → redirect to /login
// → In React Router, we wrap routes with this component
//
// What is <Navigate>?
// → A React Router component that redirects the user
// → <Navigate to="/login" /> = go to login page
// ============================================

import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="auth-container">
        <div style={{ textAlign: 'center' }}>
          <div className="btn-loading" style={{ width: 40, height: 40, margin: '0 auto' }}></div>
          <p style={{ marginTop: 16, color: 'var(--text-secondary)' }}>Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If authenticated, show the actual page
  return children;
}
