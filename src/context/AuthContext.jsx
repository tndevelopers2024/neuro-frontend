import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../api/axiosInstance.js';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Synchronously initialize session from local storage so refreshing never logs out the user
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('neuromind_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (e) {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('neuromind_token') || null);
  const [loading, setLoading] = useState(true);

  // Background profile synchronization on app boot
  useEffect(() => {
    const syncAuth = async () => {
      const storedToken = localStorage.getItem('neuromind_token');
      const storedUser = localStorage.getItem('neuromind_user');
      if (storedToken && storedUser) {
        try {
          const data = await api.get('/auth/me');
          if (data && data.user) {
            setUser(data.user);
            localStorage.setItem('neuromind_user', JSON.stringify(data.user));
          }
        } catch (error) {
          // If the token is invalid/expired or user was deleted, clear the zombie session
          if (error.success === false && error.message?.includes('Not authorized')) {
            console.warn('Session invalid or expired. Logging out automatically.');
            localStorage.removeItem('neuromind_token');
            localStorage.removeItem('neuromind_user');
            setUser(null);
            setToken(null);
          } else {
            console.warn('Background auth sync encountered a delay. Preserving active session.');
          }
        }
      }
      setLoading(false);
    };
    syncAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      localStorage.setItem('neuromind_token', res.token);
      localStorage.setItem('neuromind_user', JSON.stringify(res.user));
      setToken(res.token);
      setUser(res.user);
      toast.success(`Welcome back, ${res.user.fullName.split(' ')[0]}! 👋`);
      return res;
    } catch (error) {
      toast.error(error.message || 'Login failed. Check your credentials.');
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      const res = await api.post('/auth/register', userData);
      localStorage.setItem('neuromind_token', res.token);
      localStorage.setItem('neuromind_user', JSON.stringify(res.user));
      setToken(res.token);
      setUser(res.user);
      toast.success(`Account created! Welcome to NeuroMind Scholars 🧠`);
      return res;
    } catch (error) {
      toast.error(error.message || 'Registration failed.');
      throw error;
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const res = await api.put('/auth/profile', profileData);
      localStorage.setItem('neuromind_user', JSON.stringify(res.user));
      setUser(res.user);
      toast.success('Profile credentials updated successfully!');
      return res.user;
    } catch (error) {
      toast.error(error.message || 'Failed to update profile.');
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('neuromind_token');
    localStorage.removeItem('neuromind_user');
    setToken(null);
    setUser(null);
    toast('You have been logged out securely.', { icon: '🔒' });
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
        updateProfile,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
