// ============================================
// pages/Login.js — Login Page
// ============================================
// 📚 LEARNING NOTES:
//
// What is useState?
// → A React Hook that lets you add state to a component
// → const [email, setEmail] = useState('') 
//   → email = current value, setEmail = function to update it
//
// What is onChange?
// → An event handler that fires when input value changes
// → Every keystroke calls setEmail(e.target.value)
//
// What is onSubmit?
// → An event handler for form submission
// → e.preventDefault() stops the page from refreshing
//
// What is async/await?
// → A way to write asynchronous code that LOOKS synchronous
// → await login(email, password) → waits for the server response
// → Without await: you'd need .then().catch() chains
// ============================================

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  // 📚 State = data that can change and re-renders the component
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault(); // 📚 Prevent page refresh
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/'); // Go to dashboard on success
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        {/* Logo */}
        <div className="auth-logo">
          <h1>🧑‍⚕️ CoachOS</h1>
          <p>Your all-in-one coaching platform</p>
        </div>

        <h2>Welcome back</h2>

        {/* Error Alert */}
        {error && (
          <div className="alert alert-error">
            ⚠️ {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              className="form-input"
              placeholder="coach@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className="form-input"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className={`btn btn-primary btn-full ${loading ? 'btn-loading' : ''}`}
            disabled={loading}
            style={{ marginTop: 8 }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 24, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Don't have an account?{' '}
          <Link to="/signup" style={{ color: 'var(--primary)', fontWeight: 600 }}>
            Create one free →
          </Link>
        </p>
      </div>
    </div>
  );
}
