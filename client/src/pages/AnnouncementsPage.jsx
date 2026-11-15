import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../services/api';
import { ShieldAlert, AlertTriangle, Info, Bell, Calendar } from 'lucide-react';

const AnnouncementsPage = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        setLoading(true);
        const res = await api.get('/admin/announcements');
        if (res.data.success) {
          setAnnouncements(res.data.announcements);
        }
      } catch (err) {
        console.error('Error fetching announcements:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();
  }, []);

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'Urgent':
        return <span className="badge badge-danger">Urgent Notice</span>;
      case 'Important':
        return <span className="badge badge-warning">Important</span>;
      default:
        return <span className="badge badge-primary">General</span>;
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="dashboard-main">
        <div className="card" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '1.45rem', color: '#003366', marginBottom: '4px' }}>
            Official BITM Announcements
          </h2>
          <p style={{ fontSize: '0.9rem', color: '#64748b' }}>
            Official circulars and notifications released by Ballari Institute of Technology and Management administration.
          </p>
        </div>

        {loading ? (
          <LoadingSpinner text="Loading college circulars..." />
        ) : announcements.length === 0 ? (
          <div className="card empty-state">
            <Bell className="empty-state-icon" />
            <h3>No Announcements</h3>
            <p>No official college announcements have been posted at this time.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {announcements.map((ann) => (
              <div key={ann._id} className="card" style={{ padding: '24px', borderLeft: ann.priority === 'Urgent' ? '4px solid #ef4444' : ann.priority === 'Important' ? '4px solid #f59e0b' : '4px solid #003366' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  {getPriorityBadge(ann.priority)}
                  <span style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Calendar size={13} /> {new Date(ann.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>

                <h3 style={{ fontSize: '1.2rem', color: '#003366', marginBottom: '10px' }}>{ann.title}</h3>
                <p style={{ fontSize: '0.95rem', color: '#334155', lineHeight: 1.65, whiteSpace: 'pre-line' }}>
                  {ann.content}
                </p>

                <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#64748b' }}>
                  <span>Target: <strong>{ann.targetDepartment || 'All Departments'}</strong></span>
                  <span>Issued by: <strong>BITM Administration</strong></span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default AnnouncementsPage;
