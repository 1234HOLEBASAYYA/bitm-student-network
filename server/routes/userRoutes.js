const express = require('express');
const router = express.Router();
const {
  getUsers,
  getUserById,
  updateProfile,
  uploadAvatar,
  addProject,
  deleteProject,
  addAchievement,
  deleteAchievement,
  addCertification,
  deleteCertification
} = require('../controllers/userController');
const { protect, optionalAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', optionalAuth, getUsers);
router.get('/:id', optionalAuth, getUserById);
router.put('/profile', protect, updateProfile);
router.post('/avatar', protect, upload.single('avatar'), uploadAvatar);
router.post('/projects', protect, addProject);
router.delete('/projects/:projectId', protect, deleteProject);
router.post('/achievements', protect, addAchievement);
router.delete('/achievements/:id', protect, deleteAchievement);
router.post('/certifications', protect, addCertification);
router.delete('/certifications/:id', protect, deleteCertification);

module.exports = router;
