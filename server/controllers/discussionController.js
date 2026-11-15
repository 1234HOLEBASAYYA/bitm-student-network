const Discussion = require('../models/Discussion');
const Notification = require('../models/Notification');

// @desc    Get all discussions with filter & search
// @route   GET /api/discussions
// @access  Public / Private
exports.getDiscussions = async (req, res) => {
  try {
    const { category, search, solved, page = 1, limit = 15 } = req.query;
    let query = {};

    if (category && category !== 'All') {
      query.category = category;
    }

    if (solved !== undefined && solved !== 'All') {
      query.isSolved = solved === 'true';
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Discussion.countDocuments(query);

    const discussions = await Discussion.find(query)
      .populate('author', 'fullName usn department profilePicture')
      .populate('answers.author', 'fullName usn department profilePicture')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const formatted = discussions.map(d => {
      const dObj = d.toObject();
      dObj.answersCount = d.answers ? d.answers.length : 0;
      return dObj;
    });

    res.status(200).json({
      success: true,
      count: formatted.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      discussions: formatted
    });
  } catch (error) {
    console.error('getDiscussions error:', error);
    res.status(500).json({ success: false, message: 'Error retrieving discussions.' });
  }
};

// @desc    Get single discussion
// @route   GET /api/discussions/:id
// @access  Public / Private
exports.getDiscussionById = async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id)
      .populate('author', 'fullName usn department profilePicture headline')
      .populate('answers.author', 'fullName usn department profilePicture headline');

    if (!discussion) {
      return res.status(404).json({ success: false, message: 'Discussion not found.' });
    }

    // Increment views
    discussion.views += 1;
    await discussion.save();

    res.status(200).json({
      success: true,
      discussion
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching discussion.' });
  }
};

// @desc    Create discussion
// @route   POST /api/discussions
// @access  Private
exports.createDiscussion = async (req, res) => {
  try {
    const { title, content, category, tags } = req.body;

    if (!title || !content || !category) {
      return res.status(400).json({
        success: false,
        message: 'Please provide Title, Category, and Content.'
      });
    }

    const tagArray = Array.isArray(tags)
      ? tags
      : typeof tags === 'string'
        ? tags.split(',').map(t => t.trim()).filter(Boolean)
        : [];

    const discussion = await Discussion.create({
      title: title.trim(),
      content: content.trim(),
      category,
      tags: tagArray,
      author: req.user._id
    });

    const populated = await Discussion.findById(discussion._id)
      .populate('author', 'fullName usn department profilePicture');

    res.status(201).json({
      success: true,
      message: 'Discussion posted successfully!',
      discussion: populated
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Error creating discussion.' });
  }
};

// @desc    Add answer to discussion
// @route   POST /api/discussions/:id/answers
// @access  Private
exports.addAnswer = async (req, res) => {
  try {
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: 'Answer content cannot be empty.' });
    }

    const discussion = await Discussion.findById(req.params.id);
    if (!discussion) {
      return res.status(404).json({ success: false, message: 'Discussion not found.' });
    }

    discussion.answers.push({
      author: req.user._id,
      content: content.trim(),
      upvotes: []
    });

    await discussion.save();

    const updated = await Discussion.findById(req.params.id)
      .populate('author', 'fullName usn department profilePicture')
      .populate('answers.author', 'fullName usn department profilePicture');

    // Notify question author
    if (discussion.author.toString() !== req.user._id.toString()) {
      await Notification.create({
        recipient: discussion.author,
        sender: req.user._id,
        type: 'post_comment',
        message: `${req.user.fullName} answered your discussion: "${discussion.title.substring(0, 30)}..."`,
        link: `/discussions/${discussion._id}`
      });
    }

    res.status(201).json({
      success: true,
      message: 'Answer added successfully!',
      discussion: updated
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error adding answer.' });
  }
};

// @desc    Mark answer as accepted
// @route   PUT /api/discussions/:id/answers/:answerId/accept
// @access  Private
exports.markAcceptedAnswer = async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id);
    if (!discussion) return res.status(404).json({ success: false, message: 'Discussion not found' });

    if (discussion.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only question author can accept an answer' });
    }

    let targetAnswer = null;
    let found = false;

    discussion.answers.forEach(a => {
      if (a._id.toString() === req.params.answerId) {
        a.isAccepted = !a.isAccepted; // Toggle accepted state
        found = true;
        targetAnswer = a;
      } else {
        a.isAccepted = false; // Only one accepted answer
      }
    });

    if (!found) {
      return res.status(404).json({ success: false, message: 'Answer not found' });
    }

    discussion.isSolved = targetAnswer.isAccepted;
    await discussion.save();

    const updated = await Discussion.findById(req.params.id)
      .populate('author', 'fullName usn department profilePicture')
      .populate('answers.author', 'fullName usn department profilePicture');

    res.status(200).json({
      success: true,
      message: targetAnswer.isAccepted ? 'Answer accepted as solution!' : 'Accepted status removed.',
      discussion: updated
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating answer status.' });
  }
};

// @desc    Upvote / remove upvote on an answer
// @route   POST /api/discussions/:id/answers/:answerId/upvote
// @access  Private
exports.upvoteAnswer = async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id);
    if (!discussion) return res.status(404).json({ success: false, message: 'Discussion not found' });

    const answer = discussion.answers.id(req.params.answerId);
    if (!answer) return res.status(404).json({ success: false, message: 'Answer not found' });

    const userIdStr = req.user._id.toString();
    const hasUpvoted = answer.upvotes.some(id => id.toString() === userIdStr);

    if (hasUpvoted) {
      answer.upvotes = answer.upvotes.filter(id => id.toString() !== userIdStr);
    } else {
      answer.upvotes.push(req.user._id);
    }

    await discussion.save();

    res.status(200).json({
      success: true,
      upvoted: !hasUpvoted,
      upvotesCount: answer.upvotes.length
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error upvoting answer.' });
  }
};

// @desc    Delete discussion
// @route   DELETE /api/discussions/:id
// @access  Private
exports.deleteDiscussion = async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id);
    if (!discussion) return res.status(404).json({ success: false, message: 'Discussion not found' });

    if (discussion.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this discussion' });
    }

    await Discussion.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Discussion deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting discussion' });
  }
};
