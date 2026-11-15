const mongoose = require('mongoose');

const collaborationRequestSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  applicant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  message: {
    type: String,
    required: [true, 'Please explain how you would like to contribute'],
    trim: true
  },
  skills: [{
    type: String,
    trim: true
  }],
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending'
  }
}, {
  timestamps: true
});

collaborationRequestSchema.index({ project: 1, applicant: 1 }, { unique: true });

module.exports = mongoose.model('CollaborationRequest', collaborationRequestSchema);
