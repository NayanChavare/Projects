import React, { useState } from 'react';
import { useChat } from '../context/ChatContext';
import { useAuth } from '../context/AuthContext';
import { searchUsersByEmail } from '../services/api';
import { X, UserPlus, Search, Mail, Loader2 } from 'lucide-react';

export function NewChatModal({ onClose }) {
  const { startChatWithUser } = useChat();
  const { user } = useAuth();
  const [searchEmail, setSearchEmail] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSearch = async (e) => {
    e?.preventDefault();
    const query = searchEmail.trim();
    if (!query) return;

    setIsSearching(true);
    setHasSearched(true);
    setErrorMsg('');

    try {
      const res = await searchUsersByEmail(query);
      if (res.success) {
        // Exclude current logged in user from results
        const filtered = (res.users || []).filter(
          (u) => u.email.toLowerCase() !== user?.email?.toLowerCase()
        );
        setSearchResults(filtered);
      } else {
        setErrorMsg(res.message || 'Error searching users');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Search failed');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectUser = (targetUser) => {
    startChatWithUser(targetUser);
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card pulse-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-row">
            <UserPlus size={20} className="modal-title-icon" />
            <h3>Start New Conversation</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <p className="modal-subtitle">
            Enter an email address to find a user and start messaging.
          </p>

          <form onSubmit={handleSearch} className="modal-search-form">
            <div className="input-group">
              <label htmlFor="user-email-search">User Email Address</label>
              <div className="modal-search-row">
                <div className="input-wrapper flex-1">
                  <Mail size={17} className="field-icon" />
                  <input
                    id="user-email-search"
                    type="text"
                    placeholder="e.g. user@example.com"
                    value={searchEmail}
                    onChange={(e) => setSearchEmail(e.target.value)}
                    autoFocus
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSearching || !searchEmail.trim()}
                  className="btn-search-atlas"
                >
                  {isSearching ? <Loader2 size={16} className="spinner-search" /> : <Search size={16} />}
                  <span>Search</span>
                </button>
              </div>
            </div>
          </form>

          {/* Error notice */}
          {errorMsg && (
            <div className="modal-alert error-alert">
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Results section */}
          <div className="search-results-container">
            {isSearching ? (
              <div className="searching-loader-row">
                <Loader2 size={20} className="spinner-search" />
                <span>Searching users...</span>
              </div>
            ) : searchResults.length > 0 ? (
              <div className="results-list">
                <span className="results-label">
                  <span>Search Results ({searchResults.length})</span>
                </span>
                {searchResults.map((matched) => (
                  <div
                    key={matched._id || matched.email}
                    className="modal-user-item"
                    onClick={() => handleSelectUser(matched)}
                  >
                    <div className="user-avatar-circle">
                      {matched.name ? matched.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div className="user-info-text">
                      <span className="user-name-bold">{matched.name}</span>
                      <span className="user-email-sub">{matched.email}</span>
                    </div>
                    <button type="button" className="btn-initiate-chat">
                      <span>Start Chat</span>
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              hasSearched && (
                <div className="no-user-found-box">
                  <Mail size={24} className="muted-icon" />
                  <h4>No matching user found</h4>
                  <p>
                    No user registered with email <strong>"{searchEmail}"</strong>.
                  </p>
                </div>
              )
            )}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
