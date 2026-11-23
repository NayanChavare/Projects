import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, TrendingUp, UserPlus, Check, Sparkles, AlertCircle } from 'lucide-react';
import {
  fetchTrendingHashtags,
  fetchSuggestedUsers,
  followUserApi,
  unfollowUserApi,
  searchUsers,
} from '../services/api';
import { useAuth } from '../context/AuthContext';

export function RightRail({ onHashtagClick }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [trendingTags, setTrendingTags] = useState([]);
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [loadingTrending, setLoadingTrending] = useState(true);
  const [followingMap, setFollowingMap] = useState({});

  // Load trending hashtags (last 24 hours aggregation)
  const loadTrending = async () => {
    setLoadingTrending(true);
    const res = await fetchTrendingHashtags();
    if (res.ok && res.data?.trending) {
      setTrendingTags(res.data.trending);
    }
    setLoadingTrending(false);
  };

  // Load suggested peers to follow
  const loadSuggestions = async () => {
    if (!user) return;
    const res = await fetchSuggestedUsers();
    if (res.ok && res.data?.suggested) {
      setSuggestedUsers(res.data.suggested);
    }
  };

  useEffect(() => {
    loadTrending();
    loadSuggestions();

    // Auto-refresh trending hashtags every 30 seconds
    const interval = setInterval(loadTrending, 30000);
    return () => clearInterval(interval);
  }, [user]);

  // Listen for chirp_created to refresh trending hashtags immediately
  useEffect(() => {
    const onChirpCreated = () => {
      loadTrending();
    };
    window.addEventListener('chirp_created', onChirpCreated);
    return () => window.removeEventListener('chirp_created', onChirpCreated);
  }, []);

  // Listen for follow_changed to update suggestions
  useEffect(() => {
    const onFollowChanged = () => {
      loadSuggestions();
    };
    window.addEventListener('follow_changed', onFollowChanged);
    return () => window.removeEventListener('follow_changed', onFollowChanged);
  }, []);

  // Handle instant search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      const res = await searchUsers(searchQuery);
      if (res.ok && res.data?.users) {
        setSearchResults(res.data.users);
      }
      setIsSearching(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleToggleFollow = async (targetUserId) => {
    const isCurrentlyFollowing = !!followingMap[targetUserId];
    // Optimistic toggle
    setFollowingMap((prev) => ({ ...prev, [targetUserId]: !isCurrentlyFollowing }));

    try {
      if (isCurrentlyFollowing) {
        await unfollowUserApi(targetUserId);
        window.dispatchEvent(new CustomEvent('follow_changed', { detail: { targetUserId, isFollowing: false } }));
      } else {
        await followUserApi(targetUserId);
        window.dispatchEvent(new CustomEvent('follow_changed', { detail: { targetUserId, isFollowing: true } }));
      }
    } catch (err) {
      // Revert on error
      setFollowingMap((prev) => ({ ...prev, [targetUserId]: isCurrentlyFollowing }));
    }
  };

  const handleTagClick = (tag) => {
    const cleanTag = tag.replace(/^#/, '');
    if (onHashtagClick) {
      onHashtagClick(cleanTag);
    } else {
      navigate(`/hashtag/${cleanTag}`);
    }
  };

  return (
    <aside className="right-rail-container">
      {/* Search Bar */}
      <div className="search-bar-box">
        <Search className="search-icon" size={18} />
        <input
          type="text"
          className="search-input"
          placeholder="Search campus peers, chirps..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button
            type="button"
            className="clear-search-btn"
            onClick={() => setSearchQuery('')}
          >
            ×
          </button>
        )}

        {/* Live Search Results Dropdown */}
        {searchQuery.trim() && (
          <div className="search-dropdown">
            {isSearching ? (
              <div className="search-dropdown-loading">Searching campus...</div>
            ) : searchResults.length > 0 ? (
              searchResults.map((u) => (
                <div
                  key={u._id}
                  className="search-result-row"
                  onClick={() => {
                    navigate(`/profile/${u.handle || u._id}`);
                    setSearchQuery('');
                  }}
                >
                  <img
                    src={u.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${u.name}`}
                    alt={u.name}
                    className="search-result-avatar"
                  />
                  <div className="search-result-info">
                    <span className="search-result-name">{u.name}</span>
                    <span className="search-result-handle">@{u.handle || 'user'}</span>
                  </div>
                  {u.role === 'admin' && (
                    <span className="role-pill admin-pill-small">Admin</span>
                  )}
                </div>
              ))
            ) : (
              <div className="search-dropdown-empty">No campus members found</div>
            )}
          </div>
        )}
      </div>

      {/* Unique Twist: Top 5 Trending Hashtags in last 24h */}
      <div className="rail-card trending-card">
        <div className="card-header-row">
          <div className="card-title-group">
            <TrendingUp className="card-header-icon" size={20} />
            <h3 className="card-title">Campus Trending</h3>
          </div>
          <span className="trending-badge-24h" title="Calculated using MongoDB 24h aggregation">
            <Sparkles size={12} /> 24h Pulse
          </span>
        </div>

        <p className="card-subtitle">Top 5 hashtags driving college discussions</p>

        <div className="trending-list">
          {loadingTrending && trendingTags.length === 0 ? (
            <div className="trending-loading">Loading 24h pulse...</div>
          ) : trendingTags.length > 0 ? (
            trendingTags.map((item, idx) => (
              <div
                key={item.tag}
                className="trending-item"
                onClick={() => handleTagClick(item.tag)}
              >
                <div className="trending-rank-col">
                  <span className="trending-rank">#{idx + 1}</span>
                </div>
                <div className="trending-info-col">
                  <span className="trending-tag-name">#{item.tag}</span>
                  <span className="trending-tag-count">
                    {item.count} {item.count === 1 ? 'chirp' : 'chirps'} in last 24h
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="trending-empty">
              No trending hashtags in the last 24h. Post a chirp with #hashtag to start a trend!
            </div>
          )}
        </div>
      </div>

      {/* Who To Follow Box */}
      {user && suggestedUsers.length > 0 && (
        <div className="rail-card who-to-follow-card">
          <div className="card-title-group">
            <UserPlus className="card-header-icon" size={19} />
            <h3 className="card-title">Who to Follow</h3>
          </div>
          <p className="card-subtitle">Connect with classmates & club leads</p>

          <div className="suggestions-list">
            {suggestedUsers.map((su) => {
              const isFollowing = !!followingMap[su._id];
              return (
                <div key={su._id} className="suggestion-item">
                  <div
                    className="suggestion-user-clickable"
                    onClick={() => navigate(`/profile/${su.handle || su._id}`)}
                  >
                    <img
                      src={
                        su.avatar ||
                        `https://api.dicebear.com/7.x/initials/svg?seed=${su.name}`
                      }
                      alt={su.name}
                      className="suggestion-avatar"
                    />
                    <div className="suggestion-details">
                      <div className="suggestion-name-row">
                        <span className="suggestion-name">{su.name}</span>
                        {su.role === 'admin' && (
                          <span className="role-pill admin-pill-small">Admin</span>
                        )}
                      </div>
                      <span className="suggestion-handle">@{su.handle || 'user'}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    className={`follow-toggle-btn ${isFollowing ? 'following' : ''}`}
                    onClick={() => handleToggleFollow(su._id)}
                  >
                    {isFollowing ? (
                      <>
                        <Check size={14} /> Following
                      </>
                    ) : (
                      'Follow'
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Footer Info */}
      <footer className="rail-footer">
        <p>© 2026 Chirp Campus Network</p>
        <div className="footer-links">
          <span>Terms</span>
          <span>Privacy</span>
          <span>College Guidelines</span>
          <span>Admin RBAC</span>
        </div>
      </footer>
    </aside>
  );
}
