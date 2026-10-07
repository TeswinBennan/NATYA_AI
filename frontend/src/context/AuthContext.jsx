import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, registerUser, getCurrentUser } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('natyaa_user');
    try {
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('natyaa_token'));
  const [loading, setLoading] = useState(true);

  // Validate session on mount
  useEffect(() => {
    const checkSession = async () => {
      if (token) {
        try {
          const profile = await getCurrentUser();
          setUser(profile);
          localStorage.setItem('natyaa_user', JSON.stringify(profile));
        } catch (err) {
          console.error("Session expired or invalid:", err);
          logout();
        }
      }
      setLoading(false);
    };

    checkSession();
  }, [token]);

  const login = async (email, password) => {
    const res = await loginUser({ email, password });
    if (res.token) {
      localStorage.setItem('natyaa_token', res.token);
      setToken(res.token);
      if (res.user) {
        setUser(res.user);
        localStorage.setItem('natyaa_user', JSON.stringify(res.user));
      }
    }
    return res;
  };

  const register = async (userData) => {
    const res = await registerUser(userData);
    if (res.token) {
      localStorage.setItem('natyaa_token', res.token);
      setToken(res.token);
      if (res.user) {
        setUser(res.user);
        localStorage.setItem('natyaa_user', JSON.stringify(res.user));
      }
    }
    return res;
  };

  const logout = () => {
    localStorage.removeItem('natyaa_token');
    localStorage.removeItem('natyaa_user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        loading,
        login,
        register,
        logout,
        setUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
