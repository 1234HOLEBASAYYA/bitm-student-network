const Opportunity = require('../models/Opportunity');

// @desc    Get all opportunities
// @route   GET /api/opportunities
// @access  Public / Private
exports.getOpportunities = async (req, res) => {
  try {
    const { category, search, page = 1, limit = 12 } = req.query;
    let query = { status: 'approved' };

    // If admin requested all (including pending)
    if (req.query.status && req.user && req.user.role === 'admin') {
      if (req.query.status === 'all') {
        delete query.status;
      } else {
        query.status = req.query.status;
      }
    }

    if (category && category !== 'All') {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { organization: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Opportunity.countDocuments(query);

    const opportunities = await Opportunity.find(query)
      .populate('postedBy', 'fullName usn department profilePicture role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      count: opportunities.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      opportunities
    });
  } catch (error) {
    console.error('getOpportunities error:', error);
    res.status(500).json({ success: false, message: 'Error retrieving opportunities' });
  }
};

// @desc    Get opportunity by ID
// @route   GET /api/opportunities/:id
// @access  Public / Private
exports.getOpportunityById = async (req, res) => {
  try {
    const opp = await Opportunity.findById(req.params.id)
      .populate('postedBy', 'fullName usn department profilePicture role');

    if (!opp) return res.status(404).json({ success: false, message: 'Opportunity not found' });

    opp.views += 1;
    await opp.save();

    res.status(200).json({
      success: true,
      opportunity: opp
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error retrieving opportunity' });
  }
};

// @desc    Create opportunity
// @route   POST /api/opportunities
// @access  Private
exports.createOpportunity = async (req, res) => {
  try {
    const {
      title,
      organization,
      category,
      description,
      eligibility,
      location,
      stipendOrPrize,
      applyLink,
      deadline
    } = req.body;

    if (!title || !organization || !category || !applyLink || !deadline) {
      return res.status(400).json({
        success: false,
        message: 'Please provide Title, Organization, Category, Apply Link, and Deadline'
      });
    }

    const isAdmin = req.user.role === 'admin';

    const opp = await Opportunity.create({
      title: title.trim(),
      organization: organization.trim(),
      category,
      description: description || 'No detailed description provided.',
      eligibility: eligibility || 'Open to all BITM students',
      location: location || 'Remote / Hybrid',
      stipendOrPrize: stipendOrPrize || '',
      applyLink: applyLink.trim(),
      deadline: new Date(deadline),
      postedBy: req.user._id,
      isOfficial: isAdmin,
      status: 'approved'
    });

    const populated = await Opportunity.findById(opp._id)
      .populate('postedBy', 'fullName usn department profilePicture role');

    res.status(201).json({
      success: true,
      message: 'Opportunity posted successfully!',
      opportunity: populated
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Error creating opportunity' });
  }
};

// @desc    Update opportunity
// @route   PUT /api/opportunities/:id
// @access  Private
exports.updateOpportunity = async (req, res) => {
  try {
    const opp = await Opportunity.findById(req.params.id);
    if (!opp) return res.status(404).json({ success: false, message: 'Opportunity not found' });

    if (opp.postedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    Object.assign(opp, req.body);
    await opp.save();

    res.status(200).json({
      success: true,
      message: 'Opportunity updated successfully',
      opportunity: opp
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating opportunity' });
  }
};

// @desc    Delete opportunity
// @route   DELETE /api/opportunities/:id
// @access  Private
exports.deleteOpportunity = async (req, res) => {
  try {
    const opp = await Opportunity.findById(req.params.id);
    if (!opp) return res.status(404).json({ success: false, message: 'Opportunity not found' });

    if (opp.postedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    await Opportunity.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Opportunity deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting opportunity' });
  }
};
