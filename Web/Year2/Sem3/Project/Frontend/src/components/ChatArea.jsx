import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '../context/ChatContext';
import { useAuth } from '../context/AuthContext';
import {
  MoreVertical,
  Smile,
  Send,
  CheckCheck,
  Check,
  Trash2,
  Copy,
  X,
  Mail,
  MessageSquare,
  Users,
  Info,
  Zap,
  Radio,
  ShieldCheck,
  MessageSquarePlus,
  Sparkles,
  ArrowLeft,
} from 'lucide-react';

const COMMON_EMOJIS = ['😊', '😂', '👍', '❤️', '🔥', '🎉', '🚀', '🙌', '💡', '✨', '💻', '👏', '🙏', '💯', '😎'];

export function ChatArea({ onOpenProfile, onOpenNewChat }) {
  const {
    activeChat,
    setActiveChatId,
    sendMessage,
    reactToMessage,
    deleteMessage,
    deleteConversation,
    partnerTyping,
    sendTypingStatus,
    isUserOnline,
  } = useChat();

  const { user } = useAuth();
  const [inputText, setInputText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showChatMenu, setShowChatMenu] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const typingTimerRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeChat?.messages, partnerTyping]);

  const handleInputChange = (e) => {
    setInputText(e.target.value);
    // Send typing notification over WebSocket (for 1-on-1 chats)
    if (!activeChat?.isGroup) {
      sendTypingStatus(true);
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      typingTimerRef.current = setTimeout(() => {
        sendTypingStatus(false);
      }, 1500);
    }
  };

  const handleSend = (e) => {
    e?.preventDefault();
    if (!inputText.trim()) return;
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    sendTypingStatus(false);
    sendMessage(inputText);
    setInputText('');
    setShowEmojiPicker(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCopyMessage = (text, id) => {
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDeleteConversation = () => {
    setShowChatMenu(false);
    const label = activeChat.isGroup ? `group "${activeChat.name}"` : `conversation with ${activeChat.name}`;
    if (window.confirm(`Are you sure you want to remove the ${label}?`)) {
      deleteConversation(activeChat.isGroup ? activeChat.id : activeChat.email);
    }
  };

  // Modern Welcoming Empty State Dashboard
  if (!activeChat) {
    return (
      <div className="pulse-empty-state">
        <div className="empty-dashboard-card">
          <div className="empty-glow-orb"></div>
          
          <div className="empty-brand-badge">
            <div className="empty-brand-icon-wrap">
              <MessageSquare size={36} />
            </div>
            <span className="pulse-version-pill">
              <Sparkles size={12} /> Live PulseChat
            </span>
          </div>

          <h2 className="empty-title">Welcome to PulseChat</h2>
          <p className="empty-subtitle">
            Connect instantly with peers, start study groups, and chat in real time with continuous WebSocket sync.
          </p>

          <div className="empty-quick-actions">
            <button
              className="btn-empty-action primary"
              onClick={onOpenNewChat}
              title="Search users to start a direct chat"
            >
              <MessageSquarePlus size={18} />
              <span>Start New Chat</span>
            </button>
            <button
              className="btn-empty-action secondary"
              onClick={onOpenNewChat}
              title="Create a new study or project group"
            >
              <Users size={18} />
              <span>Create Group</span>
            </button>
          </div>

          <div className="empty-features-grid">
            <div className="empty-feature-card">
              <div className="feature-icon-bubble emerald">
                <Zap size={18} />
              </div>
              <div className="feature-info">
                <strong>Instant WebSocket</strong>
                <span>Continuous bi-directional push</span>
              </div>
            </div>

            <div className="empty-feature-card">
              <div className="feature-icon-bubble blue">
                <Radio size={18} />
              </div>
              <div className="feature-info">
                <strong>Live Presence</strong>
                <span>Real-time online status indicators</span>
              </div>
            </div>

            <div className="empty-feature-card">
              <div className="feature-icon-bubble purple">
                <Users size={18} />
              </div>
              <div className="feature-info">
                <strong>Group Channels</strong>
                <span>Multi-peer rooms & team chat</span>
              </div>
            </div>

            <div className="empty-feature-card">
              <div className="feature-icon-bubble teal">
                <ShieldCheck size={18} />
              </div>
              <div className="feature-info">
                <strong>Safe & Private</strong>
                <span>Local storage & protected sync</span>
              </div>
            </div>
          </div>

          <div className="empty-shortcut-hint">
            <span>Tip: Select a chat from the sidebar or press <strong>Start New Chat</strong> above.</span>
          </div>
        </div>
      </div>
    );
  }

  const isContactOnline = !activeChat.isGroup && isUserOnline(activeChat.email);

  return (
    <section className="pulse-chat-area">
      {/* Top Glassmorphic Chat Header */}
      <header className="chat-header">
        <div className="header-left-cluster">
          <button
            type="button"
            className="mobile-back-btn"
            onClick={() => setActiveChatId(null)}
            title="Back to chats"
            aria-label="Back to chats"
          >
            <ArrowLeft size={20} />
          </button>
          <div
            className="chat-header-info"
          onClick={() => onOpenProfile && onOpenProfile(activeChat)}
          title={`Click to view ${activeChat.isGroup ? 'group details' : activeChat.name + "'s profile"}`}
        >
          <div className="header-avatar-wrap">
            <img src={activeChat.avatar} alt={activeChat.name} className="header-avatar-img" />
            {!activeChat.isGroup && (
              <span
                className={`header-presence-dot ${isContactOnline ? 'online' : 'offline'}`}
                title={isContactOnline ? 'Online now' : 'Offline'}
              />
            )}
          </div>

          <div className="header-text-block">
            <div className="header-title-row">
              <h3 className="header-chat-name">{activeChat.name}</h3>
              {activeChat.isGroup && (
                <span className="group-badge-pill">GROUP</span>
              )}
            </div>

            <div className="header-chat-subtext">
              {activeChat.isGroup ? (
                <span className="subtext-item">
                  <Users size={12} className="inline-icon" />
                  <span>{(activeChat.members || []).length} members</span>
                  {activeChat.description && (
                    <span className="group-desc-snip"> • {activeChat.description}</span>
                  )}
                </span>
              ) : (
                <span className="subtext-item">
                  <Mail size={12} className="inline-icon" />
                  <span className="contact-email-snip">{activeChat.email}</span>
                  {partnerTyping ? (
                    <span className="typing-status-indicator">
                      <span className="typing-indicator-pill">
                        <span className="typing-dot"></span>
                        <span className="typing-dot"></span>
                        <span className="typing-dot"></span>
                      </span>
                      <span>typing...</span>
                    </span>
                  ) : isContactOnline ? (
                    <span className="online-status-indicator">
                      <span className="status-bullet online"></span>
                      <span>Online</span>
                    </span>
                  ) : (
                    <span className="offline-status-indicator">
                      <span className="status-bullet offline"></span>
                      <span>Offline</span>
                    </span>
                  )}
                </span>
              )}
            </div>
          </div>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="chat-header-actions">
          <button
            className="chat-action-btn"
            onClick={() => onOpenProfile && onOpenProfile(activeChat)}
            title={activeChat.isGroup ? 'Group details' : `${activeChat.name}'s profile`}
          >
            <Info size={19} />
          </button>

          <div className="menu-container">
            <button
              className="chat-action-btn"
              onClick={() => setShowChatMenu(!showChatMenu)}
              title="Chat Options"
            >
              <MoreVertical size={19} />
            </button>

            {showChatMenu && (
              <div className="dropdown-menu-pulse right-aligned">
                <button
                  onClick={() => {
                    setShowChatMenu(false);
                    onOpenProfile && onOpenProfile(activeChat);
                  }}
                  className="dropdown-item"
                >
                  <Users size={15} />
                  <span>{activeChat.isGroup ? 'Group Details' : 'Contact Info'}</span>
                </button>
                <div className="dropdown-divider"></div>
                <button
                  onClick={handleDeleteConversation}
                  className="dropdown-item item-danger"
                >
                  <Trash2 size={15} />
                  <span>{activeChat.isGroup ? 'Leave Group' : 'Delete Conversation'}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Messages Canvas */}
      <div className="chat-messages-canvas">
        {/* Contact Information Banner */}
        <div className="conversation-start-banner">
          <div className="contact-circle-large">
            {activeChat.isGroup ? (
              <Users size={28} />
            ) : (
              activeChat.name ? activeChat.name.charAt(0).toUpperCase() : 'U'
            )}
          </div>
          <h4>{activeChat.name}</h4>
          <p>
            {activeChat.isGroup
              ? `Group channel with ${(activeChat.members || []).length} participants`
              : activeChat.email}
          </p>
          <span className="encrypted-badge">
            <ShieldCheck size={13} />
            <span>Messages are encrypted</span>
          </span>
        </div>

        {/* Date Separator Pill */}
        <div className="date-separator">
          <span className="date-pill">TODAY</span>
        </div>

        {/* Messages Stream with Clear Partitioning */}
        <div className="messages-stream">
          {activeChat.messages.length === 0 ? (
            <div className="no-messages-placeholder">
              <p>
                No messages yet. Send a message below to start chatting in{' '}
                <strong>{activeChat.name}</strong>!
              </p>
            </div>
          ) : (
            activeChat.messages.map((message) => {
              const isMe = message.sender === 'me' || message.sender === user?.email;

              return (
                <div
                  key={message.id}
                  className={`message-row ${isMe ? 'message-out' : 'message-in'}`}
                >
                  <div className={`message-bubble ${isMe ? 'bubble-out' : 'bubble-in'}`}>
                    {/* In Group chats, show sender's name above incoming messages */}
                    {activeChat.isGroup && !isMe && (
                      <div className="group-sender-name">
                        {message.senderName || message.sender}
                      </div>
                    )}

                    <p className="message-text">{message.text}</p>

                    <div className="bubble-meta">
                      <span className="message-timestamp">{message.timestamp}</span>
                      {isMe && !activeChat.isGroup && (
                        <span className="bubble-status-icon">
                          {message.status === 'read' ? (
                            <CheckCheck size={14} className="check-read" />
                          ) : message.status === 'delivered' ? (
                            <CheckCheck size={14} className="check-delivered" />
                          ) : (
                            <Check size={14} className="check-sent" />
                          )}
                        </span>
                      )}
                    </div>

                    {/* Emoji Reactions List Display */}
                    {message.reactions && message.reactions.length > 0 && (
                      <div className="reactions-tray">
                        {Array.from(new Set(message.reactions)).map((emoji) => {
                          const count = message.reactions.filter((e) => e === emoji).length;
                          return (
                            <button
                              key={emoji}
                              className="reaction-badge"
                              onClick={() => reactToMessage(message.id, emoji)}
                              title={`Reacted with ${emoji}`}
                            >
                              <span>{emoji}</span>
                              {count > 1 && (
                                <span className="reaction-count">{count}</span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* Message Action Menu Hover Bar */}
                    <div className={`message-hover-toolbar ${isMe ? 'toolbar-left' : 'toolbar-right'}`}>
                      <div className="quick-emojis">
                        {['👍', '❤️', '😂', '🔥', '🎉', '🚀'].map((emoji) => (
                          <button
                            key={emoji}
                            className="emoji-quick-btn"
                            onClick={() => reactToMessage(message.id, emoji)}
                            title={`React ${emoji}`}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                      <button
                        className="toolbar-btn"
                        title={copiedId === message.id ? 'Copied!' : 'Copy Text'}
                        onClick={() => handleCopyMessage(message.text, message.id)}
                      >
                        <Copy size={13} />
                        {copiedId === message.id && <span className="copy-tooltip">Copied!</span>}
                      </button>
                      <button
                        className="toolbar-btn btn-delete"
                        title="Delete Message"
                        onClick={() => deleteMessage(message.id)}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}

          {/* Typing Indicator Bubble in Stream */}
          {partnerTyping && !activeChat.isGroup && (
            <div className="message-row message-in">
              <div className="message-bubble bubble-in typing-bubble-canvas">
                <span className="typing-label-name">{activeChat.name}</span>
                <div className="typing-dots-anim">
                  <span className="dot dot-1"></span>
                  <span className="dot dot-2"></span>
                  <span className="dot dot-3"></span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Emoji Picker Tray Drawer */}
      {showEmojiPicker && (
        <div className="emoji-picker-drawer">
          <div className="emoji-drawer-header">
            <span>Quick Reactions & Emojis</span>
            <button className="close-drawer-btn" onClick={() => setShowEmojiPicker(false)}>
              <X size={15} />
            </button>
          </div>
          <div className="emoji-grid">
            {COMMON_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                className="emoji-item-btn"
                onClick={() => {
                  setInputText((prev) => prev + emoji);
                  inputRef.current?.focus();
                }}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Message Input Bar */}
      <footer className="chat-input-bar">
        <button
          type="button"
          className={`input-action-btn ${showEmojiPicker ? 'btn-active' : ''}`}
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          title="Emojis"
        >
          <Smile size={22} />
        </button>

        <div className="input-field-wrapper">
          <textarea
            ref={inputRef}
            rows={1}
            value={inputText}
            placeholder={
              activeChat.isGroup
                ? `Message #${activeChat.name}...`
                : `Message ${activeChat.name}...`
            }
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            className="message-textarea"
          />
        </div>

        <button
          type="button"
          disabled={!inputText.trim()}
          className="send-button-pulse"
          onClick={handleSend}
          title="Send Message (Enter)"
        >
          <Send size={18} />
        </button>
      </footer>
    </section>
  );
}
