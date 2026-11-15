const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: [true, 'Answer content is required'],
    trim: true
  },
  isAccepted: {
    type: Boolean,
    default: false
  },
  upvotes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true
});

const discussionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Discussion title is required'],
    trim: true
  },
  content: {
    type: String,
    required: [true, 'Discussion content is required'],
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: [
      'Programming',
      'Data Structures and Algorithms',
      'Web Development',
      'Artificial Intelligence',
      'Machine Learning',
      'Database Management',
      'Computer Networks',
      'Cybersecurity',
      'Projects',
      'Other Technical Topics'
    ]
  },
  tags: [{
    type: String,
    trim: true
  }],
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  answers: [answerSchema],
  views: {
    type: Number,
    default: 0
  },
  isSolved: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Discussion', discussionSchema);
