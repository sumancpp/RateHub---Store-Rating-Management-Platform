import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      const res = await api.get('/auth/me');
      if (res.status === 'success' && res.data.user) {
        setUser(res.data.user);
      } else {
        setUser(null);
      }
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  async function login(email, password) {
    const res = await api.post('/auth/login', { email, password });
    if (res.status === 'success' && res.data.user) {
      setUser(res.data.user);
      return res.data.user;
    }
    throw new Error(res.message || 'Login failed');
  }

  async function register(userData) {
    const res = await api.post('/auth/register', userData);
    if (res.status === 'success' && res.data.user) {
      setUser(res.data.user);
      return res.data.user;
    }
    throw new Error(res.message || 'Registration failed');
  }

  async function logout() {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      // Ignore logout errors
    } finally {
      setUser(null);
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
