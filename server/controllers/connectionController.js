const Connection = require('../models/Connection');
const ConnectionRequest = require('../models/ConnectionRequest');
const Notification = require('../models/Notification');
const User = require('../models/User');

// @desc    Send connection request
// @route   POST /api/connections/request/:receiverId
// @access  Private
exports.sendRequest = async (req, res) => {
  try {
    const senderId = req.user._id;
    const receiverId = req.params.receiverId;

    if (senderId.toString() === receiverId.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot connect with yourself.' });
    }

    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ success: false, message: 'Student not found.' });
    }

    // Check if already connected
    const existingConnection = await Connection.findOne({
      $or: [
        { user1: senderId, user2: receiverId },
        { user1: receiverId, user2: senderId }
      ]
    });
    if (existingConnection) {
      return res.status(400).json({ success: false, message: 'You are already connected with this student.' });
    }

    // Check if pending request exists
    const existingRequest = await ConnectionRequest.findOne({
      $or: [
        { sender: senderId, receiver: receiverId, status: 'pending' },
        { sender: receiverId, receiver: senderId, status: 'pending' }
      ]
    });

    if (existingRequest) {
      if (existingRequest.sender.toString() === senderId.toString()) {
        return res.status(400).json({ success: false, message: 'Connection request is already pending.' });
      } else {
        return res.status(400).json({ success: false, message: 'This student has already sent you a connection request. Check your pending requests.' });
      }
    }

    const request = await ConnectionRequest.create({
      sender: senderId,
      receiver: receiverId,
      status: 'pending',
      message: req.body.message || ''
    });

    // Send notification
    await Notification.create({
      recipient: receiverId,
      sender: senderId,
      type: 'connection_request',
      message: `${req.user.fullName} sent you a connection request.`,
      link: '/connections'
    });

    res.status(201).json({
      success: true,
      message: `Connection request sent to ${receiver.fullName}!`,
      request
    });
  } catch (error) {
    console.error('sendRequest error:', error);
    res.status(500).json({ success: false, message: 'Error sending connection request.' });
  }
};

// @desc    Get pending received and sent connection requests
// @route   GET /api/connections/requests
// @access  Private
exports.getRequests = async (req, res) => {
  try {
    const received = await ConnectionRequest.find({
      receiver: req.user._id,
      status: 'pending'
    }).populate('sender', 'fullName usn department semester section profilePicture headline skills');

    const sent = await ConnectionRequest.find({
      sender: req.user._id,
      status: 'pending'
    }).populate('receiver', 'fullName usn department semester section profilePicture headline skills');

    res.status(200).json({
      success: true,
      received,
      sent
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error retrieving connection requests.' });
  }
};

// @desc    Accept or reject connection request
// @route   PUT /api/connections/request/:requestId
// @access  Private
exports.respondRequest = async (req, res) => {
  try {
    const { action } = req.body; // 'accept' or 'reject'
    const request = await ConnectionRequest.findById(req.params.requestId);

    if (!request) {
      return res.status(404).json({ success: false, message: 'Connection request not found.' });
    }

    if (request.receiver.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to respond to this request.' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ success: false, message: `Request is already ${request.status}.` });
    }

    if (action === 'accept') {
      request.status = 'accepted';
      await request.save();

      // Create Connection document
      await Connection.create({
        user1: request.sender,
        user2: request.receiver
      });

      // Send notification to sender
      await Notification.create({
        recipient: request.sender,
        sender: req.user._id,
        type: 'connection_accepted',
        message: `${req.user.fullName} accepted your connection request.`,
        link: `/profile/${req.user._id}`
      });

      return res.status(200).json({
        success: true,
        message: 'Connection request accepted! You are now connected.'
      });
    } else if (action === 'reject') {
      request.status = 'rejected';
      await request.save();

      return res.status(200).json({
        success: true,
        message: 'Connection request rejected.'
      });
    } else {
      return res.status(400).json({ success: false, message: "Action must be 'accept' or 'reject'." });
    }
  } catch (error) {
    console.error('respondRequest error:', error);
    res.status(500).json({ success: false, message: 'Error processing request.' });
  }
};

// @desc    Get user's connections
// @route   GET /api/connections
// @access  Private
exports.getConnections = async (req, res) => {
  try {
    const targetUserId = req.query.userId || req.user._id;

    const connections = await Connection.find({
      $or: [{ user1: targetUserId }, { user2: targetUserId }]
    })
      .populate('user1', 'fullName usn department semester section profilePicture headline skills')
      .populate('user2', 'fullName usn department semester section profilePicture headline skills');

    // Extract the other user in the connection
    const formatted = connections.map(conn => {
      const isUser1 = conn.user1._id.toString() === targetUserId.toString();
      const friend = isUser1 ? conn.user2 : conn.user1;
      return {
        connectionId: conn._id,
        connectedSince: conn.createdAt,
        user: friend
      };
    }).filter(c => c.user != null);

    res.status(200).json({
      success: true,
      count: formatted.length,
      connections: formatted
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error retrieving connections.' });
  }
};

// @desc    Remove connection
// @route   DELETE /api/connections/:targetUserId
// @access  Private
exports.removeConnection = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const targetUserId = req.params.targetUserId;

    const deleted = await Connection.findOneAndDelete({
      $or: [
        { user1: currentUserId, user2: targetUserId },
        { user1: targetUserId, user2: currentUserId }
      ]
    });

    // Also remove any accepted connection requests
    await ConnectionRequest.deleteMany({
      $or: [
        { sender: currentUserId, receiver: targetUserId },
        { sender: targetUserId, receiver: currentUserId }
      ]
    });

    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Connection not found.' });
    }

    res.status(200).json({
      success: true,
      message: 'Connection removed successfully.'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error removing connection.' });
  }
};
