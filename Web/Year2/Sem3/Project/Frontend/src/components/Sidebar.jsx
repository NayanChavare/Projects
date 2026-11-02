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
  UserPlus,
  Mail,
  Trash2,
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
        (u) => u.email.toLowerCase() !== user?.email?.toLowerCase()
      );
      setSearchResults(filtered);
      setIsSearching(false);
    }, 350);

    return () => clearTimeout(timer);
  }, [searchQuery, user?.email]);

  // Existing chats filter
  const filteredChats = chats.filter((chat) => {
    if (filter === 'unread') return (chat.unread || 0) > 0;
    return true;
  });

  const handleSelectSearchResult = (targetUser) => {
    startChatWithUser(targetUser);
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleDeleteChat = (e, chat) => {
    e.stopPropagation();
    if (window.confirm(`Delete conversation with ${chat.name}? All messages will be permanently removed.`)) {
      deleteConversation(chat.email);
    }
  };

  return (
    <aside className="pulse-sidebar">
      {/* Top Header Bar */}
      <div className="sidebar-header">
        <div className="user-profile-btn" onClick={onOpenProfile} title="View Profile">
          <div className="avatar-wrapper">
            <img
              src={user?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.name || 'User'}`}
              alt={user?.name || 'User'}
              className="user-avatar"
            />
            <span className="online-badge"></span>
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

          {/* New Chat Button */}
          <button
            className="action-icon-btn highlight-btn"
            onClick={onOpenNewChat}
            title="Start New Chat"
          >
            <MessageSquarePlus size={20} />
          </button>

          {/* Options Menu Toggle */}
          <div className="menu-container">
            <button
              className="action-icon-btn"
              onClick={() => setShowMenu(!showMenu)}
              title="Menu"
            >
              <MoreVertical size={20} />
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
                  <span>Profile</span>
                </button>

                <button
                  onClick={() => {
                    setShowMenu(false);
                    onOpenNewChat();
                  }}
                  className="dropdown-item"
                >
                  <UserPlus size={16} />
                  <span>New Conversation</span>
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
                  <span>Sign out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="sidebar-search-area">
        <div className="search-box">
          <Search size={17} className="search-icon" />
          <input
            type="text"
            placeholder="Search by email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {isSearching && <Loader2 size={16} className="spinner-search" />}
          {searchQuery && !isSearching && (
            <button className="clear-search-btn" onClick={() => setSearchQuery('')}>
              <X size={15} />
            </button>
          )}
        </div>
      </div>

      {/* If Search Query is active: Show Search Results Panel */}
      {searchQuery.trim().length > 0 ? (
        <div className="atlas-search-results-panel">
          <div className="search-panel-title">
            <Search size={13} />
            <span>Search Results</span>
          </div>

          {isSearching ? (
            <div className="search-feedback-row">
              <Loader2 size={16} className="spinner-search" />
              <span>Searching users...</span>
            </div>
          ) : searchResults.length > 0 ? (
            <div className="search-users-list">
              {searchResults.map((matchedUser) => (
                <div
                  key={matchedUser._id || matchedUser.email}
                  className="search-user-card"
                  onClick={() => handleSelectSearchResult(matchedUser)}
                >
                  <div className="user-avatar-circle">
                    {matchedUser.name ? matchedUser.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="matched-user-info">
                    <span className="matched-user-name">{matchedUser.name}</span>
                    <span className="matched-user-email">{matchedUser.email}</span>
                  </div>
                  <button className="btn-start-chat-tag">Chat</button>
                </div>
              ))}
            </div>
          ) : (
            hasSearched && (
              <div className="search-feedback-row no-match">
                <Mail size={16} />
                <span>No user found with email "{searchQuery.trim()}".</span>
              </div>
            )
          )}
        </div>
      ) : (
        /* Regular Conversation Tabs & Chat List */
        <>
          <div className="chat-filter-tabs">
            <button
              className={`filter-pill ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All Messages ({chats.length})
            </button>
            <button
              className={`filter-pill ${filter === 'unread' ? 'active' : ''}`}
              onClick={() => setFilter('unread')}
            >
              Unread
            </button>
          </div>

          <div className="chat-list-scroll">
            {filteredChats.length === 0 ? (
              <div className="no-chats-found">
                <div className="empty-chat-icon-wrap">
                  <UserPlus size={32} />
                </div>
                <h4>No conversations yet</h4>
                <p>Search for a user by email above to start chatting.</p>
                <button
                  type="button"
                  className="btn-start-first-chat"
                  onClick={onOpenNewChat}
                >
                  New Conversation
                </button>
              </div>
            ) : (
              filteredChats.map((chat) => {
                const isActive = chat.id === activeChatId;
                const lastMessage = chat.messages[chat.messages.length - 1];

                return (
                  <div
                    key={chat.id}
                    onClick={() => selectChat(chat.id)}
                    className={`chat-item ${isActive ? 'active-chat-item' : ''}`}
                  >
                    <div className="chat-avatar-container">
                      <img src={chat.avatar} alt={chat.name} className="chat-avatar-img" />
                    </div>

                    <div className="chat-item-content">
                      <div className="chat-item-header">
                        <span className="chat-title">{chat.name}</span>
                        <span className={`chat-timestamp ${chat.unread ? 'unread-time' : ''}`}>
                          {lastMessage ? lastMessage.timestamp : ''}
                        </span>
                      </div>

                      <div className="chat-item-subtext-row">
                        <div className="last-message-snippet">
                          {lastMessage ? (
                            <>
                              {lastMessage.sender === 'me' && (
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
                            <span className="message-text-preview italic">Chat initiated • Send a message</span>
                          )}
                        </div>

                        <div className="chat-item-actions-side">
                          {(chat.unread || 0) > 0 && (
                            <span className="unread-counter-badge">{chat.unread}</span>
                          )}
                          <button
                            type="button"
                            className="chat-delete-btn"
                            title="Delete conversation"
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
