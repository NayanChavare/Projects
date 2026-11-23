import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Feather,
  Lock,
  Mail,
  User,
  ShieldCheck,
  AtSign,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { checkFirebaseEmailVerified, resendVerificationEmail } from '../services/firebase';

export function SignupPage() {
  const { register, completeVerification, loginWithGoogle, isLoading, error, setError } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [handle, setHandle] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user'); // 'user' | 'admin'
  const [bio, setBio] = useState('');

  // Email verification gate state
  const [emailSentNotice, setEmailSentNotice] = useState(false);
  const [pendingAuth, setPendingAuth] = useState(null);
  const [checkingVerification, setCheckingVerification] = useState(false);
  const [verificationFeedback, setVerificationFeedback] = useState('');
  const [resending, setResending] = useState(false);

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

    if (res.success && res.pendingAuth) {
      // Hold pending credentials in component state until email is confirmed
      setPendingAuth(res.pendingAuth);
      setEmailSentNotice(true);
      setVerificationFeedback('');
    }
  };

  const handleGoogleSignup = async () => {
    const res = await loginWithGoogle();
    if (res.success) {
      navigate('/');
    }
  };

  /**
   * User clicks "I Have Verified My Email"
   * Query Firebase to confirm user clicked the link in their email
   */
  const handleConfirmVerification = async () => {
    setCheckingVerification(true);
    setVerificationFeedback('');

    try {
      const isVerified = await checkFirebaseEmailVerified(email.trim(), password);

      if (isVerified) {
        // Email is confirmed in Firebase! Activate user session and enter app
        completeVerification(pendingAuth);
        navigate('/');
      } else {
        setVerificationFeedback(
          "We haven't received your confirmation yet. Please open the verification email in your inbox and click the link, then try again."
        );
      }
    } catch (err) {
      console.error('Verification check error:', err);
      setVerificationFeedback('Could not check verification status. Please make sure you clicked the link in your email.');
    } finally {
      setCheckingVerification(false);
    }
  };

  const handleResendEmail = async () => {
    setResending(true);
    setVerificationFeedback('');
    try {
      await resendVerificationEmail();
      setVerificationFeedback('A fresh verification link has been resent to your inbox!');
    } catch (err) {
      setVerificationFeedback('Could not resend email. Please wait a moment and try again.');
    } finally {
      setResending(false);
    }
  };

  // If email verification was sent, display strict verification barrier
  if (emailSentNotice) {
    return (
      <div className="auth-page-container">
        <div className="auth-card signup-card email-sent-card">
          <div className="email-sent-icon-wrap">
            <CheckCircle2 size={54} className="email-sent-icon" />
          </div>
          <h2 className="auth-title">Verify Your Email Address</h2>
          <p className="auth-subtitle">
            A Firebase verification email has been sent to:
          </p>
          <div className="email-highlight-box">
            <Mail size={18} />
            <strong>{email}</strong>
          </div>

          <p className="email-sent-instructions">
            Please check your inbox (or spam folder) and click the verification link. Once clicked, press the button below to activate your account.
          </p>

          {verificationFeedback && (
            <div className={`verification-feedback-box ${verificationFeedback.includes('fresh') ? 'success' : 'warn'}`}>
              <AlertCircle size={16} />
              <span>{verificationFeedback}</span>
            </div>
          )}

          <div className="verification-actions-group">
            <button
              type="button"
              className="auth-submit-btn confirm-verify-btn"
              onClick={handleConfirmVerification}
              disabled={checkingVerification}
            >
              {checkingVerification ? (
                <>
                  <RefreshCw size={18} className="spinning" />
                  <span>Checking Email Status...</span>
                </>
              ) : (
                <>
                  <span>I've Verified My Email</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>

            <button
              type="button"
              className="resend-link-btn"
              onClick={handleResendEmail}
              disabled={resending}
            >
              {resending ? 'Sending...' : 'Resend verification email'}
            </button>
          </div>
        </div>
      </div>
    );
  }

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

        {/* Google One-Click Auth Button */}
        <button
          type="button"
          className="google-auth-btn"
          onClick={handleGoogleSignup}
          disabled={isLoading}
        >
          <svg className="google-icon-svg" viewBox="0 0 24 24" width="20" height="20">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>

        <div className="auth-divider">
          <span>or sign up with email</span>
        </div>

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
            {isLoading ? <span className="spinner-sm" /> : 'Create Chirp Account & Verify Email'}
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
