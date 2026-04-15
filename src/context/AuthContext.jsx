import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkLogin = async () => {
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          // You can create a /users/me endpoint later if needed
          // For now, assume if there's a token and role is checked locally/saved
          const userData = JSON.parse(localStorage.getItem('user_data'));
          if (userData && userData.role) {
            setUser(userData);
          } else {
            // Validate token or role via API
            const res = await api.get('users/');
            // If the user hit this endpoint, they are likely authenticated
            if (res.data.results && res.data.results.length > 0) {
              const u = res.data.results[0]; // Self user result
              if (u.role) {
                setUser(u);
                localStorage.setItem('user_data', JSON.stringify(u));
              }
            }
          }
        } catch (err) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user_data');
        }
      }
      setLoading(false);
    };
    checkLogin();
  }, []);

  const login = async (email, password) => {
    try {
      console.log('Attempting login for:', email);
      // Django USERNAME_FIELD is 'email', so SimpleJWT expects 'email' key
      const res = await api.post('users/login/', { email, password });
      
      console.log('Login response received:', res.data);
      const { access, refresh, user: userData } = res.data;
      
      if (!userData) {
        throw new Error('Access denied: Invalid user data.');
      }

      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      localStorage.setItem('user_data', JSON.stringify(userData));
      setUser(userData);
      return true;
    } catch (err) {
      console.error('Login error details:', {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message
      });
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_data');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
