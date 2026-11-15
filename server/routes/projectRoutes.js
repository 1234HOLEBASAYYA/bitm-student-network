const express = require('express');
const router = express.Router();
const {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  toggleStar,
  requestCollaboration,
  getCollabRequests,
  respondCollabRequest
} = require('../controllers/projectController');
const { protect, optionalAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', optionalAuth, getProjects);
router.get('/:id', optionalAuth, getProjectById);
router.post('/', protect, upload.single('image'), createProject);
router.put('/:id', protect, upload.single('image'), updateProject);
router.delete('/:id', protect, deleteProject);
router.post('/:id/star', protect, toggleStar);
router.post('/:id/collaborate', protect, requestCollaboration);
router.get('/:id/collab-requests', protect, getCollabRequests);
router.put('/collab-requests/:requestId', protect, respondCollabRequest);

module.exports = router;
