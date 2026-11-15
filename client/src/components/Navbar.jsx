import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import {
  Menu, X, Bell, MessageSquare, User as UserIcon,
  LogOut, Shield, ChevronDown, Check, ExternalLink
} from 'lucide-react';
import bitmLogo from '../assets/images/bitm-logo.png';
import { resolveNotificationLink } from '../utils/notificationHelper';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { unreadCount, notifications, markAllAsRead, markAsRead } = useNotifications();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const userMenuRef = useRef(null);
  const notifMenuRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserDropdownOpen(false);
      }
      if (notifMenuRef.current && !notifMenuRef.current.contains(e.target)) {
        setNotifDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
    setNotifDropdownOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { label: 'Feed', path: '/feed' },
    { label: 'Explore', path: '/explore' },
    { label: 'Discussions', path: '/discussions' },
    { label: 'Projects', path: '/projects' },
    { label: 'Opportunities', path: '/opportunities' },
    { label: 'Events', path: '/events' },
  ];

  return (
    <header className="navbar-wrapper">
      <div className="navbar-container">
        {/* Brand Logo & Name */}
        <Link to={isAuthenticated ? "/dashboard" : "/"} className="navbar-brand">
          <img src={bitmLogo} alt="BITM Logo" className="brand-logo" />
          <div className="brand-text-block">
            <span className="brand-main-title">BITM Network</span>
            <span className="brand-sub-title">Ballari Institute of Tech &amp; Mgmt</span>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="desktop-nav">
          {navLinks.map((link) => {
            const isActive = location.pathname.startsWith(link.path);
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`nav-link ${isActive ? 'active' : ''}`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Action Items */}
        <div className="nav-actions">
          {isAuthenticated ? (
            <>
              {/* Messages Shortcut */}
              <Link to="/messages" className="icon-btn" title="Messages">
                <MessageSquare size={20} />
              </Link>

              {/* Notifications Dropdown */}
              <div className="dropdown-wrapper" ref={notifMenuRef}>
                <button
                  className="icon-btn"
                  onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                  title="Notifications"
                >
                  <Bell size={20} />
                  {unreadCount > 0 && (
                    <span className="notif-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
                  )}
                </button>

                {notifDropdownOpen && (
                  <div className="notif-dropdown">
                    <div className="notif-header">
                      <span>Notifications ({unreadCount} new)</span>
                      {unreadCount > 0 && (
                        <button className="mark-read-btn" onClick={markAllAsRead}>
                          <Check size={14} /> Mark all read
                        </button>
                      )}
                    </div>
                    <div className="notif-list">
                      {notifications.length === 0 ? (
                        <div className="notif-empty">No notifications yet</div>
                      ) : (
                        notifications.slice(0, 5).map((n) => (
                          <div
                            key={n._id}
                            className={`notif-item ${!n.read ? 'unread' : ''}`}
                            onClick={() => {
                              markAsRead(n._id);
                              const target = resolveNotificationLink(n);
                              navigate(target);
                              setNotifDropdownOpen(false);
                            }}
                          >
                            <p className="notif-msg">{n.message}</p>
                            <span className="notif-time">
                              {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                    <Link to="/notifications" className="notif-footer-link">
                      View all notifications
                    </Link>
                  </div>
                )}
              </div>

              {/* User Dropdown */}
              <div className="dropdown-wrapper" ref={userMenuRef}>
                <button
                  className="user-btn"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                >
                  {user.profilePicture ? (
                    <img src={user.profilePicture} alt={user.fullName} className="user-avatar" />
                  ) : (
                    <div className="user-avatar-fallback">
                      {user.fullName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="user-name">{user.fullName.split(' ')[0]}</span>
                  <ChevronDown size={15} />
                </button>

                {userDropdownOpen && (
                  <div className="user-dropdown">
                    <div className="user-dropdown-info">
                      <strong>{user.fullName}</strong>
                      <span className="user-subtext">{user.usn || user.email}</span>
                      <span className="user-dept">{user.department}</span>
                    </div>
                    <div className="dropdown-divider"></div>
                    <Link to="/dashboard" className="dropdown-link">
                      Dashboard
                    </Link>
                    <Link to="/profile" className="dropdown-link">
                      My Profile
                    </Link>
                    <Link to="/connections" className="dropdown-link">
                      My Network
                    </Link>
                    {isAdmin && (
                      <Link to="/admin" className="dropdown-link admin-link">
                        <Shield size={16} /> Admin Portal
                      </Link>
                    )}
                    <Link to="/settings" className="dropdown-link">
                      Settings
                    </Link>
                    <div className="dropdown-divider"></div>
                    <button onClick={handleLogout} className="dropdown-link logout-btn">
                      <LogOut size={16} /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="auth-btns">
              <Link to="/login" className="btn btn-outline-primary btn-sm">
                Log In
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Join BITM Network
              </Link>
            </div>
          )}

          {/* Mobile Hamburger Toggle */}
          <button
            className="mobile-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="mobile-drawer">
          <nav className="mobile-nav">
            {navLinks.map((link) => (
              <Link key={link.path} to={link.path} className="mobile-nav-link">
                {link.label}
              </Link>
            ))}
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="mobile-nav-link">Dashboard</Link>
                <Link to="/profile" className="mobile-nav-link">My Profile</Link>
                <Link to="/messages" className="mobile-nav-link">Messages</Link>
                <Link to="/notifications" className="mobile-nav-link">Notifications</Link>
                {isAdmin && (
                  <Link to="/admin" className="mobile-nav-link admin-link">
                    <Shield size={16} /> Admin Portal
                  </Link>
                )}
                <button onClick={handleLogout} className="mobile-nav-link logout-btn">
                  Sign Out
                </button>
              </>
            ) : (
              <div className="mobile-auth-btns">
                <Link to="/login" className="btn btn-outline-primary">Log In</Link>
                <Link to="/register" className="btn btn-primary">Join BITM Network</Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;
