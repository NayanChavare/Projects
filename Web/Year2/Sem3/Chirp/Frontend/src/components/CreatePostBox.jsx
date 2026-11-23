import React, { useState } from 'react';
import { Feather, AlertCircle } from 'lucide-react';
import { createPostApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

export function CreatePostBox({ onPostCreated, placeholder = "What's happening on campus?" }) {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const MAX_CHARS = 280;
  const charsRemaining = MAX_CHARS - content.length;
  const isOverLimit = charsRemaining < 0;
  const isNearLimit = charsRemaining <= 30 && charsRemaining >= 0;
  const canSubmit = content.trim().length > 0 && !isOverLimit && !isSubmitting;

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!canSubmit) return;

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const res = await createPostApi(content.trim());
      if (res.ok && res.data?.post) {
        const createdPost = res.data.post;
        setContent('');

        // Notify parent callback
        if (onPostCreated) {
          onPostCreated(createdPost);
        }

        // Dispatch global event so all active views (Home, Explore, Profile) add the post instantly
        window.dispatchEvent(new CustomEvent('chirp_created', { detail: createdPost }));
      } else {
        setErrorMessage(res.data?.msg || 'Could not post chirp. Please try again.');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Error publishing chirp');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="create-post-card" id="main-chirp-composer">
      <div className="create-post-top">
        <img
          src={user?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.name || 'User'}`}
          alt={user?.name}
          className="composer-avatar"
        />
        <div className="composer-input-wrapper">
          <textarea
            className="composer-textarea"
            placeholder={placeholder}
            rows={3}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            maxLength={350} // slight buffer so user sees warning counter turn red
          />

          {errorMessage && (
            <div className="composer-error">
              <AlertCircle size={15} />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>
      </div>

      <div className="create-post-bottom">
        <div className="composer-meta">
          {/* Character counter (Max 280) */}
          <div
            className={`char-counter ${
              isOverLimit ? 'over-limit' : isNearLimit ? 'near-limit' : ''
            }`}
          >
            <span className="char-number">{charsRemaining}</span>
            <span className="char-label">/ 280</span>
          </div>
        </div>

        <button
          type="button"
          className="composer-submit-btn"
          disabled={!canSubmit}
          onClick={handleSubmit}
        >
          {isSubmitting ? (
            <span className="spinner-sm" />
          ) : (
            <>
              <Feather size={16} />
              <span>Chirp</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
