// ============================================
// context/AuthContext.js — Global Auth State
// ============================================
// 📚 LEARNING NOTES:
//
// What is React Context?
// → A way to share data across ALL components without passing props
// → Think of it as a "global variable" for React
// → Without Context: App → passes token to Dashboard → passes to ClientList → passes to...
// → With Context: Any component can directly read the auth state!
//
// What is useContext?
// → A React Hook that reads a Context value
// → const { coach, login, logout } = useContext(AuthContext)
//
// What is a Provider?
// → A component that PROVIDES the context value to its children
// → Wrap your app in <AuthProvider> and all children can access it
//
// What is localStorage?
// → Browser storage that persists even after page refresh
// → We store the JWT token here so the user stays logged in
// ============================================

import { createContext, useContext, useState, useEffect } from 'react';

// Step 1: Create the Context
const AuthContext = createContext(null);

// Step 2: Create the Provider component
export function AuthProvider({ children }) {
  const [coach, setCoach] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('coachos_token'));
  const [loading, setLoading] = useState(true);

  const API_URL = 'http://localhost:3000/api';

  // On app load, check if there's a saved token and fetch profile
  useEffect(() => {
    if (token) {
      fetchProfile();
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch current coach's profile using stored token
  const fetchProfile = async () => {
    try {
      const res = await fetch(`${API_URL}/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        setCoach(data);
      } else {
        // Token is invalid/expired — clear it
        logout();
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  // Login function — called from Login page
  const login = async (email, password) => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'Login failed');
    }

    // Save token and coach data
    localStorage.setItem('coachos_token', data.token);
    setToken(data.token);
    setCoach(data.coach);
    return data;
  };

  // Signup function — called from Signup page
  const signup = async (formData) => {
    const res = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'Signup failed');
    }

    // Save token and coach data
    localStorage.setItem('coachos_token', data.token);
    setToken(data.token);
    setCoach(data.coach);
    return data;
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('coachos_token');
    setToken(null);
    setCoach(null);
  };

  // Helper for making authenticated API calls
  const authFetch = async (url, options = {}) => {
    const res = await fetch(`${API_URL}${url}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      }
    });
    return res;
  };

  // The value that ALL children can access
  const value = {
    coach,
    token,
    loading,
    login,
    signup,
    logout,
    authFetch,
    isAuthenticated: !!token && !!coach,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Step 3: Custom hook for easy access
// Instead of: useContext(AuthContext)
// You write:  useAuth()
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
