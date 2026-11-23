import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  loginUser,
  registerUser,
  googleAuthUser,
  fetchCurrentUser,
  checkBackendStatus,
  setAuthTokens,
  clearAuthTokens,
  getToken,
} from '../services/api';
import { signInWithGooglePopup } from '../services/firebase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('chirp_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => getToken());
  const [backendStatus, setBackendStatus] = useState({ online: false, checking: true });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Health check polling
  useEffect(() => {
    let mounted = true;
    async function ping() {
      const res = await checkBackendStatus();
      if (mounted) {
        setBackendStatus({ online: res.online, checking: false });
      }
    }
    ping();
    const interval = setInterval(ping, 10000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  // Fetch / refresh current user profile on token change or startup
  const refreshUser = useCallback(async () => {
    const currentToken = getToken();
    if (!currentToken) {
      setUser(null);
      return;
    }
    const res = await fetchCurrentUser();
    if (res.ok && res.data?.user) {
      setUser(res.data.user);
      localStorage.setItem('chirp_user', JSON.stringify(res.data.user));
    } else if (res.status === 401) {
      logout();
    }
  }, []);

  useEffect(() => {
    if (token) {
      refreshUser();
    }
  }, [token, refreshUser]);

  const login = async (email, password) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await loginUser({ email, password });
      setIsLoading(false);

      if (res.ok && res.data?.token) {
        setAuthTokens(res.data.token, res.data.refreshToken);
        setToken(res.data.token);
        setUser(res.data.user);
        localStorage.setItem('chirp_user', JSON.stringify(res.data.user));
        return { success: true, user: res.data.user };
      } else {
        const msg = res.data?.msg || 'Invalid email or password';
        setError(msg);
        return { success: false, message: msg };
      }
    } catch (err) {
      setIsLoading(false);
      setError(err.message || 'Login failed');
      return { success: false, message: err.message };
    }
  };

  const register = async ({ name, email, password, role = 'user', bio, handle }) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await registerUser({ name, email, password, role, bio, handle });
      setIsLoading(false);

      if (res.ok && res.data?.token) {
        setAuthTokens(res.data.token, res.data.refreshToken);
        setToken(res.data.token);
        setUser(res.data.user);
        localStorage.setItem('chirp_user', JSON.stringify(res.data.user));
        return { success: true, user: res.data.user };
      } else {
        const msg = res.data?.msg || 'Registration failed';
        setError(msg);
        return { success: false, message: msg };
      }
    } catch (err) {
      setIsLoading(false);
      setError(err.message || 'Registration failed');
      return { success: false, message: err.message };
    }
  };

  // Google / Firebase Authentication
  const loginWithGoogle = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const credential = await signInWithGooglePopup();
      const googleUser = credential.user;

      if (!googleUser || !googleUser.email) {
        throw new Error('Could not retrieve email from Google');
      }

      const res = await googleAuthUser({
        email: googleUser.email,
        name: googleUser.displayName || googleUser.email.split('@')[0],
        avatar: googleUser.photoURL || '',
        uid: googleUser.uid,
      });

      setIsLoading(false);

      if (res.ok && res.data?.token) {
        setAuthTokens(res.data.token, res.data.refreshToken);
        setToken(res.data.token);
        setUser(res.data.user);
        localStorage.setItem('chirp_user', JSON.stringify(res.data.user));
        return { success: true, user: res.data.user };
      } else {
        const msg = res.data?.msg || 'Google Authentication failed';
        setError(msg);
        return { success: false, message: msg };
      }
    } catch (err) {
      setIsLoading(false);
      // Suppress standard popup closed by user notice or report error
      if (err.code === 'auth/popup-closed-by-user') {
        return { success: false, cancelled: true };
      }
      const msg = err.message || 'Google Sign-In failed';
      setError(msg);
      return { success: false, message: msg };
    }
  };

  const logout = () => {
    clearAuthTokens();
    setUser(null);
    setToken(null);
    setError(null);
  };

  const updateUserInState = (updatedUser) => {
    setUser((prev) => {
      const merged = { ...prev, ...updatedUser };
      localStorage.setItem('chirp_user', JSON.stringify(merged));
      return merged;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isAdmin: user?.role === 'admin',
        backendStatus,
        isLoading,
        error,
        setError,
        login,
        register,
        loginWithGoogle,
        logout,
        refreshUser,
        updateUserInState,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
