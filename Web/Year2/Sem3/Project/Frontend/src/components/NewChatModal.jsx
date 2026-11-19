import React, { useState } from 'react';
import { useChat } from '../context/ChatContext';
import { useAuth } from '../context/AuthContext';
import { searchUsersByEmail } from '../services/api';
import { X, UserPlus, Search, Mail, Loader2, Users, Plus } from 'lucide-react';

export function NewChatModal({ onClose }) {
  const { startChatWithUser, createGroup } = useChat();
  const { user } = useAuth();

  // Tab: 'direct' or 'group'
  const [activeTab, setActiveTab] = useState('direct');

  // Direct chat search state
  const [searchEmail, setSearchEmail] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Group creation state
  const [groupName, setGroupName] = useState('');
  const [groupDesc, setGroupDesc] = useState('');
  const [memberSearch, setMemberSearch] = useState('');
  const [memberSearchResults, setMemberSearchResults] = useState([]);
  const [isMemberSearching, setIsMemberSearching] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [groupError, setGroupError] = useState('');

  // Search user for direct chat
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

  // Search user to add to group
  const handleMemberSearch = async (e) => {
    e?.preventDefault();
    const query = memberSearch.trim();
    if (!query) return;

    setIsMemberSearching(true);
    try {
      const res = await searchUsersByEmail(query);
      if (res.success) {
        const filtered = (res.users || []).filter(
          (u) =>
            u.email.toLowerCase() !== user?.email?.toLowerCase() &&
            !selectedMembers.some((m) => m.email.toLowerCase() === u.email.toLowerCase())
        );
        setMemberSearchResults(filtered);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsMemberSearching(false);
    }
  };

  const handleAddMember = (member) => {
    setSelectedMembers((prev) => [...prev, member]);
    setMemberSearchResults((prev) => prev.filter((m) => m.email !== member.email));
  };

  const handleRemoveMember = (email) => {
    setSelectedMembers((prev) => prev.filter((m) => m.email !== email));
  };

  // Submit group creation
  const handleCreateGroup = async (e) => {
    e?.preventDefault();
    if (!groupName.trim()) {
      setGroupError('Group name is required');
      return;
    }

    setIsCreatingGroup(true);
    setGroupError('');

    try {
      const memberEmails = selectedMembers.map((m) => m.email);
      const res = await createGroup({
        name: groupName.trim(),
        description: groupDesc.trim(),
        members: memberEmails,
      });

      if (res.success) {
        onClose();
      } else {
        setGroupError(res.message || 'Failed to create group');
      }
    } catch (err) {
      setGroupError(err.message || 'Failed to create group');
    } finally {
      setIsCreatingGroup(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card pulse-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-row">
            {activeTab === 'direct' ? (
              <UserPlus size={20} className="modal-title-icon" />
            ) : (
              <Users size={20} className="modal-title-icon" />
            )}
            <h3>{activeTab === 'direct' ? 'New Direct Conversation' : 'Create New Group'}</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="chat-filter-tabs" style={{ padding: '4px 20px 12px', borderBottom: '1px solid var(--border-light)' }}>
          <button
            type="button"
            className={`filter-pill ${activeTab === 'direct' ? 'active' : ''}`}
            onClick={() => setActiveTab('direct')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <UserPlus size={15} />
            Direct Chat
          </button>
          <button
            type="button"
            className={`filter-pill ${activeTab === 'group' ? 'active' : ''}`}
            onClick={() => setActiveTab('group')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <Users size={15} />
            Group Chat
          </button>
        </div>

        <div className="modal-body">
          {activeTab === 'direct' ? (
            <>
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
            </>
          ) : (
            <>
              {/* Group Creation Form */}
              <p className="modal-subtitle">
                Create a real-time group for team chats, project discussions, or friends.
              </p>

              <form onSubmit={handleCreateGroup} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="input-group">
                  <label htmlFor="group-name-input">Group Name *</label>
                  <div className="input-wrapper">
                    <Users size={17} className="field-icon" />
                    <input
                      id="group-name-input"
                      type="text"
                      placeholder="e.g. Web Dev Project Team"
                      value={groupName}
                      onChange={(e) => setGroupName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="input-group">
                  <label htmlFor="group-desc-input">Topic / Description (Optional)</label>
                  <div className="input-wrapper">
                    <input
                      id="group-desc-input"
                      type="text"
                      placeholder="e.g. Discussing assignment and project code"
                      value={groupDesc}
                      onChange={(e) => setGroupDesc(e.target.value)}
                    />
                  </div>
                </div>

                {/* Add Members Search */}
                <div className="input-group">
                  <label>Add Members by Email</label>
                  <div className="modal-search-row">
                    <div className="input-wrapper flex-1">
                      <Mail size={17} className="field-icon" />
                      <input
                        type="text"
                        placeholder="Search member email..."
                        value={memberSearch}
                        onChange={(e) => setMemberSearch(e.target.value)}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleMemberSearch}
                      disabled={isMemberSearching || !memberSearch.trim()}
                      className="btn-search-atlas"
                    >
                      {isMemberSearching ? <Loader2 size={15} className="spinner-search" /> : <Search size={15} />}
                      <span>Find</span>
                    </button>
                  </div>
                </div>

                {/* Search member candidates */}
                {memberSearchResults.length > 0 && (
                  <div style={{ maxHeight: '120px', overflowY: 'auto', border: '1px solid var(--border-light)', borderRadius: '8px', padding: '6px' }}>
                    {memberSearchResults.map((m) => (
                      <div
                        key={m.email}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '6px 10px',
                          borderRadius: '6px',
                          backgroundColor: 'var(--bg-hover-chat, #f8fafc)',
                          marginBottom: '4px',
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '13px' }}>{m.name}</div>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted, #6b7280)' }}>{m.email}</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleAddMember(m)}
                          className="btn-initiate-chat"
                          style={{ padding: '4px 10px', fontSize: '12px' }}
                        >
                          <Plus size={13} /> Add
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Selected Members Chips */}
                {selectedMembers.length > 0 && (
                  <div>
                    <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                      Selected Members ({selectedMembers.length}):
                    </label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {selectedMembers.map((m) => (
                        <span
                          key={m.email}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            backgroundColor: 'var(--bg-pill-active, #d1fae5)',
                            color: 'var(--text-pill-active, #065f46)',
                            padding: '4px 10px',
                            borderRadius: '16px',
                            fontSize: '12px',
                            fontWeight: 500,
                          }}
                        >
                          {m.name || m.email}
                          <button
                            type="button"
                            onClick={() => handleRemoveMember(m.email)}
                            style={{
                              border: 'none',
                              background: 'none',
                              cursor: 'pointer',
                              color: 'inherit',
                              padding: 0,
                              display: 'flex',
                              alignItems: 'center',
                            }}
                          >
                            <X size={12} />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {groupError && (
                  <div className="modal-alert error-alert">
                    <span>{groupError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isCreatingGroup || !groupName.trim()}
                  className="btn-search-atlas"
                  style={{
                    padding: '12px 20px',
                    borderRadius: '8px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    marginTop: '8px',
                    width: '100%',
                  }}
                >
                  {isCreatingGroup ? <Loader2 size={16} className="spinner-search" /> : <Users size={16} />}
                  <span>Create Group</span>
                </button>
              </form>
            </>
          )}

          <div className="modal-footer" style={{ marginTop: '16px' }}>
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
