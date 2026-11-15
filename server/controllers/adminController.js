const User = require('../models/User');
const Post = require('../models/Post');
const Discussion = require('../models/Discussion');
const Project = require('../models/Project');
const Opportunity = require('../models/Opportunity');
const Event = require('../models/Event');
const Announcement = require('../models/Announcement');
const Report = require('../models/Report');
const Notification = require('../models/Notification');

// @desc    Get admin overview statistics
// @route   GET /api/admin/stats
// @access  Private (Admin only)
exports.getStats = async (req, res) => {
  try {
    const [
      totalStudents,
      activeStudents,
      pendingStudents,
      totalPosts,
      totalDiscussions,
      totalProjects,
      totalOpportunities,
      totalEvents,
      pendingReports
    ] = await Promise.all([
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'student', status: 'active' }),
      User.countDocuments({ role: 'student', status: 'pending' }),
      Post.countDocuments(),
      Discussion.countDocuments(),
      Project.countDocuments(),
      Opportunity.countDocuments(),
      Event.countDocuments(),
      Report.countDocuments({ status: 'pending' })
    ]);

    // Breakdown by department
    const deptStats = await User.aggregate([
      { $match: { role: 'student' } },
      { $group: { _id: '$department', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalStudents,
        activeStudents,
        pendingStudents,
        totalPosts,
        totalDiscussions,
        totalProjects,
        totalOpportunities,
        totalEvents,
        pendingReports,
        deptStats
      }
    });
  } catch (error) {
    console.error('getStats error:', error);
    res.status(500).json({ success: false, message: 'Error retrieving admin statistics' });
  }
};

// @desc    Get all students with admin filters
// @route   GET /api/admin/students
// @access  Private (Admin only)
exports.getAllStudents = async (req, res) => {
  try {
    const { search, department, status, page = 1, limit = 20 } = req.query;
    let query = { role: 'student' };

    if (status && status !== 'All') {
      query.status = status;
    }

    if (department && department !== 'All') {
      query.department = department;
    }

    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { usn: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await User.countDocuments(query);

    const students = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      count: students.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      students
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error retrieving students' });
  }
};

// @desc    Update student status (approve, activate, deactivate)
// @route   PUT /api/admin/students/:id/status
// @access  Private (Admin only)
exports.updateStudentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['active', 'pending', 'deactivated'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const student = await User.findById(req.params.id);
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

    student.status = status;
    await student.save();

    res.status(200).json({
      success: true,
      message: `Student status updated to '${status}'.`,
      student
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating student status' });
  }
};

// @desc    Delete student account
// @route   DELETE /api/admin/students/:id
// @access  Private (Admin only)
exports.deleteStudent = async (req, res) => {
  try {
    const student = await User.findById(req.params.id);
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

    await User.findByIdAndDelete(req.params.id);
    // Also clean up posts
    await Post.deleteMany({ author: req.params.id });

    res.status(200).json({
      success: true,
      message: 'Student account deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting student' });
  }
};

// @desc    Create official college announcement
// @route   POST /api/admin/announcements
// @access  Private (Admin only)
exports.createAnnouncement = async (req, res) => {
  try {
    const { title, content, priority, targetDepartment } = req.body;

    if (!title || !content) {
      return res.status(400).json({ success: false, message: 'Title and content are required' });
    }

    const announcement = await Announcement.create({
      title: title.trim(),
      content: content.trim(),
      priority: priority || 'Normal',
      targetDepartment: targetDepartment || 'All',
      postedBy: req.user._id
    });

    // Notify all students or target department
    const studentQuery = { role: 'student', status: 'active' };
    if (targetDepartment && targetDepartment !== 'All') {
      studentQuery.department = targetDepartment;
    }

    const students = await User.find(studentQuery).select('_id');

    if (students.length > 0) {
      const notifications = students.map(s => ({
        recipient: s._id,
        sender: req.user._id,
        type: 'admin_announcement',
        message: `Official Announcement: ${title}`,
        link: '/announcements'
      }));

      await Notification.insertMany(notifications);
    }

    res.status(201).json({
      success: true,
      message: 'Announcement published and broadcasted to students!',
      announcement
    });
  } catch (error) {
    console.error('createAnnouncement error:', error);
    res.status(500).json({ success: false, message: 'Error creating announcement' });
  }
};

// @desc    Get all announcements
// @route   GET /api/admin/announcements
// @access  Public / Private
exports.getAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find()
      .populate('postedBy', 'fullName')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      announcements
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error retrieving announcements' });
  }
};

// @desc    Delete announcement
// @route   DELETE /api/admin/announcements/:id
// @access  Private (Admin only)
exports.deleteAnnouncement = async (req, res) => {
  try {
    await Announcement.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Announcement deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting announcement' });
  }
};

// @desc    Report content
// @route   POST /api/admin/reports
// @access  Private
exports.createReport = async (req, res) => {
  try {
    const { contentType, contentId, reason } = req.body;

    if (!contentType || !contentId || !reason) {
      return res.status(400).json({ success: false, message: 'All report fields are required' });
    }

    const report = await Report.create({
      reporter: req.user._id,
      contentType,
      contentId,
      reason
    });

    res.status(201).json({
      success: true,
      message: 'Report submitted for review. BITM administrators will review it promptly.',
      report
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error submitting report' });
  }
};

// @desc    Get reports
// @route   GET /api/admin/reports
// @access  Private (Admin only)
exports.getReports = async (req, res) => {
  try {
    const reports = await Report.find()
      .populate('reporter', 'fullName usn email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      reports
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error retrieving reports' });
  }
};

// @desc    Update report status
// @route   PUT /api/admin/reports/:id
// @access  Private (Admin only)
exports.updateReport = async (req, res) => {
  try {
    const { status, adminNotes } = req.body;
    const report = await Report.findById(req.params.id);

    if (!report) return res.status(404).json({ success: false, message: 'Report not found' });

    if (status) report.status = status;
    if (adminNotes !== undefined) report.adminNotes = adminNotes;

    await report.save();

    res.status(200).json({
      success: true,
      message: 'Report updated',
      report
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating report' });
  }
};
