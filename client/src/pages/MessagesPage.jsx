import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../services/api';
import {
  MessageSquare, Send, Users, Search, CheckCheck, Clock, UserCheck
} from 'lucide-react';
import '../styles/messages.css';

const MessagesPage = () => {
  const { user } = useAuth();
  const { userId: paramUserId } = useParams();
  const [conversations, setConversations] = useState([]);
  const [activeConversationUser, setActiveConversationUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessageText, setNewMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState('');

  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Fetch conversations list
  const fetchConversations = async () => {
    try {
      setLoading(true);
      const res = await api.get('/messages/conversations');
      if (res.data.success) {
        setConversations(res.data.conversations);
        if (paramUserId) {
          const match = res.data.conversations.find((c) => c.user._id === paramUserId);
          if (match) {
            setActiveConversationUser(match.user);
          } else {
            try {
              const uRes = await api.get(`/users/${paramUserId}`);
              if (uRes.data.success && uRes.data.user) {
                setActiveConversationUser(uRes.data.user);
              }
            } catch (err) {
              console.error('Target user fetch error:', err);
            }
          }
        } else if (!activeConversationUser && res.data.conversations.length > 0) {
          setActiveConversationUser(res.data.conversations[0].user);
        }
      }
    } catch (err) {
      console.error('Error fetching conversations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, [paramUserId]);

  // Fetch messages when active user changes
  useEffect(() => {
    if (!activeConversationUser) return;

    const fetchMessages = async () => {
      try {
        const res = await api.get(`/messages/${activeConversationUser._id}`);
        if (res.data.success) {
          setMessages(res.data.messages);
          scrollToBottom();
          // Reset unread count for this conversation in list
          setConversations((prev) =>
            prev.map((c) =>
              c.user._id === activeConversationUser._id ? { ...c, unreadCount: 0 } : c
            )
          );
        }
      } catch (err) {
        console.error('Error fetching messages:', err);
      }
    };

    fetchMessages();
  }, [activeConversationUser]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Send message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessageText.trim() || !activeConversationUser) return;

    const textToSend = newMessageText.trim();
    setNewMessageText('');

    try {
      setSending(true);
      const res = await api.post(`/messages/${activeConversationUser._id}`, {
        text: textToSend
      });

      if (res.data.success) {
        setMessages((prev) => [...prev, res.data.message]);
        // Update last message in conversation list
        setConversations((prev) =>
          prev.map((c) =>
            c.user._id === activeConversationUser._id
              ? {
                  ...c,
                  lastMessage: textToSend,
                  lastMessageTime: new Date().toISOString()
                }
              : c
          )
        );
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error sending message');
    } finally {
      setSending(false);
    }
  };

  const filteredConversations = conversations.filter((c) =>
    c.user.fullName.toLowerCase().includes(search.toLowerCase()) ||
    c.user.department?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="dashboard-main messages-page-main">
        <div className="card messenger-container">
          {/* Left Panel: Conversations List */}
          <div className="messenger-sidebar">
            <div className="messenger-sidebar-header">
              <h3>Student Chat</h3>
              <span className="badge badge-dept">{conversations.length} Connected</span>
            </div>

            <div className="convo-search-box">
              <Search size={16} className="convo-search-icon" />
              <input
                type="text"
                placeholder="Search connected peers..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="convo-search-input"
              />
            </div>

            {loading ? (
              <LoadingSpinner text="Loading peers..." />
            ) : conversations.length === 0 ? (
              <div className="no-convos-state">
                <Users size={32} style={{ color: '#94a3b8', marginBottom: '8px' }} />
                <p>No connections yet.</p>
                <p className="no-convos-sub">
                  Connect with students in the Explore tab to start private chats.
                </p>
              </div>
            ) : (
              <div className="conversations-scroll-list">
                {filteredConversations.map((convo) => {
                  const isActive = activeConversationUser?._id === convo.user._id;

                  return (
                    <div
                      key={convo.user._id}
                      className={`conversation-tab-item ${isActive ? 'active' : ''}`}
                      onClick={() => setActiveConversationUser(convo.user)}
                    >
                      <div className="convo-avatar-wrapper">
                        {convo.user.profilePicture ? (
                          <img
                            src={convo.user.profilePicture}
                            alt={convo.user.fullName}
                            className="convo-avatar"
                          />
                        ) : (
                          <div className="convo-avatar-fallback">
                            {convo.user.fullName.charAt(0)}
                          </div>
                        )}
                        {convo.unreadCount > 0 && (
                          <span className="unread-dot">{convo.unreadCount}</span>
                        )}
                      </div>

                      <div className="convo-details">
                        <div className="convo-details-top">
                          <span className="convo-name">{convo.user.fullName}</span>
                          {convo.lastMessageTime && (
                            <span className="convo-time">
                              {new Date(convo.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          )}
                        </div>
                        <span className="convo-dept">{convo.user.department?.split(' ')[0]}</span>
                        <p className="convo-preview">
                          {convo.lastMessage || 'Click to begin messaging'}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Panel: Active Chat Thread */}
          <div className="messenger-thread-panel">
            {activeConversationUser ? (
              <>
                {/* Chat Top Header */}
                <div className="thread-top-bar">
                  <div className="thread-user-info">
                    {activeConversationUser.profilePicture ? (
                      <img
                        src={activeConversationUser.profilePicture}
                        alt={activeConversationUser.fullName}
                        className="thread-user-avatar"
                      />
                    ) : (
                      <div className="thread-user-fallback">
                        {activeConversationUser.fullName.charAt(0)}
                      </div>
                    )}
                    <div>
                      <h4 className="thread-user-name">{activeConversationUser.fullName}</h4>
                      <span className="thread-user-dept">
                        {activeConversationUser.department} • {activeConversationUser.usn}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Messages Body */}
                <div className="messages-stream-box">
                  {messages.length === 0 ? (
                    <div className="empty-thread-state">
                      <p>This is the start of your message history with {activeConversationUser.fullName}.</p>
                      <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                        Say hello and discuss your BITM projects or studies!
                      </span>
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const isMe = msg.sender?._id === user._id || msg.sender === user._id;

                      return (
                        <div
                          key={msg._id}
                          className={`message-bubble-row ${isMe ? 'outgoing' : 'incoming'}`}
                        >
                          <div className={`message-bubble ${isMe ? 'mine' : 'theirs'}`}>
                            <p className="msg-text">{msg.text}</p>
                            <span className="msg-timestamp">
                              {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input Box */}
                <form onSubmit={handleSendMessage} className="message-composer-bar">
                  <input
                    type="text"
                    placeholder={`Message ${activeConversationUser.fullName.split(' ')[0]}...`}
                    value={newMessageText}
                    onChange={(e) => setNewMessageText(e.target.value)}
                    className="composer-input"
                  />
                  <button
                    type="submit"
                    className="btn btn-primary btn-sm composer-send-btn"
                    disabled={sending || !newMessageText.trim()}
                  >
                    <Send size={16} />
                  </button>
                </form>
              </>
            ) : (
              <div className="no-chat-selected">
                <MessageSquare size={48} style={{ color: '#cbd5e1', marginBottom: '12px' }} />
                <h3>Your Conversations</h3>
                <p>Select a student from the sidebar to view chat history.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default MessagesPage;
