const express = require('express');
const router = express.Router();
const {
  sendRequest,
  getRequests,
  respondRequest,
  getConnections,
  removeConnection
} = require('../controllers/connectionController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', getConnections);
router.get('/requests', getRequests);
router.post('/request/:receiverId', sendRequest);
router.put('/request/:requestId', respondRequest);
router.delete('/:targetUserId', removeConnection);

module.exports = router;
