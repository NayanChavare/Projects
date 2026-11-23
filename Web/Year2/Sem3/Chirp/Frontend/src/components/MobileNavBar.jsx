import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Hash, User, ShieldCheck, Feather, Sun, Moon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function MobileNavBar({ onOpenCreateModal, darkMode, setDarkMode }) {
  const { user, isAdmin } = useAuth();

  const navItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Explore', path: '/explore', icon: Hash },
    {
      name: 'Profile',
      path: user ? `/profile/${user.handle || user._id}` : '/login',
      icon: User,
    },
    ...(isAdmin
      ? [{ name: 'Admin', path: '/admin', icon: ShieldCheck, isBadge: true }]
      : []),
  ];

  return (
    <>
      {/* Floating Action Button (FAB) for quick Chirp compose on mobile */}
      <button
        type="button"
        className="mobile-fab-chirp"
        onClick={onOpenCreateModal}
        aria-label="New Chirp"
      >
        <Feather size={22} />
      </button>

      {/* Bottom Sticky Navigation Bar */}
      <nav className="mobile-bottom-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `mobile-nav-item ${isActive ? 'active' : ''}`
              }
            >
              <div className="mobile-nav-icon-wrap">
                <Icon size={22} />
                {item.isBadge && <span className="nav-admin-dot" />}
              </div>
              <span className="mobile-nav-label">{item.name}</span>
            </NavLink>
          );
        })}

        {/* Theme Mode Switcher */}
        {setDarkMode && (
          <button
            type="button"
            className="mobile-nav-item mobile-theme-btn"
            onClick={() => setDarkMode(!darkMode)}
            aria-label="Toggle Dark / Light Theme"
          >
            <div className="mobile-nav-icon-wrap">
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </div>
            <span className="mobile-nav-label">{darkMode ? 'Light' : 'Dark'}</span>
          </button>
        )}
      </nav>
    </>
  );
}
