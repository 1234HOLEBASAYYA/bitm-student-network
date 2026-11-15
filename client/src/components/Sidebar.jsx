import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import {
  Home, User, Users, MessageSquare, Flame, HelpCircle,
  FolderGit2, Briefcase, Calendar, Bell, Settings, LogOut,
  Shield, CheckCircle2
} from 'lucide-react';
import '../styles/sidebar.css';

const Sidebar = () => {
  const { user, isAdmin, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Home', path: '/dashboard', icon: <Home size={18} /> },
    { label: 'My Profile', path: '/profile', icon: <User size={18} /> },
    { label: 'Explore Students', path: '/explore', icon: <Users size={18} /> },
    { label: 'Community Feed', path: '/feed', icon: <Flame size={18} /> },
    { label: 'Discussions', path: '/discussions', icon: <HelpCircle size={18} /> },
    { label: 'Projects', path: '/projects', icon: <FolderGit2 size={18} /> },
    { label: 'Opportunities', path: '/opportunities', icon: <Briefcase size={18} /> },
    { label: 'Events', path: '/events', icon: <Calendar size={18} /> },
    { label: 'Messages', path: '/messages', icon: <MessageSquare size={18} /> },
    {
      label: 'Notifications',
      path: '/notifications',
      icon: <Bell size={18} />,
      badge: unreadCount > 0 ? unreadCount : null
    },
    { label: 'Settings', path: '/settings', icon: <Settings size={18} /> },
  ];

  const completion = user.profileCompletion || 60;

  return (
    <aside className="sidebar-wrapper card">
      {/* Student Profile Overview Card */}
      <div className="sidebar-profile-card">
        <div className="sidebar-avatar-container">
          {user.profilePicture ? (
            <img src={user.profilePicture} alt={user.fullName} className="sidebar-avatar" />
          ) : (
            <div className="sidebar-avatar-fallback">
              {user.fullName.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <h4 className="sidebar-name">{user.fullName}</h4>
        <span className="sidebar-usn">{user.usn || user.email}</span>
        <span className="sidebar-dept">{user.department}</span>

        {/* Profile Completion Indicator */}
        <div className="sidebar-completion-box">
          <div className="completion-header">
            <span>Profile Completion</span>
            <span className="completion-pct">{completion}%</span>
          </div>
          <div className="progress-bar-bg">
            <div
              className="progress-bar-fill"
              style={{ width: `${completion}%` }}
            ></div>
          </div>
        </div>
      </div>

      <div className="sidebar-divider"></div>

      {/* 12 Navigation Links */}
      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <span className="sidebar-link-icon">{item.icon}</span>
            <span className="sidebar-link-text">{item.label}</span>
            {item.badge && (
              <span className="sidebar-badge">{item.badge}</span>
            )}
          </NavLink>
        ))}

        {isAdmin && (
          <NavLink
            to="/admin"
            className={({ isActive }) => `sidebar-link admin-nav-link ${isActive ? 'active' : ''}`}
          >
            <span className="sidebar-link-icon"><Shield size={18} /></span>
            <span className="sidebar-link-text">Admin Dashboard</span>
          </NavLink>
        )}

        {/* 12. Logout */}
        <button onClick={handleLogout} className="sidebar-link sidebar-logout-btn">
          <span className="sidebar-link-icon"><LogOut size={18} /></span>
          <span className="sidebar-link-text">Logout</span>
        </button>
      </nav>
    </aside>
  );
};

export default Sidebar;
