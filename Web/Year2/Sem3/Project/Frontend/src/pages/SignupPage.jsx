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
  Zap,
  Users,
  Radio,
  ShieldCheck,
  CheckCircle,
  AlertCircle,
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
                <h2 className="auth-heading">Create Account</h2>
                <p className="auth-subheading">
                  Register in seconds to connect, collaborate, and chat in real time.
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
                      placeholder="Re-enter your password"
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
                      <span>Create Free Account</span>
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>
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
                  <Zap size={18} />
                </div>
                <div className="feature-content">
                  <h4>Continuous WebSocket Link</h4>
                  <p>Instant direct communication with live message delivery and emoji reactions.</p>
                </div>
              </div>

              <div className="feature-item">
                <div className="feature-icon-circle">
                  <Users size={18} />
                </div>
                <div className="feature-content">
                  <h4>Collaborative Group Chats</h4>
                  <p>Create project & study rooms with your peers and message all members in real-time.</p>
                </div>
              </div>

              <div className="feature-item">
                <div className="feature-icon-circle">
                  <Radio size={18} />
                </div>
                <div className="feature-content">
                  <h4>Live Presence & Typing</h4>
                  <p>See exactly when classmates are online and get notified when someone is typing.</p>
                </div>
              </div>

              <div className="feature-item">
                <div className="feature-icon-circle">
                  <ShieldCheck size={18} />
                </div>
                <div className="feature-content">
                  <h4>Secure & Protected</h4>
                  <p>Encrypted data transfer and authenticated token sessions for safe chatting.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
