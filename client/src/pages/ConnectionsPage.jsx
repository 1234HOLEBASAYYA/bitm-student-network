import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../services/api';
import {
  Users, UserCheck, Check, X, MessageSquare, Trash2,
  Clock, ArrowLeft, ExternalLink, ShieldCheck
} from 'lucide-react';
import '../styles/network.css';

const ConnectionsPage = () => {
  const [activeTab, setActiveTab] = useState('connections'); // 'connections', 'received', 'sent'
  const [connections, setConnections] = useState([]);
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [connRes, reqRes] = await Promise.all([
        api.get('/connections'),
        api.get('/connections/requests')
      ]);

      if (connRes.data.success) setConnections(connRes.data.connections);
      if (reqRes.data.success) {
        setReceivedRequests(reqRes.data.received);
        setSentRequests(reqRes.data.sent);
      }
    } catch (err) {
      console.error('Error fetching connection network:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRespondRequest = async (requestId, action) => {
    try {
      const res = await api.put(`/connections/request/${requestId}`, { action });
      if (res.data.success) {
        // Refresh data
        fetchData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error processing request');
    }
  };

  const handleRemoveConnection = async (targetUserId, studentName) => {
    if (!window.confirm(`Are you sure you want to remove ${studentName} from your connections?`)) return;
    try {
      const res = await api.delete(`/connections/${targetUserId}`);
      if (res.data.success) {
        setConnections((prev) => prev.filter((c) => c.user._id !== targetUserId));
      }
    } catch (err) {
      alert('Error removing connection');
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="dashboard-main network-page">
        {/* Navigation Header */}
        <div className="card network-header-card">
          <div className="network-header-title">
            <h2>My Student Network</h2>
            <p>Manage your connected peers and respond to pending collaboration invitations.</p>
          </div>
          <Link to="/explore" className="btn btn-primary btn-sm">
            <Users size={16} /> Explore More Students
          </Link>
        </div>

        {/* Network Tabs */}
        <div className="network-tabs-bar">
          <button
            className={`net-tab-btn ${activeTab === 'connections' ? 'active' : ''}`}
            onClick={() => setActiveTab('connections')}
          >
            Connected Students ({connections.length})
          </button>
          <button
            className={`net-tab-btn ${activeTab === 'received' ? 'active' : ''}`}
            onClick={() => setActiveTab('received')}
          >
            Invitations Received ({receivedRequests.length})
            {receivedRequests.length > 0 && <span className="tab-bubble">{receivedRequests.length}</span>}
          </button>
          <button
            className={`net-tab-btn ${activeTab === 'sent' ? 'active' : ''}`}
            onClick={() => setActiveTab('sent')}
          >
            Sent Requests ({sentRequests.length})
          </button>
        </div>

        {loading ? (
          <LoadingSpinner text="Loading your network..." />
        ) : (
          <>
            {/* Tab 1: Connected Students */}
            {activeTab === 'connections' && (
              <div className="connections-container">
                {connections.length === 0 ? (
                  <div className="card empty-state">
                    <Users className="empty-state-icon" />
                    <h3>No Connections Yet</h3>
                    <p>Expand your college network by exploring students from your branch and other departments.</p>
                    <Link to="/explore" className="btn btn-primary btn-sm">
                      Find Students to Connect
                    </Link>
                  </div>
                ) : (
                  <div className="student-cards-grid">
                    {connections.map(({ user, connectionId, connectedSince }) => (
                      <div key={user._id} className="card student-card">
                        <div className="student-card-top">
                          <div className="student-avatar-box">
                            {user.profilePicture ? (
                              <img src={user.profilePicture} alt={user.fullName} className="student-avatar" />
                            ) : (
                              <div className="student-avatar-fallback">{user.fullName.charAt(0)}</div>
                            )}
                          </div>
                          <span className="student-usn-badge">{user.usn}</span>
                        </div>

                        <div className="student-card-info">
                          <Link to={`/profile/${user._id}`} className="student-name">
                            {user.fullName}
                          </Link>
                          <span className="student-dept">{user.department}</span>
                          <span className="student-sem-sec">
                            Semester {user.semester || 1} • Section {user.section || 'A'}
                          </span>

                          <div className="connection-since-tag">
                            Connected since {new Date(connectedSince).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                          </div>
                        </div>

                        <div className="student-card-actions">
                          <Link to="/messages" className="btn btn-primary btn-sm">
                            <MessageSquare size={14} /> Message
                          </Link>
                          <button
                            className="btn btn-outline btn-sm delete-btn"
                            onClick={() => handleRemoveConnection(user._id, user.fullName)}
                            title="Remove connection"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tab 2: Received Requests */}
            {activeTab === 'received' && (
              <div className="requests-container">
                {receivedRequests.length === 0 ? (
                  <div className="card empty-state">
                    <Check className="empty-state-icon" style={{ color: '#10b981' }} />
                    <h3>No Pending Invitations</h3>
                    <p>You have responded to all received student connection requests.</p>
                  </div>
                ) : (
                  <div className="requests-list">
                    {receivedRequests.map((req) => (
                      <div key={req._id} className="card request-card">
                        <div className="request-user-info">
                          {req.sender?.profilePicture ? (
                            <img src={req.sender.profilePicture} alt={req.sender.fullName} className="req-avatar" />
                          ) : (
                            <div className="req-avatar-fallback">{req.sender?.fullName?.charAt(0) || 'S'}</div>
                          )}
                          <div>
                            <Link to={`/profile/${req.sender?._id}`} className="req-name">
                              {req.sender?.fullName}
                            </Link>
                            <span className="req-sub">
                              {req.sender?.department} • Sem {req.sender?.semester} ({req.sender?.usn})
                            </span>
                            {req.message && (
                              <p className="req-message-bubble">"{req.message}"</p>
                            )}
                          </div>
                        </div>

                        <div className="request-actions">
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => handleRespondRequest(req._id, 'accept')}
                          >
                            <Check size={14} /> Accept
                          </button>
                          <button
                            className="btn btn-outline btn-sm"
                            onClick={() => handleRespondRequest(req._id, 'reject')}
                          >
                            <X size={14} /> Ignore
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tab 3: Sent Requests */}
            {activeTab === 'sent' && (
              <div className="sent-container">
                {sentRequests.length === 0 ? (
                  <div className="card empty-state">
                    <Clock className="empty-state-icon" />
                    <h3>No Sent Requests Pending</h3>
                    <p>You do not have any pending connection requests waiting for approval.</p>
                  </div>
                ) : (
                  <div className="requests-list">
                    {sentRequests.map((req) => (
                      <div key={req._id} className="card request-card">
                        <div className="request-user-info">
                          {req.receiver?.profilePicture ? (
                            <img src={req.receiver.profilePicture} alt={req.receiver.fullName} className="req-avatar" />
                          ) : (
                            <div className="req-avatar-fallback">{req.receiver?.fullName?.charAt(0) || 'S'}</div>
                          )}
                          <div>
                            <Link to={`/profile/${req.receiver?._id}`} className="req-name">
                              {req.receiver?.fullName}
                            </Link>
                            <span className="req-sub">
                              {req.receiver?.department} • Sem {req.receiver?.semester} ({req.receiver?.usn})
                            </span>
                            <span className="sent-time-tag">
                              Sent {new Date(req.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        <div className="request-actions">
                          <span className="badge badge-warning">Awaiting Response</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default ConnectionsPage;
