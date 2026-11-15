import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../services/api';
import {
  Search, Filter, Users, UserPlus, Check, Clock, UserCheck,
  Code, GraduationCap, X, ChevronRight
} from 'lucide-react';
import '../styles/network.css';

const ExploreStudentsPage = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedSem, setSelectedSem] = useState('All');
  const [skillFilter, setSkillFilter] = useState('');
  const [interestFilter, setInterestFilter] = useState('');

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

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (selectedDept !== 'All') params.append('department', selectedDept);
      if (selectedSem !== 'All') params.append('semester', selectedSem);
      if (skillFilter) params.append('skill', skillFilter);
      if (interestFilter) params.append('interest', interestFilter);

      const res = await api.get(`/users?${params.toString()}`);
      if (res.data.success) {
        setStudents(res.data.users);
      }
    } catch (err) {
      console.error('Error fetching students:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchStudents();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [search, selectedDept, selectedSem, skillFilter, interestFilter]);

  const handleSendRequest = async (targetId) => {
    try {
      const res = await api.post(`/connections/request/${targetId}`);
      if (res.data.success) {
        setStudents((prev) =>
          prev.map((s) => s._id === targetId ? { ...s, connectionStatus: 'sent' } : s)
        );
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error sending connection request');
    }
  };

  const handleAcceptRequest = async (requestId, targetId) => {
    try {
      const res = await api.put(`/connections/request/${requestId}`, { action: 'accept' });
      if (res.data.success) {
        setStudents((prev) =>
          prev.map((s) => s._id === targetId ? { ...s, connectionStatus: 'connected' } : s)
        );
      }
    } catch (err) {
      alert('Error accepting connection request');
    }
  };

  const resetFilters = () => {
    setSearch('');
    setSelectedDept('All');
    setSelectedSem('All');
    setSkillFilter('');
    setInterestFilter('');
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="dashboard-main network-page">
        {/* Page Title & Navigation Banner */}
        <div className="card network-header-card">
          <div className="network-header-title">
            <h2>Explore BITM Students &amp; Peers</h2>
            <p>
              Discover and connect with engineering colleagues, seniors, project teammates, and study partners.
            </p>
          </div>
          <Link to="/connections" className="btn btn-outline-primary btn-sm">
            <Users size={16} /> My Network &amp; Requests
          </Link>
        </div>

        {/* Search & Multi-Filter Bar */}
        <div className="card filter-bar-card">
          <div className="search-input-wrapper">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="Search students by name, USN, or keywords..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button className="clear-search-btn" onClick={() => setSearch('')}>
                <X size={16} />
              </button>
            )}
          </div>

          <div className="filters-row">
            <div className="filter-select-group">
              <label>Department:</label>
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="filter-select"
              >
                {departments.map((dept) => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            <div className="filter-select-group">
              <label>Semester:</label>
              <select
                value={selectedSem}
                onChange={(e) => setSelectedSem(e.target.value)}
                className="filter-select"
              >
                <option value="All">All Semesters</option>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                  <option key={s} value={s}>Semester {s}</option>
                ))}
              </select>
            </div>

            <div className="filter-select-group">
              <label>Skill:</label>
              <input
                type="text"
                placeholder="e.g. React, Python"
                value={skillFilter}
                onChange={(e) => setSkillFilter(e.target.value)}
                className="filter-text-input"
              />
            </div>

            {(selectedDept !== 'All' || selectedSem !== 'All' || search || skillFilter) && (
              <button className="btn btn-outline btn-sm reset-filter-btn" onClick={resetFilters}>
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Results Grid */}
        {loading ? (
          <LoadingSpinner text="Searching student directory..." />
        ) : students.length === 0 ? (
          <div className="card empty-state">
            <Users className="empty-state-icon" />
            <h3>No Students Found</h3>
            <p>No students match your current search and filter criteria. Try adjusting your query.</p>
            <button className="btn btn-outline-primary btn-sm" onClick={resetFilters}>
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="student-cards-grid">
            {students.map((student) => (
              <div key={student._id} className="card student-card card-hoverable">
                <div className="student-card-top">
                  <div className="student-avatar-box">
                    {student.profilePicture ? (
                      <img
                        src={student.profilePicture}
                        alt={student.fullName}
                        className="student-avatar"
                      />
                    ) : (
                      <div className="student-avatar-fallback">
                        {student.fullName.charAt(0)}
                      </div>
                    )}
                  </div>
                  <span className="student-usn-badge">{student.usn}</span>
                </div>

                <div className="student-card-info">
                  <Link to={`/profile/${student._id}`} className="student-name">
                    {student.fullName}
                  </Link>
                  <span className="student-dept">{student.department}</span>
                  <span className="student-sem-sec">
                    Semester {student.semester || 1} • Section {student.section || 'A'}
                  </span>

                  <p className="student-headline-snippet">
                    {student.headline || `BITM Student • ${student.department}`}
                  </p>

                  {/* Skills Preview */}
                  <div className="student-skills-preview">
                    {student.skills && student.skills.slice(0, 3).map((sk, idx) => (
                      <span key={idx} className="skill-chip">{sk}</span>
                    ))}
                    {student.skills && student.skills.length > 3 && (
                      <span className="skill-chip-more">+{student.skills.length - 3}</span>
                    )}
                  </div>
                </div>

                <div className="student-card-actions">
                  <Link to={`/profile/${student._id}`} className="btn btn-outline btn-sm">
                    View Profile
                  </Link>

                  {student.connectionStatus === 'connected' ? (
                    <span className="status-badge connected">
                      <UserCheck size={14} /> Connected
                    </span>
                  ) : student.connectionStatus === 'sent' ? (
                    <span className="status-badge pending">
                      <Clock size={14} /> Request Sent
                    </span>
                  ) : student.connectionStatus === 'received' ? (
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => handleAcceptRequest(student.requestId, student._id)}
                    >
                      <Check size={14} /> Accept Request
                    </button>
                  ) : (
                    <button
                      className="btn btn-outline-primary btn-sm"
                      onClick={() => handleSendRequest(student._id)}
                    >
                      <UserPlus size={14} /> Connect
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default ExploreStudentsPage;
