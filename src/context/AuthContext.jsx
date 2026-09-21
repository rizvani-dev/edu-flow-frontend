import { createContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import API from '../api/axiosInstance';
import { clearUserCache } from '../utils/localStorageCache';
import { getDefaultRouteByRole } from '../utils/roleRedirect';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (!token || !savedUser) return null;

    try {
      return JSON.parse(savedUser);
    } catch {
      localStorage.removeItem('user');
      return null;
    }
  });
  const navigate = useNavigate();

  useEffect(() => {
    const handleUnauthorized = () => {
      clearUserCache(user?.id);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      navigate('/login');
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);

    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, [navigate, user?.id]);

  // Login Function
  const login = async (email, password) => {
    try {
      const { data } = await API.post('/auth/login', { email, password });

      if (data.success) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        setUser(data.user);
        toast.success(`Welcome back, ${data.user.name}!`);

        // Redirect based on role
        navigate(getDefaultRouteByRole(data.user.role));
        return true;
      }
    } catch (error) {
      const message =
        error.response?.data?.message ||
        (error.response?.status >= 500
          ? 'The backend is running, but authentication is misconfigured on the server.'
          : 'Login failed');
      toast.error(message);
      return false;
    }
  };

  // Logout Function
  const logout = () => {
    clearUserCache(user?.id);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    toast('Logged out successfully', { icon: '👋' });
    navigate('/login');
  };

  const value = {
    user,
    loading: false,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
