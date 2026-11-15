const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  reporter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  contentType: {
    type: String,
    enum: ['Post', 'Comment', 'Discussion', 'Project', 'User'],
    required: true
  },
  contentId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  reason: {
    type: String,
    required: [true, 'Please provide reason for reporting'],
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'dismissed', 'action_taken'],
    default: 'pending'
  },
  adminNotes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Report', reportSchema);
