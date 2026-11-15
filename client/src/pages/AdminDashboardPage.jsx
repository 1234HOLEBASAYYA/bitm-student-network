import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import Modal from '../components/Modal';
import api from '../services/api';
import {
  Shield, Users, Flame, HelpCircle, FolderGit2, Briefcase, Calendar,
  Bell, AlertTriangle, Check, X, Search, Trash2, Edit3, PlusCircle,
  BarChart3, UserX, UserCheck, ShieldAlert, ExternalLink, ArrowLeft
} from 'lucide-react';
import '../styles/admin.css';

const AdminDashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('overview'); // overview, students, announcements, reports
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Student Management State
  const [students, setStudents] = useState([]);
  const [studentSearch, setStudentSearch] = useState('');
  const [studentDeptFilter, setStudentDeptFilter] = useState('All');
  const [studentStatusFilter, setStudentStatusFilter] = useState('All');
  const [loadingStudents, setLoadingStudents] = useState(false);

  // Announcement State
  const [announcements, setAnnouncements] = useState([]);
  const [isAnnounceModalOpen, setIsAnnounceModalOpen] = useState(false);
  const [announceForm, setAnnounceForm] = useState({
    title: '',
    content: '',
    priority: 'Normal',
    targetDepartment: 'All'
  });
  const [submittingAnnounce, setSubmittingAnnounce] = useState(false);

  // Reports State
  const [reports, setReports] = useState([]);

  // Fetch admin stats
  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/stats');
      if (res.data.success) {
        setStats(res.data.stats);
      }
    } catch (err) {
      console.error('Error fetching admin stats:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch all students with filters
  const fetchStudents = async () => {
    try {
      setLoadingStudents(true);
      const params = new URLSearchParams();
      if (studentSearch) params.append('search', studentSearch);
      if (studentDeptFilter !== 'All') params.append('department', studentDeptFilter);
      if (studentStatusFilter !== 'All') params.append('status', studentStatusFilter);

      const res = await api.get(`/admin/students?${params.toString()}`);
      if (res.data.success) {
        setStudents(res.data.students);
      }
    } catch (err) {
      console.error('Error fetching students:', err);
    } finally {
      setLoadingStudents(false);
    }
  };

  // Fetch announcements
  const fetchAnnouncements = async () => {
    try {
      const res = await api.get('/admin/announcements');
      if (res.data.success) {
        setAnnouncements(res.data.announcements);
      }
    } catch (err) {
      console.error('Error fetching announcements:', err);
    }
  };

  // Fetch reports
  const fetchReports = async () => {
    try {
      const res = await api.get('/admin/reports');
      if (res.data.success) {
        setReports(res.data.reports);
      }
    } catch (err) {
      console.error('Error fetching reports:', err);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchAnnouncements();
    fetchReports();
  }, []);

  useEffect(() => {
    if (activeTab === 'students') {
      fetchStudents();
    }
  }, [activeTab, studentSearch, studentDeptFilter, studentStatusFilter]);

  // Update student status (active, pending, deactivated)
  const handleUpdateStudentStatus = async (studentId, newStatus) => {
    try {
      const res = await api.put(`/admin/students/${studentId}/status`, { status: newStatus });
      if (res.data.success) {
        setStudents((prev) =>
          prev.map((s) => (s._id === studentId ? { ...s, status: newStatus } : s))
        );
        fetchStats(); // Update counters
      }
    } catch (err) {
      alert('Error updating student status');
    }
  };

  // Delete student account
  const handleDeleteStudent = async (studentId, studentName) => {
    if (!window.confirm(`Permanently remove student account for ${studentName}?`)) return;
    try {
      const res = await api.delete(`/admin/students/${studentId}`);
      if (res.data.success) {
        setStudents((prev) => prev.filter((s) => s._id !== studentId));
        fetchStats();
      }
    } catch (err) {
      alert('Error deleting student');
    }
  };

  // Create Announcement
  const handleCreateAnnouncement = async (e) => {
    e.preventDefault();
    try {
      setSubmittingAnnounce(true);
      const res = await api.post('/admin/announcements', announceForm);
      if (res.data.success) {
        setAnnouncements([res.data.announcement, ...announcements]);
        setIsAnnounceModalOpen(false);
        setAnnounceForm({ title: '', content: '', priority: 'Normal', targetDepartment: 'All' });
        alert('Official announcement published and sent to student inboxes!');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating announcement');
    } finally {
      setSubmittingAnnounce(false);
    }
  };

  // Delete Announcement
  const handleDeleteAnnouncement = async (id) => {
    if (!window.confirm('Delete this announcement?')) return;
    try {
      const res = await api.delete(`/admin/announcements/${id}`);
      if (res.data.success) {
        setAnnouncements((prev) => prev.filter((a) => a._id !== id));
      }
    } catch (err) {
      alert('Error deleting announcement');
    }
  };

  const departments = [
    'All',
    'Computer Science & Engineering',
    'Information Science & Engineering',
    'Artificial Intelligence & Machine Learning',
    'Electronics & Communication Engineering',
    'Electrical & Electronics Engineering',
    'Mechanical Engineering',
    'Civil Engineering',
    'Management Studies (MBA)'
  ];

  if (loading) {
    return <LoadingSpinner fullScreen text="Loading BITM Admin Portal..." />;
  }

  return (
    <div className="admin-page-container">
      {/* Admin Top Navigation */}
      <header className="admin-header">
        <div className="admin-header-left">
          <Shield size={24} className="admin-shield-icon" />
          <div>
            <h2>BITM Administration Console</h2>
            <span className="admin-subtext">Ballari Institute of Technology &amp; Management • System Control</span>
          </div>
        </div>
        <div className="admin-header-right">
          <Link to="/dashboard" className="btn btn-outline btn-sm">
            <ArrowLeft size={14} /> Back to Student Platform
          </Link>
        </div>
      </header>

      {/* Admin Subnav Tabs */}
      <div className="admin-tabs-bar">
        <div className="container admin-tabs-container">
          <button
            className={`admin-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <BarChart3 size={16} /> Overview &amp; Analytics
          </button>
          <button
            className={`admin-tab-btn ${activeTab === 'students' ? 'active' : ''}`}
            onClick={() => setActiveTab('students')}
          >
            <Users size={16} /> Student Directory ({stats?.totalStudents || 0})
          </button>
          <button
            className={`admin-tab-btn ${activeTab === 'announcements' ? 'active' : ''}`}
            onClick={() => setActiveTab('announcements')}
          >
            <Bell size={16} /> Official Circulars ({announcements.length})
          </button>
          <button
            className={`admin-tab-btn ${activeTab === 'reports' ? 'active' : ''}`}
            onClick={() => setActiveTab('reports')}
          >
            <ShieldAlert size={16} /> Content Moderation ({reports.length})
          </button>
        </div>
      </div>

      <main className="container admin-main-content">
        {/* TAB 1: OVERVIEW & METRICS */}
        {activeTab === 'overview' && (
          <div className="admin-overview-section">
            {/* Stat Cards Grid */}
            <div className="admin-stats-grid">
              <div className="card admin-stat-card">
                <div className="stat-card-top">
                  <span className="stat-card-title">Total Students</span>
                  <div className="stat-card-icon blue"><Users size={20} /></div>
                </div>
                <h3 className="stat-card-val">{stats?.totalStudents || 0}</h3>
                <span className="stat-card-sub">{stats?.activeStudents || 0} Active • {stats?.pendingStudents || 0} Pending</span>
              </div>

              <div className="card admin-stat-card">
                <div className="stat-card-top">
                  <span className="stat-card-title">Community Posts</span>
                  <div className="stat-card-icon orange"><Flame size={20} /></div>
                </div>
                <h3 className="stat-card-val">{stats?.totalPosts || 0}</h3>
                <span className="stat-card-sub">Active discussions &amp; achievements</span>
              </div>

              <div className="card admin-stat-card">
                <div className="stat-card-top">
                  <span className="stat-card-title">Technical Discussions</span>
                  <div className="stat-card-icon cyan"><HelpCircle size={20} /></div>
                </div>
                <h3 className="stat-card-val">{stats?.totalDiscussions || 0}</h3>
                <span className="stat-card-sub">Questions answered by students</span>
              </div>

              <div className="card admin-stat-card">
                <div className="stat-card-top">
                  <span className="stat-card-title">Student Projects</span>
                  <div className="stat-card-icon green"><FolderGit2 size={20} /></div>
                </div>
                <h3 className="stat-card-val">{stats?.totalProjects || 0}</h3>
                <span className="stat-card-sub">Open for peer collaboration</span>
              </div>

              <div className="card admin-stat-card">
                <div className="stat-card-top">
                  <span className="stat-card-title">Career Opportunities</span>
                  <div className="stat-card-icon purple"><Briefcase size={20} /></div>
                </div>
                <h3 className="stat-card-val">{stats?.totalOpportunities || 0}</h3>
                <span className="stat-card-sub">Internships &amp; Placement drives</span>
              </div>

              <div className="card admin-stat-card">
                <div className="stat-card-top">
                  <span className="stat-card-title">Campus Events</span>
                  <div className="stat-card-icon red"><Calendar size={20} /></div>
                </div>
                <h3 className="stat-card-val">{stats?.totalEvents || 0}</h3>
                <span className="stat-card-sub">Workshops &amp; Tech Fests</span>
              </div>
            </div>

            {/* Department Breakdown Table */}
            <div className="card dept-breakdown-card">
              <div className="admin-section-header">
                <h3>Departmental Enrollment Breakdown</h3>
                <span className="badge badge-primary">8 Departments Active</span>
              </div>

              <div className="dept-breakdown-table">
                {stats?.deptStats?.map((dept) => (
                  <div key={dept._id} className="dept-breakdown-row">
                    <span className="dept-name-col">{dept._id}</span>
                    <div className="dept-bar-col">
                      <div
                        className="dept-fill-bar"
                        style={{
                          width: `${Math.min(100, (dept.count / Math.max(1, stats.totalStudents)) * 100)}%`
                        }}
                      ></div>
                    </div>
                    <span className="dept-count-col">{dept.count} students</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: STUDENT MANAGEMENT */}
        {activeTab === 'students' && (
          <div className="admin-students-section">
            {/* Filter Bar */}
            <div className="card admin-filter-card">
              <div className="search-input-wrapper">
                <Search size={18} className="search-icon" />
                <input
                  type="text"
                  placeholder="Search students by name, USN, or email..."
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  className="search-input"
                />
              </div>

              <div className="admin-filters-inline">
                <div className="filter-select-group">
                  <label>Department:</label>
                  <select
                    value={studentDeptFilter}
                    onChange={(e) => setStudentDeptFilter(e.target.value)}
                    className="filter-select"
                  >
                    {departments.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div className="filter-select-group">
                  <label>Account Status:</label>
                  <select
                    value={studentStatusFilter}
                    onChange={(e) => setStudentStatusFilter(e.target.value)}
                    className="filter-select"
                  >
                    <option value="All">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="pending">Pending Approval</option>
                    <option value="deactivated">Deactivated</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Students Table */}
            <div className="card admin-table-card">
              {loadingStudents ? (
                <LoadingSpinner text="Retrieving student accounts..." />
              ) : students.length === 0 ? (
                <div className="empty-state">
                  <p>No students match your filter criteria.</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="admin-data-table">
                    <thead>
                      <tr>
                        <th>Student Name</th>
                        <th>USN</th>
                        <th>Email</th>
                        <th>Department</th>
                        <th>Semester</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map((st) => (
                        <tr key={st._id}>
                          <td>
                            <div className="table-user-cell">
                              {st.profilePicture ? (
                                <img src={st.profilePicture} alt={st.fullName} className="table-avatar" />
                              ) : (
                                <div className="table-avatar-fallback">{st.fullName.charAt(0)}</div>
                              )}
                              <div>
                                <Link to={`/profile/${st._id}`} className="table-user-name">
                                  {st.fullName}
                                </Link>
                              </div>
                            </div>
                          </td>
                          <td><span className="table-usn">{st.usn}</span></td>
                          <td>{st.email}</td>
                          <td><span className="table-dept-tag">{st.department}</span></td>
                          <td>Sem {st.semester} ({st.section})</td>
                          <td>
                            <span className={`status-pill ${st.status}`}>
                              {st.status}
                            </span>
                          </td>
                          <td>
                            <div className="table-actions-cell">
                              {st.status === 'active' ? (
                                <button
                                  className="action-btn warning"
                                  onClick={() => handleUpdateStudentStatus(st._id, 'deactivated')}
                                  title="Deactivate Account"
                                >
                                  <UserX size={15} />
                                </button>
                              ) : (
                                <button
                                  className="action-btn success"
                                  onClick={() => handleUpdateStudentStatus(st._id, 'active')}
                                  title="Activate / Approve Account"
                                >
                                  <UserCheck size={15} />
                                </button>
                              )}

                              <button
                                className="action-btn danger"
                                onClick={() => handleDeleteStudent(st._id, st.fullName)}
                                title="Delete Account"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: OFFICIAL ANNOUNCEMENTS */}
        {activeTab === 'announcements' && (
          <div className="admin-announcements-section">
            <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', color: '#003366', margin: 0 }}>Official College Announcements</h3>
                <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '4px 0 0' }}>
                  Publish circulars that appear directly on student notification feeds and announcements portal.
                </p>
              </div>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => setIsAnnounceModalOpen(true)}
              >
                <PlusCircle size={16} /> Publish New Circular
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
              {announcements.map((ann) => (
                <div key={ann._id} className="card" style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div>
                      <span className={`badge ${ann.priority === 'Urgent' ? 'badge-danger' : ann.priority === 'Important' ? 'badge-warning' : 'badge-primary'}`}>
                        {ann.priority} Priority
                      </span>
                      <h4 style={{ fontSize: '1.1rem', color: '#003366', marginTop: '6px' }}>{ann.title}</h4>
                    </div>
                    <button
                      className="action-btn danger"
                      onClick={() => handleDeleteAnnouncement(ann._id)}
                      title="Delete Announcement"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <p style={{ fontSize: '0.9rem', color: '#334155', lineHeight: 1.6 }}>{ann.content}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#94a3b8', marginTop: '12px', paddingTop: '10px', borderTop: '1px solid #f1f5f9' }}>
                    <span>Target: {ann.targetDepartment}</span>
                    <span>Published: {new Date(ann.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: CONTENT MODERATION */}
        {activeTab === 'reports' && (
          <div className="admin-reports-section">
            <div className="card" style={{ padding: '20px' }}>
              <h3 style={{ fontSize: '1.2rem', color: '#003366', margin: 0 }}>Community Content Moderation</h3>
              <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '4px 0 0' }}>
                Review content flagged by students to ensure a safe, professional collegiate environment.
              </p>
            </div>

            <div style={{ marginTop: '16px' }}>
              {reports.length === 0 ? (
                <div className="card empty-state">
                  <Check size={40} style={{ color: '#10b981', margin: '0 auto 12px' }} />
                  <h3>Clean Community Feed!</h3>
                  <p>There are no open reports or inappropriate content flags currently.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {reports.map((rep) => (
                    <div key={rep._id} className="card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <span className="badge badge-warning">{rep.contentType} Flagged</span>
                        <p style={{ fontSize: '0.9rem', color: '#1e293b', fontWeight: 600, margin: '6px 0 2px' }}>
                          Reason: "{rep.reason}"
                        </p>
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                          Reported by {rep.reporter?.fullName} ({rep.reporter?.email})
                        </span>
                      </div>
                      <span className={`status-pill ${rep.status}`}>{rep.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* PUBLISH ANNOUNCEMENT MODAL */}
        <Modal
          isOpen={isAnnounceModalOpen}
          onClose={() => setIsAnnounceModalOpen(false)}
          title="Publish Official BITM Announcement"
          maxWidth="640px"
        >
          <form onSubmit={handleCreateAnnouncement} className="auth-form">
            <div className="form-group">
              <label className="form-label">Announcement Title *</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. VTU Odd Semester Exam Schedule & Hall Tickets"
                value={announceForm.title}
                onChange={(e) => setAnnounceForm({ ...announceForm, title: e.target.value })}
                required
              />
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label">Priority</label>
                <select
                  className="form-control"
                  value={announceForm.priority}
                  onChange={(e) => setAnnounceForm({ ...announceForm, priority: e.target.value })}
                >
                  <option value="Normal">Normal</option>
                  <option value="Important">Important</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Target Department</label>
                <select
                  className="form-control"
                  value={announceForm.targetDepartment}
                  onChange={(e) => setAnnounceForm({ ...announceForm, targetDepartment: e.target.value })}
                >
                  {departments.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Announcement Content *</label>
              <textarea
                className="form-control"
                rows="5"
                placeholder="Enter complete circular text, instructions for students, and contact points..."
                value={announceForm.content}
                onChange={(e) => setAnnounceForm({ ...announceForm, content: e.target.value })}
                required
              ></textarea>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-block btn-lg"
              disabled={submittingAnnounce}
              style={{ marginTop: '14px' }}
            >
              {submittingAnnounce ? 'Broadcasting...' : 'Broadcast Announcement'}
            </button>
          </form>
        </Modal>
      </main>
    </div>
  );
};

export default AdminDashboardPage;
