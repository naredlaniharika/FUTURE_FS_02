import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

// Configure axios base URL
const API_URL = import.meta.env.DEV ? 'http://localhost:5000' : '';
axios.defaults.baseURL = API_URL;

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('crm_token');
    const saved = localStorage.getItem('crm_admin');
    if (token && saved) {
      setAdmin(JSON.parse(saved));
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const res = await axios.post('/api/auth/login', { email, password });
    localStorage.setItem('crm_token', res.data.token);
    localStorage.setItem('crm_admin', JSON.stringify({ name: res.data.name, email: res.data.email }));
    axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
    setAdmin({ name: res.data.name, email: res.data.email });
  };

  const register = async (name, email, password) => {
    const res = await axios.post('/api/auth/register', { name, email, password });
    localStorage.setItem('crm_token', res.data.token);
    localStorage.setItem('crm_admin', JSON.stringify({ name: res.data.name, email: res.data.email }));
    axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
    setAdmin({ name: res.data.name, email: res.data.email });
  };

  const logout = () => {
    localStorage.removeItem('crm_token');
    localStorage.removeItem('crm_admin');
    delete axios.defaults.headers.common['Authorization'];
    setAdmin(null);
  };

  return (
    <AuthContext.Provider value={{ admin, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
