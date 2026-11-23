import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  ShieldCheck,
  Edit3,
  UserPlus,
  UserCheck,
  Feather,
  X,
} from 'lucide-react';
import {
  fetchUserProfile,
  fetchUserPosts,
  followUserApi,
  unfollowUserApi,
  fetchFollowers,
  fetchFollowing,
} from '../services/api';
import { PostCard } from '../components/PostCard';
import { EditProfileModal } from '../components/EditProfileModal';
import { useAuth } from '../context/AuthContext';

export function ProfilePage() {
  const { identifier } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  const [profileUser, setProfileUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Follower/Following modal
  const [activeModalList, setActiveModalList] = useState(null); // 'followers' | 'following' | null
  const [modalUsers, setModalUsers] = useState([]);
  const [modalLoading, setModalLoading] = useState(false);

  const isOwnProfile =
    currentUser &&
    profileUser &&
    (currentUser._id === profileUser._id ||
      currentUser.id === profileUser._id ||
      currentUser.handle === profileUser.handle);

  const loadProfile = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetchUserProfile(identifier);
      if (res.ok && res.data?.user) {
        const u = res.data.user;
        setProfileUser(u);
        setIsFollowing(!!u.isFollowing);
        setFollowersCount(u.followersCount || 0);
        setFollowingCount(u.followingCount || 0);

        // Fetch user posts
        const postsRes = await fetchUserPosts(u._id);
        if (postsRes.ok && postsRes.data?.posts) {
          setPosts(postsRes.data.posts);
        }
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setIsLoading(false);
    }
  }, [identifier]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  // Listen to chirp_created: if this is own profile, prepend immediately!
  useEffect(() => {
    const onChirpCreated = (e) => {
      const newPost = e.detail;
      if (newPost && isOwnProfile) {
        setPosts((prev) => {
          if (prev.some((p) => p._id === newPost._id)) return prev;
          return [newPost, ...prev];
        });
      }
    };
    window.addEventListener('chirp_created', onChirpCreated);
    return () => window.removeEventListener('chirp_created', onChirpCreated);
  }, [isOwnProfile]);

  const handleToggleFollow = async () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    if (!profileUser) return;

    const prevFollowing = isFollowing;
    const prevFollowers = followersCount;

    // Optimistic toggle
    setIsFollowing(!prevFollowing);
    setFollowersCount(prevFollowing ? prevFollowers - 1 : prevFollowers + 1);

    try {
      if (prevFollowing) {
        await unfollowUserApi(profileUser._id);
        window.dispatchEvent(new CustomEvent('follow_changed', { detail: { targetUserId: profileUser._id, isFollowing: false } }));
      } else {
        await followUserApi(profileUser._id);
        window.dispatchEvent(new CustomEvent('follow_changed', { detail: { targetUserId: profileUser._id, isFollowing: true } }));
      }
    } catch (err) {
      // Revert
      setIsFollowing(prevFollowing);
      setFollowersCount(prevFollowers);
    }
  };

  const openFollowList = async (type) => {
    if (!profileUser) return;
    setActiveModalList(type);
    setModalLoading(true);
    try {
      const fetchFn = type === 'followers' ? fetchFollowers : fetchFollowing;
      const res = await fetchFn(profileUser._id);
      if (res.ok) {
        setModalUsers(res.data[type] || []);
      }
    } catch (err) {
      console.error('Error fetching follow list:', err);
    } finally {
      setModalLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="profile-view">
        <div className="feed-skeleton-loader" style={{ padding: '24px' }}>
          <div className="skeleton-item" style={{ height: '180px' }} />
          <div className="skeleton-item" style={{ height: '80px' }} />
        </div>
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="profile-view">
        <header className="page-header-sticky">
          <button type="button" className="back-btn" onClick={() => navigate(-1)}>
            <ArrowLeft size={20} />
          </button>
          <h1 className="page-header-title">Profile</h1>
        </header>
        <div className="feed-empty-state">
          <h3>Campus member not found</h3>
          <p>The requested profile does not exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-view">
      {/* Top Header */}
      <header className="page-header-sticky">
        <button type="button" className="back-btn" onClick={() => navigate(-1)} title="Back">
          <ArrowLeft size={20} />
        </button>
        <div className="page-header-title-box">
          <h1 className="page-header-title">{profileUser.name}</h1>
          <span className="page-header-subtitle">
            {posts.length} {posts.length === 1 ? 'Chirp' : 'Chirps'}
          </span>
        </div>
      </header>

      {/* Profile Banner & Avatar */}
      <div className="profile-banner-hero">
        <div className="profile-banner-bg" />
        <div className="profile-avatar-row">
          <img
            src={
              profileUser.avatar ||
              `https://api.dicebear.com/7.x/initials/svg?seed=${profileUser.name}`
            }
            alt={profileUser.name}
            className="profile-avatar-large"
          />

          <div className="profile-action-btn-group">
            {isOwnProfile ? (
              <button
                type="button"
                className="profile-edit-btn"
                onClick={() => setIsEditModalOpen(true)}
              >
                <Edit3 size={16} />
                <span>Edit Profile</span>
              </button>
            ) : (
              <button
                type="button"
                className={`profile-follow-btn ${isFollowing ? 'following' : ''}`}
                onClick={handleToggleFollow}
              >
                {isFollowing ? (
                  <>
                    <UserCheck size={16} />
                    <span>Following</span>
                  </>
                ) : (
                  <>
                    <UserPlus size={16} />
                    <span>Follow</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* User Info Details */}
      <div className="profile-details-section">
        <div className="profile-name-row">
          <h2 className="profile-full-name">{profileUser.name}</h2>
          {profileUser.role === 'admin' && (
            <span className="role-pill admin-pill" title="Campus Administrator">
              <ShieldCheck size={13} /> Admin
            </span>
          )}
        </div>
        <span className="profile-handle-sub">@{profileUser.handle || 'user'}</span>

        <p className="profile-bio-text">{profileUser.bio || 'College Chirper 🎓'}</p>

        <div className="profile-meta-row">
          <div className="meta-item">
            <Calendar size={15} />
            <span>
              Joined{' '}
              {profileUser.createdAt
                ? new Date(profileUser.createdAt).toLocaleDateString(undefined, {
                    month: 'short',
                    year: 'numeric',
                  })
                : 'Recently'}
            </span>
          </div>
        </div>

        {/* Following & Followers counts */}
        <div className="profile-stats-row">
          <button
            type="button"
            className="profile-stat-btn"
            onClick={() => openFollowList('following')}
          >
            <strong>{followingCount}</strong> <span>Following</span>
          </button>
          <button
            type="button"
            className="profile-stat-btn"
            onClick={() => openFollowList('followers')}
          >
            <strong>{followersCount}</strong> <span>Followers</span>
          </button>
          <div className="profile-stat-nonclick">
            <strong>{posts.length}</strong> <span>Chirps</span>
          </div>
        </div>
      </div>

      {/* Chirps Tab Header */}
      <div className="profile-timeline-tabs">
        <button type="button" className="timeline-tab active">
          <span>Chirps</span>
          <span className="tab-indicator" />
        </button>
      </div>

      {/* Timeline of User's Chirps */}
      <div className="feed-posts-list">
        {posts.length > 0 ? (
          posts.map((post) => (
            <PostCard
              key={post._id}
              post={post}
              onDeleteSuccess={(id) => setPosts((prev) => prev.filter((p) => p._id !== id))}
            />
          ))
        ) : (
          <div className="feed-empty-state">
            <Feather size={36} className="empty-icon" />
            <h3>No chirps yet</h3>
            <p>
              {isOwnProfile
                ? "You haven't posted any chirps yet. Share what's on your mind!"
                : `@${profileUser.handle || 'user'} hasn't posted anything yet.`}
            </p>
          </div>
        )}
      </div>

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onProfileUpdated={(updated) => {
          setProfileUser((prev) => ({ ...prev, ...updated }));
        }}
      />

      {/* Followers / Following Modal */}
      {activeModalList && (
        <div className="modal-backdrop" onClick={() => setActiveModalList(null)}>
          <div className="modal-card follow-list-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">
                {activeModalList === 'followers' ? 'Followers' : 'Following'}
              </h2>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setActiveModalList(null)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="modal-users-list">
              {modalLoading ? (
                <div className="modal-loading-text">Loading campus peers...</div>
              ) : modalUsers.length > 0 ? (
                modalUsers.map((u) => (
                  <div
                    key={u._id}
                    className="modal-user-row"
                    onClick={() => {
                      setActiveModalList(null);
                      navigate(`/profile/${u.handle || u._id}`);
                    }}
                  >
                    <img
                      src={
                        u.avatar ||
                        `https://api.dicebear.com/7.x/initials/svg?seed=${u.name}`
                      }
                      alt={u.name}
                      className="modal-user-avatar"
                    />
                    <div className="modal-user-info">
                      <div className="modal-user-name-row">
                        <span className="modal-user-name">{u.name}</span>
                        {u.role === 'admin' && (
                          <span className="role-pill admin-pill-small">Admin</span>
                        )}
                      </div>
                      <span className="modal-user-handle">@{u.handle || 'user'}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="modal-empty-text">No users found.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
