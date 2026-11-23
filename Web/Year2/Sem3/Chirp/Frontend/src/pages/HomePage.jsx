import React, { useState, useEffect, useCallback } from 'react';
import { Sparkles, Users, RefreshCw, Feather } from 'lucide-react';
import { CreatePostBox } from '../components/CreatePostBox';
import { PostCard } from '../components/PostCard';
import { NewPostsBadge } from '../components/NewPostsBadge';
import { fetchHomeFeed, fetchExploreFeed } from '../services/api';
import { useAuth } from '../context/AuthContext';

export function HomePage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('following'); // 'following' | 'explore'
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Load feed based on active tab
  const loadPosts = useCallback(
    async (pageNum = 1, isInitial = false) => {
      if (isInitial) setIsLoading(true);
      else setIsLoadingMore(true);

      try {
        const fetchFn = activeTab === 'following' ? fetchHomeFeed : fetchExploreFeed;
        const res = await fetchFn(pageNum, 10);

        if (res.ok && res.data?.posts) {
          if (pageNum === 1) {
            setPosts(res.data.posts);
          } else {
            setPosts((prev) => {
              const existingIds = new Set(prev.map((p) => p._id));
              const fresh = res.data.posts.filter((p) => !existingIds.has(p._id));
              return [...prev, ...fresh];
            });
          }
          setHasMore(!!res.data.hasMore);
          setPage(pageNum);
        }
      } catch (err) {
        console.error('Error loading posts:', err);
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [activeTab]
  );

  useEffect(() => {
    loadPosts(1, true);
  }, [loadPosts]);

  // Handle post created locally or via global event
  const handlePostCreated = useCallback((newPost) => {
    if (!newPost || !newPost._id) return;
    setPosts((prev) => {
      if (prev.some((p) => p._id === newPost._id)) return prev;
      return [newPost, ...prev];
    });
  }, []);

  // Listen for global chirp_created events (from modal or anywhere in app)
  useEffect(() => {
    const onChirpCreated = (e) => {
      if (e.detail) {
        handlePostCreated(e.detail);
      }
    };

    window.addEventListener('chirp_created', onChirpCreated);
    return () => window.removeEventListener('chirp_created', onChirpCreated);
  }, [handlePostCreated]);

  // Listen for follow_changed events so followed user's posts instantly appear in feed!
  useEffect(() => {
    const onFollowChanged = () => {
      // Refresh feed without full page reload
      loadPosts(1, false);
    };

    window.addEventListener('follow_changed', onFollowChanged);
    return () => window.removeEventListener('follow_changed', onFollowChanged);
  }, [loadPosts]);

  // Handle live incoming posts via Socket.IO
  const handleApplyNewPosts = (newIncomingPosts) => {
    setPosts((prev) => {
      const existingIds = new Set(prev.map((p) => p._id));
      const fresh = newIncomingPosts.filter((p) => !existingIds.has(p._id));
      return [...fresh, ...prev];
    });
  };

  // Handle deleted post
  const handleDeleteSuccess = (postId) => {
    setPosts((prev) => prev.filter((p) => p._id !== postId));
  };

  return (
    <div className="home-feed-view">
      {/* Top Header with Feed Switcher Tabs */}
      <header className="feed-header-sticky">
        <div className="feed-header-top">
          <h1 className="feed-title">Home</h1>
          <button
            type="button"
            className="refresh-feed-btn"
            onClick={() => loadPosts(1, true)}
            title="Refresh Feed"
          >
            <RefreshCw size={18} className={isLoading ? 'spinning' : ''} />
          </button>
        </div>

        <div className="feed-tabs-row">
          <button
            type="button"
            className={`feed-tab-btn ${activeTab === 'following' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('following');
              if (activeTab === 'following') loadPosts(1, false);
            }}
          >
            <Users size={16} />
            <span>Following</span>
            {activeTab === 'following' && <span className="tab-indicator" />}
          </button>

          <button
            type="button"
            className={`feed-tab-btn ${activeTab === 'explore' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('explore');
              if (activeTab === 'explore') loadPosts(1, false);
            }}
          >
            <Sparkles size={16} />
            <span>Campus Explore</span>
            {activeTab === 'explore' && <span className="tab-indicator" />}
          </button>
        </div>
      </header>

      {/* Tweet / Chirp Composer */}
      <CreatePostBox onPostCreated={handlePostCreated} />

      {/* Live "new posts" badge through Socket.IO */}
      <NewPostsBadge onApplyNewPosts={handleApplyNewPosts} />

      {/* Feed Content */}
      <div className="feed-posts-list">
        {isLoading ? (
          <div className="feed-skeleton-loader">
            <div className="skeleton-item" />
            <div className="skeleton-item" />
            <div className="skeleton-item" />
          </div>
        ) : posts.length > 0 ? (
          <>
            {posts.map((post) => (
              <PostCard
                key={post._id}
                post={post}
                onDeleteSuccess={handleDeleteSuccess}
              />
            ))}

            {/* Pagination Controls */}
            {hasMore ? (
              <div className="feed-pagination-box">
                <button
                  type="button"
                  className="load-more-btn"
                  onClick={() => loadPosts(page + 1, false)}
                  disabled={isLoadingMore}
                >
                  {isLoadingMore ? (
                    <span className="spinner-sm" />
                  ) : (
                    'Load More Chirps'
                  )}
                </button>
              </div>
            ) : (
              <div className="feed-end-notice">
                <Feather size={20} />
                <span>You're all caught up with campus pulse!</span>
              </div>
            )}
          </>
        ) : (
          <div className="feed-empty-state">
            <Users size={40} className="empty-icon" />
            <h3>No chirps in your feed yet</h3>
            <p>
              {activeTab === 'following'
                ? "You haven't followed any peers yet, or they haven't posted. Check out 'Campus Explore' or follow recommended students from the sidebar!"
                : 'No chirps published yet. Write the very first chirp of the day!'}
            </p>
            {activeTab === 'following' && (
              <button
                type="button"
                className="btn-primary"
                onClick={() => setActiveTab('explore')}
              >
                Switch to Campus Explore
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
