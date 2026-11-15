const Post = require('../models/Post');
const Comment = require('../models/Comment');
const Notification = require('../models/Notification');
const Connection = require('../models/Connection');

// @desc    Get all posts (Community Feed)
// @route   GET /api/posts
// @access  Public / Private
exports.getPosts = async (req, res) => {
  try {
    const { category, filter, page = 1, limit = 15 } = req.query;
    let query = {};

    if (category && category !== 'All') {
      query.category = category;
    }

    // Connected only filter
    if (filter === 'connected' && req.user) {
      const connections = await Connection.find({
        $or: [{ user1: req.user._id }, { user2: req.user._id }]
      });
      const friendIds = connections.map(c =>
        c.user1.toString() === req.user._id.toString() ? c.user2 : c.user1
      );
      // Include user's own posts plus connected users
      friendIds.push(req.user._id);
      query.author = { $in: friendIds };
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Post.countDocuments(query);

    const posts = await Post.find(query)
      .populate('author', 'fullName usn department profilePicture headline')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    // Map whether currently logged in user has liked each post
    const formatted = posts.map(post => {
      const pObj = post.toObject();
      pObj.likesCount = post.likes ? post.likes.length : 0;
      pObj.isLiked = req.user && post.likes ? post.likes.some(id => id.toString() === req.user._id.toString()) : false;
      return pObj;
    });

    res.status(200).json({
      success: true,
      count: formatted.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      posts: formatted
    });
  } catch (error) {
    console.error('getPosts error:', error);
    res.status(500).json({ success: false, message: 'Error retrieving posts.' });
  }
};

// @desc    Get single post by ID
// @route   GET /api/posts/:id
// @access  Public / Private
exports.getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'fullName usn department profilePicture headline');

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found.' });
    }

    const comments = await Comment.find({ post: post._id })
      .populate('author', 'fullName usn department profilePicture')
      .sort({ createdAt: 1 });

    const pObj = post.toObject();
    pObj.likesCount = post.likes ? post.likes.length : 0;
    pObj.isLiked = req.user && post.likes ? post.likes.some(id => id.toString() === req.user._id.toString()) : false;
    pObj.comments = comments;

    res.status(200).json({
      success: true,
      post: pObj
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error retrieving post.' });
  }
};

// @desc    Create new post
// @route   POST /api/posts
// @access  Private
exports.createPost = async (req, res) => {
  try {
    const { content, category } = req.body;
    let imageUrl = req.body.image || '';

    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    }

    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: 'Post content cannot be empty.' });
    }

    const post = await Post.create({
      author: req.user._id,
      content: content.trim(),
      image: imageUrl,
      category: category || 'General'
    });

    const populated = await Post.findById(post._id)
      .populate('author', 'fullName usn department profilePicture headline');

    const pObj = populated.toObject();
    pObj.likesCount = 0;
    pObj.isLiked = false;

    res.status(201).json({
      success: true,
      message: 'Post created successfully!',
      post: pObj
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error creating post.' });
  }
};

// @desc    Update post
// @route   PUT /api/posts/:id
// @access  Private
exports.updatePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to edit this post' });
    }

    if (req.body.content) post.content = req.body.content.trim();
    if (req.body.category) post.category = req.body.category;
    if (req.body.image !== undefined) post.image = req.body.image;
    if (req.file) post.image = `/uploads/${req.file.filename}`;

    await post.save();
    const populated = await Post.findById(post._id)
      .populate('author', 'fullName usn department profilePicture headline');

    res.status(200).json({
      success: true,
      message: 'Post updated successfully',
      post: populated
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating post' });
  }
};

// @desc    Delete post
// @route   DELETE /api/posts/:id
// @access  Private
exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this post' });
    }

    await Post.findByIdAndDelete(req.params.id);
    await Comment.deleteMany({ post: req.params.id });

    res.status(200).json({
      success: true,
      message: 'Post and comments deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting post' });
  }
};

// @desc    Like or Unlike post
// @route   POST /api/posts/:id/like
// @access  Private
exports.likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    const userIdStr = req.user._id.toString();
    const hasLiked = post.likes.some(id => id.toString() === userIdStr);

    if (hasLiked) {
      post.likes = post.likes.filter(id => id.toString() !== userIdStr);
    } else {
      post.likes.push(req.user._id);

      // Create notification for post author if not liking own post
      if (post.author.toString() !== userIdStr) {
        await Notification.create({
          recipient: post.author,
          sender: req.user._id,
          type: 'post_like',
          message: `${req.user.fullName} liked your post.`,
          link: `/posts/${post._id}`
        });
      }
    }

    await post.save();

    res.status(200).json({
      success: true,
      isLiked: !hasLiked,
      likesCount: post.likes.length
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error reacting to post' });
  }
};

// @desc    Add comment to post
// @route   POST /api/posts/:id/comments
// @access  Private
exports.addComment = async (req, res) => {
  try {
    const { content } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: 'Comment content cannot be empty' });
    }

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    const comment = await Comment.create({
      post: post._id,
      author: req.user._id,
      content: content.trim()
    });

    post.commentsCount = (post.commentsCount || 0) + 1;
    await post.save();

    const populatedComment = await Comment.findById(comment._id)
      .populate('author', 'fullName usn department profilePicture');

    // Notify author if not commenting on own post
    if (post.author.toString() !== req.user._id.toString()) {
      await Notification.create({
        recipient: post.author,
        sender: req.user._id,
        type: 'post_comment',
        message: `${req.user.fullName} commented on your post: "${content.substring(0, 40)}..."`,
        link: `/posts/${post._id}`
      });
    }

    res.status(201).json({
      success: true,
      message: 'Comment added',
      comment: populatedComment,
      commentsCount: post.commentsCount
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error adding comment' });
  }
};

// @desc    Delete comment
// @route   DELETE /api/posts/comments/:commentId
// @access  Private
exports.deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) return res.status(404).json({ success: false, message: 'Comment not found' });

    const post = await Post.findById(comment.post);

    const isCommentAuthor = comment.author.toString() === req.user._id.toString();
    const isPostAuthor = post && post.author.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isCommentAuthor && !isPostAuthor && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this comment' });
    }

    await Comment.findByIdAndDelete(req.params.commentId);

    if (post && post.commentsCount > 0) {
      post.commentsCount -= 1;
      await post.save();
    }

    res.status(200).json({
      success: true,
      message: 'Comment deleted',
      commentsCount: post ? post.commentsCount : 0
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting comment' });
  }
};
