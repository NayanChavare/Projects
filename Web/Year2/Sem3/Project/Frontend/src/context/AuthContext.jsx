import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, registerUser, verifyDashboard, checkBackendStatus, searchUsersByEmail, syncFirebaseAuthUser } from '../services/api';
import {
  auth,
  registerWithEmailFirebase,
  loginWithEmailFirebase,
  resendVerificationLink,
  signOut,
} from '../services/firebase';

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
      // 1. Try Firebase Authentication first to enforce email verification
      let firebaseUser = null;
      let fbError = null;
      try {
        firebaseUser = await loginWithEmailFirebase(email, password);
      } catch (err) {
        fbError = err;
      }

      if (firebaseUser) {
        // Enforce email verification
        if (!firebaseUser.emailVerified) {
          try {
            await signOut(auth);
          } catch {}
          setIsLoading(false);
          const errMsg = 'Please verify your email before logging in. Check your inbox (or spam) for the verification link.';
          setError(errMsg);
          return {
            success: false,
            unverified: true,
            email: firebaseUser.email,
            message: errMsg,
          };
        }

        // Email verified! Sync with MongoDB Atlas backend
        const syncResult = await syncFirebaseAuthUser({
          name: firebaseUser.displayName || email.split('@')[0],
          email: firebaseUser.email,
          uid: firebaseUser.uid,
          authProvider: 'email',
        });

        if (syncResult.success && syncResult.token) {
          setToken(syncResult.token);
          const resolvedName = syncResult.user?.name || firebaseUser.displayName || email.split('@')[0];
          const userData = {
            name: resolvedName,
            email: syncResult.user?.email || firebaseUser.email,
            phone: syncResult.user?.phone || '',
            avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(resolvedName)}`,
            about: 'Available on PulseChat',
          };
          setUser(userData);
          localStorage.setItem('pulsechat_token', syncResult.token);
          localStorage.setItem('pulsechat_user', JSON.stringify(userData));
          setIsLoading(false);
          return { success: true };
        }
      }

      // 2. Fallback to direct backend login for legacy MongoDB accounts
      const result = await loginUser({ email, password });
      if (result.success && result.token) {
        setToken(result.token);

        let resolvedName = result.user?.name || '';
        if (!resolvedName) {
          try {
            const searchRes = await searchUsersByEmail(email);
            const found = (searchRes.users || []).find((u) => u.email.toLowerCase() === email.toLowerCase());
            if (found && found.name) resolvedName = found.name;
          } catch {}
        }
        if (!resolvedName) {
          const username = email.split('@')[0];
          resolvedName = username.charAt(0).toUpperCase() + username.slice(1);
        }

        const userData = {
          name: resolvedName,
          email: email,
          phone: result.user?.phone || '',
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
        const displayErr = fbError?.message || result.message || 'Login failed';
        setError(displayErr);
        return { success: false, message: displayErr };
      }
    } catch (err) {
      setIsLoading(false);
      setError(err.message || 'Login failed');
      return { success: false, message: err.message };
    }
  };

  const register = async (name, email, password, phone) => {
    setIsLoading(true);
    setError(null);
    try {
      // 1. Create account in Firebase and dispatch email verification link
      let fbCreated = false;
      try {
        await registerWithEmailFirebase(email, password, name);
        fbCreated = true;
      } catch (fbErr) {
        if (fbErr.code === 'auth/email-already-in-use') {
          setIsLoading(false);
          setError('An account with this email already exists.');
          return { success: false, message: 'An account with this email already exists.' };
        }
        console.warn('Firebase registration notice:', fbErr);
      }

      // 2. Save user profile & phone in MongoDB Atlas backend
      const regResult = await registerUser({ name, email, password, phone });

      // Automatically sign out of Firebase session until user verifies email
      try {
        await signOut(auth);
      } catch {}

      setIsLoading(false);
      return {
        success: true,
        needsEmailVerification: fbCreated,
        email,
        message: 'Account created! Please check your email inbox to verify your account before logging in.',
      };
    } catch (err) {
      setIsLoading(false);
      setError(err.message || 'Registration failed');
      return { success: false, message: err.message };
    }
  };

  const resendVerification = async (email, password) => {
    try {
      const u = await loginWithEmailFirebase(email, password);
      if (u) {
        await resendVerificationLink(u);
        await signOut(auth);
        return { success: true, message: 'Verification link resent to your email!' };
      }
      return { success: false, message: 'Could not find user' };
    } catch (e) {
      return { success: false, message: e.message || 'Could not resend email verification' };
    }
  };

  const loginWithFirebase = async (payload) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await syncFirebaseAuthUser(payload);
      if (result.success && result.token) {
        setToken(result.token);
        const resolvedName = result.user?.name || payload.name || payload.email?.split('@')[0] || payload.phone || 'PulseChat User';
        const phoneFormatted = (payload.phone || '').replace(/[^0-9]/g, '');
        const resolvedEmail = result.user?.email || payload.email || `${phoneFormatted}@pulsechat.phone`;

        const userData = {
          name: resolvedName,
          email: resolvedEmail,
          phone: result.user?.phone || payload.phone || '',
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
      setError(err.message || 'Firebase login failed');
      return { success: false, message: err.message };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('pulsechat_user');
    localStorage.removeItem('pulsechat_token');
    try {
      signOut(auth);
    } catch {}
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
        resendVerification,
        loginWithFirebase,
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
