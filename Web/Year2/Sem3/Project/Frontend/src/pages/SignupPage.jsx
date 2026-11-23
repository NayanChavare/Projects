import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { signInWithGoogle } from '../services/firebase';
import { PhoneInputModal } from '../components/PhoneInputModal';
import {
  MessageSquare,
  ArrowRight,
  Lock,
  Mail,
  User,
  Eye,
  EyeOff,
  Server,
  Zap,
  Users,
  Radio,
  ShieldCheck,
  CheckCircle,
  AlertCircle,
  Phone,
  MailCheck,
  RefreshCw,
} from 'lucide-react';

export function SignupPage() {
  const { register, loginWithFirebase, resendVerification, backendStatus, isLoading, error, setError } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [verificationPending, setVerificationPending] = useState(null); // { email }
  const [resendStatus, setResendStatus] = useState('');

  // Phone Modal State for Google Signup
  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false);
  const [pendingGoogleUser, setPendingGoogleUser] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setResendStatus('');

    if (!formData.name.trim()) {
      setError('Please enter your full name');
      return;
    }
    if (!formData.phone.trim()) {
      setError('Please enter your phone number');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (formData.password.length < 4) {
      setError('Password must be at least 4 characters');
      return;
    }

    const res = await register(formData.name, formData.email, formData.password, formData.phone);
    if (res.success) {
      if (res.needsEmailVerification) {
        setVerificationPending({ email: formData.email, password: formData.password });
      } else {
        setSuccessMsg('Account created successfully!');
        setTimeout(() => {
          navigate('/login');
        }, 1200);
      }
    }
  };

  // Google Sign-up flow -> Collects phone number if not present
  const handleGoogleSignUp = async () => {
    setError(null);
    setSuccessMsg('');
    try {
      const gUser = await signInWithGoogle();
      if (!gUser) return;

      if (gUser.phoneNumber) {
        // Phone already present on Google profile
        const res = await loginWithFirebase({
          name: gUser.displayName || gUser.email?.split('@')[0],
          email: gUser.email,
          phone: gUser.phoneNumber,
          uid: gUser.uid,
          authProvider: 'google',
        });
        if (res.success) {
          navigate('/');
        }
      } else {
        // Open clean Phone Input modal to capture phone number
        setPendingGoogleUser({
          name: gUser.displayName || gUser.email?.split('@')[0],
          email: gUser.email,
          uid: gUser.uid,
        });
        setIsPhoneModalOpen(true);
      }
    } catch (err) {
      console.error('Google sign-up error:', err);
      if (err.code !== 'auth/popup-closed-by-user') {
        setError(err.message || 'Google sign-up failed');
      }
    }
  };

  // Callback from PhoneInputModal for Google user
  const handlePhoneSubmitted = async ({ phone, userDetails }) => {
    setIsPhoneModalOpen(false);
    const payload = {
      name: userDetails?.name || pendingGoogleUser?.name,
      email: userDetails?.email || pendingGoogleUser?.email,
      phone: phone,
      uid: userDetails?.uid || pendingGoogleUser?.uid,
      authProvider: 'google',
    };

    const res = await loginWithFirebase(payload);
    if (res.success) {
      navigate('/');
    }
  };

  const handleResendEmail = async () => {
    if (!verificationPending) return;
    setResendStatus('Resending verification email...');
    const res = await resendVerification(verificationPending.email, verificationPending.password);
    setResendStatus(res.message);
  };

  return (
    <div className="auth-overlay">
      <div className="auth-card-container">
        <div className="auth-card">
          {/* Left Form Column */}
          <div className="auth-form-column">
            <div>
              <div className="auth-brand-badge">
                <div className="brand-icon-wrap">
                  <MessageSquare size={22} className="brand-svg" />
                </div>
                <div className="brand-text-col">
                  <span className="brand-title-badge">PulseChat</span>
                  <span className="brand-subtitle-badge">Real-Time Messaging</span>
                </div>
              </div>

              {/* If user just signed up and needs email verification */}
              {verificationPending ? (
                <div style={{ textAlign: 'center', padding: '24px 12px' }}>
                  <div
                    style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '50%',
                      background: 'rgba(59, 130, 246, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 18px',
                      color: '#3b82f6',
                    }}
                  >
                    <MailCheck size={36} />
                  </div>
                  <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '8px', color: 'var(--text-primary, #fff)' }}>
                    Verify Your Email
                  </h2>
                  <p style={{ color: 'var(--text-secondary, #94a3b8)', fontSize: '0.925rem', lineHeight: 1.6, marginBottom: '20px' }}>
                    We sent a verification link to <br />
                    <strong style={{ color: '#60a5fa' }}>{verificationPending.email}</strong>.
                    <br />
                    Please check your inbox (and spam folder) and click the link to activate your account.
                  </p>

                  {resendStatus && (
                    <div
                      style={{
                        padding: '10px',
                        borderRadius: '8px',
                        background: 'rgba(59, 130, 246, 0.1)',
                        color: '#93c5fd',
                        fontSize: '0.85rem',
                        marginBottom: '16px',
                      }}
                    >
                      {resendStatus}
                    </div>
                  )}

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <Link
                      to="/login"
                      className="btn-primary-pulse"
                      style={{ textDecoration: 'none', justifyContent: 'center' }}
                    >
                      <span>Go to Sign In</span>
                      <ArrowRight size={18} />
                    </Link>

                    <button
                      type="button"
                      onClick={handleResendEmail}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        background: 'transparent',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        padding: '10px',
                        borderRadius: '8px',
                        color: 'var(--text-secondary, #94a3b8)',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                      }}
                    >
                      <RefreshCw size={15} />
                      <span>Resend Verification Email</span>
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="auth-header">
                    <h2 className="auth-heading">Create Account</h2>
                    <p className="auth-subheading">
                      Sign up with Google or register with your email and phone number.
                    </p>
                  </div>

                  {/* Server Status Warning if offline */}
                  {!backendStatus.online && (
                    <div className="server-notice-card">
                      <Server size={18} className="notice-icon" />
                      <div className="notice-text">
                        <strong>Backend Server Offline</strong>
                        <p>Waiting for connection to backend...</p>
                      </div>
                    </div>
                  )}

                  {/* Error Alert */}
                  {error && (
                    <div className="auth-alert error-alert">
                      <AlertCircle size={17} style={{ flexShrink: 0 }} />
                      <span>{error}</span>
                    </div>
                  )}

                  {/* Success Alert */}
                  {successMsg && (
                    <div className="auth-alert success-alert">
                      <CheckCircle size={17} style={{ flexShrink: 0 }} />
                      <span>{successMsg}</span>
                    </div>
                  )}

                  {/* Google Quick Auth Button */}
                  <div className="social-auth-cluster">
                    <button
                      type="button"
                      className="btn-social-auth btn-google"
                      onClick={handleGoogleSignUp}
                      disabled={isLoading}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24">
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
                      <span>Sign up with Google</span>
                    </button>
                  </div>

                  <div className="auth-separator">
                    <span>or sign up with email</span>
                  </div>

                  <form onSubmit={handleSubmit} className="auth-form">
                    <div className="input-group">
                      <label htmlFor="signup-name">Full Name</label>
                      <div className="input-wrapper">
                        <User size={18} className="field-icon" />
                        <input
                          id="signup-name"
                          type="text"
                          name="name"
                          placeholder="e.g. Alex Johnson"
                          value={formData.name}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>

                    <div className="input-group">
                      <label htmlFor="signup-phone">Phone Number</label>
                      <div className="input-wrapper">
                        <Phone size={18} className="field-icon" />
                        <input
                          id="signup-phone"
                          type="tel"
                          name="phone"
                          placeholder="e.g. +91 9876543210"
                          value={formData.phone}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>

                    <div className="input-group">
                      <label htmlFor="signup-email">Email Address</label>
                      <div className="input-wrapper">
                        <Mail size={18} className="field-icon" />
                        <input
                          id="signup-email"
                          type="email"
                          name="email"
                          placeholder="e.g. alex@student.edu"
                          value={formData.email}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>

                    <div className="input-group">
                      <label htmlFor="signup-password">Password</label>
                      <div className="input-wrapper">
                        <Lock size={18} className="field-icon" />
                        <input
                          id="signup-password"
                          type={showPassword ? 'text' : 'password'}
                          name="password"
                          placeholder="At least 4 characters"
                          value={formData.password}
                          onChange={handleChange}
                          required
                        />
                        <button
                          type="button"
                          className="password-toggle"
                          onClick={() => setShowPassword(!showPassword)}
                          title={showPassword ? 'Hide password' : 'Show password'}
                        >
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    <div className="input-group">
                      <label htmlFor="signup-confirm-password">Confirm Password</label>
                      <div className="input-wrapper">
                        <Lock size={18} className="field-icon" />
                        <input
                          id="signup-confirm-password"
                          type={showPassword ? 'text' : 'password'}
                          name="confirmPassword"
                          placeholder="Re-enter password"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="btn-primary-pulse"
                    >
                      {isLoading ? (
                        <span className="spinner-loader"></span>
                      ) : (
                        <>
                          <span>Create Account & Verify</span>
                          <ArrowRight size={18} />
                        </>
                      )}
                    </button>
                  </form>
                </>
              )}
            </div>

            <div className="auth-switch-row">
              <p>
                Already have an account?{' '}
                <Link to="/login" className="link-btn">
                  Sign In
                </Link>
              </p>
            </div>
          </div>

          {/* Right Info Showcase Column */}
          <div className="auth-info-column">
            <div className="auth-info-header">
              <div className="brand-logo-badge">
                <MessageSquare size={28} />
              </div>
              <h3>PulseChat Platform</h3>
              <p>Simple, continuous, real-time messaging designed for students.</p>
            </div>

            <div className="features-list">
              <div className="feature-item">
                <div className="feature-icon-circle">
                  <Zap size={16} />
                </div>
                <div className="feature-content">
                  <h4>Live WebSockets</h4>
                  <p>Continuous bi-directional push connection with instant delivery.</p>
                </div>
              </div>

              <div className="feature-item">
                <div className="feature-icon-circle">
                  <Radio size={16} />
                </div>
                <div className="feature-content">
                  <h4>Online Status</h4>
                  <p>Real-time presence indicators show who is online or offline.</p>
                </div>
              </div>

              <div className="feature-item">
                <div className="feature-icon-circle">
                  <Users size={16} />
                </div>
                <div className="feature-content">
                  <h4>Group Channels</h4>
                  <p>Create study groups and collaborate with peers easily.</p>
                </div>
              </div>

              <div className="feature-item">
                <div className="feature-icon-circle">
                  <ShieldCheck size={16} />
                </div>
                <div className="feature-content">
                  <h4>Verified Accounts</h4>
                  <p>Protected with email verification and verified Google authentication.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Phone Input Modal for Google Signups */}
      <PhoneInputModal
        isOpen={isPhoneModalOpen}
        onClose={() => setIsPhoneModalOpen(false)}
        onSubmit={handlePhoneSubmitted}
        userDetails={pendingGoogleUser}
      />
    </div>
  );
}
