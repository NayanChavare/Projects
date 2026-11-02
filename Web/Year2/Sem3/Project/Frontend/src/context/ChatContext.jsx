import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { playMessageSound } from '../utils/sound';
import { sendMessageApi, fetchConversationApi, fetchThreadsApi, deleteConversationApi } from '../services/api';

const ChatContext = createContext(null);

export function ChatProvider({ children }) {
  const { user } = useAuth();
  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all', 'unread'
  const [searchQuery, setSearchQuery] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Load conversation threads for the logged-in user from MongoDB Atlas
  const loadThreads = useCallback(async () => {
    if (!user?.email) {
      setChats([]);
      setActiveChatId(null);
      return;
    }

    try {
      const res = await fetchThreadsApi(user.email);
      if (res.success && res.threads) {
        setChats((prev) => {
          // Merge with any existing open chats in state
          const map = new Map(prev.map((c) => [c.email.toLowerCase(), c]));
          for (const t of res.threads) {
            const emailKey = t.email.toLowerCase();
            const existing = map.get(emailKey);
            map.set(emailKey, {
              id: emailKey,
              email: t.email,
              name: t.name || t.email.split('@')[0],
              avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(t.name || t.email)}`,
              status: 'Active',
              unread: existing?.unread || 0,
              messages: existing?.messages || [],
              lastMessage: t.lastMessage,
              lastMessageTime: t.lastMessageTime ? new Date(t.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
            });
          }
          return Array.from(map.values());
        });
      }
    } catch (err) {
      console.error('Failed to load threads from MongoDB:', err);
    }
  }, [user?.email]);

  useEffect(() => {
    loadThreads();
  }, [loadThreads]);

  const activeChat = chats.find((c) => c.id === activeChatId) || null;

  // Load messages for the active chat from MongoDB Atlas
  const loadActiveConversation = useCallback(async () => {
    if (!user?.email || !activeChat?.email) return;

    try {
      const res = await fetchConversationApi(user.email, activeChat.email);
      if (res.success && res.messages) {
        const formatted = res.messages.map((m) => {
          const isMe = m.sender.toLowerCase() === user.email.toLowerCase();
          return {
            id: m._id || m.id,
            text: m.text,
            sender: isMe ? 'me' : m.sender,
            senderName: isMe ? user.name : activeChat.name,
            timestamp: new Date(m.createdAt || Date.now()).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            }),
            status: m.status || 'delivered',
            reactions: [],
          };
        });

        setChats((prev) =>
          prev.map((c) => {
            if (c.id === activeChat.id) {
              return { ...c, messages: formatted };
            }
            return c;
          })
        );
      }
    } catch (err) {
      console.error('Failed to load messages from MongoDB:', err);
    }
  }, [user?.email, user?.name, activeChat?.id, activeChat?.email, activeChat?.name]);

  useEffect(() => {
    if (activeChatId) {
      loadActiveConversation();
      // Periodically refresh conversation messages from MongoDB Atlas (every 3 seconds)
      const interval = setInterval(loadActiveConversation, 3000);
      return () => clearInterval(interval);
    }
  }, [activeChatId, loadActiveConversation]);

  // Initiate or activate chat with a target user
  const startChatWithUser = (targetUser) => {
    if (!targetUser || !targetUser.email) return;

    const emailKey = targetUser.email.toLowerCase();
    const existing = chats.find((c) => c.id === emailKey);

    if (existing) {
      setActiveChatId(existing.id);
      return existing;
    }

    const newChatObj = {
      id: emailKey,
      email: targetUser.email,
      name: targetUser.name || targetUser.email.split('@')[0],
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
        targetUser.name || targetUser.email
      )}`,
      status: 'Active',
      unread: 0,
      messages: [],
    };

    setChats((prev) => [newChatObj, ...prev]);
    setActiveChatId(emailKey);
    return newChatObj;
  };

  // Send a real message and persist in MongoDB Atlas
  const sendMessage = async (text) => {
    if (!text.trim() || !activeChat || !user?.email) return;

    const trimmedText = text.trim();
    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const tempMsg = {
      id: 'temp-' + Date.now(),
      text: trimmedText,
      sender: 'me',
      senderName: user.name || 'You',
      timestamp: timeString,
      status: 'sent',
      reactions: [],
    };

    // Optimistic UI update
    setChats((prev) =>
      prev.map((c) => {
        if (c.id === activeChatId) {
          return {
            ...c,
            messages: [...c.messages, tempMsg],
            lastMessage: trimmedText,
            lastMessageTime: timeString,
          };
        }
        return c;
      })
    );

    if (soundEnabled) {
      playMessageSound('send');
    }

    // Save to MongoDB Atlas via Backend API
    try {
      const res = await sendMessageApi({
        sender: user.email,
        receiver: activeChat.email,
        text: trimmedText,
      });

      if (res.success && res.message) {
        setChats((prev) =>
          prev.map((c) => {
            if (c.id === activeChatId) {
              return {
                ...c,
                messages: c.messages.map((m) =>
                  m.id === tempMsg.id ? { ...m, id: res.message._id, status: 'delivered' } : m
                ),
              };
            }
            return c;
          })
        );
      }
    } catch (err) {
      console.error('Failed to save message to MongoDB:', err);
    }
  };

  // Delete entire conversation between current user and target user
  const deleteConversation = async (contactEmail) => {
    if (!contactEmail || !user?.email) return;

    const targetKey = contactEmail.toLowerCase();

    // Optimistically remove from state
    setChats((prev) => prev.filter((c) => c.id !== targetKey && c.email.toLowerCase() !== targetKey));
    if (activeChatId === targetKey) {
      setActiveChatId(null);
    }

    // Call Backend API to delete from MongoDB Atlas
    try {
      await deleteConversationApi(user.email, contactEmail);
    } catch (err) {
      console.error('Failed to delete conversation from MongoDB:', err);
    }
  };

  const selectChat = (chatId) => {
    setActiveChatId(chatId);
    setChats((prev) =>
      prev.map((c) => (c.id === chatId ? { ...c, unread: 0 } : c))
    );
  };

  const reactToMessage = (messageId, emoji) => {
    setChats((prev) =>
      prev.map((chat) => {
        if (chat.id === activeChatId) {
          return {
            ...chat,
            messages: chat.messages.map((m) => {
              if (m.id === messageId) {
                const current = m.reactions || [];
                const updated = current.includes(emoji)
                  ? current.filter((e) => e !== emoji)
                  : [...current, emoji];
                return { ...m, reactions: updated };
              }
              return m;
            }),
          };
        }
        return chat;
      })
    );
  };

  const deleteMessage = (messageId) => {
    setChats((prev) =>
      prev.map((chat) => {
        if (chat.id === activeChatId) {
          return {
            ...chat,
            messages: chat.messages.filter((m) => m.id !== messageId),
          };
        }
        return chat;
      })
    );
  };

  return (
    <ChatContext.Provider
      value={{
        chats,
        activeChat,
        activeChatId,
        selectChat,
        sendMessage,
        startChatWithUser,
        deleteConversation,
        reactToMessage,
        deleteMessage,
        filter,
        setFilter,
        searchQuery,
        setSearchQuery,
        soundEnabled,
        setSoundEnabled,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}
