const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: [true, 'Post content cannot be empty'],
    trim: true
  },
  image: {
    type: String,
    default: ''
  },
  category: {
    type: String,
    enum: ['General', 'Technical Knowledge', 'Project Update', 'Achievement', 'Campus News', 'Career'],
    default: 'General'
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  commentsCount: {
    type: Number,
    default: 0
  },
  isPinned: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Post', postSchema);
