import React, { useState } from 'react';
import { X, Save, AlertCircle, RefreshCw } from 'lucide-react';
import { updateUserProfile } from '../services/api';
import { useAuth } from '../context/AuthContext';

export function EditProfileModal({ isOpen, onClose, onProfileUpdated }) {
  const { user, updateUserInState } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [handle, setHandle] = useState(user?.handle || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [avatarSeed, setAvatarSeed] = useState(user?.name || 'student');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const currentAvatar = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(avatarSeed)}`;

  const handleRandomizeAvatar = () => {
    const random = Math.random().toString(36).substring(7);
    setAvatarSeed(random);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Name cannot be empty');
      return;
    }

    setIsSaving(true);
    setError('');

    try {
      const res = await updateUserProfile({
        name: name.trim(),
        handle: handle.trim(),
        bio: bio.trim(),
        avatar: currentAvatar,
      });

      if (res.ok && res.data?.user) {
        updateUserInState(res.data.user);
        if (onProfileUpdated) onProfileUpdated(res.data.user);
        onClose();
      } else {
        setError(res.data?.msg || 'Failed to update profile');
      }
    } catch (err) {
      setError(err.message || 'Error updating profile');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card edit-profile-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Edit Campus Profile</h2>
          <button type="button" className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSave} className="modal-form">
          {error && (
            <div className="modal-error-box">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {/* Avatar Preview & Randomizer */}
          <div className="avatar-preview-section">
            <img src={currentAvatar} alt="Avatar preview" className="avatar-big-preview" />
            <button
              type="button"
              className="randomize-avatar-btn"
              onClick={handleRandomizeAvatar}
            >
              <RefreshCw size={15} /> Randomize Avatar
            </button>
          </div>

          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              className="form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Campus Handle (@username)</label>
            <input
              type="text"
              className="form-input"
              value={handle}
              onChange={(e) => setHandle(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
              placeholder="e.g. alex_cs"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Bio (Max 160 characters)</label>
            <textarea
              className="form-textarea"
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={160}
              placeholder="Your college major, clubs, hobbies..."
            />
            <span className="char-count-sub">{160 - bio.length} chars left</span>
          </div>

          <div className="modal-actions-row">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
