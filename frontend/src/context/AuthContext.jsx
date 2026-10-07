import React, { createContext, useState, useEffect, useContext } from 'react';
import API from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  // Fetch current user on load if token exists
  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          const res = await API.get('/auth/me');
          if (res.data && res.data.success) {
            setCurrentUser(res.data.data);
          } else {
            handleLogoutState();
          }
        } catch (error) {
          console.error('Failed to load user profile', error);
          handleLogoutState();
        }
      }
      setLoading(false);
    };
    loadUser();
  }, [token]);

  const handleLogoutState = () => {
    localStorage.removeItem('token');
    setToken(null);
    setCurrentUser(null);
  };

  // Login handler
  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await API.post('/auth/login', { email, password });
      if (res.data && res.data.success) {
        const { token: userToken, data } = res.data;
        localStorage.setItem('token', userToken);
        setToken(userToken);
        setCurrentUser(data);
        return { success: true, user: data };
      }
      return { success: false, message: 'Login failed' };
    } catch (error) {
      const msg = error.response?.data?.message || 'Invalid email or password';
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  // Register handler
  const register = async (userData) => {
    setLoading(true);
    try {
      const res = await API.post('/auth/register', userData);
      if (res.data && res.data.success) {
        const { token: userToken, data } = res.data;
        localStorage.setItem('token', userToken);
        setToken(userToken);
        setCurrentUser(data);
        return { success: true, message: res.data.message, user: data };
      }
      return { success: false, message: 'Registration failed' };
    } catch (error) {
      const msg = error.response?.data?.message || 'Registration failed';
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  // Logout handler
  const logout = async () => {
    setLoading(true);
    try {
      await API.post('/auth/logout');
    } catch (err) {
      console.warn('Logout API warning:', err);
    } finally {
      handleLogoutState();
      setLoading(false);
    }
  };

  // Profile update handler
  const refreshUser = async () => {
    try {
      const res = await API.get('/auth/me');
      if (res.data && res.data.success) {
        setCurrentUser(res.data.data);
      }
    } catch (err) {
      console.error('Error refreshing user data:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        token,
        loading,
        login,
        register,
        logout,
        refreshUser,
        isAuthenticated: !!currentUser,
        role: currentUser?.role || null,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
