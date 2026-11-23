import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Heart,
  MessageCircle,
  Share2,
  Trash2,
  ShieldCheck,
  Send,
  Sparkles,
  Check,
} from 'lucide-react';
import { toggleLikePost, addReplyToPost, deletePostApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

// Helper to format date nicely
function formatRelativeTime(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffInSec = Math.floor((now - date) / 1000);

  if (diffInSec < 60) return 'Just now';
  const diffInMin = Math.floor(diffInSec / 60);
  if (diffInMin < 60) return `${diffInMin}m`;
  const diffInHours = Math.floor(diffInMin / 60);
  if (diffInHours < 24) return `${diffInHours}h`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d`;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function PostCard({ post, onDeleteSuccess }) {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  const author = post.author || {};
  const currentUserId = user?._id || user?.id;

  const [isLiked, setIsLiked] = useState(() => {
    return Array.isArray(post.likes) && post.likes.some((id) => (id?._id || id) === currentUserId);
  });
  const [likesCount, setLikesCount] = useState(
    Array.isArray(post.likes) ? post.likes.length : 0
  );
  const [replies, setReplies] = useState(post.replies || []);
  const [showReplies, setShowReplies] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const canDelete = currentUserId === (author._id || author.id) || isAdmin;

  // Handle Like Toggle
  const handleLike = async (e) => {
    e.stopPropagation();
    if (!user) {
      navigate('/login');
      return;
    }

    const prevLiked = isLiked;
    const prevCount = likesCount;

    // Optimistic UI
    setIsLiked(!prevLiked);
    setLikesCount(prevLiked ? prevCount - 1 : prevCount + 1);

    try {
      const res = await toggleLikePost(post._id);
      if (res.ok && res.data) {
        setIsLiked(res.data.isLiked);
        setLikesCount(res.data.likesCount);
      } else {
        // Revert
        setIsLiked(prevLiked);
        setLikesCount(prevCount);
      }
    } catch (err) {
      setIsLiked(prevLiked);
      setLikesCount(prevCount);
    }
  };

  // Handle Submit Reply
  const handleAddReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || isSubmittingReply) return;
    if (!user) {
      navigate('/login');
      return;
    }

    setIsSubmittingReply(true);
    try {
      const res = await addReplyToPost(post._id, replyText.trim());
      if (res.ok && res.data?.replies) {
        setReplies(res.data.replies);
        setReplyText('');
      }
    } catch (err) {
      console.error('Error adding reply:', err);
    } finally {
      setIsSubmittingReply(false);
    }
  };

  // Handle Delete Post
  const handleDelete = async (e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this chirp?')) return;

    setIsDeleting(true);
    try {
      const res = await deletePostApi(post._id);
      if (res.ok) {
        if (onDeleteSuccess) onDeleteSuccess(post._id);
      }
    } catch (err) {
      console.error('Delete error:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  // Copy Post Link
  const handleShare = (e) => {
    e.stopPropagation();
    const url = `${window.location.origin}/profile/${author.handle || author._id}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    });
  };

  // Render text with clickable #hashtags
  const renderFormattedContent = (content) => {
    if (!content) return null;
    const parts = content.split(/(#[a-zA-Z0-9_]+)/g);

    return parts.map((part, index) => {
      if (part.startsWith('#')) {
        const tag = part.substring(1);
        return (
          <span
            key={index}
            className="clickable-hashtag"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/hashtag/${tag.toLowerCase()}`);
            }}
          >
            {part}
          </span>
        );
      }
      return part;
    });
  };

  return (
    <article className="post-card">
      <div className="post-avatar-col">
        <img
          src={
            author.avatar ||
            `https://api.dicebear.com/7.x/initials/svg?seed=${author.name || 'Student'}`
          }
          alt={author.name}
          className="post-avatar"
          onClick={() => navigate(`/profile/${author.handle || author._id}`)}
        />
      </div>

      <div className="post-main-col">
        {/* Post Author Header */}
        <div className="post-header-row">
          <div
            className="post-author-info"
            onClick={() => navigate(`/profile/${author.handle || author._id}`)}
          >
            <span className="post-author-name">{author.name || 'Anonymous Chirper'}</span>
            {author.role === 'admin' && (
              <span className="role-pill admin-pill-small" title="Campus Admin">
                <ShieldCheck size={11} /> Admin
              </span>
            )}
            <span className="post-author-handle">@{author.handle || 'user'}</span>
            <span className="post-time-dot">·</span>
            <span className="post-time">{formatRelativeTime(post.createdAt)}</span>
          </div>

          {/* Delete Option */}
          {canDelete && (
            <button
              type="button"
              className="post-delete-btn"
              onClick={handleDelete}
              disabled={isDeleting}
              title={isAdmin && author._id !== currentUserId ? 'Admin Moderation Delete' : 'Delete Chirp'}
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>

        {/* Post Content (Max 280 chars with clickable hashtags) */}
        <div className="post-body-text">{renderFormattedContent(post.content)}</div>

        {/* Action Buttons Row */}
        <div className="post-actions-row">
          {/* Reply Button */}
          <button
            type="button"
            className={`post-action-btn reply-btn ${showReplies ? 'active' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              setShowReplies(!showReplies);
            }}
          >
            <MessageCircle size={18} />
            <span className="action-count">{replies.length}</span>
          </button>

          {/* Like Button */}
          <button
            type="button"
            className={`post-action-btn like-btn ${isLiked ? 'liked' : ''}`}
            onClick={handleLike}
          >
            <Heart size={18} className={isLiked ? 'heart-filled' : ''} />
            <span className="action-count">{likesCount}</span>
          </button>

          {/* Share Button */}
          <button
            type="button"
            className="post-action-btn share-btn"
            onClick={handleShare}
            title="Copy link"
          >
            {copiedLink ? <Check size={18} className="share-copied" /> : <Share2 size={18} />}
          </button>
        </div>

        {/* Replies Section Drawer */}
        {showReplies && (
          <div className="post-replies-drawer">
            {/* Existing replies */}
            {replies.length > 0 && (
              <div className="replies-list">
                {replies.map((reply, idx) => {
                  const replyUser = reply.user || {};
                  return (
                    <div key={reply._id || idx} className="reply-item">
                      <img
                        src={
                          replyUser.avatar ||
                          `https://api.dicebear.com/7.x/initials/svg?seed=${replyUser.name || 'U'}`
                        }
                        alt={replyUser.name}
                        className="reply-avatar"
                      />
                      <div className="reply-content-box">
                        <div className="reply-header">
                          <span className="reply-user-name">{replyUser.name || 'Peer'}</span>
                          {replyUser.role === 'admin' && (
                            <span className="role-pill admin-pill-small">Admin</span>
                          )}
                          <span className="reply-handle">@{replyUser.handle || 'user'}</span>
                          <span className="reply-time">{formatRelativeTime(reply.createdAt)}</span>
                        </div>
                        <div className="reply-text">{renderFormattedContent(reply.content)}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Add reply input */}
            <form className="add-reply-form" onSubmit={handleAddReply}>
              <input
                type="text"
                className="reply-input"
                placeholder="Post your reply (max 280 chars)..."
                maxLength={280}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
              />
              <button
                type="submit"
                className="reply-submit-btn"
                disabled={!replyText.trim() || isSubmittingReply}
              >
                <Send size={15} />
                <span>Reply</span>
              </button>
            </form>
          </div>
        )}
      </div>
    </article>
  );
}
