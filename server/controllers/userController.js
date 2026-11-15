const User = require('../models/User');
const Connection = require('../models/Connection');
const ConnectionRequest = require('../models/ConnectionRequest');

// @desc    Get all students with search and filters
// @route   GET /api/users
// @access  Private / Public
exports.getUsers = async (req, res) => {
  try {
    const { search, department, semester, skill, interest, page = 1, limit = 20 } = req.query;

    const query = { role: 'student', status: 'active' };

    // Exclude currently logged in user if available
    if (req.user) {
      query._id = { $ne: req.user._id };
    }

    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { usn: { $regex: search, $options: 'i' } }
      ];
    }

    if (department && department !== 'All') {
      query.department = department;
    }

    if (semester && semester !== 'All') {
      query.semester = Number(semester);
    }

    if (skill) {
      query.skills = { $regex: skill, $options: 'i' };
    }

    if (interest) {
      query.interests = { $regex: interest, $options: 'i' };
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await User.countDocuments(query);

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    // If authenticated, annotate each user with connection status
    let usersWithStatus = users;
    if (req.user) {
      const currentUserId = req.user._id;

      // Get all accepted connections of current user
      const connections = await Connection.find({
        $or: [{ user1: currentUserId }, { user2: currentUserId }]
      });
      const connectedUserIds = new Set(
        connections.map(c => c.user1.toString() === currentUserId.toString() ? c.user2.toString() : c.user1.toString())
      );

      // Get pending requests sent by current user
      const sentRequests = await ConnectionRequest.find({
        sender: currentUserId,
        status: 'pending'
      });
      const sentRequestUserIds = new Set(sentRequests.map(r => r.receiver.toString()));

      // Get pending requests received by current user
      const receivedRequests = await ConnectionRequest.find({
        receiver: currentUserId,
        status: 'pending'
      });
      const receivedRequestMap = new Map(
        receivedRequests.map(r => [r.sender.toString(), r._id])
      );

      usersWithStatus = users.map(u => {
        const uObj = u.toObject();
        const uId = u._id.toString();

        if (connectedUserIds.has(uId)) {
          uObj.connectionStatus = 'connected';
        } else if (sentRequestUserIds.has(uId)) {
          uObj.connectionStatus = 'sent';
        } else if (receivedRequestMap.has(uId)) {
          uObj.connectionStatus = 'received';
          uObj.requestId = receivedRequestMap.get(uId);
        } else {
          uObj.connectionStatus = 'none';
        }
        return uObj;
      });
    }

    res.status(200).json({
      success: true,
      count: usersWithStatus.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      users: usersWithStatus
    });
  } catch (error) {
    console.error('getUsers error:', error);
    res.status(500).json({ success: false, message: 'Server error retrieving students.' });
  }
};

// @desc    Get user profile by ID
// @route   GET /api/users/:id
// @access  Public / Private
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'Student profile not found.' });
    }

    const uObj = user.toObject();

    // Count connections
    const connectionsCount = await Connection.countDocuments({
      $or: [{ user1: user._id }, { user2: user._id }]
    });
    uObj.connectionsCount = connectionsCount;

    // Check relationship with viewing user
    if (req.user) {
      const currentUserId = req.user._id;
      if (currentUserId.toString() === user._id.toString()) {
        uObj.connectionStatus = 'self';
      } else {
        const isConnected = await Connection.findOne({
          $or: [
            { user1: currentUserId, user2: user._id },
            { user1: user._id, user2: currentUserId }
          ]
        });

        if (isConnected) {
          uObj.connectionStatus = 'connected';
        } else {
          const sentReq = await ConnectionRequest.findOne({
            sender: currentUserId,
            receiver: user._id,
            status: 'pending'
          });
          const recReq = await ConnectionRequest.findOne({
            sender: user._id,
            receiver: currentUserId,
            status: 'pending'
          });

          if (sentReq) {
            uObj.connectionStatus = 'sent';
          } else if (recReq) {
            uObj.connectionStatus = 'received';
            uObj.requestId = recReq._id;
          } else {
            uObj.connectionStatus = 'none';
          }
        }
      }
    }

    // Apply privacy controls for phone/email if not self and not connected
    if (req.user && req.user._id.toString() !== user._id.toString()) {
      if (!user.privacy?.showPhone) {
        delete uObj.phone;
      }
      if (!user.privacy?.showEmail) {
        delete uObj.email;
      }
    }

    res.status(200).json({
      success: true,
      user: uObj
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error retrieving profile.' });
  }
};

// @desc    Update profile
// @route   PUT /api/users/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const {
      fullName,
      headline,
      aboutMe,
      department,
      semester,
      section,
      skills,
      interests,
      github,
      linkedin,
      phone,
      privacy
    } = req.body;

    if (fullName) user.fullName = fullName.trim();
    if (headline !== undefined) user.headline = headline;
    if (aboutMe !== undefined) user.aboutMe = aboutMe;
    if (department) user.department = department;
    if (semester !== undefined) user.semester = Number(semester);
    if (section !== undefined) user.section = section;
    if (github !== undefined) user.github = github;
    if (linkedin !== undefined) user.linkedin = linkedin;
    if (phone !== undefined) user.phone = phone;
    if (privacy) user.privacy = { ...user.privacy, ...privacy };

    if (skills !== undefined) {
      user.skills = Array.isArray(skills)
        ? skills
        : typeof skills === 'string'
          ? skills.split(',').map(s => s.trim()).filter(Boolean)
          : [];
    }

    if (interests !== undefined) {
      user.interests = Array.isArray(interests)
        ? interests
        : typeof interests === 'string'
          ? interests.split(',').map(i => i.trim()).filter(Boolean)
          : [];
    }

    await user.save();
    const updated = await User.findById(user._id).select('-password');

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully!',
      user: updated
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Error updating profile.' });
  }
};

// @desc    Upload profile picture
// @route   POST /api/users/avatar
// @access  Private
exports.uploadAvatar = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    let avatarUrl = '';
    if (req.file) {
      avatarUrl = `/uploads/${req.file.filename}`;
    } else if (req.body.avatarUrl) {
      avatarUrl = req.body.avatarUrl;
    } else {
      return res.status(400).json({ success: false, message: 'No file or avatar URL provided' });
    }

    user.profilePicture = avatarUrl;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile picture updated successfully!',
      profilePicture: avatarUrl
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error uploading avatar.' });
  }
};

// @desc    Add project to profile
// @route   POST /api/users/projects
// @access  Private
exports.addProject = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const { title, description, techStack, githubUrl, liveUrl, date } = req.body;

    if (!title || !description) {
      return res.status(400).json({ success: false, message: 'Project title and description are required.' });
    }

    const techArray = Array.isArray(techStack)
      ? techStack
      : typeof techStack === 'string'
        ? techStack.split(',').map(t => t.trim()).filter(Boolean)
        : [];

    user.projects.unshift({
      title,
      description,
      techStack: techArray,
      githubUrl: githubUrl || '',
      liveUrl: liveUrl || '',
      date: date || ''
    });

    await user.save();
    res.status(201).json({
      success: true,
      message: 'Project added to your profile!',
      projects: user.projects
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error adding project.' });
  }
};

// @desc    Delete project from profile
// @route   DELETE /api/users/projects/:projectId
// @access  Private
exports.deleteProject = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.projects = user.projects.filter(p => p._id.toString() !== req.params.projectId);
    await user.save();
    res.status(200).json({
      success: true,
      message: 'Project deleted.',
      projects: user.projects
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting project.' });
  }
};

// @desc    Add achievement to profile
// @route   POST /api/users/achievements
// @access  Private
exports.addAchievement = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const { title, description, year } = req.body;
    if (!title) {
      return res.status(400).json({ success: false, message: 'Achievement title is required.' });
    }
    user.achievements.unshift({ title, description, year });
    await user.save();
    res.status(201).json({ success: true, message: 'Achievement added!', achievements: user.achievements });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error adding achievement.' });
  }
};

// @desc    Delete achievement
// @route   DELETE /api/users/achievements/:id
// @access  Private
exports.deleteAchievement = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.achievements = user.achievements.filter(a => a._id.toString() !== req.params.id);
    await user.save();
    res.status(200).json({ success: true, message: 'Achievement removed.', achievements: user.achievements });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting achievement.' });
  }
};

// @desc    Add certification
// @route   POST /api/users/certifications
// @access  Private
exports.addCertification = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const { name, organization, issueDate, credentialUrl } = req.body;
    if (!name || !organization) {
      return res.status(400).json({ success: false, message: 'Certification name and organization are required.' });
    }
    user.certifications.unshift({ name, organization, issueDate, credentialUrl });
    await user.save();
    res.status(201).json({ success: true, message: 'Certification added!', certifications: user.certifications });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error adding certification.' });
  }
};

// @desc    Delete certification
// @route   DELETE /api/users/certifications/:id
// @access  Private
exports.deleteCertification = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.certifications = user.certifications.filter(c => c._id.toString() !== req.params.id);
    await user.save();
    res.status(200).json({ success: true, message: 'Certification removed.', certifications: user.certifications });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting certification.' });
  }
};
