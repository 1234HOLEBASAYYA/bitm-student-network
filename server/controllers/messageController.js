const Message = require('../models/Message');
const Connection = require('../models/Connection');
const User = require('../models/User');

// @desc    Get conversation list
// @route   GET /api/messages/conversations
// @access  Private
exports.getConversations = async (req, res) => {
  try {
    const currentUserId = req.user._id;

    // First find all connected students
    const connections = await Connection.find({
      $or: [{ user1: currentUserId }, { user2: currentUserId }]
    })
      .populate('user1', 'fullName usn department profilePicture headline')
      .populate('user2', 'fullName usn department profilePicture headline');

    const connectedUsers = connections.map(c => {
      return c.user1._id.toString() === currentUserId.toString() ? c.user2 : c.user1;
    }).filter(Boolean);

    // For each connected user, fetch last message and unread count
    const conversationList = await Promise.all(
      connectedUsers.map(async (friend) => {
        const lastMsg = await Message.findOne({
          $or: [
            { sender: currentUserId, receiver: friend._id },
            { sender: friend._id, receiver: currentUserId }
          ]
        }).sort({ createdAt: -1 });

        const unreadCount = await Message.countDocuments({
          sender: friend._id,
          receiver: currentUserId,
          read: false
        });

        return {
          user: friend,
          lastMessage: lastMsg ? lastMsg.text : '',
          lastMessageTime: lastMsg ? lastMsg.createdAt : null,
          lastMessageSender: lastMsg ? lastMsg.sender : null,
          unreadCount
        };
      })
    );

    // Sort by most recent message first, then alphabetical
    conversationList.sort((a, b) => {
      if (a.lastMessageTime && b.lastMessageTime) {
        return new Date(b.lastMessageTime) - new Date(a.lastMessageTime);
      }
      if (a.lastMessageTime) return -1;
      if (b.lastMessageTime) return 1;
      return a.user.fullName.localeCompare(b.user.fullName);
    });

    res.status(200).json({
      success: true,
      conversations: conversationList
    });
  } catch (error) {
    console.error('getConversations error:', error);
    res.status(500).json({ success: false, message: 'Error retrieving conversations' });
  }
};

// @desc    Get message history with a specific student
// @route   GET /api/messages/:targetUserId
// @access  Private
exports.getMessagesWithUser = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const targetUserId = req.params.targetUserId;

    // Verify connection exists
    const isConnected = await Connection.findOne({
      $or: [
        { user1: currentUserId, user2: targetUserId },
        { user1: targetUserId, user2: currentUserId }
      ]
    });

    if (!isConnected && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You can only message students who are connected with you.'
      });
    }

    // Mark unread messages sent by targetUser as read
    await Message.updateMany(
      { sender: targetUserId, receiver: currentUserId, read: false },
      { $set: { read: true } }
    );

    const messages = await Message.find({
      $or: [
        { sender: currentUserId, receiver: targetUserId },
        { sender: targetUserId, receiver: currentUserId }
      ]
    })
      .sort({ createdAt: 1 })
      .populate('sender', 'fullName profilePicture')
      .populate('receiver', 'fullName profilePicture');

    const targetUser = await User.findById(targetUserId).select('fullName usn department profilePicture headline status');

    res.status(200).json({
      success: true,
      targetUser,
      messages
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error retrieving messages' });
  }
};

// @desc    Send a message
// @route   POST /api/messages/:targetUserId
// @access  Private
exports.sendMessage = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const targetUserId = req.params.targetUserId;
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, message: 'Message text cannot be empty' });
    }

    // Verify connection
    const isConnected = await Connection.findOne({
      $or: [
        { user1: currentUserId, user2: targetUserId },
        { user1: targetUserId, user2: currentUserId }
      ]
    });

    if (!isConnected && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You can only message students who are connected with you.'
      });
    }

    const message = await Message.create({
      sender: currentUserId,
      receiver: targetUserId,
      text: text.trim(),
      read: false
    });

    const populated = await Message.findById(message._id)
      .populate('sender', 'fullName profilePicture')
      .populate('receiver', 'fullName profilePicture');

    res.status(201).json({
      success: true,
      message: populated
    });
  } catch (error) {
    console.error('sendMessage error:', error);
    res.status(500).json({ success: false, message: 'Error sending message' });
  }
};
