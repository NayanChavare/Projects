import React, { useState } from 'react';
import { Phone, X, ArrowRight, ShieldCheck } from 'lucide-react';

export function PhoneInputModal({ isOpen, onClose, onSubmit, userDetails = null }) {
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e?.preventDefault();
    setError('');

    const trimmed = phone.trim();
    if (!trimmed) {
      setError('Please enter your mobile phone number');
      return;
    }

    // Basic length validation (at least 7 digits)
    const digitsOnly = trimmed.replace(/[^0-9]/g, '');
    if (digitsOnly.length < 7) {
      setError('Please enter a valid phone number (e.g. +91 9876543210)');
      return;
    }

    setLoading(true);
    try {
      onSubmit({ phone: trimmed, userDetails });
    } catch (err) {
      setError(err.message || 'Failed to submit phone number');
      setLoading(false);
    }
  };

  return (
    <div className="phone-otp-modal-backdrop" onClick={onClose}>
      <div
        className="phone-otp-modal-card animate-scale-up"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '420px', width: '90%' }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: 'rgba(59, 130, 246, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#3b82f6',
              }}
            >
              <Phone size={22} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 600, color: 'var(--text-primary, #fff)' }}>
                Mobile Phone Number
              </h3>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary, #9ca3af)' }}>
                {userDetails?.name ? `Welcome, ${userDetails.name}!` : 'Link your mobile phone'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-secondary, #9ca3af)',
              cursor: 'pointer',
              padding: '6px',
            }}
          >
            <X size={20} />
          </button>
        </div>

        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary, #cbd5e1)', marginBottom: '16px', lineHeight: 1.5 }}>
          Enter your phone number so contacts can discover and message you on PulseChat.
        </p>

        {error && (
          <div
            style={{
              padding: '10px 14px',
              borderRadius: '8px',
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#f87171',
              fontSize: '0.85rem',
              marginBottom: '16px',
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label
              style={{
                display: 'block',
                fontSize: '0.825rem',
                fontWeight: 500,
                color: 'var(--text-secondary, #94a3b8)',
                marginBottom: '6px',
              }}
            >
              Phone Number
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="tel"
                placeholder="e.g. +91 9876543210"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  if (error) setError('');
                }}
                autoFocus
                style={{
                  width: '100%',
                  padding: '12px 14px 12px 40px',
                  borderRadius: '10px',
                  background: 'var(--bg-secondary, rgba(255, 255, 255, 0.06))',
                  border: '1px solid var(--border-color, rgba(255, 255, 255, 0.12))',
                  color: 'var(--text-primary, #fff)',
                  fontSize: '0.95rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
              <Phone
                size={18}
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#94a3b8',
                }}
              />
            </div>
            <span style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px', display: 'block' }}>
              Include your country code (e.g. +91 for India, +1 for US).
            </span>
          </div>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              style={{
                padding: '10px 18px',
                borderRadius: '8px',
                background: 'transparent',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: 'var(--text-secondary, #94a3b8)',
                fontSize: '0.875rem',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 22px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
                border: 'none',
                color: '#fff',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
              }}
            >
              <span>{loading ? 'Saving...' : 'Continue'}</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </form>

        <div
          style={{
            marginTop: '16px',
            paddingTop: '12px',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.75rem',
            color: '#64748b',
          }}
        >
          <ShieldCheck size={14} color="#10b981" />
          <span>Your phone number is stored securely on PulseChat.</span>
        </div>
      </div>
    </div>
  );
}
