'use client';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { auth as authApi } from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    const token = localStorage.getItem('wfu_token');
    if (!token) { setLoading(false); return; }
    try {
      const data = await authApi.me();
      setUser(data);
    } catch {
      localStorage.removeItem('wfu_token');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadUser(); }, [loadUser]);

  const login = async (email, password) => {
    const data = await authApi.login({ email, password });
    localStorage.setItem('wfu_token', data.token);
    setUser(data.student);
    return data;
  };

  const register = async (formData) => {
    const data = await authApi.register(formData);
    localStorage.setItem('wfu_token', data.token);
    setUser(data.student);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('wfu_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
