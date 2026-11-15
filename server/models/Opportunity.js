const mongoose = require('mongoose');

const opportunitySchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Opportunity title is required'],
    trim: true
  },
  organization: {
    type: String,
    required: [true, 'Organization / Company name is required'],
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: [
      'Internship',
      'Hackathon',
      'Workshop',
      'Technical Competition',
      'Coding Event',
      'Placement Opportunity',
      'Online Course',
      'Certification'
    ]
  },
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  eligibility: {
    type: String,
    default: 'Open to all BITM students'
  },
  location: {
    type: String,
    default: 'Remote / On-site'
  },
  stipendOrPrize: {
    type: String,
    default: ''
  },
  applyLink: {
    type: String,
    required: [true, 'Application link is required'],
    trim: true
  },
  deadline: {
    type: Date,
    required: [true, 'Last date / deadline is required']
  },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['approved', 'pending', 'rejected'],
    default: 'approved' // Admin posted are auto-approved, student posted can be pending
  },
  isOfficial: {
    type: Boolean,
    default: false
  },
  views: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Opportunity', opportunitySchema);
