const Project = require('../models/Project');
const CollaborationRequest = require('../models/CollaborationRequest');
const Notification = require('../models/Notification');

// @desc    Get all published projects
// @route   GET /api/projects
// @access  Public / Private
exports.getProjects = async (req, res) => {
  try {
    const { category, search, openForCollab, page = 1, limit = 12 } = req.query;
    let query = {};

    if (category && category !== 'All') {
      query.category = category;
    }

    if (openForCollab !== undefined && openForCollab !== 'All') {
      query.isOpenForCollaboration = openForCollab === 'true';
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { technologies: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Project.countDocuments(query);

    const projects = await Project.find(query)
      .populate('owner', 'fullName usn department profilePicture headline')
      .populate('collaborators', 'fullName usn department profilePicture')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const formatted = projects.map(p => {
      const pObj = p.toObject();
      pObj.starsCount = p.stars ? p.stars.length : 0;
      pObj.isStarred = req.user && p.stars ? p.stars.some(id => id.toString() === req.user._id.toString()) : false;
      return pObj;
    });

    res.status(200).json({
      success: true,
      count: formatted.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      projects: formatted
    });
  } catch (error) {
    console.error('getProjects error:', error);
    res.status(500).json({ success: false, message: 'Error retrieving projects' });
  }
};

// @desc    Get single project
// @route   GET /api/projects/:id
// @access  Public / Private
exports.getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'fullName usn department profilePicture headline skills')
      .populate('collaborators', 'fullName usn department profilePicture headline skills');

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const pObj = project.toObject();
    pObj.starsCount = project.stars ? project.stars.length : 0;
    pObj.isStarred = req.user && project.stars ? project.stars.some(id => id.toString() === req.user._id.toString()) : false;

    // Check if user has pending collaboration request
    if (req.user) {
      const existingReq = await CollaborationRequest.findOne({
        project: project._id,
        applicant: req.user._id
      });
      pObj.myCollabRequest = existingReq;
    }

    res.status(200).json({
      success: true,
      project: pObj
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error retrieving project' });
  }
};

// @desc    Create new project
// @route   POST /api/projects
// @access  Private
exports.createProject = async (req, res) => {
  try {
    const {
      title,
      description,
      technologies,
      githubUrl,
      liveDemoUrl,
      category,
      isOpenForCollaboration,
      rolesNeeded
    } = req.body;

    let imageUrl = req.body.image || '';
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    }

    if (!title || !description) {
      return res.status(400).json({ success: false, message: 'Title and description are required' });
    }

    const techArray = Array.isArray(technologies)
      ? technologies
      : typeof technologies === 'string'
        ? technologies.split(',').map(t => t.trim()).filter(Boolean)
        : [];

    const rolesArray = Array.isArray(rolesNeeded)
      ? rolesNeeded
      : typeof rolesNeeded === 'string'
        ? rolesNeeded.split(',').map(r => r.trim()).filter(Boolean)
        : [];

    const project = await Project.create({
      title: title.trim(),
      description: description.trim(),
      owner: req.user._id,
      technologies: techArray,
      githubUrl: githubUrl || '',
      liveDemoUrl: liveDemoUrl || '',
      image: imageUrl,
      category: category || 'Web App',
      isOpenForCollaboration: isOpenForCollaboration === 'true' || isOpenForCollaboration === true,
      rolesNeeded: rolesArray
    });

    const populated = await Project.findById(project._id)
      .populate('owner', 'fullName usn department profilePicture headline');

    res.status(201).json({
      success: true,
      message: 'Project published successfully!',
      project: populated
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Error creating project' });
  }
};

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private
exports.updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

    if (project.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to update this project' });
    }

    const {
      title,
      description,
      technologies,
      githubUrl,
      liveDemoUrl,
      category,
      isOpenForCollaboration,
      rolesNeeded
    } = req.body;

    if (title) project.title = title.trim();
    if (description) project.description = description.trim();
    if (githubUrl !== undefined) project.githubUrl = githubUrl;
    if (liveDemoUrl !== undefined) project.liveDemoUrl = liveDemoUrl;
    if (category) project.category = category;
    if (isOpenForCollaboration !== undefined) project.isOpenForCollaboration = isOpenForCollaboration;

    if (technologies !== undefined) {
      project.technologies = Array.isArray(technologies)
        ? technologies
        : typeof technologies === 'string'
          ? technologies.split(',').map(t => t.trim()).filter(Boolean)
          : [];
    }

    if (rolesNeeded !== undefined) {
      project.rolesNeeded = Array.isArray(rolesNeeded)
        ? rolesNeeded
        : typeof rolesNeeded === 'string'
          ? rolesNeeded.split(',').map(r => r.trim()).filter(Boolean)
          : [];
    }

    if (req.file) {
      project.image = `/uploads/${req.file.filename}`;
    } else if (req.body.image !== undefined) {
      project.image = req.body.image;
    }

    await project.save();
    const populated = await Project.findById(project._id)
      .populate('owner', 'fullName usn department profilePicture headline')
      .populate('collaborators', 'fullName usn department profilePicture');

    res.status(200).json({
      success: true,
      message: 'Project updated successfully!',
      project: populated
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating project' });
  }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private
exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

    if (project.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this project' });
    }

    await Project.findByIdAndDelete(req.params.id);
    await CollaborationRequest.deleteMany({ project: req.params.id });

    res.status(200).json({
      success: true,
      message: 'Project deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting project' });
  }
};

// @desc    Star or unstar project
// @route   POST /api/projects/:id/star
// @access  Private
exports.toggleStar = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

    const userIdStr = req.user._id.toString();
    const hasStarred = project.stars.some(id => id.toString() === userIdStr);

    if (hasStarred) {
      project.stars = project.stars.filter(id => id.toString() !== userIdStr);
    } else {
      project.stars.push(req.user._id);
    }

    await project.save();

    res.status(200).json({
      success: true,
      isStarred: !hasStarred,
      starsCount: project.stars.length
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error toggling star' });
  }
};

// @desc    Request to collaborate on project
// @route   POST /api/projects/:id/collaborate
// @access  Private
exports.requestCollaboration = async (req, res) => {
  try {
    const { message, skills } = req.body;
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    if (project.owner.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'You are already the owner of this project' });
    }

    if (project.collaborators.some(id => id.toString() === req.user._id.toString())) {
      return res.status(400).json({ success: false, message: 'You are already a collaborator on this project' });
    }

    // Check existing request
    const existing = await CollaborationRequest.findOne({
      project: project._id,
      applicant: req.user._id
    });

    if (existing) {
      return res.status(400).json({ success: false, message: `You have already sent a request (${existing.status})` });
    }

    const skillsArray = Array.isArray(skills)
      ? skills
      : typeof skills === 'string'
        ? skills.split(',').map(s => s.trim()).filter(Boolean)
        : req.user.skills || [];

    const request = await CollaborationRequest.create({
      project: project._id,
      applicant: req.user._id,
      owner: project.owner,
      message: message || `Hi! I'd love to contribute to ${project.title}.`,
      skills: skillsArray
    });

    // Notify owner
    await Notification.create({
      recipient: project.owner,
      sender: req.user._id,
      type: 'project_collab_request',
      message: `${req.user.fullName} requested to collaborate on your project "${project.title}".`,
      link: `/projects/${project._id}`
    });

    res.status(201).json({
      success: true,
      message: 'Collaboration request sent successfully!',
      request
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Error requesting collaboration' });
  }
};

// @desc    Get collaboration requests for project (Owner only)
// @route   GET /api/projects/:id/collab-requests
// @access  Private
exports.getCollabRequests = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

    if (project.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const requests = await CollaborationRequest.find({ project: req.params.id })
      .populate('applicant', 'fullName usn department semester section profilePicture headline skills')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      requests
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error retrieving requests' });
  }
};

// @desc    Respond to collaboration request (accept / reject)
// @route   PUT /api/projects/collab-requests/:requestId
// @access  Private
exports.respondCollabRequest = async (req, res) => {
  try {
    const { action } = req.body; // 'accept' or 'reject'
    const request = await CollaborationRequest.findById(req.params.requestId);

    if (!request) return res.status(404).json({ success: false, message: 'Request not found' });

    if (request.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const project = await Project.findById(request.project);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

    if (action === 'accept') {
      request.status = 'accepted';
      await request.save();

      // Add to collaborators if not already present
      if (!project.collaborators.includes(request.applicant)) {
        project.collaborators.push(request.applicant);
        await project.save();
      }

      // Notify applicant
      await Notification.create({
        recipient: request.applicant,
        sender: req.user._id,
        type: 'project_collab_accepted',
        message: `Congratulations! Your collaboration request for "${project.title}" was accepted.`,
        link: `/projects/${project._id}`
      });

      return res.status(200).json({
        success: true,
        message: 'Collaboration request accepted!',
        request
      });
    } else if (action === 'reject') {
      request.status = 'rejected';
      await request.save();

      return res.status(200).json({
        success: true,
        message: 'Collaboration request rejected.',
        request
      });
    } else {
      return res.status(400).json({ success: false, message: "Action must be 'accept' or 'reject'" });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating collaboration request' });
  }
};
