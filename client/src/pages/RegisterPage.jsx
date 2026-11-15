import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  User, Mail, Hash, Lock, Building, Calendar, Layers,
  Code, Heart, ArrowRight, AlertCircle, CheckCircle2
} from 'lucide-react';
import bitmLogo from '../assets/images/bitm-logo.png';
import '../styles/auth.css';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    usn: '',
    email: '',
    password: '',
    confirmPassword: '',
    department: 'Computer Science & Engineering',
    semester: 3,
    section: 'A',
    skills: '',
    interests: '',
    aboutMe: ''
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const departments = [
    'Computer Science & Engineering',
    'Information Science & Engineering',
    'Artificial Intelligence & Machine Learning',
    'Electronics & Communication Engineering',
    'Electrical & Electronics Engineering',
    'Mechanical Engineering',
    'Civil Engineering',
    'Management Studies (MBA)'
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation checks
    if (!formData.fullName.trim()) {
      setError('Please enter your full name.');
      return;
    }

    if (!formData.usn.trim()) {
      setError('Please provide your VTU USN (e.g. 3BR22CS045).');
      return;
    }

    if (!formData.email.trim()) {
      setError('Please provide your college email address.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      setLoading(true);
      await register(formData);
      navigate('/dashboard');
    } catch (err) {
      setError(
        err.response?.data?.message || 'Registration failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page register-page">
      <div className="auth-card register-card card">
        <div className="auth-header">
          <Link to="/" className="auth-logo-link">
            <img src={bitmLogo} alt="BITM Logo" className="auth-logo" />
          </Link>
          <h2>Student Registration</h2>
          <p>Create your verified BITM student networking account</p>
        </div>

        {error && (
          <div className="alert alert-danger">
            <AlertCircle size={18} className="alert-icon" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-row-2">
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <div className="input-with-icon">
                <User size={18} className="input-icon" />
                <input
                  type="text"
                  name="fullName"
                  className="form-control with-icon"
                  placeholder="e.g. Rahul Sharma"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">University Seat Number (USN) *</label>
              <div className="input-with-icon">
                <Hash size={18} className="input-icon" />
                <input
                  type="text"
                  name="usn"
                  className="form-control with-icon"
                  placeholder="e.g. 3BR21CS045"
                  value={formData.usn}
                  onChange={handleChange}
                  required
                  style={{ textTransform: 'uppercase' }}
                />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">College Email Address *</label>
            <div className="input-with-icon">
              <Mail size={18} className="input-icon" />
              <input
                type="email"
                name="email"
                className="form-control with-icon"
                placeholder="e.g. student@bitm.edu.in or name@gmail.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label className="form-label">Password *</label>
              <div className="input-with-icon">
                <Lock size={18} className="input-icon" />
                <input
                  type="password"
                  name="password"
                  className="form-control with-icon"
                  placeholder="Min 6 characters"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Confirm Password *</label>
              <div className="input-with-icon">
                <Lock size={18} className="input-icon" />
                <input
                  type="password"
                  name="confirmPassword"
                  className="form-control with-icon"
                  placeholder="Re-enter password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          <div className="form-row-3">
            <div className="form-group" style={{ flex: 2 }}>
              <label className="form-label">Department *</label>
              <div className="input-with-icon">
                <Building size={18} className="input-icon" />
                <select
                  name="department"
                  className="form-control with-icon"
                  value={formData.department}
                  onChange={handleChange}
                  required
                >
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Semester *</label>
              <div className="input-with-icon">
                <Calendar size={18} className="input-icon" />
                <select
                  name="semester"
                  className="form-control with-icon"
                  value={formData.semester}
                  onChange={handleChange}
                  required
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                    <option key={sem} value={sem}>
                      Sem {sem}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Section</label>
              <div className="input-with-icon">
                <Layers size={18} className="input-icon" />
                <input
                  type="text"
                  name="section"
                  className="form-control with-icon"
                  placeholder="A"
                  value={formData.section}
                  onChange={handleChange}
                  maxLength="2"
                  style={{ textTransform: 'uppercase' }}
                />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Technical Skills (comma-separated)</label>
            <div className="input-with-icon">
              <Code size={18} className="input-icon" />
              <input
                type="text"
                name="skills"
                className="form-control with-icon"
                placeholder="e.g. React.js, Python, Java, Data Structures, Arduino"
                value={formData.skills}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Areas of Interest (comma-separated)</label>
            <div className="input-with-icon">
              <Heart size={18} className="input-icon" />
              <input
                type="text"
                name="interests"
                className="form-control with-icon"
                placeholder="e.g. Web Development, AI/ML, Cloud Computing, Robotics"
                value={formData.interests}
                onChange={handleChange}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block btn-lg"
            disabled={loading}
          >
            {loading ? 'Creating Student Profile...' : 'Complete Registration'} <ArrowRight size={18} />
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Already have a BITM student account?{' '}
            <Link to="/login" className="auth-highlight-link">
              Log in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
