const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Event title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Event description is required']
  },
  eventType: {
    type: String,
    enum: ['Workshop', 'Seminar', 'Tech Fest', 'Hackathon', 'Guest Lecture', 'Cultural & Sports', 'Placement Drive'],
    default: 'Workshop'
  },
  date: {
    type: Date,
    required: [true, 'Event date and time is required']
  },
  endDate: {
    type: Date
  },
  venue: {
    type: String,
    required: [true, 'Venue / Location is required'],
    trim: true
  },
  organizer: {
    type: String,
    required: [true, 'Organizer is required'],
    trim: true
  },
  bannerImage: {
    type: String,
    default: ''
  },
  registrationLink: {
    type: String,
    trim: true,
    default: ''
  },
  interestedStudents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Event', eventSchema);
