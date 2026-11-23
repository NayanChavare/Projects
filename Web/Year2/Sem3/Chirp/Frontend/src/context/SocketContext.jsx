import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { getSocket } from '../services/socket';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [newPostsQueue, setNewPostsQueue] = useState([]);

  useEffect(() => {
    const s = getSocket();
    setSocket(s);

    if (user?.email) {
      s.emit('user_connected', user.email);
    }

    const handleOnlineUsers = (users) => {
      setOnlineUsers(users || []);
    };

    const handleNewPost = (post) => {
      // If the post is created by someone else, add to live badge queue
      if (post && post.author?._id !== user?._id) {
        setNewPostsQueue((prev) => {
          // Avoid duplicate entries
          if (prev.some((p) => p._id === post._id)) return prev;
          return [post, ...prev];
        });
      }
    };

    s.on('online_users', handleOnlineUsers);
    s.on('new_post', handleNewPost);

    return () => {
      s.off('online_users', handleOnlineUsers);
      s.off('new_post', handleNewPost);
    };
  }, [user]);

  const clearNewPostsQueue = useCallback(() => {
    const queued = [...newPostsQueue];
    setNewPostsQueue([]);
    return queued;
  }, [newPostsQueue]);

  return (
    <SocketContext.Provider
      value={{
        socket,
        onlineUsers,
        newPostsQueue,
        newPostsCount: newPostsQueue.length,
        clearNewPostsQueue,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error('useSocket must be used within SocketProvider');
  return ctx;
}
