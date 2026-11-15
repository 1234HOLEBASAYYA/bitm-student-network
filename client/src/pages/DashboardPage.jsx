import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import api from '../services/api';
import {
  Users, Flame, HelpCircle, Briefcase, Calendar,
  ArrowRight, Heart, MessageSquare, ExternalLink, PlusCircle,
  Sparkles, CheckCircle2, UserCheck, Clock, MapPin
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import '../styles/dashboard.css';

const DashboardPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [recentPosts, setRecentPosts] = useState([]);
  const [suggestedStudents, setSuggestedStudents] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [recentOpportunities, setRecentOpportunities] = useState([]);
  const [discussions, setDiscussions] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [postsRes, studentsRes, eventsRes, oppsRes, discRes] = await Promise.all([
          api.get('/posts?limit=3'),
          api.get('/users?limit=4'),
          api.get('/events?timeframe=upcoming'),
          api.get('/opportunities?limit=3'),
          api.get('/discussions?limit=3')
        ]);

        if (postsRes.data.success) setRecentPosts(postsRes.data.posts);
        if (studentsRes.data.success) setSuggestedStudents(studentsRes.data.users);
        if (eventsRes.data.success) setUpcomingEvents(eventsRes.data.events);
        if (oppsRes.data.success) setRecentOpportunities(oppsRes.data.opportunities);
        if (discRes.data.success) setDiscussions(discRes.data.discussions);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleConnect = async (studentId) => {
    try {
      await api.post(`/connections/request/${studentId}`);
      setSuggestedStudents((prev) =>
        prev.map((s) => s._id === studentId ? { ...s, connectionStatus: 'sent' } : s)
      );
    } catch (err) {
      alert(err.response?.data?.message || 'Error sending request');
    }
  };

  const completion = user?.profileCompletion || 65;

  return (
    <div className="dashboard-layout">
      {/* 12-Item Sidebar */}
      <Sidebar />

      {/* Main Dashboard Content */}
      <main className="dashboard-main">
        {/* Welcome Banner */}
        <section className="welcome-banner card">
          <div className="welcome-text">
            <h2>Welcome back, {user?.fullName}! 👋</h2>
            <p>
              {user?.department} • Semester {user?.semester || 1} (Sec {user?.section || 'A'})
            </p>
            <p className="welcome-tagline">
              Explore today's campus posts, technical discussions, and internship openings across BITM.
            </p>
          </div>

          <div className="banner-quick-actions">
            <Link to="/feed" className="btn btn-secondary btn-sm">
              <PlusCircle size={15} /> Create Post
            </Link>
            <Link to="/discussions" className="btn btn-outline btn-sm">
              <HelpCircle size={15} /> Ask Question
            </Link>
          </div>
        </section>

        {/* Profile Completion Recommendation if under 85% */}
        {completion < 85 && (
          <div className="completion-callout card">
            <div className="completion-callout-info">
              <div className="completion-badge-icon">
                <Sparkles size={20} />
              </div>
              <div>
                <h4>Your Profile is {completion}% Complete</h4>
                <p>
                  Add your GitHub link, bio, and project portfolio to stand out for project collaborations and campus placements.
                </p>
              </div>
            </div>
            <Link to="/profile" className="btn btn-primary btn-sm">
              Complete Profile
            </Link>
          </div>
        )}

        {loading ? (
          <LoadingSpinner text="Loading your dashboard..." />
        ) : (
          <div className="dashboard-grid">
            {/* Left Column: Feed & Discussions */}
            <div className="dashboard-col-left">
              {/* Recent Community Feed Posts */}
              <div className="dash-widget card">
                <div className="widget-header">
                  <div className="widget-title">
                    <Flame size={18} className="widget-icon text-accent" />
                    <h3>Recent Campus Posts</h3>
                  </div>
                  <Link to="/feed" className="widget-more-link">
                    View Feed <ArrowRight size={14} />
                  </Link>
                </div>

                <div className="posts-widget-list">
                  {recentPosts.length === 0 ? (
                    <p className="empty-widget-text">No posts yet. Be the first to share an update!</p>
                  ) : (
                    recentPosts.map((post) => (
                      <div key={post._id} className="dash-post-card">
                        <div className="dash-post-author">
                          {post.author?.profilePicture ? (
                            <img
                              src={post.author.profilePicture}
                              alt={post.author.fullName}
                              className="dash-post-avatar"
                            />
                          ) : (
                            <div className="dash-post-fallback">
                              {post.author?.fullName?.charAt(0) || 'S'}
                            </div>
                          )}
                          <div>
                            <Link to={`/profile/${post.author?._id}`} className="author-name">
                              {post.author?.fullName}
                            </Link>
                            <span className="author-dept">{post.author?.department}</span>
                          </div>
                          <span className="badge badge-primary post-cat-badge">
                            {post.category}
                          </span>
                        </div>

                        <p className="dash-post-content">{post.content}</p>

                        {post.image && (
                          <img src={post.image} alt="Post attachment" className="dash-post-img" />
                        )}

                        <div className="dash-post-footer">
                          <span className="post-stat">
                            <Heart size={14} /> {post.likesCount || 0} Likes
                          </span>
                          <span className="post-stat">
                            <MessageSquare size={14} /> {post.commentsCount || 0} Comments
                          </span>
                          <Link to="/feed" className="read-more-link">
                            View comments
                          </Link>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Recommended Technical Discussions */}
              <div className="dash-widget card">
                <div className="widget-header">
                  <div className="widget-title">
                    <HelpCircle size={18} className="widget-icon text-accent" />
                    <h3>Technical Discussions</h3>
                  </div>
                  <Link to="/discussions" className="widget-more-link">
                    All Discussions <ArrowRight size={14} />
                  </Link>
                </div>

                <div className="discussions-widget-list">
                  {discussions.length === 0 ? (
                    <p className="empty-widget-text">No discussions posted yet.</p>
                  ) : (
                    discussions.map((d) => (
                      <div key={d._id} className="dash-discussion-item">
                        <div className="disc-category-tag">{d.category}</div>
                        <Link to={`/discussions`} className="disc-title">
                          {d.title}
                        </Link>
                        <div className="disc-meta">
                          <span>By {d.author?.fullName}</span>
                          <span>•</span>
                          <span>{d.answersCount || 0} answers</span>
                          {d.isSolved && (
                            <span className="solved-badge">
                              <CheckCircle2 size={12} /> Solved
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Suggested Students, Events, Opportunities */}
            <div className="dashboard-col-right">
              {/* Suggested Students To Connect With */}
              <div className="dash-widget card">
                <div className="widget-header">
                  <div className="widget-title">
                    <Users size={18} className="widget-icon text-accent" />
                    <h3>Suggested Students</h3>
                  </div>
                  <Link to="/explore" className="widget-more-link">
                    Explore <ArrowRight size={14} />
                  </Link>
                </div>

                <div className="students-widget-list">
                  {suggestedStudents.length === 0 ? (
                    <p className="empty-widget-text">No suggestions right now.</p>
                  ) : (
                    suggestedStudents.map((st) => (
                      <div key={st._id} className="suggested-student-row">
                        <div className="student-info-left">
                          {st.profilePicture ? (
                            <img
                              src={st.profilePicture}
                              alt={st.fullName}
                              className="student-mini-avatar"
                            />
                          ) : (
                            <div className="student-mini-fallback">
                              {st.fullName.charAt(0)}
                            </div>
                          )}
                          <div>
                            <Link to={`/profile/${st._id}`} className="student-row-name">
                              {st.fullName}
                            </Link>
                            <span className="student-row-sub">
                              {st.department?.split(' ')[0]} • Sem {st.semester}
                            </span>
                          </div>
                        </div>

                        {st.connectionStatus === 'connected' ? (
                          <span className="connected-chip"><UserCheck size={12} /> Connected</span>
                        ) : st.connectionStatus === 'sent' ? (
                          <span className="pending-chip">Pending</span>
                        ) : (
                          <button
                            className="btn btn-outline-primary btn-sm"
                            onClick={() => handleConnect(st._id)}
                          >
                            Connect
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Upcoming Events */}
              <div className="dash-widget card">
                <div className="widget-header">
                  <div className="widget-title">
                    <Calendar size={18} className="widget-icon text-accent" />
                    <h3>Upcoming Events</h3>
                  </div>
                  <Link to="/events" className="widget-more-link">
                    All Events <ArrowRight size={14} />
                  </Link>
                </div>

                <div className="events-widget-list">
                  {upcomingEvents.length === 0 ? (
                    <p className="empty-widget-text">No upcoming events scheduled.</p>
                  ) : (
                    upcomingEvents.slice(0, 2).map((evt) => (
                      <div key={evt._id} className="dash-event-card">
                        <span className="event-type-badge">{evt.eventType}</span>
                        <h4 className="event-title">{evt.title}</h4>
                        <div className="event-meta-item">
                          <Clock size={14} />
                          <span>{new Date(evt.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <div className="event-meta-item">
                          <MapPin size={14} />
                          <span>{evt.venue}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Latest Opportunities */}
              <div className="dash-widget card">
                <div className="widget-header">
                  <div className="widget-title">
                    <Briefcase size={18} className="widget-icon text-accent" />
                    <h3>Career Opportunities</h3>
                  </div>
                  <Link to="/opportunities" className="widget-more-link">
                    View All <ArrowRight size={14} />
                  </Link>
                </div>

                <div className="opps-widget-list">
                  {recentOpportunities.length === 0 ? (
                    <p className="empty-widget-text">No opportunities listed.</p>
                  ) : (
                    recentOpportunities.map((opp) => (
                      <div key={opp._id} className="dash-opp-item">
                        <span className="opp-category-badge">{opp.category}</span>
                        <h4 className="opp-title">{opp.title}</h4>
                        <span className="opp-org">{opp.organization}</span>
                        <a
                          href={opp.applyLink}
                          target="_blank"
                          rel="noreferrer"
                          className="opp-apply-btn btn btn-outline-primary btn-sm"
                        >
                          Apply <ExternalLink size={12} />
                        </a>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default DashboardPage;
