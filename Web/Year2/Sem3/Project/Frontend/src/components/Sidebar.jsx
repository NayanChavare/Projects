import React, { useState, useEffect } from 'react';
import { useChat } from '../context/ChatContext';
import { useAuth } from '../context/AuthContext';
import { searchUsersByEmail } from '../services/api';
import {
  Search,
  MessageSquarePlus,
  MoreVertical,
  CheckCheck,
  Check,
  Moon,
  Sun,
  LogOut,
  User,
  X,
  Volume2,
  VolumeX,
  Loader2,
  Mail,
  Trash2,
  Users,
} from 'lucide-react';

export function Sidebar({ onOpenNewChat, onOpenProfile, darkMode, setDarkMode }) {
  const {
    chats,
    activeChatId,
    selectChat,
    filter,
    setFilter,
    searchQuery,
    setSearchQuery,
    startChatWithUser,
    deleteConversation,
    soundEnabled,
    setSoundEnabled,
    isUserOnline,
  } = useChat();

  const { user, logout } = useAuth();
  const [showMenu, setShowMenu] = useState(false);

  // Live search state
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Debounced search when typing
  useEffect(() => {
    const trimmed = searchQuery.trim();
    if (!trimmed) {
      setSearchResults([]);
      setIsSearching(false);
      setHasSearched(false);
      return;
    }

    setIsSearching(true);
    setHasSearched(true);

    const timer = setTimeout(async () => {
      const res = await searchUsersByEmail(trimmed);
      // Filter out self
      const filtered = (res.users || []).filter(
        (u) => u.email?.toLowerCase() !== user?.email?.toLowerCase()
      );
      setSearchResults(filtered);
      setIsSearching(false);
    }, 350);

    return () => clearTimeout(timer);
  }, [searchQuery, user?.email]);

  // Existing chats filter (supports All, Direct, Groups, and Unread)
  // Automatically sorts by latest message (newest at top, older as user scrolls down)
  const filteredChats = chats
    .filter((chat) => {
      if (filter === 'unread') return (chat.unread || 0) > 0;
      if (filter === 'groups') return !!chat.isGroup;
      if (filter === 'direct') return !chat.isGroup;
      return true;
    })
    .sort((a, b) => (b.lastActivity || 0) - (a.lastActivity || 0));

  const handleSelectSearchResult = (targetUser) => {
    startChatWithUser(targetUser);
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleDeleteChat = (e, chat) => {
    e.stopPropagation();
    if (chat.isGroup) {
      if (window.confirm(`Leave or close view for group "${chat.name}"?`)) {
        deleteConversation(chat.id);
      }
    } else {
      if (window.confirm(`Delete conversation with ${chat.name}? All messages will be permanently removed.`)) {
        deleteConversation(chat.email);
      }
    }
  };

  return (
    <aside className="pulse-sidebar">
      {/* Top Header Bar */}
      <div className="sidebar-header">
        <div className="user-profile-btn" onClick={onOpenProfile} title="View My Profile">
          <div className="avatar-wrapper">
            <img
              src={user?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.name || 'User'}`}
              alt={user?.name || 'User'}
              className="user-avatar"
            />
            <span className="online-badge" title="Online"></span>
          </div>
          <div className="user-info-brief">
            <span className="user-display-name">{user?.name || 'My Profile'}</span>
            <span className="user-email-tag">{user?.email}</span>
          </div>
        </div>

        <div className="header-actions">
          {/* Sound Toggle */}
          <button
            className="action-icon-btn"
            onClick={() => setSoundEnabled(!soundEnabled)}
            title={soundEnabled ? 'Mute Sounds' : 'Unmute Sounds'}
          >
            {soundEnabled ? <Volume2 size={19} /> : <VolumeX size={19} />}
          </button>

          {/* Theme Switcher */}
          <button
            className="action-icon-btn"
            onClick={() => setDarkMode(!darkMode)}
            title={darkMode ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
          >
            {darkMode ? <Sun size={19} /> : <Moon size={19} />}
          </button>

          {/* New Chat / Group Button */}
          <button
            className="action-icon-btn"
            onClick={onOpenNewChat}
            title="Start New Chat or Create Group"
          >
            <MessageSquarePlus size={19} />
          </button>

          {/* More Options Menu */}
          <div className="menu-container">
            <button
              className="action-icon-btn"
              onClick={() => setShowMenu(!showMenu)}
              title="Menu Options"
            >
              <MoreVertical size={19} />
            </button>

            {showMenu && (
              <div className="dropdown-menu-pulse">
                <button
                  onClick={() => {
                    setShowMenu(false);
                    onOpenProfile();
                  }}
                  className="dropdown-item"
                >
                  <User size={16} />
                  <span>My Profile</span>
                </button>
                <button
                  onClick={() => {
                    setShowMenu(false);
                    onOpenNewChat();
                  }}
                  className="dropdown-item"
                >
                  <MessageSquarePlus size={16} />
                  <span>New Chat / Group</span>
                </button>
                <div className="dropdown-divider"></div>
                <button
                  onClick={() => {
                    setShowMenu(false);
                    logout();
                  }}
                  className="dropdown-item item-danger"
                >
                  <LogOut size={16} />
                  <span>Log Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Global Contact Search Input - Prominent & Full Width */}
      <div className="sidebar-search-area">
        <div className="search-box">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Search registered user by email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="clear-search-btn"
              title="Clear Search"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Live Search Results Panel */}
      {searchQuery.trim() ? (
        <div className="atlas-search-results-panel">
          <div className="search-panel-title">
            <span>REGISTERED USERS</span>
            {isSearching && <Loader2 size={13} className="spin-icon" />}
          </div>

          {searchResults.length === 0 && !isSearching && hasSearched ? (
            <div className="search-feedback-row no-match">
              <p>No user matches "{searchQuery}"</p>
            </div>
          ) : (
            <div className="search-users-list">
              {searchResults.map((target) => (
                <div
                  key={target.email}
                  className="search-user-card"
                  onClick={() => handleSelectSearchResult(target)}
                >
                  <div className="user-avatar-circle">
                    {target.name ? target.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="matched-user-info">
                    <span className="matched-user-name">{target.name}</span>
                    <span className="matched-user-email">
                      <Mail size={12} className="inline-icon" style={{ display: 'inline', marginRight: '4px' }} />
                      {target.email}
                    </span>
                  </div>
                  <button className="btn-start-chat-tag">Chat</button>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Clean Styled Filter Pills */}
          <div className="chat-filter-tabs">
            <button
              className={`filter-pill ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All
            </button>
            <button
              className={`filter-pill ${filter === 'direct' ? 'active' : ''}`}
              onClick={() => setFilter('direct')}
            >
              Direct
            </button>
            <button
              className={`filter-pill ${filter === 'groups' ? 'active' : ''}`}
              onClick={() => setFilter('groups')}
            >
              Groups
            </button>
            <button
              className={`filter-pill ${filter === 'unread' ? 'active' : ''}`}
              onClick={() => setFilter('unread')}
            >
              Unread
            </button>
          </div>

          {/* Conversations Thread List */}
          <div className="chat-list-scroll">
            {filteredChats.length === 0 ? (
              <div className="no-chats-found">
                <div className="empty-chat-icon-wrap">
                  <Users size={28} />
                </div>
                <h4>No conversations</h4>
                <p>Click the + icon above to start chatting or create a group!</p>
              </div>
            ) : (
              filteredChats.map((chat) => {
                const isActive = chat.id === activeChatId;
                const lastMessage =
                  chat.messages && chat.messages.length > 0
                    ? chat.messages[chat.messages.length - 1]
                    : chat.lastMessage
                    ? { text: chat.lastMessage, timestamp: chat.lastMessageTime }
                    : null;

                const isOnline = !chat.isGroup && isUserOnline(chat.email);

                return (
                  <div
                    key={chat.id}
                    className={`chat-item ${isActive ? 'active-chat-item' : ''}`}
                    onClick={() => selectChat(chat.id)}
                  >
                    <div className="avatar-wrapper">
                      <img
                        src={chat.avatar}
                        alt={chat.name}
                        className="chat-avatar-img"
                      />
                      {chat.isGroup ? (
                        <span
                          className="online-badge"
                          style={{
                            backgroundColor: '#4f46e5',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '14px',
                            height: '14px',
                          }}
                          title="Group Chat"
                        >
                          <Users size={8} color="#fff" />
                        </span>
                      ) : (
                        isOnline && <span className="online-badge" title="Online"></span>
                      )}
                    </div>

                    <div className="chat-item-content">
                      <div className="chat-item-header">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span className="chat-title">{chat.name}</span>
                          {chat.isGroup && (
                            <span
                              style={{
                                fontSize: '10px',
                                backgroundColor: '#e0e7ff',
                                color: '#3730a3',
                                padding: '1px 5px',
                                borderRadius: '4px',
                                fontWeight: 600,
                              }}
                            >
                              GROUP
                            </span>
                          )}
                        </div>
                        <span className={`chat-timestamp ${chat.unread ? 'unread-time' : ''}`}>
                          {lastMessage ? lastMessage.timestamp : ''}
                        </span>
                      </div>

                      <div className="chat-item-subtext-row">
                        <div className="last-message-snippet">
                          {lastMessage ? (
                            <>
                              {!chat.isGroup && lastMessage.sender === 'me' && (
                                <span className="check-icons-wrap">
                                  {lastMessage.status === 'read' ? (
                                    <CheckCheck size={16} className="check-read" />
                                  ) : (
                                    <Check size={16} className="check-sent" />
                                  )}
                                </span>
                              )}
                              <span className="message-text-preview">{lastMessage.text}</span>
                            </>
                          ) : (
                            <span className="message-text-preview italic">
                              {chat.isGroup ? 'Group created • Say hello!' : 'Chat initiated • Send a message'}
                            </span>
                          )}
                        </div>

                        <div className="chat-item-actions-side">
                          {(chat.unread || 0) > 0 && (
                            <span className="unread-counter-badge">{chat.unread}</span>
                          )}
                          <button
                            type="button"
                            className="chat-delete-btn"
                            title={chat.isGroup ? 'Close group view' : 'Delete conversation'}
                            onClick={(e) => handleDeleteChat(e, chat)}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </>
      )}
    </aside>
  );
}
