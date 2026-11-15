import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, ArrowRight, AlertCircle, Shield, User } from 'lucide-react';
import bitmLogo from '../assets/images/bitm-logo.png';
import '../styles/auth.css';

const LoginPage = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!identifier.trim() || !password) {
      setError('Please provide your Email or USN and Password.');
      return;
    }

    try {
      setLoading(true);
      const res = await login(identifier.trim(), password);
      if (res.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate(from, { replace: true });
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 'Login failed. Please verify your credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Demo shortcut login helper
  const handleQuickDemo = (demoType) => {
    if (demoType === 'student') {
      setIdentifier('3BR21CS045');
      setPassword('Password@123');
    } else if (demoType === 'student2') {
      setIdentifier('pooja.aiml@bitm.edu.in');
      setPassword('Password@123');
    } else if (demoType === 'admin') {
      setIdentifier('admin@bitm.edu.in');
      setPassword('Admin@BITM2024');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card card">
        <div className="auth-header">
          <Link to="/" className="auth-logo-link">
            <img src={bitmLogo} alt="BITM Logo" className="auth-logo" />
          </Link>
          <h2>Welcome Back</h2>
          <p>Log in to access your BITM student portal</p>
        </div>

        {error && (
          <div className="alert alert-danger">
            <AlertCircle size={18} className="alert-icon" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">College Email or USN</label>
            <div className="input-with-icon">
              <Mail size={18} className="input-icon" />
              <input
                type="text"
                className="form-control with-icon"
                placeholder="e.g. 3BR21CS045 or student@bitm.edu.in"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <div className="label-with-link">
              <label className="form-label">Password</label>
              <Link to="/forgot-password" className="forgot-link">
                Forgot password?
              </Link>
            </div>
            <div className="input-with-icon">
              <Lock size={18} className="input-icon" />
              <input
                type="password"
                className="form-control with-icon"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-checkbox">
            <input
              type="checkbox"
              id="remember"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            <label htmlFor="remember">Remember me on this browser</label>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block btn-lg"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Sign In'} <ArrowRight size={18} />
          </button>
        </form>

        {/* Demo Fast Login Buttons */}
        <div className="demo-login-box">
          <span className="demo-label">Quick Demo Logins:</span>
          <div className="demo-buttons">
            <button
              type="button"
              className="demo-btn student"
              onClick={() => handleQuickDemo('student')}
            >
              <User size={14} /> Rahul (CSE)
            </button>
            <button
              type="button"
              className="demo-btn student"
              onClick={() => handleQuickDemo('student2')}
            >
              <User size={14} /> Pooja (AIML)
            </button>
            <button
              type="button"
              className="demo-btn admin"
              onClick={() => handleQuickDemo('admin')}
            >
              <Shield size={14} /> BITM Admin
            </button>
          </div>
        </div>

        <div className="auth-footer">
          <p>
            Don't have an account yet?{' '}
            <Link to="/register" className="auth-highlight-link">
              Register as BITM Student
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
