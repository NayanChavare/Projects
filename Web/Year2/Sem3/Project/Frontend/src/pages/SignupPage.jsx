import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  MessageSquare,
  ArrowRight,
  Lock,
  Mail,
  User,
  Eye,
  EyeOff,
  Server,
  MessageCircle,
  Zap,
  Shield,
  CheckCircle,
} from 'lucide-react';

export function SignupPage() {
  const { register, backendStatus, isLoading, error, setError } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg('');

    if (!formData.name.trim()) {
      setError('Please enter your full name');
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

    const res = await register(formData.name, formData.email, formData.password);
    if (res.success) {
      setSuccessMsg('Account created successfully!');
      setTimeout(() => {
        navigate('/');
      }, 300);
    }
  };

  return (
    <div className="auth-overlay">
      {/* Brand Top Header Strip */}
      <div className="pulse-top-strip">
        <div className="pulse-brand">
          <div className="brand-icon-wrap">
            <MessageSquare size={26} className="brand-svg" />
          </div>
          <span className="brand-title">PULSECHAT</span>
        </div>
      </div>

      <div className="auth-card-container">
        <div className="auth-card">
          {/* Form Column */}
          <div className="auth-form-column">
            <div className="auth-header">
              <h2 className="auth-heading">Create an Account</h2>
              <p className="auth-subheading">
                Sign up with your details to start connecting on PulseChat
              </p>
            </div>

            {/* Server Status Warning if offline */}
            {!backendStatus.online && (
              <div className="server-notice-card">
                <Server size={18} className="notice-icon" />
                <div className="notice-text">
                  <strong>Server offline on port 8080.</strong>
                  <p>Run <code>npm run server</code> in <code>Backend/</code> to connect.</p>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="auth-alert error-alert">
                <span>{error}</span>
              </div>
            )}

            {/* Success Message */}
            {successMsg && (
              <div className="auth-alert success-alert">
                <CheckCircle size={16} />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="input-group">
                <label htmlFor="signup-name">Full Name</label>
                <div className="input-wrapper">
                  <User size={18} className="field-icon" />
                  <input
                    id="signup-name"
                    type="text"
                    name="name"
                    placeholder="e.g. Nayan Chavare"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    autoFocus
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
                    placeholder="e.g. user@example.com"
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
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
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
                    placeholder="••••••••"
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
                    <span>Sign Up</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            <div className="auth-switch-row">
              <p>
                Already have an account?{' '}
                <Link to="/login" className="link-btn">
                  Sign In
                </Link>
              </p>
            </div>
          </div>

          {/* Right Info Column */}
          <div className="auth-info-column">
            <div className="auth-info-header">
              <div className="brand-logo-badge">
                <MessageSquare size={32} />
              </div>
              <h3>PulseChat</h3>
              <p>Simple, Fast & Secure Messaging</p>
            </div>

            <div className="features-list">
              <div className="feature-item">
                <MessageCircle size={18} className="check-icon" />
                <div>
                  <h4>Direct Messaging</h4>
                  <p>Send and receive messages in real time with read receipts and emoji reactions.</p>
                </div>
              </div>

              <div className="feature-item">
                <Zap size={18} className="check-icon" />
                <div>
                  <h4>Instant Contact Search</h4>
                  <p>Find any user by email and initiate a conversation immediately.</p>
                </div>
              </div>

              <div className="feature-item">
                <Shield size={18} className="check-icon" />
                <div>
                  <h4>Private & Protected</h4>
                  <p>Encrypted credentials and authenticated user sessions.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
