const express = require('express');
const router = express.Router();
const {
  getOpportunities,
  getOpportunityById,
  createOpportunity,
  updateOpportunity,
  deleteOpportunity
} = require('../controllers/opportunityController');
const { protect, optionalAuth } = require('../middleware/auth');

router.get('/', optionalAuth, getOpportunities);
router.get('/:id', optionalAuth, getOpportunityById);
router.post('/', protect, createOpportunity);
router.put('/:id', protect, updateOpportunity);
router.delete('/:id', protect, deleteOpportunity);

module.exports = router;
