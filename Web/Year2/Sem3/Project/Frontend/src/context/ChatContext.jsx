import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { playMessageSound } from '../utils/sound';
import { socket } from '../services/socket';
import {
  sendMessageApi,
  fetchConversationApi,
  fetchThreadsApi,
  deleteConversationApi,
  reactToMessageApi,
  deleteMessageApi,
  createGroupApi,
  fetchGroupsApi,
  fetchGroupMessagesApi,
  addGroupMemberApi,
} from '../services/api';

const ChatContext = createContext(null);

export function ChatProvider({ children }) {
  const { user } = useAuth();
  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all', 'unread', 'groups', 'direct'
  const [searchQuery, setSearchQuery] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isSocketConnected, setIsSocketConnected] = useState(socket.connected);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [partnerTyping, setPartnerTyping] = useState(false);

  // Load conversation threads & groups for the logged-in user from MongoDB Atlas
  const loadAllChats = useCallback(async () => {
    if (!user?.email) {
      setChats([]);
      setActiveChatId(null);
      return;
    }

    try {
      const [threadsRes, groupsRes] = await Promise.all([
        fetchThreadsApi(user.email),
        fetchGroupsApi(user.email),
      ]);

      setChats((prev) => {
        const prevMap = new Map(prev.map((c) => [c.id, c]));
        const combined = [];

        // Add 1-on-1 direct chat threads (validate that email is an actual email address, not a group ObjectId)
        if (threadsRes.success && threadsRes.threads) {
          for (const t of threadsRes.threads) {
            if (!t.email || !t.email.includes('@')) continue;
            const emailKey = t.email.toLowerCase();
            const existing = prevMap.get(emailKey);
            const timeMs = t.lastMessageTime ? new Date(t.lastMessageTime).getTime() : 0;
            combined.push({
              id: emailKey,
              isGroup: false,
              email: t.email,
              name: t.name || t.email.split('@')[0],
              avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(t.name || t.email)}`,
              status: 'Active',
              unread: existing?.unread || 0,
              messages: existing?.messages || [],
              lastMessage: t.lastMessage,
              lastMessageTime: t.lastMessageTime ? new Date(t.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
              lastActivity: Math.max(timeMs, existing?.lastActivity || 0),
            });
          }
        }

        // Add Group chat threads
        if (groupsRes.success && groupsRes.groups) {
          for (const grp of groupsRes.groups) {
            const grpId = grp._id.toString();
            const existing = prevMap.get(grpId);
            const timeMs = grp.lastMessageTime ? new Date(grp.lastMessageTime).getTime() : (grp.createdAt ? new Date(grp.createdAt).getTime() : 0);
            combined.push({
              id: grpId,
              isGroup: true,
              groupId: grpId,
              name: grp.name,
              description: grp.description || '',
              creator: grp.creator,
              members: grp.members || [],
              avatar: grp.avatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(grp.name)}`,
              status: `${(grp.members || []).length} members`,
              unread: existing?.unread || 0,
              messages: existing?.messages || [],
              lastMessage: grp.lastMessage || 'Group created',
              lastMessageTime: grp.lastMessageTime ? new Date(grp.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
              lastActivity: Math.max(timeMs, existing?.lastActivity || 0),
            });
          }
        }

        // Keep any newly initiated chats that aren't yet in DB threads (clean up any non-email ObjectIds)
        for (const [key, existing] of prevMap.entries()) {
          if (!existing.isGroup && (!existing.email || !existing.email.includes('@'))) {
            continue;
          }
          if (!combined.some((c) => c.id === key)) {
            combined.unshift(existing);
          }
        }

        // Sort chat list according to latest message (newest at top)
        combined.sort((a, b) => (b.lastActivity || 0) - (a.lastActivity || 0));
        return combined;
      });
    } catch (err) {
      console.error('Failed to load chats/groups from MongoDB:', err);
    }
  }, [user?.email]);

  useEffect(() => {
    loadAllChats();
  }, [loadAllChats]);

  const activeChat = chats.find((c) => c.id === activeChatId) || null;

  // Load messages for the active chat (either 1-on-1 conversation or group)
  const loadActiveConversation = useCallback(async () => {
    if (!user?.email || !activeChat) return;

    try {
      if (activeChat.isGroup) {
        // Fetch group chat messages
        const res = await fetchGroupMessagesApi(activeChat.id);
        if (res.success && res.messages) {
          const formatted = res.messages.map((m) => {
            const isMe = m.sender.toLowerCase() === user.email.toLowerCase();
            return {
              id: m._id || m.id,
              text: m.text,
              sender: isMe ? 'me' : m.sender,
              senderName: isMe ? (user.name || 'You') : (m.senderName || m.sender.split('@')[0]),
              timestamp: new Date(m.createdAt || Date.now()).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              }),
              status: m.status || 'delivered',
              reactions: Array.isArray(m.reactions) ? m.reactions : [],
            };
          });

          setChats((prev) =>
            prev.map((c) => (c.id === activeChat.id ? { ...c, messages: formatted } : c))
          );
        }
      } else if (activeChat.email) {
        // Fetch direct 1-on-1 messages
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
              reactions: Array.isArray(m.reactions) ? m.reactions : [],
            };
          });

          setChats((prev) =>
            prev.map((c) => (c.id === activeChat.id ? { ...c, messages: formatted } : c))
          );
        }
      }
    } catch (err) {
      console.error('Failed to load messages from MongoDB:', err);
    }
  }, [user?.email, user?.name, activeChat?.id, activeChat?.email, activeChat?.name, activeChat?.isGroup]);

  useEffect(() => {
    if (activeChatId) {
      loadActiveConversation();
    }
  }, [activeChatId, loadActiveConversation]);

  // Real-time online/offline status helper
  const isUserOnline = useCallback(
    (email) => {
      if (!email) return false;
      return onlineUsers.has(email.trim().toLowerCase());
    },
    [onlineUsers]
  );

  // WebSocket Continuous Connection: Listen for real-time events
  useEffect(() => {
    const onConnect = () => {
      setIsSocketConnected(true);
      if (user?.email) {
        socket.emit('user_connected', user.email);
      }
    };

    const onDisconnect = () => {
      setIsSocketConnected(false);
    };

    // Online users list update
    const onOnlineUsers = (usersList) => {
      if (Array.isArray(usersList)) {
        setOnlineUsers(new Set(usersList.map((u) => u.toLowerCase())));
      }
    };

    // Real-time direct message receiver over WebSocket
    const onReceiveMessage = (newMsg) => {
      // Exclude group messages
      if (newMsg.isGroup || newMsg.groupId) return;

      const myEmail = user?.email?.toLowerCase();
      if (!myEmail || !newMsg) return;

      const senderEmail = (newMsg.sender || '').toLowerCase();
      const receiverEmail = (newMsg.receiver || '').toLowerCase();

      // Only handle direct messages between valid email accounts
      if (!senderEmail.includes('@') || !receiverEmail.includes('@')) return;
      if (senderEmail !== myEmail && receiverEmail !== myEmail) return;

      const isMe = senderEmail === myEmail;
      const otherEmail = isMe ? receiverEmail : senderEmail;

      const formatted = {
        id: newMsg._id || newMsg.id,
        text: newMsg.text,
        sender: isMe ? 'me' : newMsg.sender,
        senderName: isMe ? (user.name || 'You') : (activeChat?.email?.toLowerCase() === senderEmail ? activeChat.name : senderEmail.split('@')[0]),
        timestamp: new Date(newMsg.createdAt || Date.now()).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
        status: newMsg.status || 'delivered',
        reactions: Array.isArray(newMsg.reactions) ? newMsg.reactions : [],
      };

      if (!isMe && soundEnabled) {
        playMessageSound('receive');
      }

      setChats((prevChats) => {
        let matchedChat = null;
        const otherChats = [];
        const msgTime = new Date(newMsg.createdAt || Date.now()).getTime();

        for (const c of prevChats) {
          if (!c.isGroup && c.email.toLowerCase() === otherEmail) {
            const hasExisting = c.messages.some(
              (m) => m.id === formatted.id || (m.id.startsWith('temp-') && m.text === formatted.text && isMe)
            );

            const updatedMessages = hasExisting
              ? c.messages.map((m) =>
                  m.id.startsWith('temp-') && m.text === formatted.text && isMe ? formatted : m
                )
              : [...c.messages, formatted];

            const isActive = activeChatId === c.id;
            matchedChat = {
              ...c,
              messages: updatedMessages,
              lastMessage: formatted.text,
              lastMessageTime: formatted.timestamp,
              lastActivity: msgTime,
              unread: !isMe && !isActive ? (c.unread || 0) + 1 : c.unread,
            };
          } else {
            otherChats.push(c);
          }
        }

        if (matchedChat) {
          // Instantly sort new message to the top of the chat list
          return [matchedChat, ...otherChats];
        }

        loadAllChats();
        return prevChats;
      });
    };

    // Real-time group message receiver over WebSocket
    const onReceiveGroupMessage = (newMsg) => {
      const myEmail = user?.email?.toLowerCase();
      if (!myEmail || !newMsg) return;

      const targetGroupId = (newMsg.groupId || newMsg.receiver || '').toString();
      const senderEmail = (newMsg.sender || '').toLowerCase();
      const isMe = senderEmail === myEmail;

      const formatted = {
        id: newMsg._id || newMsg.id,
        text: newMsg.text,
        sender: isMe ? 'me' : newMsg.sender,
        senderName: isMe ? (user.name || 'You') : (newMsg.senderName || senderEmail.split('@')[0]),
        timestamp: new Date(newMsg.createdAt || Date.now()).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
        status: newMsg.status || 'delivered',
        reactions: Array.isArray(newMsg.reactions) ? newMsg.reactions : [],
      };

      if (!isMe && soundEnabled) {
        playMessageSound('receive');
      }

      setChats((prevChats) => {
        let matchedGroup = null;
        const otherChats = [];
        const msgTime = new Date(newMsg.createdAt || Date.now()).getTime();

        for (const c of prevChats) {
          if (c.isGroup && (c.id === targetGroupId || c.groupId === targetGroupId)) {
            const hasExisting = c.messages.some(
              (m) => m.id === formatted.id || (m.id.startsWith('temp-') && m.text === formatted.text && isMe)
            );

            const updatedMessages = hasExisting
              ? c.messages.map((m) =>
                  m.id.startsWith('temp-') && m.text === formatted.text && isMe ? formatted : m
                )
              : [...c.messages, formatted];

            const isActive = activeChatId === c.id;
            matchedGroup = {
              ...c,
              messages: updatedMessages,
              lastMessage: `${formatted.senderName}: ${formatted.text}`,
              lastMessageTime: formatted.timestamp,
              lastActivity: msgTime,
              unread: !isMe && !isActive ? (c.unread || 0) + 1 : c.unread,
            };
          } else {
            otherChats.push(c);
          }
        }

        if (matchedGroup) {
          // Instantly sort new message to the top of the chat list
          return [matchedGroup, ...otherChats];
        }

        loadAllChats();
        return prevChats;
      });
    };

    // Real-time group creation notification
    const onGroupCreated = (newGroup) => {
      const myEmail = user?.email?.toLowerCase();
      if (!myEmail || !newGroup) return;

      const members = (newGroup.members || []).map((m) => m.toLowerCase());
      if (members.includes(myEmail)) {
        loadAllChats();
      }
    };

    // Real-time group update notification
    const onGroupUpdated = (updatedGroup) => {
      setChats((prev) =>
        prev.map((c) =>
          c.isGroup && c.id === updatedGroup._id.toString()
            ? {
                ...c,
                name: updatedGroup.name,
                members: updatedGroup.members,
                status: `${updatedGroup.members.length} members`,
              }
            : c
        )
      );
    };

    // Real-time emoji reaction updates
    const onReactionUpdated = ({ messageId, reactions }) => {
      setChats((prev) =>
        prev.map((c) => ({
          ...c,
          messages: c.messages.map((m) =>
            m.id === messageId ? { ...m, reactions: reactions || [] } : m
          ),
        }))
      );
    };

    // Real-time message deletion
    const onMessageDeleted = ({ messageId }) => {
      setChats((prev) =>
        prev.map((c) => {
          const remaining = c.messages.filter((m) => m.id !== messageId);
          const last = remaining.length > 0 ? remaining[remaining.length - 1] : null;
          return {
            ...c,
            messages: remaining,
            lastMessage: last ? last.text : '',
            lastMessageTime: last ? last.timestamp : '',
          };
        })
      );
    };

    // Real-time conversation deletion
    const onConversationDeleted = ({ user1, user2 }) => {
      const myEmail = user?.email?.toLowerCase();
      if (myEmail === user1 || myEmail === user2) {
        const partner = myEmail === user1 ? user2 : user1;
        setChats((prev) => prev.filter((c) => c.isGroup || c.email.toLowerCase() !== partner));
        if (activeChat?.email?.toLowerCase() === partner) {
          setActiveChatId(null);
        }
      }
    };

    // Real-time typing status
    const onUserTyping = ({ sender, receiver, isTyping }) => {
      const myEmail = user?.email?.toLowerCase();
      if (receiver?.toLowerCase() === myEmail && activeChat?.email?.toLowerCase() === sender?.toLowerCase()) {
        setPartnerTyping(isTyping);
      }
    };

    // Register event listeners
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('online_users', onOnlineUsers);
    socket.on('receive_message', onReceiveMessage);
    socket.on('receive_group_message', onReceiveGroupMessage);
    socket.on('group_created', onGroupCreated);
    socket.on('group_updated', onGroupUpdated);
    socket.on('reaction_updated', onReactionUpdated);
    socket.on('message_deleted', onMessageDeleted);
    socket.on('conversation_deleted', onConversationDeleted);
    socket.on('user_typing', onUserTyping);

    setIsSocketConnected(socket.connected);

    // Announce current user's presence if socket is already connected
    if (socket.connected && user?.email) {
      socket.emit('user_connected', user.email);
    }

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('online_users', onOnlineUsers);
      socket.off('receive_message', onReceiveMessage);
      socket.off('receive_group_message', onReceiveGroupMessage);
      socket.off('group_created', onGroupCreated);
      socket.off('group_updated', onGroupUpdated);
      socket.off('reaction_updated', onReactionUpdated);
      socket.off('message_deleted', onMessageDeleted);
      socket.off('conversation_deleted', onConversationDeleted);
      socket.off('user_typing', onUserTyping);
    };
  }, [user?.email, user?.name, activeChat?.email, activeChatId, soundEnabled, loadAllChats]);

  // Emit typing status over WebSocket
  const sendTypingStatus = (isTyping) => {
    if (socket.connected && user?.email && activeChat?.email && !activeChat?.isGroup) {
      socket.emit('typing', {
        sender: user.email,
        receiver: activeChat.email,
        isTyping,
      });
    }
  };

  // Create a brand new group chat
  const createGroup = async ({ name, description, members }) => {
    if (!user?.email || !name.trim()) {
      return { success: false, message: 'Group name is required' };
    }

    try {
      const res = await createGroupApi({
        name: name.trim(),
        description: description ? description.trim() : '',
        members: members || [],
        creator: user.email,
      });

      if (res.success && res.group) {
        await loadAllChats();
        setActiveChatId(res.group._id);
        return { success: true, group: res.group };
      }
      return { success: false, message: res.message || 'Failed to create group' };
    } catch (err) {
      console.error('Create group error:', err);
      return { success: false, message: err.message };
    }
  };

  // Add member to group
  const addMemberToGroup = async (groupId, email) => {
    try {
      const res = await addGroupMemberApi(groupId, email);
      if (res.success) {
        await loadAllChats();
        return { success: true };
      }
      return { success: false, message: res.message };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  // Initiate or activate chat with a target user
  const startChatWithUser = (targetUser) => {
    if (!targetUser || !targetUser.email) return;

    const emailKey = targetUser.email.toLowerCase();
    const existing = chats.find((c) => !c.isGroup && c.id === emailKey);

    if (existing) {
      setActiveChatId(existing.id);
      return existing;
    }

    const newChatObj = {
      id: emailKey,
      isGroup: false,
      email: targetUser.email,
      name: targetUser.name || targetUser.email.split('@')[0],
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
        targetUser.name || targetUser.email
      )}`,
      status: 'Active',
      unread: 0,
      messages: [],
      lastActivity: Date.now(),
    };

    setChats((prev) => [newChatObj, ...prev.filter((c) => c.id !== emailKey)]);
    setActiveChatId(emailKey);
    return newChatObj;
  };

  // Send message instantly via continuous WebSocket
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

    // Optimistic UI update: sort active chat with new message immediately to top
    const nowTime = now.getTime();
    setChats((prev) => {
      let targetChat = null;
      const otherChats = [];

      for (const c of prev) {
        if (c.id === activeChatId) {
          targetChat = {
            ...c,
            messages: [...c.messages, tempMsg],
            lastMessage: trimmedText,
            lastMessageTime: timeString,
            lastActivity: nowTime,
          };
        } else {
          otherChats.push(c);
        }
      }

      if (targetChat) {
        return [targetChat, ...otherChats];
      }
      return prev;
    });

    if (soundEnabled) {
      playMessageSound('send');
    }

    // Continuous WebSocket transmission
    if (socket.connected) {
      if (activeChat.isGroup) {
        // Group message
        socket.emit('send_message', {
          sender: user.email,
          groupId: activeChat.id,
          isGroup: true,
          text: trimmedText,
          senderName: user.name || 'You',
        });
      } else {
        // Direct 1-on-1 message
        socket.emit('send_message', {
          sender: user.email,
          receiver: activeChat.email,
          isGroup: false,
          text: trimmedText,
        });
      }
    } else {
      // Fallback to HTTP REST API if socket is temporarily disconnected
      try {
        const res = await sendMessageApi({
          sender: user.email,
          receiver: activeChat.isGroup ? activeChat.id : activeChat.email,
          isGroup: activeChat.isGroup,
          groupId: activeChat.isGroup ? activeChat.id : undefined,
          senderName: user.name || 'You',
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
    }
  };

  // Delete entire conversation between current user and target user
  const deleteConversation = async (contactEmail) => {
    if (!contactEmail || !user?.email) return;

    const targetKey = contactEmail.toLowerCase();

    // Optimistically remove from state
    setChats((prev) => prev.filter((c) => c.id !== targetKey && c.email?.toLowerCase() !== targetKey));
    if (activeChatId === targetKey) {
      setActiveChatId(null);
    }

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

  // React to a message and broadcast over WebSocket
  const reactToMessage = async (messageId, emoji) => {
    // Optimistic UI toggle
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

    if (typeof messageId === 'string' && messageId.startsWith('temp-')) {
      return;
    }

    if (socket.connected) {
      socket.emit('react_message', { messageId, emoji });
    } else {
      try {
        const res = await reactToMessageApi({ messageId, emoji });
        if (res.success && res.reactions) {
          setChats((prev) =>
            prev.map((chat) => {
              if (chat.id === activeChatId) {
                return {
                  ...chat,
                  messages: chat.messages.map((m) => {
                    if (m.id === messageId) {
                      return { ...m, reactions: res.reactions };
                    }
                    return m;
                  }),
                };
              }
              return chat;
            })
          );
        }
      } catch (err) {
        console.error('Failed to persist reaction in MongoDB:', err);
      }
    }
  };

  // Delete an individual message from conversation
  const deleteMessage = async (messageId) => {
    if (!messageId) return;

    setChats((prev) =>
      prev.map((chat) => {
        if (chat.id === activeChatId) {
          const remainingMessages = chat.messages.filter((m) => m.id !== messageId);
          const lastMsg = remainingMessages.length > 0 ? remainingMessages[remainingMessages.length - 1] : null;
          return {
            ...chat,
            messages: remainingMessages,
            lastMessage: lastMsg ? lastMsg.text : '',
            lastMessageTime: lastMsg ? lastMsg.timestamp : '',
          };
        }
        return chat;
      })
    );

    if (typeof messageId === 'string' && messageId.startsWith('temp-')) {
      return;
    }

    try {
      await deleteMessageApi(messageId);
      loadAllChats();
    } catch (err) {
      console.error('Failed to delete message from MongoDB:', err);
    }
  };

  return (
    <ChatContext.Provider
      value={{
        chats,
        activeChat,
        activeChatId,
        setActiveChatId,
        selectChat,
        sendMessage,
        startChatWithUser,
        createGroup,
        addMemberToGroup,
        deleteConversation,
        reactToMessage,
        deleteMessage,
        filter,
        setFilter,
        searchQuery,
        setSearchQuery,
        soundEnabled,
        setSoundEnabled,
        isSocketConnected,
        onlineUsers,
        isUserOnline,
        partnerTyping,
        sendTypingStatus,
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
