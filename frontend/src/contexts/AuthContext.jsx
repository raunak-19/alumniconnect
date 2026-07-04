import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext(null);

import { API_URL } from '../services/api';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('alumniconnect_token');
    const savedUser = localStorage.getItem('alumniconnect_user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const persistSession = (userData, jwtToken) => {
    localStorage.setItem('alumniconnect_token', jwtToken);
    localStorage.setItem('alumniconnect_user', JSON.stringify(userData));
    setToken(jwtToken);
    setUser(userData);
  };

  const register = async ({ email, password, name, department, graduationYear, accountType }) => {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name, department, graduationYear, accountType }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Registration failed.');
    persistSession(data.user, data.token);
    return data.user;
  };

  const login = async (email, password) => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed.');
    persistSession(data.user, data.token);
    return data.user;
  };

  const continueAsGuest = () => {
    const guestUser = { id: 'guest', role: 'guest', name: 'Guest Visitor', email: null };
    localStorage.setItem('alumniconnect_user', JSON.stringify(guestUser));
    localStorage.removeItem('alumniconnect_token');
    setUser(guestUser);
    setToken(null);
  };

  const logout = () => {
    localStorage.removeItem('alumniconnect_token');
    localStorage.removeItem('alumniconnect_user');
    setUser(null);
    setToken(null);
  };

  const updateUser = (updates) => {
    const updated = { ...user, ...updates };
    localStorage.setItem('alumniconnect_user', JSON.stringify(updated));
    setUser(updated);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, continueAsGuest, logout, updateUser }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
