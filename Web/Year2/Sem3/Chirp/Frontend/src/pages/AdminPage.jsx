import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Users,
  Feather,
  Heart,
  TrendingUp,
  Trash2,
  UserCheck,
  UserX,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import {
  fetchAdminStats,
  fetchAdminUsers,
  updateUserRoleAdmin,
  adminDeletePost,
  adminDeleteUser,
} from '../services/api';
import { useAuth } from '../context/AuthContext';

export function AdminPage() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'users'
  const [isLoading, setIsLoading] = useState(true);
  const [searchUser, setSearchUser] = useState('');
  const [actionMessage, setActionMessage] = useState('');

  const loadAdminData = async () => {
    setIsLoading(true);
    setActionMessage('');
    try {
      const [statsRes, usersRes] = await Promise.all([
        fetchAdminStats(),
        fetchAdminUsers(1, 50, searchUser),
      ]);

      if (statsRes.ok && statsRes.data?.stats) {
        setStats(statsRes.data.stats);
      }
      if (usersRes.ok && usersRes.data?.users) {
        setUsers(usersRes.data.users);
      }
    } catch (err) {
      console.error('Error loading admin data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isAdmin) {
      navigate('/');
      return;
    }
    loadAdminData();
  }, [isAdmin, searchUser]);

  const handleRoleToggle = async (targetUser) => {
    const nextRole = targetUser.role === 'admin' ? 'user' : 'admin';
    if (!window.confirm(`Change ${targetUser.name}'s role to ${nextRole.toUpperCase()}?`)) return;

    try {
      const res = await updateUserRoleAdmin(targetUser._id, nextRole);
      if (res.ok) {
        setActionMessage(`Role for ${targetUser.name} changed to ${nextRole}`);
        setUsers((prev) =>
          prev.map((u) => (u._id === targetUser._id ? { ...u, role: nextRole } : u))
        );
      }
    } catch (err) {
      console.error('Role update error:', err);
    }
  };

  const handleDeleteUser = async (targetUserId, name) => {
    if (!window.confirm(`Permanently delete campus member "${name}" and all their chirps?`)) return;

    try {
      const res = await adminDeleteUser(targetUserId);
      if (res.ok) {
        setActionMessage(`User ${name} successfully deleted.`);
        setUsers((prev) => prev.filter((u) => u._id !== targetUserId));
        // Refresh stats
        fetchAdminStats().then((r) => r.ok && setStats(r.data.stats));
      }
    } catch (err) {
      console.error('Delete user error:', err);
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Delete this chirp as Campus Admin?')) return;

    try {
      const res = await adminDeletePost(postId);
      if (res.ok) {
        setActionMessage('Post deleted by admin.');
        if (stats?.recentPosts) {
          setStats((prev) => ({
            ...prev,
            recentPosts: prev.recentPosts.filter((p) => p._id !== postId),
            totalPosts: Math.max(0, prev.totalPosts - 1),
          }));
        }
      }
    } catch (err) {
      console.error('Delete post error:', err);
    }
  };

  if (!isAdmin) return null;

  return (
    <div className="admin-page-view">
      {/* Sticky Header */}
      <header className="page-header-sticky">
        <div className="admin-header-title-row">
          <ShieldCheck size={24} className="admin-header-icon" />
          <h1 className="page-header-title">Campus Admin Control Room</h1>
        </div>
        <button
          type="button"
          className="refresh-feed-btn"
          onClick={loadAdminData}
          title="Refresh Data"
        >
          <RefreshCw size={18} className={isLoading ? 'spinning' : ''} />
        </button>
      </header>

      {actionMessage && (
        <div className="admin-banner-notice">
          <ShieldCheck size={16} />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="admin-tabs-row">
        <button
          type="button"
          className={`admin-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Platform Metrics & Moderation
        </button>
        <button
          type="button"
          className={`admin-tab-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          Campus Members & RBAC ({users.length})
        </button>
      </div>

      {isLoading ? (
        <div className="feed-skeleton-loader" style={{ padding: '24px' }}>
          <div className="skeleton-item" style={{ height: '100px' }} />
          <div className="skeleton-item" style={{ height: '200px' }} />
        </div>
      ) : activeTab === 'overview' ? (
        <div className="admin-overview-content">
          {/* Key Metrics Grid */}
          <div className="admin-metrics-grid">
            <div className="metric-card metric-users">
              <div className="metric-icon-wrap">
                <Users size={24} />
              </div>
              <div className="metric-text-group">
                <span className="metric-value">{stats?.totalUsers || 0}</span>
                <span className="metric-label">Registered Members</span>
              </div>
            </div>

            <div className="metric-card metric-posts">
              <div className="metric-icon-wrap">
                <Feather size={24} />
              </div>
              <div className="metric-text-group">
                <span className="metric-value">{stats?.totalPosts || 0}</span>
                <span className="metric-label">Campus Chirps</span>
              </div>
            </div>

            <div className="metric-card metric-follows">
              <div className="metric-icon-wrap">
                <Heart size={24} />
              </div>
              <div className="metric-text-group">
                <span className="metric-value">{stats?.totalFollows || 0}</span>
                <span className="metric-label">Follow Connections</span>
              </div>
            </div>
          </div>

          {/* Recent Chirps for Moderation */}
          <div className="admin-section-box">
            <div className="section-header-row">
              <h3>Recent Chirps (Live Moderation Stream)</h3>
              <span className="badge-sub">RBAC Protected</span>
            </div>

            <div className="admin-posts-stream">
              {stats?.recentPosts && stats.recentPosts.length > 0 ? (
                stats.recentPosts.map((p) => (
                  <div key={p._id} className="admin-post-row">
                    <img
                      src={
                        p.author?.avatar ||
                        `https://api.dicebear.com/7.x/initials/svg?seed=${p.author?.name || 'U'}`
                      }
                      alt={p.author?.name}
                      className="admin-author-avatar"
                    />
                    <div className="admin-post-content-col">
                      <div className="admin-post-meta">
                        <strong>{p.author?.name || 'Unknown'}</strong>
                        <span className="meta-sub">@{p.author?.handle || 'user'}</span>
                        <span className="meta-time">
                          {new Date(p.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <p className="admin-post-text">{p.content}</p>
                    </div>

                    <button
                      type="button"
                      className="admin-delete-action-btn"
                      onClick={() => handleDeletePost(p._id)}
                      title="Moderator Remove Post"
                    >
                      <Trash2 size={16} />
                      <span>Remove</span>
                    </button>
                  </div>
                ))
              ) : (
                <div className="empty-subtext">No recent posts.</div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Users & RBAC Tab */
        <div className="admin-users-content">
          <div className="user-search-filter">
            <input
              type="text"
              placeholder="Filter members by name, email, or handle..."
              className="search-input"
              value={searchUser}
              onChange={(e) => setSearchUser(e.target.value)}
            />
          </div>

          <div className="admin-users-table-box">
            <table className="admin-users-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Role (RBAC)</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const isCurrent = u._id === user._id || u.id === user.id;
                  return (
                    <tr key={u._id}>
                      <td>
                        <div className="user-cell">
                          <img
                            src={
                              u.avatar ||
                              `https://api.dicebear.com/7.x/initials/svg?seed=${u.name}`
                            }
                            alt={u.name}
                            className="cell-avatar"
                          />
                          <div>
                            <div className="cell-name">{u.name}</div>
                            <div className="cell-handle">@{u.handle || 'user'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="cell-email">{u.email}</td>
                      <td>
                        <span className={`role-pill ${u.role === 'admin' ? 'admin-pill' : 'user-pill-tag'}`}>
                          {u.role === 'admin' ? <ShieldCheck size={12} /> : null}
                          {u.role.toUpperCase()}
                        </span>
                      </td>
                      <td className="cell-date">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td>
                        <div className="cell-actions-row">
                          {!isCurrent && (
                            <>
                              <button
                                type="button"
                                className="action-role-toggle-btn"
                                onClick={() => handleRoleToggle(u)}
                                title={`Change role to ${u.role === 'admin' ? 'User' : 'Admin'}`}
                              >
                                {u.role === 'admin' ? 'Demote to User' : 'Promote to Admin'}
                              </button>
                              <button
                                type="button"
                                className="action-delete-user-btn"
                                onClick={() => handleDeleteUser(u._id, u.name)}
                                title="Delete user account"
                              >
                                <Trash2 size={15} />
                              </button>
                            </>
                          )}
                          {isCurrent && <span className="self-badge">Current Account</span>}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
