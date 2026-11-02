import React from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Mail, Server, LogOut, CheckCircle2 } from 'lucide-react';

export function ProfileModal({ onClose }) {
  const { user, logout, backendStatus } = useAuth();

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card pulse-modal profile-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>User Profile</h3>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {/* User Profile Header */}
          <div className="profile-banner">
            <div className="profile-modal-avatar-circle">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <h4 className="profile-modal-name">{user?.name || 'User'}</h4>
            <span className="profile-modal-about">{user?.about || 'Available'}</span>
          </div>

          {/* Details Section */}
          <div className="profile-info-list">
            <div className="profile-info-item">
              <Mail size={17} className="info-icon text-muted" />
              <div className="info-content">
                <span className="info-label">Email</span>
                <span className="info-value">{user?.email || 'Not specified'}</span>
              </div>
            </div>

            <div className="profile-info-item">
              <Server size={17} className="info-icon text-blue" />
              <div className="info-content">
                <span className="info-label">Server Status</span>
                <span className="info-value">
                  {backendStatus.online ? 'Online' : 'Offline'}
                </span>
              </div>
              <span className={`status-pill ${backendStatus.online ? 'pill-green' : 'pill-amber'}`}>
                {backendStatus.online ? 'Connected' : 'Offline'}
              </span>
            </div>

            <div className="profile-info-item">
              <CheckCircle2 size={17} className="info-icon text-pulse" />
              <div className="info-content">
                <span className="info-label">Account Status</span>
                <span className="info-value">Active</span>
              </div>
            </div>
          </div>

          <div className="profile-actions-row">
            <button
              type="button"
              className="btn-danger-pulse"
              onClick={() => {
                logout();
                onClose();
              }}
            >
              <LogOut size={16} />
              <span>Sign Out</span>
            </button>
            <button type="button" className="btn-secondary" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
