import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Home,
  Hash,
  User,
  ShieldCheck,
  LogOut,
  Feather,
  Sun,
  Moon,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function Sidebar({ darkMode, setDarkMode, onOpenCreateModal }) {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Explore', path: '/explore', icon: Hash },
    {
      name: 'Profile',
      path: user ? `/profile/${user.handle || user._id}` : '/login',
      icon: User,
    },
    ...(isAdmin
      ? [{ name: 'Admin Hub', path: '/admin', icon: ShieldCheck, isBadge: true }]
      : []),
  ];

  return (
    <aside className="sidebar-container">
      {/* Brand Logo */}
      <div className="brand-header" onClick={() => navigate('/')}>
        <div className="logo-bubble">
          <Feather className="brand-icon" size={26} />
        </div>
        <span className="brand-title">Chirp</span>
      </div>

      {/* Navigation Links */}
      <nav className="nav-links">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <div className="nav-icon-wrapper">
                <Icon size={24} />
                {item.isBadge && <span className="nav-admin-dot" />}
              </div>
              <span className="nav-label">{item.name}</span>
            </NavLink>
          );
        })}

        {/* Theme Toggle Button */}
        <button
          type="button"
          className="nav-item theme-toggle-btn"
          onClick={() => setDarkMode(!darkMode)}
          title={`Switch to ${darkMode ? 'Light' : 'Dark'} mode`}
        >
          <div className="nav-icon-wrapper">
            {darkMode ? <Sun size={24} /> : <Moon size={24} />}
          </div>
          <span className="nav-label">{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
        </button>
      </nav>

      {/* Primary Chirp Action Button */}
      <button
        type="button"
        className="primary-chirp-btn"
        onClick={() => {
          if (onOpenCreateModal) onOpenCreateModal();
          else {
            const composer = document.getElementById('main-chirp-composer');
            if (composer) {
              composer.focus();
              composer.scrollIntoView({ behavior: 'smooth' });
            } else {
              navigate('/');
            }
          }
        }}
      >
        <Feather className="btn-icon" size={20} />
        <span className="btn-text">Chirp</span>
      </button>

      {/* User Profile Pill at Bottom */}
      {user && (
        <div className="sidebar-footer">
          <div
            className="user-pill"
            onClick={() => setShowUserMenu(!showUserMenu)}
          >
            <img
              src={user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`}
              alt={user.name}
              className="user-avatar"
            />
            <div className="user-info">
              <div className="user-name-row">
                <span className="user-name">{user.name}</span>
                {isAdmin && (
                  <span className="role-pill admin-pill" title="Campus Administrator">
                    <ShieldCheck size={11} /> Admin
                  </span>
                )}
              </div>
              <span className="user-handle">@{user.handle || 'student'}</span>
            </div>
            <button
              type="button"
              className="logout-mini-btn"
              onClick={(e) => {
                e.stopPropagation();
                handleLogout();
              }}
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}
