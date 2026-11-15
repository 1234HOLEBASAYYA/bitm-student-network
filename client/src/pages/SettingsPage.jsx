import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Settings, Lock, Shield, CheckCircle2, AlertCircle } from 'lucide-react';

const SettingsPage = () => {
  const { user, updateUser } = useAuth();
  const [showEmail, setShowEmail] = useState(user?.privacy?.showEmail ?? true);
  const [showPhone, setShowPhone] = useState(user?.privacy?.showPhone ?? false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [savingPrivacy, setSavingPrivacy] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const handleSavePrivacy = async (e) => {
    e.preventDefault();
    setMsg('');
    setError('');
    try {
      setSavingPrivacy(true);
      const res = await api.put('/users/profile', {
        privacy: { showEmail, showPhone }
      });
      if (res.data.success) {
        updateUser(res.data.user);
        setMsg('Privacy preferences saved successfully!');
      }
    } catch (err) {
      setError('Error saving privacy preferences.');
    } finally {
      setSavingPrivacy(false);
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="dashboard-main">
        <div className="card" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '1.45rem', color: '#003366', marginBottom: '4px' }}>
            Account Settings &amp; Preferences
          </h2>
          <p style={{ fontSize: '0.9rem', color: '#64748b' }}>
            Manage your BITM account security, privacy visibility, and notification preferences.
          </p>
        </div>

        {msg && (
          <div className="alert alert-success">
            <CheckCircle2 size={18} />
            <span>{msg}</span>
          </div>
        )}

        {error && (
          <div className="alert alert-danger">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* Privacy Preferences */}
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Shield size={20} style={{ color: '#0066cc' }} />
            <h3 style={{ fontSize: '1.15rem', color: '#003366', margin: 0 }}>
              Profile Privacy Controls
            </h3>
          </div>

          <form onSubmit={handleSavePrivacy}>
            <div className="form-checkbox" style={{ marginBottom: '14px' }}>
              <input
                type="checkbox"
                id="showEmail"
                checked={showEmail}
                onChange={(e) => setShowEmail(e.target.checked)}
              />
              <label htmlFor="showEmail" style={{ cursor: 'pointer' }}>
                Show my college email address on my public profile
              </label>
            </div>

            <div className="form-checkbox" style={{ marginBottom: '20px' }}>
              <input
                type="checkbox"
                id="showPhone"
                checked={showPhone}
                onChange={(e) => setShowPhone(e.target.checked)}
              />
              <label htmlFor="showPhone" style={{ cursor: 'pointer' }}>
                Show my phone number to connected peers only
              </label>
            </div>

            <button type="submit" className="btn btn-primary btn-sm" disabled={savingPrivacy}>
              {savingPrivacy ? 'Saving...' : 'Save Privacy Settings'}
            </button>
          </form>
        </div>

        {/* College Identity Information */}
        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.15rem', color: '#003366', marginBottom: '12px' }}>
            Academic Credentials (Read-Only)
          </h3>
          <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '16px' }}>
            To update your registered USN or Department, contact the BITM academic registrar.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>USN</span>
              <strong style={{ fontSize: '0.95rem', color: '#003366' }}>{user?.usn}</strong>
            </div>

            <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>Department</span>
              <strong style={{ fontSize: '0.95rem', color: '#003366' }}>{user?.department}</strong>
            </div>

            <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>Role</span>
              <strong style={{ fontSize: '0.95rem', color: user?.role === 'admin' ? '#7c3aed' : '#059669', textTransform: 'capitalize' }}>
                {user?.role}
              </strong>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SettingsPage;
