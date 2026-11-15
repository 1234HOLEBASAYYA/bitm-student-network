import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('bitm_token') || null);
  const [loading, setLoading] = useState(true);

  // Initialize user profile on load if token exists
  useEffect(() => {
    const initializeAuth = async () => {
      const savedToken = localStorage.getItem('bitm_token');
      if (savedToken) {
        try {
          const res = await api.get('/auth/me');
          if (res.data.success) {
            setUser(res.data.user);
            localStorage.setItem('bitm_user', JSON.stringify(res.data.user));
          }
        } catch (error) {
          console.error('Session expired or invalid:', error);
          logout();
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (identifier, password) => {
    const res = await api.post('/auth/login', { identifier, password });
    if (res.data.success) {
      setToken(res.data.token);
      setUser(res.data.user);
      localStorage.setItem('bitm_token', res.data.token);
      localStorage.setItem('bitm_user', JSON.stringify(res.data.user));
    }
    return res.data;
  };

  const register = async (formData) => {
    const res = await api.post('/auth/register', formData);
    if (res.data.success) {
      setToken(res.data.token);
      setUser(res.data.user);
      localStorage.setItem('bitm_token', res.data.token);
      localStorage.setItem('bitm_user', JSON.stringify(res.data.user));
    }
    return res.data;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('bitm_token');
    localStorage.removeItem('bitm_user');
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('bitm_user', JSON.stringify(updatedUser));
  };

  const refreshUser = async () => {
    try {
      const res = await api.get('/auth/me');
      if (res.data.success) {
        setUser(res.data.user);
        localStorage.setItem('bitm_user', JSON.stringify(res.data.user));
      }
    } catch (err) {
      console.error('Failed to refresh user profile:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user && !!token,
        isAdmin: user?.role === 'admin',
        login,
        register,
        logout,
        updateUser,
        refreshUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
