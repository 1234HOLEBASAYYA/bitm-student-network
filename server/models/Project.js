const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Project title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Project description is required'],
    trim: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  technologies: [{
    type: String,
    trim: true
  }],
  githubUrl: {
    type: String,
    trim: true,
    default: ''
  },
  liveDemoUrl: {
    type: String,
    trim: true,
    default: ''
  },
  image: {
    type: String,
    default: ''
  },
  category: {
    type: String,
    enum: ['Web App', 'Mobile App', 'AI/ML', 'IoT & Embedded', 'Cloud & DevOps', 'Cybersecurity', 'Blockchain', 'Other'],
    default: 'Web App'
  },
  isOpenForCollaboration: {
    type: Boolean,
    default: true
  },
  rolesNeeded: [{
    type: String,
    trim: true
  }],
  collaborators: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  stars: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Project', projectSchema);
