import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Mail, Lock, ArrowRight, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';
import bitmLogo from '../assets/images/bitm-logo.png';
import '../styles/auth.css';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [step, setStep] = useState(1); // 1 = request token, 2 = set new password
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRequestToken = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      setLoading(true);
      const res = await api.post('/auth/forgot-password', { email });
      setResetToken(res.data.resetToken);
      setSuccess('Reset token verified! Please enter your new password.');
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Error processing request.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      setLoading(true);
      const res = await api.post('/auth/reset-password', {
        resetToken,
        newPassword,
        confirmPassword
      });
      setSuccess(res.data.message);
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card card">
        <div className="auth-header">
          <Link to="/" className="auth-logo-link">
            <img src={bitmLogo} alt="BITM Logo" className="auth-logo" />
          </Link>
          <h2>Reset Password</h2>
          <p>Recover access to your BITM Student Network account</p>
        </div>

        {error && (
          <div className="alert alert-danger">
            <AlertCircle size={18} className="alert-icon" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="alert alert-success">
            <CheckCircle2 size={18} className="alert-icon" />
            <span>{success}</span>
          </div>
        )}

        {step === 1 && (
          <form onSubmit={handleRequestToken} className="auth-form">
            <div className="form-group">
              <label className="form-label">Registered Student Email</label>
              <div className="input-with-icon">
                <Mail size={18} className="input-icon" />
                <input
                  type="email"
                  className="form-control with-icon"
                  placeholder="e.g. rahul.cs@bitm.edu.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-block btn-lg"
              disabled={loading}
            >
              {loading ? 'Verifying...' : 'Request Password Reset'} <ArrowRight size={18} />
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleResetPassword} className="auth-form">
            <div className="form-group">
              <label className="form-label">New Password</label>
              <div className="input-with-icon">
                <Lock size={18} className="input-icon" />
                <input
                  type="password"
                  className="form-control with-icon"
                  placeholder="At least 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Confirm New Password</label>
              <div className="input-with-icon">
                <Lock size={18} className="input-icon" />
                <input
                  type="password"
                  className="form-control with-icon"
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-block btn-lg"
              disabled={loading}
            >
              {loading ? 'Updating Password...' : 'Save New Password'} <ArrowRight size={18} />
            </button>
          </form>
        )}

        {step === 3 && (
          <div style={{ textAlign: 'center', marginTop: '16px' }}>
            <Link to="/login" className="btn btn-primary btn-lg">
              Proceed to Sign In
            </Link>
          </div>
        )}

        <div className="auth-footer">
          <Link to="/login" className="back-link">
            <ArrowLeft size={16} /> Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
