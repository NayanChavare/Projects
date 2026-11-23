import React, { useState, useEffect } from 'react';
import { setupRecaptcha, sendOtpToPhone } from '../services/firebase';
import { Phone, ShieldCheck, X, Loader2, KeyRound } from 'lucide-react';

export function PhoneOtpModal({ isOpen, onClose, onSuccess, initialPhone = '', userDetails = null }) {
  const [phone, setPhone] = useState(initialPhone);
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('phone'); // 'phone' | 'otp'
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialPhone) {
      setPhone(initialPhone);
    }
  }, [initialPhone]);

  useEffect(() => {
    if (!isOpen) {
      setStep('phone');
      setOtp('');
      setError('');
      setLoading(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSendOtp = async (e) => {
    e?.preventDefault();
    setError('');

    const trimmed = phone.trim();
    if (!trimmed) {
      setError('Please enter your mobile phone number with country code');
      return;
    }
    if (!trimmed.startsWith('+')) {
      setError('Please include country code, e.g., +91 9876543210');
      return;
    }

    setLoading(true);
    try {
      const appVerifier = setupRecaptcha('recaptcha-container');
      const confirmation = await sendOtpToPhone(trimmed, appVerifier);
      setConfirmationResult(confirmation);
      setStep('otp');
      setLoading(false);
    } catch (err) {
      console.error('OTP Send error:', err);
      let msg = err.message || 'Failed to send OTP. Please try again.';
      if (err.code === 'auth/invalid-phone-number') {
        msg = 'Invalid phone number format. Include country code (e.g. +91...)';
      } else if (err.code === 'auth/too-many-requests') {
        msg = 'Too many requests. Please wait a moment before trying again.';
      } else if (err.code === 'auth/quota-exceeded') {
        msg = 'SMS quota exceeded for today on Firebase free plan.';
      }
      setError(msg);
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e?.preventDefault();
    setError('');

    const trimmedOtp = otp.trim();
    if (!trimmedOtp || trimmedOtp.length < 6) {
      setError('Please enter the 6-digit OTP sent to your phone');
      return;
    }

    if (!confirmationResult) {
      setError('Session expired. Please request a new OTP.');
      setStep('phone');
      return;
    }

    setLoading(true);
    try {
      const result = await confirmationResult.confirm(trimmedOtp);
      const firebaseUser = result.user;

      // Call success callback with verified details
      if (onSuccess) {
        await onSuccess({
          phone: firebaseUser.phoneNumber || phone,
          uid: firebaseUser.uid,
          userDetails,
        });
      }
      setLoading(false);
      onClose();
    } catch (err) {
      console.error('OTP verification error:', err);
      setError(err.code === 'auth/invalid-verification-code' ? 'Incorrect OTP. Please check and try again.' : (err.message || 'Verification failed'));
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-card phone-otp-modal-card">
        <div className="modal-header">
          <div className="modal-title-row">
            <div className="feature-icon-bubble emerald">
              <Phone size={18} />
            </div>
            <h3>{step === 'phone' ? 'Verify Phone Number' : 'Enter 6-Digit OTP'}</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose} title="Close">
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {error && (
            <div className="auth-alert error-alert" style={{ marginBottom: '14px' }}>
              <span>{error}</span>
            </div>
          )}

          {step === 'phone' ? (
            <form onSubmit={handleSendOtp} className="auth-form">
              <p className="modal-subtitle">
                {userDetails?.isGoogle
                  ? `Hi ${userDetails.name || 'there'}, please verify your mobile number with OTP to complete your Google account setup.`
                  : 'Enter your phone number with your country code to receive a one-time verification code via SMS.'}
              </p>

              <div className="input-group">
                <label>Phone Number (with Country Code)</label>
                <div className="input-wrapper">
                  <Phone size={18} className="field-icon" />
                  <input
                    type="tel"
                    placeholder="e.g. +91 9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Must start with '+' followed by country code (e.g. +91, +1, +44)
                </span>
              </div>

              {/* Invisible Recaptcha Container */}
              <div id="recaptcha-container"></div>

              <div className="modal-footer" style={{ marginTop: '16px' }}>
                <button type="button" className="btn-secondary" onClick={onClose}>
                  Cancel
                </button>
                <button type="submit" disabled={loading} className="btn-primary-pulse" style={{ width: 'auto', padding: '0 20px' }}>
                  {loading ? (
                    <>
                      <Loader2 size={16} className="spinner-loader" style={{ marginRight: '6px' }} />
                      Sending OTP...
                    </>
                  ) : (
                    <>
                      <ShieldCheck size={16} style={{ marginRight: '6px' }} />
                      Send OTP
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="auth-form">
              <p className="modal-subtitle">
                We sent a 6-digit verification code to <strong>{phone}</strong>. Enter it below to confirm:
              </p>

              <div className="input-group">
                <label>Enter 6-Digit Code</label>
                <div className="input-wrapper">
                  <KeyRound size={18} className="field-icon" />
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="123456"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                    style={{ letterSpacing: '4px', fontSize: '1.2rem', fontWeight: 'bold' }}
                    required
                    autoFocus
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                <button
                  type="button"
                  style={{ fontSize: '0.8rem', color: 'var(--pulse-primary)', cursor: 'pointer', background: 'none' }}
                  onClick={() => setStep('phone')}
                >
                  Change phone number
                </button>
                <button
                  type="button"
                  style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', cursor: 'pointer', background: 'none' }}
                  onClick={handleSendOtp}
                  disabled={loading}
                >
                  Resend OTP
                </button>
              </div>

              <div className="modal-footer" style={{ marginTop: '16px' }}>
                <button type="button" className="btn-secondary" onClick={onClose}>
                  Cancel
                </button>
                <button type="submit" disabled={loading || otp.length < 6} className="btn-primary-pulse" style={{ width: 'auto', padding: '0 20px' }}>
                  {loading ? (
                    <>
                      <Loader2 size={16} className="spinner-loader" style={{ marginRight: '6px' }} />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <ShieldCheck size={16} style={{ marginRight: '6px' }} />
                      Verify & Sign In
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
