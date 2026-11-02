// API Service to communicate with the Express Backend
// Uses VITE_API_URL if configured, otherwise falls back to relative path (Vite proxy in dev)

const BASE_URL = import.meta.env.VITE_API_URL || '';

/**
 * Register a new user in MongoDB Atlas via Backend
 * @param {Object} userData - { name, email, password }
 */
export async function registerUser({ name, email, password }) {
  try {
    const response = await fetch(`${BASE_URL}/user/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, password }),
    });

    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }

    if (typeof data === 'string' && data.toLowerCase().includes('success')) {
      return { success: true, message: data };
    }

    if (data && data.msg && data.msg.toLowerCase().includes('success')) {
      return { success: true, message: data.msg };
    }

    return {
      success: false,
      message: typeof data === 'string' ? data : (data?.msg || "Could not register user"),
    };
  } catch (error) {
    console.error('Registration API Error:', error);
    return {
      success: false,
      message: error.message || 'Unable to connect to backend server.',
    };
  }
}

/**
 * Login user and receive JWT token from Backend
 * @param {Object} credentials - { email, password }
 */
export async function loginUser({ email, password }) {
  try {
    const response = await fetch(`${BASE_URL}/user/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }

    if (data && data.token) {
      return {
        success: true,
        token: data.token,
        message: data.msg || 'Login Successfully',
        email: email,
      };
    }

    return {
      success: false,
      message: typeof data === 'string' ? data : (data?.msg || 'Login failed'),
    };
  } catch (error) {
    console.error('Login API Error:', error);
    return {
      success: false,
      message: error.message || 'Unable to connect to backend server.',
    };
  }
}

/**
 * Search users by email in MongoDB Atlas via Backend
 * @param {string} email
 */
export async function searchUsersByEmail(email) {
  try {
    if (!email || !email.trim()) return { success: true, users: [] };
    const response = await fetch(`${BASE_URL}/user/search?email=${encodeURIComponent(email.trim())}`);
    const data = await response.json();
    return {
      success: true,
      users: data.users || [],
    };
  } catch (error) {
    console.error('Search API Error:', error);
    return {
      success: false,
      message: error.message || 'Failed to search users',
      users: [],
    };
  }
}

/**
 * Send a message to be saved in MongoDB Atlas
 * @param {Object} param0 - { sender, receiver, text }
 */
export async function sendMessageApi({ sender, receiver, text }) {
  try {
    const response = await fetch(`${BASE_URL}/message/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sender, receiver, text }),
    });
    const data = await response.json();
    return {
      success: response.ok,
      message: data.message,
    };
  } catch (error) {
    console.error('Send message API error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Fetch messages between two users from MongoDB Atlas
 * @param {string} user1
 * @param {string} user2
 */
export async function fetchConversationApi(user1, user2) {
  try {
    if (!user1 || !user2) return { success: true, messages: [] };
    const response = await fetch(
      `${BASE_URL}/message/conversation?user1=${encodeURIComponent(user1)}&user2=${encodeURIComponent(user2)}`
    );
    const data = await response.json();
    return {
      success: true,
      messages: data.messages || [],
    };
  } catch (error) {
    console.error('Fetch conversation error:', error);
    return { success: false, messages: [] };
  }
}

/**
 * Delete all conversation messages between two users from MongoDB Atlas
 * @param {string} user1
 * @param {string} user2
 */
export async function deleteConversationApi(user1, user2) {
  try {
    if (!user1 || !user2) return { success: false, msg: "Missing users" };
    const response = await fetch(
      `${BASE_URL}/message/conversation?user1=${encodeURIComponent(user1)}&user2=${encodeURIComponent(user2)}`,
      {
        method: 'DELETE',
      }
    );
    const data = await response.json();
    return {
      success: response.ok,
      data,
    };
  } catch (error) {
    console.error('Delete conversation error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Fetch all conversation threads for a user from MongoDB Atlas
 * @param {string} email
 */
export async function fetchThreadsApi(email) {
  try {
    if (!email) return { success: true, threads: [] };
    const response = await fetch(
      `${BASE_URL}/message/threads?email=${encodeURIComponent(email)}`
    );
    const data = await response.json();
    return {
      success: true,
      threads: data.threads || [],
    };
  } catch (error) {
    console.error('Fetch threads error:', error);
    return { success: false, threads: [] };
  }
}

/**
 * Verify token with protected route /dashboard
 * @param {string} token
 */
export async function verifyDashboard(token) {
  try {
    const response = await fetch(`${BASE_URL}/dashboard`, {
      method: 'GET',
      headers: {
        'authorization': token,
      },
    });

    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }

    if (typeof data === 'string' && data.includes('Private Route')) {
      return { success: true, data };
    }

    if (data && data.msg === 'Login First') {
      return { success: false, message: 'Session expired. Please log in again.' };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Dashboard verification error:', error);
    return { success: false, message: 'Backend unreachable.' };
  }
}

/**
 * Check if Express backend is running
 */
export async function checkBackendStatus() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    const response = await fetch(`${BASE_URL}/`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const text = await response.text();
    return {
      online: response.ok,
      message: text || 'Server Active',
    };
  } catch (err) {
    return {
      online: false,
      message: 'Server Offline',
    };
  }
}
