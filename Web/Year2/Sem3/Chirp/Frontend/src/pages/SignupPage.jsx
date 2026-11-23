import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Feather, Lock, Mail, User, ShieldCheck, AtSign, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function SignupPage() {
  const { register, isLoading, error, setError } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [handle, setHandle] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user'); // 'user' | 'admin'
  const [bio, setBio] = useState('');

  const isHandleError = error && (error.toLowerCase().includes('username') || error.toLowerCase().includes('handle'));
  const isEmailError = error && error.toLowerCase().includes('email');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password) {
      setError('Please fill in name, email, and password');
      return;
    }

    const cleanHandle = handle.trim()
      ? handle.trim().toLowerCase().replace(/[^a-z0-9_]/g, '')
      : email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '');

    const res = await register({
      name: name.trim(),
      email: email.trim(),
      password,
      handle: cleanHandle,
      role,
      bio: bio.trim() || 'College Chirper 🎓',
    });

    if (res.success) {
      navigate('/');
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card signup-card">
        {/* Brand Header */}
        <div className="auth-brand-col">
          <div className="logo-bubble-large">
            <Feather size={36} className="auth-bird-icon" />
          </div>
          <h1 className="auth-title">Join Campus Chirp</h1>
          <p className="auth-subtitle">Connect, post updates, and see what's trending</p>
        </div>

        {error && (
          <div className="auth-error-banner">
            <AlertCircle size={17} />
            <span>{error}</span>
          </div>
        )}

        {/* Signup Form */}
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-row-2">
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div className="input-with-icon">
                <User size={18} className="input-left-icon" />
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Maya Chen"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (error) setError(null);
                  }}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                Campus Handle (@)
                {isHandleError && <span className="label-error-tag"> — choose another username</span>}
              </label>
              <div className="input-with-icon">
                <AtSign size={18} className="input-left-icon" />
                <input
                  type="text"
                  className={`form-input ${isHandleError ? 'input-field-error' : ''}`}
                  placeholder="maya_c"
                  value={handle}
                  onChange={(e) => {
                    setHandle(e.target.value);
                    if (error) setError(null);
                  }}
                />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">
              College Email
              {isEmailError && <span className="label-error-tag"> — email already registered</span>}
            </label>
            <div className="input-with-icon">
              <Mail size={18} className="input-left-icon" />
              <input
                type="email"
                className={`form-input ${isEmailError ? 'input-field-error' : ''}`}
                placeholder="maya@college.edu"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError(null);
                }}
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
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError(null);
                }}
                required
              />
            </div>
          </div>

          {/* Role Selection (RBAC requirement) */}
          <div className="form-group">
            <label className="form-label">Campus Role (RBAC)</label>
            <div className="role-selector-row">
              <label className={`role-radio-label ${role === 'user' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="role"
                  value="user"
                  checked={role === 'user'}
                  onChange={() => setRole('user')}
                />
                <span className="role-radio-title">Student (User)</span>
                <span className="role-radio-desc">Post chirps, follow peers, like & reply</span>
              </label>

              <label className={`role-radio-label ${role === 'admin' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="role"
                  value="admin"
                  checked={role === 'admin'}
                  onChange={() => setRole('admin')}
                />
                <span className="role-radio-title">
                  <ShieldCheck size={14} /> Campus Admin
                </span>
                <span className="role-radio-desc">Full RBAC moderation & user management</span>
              </label>
            </div>
          </div>

          <button
            type="submit"
            className="auth-submit-btn"
            disabled={isLoading}
          >
            {isLoading ? <span className="spinner-sm" /> : 'Create Chirp Account'}
          </button>
        </form>

        <div className="auth-footer-prompt">
          <span>Already registered on Chirp? </span>
          <Link to="/login" className="auth-link">
            Log In
          </Link>
        </div>
      </div>
    </div>
  );
}
