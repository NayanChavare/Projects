import React, { useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import { ChatArea } from '../components/ChatArea';
import { NewChatModal } from '../components/NewChatModal';
import { ProfileModal } from '../components/ProfileModal';

export function ChatPage({ darkMode, setDarkMode }) {
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  return (
    <div className="pulse-app-container">
      <div className="pulse-background-strip"></div>

      <main className="pulse-window">
        <Sidebar
          onOpenNewChat={() => setIsNewChatOpen(true)}
          onOpenProfile={() => setIsProfileOpen(true)}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
        />
        <ChatArea onOpenProfile={() => setIsProfileOpen(true)} />
      </main>

      {/* New Chat Modal */}
      {isNewChatOpen && (
        <NewChatModal onClose={() => setIsNewChatOpen(false)} />
      )}

      {/* Profile Modal */}
      {isProfileOpen && (
        <ProfileModal onClose={() => setIsProfileOpen(false)} />
      )}
    </div>
  );
}
