const express = require('express');
const router = express.Router();
const {
  getStats,
  getAllStudents,
  updateStudentStatus,
  deleteStudent,
  createAnnouncement,
  getAnnouncements,
  deleteAnnouncement,
  createReport,
  getReports,
  updateReport
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

// Report content can be submitted by any authenticated student
router.post('/reports', protect, createReport);

// All other admin routes require role: 'admin'
router.use(protect, authorize('admin'));

router.get('/stats', getStats);
router.get('/students', getAllStudents);
router.put('/students/:id/status', updateStudentStatus);
router.delete('/students/:id', deleteStudent);
router.post('/announcements', createAnnouncement);
router.get('/announcements', getAnnouncements);
router.delete('/announcements/:id', deleteAnnouncement);
router.get('/reports', getReports);
router.put('/reports/:id', updateReport);

module.exports = router;
