import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useNotifications } from '../context/NotificationContext';
import {
  Bell, Check, Trash2, UserPlus, Heart, MessageSquare,
  Award, Calendar, ShieldCheck, ArrowRight
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import { resolveNotificationLink } from '../utils/notificationHelper';

const NotificationsPage = () => {
  const { notifications, unreadCount, loading, markAllAsRead, markAsRead } = useNotifications();
  const navigate = useNavigate();

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'connection_request':
      case 'connection_accepted':
        return <UserPlus size={18} style={{ color: '#0066cc' }} />;
      case 'post_like':
        return <Heart size={18} style={{ color: '#ef4444' }} />;
      case 'post_comment':
        return <MessageSquare size={18} style={{ color: '#10b981' }} />;
      case 'project_collab_request':
      case 'project_collab_accepted':
        return <Award size={18} style={{ color: '#f59e0b' }} />;
      case 'admin_announcement':
        return <ShieldCheck size={18} style={{ color: '#7c3aed' }} />;
      default:
        return <Bell size={18} style={{ color: '#003366' }} />;
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="dashboard-main">
        <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px' }}>
          <div>
            <h2 style={{ fontSize: '1.45rem', color: '#003366', marginBottom: '4px' }}>Notifications</h2>
            <p style={{ fontSize: '0.9rem', color: '#64748b' }}>
              Stay updated on peer interactions, connection status, comments, and campus alerts.
            </p>
          </div>
          {unreadCount > 0 && (
            <button className="btn btn-outline-primary btn-sm" onClick={markAllAsRead}>
              <Check size={14} /> Mark all read
            </button>
          )}
        </div>

        {loading ? (
          <LoadingSpinner text="Fetching notifications..." />
        ) : notifications.length === 0 ? (
          <div className="card empty-state">
            <Bell className="empty-state-icon" />
            <h3>No Notifications</h3>
            <p>You have caught up with all campus alerts, connection requests, and messages!</p>
          </div>
        ) : (
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            {notifications.map((n) => (
              <div
                key={n._id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  padding: '16px 24px',
                  borderBottom: '1px solid #f1f5f9',
                  background: n.read ? '#ffffff' : '#f0f7ff',
                  cursor: 'pointer',
                  transition: 'background 0.2s ease'
                }}
                onClick={() => {
                  markAsRead(n._id);
                  const target = resolveNotificationLink(n);
                  navigate(target);
                }}
              >
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  {getNotificationIcon(n.type)}
                </div>

                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '0.92rem', color: '#1e293b', fontWeight: n.read ? 500 : 700, margin: 0 }}>
                    {n.message}
                  </p>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                    {new Date(n.createdAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>

                {n.link && (
                  <ArrowRight size={16} style={{ color: '#94a3b8' }} />
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default NotificationsPage;
