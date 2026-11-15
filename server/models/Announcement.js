const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Announcement title is required'],
    trim: true
  },
  content: {
    type: String,
    required: [true, 'Announcement content is required']
  },
  priority: {
    type: String,
    enum: ['Normal', 'Important', 'Urgent'],
    default: 'Normal'
  },
  targetDepartment: {
    type: String,
    default: 'All'
  },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  expiresAt: {
    type: Date
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Announcement', announcementSchema);
