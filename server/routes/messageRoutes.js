const express = require('express');
const router = express.Router();
const {
  getConversations,
  getMessagesWithUser,
  sendMessage
} = require('../controllers/messageController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/conversations', getConversations);
router.get('/:targetUserId', getMessagesWithUser);
router.post('/:targetUserId', sendMessage);

module.exports = router;
