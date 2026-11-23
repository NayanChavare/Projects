// Chirp API Service with automatic JWT refresh and error resilience
const BASE_URL = import.meta.env.VITE_BACKEND_URL || 'https://projects-ss5j.onrender.com';

/**
 * Get stored auth token
 */
export function getToken() {
  return localStorage.getItem('chirp_access_token') || '';
}

/**
 * Get stored refresh token
 */
export function getRefreshToken() {
  return localStorage.getItem('chirp_refresh_token') || '';
}

/**
 * Set tokens in storage
 */
export function setAuthTokens(accessToken, refreshToken) {
  if (accessToken) localStorage.setItem('chirp_access_token', accessToken);
  if (refreshToken) localStorage.setItem('chirp_refresh_token', refreshToken);
}

/**
 * Clear stored credentials
 */
export function clearAuthTokens() {
  localStorage.removeItem('chirp_access_token');
  localStorage.removeItem('chirp_refresh_token');
  localStorage.removeItem('chirp_user');
}

/**
 * Core fetch wrapper with auto-header & auto-refresh logic
 */
export async function apiRequest(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const token = getToken();
  if (token && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    let response = await fetch(url, { ...options, headers });

    // Handle token expiration: attempt automatic refresh once
    if (response.status === 401 && !endpoint.includes('/refresh') && !endpoint.includes('/login') && !endpoint.includes('/google')) {
      const refreshToken = getRefreshToken();
      if (refreshToken) {
        try {
          const refreshRes = await fetch(`${BASE_URL}/user/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken }),
          });

          if (refreshRes.ok) {
            const data = await refreshRes.json();
            if (data.token) {
              setAuthTokens(data.token);
              headers['Authorization'] = `Bearer ${data.token}`;
              // Retry original request with fresh token
              response = await fetch(url, { ...options, headers });
            }
          } else {
            clearAuthTokens();
          }
        } catch (err) {
          console.warn('Auto refresh failed:', err);
        }
      }
    }

    const contentType = response.headers.get('content-type');
    let data;
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    return {
      ok: response.ok,
      status: response.status,
      data,
    };
  } catch (error) {
    console.error(`API Request Error [${endpoint}]:`, error);
    return {
      ok: false,
      status: 0,
      data: { msg: error.message || 'Network error connecting to backend' },
    };
  }
}

// ================= AUTH APIs =================

export async function registerUser({ name, email, password, role, bio, handle }) {
  const res = await apiRequest('/user/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password, role, bio, handle }),
  });
  return res;
}

export async function loginUser({ email, password }) {
  const res = await apiRequest('/user/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  return res;
}

export async function googleAuthUser({ email, name, avatar, uid }) {
  const res = await apiRequest('/user/google', {
    method: 'POST',
    body: JSON.stringify({ email, name, avatar, uid }),
  });
  return res;
}

export async function fetchCurrentUser() {
  return await apiRequest('/user/me');
}

export async function fetchUserProfile(identifier) {
  return await apiRequest(`/user/profile/${encodeURIComponent(identifier)}`);
}

export async function updateUserProfile(profileData) {
  return await apiRequest('/user/profile', {
    method: 'PUT',
    body: JSON.stringify(profileData),
  });
}

export async function searchUsers(query) {
  return await apiRequest(`/user/search?q=${encodeURIComponent(query)}`);
}

export async function fetchSuggestedUsers() {
  return await apiRequest('/user/suggested');
}

// ================= POST APIs =================

export async function createPostApi(content) {
  return await apiRequest('/post/create', {
    method: 'POST',
    body: JSON.stringify({ content }),
  });
}

export async function fetchHomeFeed(page = 1, limit = 10) {
  return await apiRequest(`/post/feed?page=${page}&limit=${limit}`);
}

export async function fetchExploreFeed(page = 1, limit = 10) {
  return await apiRequest(`/post/explore?page=${page}&limit=${limit}`);
}

// UNIQUE TWIST: Top 5 trending hashtags of last 24h
export async function fetchTrendingHashtags() {
  return await apiRequest('/post/trending');
}

export async function fetchHashtagPosts(tag, page = 1, limit = 10) {
  const cleanTag = tag.replace(/^#/, '');
  return await apiRequest(`/post/hashtag/${encodeURIComponent(cleanTag)}?page=${page}&limit=${limit}`);
}

export async function fetchUserPosts(userId, page = 1, limit = 10) {
  return await apiRequest(`/post/user/${encodeURIComponent(userId)}?page=${page}&limit=${limit}`);
}

export async function toggleLikePost(postId) {
  return await apiRequest(`/post/${postId}/like`, {
    method: 'POST',
  });
}

export async function addReplyToPost(postId, content) {
  return await apiRequest(`/post/${postId}/reply`, {
    method: 'POST',
    body: JSON.stringify({ content }),
  });
}

export async function deletePostApi(postId) {
  return await apiRequest(`/post/${postId}`, {
    method: 'DELETE',
  });
}

// ================= FOLLOW APIs =================

export async function followUserApi(userId) {
  return await apiRequest(`/follow/${userId}`, {
    method: 'POST',
  });
}

export async function unfollowUserApi(userId) {
  return await apiRequest(`/follow/${userId}`, {
    method: 'DELETE',
  });
}

export async function fetchFollowers(userId) {
  return await apiRequest(`/follow/${userId}/followers`);
}

export async function fetchFollowing(userId) {
  return await apiRequest(`/follow/${userId}/following`);
}

// ================= ADMIN APIs (RBAC) =================

export async function fetchAdminStats() {
  return await apiRequest('/admin/stats');
}

export async function fetchAdminUsers(page = 1, limit = 20, search = '') {
  return await apiRequest(`/admin/users?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`);
}

export async function updateUserRoleAdmin(userId, role) {
  return await apiRequest(`/admin/user/${userId}/role`, {
    method: 'PUT',
    body: JSON.stringify({ role }),
  });
}

export async function adminDeletePost(postId) {
  return await apiRequest(`/admin/post/${postId}`, {
    method: 'DELETE',
  });
}

export async function adminDeleteUser(userId) {
  return await apiRequest(`/admin/user/${userId}`, {
    method: 'DELETE',
  });
}

// ================= HEALTH CHECK =================

export async function checkBackendStatus() {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 2500);
    const res = await fetch(`${BASE_URL}/`, { signal: controller.signal });
    clearTimeout(timer);
    return {
      online: res.ok,
      status: res.status,
    };
  } catch (err) {
    return {
      online: false,
      error: err.message,
    };
  }
}
