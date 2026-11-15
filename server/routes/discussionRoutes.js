const express = require('express');
const router = express.Router();
const {
  getDiscussions,
  getDiscussionById,
  createDiscussion,
  addAnswer,
  markAcceptedAnswer,
  upvoteAnswer,
  deleteDiscussion
} = require('../controllers/discussionController');
const { protect, optionalAuth } = require('../middleware/auth');

router.get('/', optionalAuth, getDiscussions);
router.get('/:id', optionalAuth, getDiscussionById);
router.post('/', protect, createDiscussion);
router.post('/:id/answers', protect, addAnswer);
router.put('/:id/answers/:answerId/accept', protect, markAcceptedAnswer);
router.post('/:id/answers/:answerId/upvote', protect, upvoteAnswer);
router.delete('/:id', protect, deleteDiscussion);

module.exports = router;
