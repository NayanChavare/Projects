import React from 'react';
import { ArrowUp, Sparkles } from 'lucide-react';
import { useSocket } from '../context/SocketContext';

export function NewPostsBadge({ onApplyNewPosts }) {
  const { newPostsCount, clearNewPostsQueue } = useSocket();

  if (newPostsCount === 0) return null;

  const handleClick = () => {
    const freshPosts = clearNewPostsQueue();
    if (onApplyNewPosts) {
      onApplyNewPosts(freshPosts);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="new-posts-badge-container">
      <button
        type="button"
        className="new-posts-pill-btn"
        onClick={handleClick}
      >
        <ArrowUp size={16} className="badge-arrow-anim" />
        <span>
          Show {newPostsCount} new {newPostsCount === 1 ? 'chirp' : 'chirps'}
        </span>
        <Sparkles size={14} className="badge-sparkle" />
      </button>
    </div>
  );
}
