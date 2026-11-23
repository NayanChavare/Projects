import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { signInWithGoogle } from '../services/firebase';
import { PhoneOtpModal } from '../components/PhoneOtpModal';
import {
  MessageSquare,
  ArrowRight,
  Lock,
  Mail,
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
} from 'lucide-react';

export function LoginPage() {
  const { login, loginWithFirebase, backendStatus, isLoading, error, setError } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Phone OTP Modal State
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [otpModalUser, setOtpModalUser] = useState(null);
  const [otpInitialPhone, setOtpInitialPhone] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg('');

    const res = await login(formData.email, formData.password);
    if (res.success) {
      setSuccessMsg('Logged in successfully!');
      setTimeout(() => {
        navigate('/');
      }, 300);
    }
  };

  // Google Sign-in flow -> Requires Phone verification
  const handleGoogleSignIn = async () => {
    setError(null);
    setSuccessMsg('');
    try {
      const gUser = await signInWithGoogle();
      if (!gUser) return;

      // Google authenticated. If user already has phone, sync immediately; otherwise prompt OTP modal
      if (gUser.phoneNumber) {
        const res = await loginWithFirebase({
          name: gUser.displayName || gUser.email?.split('@')[0],
          email: gUser.email,
          phone: gUser.phoneNumber,
          uid: gUser.uid,
          authProvider: 'google',
        });
        if (res.success) {
          setSuccessMsg('Authenticated with Google!');
          setTimeout(() => navigate('/'), 300);
        }
      } else {
        // Open OTP modal to verify phone number for this Google user
        setOtpModalUser({
          name: gUser.displayName || gUser.email?.split('@')[0],
          email: gUser.email,
          uid: gUser.uid,
          isGoogle: true,
        });
        setOtpInitialPhone('');
        setIsOtpModalOpen(true);
      }
    } catch (err) {
      console.error('Google sign-in error:', err);
      if (err.code !== 'auth/popup-closed-by-user') {
        setError(err.message || 'Google sign-in failed');
      }
    }
  };

  // Direct Phone OTP Login
  const handleOpenPhoneLogin = () => {
    setError(null);
    setSuccessMsg('');
    setOtpModalUser(null);
    setOtpInitialPhone('');
    setIsOtpModalOpen(true);
  };

  // Callback when Phone OTP is verified
  const handleOtpVerified = async ({ phone, uid, userDetails }) => {
    const payload = userDetails?.isGoogle
      ? {
          name: userDetails.name,
          email: userDetails.email,
          phone: phone,
          uid: userDetails.uid,
          authProvider: 'google',
        }
      : {
          name: phone,
          email: `${phone.replace(/[^0-9]/g, '')}@pulsechat.phone`,
          phone: phone,
          uid: uid,
          authProvider: 'phone',
        };

    const res = await loginWithFirebase(payload);
    if (res.success) {
      setSuccessMsg('Phone verified & logged in successfully!');
      setTimeout(() => navigate('/'), 300);
    }
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

              <div className="auth-header">
                <h2 className="auth-heading">Sign In</h2>
                <p className="auth-subheading">
                  Welcome back! Sign in via Google, Phone OTP, or your registered credentials.
                </p>
              </div>

              {/* Server Status Warning if offline */}
              {!backendStatus.online && (
                <div className="server-notice-card">
                  <Server size={18} className="notice-icon" />
                  <div className="notice-text">
                    <strong>Backend Server Offline</strong>
                    <p>Start the server in <code>Backend/</code> on port 8080.</p>
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

              {/* Google & Phone Quick Auth Buttons */}
              <div className="social-auth-cluster">
                <button
                  type="button"
                  className="btn-social-auth btn-google"
                  onClick={handleGoogleSignIn}
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
                  <span>Continue with Google</span>
                </button>

                <button
                  type="button"
                  className="btn-social-auth btn-phone"
                  onClick={handleOpenPhoneLogin}
                  disabled={isLoading}
                >
                  <Phone size={17} color="#059669" />
                  <span>Sign in with Phone (OTP)</span>
                </button>
              </div>

              <div className="auth-separator">
                <span>or with password</span>
              </div>

              <form onSubmit={handleSubmit} className="auth-form">
                <div className="input-group">
                  <label htmlFor="login-email">Email Address</label>
                  <div className="input-wrapper">
                    <Mail size={18} className="field-icon" />
                    <input
                      id="login-email"
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
                  <label htmlFor="login-password">Password</label>
                  <div className="input-wrapper">
                    <Lock size={18} className="field-icon" />
                    <input
                      id="login-password"
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      placeholder="Enter your password"
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

                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary-pulse"
                >
                  {isLoading ? (
                    <span className="spinner-loader"></span>
                  ) : (
                    <>
                      <span>Sign In to Account</span>
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>
            </div>

            <div className="auth-switch-row">
              <p>
                Don't have an account yet?{' '}
                <Link to="/signup" className="link-btn">
                  Create Account
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
                  <h4>Secure Phone & Google Auth</h4>
                  <p>Two-factor verified registration with Firebase SMS OTP.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Phone OTP Modal */}
      <PhoneOtpModal
        isOpen={isOtpModalOpen}
        onClose={() => setIsOtpModalOpen(false)}
        onSuccess={handleOtpVerified}
        initialPhone={otpInitialPhone}
        userDetails={otpModalUser}
      />
    </div>
  );
}
