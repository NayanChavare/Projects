import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, registerUser, verifyDashboard, checkBackendStatus, searchUsersByEmail } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('pulsechat_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('pulsechat_token') || null);
  const [backendStatus, setBackendStatus] = useState({ online: false, message: 'Checking...' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Poll backend health status periodically
  useEffect(() => {
    let mounted = true;

    async function checkHealth() {
      const status = await checkBackendStatus();
      if (mounted) {
        setBackendStatus(status);
      }
    }

    checkHealth();
    const interval = setInterval(checkHealth, 8000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  // Validate session token on mount
  useEffect(() => {
    if (token) {
      verifyDashboard(token).then((res) => {
        if (!res.success) {
          console.warn('Session expired, logging out');
          logout();
        }
      });
    }
  }, [token]);

  const login = async (email, password) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await loginUser({ email, password });
      if (result.success && result.token) {
        setToken(result.token);

        // Fetch user's registered name from MongoDB Atlas
        let resolvedName = '';
        try {
          const searchRes = await searchUsersByEmail(email);
          const found = (searchRes.users || []).find((u) => u.email.toLowerCase() === email.toLowerCase());
          if (found && found.name) {
            resolvedName = found.name;
          }
        } catch {
          // Fallback to email prefix if search is unavailable
        }

        if (!resolvedName) {
          const username = email.split('@')[0];
          resolvedName = username.charAt(0).toUpperCase() + username.slice(1);
        }

        const userData = {
          name: resolvedName,
          email: email,
          avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(resolvedName)}`,
          about: 'Available on PulseChat',
        };
        setUser(userData);
        localStorage.setItem('pulsechat_token', result.token);
        localStorage.setItem('pulsechat_user', JSON.stringify(userData));
        setIsLoading(false);
        return { success: true };
      } else {
        setIsLoading(false);
        setError(result.message);
        return { success: false, message: result.message };
      }
    } catch (err) {
      setIsLoading(false);
      setError(err.message || 'Login failed');
      return { success: false, message: err.message };
    }
  };

  const register = async (name, email, password) => {
    setIsLoading(true);
    setError(null);
    try {
      const regResult = await registerUser({ name, email, password });
      if (regResult.success) {
        // Automatically log in after registration in MongoDB Atlas
        const loginRes = await loginUser({ email, password });
        if (loginRes.success && loginRes.token) {
          setToken(loginRes.token);
          const userData = {
            name,
            email,
            avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
            about: 'Available on PulseChat',
          };
          setUser(userData);
          localStorage.setItem('pulsechat_token', loginRes.token);
          localStorage.setItem('pulsechat_user', JSON.stringify(userData));
          setIsLoading(false);
          return { success: true, message: regResult.message };
        }
        setIsLoading(false);
        return { success: true, message: regResult.message, requiresLogin: true };
      } else {
        setIsLoading(false);
        setError(regResult.message);
        return { success: false, message: regResult.message };
      }
    } catch (err) {
      setIsLoading(false);
      setError(err.message || 'Registration failed');
      return { success: false, message: err.message };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('pulsechat_user');
    localStorage.removeItem('pulsechat_token');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        backendStatus,
        isLoading,
        error,
        setError,
        login,
        register,
        logout,
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
