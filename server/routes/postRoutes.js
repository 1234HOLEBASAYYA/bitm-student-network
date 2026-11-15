const express = require('express');
const router = express.Router();
const {
  getPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  likePost,
  addComment,
  deleteComment
} = require('../controllers/postController');
const { protect, optionalAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', optionalAuth, getPosts);
router.get('/:id', optionalAuth, getPostById);
router.post('/', protect, upload.single('image'), createPost);
router.put('/:id', protect, upload.single('image'), updatePost);
router.delete('/:id', protect, deletePost);
router.post('/:id/like', protect, likePost);
router.post('/:id/comments', protect, addComment);
router.delete('/comments/:commentId', protect, deleteComment);

module.exports = router;
