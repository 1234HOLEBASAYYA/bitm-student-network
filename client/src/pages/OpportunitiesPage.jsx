import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import LoadingSpinner from '../components/LoadingSpinner';
import Modal from '../components/Modal';
import api from '../services/api';
import {
  Briefcase, PlusCircle, Search, Calendar, MapPin, ExternalLink,
  Award, Clock, Building, ShieldCheck, Tag, CheckCircle2
} from 'lucide-react';
import '../styles/opportunities.css';

const OpportunitiesPage = () => {
  const { user, isAdmin } = useAuth();
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [search, setSearch] = useState('');

  // Post Opportunity Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    organization: '',
    category: 'Internship',
    description: '',
    eligibility: 'Open to 5th & 7th semester BITM students',
    location: 'Bengaluru / Hybrid',
    stipendOrPrize: '',
    applyLink: '',
    deadline: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const categories = [
    'All',
    'Internship',
    'Hackathon',
    'Workshop',
    'Technical Competition',
    'Coding Event',
    'Placement Opportunity',
    'Online Course',
    'Certification'
  ];

  const fetchOpportunities = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedCategory !== 'All') params.append('category', selectedCategory);
      if (search) params.append('search', search);

      const res = await api.get(`/opportunities?${params.toString()}`);
      if (res.data.success) {
        setOpportunities(res.data.opportunities);
      }
    } catch (err) {
      console.error('Error fetching opportunities:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOpportunities();
  }, [selectedCategory, search]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await api.post('/opportunities', formData);
      if (res.data.success) {
        setOpportunities([res.data.opportunity, ...opportunities]);
        setIsModalOpen(false);
        setFormData({
          title: '',
          organization: '',
          category: 'Internship',
          description: '',
          eligibility: '',
          location: '',
          stipendOrPrize: '',
          applyLink: '',
          deadline: ''
        });
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error posting opportunity');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="dashboard-main opportunities-page">
        {/* Header */}
        <div className="card opp-header-card">
          <div className="opp-header-title">
            <h2>Internships &amp; Career Opportunities</h2>
            <p>
              Discover verified industry internships, campus placement notices, state &amp; national hackathons, and certifications.
            </p>
          </div>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => setIsModalOpen(true)}
          >
            <PlusCircle size={16} /> Share Opportunity
          </button>
        </div>

        {/* Filter Controls */}
        <div className="card opp-filter-card">
          <div className="search-input-wrapper">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Search by role, company name (e.g. Infosys, TCS), or keyword..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="opp-category-chips">
            {categories.map((cat) => (
              <button
                key={cat}
                className={`opp-chip ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Opportunities List */}
        {loading ? (
          <LoadingSpinner text="Searching available opportunities..." />
        ) : opportunities.length === 0 ? (
          <div className="card empty-state">
            <Briefcase className="empty-state-icon" />
            <h3>No Opportunities Found</h3>
            <p>No listings match your search filters right now. Check back soon or share an opening you know about.</p>
          </div>
        ) : (
          <div className="opportunities-grid">
            {opportunities.map((opp) => {
              const deadlineDate = new Date(opp.deadline);
              const isExpired = deadlineDate < new Date();

              return (
                <div key={opp._id} className="card opp-card card-hoverable">
                  <div className="opp-card-top">
                    <span className="opp-cat-pill">{opp.category}</span>
                    {opp.isOfficial && (
                      <span className="badge badge-success official-badge">
                        <ShieldCheck size={13} /> BITM Official
                      </span>
                    )}
                  </div>

                  <h3 className="opp-card-title">{opp.title}</h3>

                  <div className="opp-org-row">
                    <Building size={16} className="opp-icon" />
                    <strong>{opp.organization}</strong>
                  </div>

                  <p className="opp-card-desc">{opp.description}</p>

                  <div className="opp-meta-grid">
                    <div className="meta-item">
                      <span className="meta-lbl">Eligibility:</span>
                      <span className="meta-val">{opp.eligibility}</span>
                    </div>

                    <div className="meta-item">
                      <span className="meta-lbl">Location:</span>
                      <span className="meta-val">{opp.location || 'Remote / Hybrid'}</span>
                    </div>

                    {opp.stipendOrPrize && (
                      <div className="meta-item">
                        <span className="meta-lbl">Compensation:</span>
                        <span className="meta-val highlight">{opp.stipendOrPrize}</span>
                      </div>
                    )}
                  </div>

                  <div className="opp-card-footer">
                    <div className="deadline-col">
                      <Clock size={14} />
                      <span className={isExpired ? 'text-danger' : ''}>
                        Last Date: {deadlineDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>

                    <a
                      href={opp.applyLink}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-primary btn-sm"
                    >
                      Apply Now <ExternalLink size={14} />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* POST OPPORTUNITY MODAL */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Share an Opportunity with BITM Students"
          maxWidth="680px"
        >
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label className="form-label">Opportunity Title *</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Graduate Software Engineer Intern"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label">Organization / Company *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Infosys, TCS, HackerEarth"
                  value={formData.organization}
                  onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Category *</label>
                <select
                  className="form-control"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  {categories.filter((c) => c !== 'All').map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Description *</label>
              <textarea
                className="form-control"
                rows="4"
                placeholder="Provide role description, responsibilities, and selection procedure..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              ></textarea>
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label">Eligibility Criteria</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. B.E. 6th/7th Sem (CSE, ISE, ECE) Min 6.5 CGPA"
                  value={formData.eligibility}
                  onChange={(e) => setFormData({ ...formData, eligibility: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Stipend / Prize Pool</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. ₹20,000/month or ₹50,000 Cash Prize"
                  value={formData.stipendOrPrize}
                  onChange={(e) => setFormData({ ...formData, stipendOrPrize: e.target.value })}
                />
              </div>
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label">Application / Registration Link *</label>
                <input
                  type="url"
                  className="form-control"
                  placeholder="https://company.com/apply"
                  value={formData.applyLink}
                  onChange={(e) => setFormData({ ...formData, applyLink: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Last Date to Apply (Deadline) *</label>
                <input
                  type="date"
                  className="form-control"
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-block btn-lg"
              disabled={submitting}
              style={{ marginTop: '16px' }}
            >
              {submitting ? 'Publishing...' : 'Publish Opportunity'}
            </button>
          </form>
        </Modal>
      </main>
    </div>
  );
};

export default OpportunitiesPage;
