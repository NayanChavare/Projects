import React, { useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import { ChatArea } from '../components/ChatArea';
import { NewChatModal } from '../components/NewChatModal';
import { ProfileModal } from '../components/ProfileModal';

export function ChatPage({ darkMode, setDarkMode }) {
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState(null);

  const handleOpenMyProfile = () => {
    setSelectedProfile(null);
    setIsProfileOpen(true);
  };

  const handleOpenContactProfile = (target) => {
    setSelectedProfile(target);
    setIsProfileOpen(true);
  };

  return (
    <div className="pulse-app-container">
      <main className="pulse-window">
        <Sidebar
          onOpenNewChat={() => setIsNewChatOpen(true)}
          onOpenProfile={handleOpenMyProfile}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
        />
        <ChatArea
          onOpenProfile={handleOpenContactProfile}
          onOpenNewChat={() => setIsNewChatOpen(true)}
        />
      </main>

      {/* New Chat / Create Group Modal */}
      {isNewChatOpen && (
        <NewChatModal onClose={() => setIsNewChatOpen(false)} />
      )}

      {/* Profile / Contact Info Modal */}
      {isProfileOpen && (
        <ProfileModal
          onClose={() => setIsProfileOpen(false)}
          targetProfile={selectedProfile}
        />
      )}
    </div>
  );
}
