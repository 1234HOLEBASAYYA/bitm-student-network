const express = require('express');
const router = express.Router();
const {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  toggleInterest
} = require('../controllers/eventController');
const { protect, optionalAuth, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', optionalAuth, getEvents);
router.get('/:id', optionalAuth, getEventById);
router.post('/', protect, upload.single('bannerImage'), createEvent);
router.put('/:id', protect, upload.single('bannerImage'), updateEvent);
router.delete('/:id', protect, deleteEvent);
router.post('/:id/interest', protect, toggleInterest);

module.exports = router;
