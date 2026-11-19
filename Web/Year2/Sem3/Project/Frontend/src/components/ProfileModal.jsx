import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import { X, Mail, Server, LogOut, CheckCircle2, Users, Shield, Circle } from 'lucide-react';

export function ProfileModal({ onClose, targetProfile }) {
  const { user, logout, backendStatus } = useAuth();
  const { isUserOnline } = useChat();

  // If no targetProfile provided or target is current user, it is self profile
  const isSelf = !targetProfile || (!targetProfile.isGroup && targetProfile.email?.toLowerCase() === user?.email?.toLowerCase());
  const isGroup = !!targetProfile?.isGroup;

  // Resolved display values
  const profileName = isSelf
    ? user?.name || 'My Profile'
    : targetProfile?.name || targetProfile?.email?.split('@')[0] || 'User';

  const profileEmail = isSelf ? user?.email : targetProfile?.email;
  const profileAvatar = isSelf ? user?.avatar : targetProfile?.avatar;
  const isOnline = !isGroup && !isSelf && isUserOnline(profileEmail);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card pulse-modal profile-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{isGroup ? 'Group Information' : isSelf ? 'My Profile' : 'Contact Information'}</h3>
          <button className="modal-close-btn" onClick={onClose} title="Close">
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {/* Profile Banner */}
          <div className="profile-banner">
            <div className="profile-modal-avatar-circle" style={{ position: 'relative' }}>
              {isGroup ? (
                <Users size={32} />
              ) : profileAvatar ? (
                <img
                  src={profileAvatar}
                  alt={profileName}
                  style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                />
              ) : (
                profileName.charAt(0).toUpperCase()
              )}
              {!isGroup && !isSelf && (
                <span
                  style={{
                    position: 'absolute',
                    bottom: '2px',
                    right: '2px',
                    width: '14px',
                    height: '14px',
                    borderRadius: '50%',
                    backgroundColor: isOnline ? '#22c55e' : '#9ca3af',
                    border: '2px solid #fff',
                  }}
                  title={isOnline ? 'Online' : 'Offline'}
                ></span>
              )}
            </div>
            <h4 className="profile-modal-name">{profileName}</h4>
            <span className="profile-modal-about">
              {isGroup
                ? `${(targetProfile.members || []).length} members`
                : isSelf
                ? user?.about || 'Available on PulseChat'
                : isOnline
                ? 'Online now'
                : 'Offline'}
            </span>
          </div>

          {/* Details Section */}
          <div className="profile-info-list">
            {isGroup ? (
              <>
                <div className="profile-info-item">
                  <Users size={17} className="info-icon text-muted" />
                  <div className="info-content">
                    <span className="info-label">Group Description</span>
                    <span className="info-value">
                      {targetProfile.description || 'No description provided.'}
                    </span>
                  </div>
                </div>

                <div className="profile-info-item">
                  <Shield size={17} className="info-icon text-blue" />
                  <div className="info-content">
                    <span className="info-label">Created By</span>
                    <span className="info-value">{targetProfile.creator}</span>
                  </div>
                </div>

                <div className="profile-info-item" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <Users size={17} className="info-icon text-muted" />
                    <span className="info-label">Members ({(targetProfile.members || []).length})</span>
                  </div>
                  <div
                    style={{
                      maxHeight: '140px',
                      overflowY: 'auto',
                      border: '1px solid var(--border-light, #e2e8f0)',
                      borderRadius: '8px',
                      padding: '4px',
                    }}
                  >
                    {(targetProfile.members || []).map((mEmail) => {
                      const mOnline = isUserOnline(mEmail);
                      const isMe = mEmail.toLowerCase() === user?.email?.toLowerCase();
                      return (
                        <div
                          key={mEmail}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '6px 10px',
                            borderRadius: '6px',
                            backgroundColor: isMe ? 'rgba(37, 99, 235, 0.08)' : 'transparent',
                            marginBottom: '2px',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span
                              style={{
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                backgroundColor: isMe || mOnline ? '#22c55e' : '#9ca3af',
                              }}
                            ></span>
                            <span style={{ fontSize: '13px', fontWeight: isMe ? 600 : 400 }}>
                              {mEmail} {isMe && '(You)'}
                            </span>
                          </div>
                          <span style={{ fontSize: '11px', color: mOnline || isMe ? '#22c55e' : '#9ca3af' }}>
                            {isMe || mOnline ? 'Online' : 'Offline'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="profile-info-item">
                  <Mail size={17} className="info-icon text-muted" />
                  <div className="info-content">
                    <span className="info-label">Email Address</span>
                    <span className="info-value">{profileEmail || 'Not specified'}</span>
                  </div>
                </div>

                <div className="profile-info-item">
                  <Circle
                    size={17}
                    className="info-icon"
                    style={{ color: isSelf || isOnline ? '#22c55e' : '#9ca3af' }}
                  />
                  <div className="info-content">
                    <span className="info-label">Presence</span>
                    <span className="info-value">
                      {isSelf || isOnline ? 'Online' : 'Offline'}
                    </span>
                  </div>
                  <span
                    className={`status-pill ${
                      isSelf || isOnline ? 'pill-green' : 'pill-amber'
                    }`}
                  >
                    {isSelf || isOnline ? 'Online' : 'Offline'}
                  </span>
                </div>

                {isSelf && (
                  <div className="profile-info-item">
                    <Server size={17} className="info-icon text-blue" />
                    <div className="info-content">
                      <span className="info-label">Server Connection</span>
                      <span className="info-value">
                        {backendStatus.online ? 'Backend Connected' : 'Offline'}
                      </span>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="profile-actions-row">
            {isSelf ? (
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
            ) : null}
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
              style={{ width: isSelf ? 'auto' : '100%' }}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
