// ============================================
// pages/Signup.js — Signup Page
// ============================================
// 📚 LEARNING NOTES:
//
// Multi-field forms:
// → Instead of separate useState for each field, you can use ONE object:
//   const [form, setForm] = useState({ name: '', email: '' })
// → Update: setForm({ ...form, name: 'new value' })
//   The "..." is the spread operator — copies all existing values
//   then overwrites just the one you changed
//
// [e.target.name]: e.target.value
// → This is a "computed property name"
// → If input has name="email", it becomes { email: "typed value" }
// → One handler works for ALL inputs!
// ============================================

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Signup() {
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    password: '',
    business_name: '',
    specialization: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { signup } = useAuth();
  const navigate = useNavigate();

  // 📚 One handler for all inputs — uses the input's "name" attribute
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Client-side validation
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      await signup(form);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-logo">
          <h1>🧑‍⚕️ CoachOS</h1>
          <p>Start managing clients like a pro</p>
        </div>

        <h2>Create your account</h2>

        {error && (
          <div className="alert alert-error">⚠️ {error}</div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="full_name">Full Name *</label>
            <input
              id="full_name"
              name="full_name"
              type="text"
              className="form-input"
              placeholder="Dr. Priya Sharma"
              value={form.full_name}
              onChange={handleChange}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email *</label>
            <input
              id="email"
              name="email"
              type="email"
              className="form-input"
              placeholder="priya@example.com"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password *</label>
            <input
              id="password"
              name="password"
              type="password"
              className="form-input"
              placeholder="Minimum 6 characters"
              value={form.password}
              onChange={handleChange}
              required
              minLength={6}
            />
          </div>

          <div className="form-group">
            <label htmlFor="business_name">Business Name</label>
            <input
              id="business_name"
              name="business_name"
              type="text"
              className="form-input"
              placeholder="FitLife Nutrition (optional)"
              value={form.business_name}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="specialization">Specialization</label>
            <input
              id="specialization"
              name="specialization"
              type="text"
              className="form-input"
              placeholder="Weight Loss, PCOS, Diabetes (optional)"
              value={form.specialization}
              onChange={handleChange}
            />
          </div>

          <button
            type="submit"
            className={`btn btn-primary btn-full ${loading ? 'btn-loading' : ''}`}
            disabled={loading}
            style={{ marginTop: 8 }}
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 24, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>
            Sign in →
          </Link>
        </p>
      </div>
    </div>
  );
}
