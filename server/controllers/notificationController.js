const Notification = require('../models/Notification');

// @desc    Get all notifications for current user
// @route   GET /api/notifications
// @access  Private
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .populate('sender', 'fullName profilePicture usn department')
      .sort({ createdAt: -1 })
      .limit(50);

    const unreadCount = await Notification.countDocuments({
      recipient: req.user._id,
      read: false
    });

    res.status(200).json({
      success: true,
      unreadCount,
      notifications
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error retrieving notifications' });
  }
};

// @desc    Mark single notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      recipient: req.user._id
    });

    if (!notification) return res.status(404).json({ success: false, message: 'Notification not found' });

    notification.read = true;
    await notification.save();

    res.status(200).json({
      success: true,
      message: 'Marked as read'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating notification' });
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, read: false },
      { $set: { read: true } }
    );

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating notifications' });
  }
};

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private
exports.deleteNotification = async (req, res) => {
  try {
    await Notification.findOneAndDelete({
      _id: req.params.id,
      recipient: req.user._id
    });

    res.status(200).json({
      success: true,
      message: 'Notification deleted'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting notification' });
  }
};
