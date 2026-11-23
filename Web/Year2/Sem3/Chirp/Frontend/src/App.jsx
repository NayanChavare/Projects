import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';

import { Sidebar } from './components/Sidebar';
import { RightRail } from './components/RightRail';
import { CreatePostBox } from './components/CreatePostBox';
import { MobileNavBar } from './components/MobileNavBar';

import { HomePage } from './pages/HomePage';
import { ExplorePage } from './pages/ExplorePage';
import { HashtagPage } from './pages/HashtagPage';
import { ProfilePage } from './pages/ProfilePage';
import { AdminPage } from './pages/AdminPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';

import { X } from 'lucide-react';
import './App.css';

// Protected Route Guard
function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) {
    return <div className="app-loading-screen"><div className="spinner-lg" /></div>;
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

// Public Route Guard (redirect to / if already logged in)
function PublicRoute({ children }) {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  return children;
}

// Authenticated Layout Shell (Sidebar | Main Feed | RightRail + Mobile Bottom Bar)
function AppLayout({ darkMode, setDarkMode }) {
  const [isComposeModalOpen, setIsComposeModalOpen] = useState(false);

  return (
    <div className="chirp-app-shell">
      {/* Column 1: Left Navigation Sidebar (Desktop & Tablet) */}
      <Sidebar
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        onOpenCreateModal={() => setIsComposeModalOpen(true)}
      />

      {/* Column 2: Center Main Content Stage */}
      <main className="main-content-stage">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/hashtag/:tag" element={<HashtagPage />} />
          <Route path="/profile/:identifier" element={<ProfilePage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Column 3: Right Trending Rail (Desktop) */}
      <RightRail />

      {/* Mobile Navigation Bar & Floating Action Button */}
      <MobileNavBar
        onOpenCreateModal={() => setIsComposeModalOpen(true)}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />

      {/* Quick Compose Modal (from + Chirp button) */}
      {isComposeModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsComposeModalOpen(false)}>
          <div
            className="modal-card compose-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2 className="modal-title">New Campus Chirp</h2>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setIsComposeModalOpen(false)}
              >
                <X size={20} />
              </button>
            </div>
            <CreatePostBox
              onPostCreated={() => {
                setIsComposeModalOpen(false);
              }}
              placeholder="What's your hot take on campus today?"
            />
          </div>
        </div>
      )}
    </div>
  );
}

export function App() {
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('chirp_theme_mode') !== 'light'; // default dark
  });

  useEffect(() => {
    localStorage.setItem('chirp_theme_mode', darkMode ? 'dark' : 'light');
    if (darkMode) {
      document.documentElement.classList.add('dark-theme');
      document.documentElement.classList.remove('light-theme');
    } else {
      document.documentElement.classList.add('light-theme');
      document.documentElement.classList.remove('dark-theme');
    }
  }, [darkMode]);

  return (
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <div className={`chirp-root ${darkMode ? 'dark-theme' : 'light-theme'}`}>
            <Routes>
              {/* Public Auth Routes */}
              <Route
                path="/login"
                element={
                  <PublicRoute>
                    <LoginPage />
                  </PublicRoute>
                }
              />
              <Route
                path="/signup"
                element={
                  <PublicRoute>
                    <SignupPage />
                  </PublicRoute>
                }
              />
              <Route path="/register" element={<Navigate to="/signup" replace />} />

              {/* Protected App Routes */}
              <Route
                path="/*"
                element={
                  <ProtectedRoute>
                    <AppLayout darkMode={darkMode} setDarkMode={setDarkMode} />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </div>
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
