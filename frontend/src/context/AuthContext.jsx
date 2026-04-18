import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

const TOKEN_KEY   = 'ltcc_token';
const USER_KEY    = 'ltcc_user';
const PROFILE_KEY = 'ltcc_profile';

export const AuthProvider = ({ children }) => {
  const [token,   setToken  ] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [user,    setUser   ] = useState(() => {
    try { return JSON.parse(localStorage.getItem(USER_KEY)); } catch { return null; }
  });
  const [profile, setProfile] = useState(() => {
    try { return JSON.parse(localStorage.getItem(PROFILE_KEY)); } catch { return null; }
  });
  const [loading, setLoading] = useState(false);

  // Set axios default auth header whenever token changes
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    try {
      const { data } = await axios.post('/api/auth/login', { email, password });
      const { token: tok, user: u, profile: p } = data.data;

      localStorage.setItem(TOKEN_KEY,   tok);
      localStorage.setItem(USER_KEY,    JSON.stringify(u));
      localStorage.setItem(PROFILE_KEY, JSON.stringify(p));

      setToken(tok);
      setUser(u);
      setProfile(p);

      return { success: true, role: u.role };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Login failed',
      };
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(PROFILE_KEY);
    setToken(null);
    setUser(null);
    setProfile(null);
    delete axios.defaults.headers.common['Authorization'];
  }, []);

  const isAuthenticated = !!token && !!user;

  return (
    <AuthContext.Provider value={{ token, user, profile, loading, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
