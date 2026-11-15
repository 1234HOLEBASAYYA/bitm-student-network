import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../services/api';
import {
  User, Mail, Phone, MapPin, ExternalLink,
  Edit3, Plus, Trash2, Award, Briefcase, GraduationCap, CheckCircle2,
  Code, Heart, Sparkles, Shield, Camera, X
} from 'lucide-react';
import { GithubIcon, LinkedinIcon } from '../components/SocialIcons';
import '../styles/profile.css';

const ProfilePage = () => {
  const { id } = useParams(); // If present, viewing another student's profile
  const { user: currentUser, updateUser, refreshUser } = useAuth();

  const isOwnProfile = !id || (currentUser && currentUser._id === id);
  const profileId = id || currentUser?._id;

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('about'); // 'about', 'projects', 'achievements', 'certifications'

  // Modals
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isAchievementModalOpen, setIsAchievementModalOpen] = useState(false);
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);

  // Edit Form State
  const [editForm, setEditForm] = useState({
    fullName: '',
    headline: '',
    aboutMe: '',
    department: '',
    semester: 1,
    section: '',
    phone: '',
    github: '',
    linkedin: '',
    skills: '',
    interests: '',
    showPhone: false,
    showEmail: true
  });

  // Project Form State
  const [projectForm, setProjectForm] = useState({
    title: '',
    description: '',
    techStack: '',
    githubUrl: '',
    liveUrl: '',
    date: ''
  });

  // Achievement Form State
  const [achieveForm, setAchieveForm] = useState({
    title: '',
    description: '',
    year: new Date().getFullYear().toString()
  });

  // Certification Form State
  const [certForm, setCertForm] = useState({
    name: '',
    organization: '',
    issueDate: '',
    credentialUrl: ''
  });

  // Avatar URL Form State
  const [avatarUrl, setAvatarUrl] = useState('');

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/users/${profileId}`);
      if (res.data.success) {
        setProfile(res.data.user);
        if (isOwnProfile) {
          setEditForm({
            fullName: res.data.user.fullName || '',
            headline: res.data.user.headline || '',
            aboutMe: res.data.user.aboutMe || '',
            department: res.data.user.department || '',
            semester: res.data.user.semester || 1,
            section: res.data.user.section || 'A',
            phone: res.data.user.phone || '',
            github: res.data.user.github || '',
            linkedin: res.data.user.linkedin || '',
            skills: (res.data.user.skills || []).join(', '),
            interests: (res.data.user.interests || []).join(', '),
            showPhone: res.data.user.privacy?.showPhone ?? false,
            showEmail: res.data.user.privacy?.showEmail ?? true
          });
        }
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (profileId) {
      fetchProfile();
    }
  }, [profileId]);

  // Handle Edit Profile Submission
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put('/users/profile', {
        ...editForm,
        privacy: {
          showPhone: editForm.showPhone,
          showEmail: editForm.showEmail
        }
      });
      if (res.data.success) {
        updateUser(res.data.user);
        setProfile(res.data.user);
        setIsEditModalOpen(false);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating profile');
    }
  };

  // Handle Add Project
  const handleAddProject = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/users/projects', projectForm);
      if (res.data.success) {
        setProfile((prev) => ({ ...prev, projects: res.data.projects }));
        setProjectForm({ title: '', description: '', techStack: '', githubUrl: '', liveUrl: '', date: '' });
        setIsProjectModalOpen(false);
        refreshUser();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error adding project');
    }
  };

  // Handle Delete Project
  const handleDeleteProject = async (projectId) => {
    if (!window.confirm('Delete this project from your profile?')) return;
    try {
      const res = await api.delete(`/users/projects/${projectId}`);
      if (res.data.success) {
        setProfile((prev) => ({ ...prev, projects: res.data.projects }));
        refreshUser();
      }
    } catch (err) {
      alert('Error deleting project');
    }
  };

  // Handle Add Achievement
  const handleAddAchievement = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/users/achievements', achieveForm);
      if (res.data.success) {
        setProfile((prev) => ({ ...prev, achievements: res.data.achievements }));
        setAchieveForm({ title: '', description: '', year: '' });
        setIsAchievementModalOpen(false);
        refreshUser();
      }
    } catch (err) {
      alert('Error adding achievement');
    }
  };

  // Handle Delete Achievement
  const handleDeleteAchievement = async (achieveId) => {
    if (!window.confirm('Delete this achievement?')) return;
    try {
      const res = await api.delete(`/users/achievements/${achieveId}`);
      if (res.data.success) {
        setProfile((prev) => ({ ...prev, achievements: res.data.achievements }));
      }
    } catch (err) {
      alert('Error deleting achievement');
    }
  };

  // Handle Add Certification
  const handleAddCert = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/users/certifications', certForm);
      if (res.data.success) {
        setProfile((prev) => ({ ...prev, certifications: res.data.certifications }));
        setCertForm({ name: '', organization: '', issueDate: '', credentialUrl: '' });
        setIsCertModalOpen(false);
      }
    } catch (err) {
      alert('Error adding certification');
    }
  };

  // Handle Delete Certification
  const handleDeleteCert = async (certId) => {
    if (!window.confirm('Delete this certification?')) return;
    try {
      const res = await api.delete(`/users/certifications/${certId}`);
      if (res.data.success) {
        setProfile((prev) => ({ ...prev, certifications: res.data.certifications }));
      }
    } catch (err) {
      alert('Error deleting certification');
    }
  };

  // Handle Avatar Change
  const handleSaveAvatar = async (e) => {
    e.preventDefault();
    if (!avatarUrl.trim()) return;
    try {
      const res = await api.post('/users/avatar', { avatarUrl: avatarUrl.trim() });
      if (res.data.success) {
        setProfile((prev) => ({ ...prev, profilePicture: res.data.profilePicture }));
        updateUser({ ...currentUser, profilePicture: res.data.profilePicture });
        setIsAvatarModalOpen(false);
      }
    } catch (err) {
      alert('Error updating avatar');
    }
  };

  // Handle Connect with this student
  const handleConnectWithUser = async () => {
    try {
      await api.post(`/connections/request/${profile._id}`);
      setProfile((prev) => ({ ...prev, connectionStatus: 'sent' }));
    } catch (err) {
      alert(err.response?.data?.message || 'Error sending request');
    }
  };

  if (loading) {
    return (
      <div className="dashboard-layout">
        <Sidebar />
        <main className="dashboard-main">
          <LoadingSpinner text="Loading profile..." />
        </main>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="dashboard-layout">
        <Sidebar />
        <main className="dashboard-main">
          <div className="card empty-state">
            <h3>Student Profile Not Found</h3>
            <p>The student profile you requested does not exist or has been removed.</p>
            <Link to="/explore" className="btn btn-primary btn-sm">Explore Other Students</Link>
          </div>
        </main>
      </div>
    );
  }

  const completion = profile.profileCompletion || 65;

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="dashboard-main profile-page">
        {/* Profile Hero Header Card */}
        <div className="card profile-header-card">
          <div className="profile-cover-banner"></div>

          <div className="profile-header-content">
            <div className="profile-avatar-row">
              <div className="profile-avatar-wrapper">
                {profile.profilePicture ? (
                  <img
                    src={profile.profilePicture}
                    alt={profile.fullName}
                    className="profile-avatar-img"
                  />
                ) : (
                  <div className="profile-avatar-fallback">
                    {profile.fullName.charAt(0)}
                  </div>
                )}
                {isOwnProfile && (
                  <button
                    className="avatar-change-btn"
                    onClick={() => setIsAvatarModalOpen(true)}
                    title="Change Profile Photo"
                  >
                    <Camera size={14} />
                  </button>
                )}
              </div>

              <div className="profile-actions-row">
                {isOwnProfile ? (
                  <button
                    className="btn btn-outline-primary"
                    onClick={() => setIsEditModalOpen(true)}
                  >
                    <Edit3 size={16} /> Edit Profile
                  </button>
                ) : (
                  <div className="peer-actions">
                    {profile.connectionStatus === 'connected' ? (
                      <>
                        <span className="badge badge-success">
                          <CheckCircle2 size={14} /> Connected
                        </span>
                        <Link to="/messages" className="btn btn-primary btn-sm">
                          Send Message
                        </Link>
                      </>
                    ) : profile.connectionStatus === 'sent' ? (
                      <span className="badge badge-warning">Request Pending</span>
                    ) : (
                      <button
                        className="btn btn-primary"
                        onClick={handleConnectWithUser}
                      >
                        Connect
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="profile-meta-info">
              <h2 className="profile-name">{profile.fullName}</h2>
              <p className="profile-headline">
                {profile.headline || `Student at Ballari Institute of Technology and Management`}
              </p>
              <div className="profile-academic-tag">
                <GraduationCap size={16} />
                <span>{profile.department}</span>
                <span>•</span>
                <span>Semester {profile.semester || 1} (Sec {profile.section || 'A'})</span>
                <span>•</span>
                <span className="usn-tag">{profile.usn}</span>
              </div>

              <div className="profile-contact-chips">
                {profile.email && (
                  <span className="contact-chip">
                    <Mail size={14} /> {profile.email}
                  </span>
                )}
                {profile.phone && (
                  <span className="contact-chip">
                    <Phone size={14} /> {profile.phone}
                  </span>
                )}
                <span className="contact-chip">
                  <MapPin size={14} /> BITM Ballari Campus
                </span>
                <span className="contact-chip">
                  <strong>{profile.connectionsCount || 0}</strong> Connections
                </span>
              </div>

              {/* Social Links */}
              <div className="profile-social-links">
                {profile.github && (
                  <a href={profile.github} target="_blank" rel="noreferrer" className="social-pill github">
                    <GithubIcon size={15} /> GitHub
                  </a>
                )}
                {profile.linkedin && (
                  <a href={profile.linkedin} target="_blank" rel="noreferrer" className="social-pill linkedin">
                    <LinkedinIcon size={15} /> LinkedIn
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Profile Tabs Navigation */}
        <div className="profile-nav-tabs">
          <button
            className={`tab-btn ${activeTab === 'about' ? 'active' : ''}`}
            onClick={() => setActiveTab('about')}
          >
            About &amp; Skills
          </button>
          <button
            className={`tab-btn ${activeTab === 'projects' ? 'active' : ''}`}
            onClick={() => setActiveTab('projects')}
          >
            Projects ({profile.projects?.length || 0})
          </button>
          <button
            className={`tab-btn ${activeTab === 'achievements' ? 'active' : ''}`}
            onClick={() => setActiveTab('achievements')}
          >
            Achievements ({profile.achievements?.length || 0})
          </button>
          <button
            className={`tab-btn ${activeTab === 'certifications' ? 'active' : ''}`}
            onClick={() => setActiveTab('certifications')}
          >
            Certifications ({profile.certifications?.length || 0})
          </button>
        </div>

        {/* Tab 1: About & Skills */}
        {activeTab === 'about' && (
          <div className="tab-pane">
            {/* About Me Card */}
            <div className="card section-card">
              <div className="section-card-header">
                <h3>About Me</h3>
                {isOwnProfile && (
                  <button className="text-btn" onClick={() => setIsEditModalOpen(true)}>
                    <Edit3 size={15} /> Edit
                  </button>
                )}
              </div>
              <p className="about-text">
                {profile.aboutMe || (
                  <span className="text-muted">
                    No bio added yet. Tell other BITM students about your engineering interests, coding passion, and aspirations!
                  </span>
                )}
              </p>
            </div>

            {/* Technical Skills Card */}
            <div className="card section-card">
              <div className="section-card-header">
                <h3>Technical Skills</h3>
                {isOwnProfile && (
                  <button className="text-btn" onClick={() => setIsEditModalOpen(true)}>
                    <Plus size={15} /> Add Skills
                  </button>
                )}
              </div>
              <div className="skills-chip-group">
                {profile.skills && profile.skills.length > 0 ? (
                  profile.skills.map((skill, idx) => (
                    <span key={idx} className="skill-tag">
                      <Code size={13} style={{ marginRight: '4px' }} /> {skill}
                    </span>
                  ))
                ) : (
                  <p className="text-muted">No skills listed yet.</p>
                )}
              </div>
            </div>

            {/* Areas of Interest Card */}
            <div className="card section-card">
              <div className="section-card-header">
                <h3>Areas of Interest</h3>
              </div>
              <div className="interests-chip-group">
                {profile.interests && profile.interests.length > 0 ? (
                  profile.interests.map((interest, idx) => (
                    <span key={idx} className="interest-tag">
                      <Heart size={13} style={{ marginRight: '4px' }} /> {interest}
                    </span>
                  ))
                ) : (
                  <p className="text-muted">No areas of interest specified.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Projects */}
        {activeTab === 'projects' && (
          <div className="tab-pane">
            <div className="card section-card">
              <div className="section-card-header">
                <div>
                  <h3>Academic &amp; Personal Projects</h3>
                  <p className="section-subtitle-small">
                    Engineering mini-projects, capstone projects, and open-source contributions
                  </p>
                </div>
                {isOwnProfile && (
                  <button className="btn btn-primary btn-sm" onClick={() => setIsProjectModalOpen(true)}>
                    <Plus size={15} /> Add Project
                  </button>
                )}
              </div>

              <div className="projects-grid">
                {profile.projects && profile.projects.length > 0 ? (
                  profile.projects.map((proj) => (
                    <div key={proj._id} className="project-item-card">
                      <div className="proj-card-top">
                        <h4>{proj.title}</h4>
                        {isOwnProfile && (
                          <button
                            className="delete-item-btn"
                            onClick={() => handleDeleteProject(proj._id)}
                            title="Delete Project"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                      <p className="proj-desc">{proj.description}</p>
                      <div className="proj-tech-chips">
                        {proj.techStack?.map((t, idx) => (
                          <span key={idx} className="tech-badge">{t}</span>
                        ))}
                      </div>
                      <div className="proj-links">
                        {proj.githubUrl && (
                          <a href={proj.githubUrl} target="_blank" rel="noreferrer" className="proj-link">
                            <GithubIcon size={14} /> Repository
                          </a>
                        )}
                        {proj.liveUrl && (
                          <a href={proj.liveUrl} target="_blank" rel="noreferrer" className="proj-link">
                            <ExternalLink size={14} /> Live Demo
                          </a>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="empty-state">
                    <p>No projects showcased yet.</p>
                    {isOwnProfile && (
                      <button className="btn btn-outline-primary btn-sm" onClick={() => setIsProjectModalOpen(true)}>
                        Add Your First Project
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Achievements */}
        {activeTab === 'achievements' && (
          <div className="tab-pane">
            <div className="card section-card">
              <div className="section-card-header">
                <div>
                  <h3>Honors &amp; Achievements</h3>
                  <p className="section-subtitle-small">
                    Hackathon prizes, symposium awards, club leadership, and paper publications
                  </p>
                </div>
                {isOwnProfile && (
                  <button className="btn btn-primary btn-sm" onClick={() => setIsAchievementModalOpen(true)}>
                    <Plus size={15} /> Add Achievement
                  </button>
                )}
              </div>

              <div className="achievements-list">
                {profile.achievements && profile.achievements.length > 0 ? (
                  profile.achievements.map((ach) => (
                    <div key={ach._id} className="achievement-row">
                      <div className="achieve-icon">
                        <Award size={20} />
                      </div>
                      <div className="achieve-content">
                        <div className="achieve-title-row">
                          <h4>{ach.title}</h4>
                          {ach.year && <span className="achieve-year">{ach.year}</span>}
                        </div>
                        {ach.description && <p className="achieve-desc">{ach.description}</p>}
                      </div>
                      {isOwnProfile && (
                        <button
                          className="delete-item-btn"
                          onClick={() => handleDeleteAchievement(ach._id)}
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="empty-state">
                    <p>No achievements listed yet.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Certifications */}
        {activeTab === 'certifications' && (
          <div className="tab-pane">
            <div className="card section-card">
              <div className="section-card-header">
                <div>
                  <h3>Licenses &amp; Certifications</h3>
                  <p className="section-subtitle-small">
                    Industry credentials, NPTEL/Swayam certificates, AWS, and online courses
                  </p>
                </div>
                {isOwnProfile && (
                  <button className="btn btn-primary btn-sm" onClick={() => setIsCertModalOpen(true)}>
                    <Plus size={15} /> Add Certification
                  </button>
                )}
              </div>

              <div className="cert-list">
                {profile.certifications && profile.certifications.length > 0 ? (
                  profile.certifications.map((cert) => (
                    <div key={cert._id} className="cert-row">
                      <div className="cert-icon">
                        <CheckCircle2 size={20} />
                      </div>
                      <div className="cert-content">
                        <h4>{cert.name}</h4>
                        <span className="cert-org">{cert.organization}</span>
                        {cert.issueDate && <span className="cert-date">Issued {cert.issueDate}</span>}
                      </div>
                      {cert.credentialUrl && (
                        <a href={cert.credentialUrl} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm">
                          Verify <ExternalLink size={12} />
                        </a>
                      )}
                      {isOwnProfile && (
                        <button
                          className="delete-item-btn"
                          onClick={() => handleDeleteCert(cert._id)}
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="empty-state">
                    <p>No certifications added yet.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* EDIT PROFILE MODAL */}
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title="Edit Your BITM Student Profile"
          maxWidth="680px"
        >
          <form onSubmit={handleSaveProfile} className="auth-form">
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-control"
                value={editForm.fullName}
                onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Headline / Bio Tagline</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. MERN Stack Developer | 7th Sem CSE | Competitive Programmer"
                value={editForm.headline}
                onChange={(e) => setEditForm({ ...editForm, headline: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">About Me (Bio)</label>
              <textarea
                className="form-control"
                rows="4"
                placeholder="Write a brief professional summary about your skills, engineering background, and interests..."
                value={editForm.aboutMe}
                onChange={(e) => setEditForm({ ...editForm, aboutMe: e.target.value })}
              ></textarea>
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label">Semester</label>
                <select
                  className="form-control"
                  value={editForm.semester}
                  onChange={(e) => setEditForm({ ...editForm, semester: Number(e.target.value) })}
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                    <option key={s} value={s}>Semester {s}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Section</label>
                <input
                  type="text"
                  className="form-control"
                  value={editForm.section}
                  onChange={(e) => setEditForm({ ...editForm, section: e.target.value })}
                  style={{ textTransform: 'uppercase' }}
                />
              </div>
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label">GitHub Profile URL</label>
                <input
                  type="url"
                  className="form-control"
                  placeholder="https://github.com/username"
                  value={editForm.github}
                  onChange={(e) => setEditForm({ ...editForm, github: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">LinkedIn Profile URL</label>
                <input
                  type="url"
                  className="form-control"
                  placeholder="https://linkedin.com/in/username"
                  value={editForm.linkedin}
                  onChange={(e) => setEditForm({ ...editForm, linkedin: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number (optional)</label>
              <input
                type="text"
                className="form-control"
                placeholder="+91 9876543210"
                value={editForm.phone}
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Technical Skills (comma-separated)</label>
              <input
                type="text"
                className="form-control"
                placeholder="React.js, Node.js, Python, Java, Data Structures"
                value={editForm.skills}
                onChange={(e) => setEditForm({ ...editForm, skills: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Areas of Interest (comma-separated)</label>
              <input
                type="text"
                className="form-control"
                placeholder="Web Development, AI/ML, Cloud Computing, IoT"
                value={editForm.interests}
                onChange={(e) => setEditForm({ ...editForm, interests: e.target.value })}
              />
            </div>

            {/* Privacy Controls */}
            <div className="privacy-settings-box">
              <h4 style={{ fontSize: '0.88rem', color: '#003366', marginBottom: '8px' }}>
                Contact Privacy Controls
              </h4>
              <div className="form-checkbox">
                <input
                  type="checkbox"
                  id="showEmail"
                  checked={editForm.showEmail}
                  onChange={(e) => setEditForm({ ...editForm, showEmail: e.target.checked })}
                />
                <label htmlFor="showEmail">Display email address on public profile</label>
              </div>
              <div className="form-checkbox">
                <input
                  type="checkbox"
                  id="showPhone"
                  checked={editForm.showPhone}
                  onChange={(e) => setEditForm({ ...editForm, showPhone: e.target.checked })}
                />
                <label htmlFor="showPhone">Display phone number to connected students</label>
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-block btn-lg" style={{ marginTop: '16px' }}>
              Save Profile Changes
            </button>
          </form>
        </Modal>

        {/* ADD PROJECT MODAL */}
        <Modal
          isOpen={isProjectModalOpen}
          onClose={() => setIsProjectModalOpen(false)}
          title="Add Engineering Project"
        >
          <form onSubmit={handleAddProject} className="auth-form">
            <div className="form-group">
              <label className="form-label">Project Title *</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. BITM Smart Campus Navigation"
                value={projectForm.title}
                onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Description *</label>
              <textarea
                className="form-control"
                rows="3"
                placeholder="What does this project do? What problem does it solve?"
                value={projectForm.description}
                onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                required
              ></textarea>
            </div>

            <div className="form-group">
              <label className="form-label">Technologies Used (comma-separated)</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. React, Node.js, MongoDB, Leaflet"
                value={projectForm.techStack}
                onChange={(e) => setProjectForm({ ...projectForm, techStack: e.target.value })}
              />
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label">GitHub Repository Link</label>
                <input
                  type="url"
                  className="form-control"
                  placeholder="https://github.com/..."
                  value={projectForm.githubUrl}
                  onChange={(e) => setProjectForm({ ...projectForm, githubUrl: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Live Demo URL</label>
                <input
                  type="url"
                  className="form-control"
                  placeholder="https://..."
                  value={projectForm.liveUrl}
                  onChange={(e) => setProjectForm({ ...projectForm, liveUrl: e.target.value })}
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-block btn-lg" style={{ marginTop: '12px' }}>
              Add Project to Portfolio
            </button>
          </form>
        </Modal>

        {/* ADD ACHIEVEMENT MODAL */}
        <Modal
          isOpen={isAchievementModalOpen}
          onClose={() => setIsAchievementModalOpen(false)}
          title="Add Honor or Achievement"
        >
          <form onSubmit={handleAddAchievement} className="auth-form">
            <div className="form-group">
              <label className="form-label">Achievement Title *</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. 1st Place - Smart Karnataka Hackathon 2024"
                value={achieveForm.title}
                onChange={(e) => setAchieveForm({ ...achieveForm, title: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Year</label>
              <input
                type="text"
                className="form-control"
                placeholder="2024"
                value={achieveForm.year}
                onChange={(e) => setAchieveForm({ ...achieveForm, year: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Description (optional)</label>
              <textarea
                className="form-control"
                rows="2"
                placeholder="Briefly describe what you achieved or presented..."
                value={achieveForm.description}
                onChange={(e) => setAchieveForm({ ...achieveForm, description: e.target.value })}
              ></textarea>
            </div>

            <button type="submit" className="btn btn-primary btn-block btn-lg" style={{ marginTop: '12px' }}>
              Save Achievement
            </button>
          </form>
        </Modal>

        {/* ADD CERTIFICATION MODAL */}
        <Modal
          isOpen={isCertModalOpen}
          onClose={() => setIsCertModalOpen(false)}
          title="Add Certificate / License"
        >
          <form onSubmit={handleAddCert} className="auth-form">
            <div className="form-group">
              <label className="form-label">Certification Name *</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. AWS Certified Cloud Practitioner"
                value={certForm.name}
                onChange={(e) => setCertForm({ ...certForm, name: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Issuing Organization *</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Amazon Web Services, NPTEL, Coursera"
                value={certForm.organization}
                onChange={(e) => setCertForm({ ...certForm, organization: e.target.value })}
                required
              />
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label">Issue Date</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Jan 2024"
                  value={certForm.issueDate}
                  onChange={(e) => setCertForm({ ...certForm, issueDate: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Credential Verification URL</label>
                <input
                  type="url"
                  className="form-control"
                  placeholder="https://..."
                  value={certForm.credentialUrl}
                  onChange={(e) => setCertForm({ ...certForm, credentialUrl: e.target.value })}
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-block btn-lg" style={{ marginTop: '12px' }}>
              Save Certification
            </button>
          </form>
        </Modal>

        {/* AVATAR PHOTO MODAL */}
        <Modal
          isOpen={isAvatarModalOpen}
          onClose={() => setIsAvatarModalOpen(false)}
          title="Update Profile Picture"
          maxWidth="450px"
        >
          <form onSubmit={handleSaveAvatar} className="auth-form">
            <p style={{ fontSize: '0.88rem', color: '#64748b', marginBottom: '16px' }}>
              Paste an image URL or choose a photo to set as your profile avatar.
            </p>

            <div className="form-group">
              <label className="form-label">Image URL</label>
              <input
                type="url"
                className="form-control"
                placeholder="https://images.unsplash.com/..."
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                required
              />
            </div>

            {avatarUrl && (
              <div style={{ textAlign: 'center', margin: '16px 0' }}>
                <img
                  src={avatarUrl}
                  alt="Preview"
                  style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover' }}
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              </div>
            )}

            <button type="submit" className="btn btn-primary btn-block btn-lg">
              Update Avatar
            </button>
          </form>
        </Modal>
      </main>
    </div>
  );
};

export default ProfilePage;
