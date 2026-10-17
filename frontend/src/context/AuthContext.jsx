import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('nexus_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('nexus_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifySession = async () => {
      const storedToken = localStorage.getItem('nexus_token');
      if (storedToken) {
        try {
          const res = await api.get('/api/auth/me');
          setUser(res.data);
          localStorage.setItem('nexus_user', JSON.stringify(res.data));
        } catch (err) {
          logout();
        }
      }
      setLoading(false);
    };
    verifySession();
  }, []);

  const login = async (email, password, rememberMe = false) => {
    const res = await api.post('/api/auth/login', {
      email,
      password,
      remember_me: rememberMe,
    });
    const { access_token, user: userData } = res.data;
    setToken(access_token);
    setUser(userData);
    localStorage.setItem('nexus_token', access_token);
    localStorage.setItem('nexus_user', JSON.stringify(userData));
    return userData;
  };

  const signup = async (companyName, fullName, email, password) => {
    const res = await api.post('/api/auth/signup', {
      company_name: companyName,
      full_name: fullName,
      email,
      password,
    });
    return res.data;
  };

  const verifyOtp = async (email, otp) => {
    const res = await api.post('/api/auth/verify-otp', {
      email,
      otp,
    });
    const { access_token, user: userData } = res.data;
    setToken(access_token);
    setUser(userData);
    localStorage.setItem('nexus_token', access_token);
    localStorage.setItem('nexus_user', JSON.stringify(userData));
    return userData;
  };

  const resendOtp = async (email) => {
    const res = await api.post('/api/auth/resend-otp', { email });
    return res.data;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('nexus_token');
    localStorage.removeItem('nexus_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        signup,
        verifyOtp,
        resendOtp,
        logout,
        isAuthenticated: !!token && !!user,
      }}
    >
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
