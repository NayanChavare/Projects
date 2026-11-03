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
} from 'lucide-react';

const COMMON_EMOJIS = ['😊', '😂', '👍', '❤️', '🔥', '🎉', '🚀', '🙌', '💡', '✨', '💻', '👏', '🙏', '💯', '😎'];

export function ChatArea({ onOpenProfile }) {
  const { activeChat, sendMessage, reactToMessage, deleteMessage, deleteConversation } = useChat();
  const { user } = useAuth();
  const [inputText, setInputText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showChatMenu, setShowChatMenu] = useState(false);
  const [activeReactionMessageId, setActiveReactionMessageId] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeChat?.messages]);

  const handleSend = (e) => {
    e?.preventDefault();
    if (!inputText.trim()) return;
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
    if (window.confirm(`Are you sure you want to delete the conversation with ${activeChat.name}? All messages will be permanently removed.`)) {
      deleteConversation(activeChat.email);
    }
  };

  if (!activeChat) {
    return (
      <div className="pulse-empty-state">
        <div className="empty-content">
          <div className="empty-illustration-pulse">
            <MessageSquare size={54} />
          </div>
          <h2>PulseChat Messenger</h2>
          <p>Search any user by email to initiate a conversation.</p>
        </div>
      </div>
    );
  }

  return (
    <section className="pulse-chat-area">
      {/* Top Chat Header */}
      <header className="chat-header">
        <div className="chat-header-info" onClick={onOpenProfile} title="View Details">
          <div className="header-avatar-wrap">
            <img src={activeChat.avatar} alt={activeChat.name} className="header-avatar-img" />
          </div>
          <div className="header-text-block">
            <h3 className="header-chat-name">{activeChat.name}</h3>
            <span className="header-chat-subtext">
              <Mail size={12} className="inline-icon" />
              {activeChat.email}
            </span>
          </div>
        </div>

        <div className="chat-header-actions">
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
                  onClick={handleDeleteConversation}
                  className="dropdown-item item-danger"
                >
                  <Trash2 size={15} />
                  <span>Delete Conversation</span>
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
            {activeChat.name ? activeChat.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <h4>{activeChat.name}</h4>
          <p>{activeChat.email}</p>
        </div>

        {/* Date Separator Pill */}
        <div className="date-separator">
          <span className="date-pill">TODAY</span>
        </div>

        {/* Messages Stream */}
        <div className="messages-stream">
          {activeChat.messages.length === 0 ? (
            <div className="no-messages-placeholder">
              <p>No messages yet. Send a message below to start chatting with {activeChat.name}!</p>
            </div>
          ) : (
            activeChat.messages.map((message) => {
              const isMe = message.sender === 'me' || message.sender === user?.email;

              return (
                <div
                  key={message.id}
                  className={`message-row ${isMe ? 'message-out' : 'message-in'}`}
                >
                  <div
                    className={`message-bubble ${isMe ? 'bubble-out' : 'bubble-in'}`}
                    onMouseEnter={() => setActiveReactionMessageId(message.id)}
                    onMouseLeave={() => setActiveReactionMessageId(null)}
                  >
                    {/* Message Text */}
                    <div className="message-text">{message.text}</div>

                    {/* Bubble Meta (Time & Status) */}
                    <div className="bubble-meta">
                      <span className="message-timestamp">{message.timestamp}</span>
                      {isMe && (
                        <span className="message-status-icons">
                          {message.status === 'read' ? (
                            <CheckCheck size={16} className="check-read" />
                          ) : (
                            <Check size={16} className="check-sent" />
                          )}
                        </span>
                      )}
                    </div>

                    {/* Message Reactions Display */}
                    {message.reactions && message.reactions.length > 0 && (
                      <div className="reactions-tray">
                        {message.reactions.map((emoji, idx) => (
                          <span
                            key={idx}
                            className="reaction-badge"
                            onClick={(e) => {
                              e.stopPropagation();
                              reactToMessage(message.id, emoji);
                            }}
                            title={`Toggle ${emoji} reaction`}
                          >
                            {emoji}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Hover Actions Tray */}
                    {activeReactionMessageId === message.id && (
                      <div className={`message-hover-toolbar ${isMe ? 'toolbar-left' : 'toolbar-right'}`}>
                        <div className="quick-emojis">
                          {['👍', '❤️', '😂', '🔥', '🎉'].map((emoji) => (
                            <button
                              key={emoji}
                              type="button"
                              className="emoji-quick-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                reactToMessage(message.id, emoji);
                              }}
                              title={`React with ${emoji}`}
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                        <button
                          type="button"
                          className="toolbar-btn"
                          title="Copy text"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopyMessage(message.text, message.id);
                          }}
                        >
                          <Copy size={13} />
                          {copiedId === message.id && <span className="copy-tooltip">Copied</span>}
                        </button>
                        <button
                          type="button"
                          className="toolbar-btn text-danger"
                          title="Delete message"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteMessage(message.id);
                          }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Emoji Picker Tray Drawer */}
      {showEmojiPicker && (
        <div className="emoji-picker-drawer">
          <div className="emoji-drawer-header">
            <span>Emoji Reactions & Smileys</span>
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
            placeholder={`Message ${activeChat.name}...`}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            className="message-textarea"
          />
        </div>

        <button
          type="button"
          disabled={!inputText.trim()}
          className="send-button-pulse"
          onClick={handleSend}
          title="Send Message"
        >
          <Send size={18} />
        </button>
      </footer>
    </section>
  );
}
