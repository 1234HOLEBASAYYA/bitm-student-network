import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import LoadingSpinner from '../components/LoadingSpinner';
import Modal from '../components/Modal';
import api from '../services/api';
import {
  Calendar, Clock, MapPin, Users, PlusCircle, ExternalLink,
  Check, Heart, Trash2, Edit3, Building
} from 'lucide-react';
import '../styles/events.css';

const EventsPage = () => {
  const { user, isAdmin } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('upcoming'); // 'upcoming', 'past'

  // Add Event Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    eventType: 'Workshop',
    date: '',
    venue: '',
    organizer: 'BITM Department of Computer Science',
    registrationLink: '',
    bannerImage: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const eventTypes = [
    'Workshop',
    'Seminar',
    'Tech Fest',
    'Hackathon',
    'Guest Lecture',
    'Cultural & Sports',
    'Placement Drive'
  ];

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/events?timeframe=${timeframe}`);
      if (res.data.success) {
        setEvents(res.data.events);
      }
    } catch (err) {
      console.error('Error fetching events:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [timeframe]);

  // Toggle Interested
  const handleToggleInterest = async (eventId) => {
    try {
      const res = await api.post(`/events/${eventId}/interest`);
      if (res.data.success) {
        setEvents((prev) =>
          prev.map((e) =>
            e._id === eventId
              ? { ...e, isInterested: res.data.isInterested, interestedCount: res.data.interestedCount }
              : e
          )
        );
      }
    } catch (err) {
      console.error('Error updating interest:', err);
    }
  };

  // Add Event
  const handleCreateEvent = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await api.post('/events', eventForm);
      if (res.data.success) {
        setEvents([res.data.event, ...events]);
        setIsModalOpen(false);
        setEventForm({
          title: '',
          description: '',
          eventType: 'Workshop',
          date: '',
          venue: '',
          organizer: 'BITM Technical Committee',
          registrationLink: '',
          bannerImage: ''
        });
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating event');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Event
  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm('Delete this event?')) return;
    try {
      const res = await api.delete(`/events/${eventId}`);
      if (res.data.success) {
        setEvents((prev) => prev.filter((e) => e._id !== eventId));
      }
    } catch (err) {
      alert('Error deleting event');
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="dashboard-main events-page">
        {/* Header */}
        <div className="card events-header-card">
          <div className="events-header-title">
            <h2>Campus Events &amp; Technical Workshops</h2>
            <p>
              Participate in guest lectures, hands-on bootcamps, departmental symposiums, and college fests.
            </p>
          </div>
          {isAdmin && (
            <button
              className="btn btn-primary btn-sm"
              onClick={() => setIsModalOpen(true)}
            >
              <PlusCircle size={16} /> Add Campus Event
            </button>
          )}
        </div>

        {/* Timeframe Filter Bar */}
        <div className="events-timeframe-bar">
          <button
            className={`time-tab-btn ${timeframe === 'upcoming' ? 'active' : ''}`}
            onClick={() => setTimeframe('upcoming')}
          >
            Upcoming Events
          </button>
          <button
            className={`time-tab-btn ${timeframe === 'past' ? 'active' : ''}`}
            onClick={() => setTimeframe('past')}
          >
            Past Events
          </button>
        </div>

        {/* Events Grid */}
        {loading ? (
          <LoadingSpinner text="Fetching events schedule..." />
        ) : events.length === 0 ? (
          <div className="card empty-state">
            <Calendar className="empty-state-icon" />
            <h3>No Events Scheduled</h3>
            <p>There are no {timeframe} events listed currently. Check back soon for fresh workshop notices!</p>
          </div>
        ) : (
          <div className="events-cards-grid">
            {events.map((evt) => {
              const eventDate = new Date(evt.date);

              return (
                <div key={evt._id} className="card event-item-card card-hoverable">
                  {evt.bannerImage && (
                    <div className="event-banner-box">
                      <img src={evt.bannerImage} alt={evt.title} className="event-banner-img" />
                    </div>
                  )}

                  <div className="event-item-content">
                    <div className="event-top-line">
                      <span className="badge badge-primary">{evt.eventType}</span>
                      {isAdmin && (
                        <button
                          className="event-del-btn"
                          onClick={() => handleDeleteEvent(evt._id)}
                          title="Delete Event"
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>

                    <h3 className="event-title">{evt.title}</h3>
                    <p className="event-desc">{evt.description}</p>

                    <div className="event-details-box">
                      <div className="event-detail-row">
                        <Clock size={15} className="detail-icon" />
                        <span>
                          {eventDate.toLocaleDateString(undefined, {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}{' '}
                          at{' '}
                          {eventDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <div className="event-detail-row">
                        <MapPin size={15} className="detail-icon" />
                        <span>{evt.venue}</span>
                      </div>

                      <div className="event-detail-row">
                        <Building size={15} className="detail-icon" />
                        <span>Organizer: {evt.organizer}</span>
                      </div>
                    </div>

                    <div className="event-footer-actions">
                      <button
                        className={`btn ${evt.isInterested ? 'btn-success' : 'btn-outline-primary'} btn-sm`}
                        onClick={() => handleToggleInterest(evt._id)}
                      >
                        <Heart size={14} fill={evt.isInterested ? '#ffffff' : 'none'} />
                        {evt.isInterested ? 'Interested' : 'RSVP / Interested'} ({evt.interestedCount || 0})
                      </button>

                      {evt.registrationLink && (
                        <a
                          href={evt.registrationLink}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-primary btn-sm"
                        >
                          Register Link <ExternalLink size={13} />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ADD EVENT MODAL */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Add New Campus Event"
          maxWidth="680px"
        >
          <form onSubmit={handleCreateEvent} className="auth-form">
            <div className="form-group">
              <label className="form-label">Event Name / Title *</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. BITM INVENTO 2025 - National Hackathon"
                value={eventForm.title}
                onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                required
              />
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label">Event Type *</label>
                <select
                  className="form-control"
                  value={eventForm.eventType}
                  onChange={(e) => setEventForm({ ...eventForm, eventType: e.target.value })}
                >
                  {eventTypes.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Date &amp; Time *</label>
                <input
                  type="datetime-local"
                  className="form-control"
                  value={eventForm.date}
                  onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label">Campus Venue *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Main Auditorium, BITM Campus"
                  value={eventForm.venue}
                  onChange={(e) => setEventForm({ ...eventForm, venue: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Organizing Body *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. CSE Dept &amp; Coding Club"
                  value={eventForm.organizer}
                  onChange={(e) => setEventForm({ ...eventForm, organizer: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Event Description *</label>
              <textarea
                className="form-control"
                rows="4"
                placeholder="Details about schedules, eligibility, keynote speakers..."
                value={eventForm.description}
                onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                required
              ></textarea>
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label">Registration URL (optional)</label>
                <input
                  type="url"
                  className="form-control"
                  placeholder="https://..."
                  value={eventForm.registrationLink}
                  onChange={(e) => setEventForm({ ...eventForm, registrationLink: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Banner Image URL</label>
                <input
                  type="url"
                  className="form-control"
                  placeholder="https://images.unsplash.com/..."
                  value={eventForm.bannerImage}
                  onChange={(e) => setEventForm({ ...eventForm, bannerImage: e.target.value })}
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-block btn-lg"
              disabled={submitting}
              style={{ marginTop: '16px' }}
            >
              {submitting ? 'Creating Event...' : 'Publish Campus Event'}
            </button>
          </form>
        </Modal>
      </main>
    </div>
  );
};

export default EventsPage;
