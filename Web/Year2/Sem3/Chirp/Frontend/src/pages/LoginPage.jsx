import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Feather, Lock, Mail, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function LoginPage() {
  const { login, isLoading, error, setError } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Please fill in both email and password');
      return;
    }

    const res = await login(email.trim(), password);
    if (res.success) {
      navigate('/');
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card">
        {/* Brand Header */}
        <div className="auth-brand-col">
          <div className="logo-bubble-large">
            <Feather size={36} className="auth-bird-icon" />
          </div>
          <h1 className="auth-title">Welcome back to Chirp</h1>
          <p className="auth-subtitle">The short-post pulse for our college campus</p>
        </div>

        {error && (
          <div className="auth-error-banner">
            <AlertCircle size={17} />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">College Email</label>
            <div className="input-with-icon">
              <Mail size={18} className="input-left-icon" />
              <input
                type="email"
                className="form-input"
                placeholder="you@college.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="input-with-icon">
              <Lock size={18} className="input-left-icon" />
              <input
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="auth-submit-btn"
            disabled={isLoading}
          >
            {isLoading ? <span className="spinner-sm" /> : 'Log In to Chirp'}
          </button>
        </form>

        <div className="auth-footer-prompt">
          <span>Don't have a campus account? </span>
          <Link to="/signup" className="auth-link">
            Join Chirp
          </Link>
        </div>
      </div>
    </div>
  );
}
