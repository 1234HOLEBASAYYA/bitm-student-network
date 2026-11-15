import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import LoadingSpinner from '../components/LoadingSpinner';
import Modal from '../components/Modal';
import api from '../services/api';
import {
  FolderGit2, PlusCircle, Star, ExternalLink, Users,
  CheckCircle2, Search, Filter, MessageSquare, Send, Check, X
} from 'lucide-react';
import { GithubIcon } from '../components/SocialIcons';
import { Spotlight } from '@/components/core/spotlight';
import { Tilt } from '@/components/core/tilt';
import { Magnetic } from '@/components/core/magnetic';
import { AnimatedGroup } from '@/components/core/animated-group';
import { BorderTrail } from '@/components/core/border-trail';
import '../styles/projects.css';

const ProjectsPage = () => {
  const { user } = useAuth();
  const { id: paramProjectId } = useParams();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [collabOnly, setCollabOnly] = useState(false);

  // Publish Project Modal
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [publishForm, setPublishForm] = useState({
    title: '',
    description: '',
    technologies: '',
    githubUrl: '',
    liveDemoUrl: '',
    image: '',
    category: 'Web App',
    isOpenForCollaboration: true,
    rolesNeeded: ''
  });
  const [submittingProject, setSubmittingProject] = useState(false);

  // Collaborate Modal
  const [selectedProjectForCollab, setSelectedProjectForCollab] = useState(null);
  const [collabMessage, setCollabMessage] = useState('');
  const [sendingCollabReq, setSendingCollabReq] = useState(false);

  // View Collab Requests Modal (Owner view)
  const [managingProject, setManagingProject] = useState(null);
  const [collabRequests, setCollabRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(false);

  const categories = [
    'All',
    'Web App',
    'Mobile App',
    'AI/ML',
    'IoT & Embedded',
    'Cloud & DevOps',
    'Cybersecurity',
    'Blockchain',
    'Other'
  ];

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (categoryFilter !== 'All') params.append('category', categoryFilter);
      if (collabOnly) params.append('openForCollab', 'true');
      if (search) params.append('search', search);

      const res = await api.get(`/projects?${params.toString()}`);
      if (res.data.success) {
        let loaded = res.data.projects;
        if (paramProjectId && !loaded.some((p) => p._id === paramProjectId)) {
          try {
            const single = await api.get(`/projects/${paramProjectId}`);
            if (single.data.success && single.data.project) {
              loaded = [single.data.project, ...loaded];
            }
          } catch (err) {
            console.error('Target project fetch error:', err);
          }
        }
        setProjects(loaded);
      }
    } catch (err) {
      console.error('Error fetching projects:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [categoryFilter, collabOnly, search, paramProjectId]);

  useEffect(() => {
    if (paramProjectId && projects.length > 0) {
      const timer = setTimeout(() => {
        const el = document.getElementById(`project-${paramProjectId}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [paramProjectId, projects]);

  // Handle Publish Project
  const handlePublishProject = async (e) => {
    e.preventDefault();
    try {
      setSubmittingProject(true);
      const res = await api.post('/projects', publishForm);
      if (res.data.success) {
        setProjects([res.data.project, ...projects]);
        setIsPublishModalOpen(false);
        setPublishForm({
          title: '',
          description: '',
          technologies: '',
          githubUrl: '',
          liveDemoUrl: '',
          image: '',
          category: 'Web App',
          isOpenForCollaboration: true,
          rolesNeeded: ''
        });
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error publishing project');
    } finally {
      setSubmittingProject(false);
    }
  };

  // Toggle Star
  const handleToggleStar = async (projectId) => {
    try {
      const res = await api.post(`/projects/${projectId}/star`);
      if (res.data.success) {
        setProjects((prev) =>
          prev.map((p) =>
            p._id === projectId
              ? { ...p, isStarred: res.data.isStarred, starsCount: res.data.starsCount }
              : p
          )
        );
      }
    } catch (err) {
      console.error('Error starring project:', err);
    }
  };

  // Send Collaboration Request
  const handleSendCollabRequest = async (e) => {
    e.preventDefault();
    if (!selectedProjectForCollab) return;

    try {
      setSendingCollabReq(true);
      const res = await api.post(`/projects/${selectedProjectForCollab._id}/collaborate`, {
        message: collabMessage
      });
      if (res.data.success) {
        alert('Collaboration request sent to project owner!');
        setSelectedProjectForCollab(null);
        setCollabMessage('');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error sending request');
    } finally {
      setSendingCollabReq(false);
    }
  };

  // Open Manage Requests Modal (Owner)
  const handleOpenManageRequests = async (project) => {
    setManagingProject(project);
    try {
      setLoadingRequests(true);
      const res = await api.get(`/projects/${project._id}/collab-requests`);
      if (res.data.success) {
        setCollabRequests(res.data.requests);
      }
    } catch (err) {
      alert('Error fetching collaboration requests');
    } finally {
      setLoadingRequests(false);
    }
  };

  // Respond to request
  const handleRespondCollab = async (requestId, action) => {
    try {
      const res = await api.put(`/projects/collab-requests/${requestId}`, { action });
      if (res.data.success) {
        setCollabRequests((prev) =>
          prev.map((r) => (r._id === requestId ? { ...r, status: action === 'accept' ? 'accepted' : 'rejected' } : r))
        );
        fetchProjects(); // Refresh project collaborators
      }
    } catch (err) {
      alert('Error updating request');
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="dashboard-main projects-page">
        {/* Header Banner */}
        <div className="card proj-header-card">
          <div className="proj-header-title">
            <h2>Student Project Collaboration</h2>
            <p>
              Showcase your engineering creations, find teammates for hackathons &amp; final year projects, and contribute to active student repositories.
            </p>
          </div>
          <Magnetic intensity={0.25} range={55}>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => setIsPublishModalOpen(true)}
            >
              <PlusCircle size={16} /> Publish Project
            </button>
          </Magnetic>
        </div>

        {/* Filter Controls */}
        <div className="card proj-filter-card">
          <div className="search-input-wrapper">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Search projects by name, technologies, or keywords..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="proj-filter-row">
            <div className="filter-select-group">
              <label>Category:</label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="filter-select"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="form-checkbox" style={{ margin: 0 }}>
              <input
                type="checkbox"
                id="collabOnly"
                checked={collabOnly}
                onChange={(e) => setCollabOnly(e.target.checked)}
              />
              <label htmlFor="collabOnly" style={{ cursor: 'pointer', fontWeight: 600 }}>
                Looking for Collaborators Only
              </label>
            </div>
          </div>
        </div>

        {/* Projects Grid */}
        {loading ? (
          <LoadingSpinner text="Loading published projects..." />
        ) : projects.length === 0 ? (
          <div className="card empty-state">
            <FolderGit2 className="empty-state-icon" />
            <h3>No Projects Found</h3>
            <p>No student projects match your filters. Publish your engineering project to get started!</p>
            <button className="btn btn-primary btn-sm" onClick={() => setIsPublishModalOpen(true)}>
              Publish Your Project
            </button>
          </div>
        ) : (
          <AnimatedGroup className="published-projects-grid" preset="blur-slide">
            {projects.map((proj) => {
              const isOwner = user && user._id === proj.owner?._id;
              const isCollab = user && proj.collaborators?.some((c) => c._id === user._id);

              return (
                <Tilt
                  key={proj._id}
                  rotationFactor={6}
                  isRevese={false}
                  style={{ height: '100%' }}
                >
                  <div
                    id={`project-${proj._id}`}
                    className={`card published-project-card card-hoverable ${paramProjectId === proj._id ? 'highlighted-post' : ''}`}
                    style={{ position: 'relative', overflow: 'hidden', height: '100%' }}
                  >
                    <Spotlight
                      className="from-blue-500/10 via-indigo-500/5 to-transparent"
                      size={180}
                    />

                    {proj.isOpenForCollaboration && (
                      <BorderTrail
                        size={80}
                        style={{
                          background: 'linear-gradient(90deg, #3b82f6, #10b981)',
                          opacity: 0.6,
                        }}
                      />
                    )}

                    {proj.image && (
                      <div className="proj-cover-box">
                        <img src={proj.image} alt={proj.title} className="proj-cover-img" />
                      </div>
                    )}

                    <div className="proj-card-content">
                      <div className="proj-badge-line">
                        <span className="badge badge-primary">{proj.category}</span>
                        {proj.isOpenForCollaboration ? (
                          <span className="badge badge-success">Open for Collab</span>
                        ) : (
                          <span className="badge badge-dept">Completed</span>
                        )}
                      </div>

                      <h3 className="project-title">{proj.title}</h3>
                      <p className="project-desc">{proj.description}</p>

                      {/* Tech Badges */}
                      <div className="project-tech-list">
                        {proj.technologies?.map((tech, idx) => (
                          <span key={idx} className="tech-badge">{tech}</span>
                        ))}
                      </div>

                      {/* Roles Needed if open for collab */}
                      {proj.isOpenForCollaboration && proj.rolesNeeded && proj.rolesNeeded.length > 0 && (
                        <div className="roles-needed-box">
                          <span className="roles-label">Roles Needed:</span>
                          <div className="roles-chips">
                            {proj.rolesNeeded.map((r, idx) => (
                              <span key={idx} className="role-chip">{r}</span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Owner & Collaborators */}
                      <div className="proj-team-footer">
                        <div className="proj-owner-info">
                          {proj.owner?.profilePicture ? (
                            <img src={proj.owner.profilePicture} alt={proj.owner.fullName} className="team-avatar" />
                          ) : (
                            <div className="team-avatar-fallback">{proj.owner?.fullName?.charAt(0) || 'U'}</div>
                          )}
                          <div>
                            <Link to={`/profile/${proj.owner?._id}`} className="owner-name">
                              {proj.owner?.fullName}
                            </Link>
                            <span className="owner-dept">{proj.owner?.department?.split(' ')[0]}</span>
                          </div>
                        </div>

                        <div className="proj-stars-count">
                          <button
                            className={`star-btn ${proj.isStarred ? 'starred' : ''}`}
                            onClick={() => handleToggleStar(proj._id)}
                            title="Star project"
                          >
                            <Star size={16} fill={proj.isStarred ? '#f59e0b' : 'none'} />
                            <span>{proj.starsCount || 0}</span>
                          </button>
                        </div>
                      </div>

                      {/* Card Action Buttons */}
                      <div className="proj-card-actions">
                        <div className="ext-links">
                          {proj.githubUrl && (
                            <a href={proj.githubUrl} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm">
                              <GithubIcon size={14} /> Code
                            </a>
                          )}
                          {proj.liveDemoUrl && (
                            <a href={proj.liveDemoUrl} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm">
                              <ExternalLink size={14} /> Demo
                            </a>
                          )}
                        </div>

                        {isOwner ? (
                          <Magnetic intensity={0.2} range={45}>
                            <button
                              className="btn btn-outline-primary btn-sm"
                              onClick={() => handleOpenManageRequests(proj)}
                            >
                              Manage Collab Requests
                            </button>
                          </Magnetic>
                        ) : isCollab ? (
                          <span className="collab-badge-label">
                            <CheckCircle2 size={14} /> Collaborator
                          </span>
                        ) : proj.isOpenForCollaboration ? (
                          <Magnetic intensity={0.2} range={45}>
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={() => {
                                setSelectedProjectForCollab(proj);
                                setCollabMessage(`Hi ${proj.owner?.fullName}, I'm interested in collaborating on ${proj.title}!`);
                              }}
                            >
                              Request to Join
                            </button>
                          </Magnetic>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </Tilt>
              );
            })}
          </AnimatedGroup>
        )}

        {/* PUBLISH PROJECT MODAL */}
        <Modal
          isOpen={isPublishModalOpen}
          onClose={() => setIsPublishModalOpen(false)}
          title="Publish a Project to BITM Network"
          maxWidth="700px"
        >
          <form onSubmit={handlePublishProject} className="auth-form">
            <div className="form-group">
              <label className="form-label">Project Title *</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Ballari Smart Traffic Control System"
                value={publishForm.title}
                onChange={(e) => setPublishForm({ ...publishForm, title: e.target.value })}
                required
              />
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label">Category *</label>
                <select
                  className="form-control"
                  value={publishForm.category}
                  onChange={(e) => setPublishForm({ ...publishForm, category: e.target.value })}
                >
                  {categories.filter((c) => c !== 'All').map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Collaboration Status</label>
                <select
                  className="form-control"
                  value={publishForm.isOpenForCollaboration}
                  onChange={(e) => setPublishForm({ ...publishForm, isOpenForCollaboration: e.target.value === 'true' })}
                >
                  <option value="true">Looking for Collaborators</option>
                  <option value="false">Personal / Complete</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Project Description *</label>
              <textarea
                className="form-control"
                rows="4"
                placeholder="Explain what your project does, problem it solves, and current development state..."
                value={publishForm.description}
                onChange={(e) => setPublishForm({ ...publishForm, description: e.target.value })}
                required
              ></textarea>
            </div>

            <div className="form-group">
              <label className="form-label">Technologies Used (comma-separated)</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. React, Node.js, Express, MongoDB, OpenCV"
                value={publishForm.technologies}
                onChange={(e) => setPublishForm({ ...publishForm, technologies: e.target.value })}
              />
            </div>

            {publishForm.isOpenForCollaboration && (
              <div className="form-group">
                <label className="form-label">Teammate Roles Needed (comma-separated)</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. UI/UX Designer, Backend Developer, Flutter Developer"
                  value={publishForm.rolesNeeded}
                  onChange={(e) => setPublishForm({ ...publishForm, rolesNeeded: e.target.value })}
                />
              </div>
            )}

            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label">GitHub Repository URL</label>
                <input
                  type="url"
                  className="form-control"
                  placeholder="https://github.com/..."
                  value={publishForm.githubUrl}
                  onChange={(e) => setPublishForm({ ...publishForm, githubUrl: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Live Demo URL</label>
                <input
                  type="url"
                  className="form-control"
                  placeholder="https://..."
                  value={publishForm.liveDemoUrl}
                  onChange={(e) => setPublishForm({ ...publishForm, liveDemoUrl: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Project Screenshot / Cover Image URL</label>
              <input
                type="url"
                className="form-control"
                placeholder="https://images.unsplash.com/..."
                value={publishForm.image}
                onChange={(e) => setPublishForm({ ...publishForm, image: e.target.value })}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-block btn-lg"
              disabled={submittingProject}
              style={{ marginTop: '16px' }}
            >
              {submittingProject ? 'Publishing...' : 'Publish Project'}
            </button>
          </form>
        </Modal>

        {/* REQUEST TO COLLABORATE MODAL */}
        <Modal
          isOpen={!!selectedProjectForCollab}
          onClose={() => setSelectedProjectForCollab(null)}
          title={`Join ${selectedProjectForCollab?.title}`}
        >
          <form onSubmit={handleSendCollabRequest} className="auth-form">
            <p style={{ fontSize: '0.9rem', color: '#475569', marginBottom: '14px' }}>
              Send a note to <strong>{selectedProjectForCollab?.owner?.fullName}</strong> explaining how you would like to contribute:
            </p>

            <div className="form-group">
              <label className="form-label">Your Message *</label>
              <textarea
                className="form-control"
                rows="4"
                placeholder="Describe your relevant skills and which role you want to take on..."
                value={collabMessage}
                onChange={(e) => setCollabMessage(e.target.value)}
                required
              ></textarea>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-block btn-lg"
              disabled={sendingCollabReq || !collabMessage.trim()}
            >
              {sendingCollabReq ? 'Sending...' : 'Send Collaboration Request'}
            </button>
          </form>
        </Modal>

        {/* MANAGE COLLAB REQUESTS MODAL (Owner) */}
        <Modal
          isOpen={!!managingProject}
          onClose={() => setManagingProject(null)}
          title={`Collaboration Requests: ${managingProject?.title}`}
          maxWidth="640px"
        >
          {loadingRequests ? (
            <LoadingSpinner text="Fetching requests..." />
          ) : collabRequests.length === 0 ? (
            <div className="empty-state">
              <p>No collaboration requests received for this project yet.</p>
            </div>
          ) : (
            <div className="requests-stream">
              {collabRequests.map((req) => (
                <div key={req._id} className="collab-req-item card">
                  <div className="collab-applicant-row">
                    {req.applicant?.profilePicture ? (
                      <img src={req.applicant.profilePicture} alt={req.applicant.fullName} className="team-avatar" />
                    ) : (
                      <div className="team-avatar-fallback">{req.applicant?.fullName?.charAt(0) || 'U'}</div>
                    )}
                    <div>
                      <Link to={`/profile/${req.applicant?._id}`} className="owner-name">
                        {req.applicant?.fullName}
                      </Link>
                      <span className="owner-dept">
                        {req.applicant?.department} • Sem {req.applicant?.semester}
                      </span>
                    </div>
                    <span className={`status-badge ${req.status}`} style={{ marginLeft: 'auto' }}>
                      {req.status}
                    </span>
                  </div>

                  <p className="collab-msg-text">"{req.message}"</p>

                  {req.status === 'pending' && (
                    <div className="collab-action-buttons">
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => handleRespondCollab(req._id, 'accept')}
                      >
                        <Check size={14} /> Accept Teammate
                      </button>
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={() => handleRespondCollab(req._id, 'reject')}
                      >
                        <X size={14} /> Decline
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Modal>
      </main>
    </div>
  );
};

export default ProjectsPage;
