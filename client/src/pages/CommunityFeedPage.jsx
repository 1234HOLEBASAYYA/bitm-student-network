import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import LoadingSpinner from '../components/LoadingSpinner';
import Modal from '../components/Modal';
import api from '../services/api';
import {
  Flame, Heart, MessageSquare, Share2, Image, Send, MoreVertical,
  Trash2, Edit3, Check, Filter, Sparkles, User, Tag
} from 'lucide-react';
import { ScrollProgress } from '@/components/core/scroll-progress';
import { Spotlight } from '@/components/core/spotlight';
import { Magnetic } from '@/components/core/magnetic';
import { AnimatedGroup } from '@/components/core/animated-group';
import '../styles/feed.css';

const CommunityFeedPage = () => {
  const { user } = useAuth();
  const { id: targetPostId } = useParams();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterMode, setFilterMode] = useState('all'); // 'all' or 'connected'
  const [categoryFilter, setCategoryFilter] = useState('All');

  // Create Post Form
  const [postContent, setPostContent] = useState('');
  const [postCategory, setPostCategory] = useState('General');
  const [postImageUrl, setPostImageUrl] = useState('');
  const [showImageInput, setShowImageInput] = useState(false);
  const [submittingPost, setSubmittingPost] = useState(false);

  // Active Comment Input per post
  const [activeCommentPostId, setActiveCommentPostId] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [commentsMap, setCommentsMap] = useState({}); // postId -> comments[]
  const [loadingComments, setLoadingComments] = useState({});

  // Edit Post Modal
  const [editingPost, setEditingPost] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [editCategory, setEditCategory] = useState('');

  const categories = [
    'All',
    'General',
    'Technical Knowledge',
    'Project Update',
    'Achievement',
    'Campus News',
    'Career'
  ];

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterMode === 'connected') params.append('filter', 'connected');
      if (categoryFilter !== 'All') params.append('category', categoryFilter);

      const res = await api.get(`/posts?${params.toString()}`);
      if (res.data.success) {
        let loadedPosts = res.data.posts;
        // If route specifies a target post ID and it's not present in the current filter list, fetch it directly
        if (targetPostId && !loadedPosts.some((p) => p._id === targetPostId)) {
          try {
            const singleRes = await api.get(`/posts/${targetPostId}`);
            if (singleRes.data.success && singleRes.data.post) {
              loadedPosts = [singleRes.data.post, ...loadedPosts];
            }
          } catch (err) {
            console.error('Target post not found:', err);
          }
        }
        setPosts(loadedPosts);
      }
    } catch (err) {
      console.error('Error fetching feed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [filterMode, categoryFilter, targetPostId]);

  // Auto-scroll to target post when loaded
  useEffect(() => {
    if (targetPostId && posts.length > 0) {
      const timer = setTimeout(() => {
        const el = document.getElementById(`post-${targetPostId}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [targetPostId, posts]);

  // Create New Post
  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!postContent.trim()) return;

    try {
      setSubmittingPost(true);
      const res = await api.post('/posts', {
        content: postContent.trim(),
        category: postCategory,
        image: postImageUrl.trim()
      });

      if (res.data.success) {
        setPosts([res.data.post, ...posts]);
        setPostContent('');
        setPostImageUrl('');
        setShowImageInput(false);
        setPostCategory('General');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating post');
    } finally {
      setSubmittingPost(false);
    }
  };

  // Like or Unlike Post
  const handleToggleLike = async (postId) => {
    try {
      const res = await api.post(`/posts/${postId}/like`);
      if (res.data.success) {
        setPosts((prev) =>
          prev.map((p) => {
            if (p._id === postId) {
              return {
                ...p,
                isLiked: res.data.isLiked,
                likesCount: res.data.likesCount
              };
            }
            return p;
          })
        );
      }
    } catch (err) {
      console.error('Error reacting to post:', err);
    }
  };

  // Fetch comments for a specific post
  const toggleComments = async (postId) => {
    if (activeCommentPostId === postId) {
      setActiveCommentPostId(null);
      return;
    }

    setActiveCommentPostId(postId);
    if (!commentsMap[postId]) {
      try {
        setLoadingComments((prev) => ({ ...prev, [postId]: true }));
        const res = await api.get(`/posts/${postId}`);
        if (res.data.success) {
          setCommentsMap((prev) => ({ ...prev, [postId]: res.data.post.comments }));
        }
      } catch (err) {
        console.error('Error fetching comments:', err);
      } finally {
        setLoadingComments((prev) => ({ ...prev, [postId]: false }));
      }
    }
  };

  // Add Comment to Post
  const handleAddComment = async (postId) => {
    if (!commentText.trim()) return;

    try {
      const res = await api.post(`/posts/${postId}/comments`, { content: commentText.trim() });
      if (res.data.success) {
        setCommentsMap((prev) => ({
          ...prev,
          [postId]: [...(prev[postId] || []), res.data.comment]
        }));
        setPosts((prev) =>
          prev.map((p) => (p._id === postId ? { ...p, commentsCount: res.data.commentsCount } : p))
        );
        setCommentText('');
      }
    } catch (err) {
      alert('Error adding comment');
    }
  };

  // Delete Post
  const handleDeletePost = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try {
      const res = await api.delete(`/posts/${postId}`);
      if (res.data.success) {
        setPosts((prev) => prev.filter((p) => p._id !== postId));
      }
    } catch (err) {
      alert('Error deleting post');
    }
  };

  // Delete Comment
  const handleDeleteComment = async (postId, commentId) => {
    try {
      const res = await api.delete(`/posts/comments/${commentId}`);
      if (res.data.success) {
        setCommentsMap((prev) => ({
          ...prev,
          [postId]: prev[postId].filter((c) => c._id !== commentId)
        }));
        setPosts((prev) =>
          prev.map((p) => (p._id === postId ? { ...p, commentsCount: res.data.commentsCount } : p))
        );
      }
    } catch (err) {
      alert('Error deleting comment');
    }
  };

  // Edit Post
  const openEditModal = (post) => {
    setEditingPost(post);
    setEditContent(post.content);
    setEditCategory(post.category);
  };

  const handleSaveEditPost = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put(`/posts/${editingPost._id}`, {
        content: editContent,
        category: editCategory
      });
      if (res.data.success) {
        setPosts((prev) =>
          prev.map((p) => (p._id === editingPost._id ? { ...p, ...res.data.post } : p))
        );
        setEditingPost(null);
      }
    } catch (err) {
      alert('Error updating post');
    }
  };

  const handleShare = (post) => {
    navigator.clipboard?.writeText(window.location.origin + `/posts/${post._id}`);
    alert('Post link copied to clipboard!');
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="dashboard-main feed-page relative">
        <ScrollProgress className="feed-scroll-progress-line" />

        {/* Create Post Card */}
        <div className="card create-post-card">
          <div className="create-post-header">
            {user?.profilePicture ? (
              <img src={user.profilePicture} alt={user.fullName} className="create-post-avatar" />
            ) : (
              <div className="create-post-avatar-fallback">{user?.fullName?.charAt(0) || 'U'}</div>
            )}
            <div className="create-post-info">
              <span className="create-post-name">{user?.fullName}</span>
              <span className="create-post-dept">{user?.department}</span>
            </div>
            <select
              value={postCategory}
              onChange={(e) => setPostCategory(e.target.value)}
              className="post-category-select"
            >
              {categories.filter((c) => c !== 'All').map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <form onSubmit={handleCreatePost}>
            <textarea
              className="create-post-input"
              rows="3"
              placeholder={`What's on your mind, ${user?.fullName?.split(' ')[0]}? Share project updates, tech tips, or campus news...`}
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              required
            ></textarea>

            {showImageInput && (
              <div className="post-image-url-box">
                <input
                  type="url"
                  placeholder="Paste image URL (e.g. Unsplash, imgur, or hosted photo)..."
                  value={postImageUrl}
                  onChange={(e) => setPostImageUrl(e.target.value)}
                  className="form-control"
                />
              </div>
            )}

            <div className="create-post-actions">
              <button
                type="button"
                className={`attach-media-btn ${showImageInput ? 'active' : ''}`}
                onClick={() => setShowImageInput(!showImageInput)}
              >
                <Image size={18} /> Add Image
              </button>

              <Magnetic intensity={0.3} range={60}>
                <button
                  type="submit"
                  className="btn btn-primary btn-sm magnetic-cta"
                  disabled={submittingPost || !postContent.trim()}
                >
                  <Send size={15} /> {submittingPost ? 'Posting...' : 'Publish Post'}
                </button>
              </Magnetic>
            </div>
          </form>
        </div>

        {/* Feed Filtering Controls */}
        <div className="feed-filter-bar">
          <div className="filter-modes">
            <button
              className={`filter-mode-btn ${filterMode === 'all' ? 'active' : ''}`}
              onClick={() => setFilterMode('all')}
            >
              All Campus Posts
            </button>
            <button
              className={`filter-mode-btn ${filterMode === 'connected' ? 'active' : ''}`}
              onClick={() => setFilterMode('connected')}
            >
              Connected Students Only
            </button>
          </div>

          <div className="category-chips-scroll">
            {categories.map((cat) => (
              <button
                key={cat}
                className={`cat-chip-btn ${categoryFilter === cat ? 'active' : ''}`}
                onClick={() => setCategoryFilter(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Feed Posts List */}
        {loading ? (
          <LoadingSpinner text="Loading campus feed..." />
        ) : posts.length === 0 ? (
          <div className="card empty-state">
            <Flame className="empty-state-icon" />
            <h3>No Posts Found</h3>
            <p>
              {filterMode === 'connected'
                ? 'None of your connected peers have posted yet. Connect with more students or switch to All Campus Posts.'
                : 'No posts in this category yet. Be the first to share an update!'}
            </p>
          </div>
        ) : (
          <AnimatedGroup preset="blur-slide" className="feed-posts-stream">
            {posts.map((post) => {
              const isAuthor = user && (user._id === post.author?._id || user.role === 'admin');
              const comments = commentsMap[post._id] || [];
              const isCommentsOpen = activeCommentPostId === post._id;

              return (
                <motion.div
                  key={post._id}
                  id={`post-${post._id}`}
                  className={`card feed-post-card relative overflow-hidden ${targetPostId === post._id ? 'highlighted-post' : ''}`}
                  style={{ position: 'relative', overflow: 'hidden' }}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Spotlight size={180} />
                  {/* Post Header */}
                  <div className="feed-post-header">
                    <div className="post-author-box">
                      {post.author?.profilePicture ? (
                        <img
                          src={post.author.profilePicture}
                          alt={post.author.fullName}
                          className="post-avatar"
                        />
                      ) : (
                        <div className="post-avatar-fallback">
                          {post.author?.fullName?.charAt(0) || 'S'}
                        </div>
                      )}
                      <div>
                        <Link to={`/profile/${post.author?._id}`} className="post-author-name">
                          {post.author?.fullName}
                        </Link>
                        <span className="post-author-dept">
                          {post.author?.department} • {post.author?.usn}
                        </span>
                        <span className="post-timestamp">
                          {new Date(post.createdAt).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    </div>

                    <div className="post-header-right">
                      <span className="badge badge-primary">{post.category}</span>
                      {isAuthor && (
                        <div className="post-owner-actions">
                          <button
                            className="post-action-icon-btn"
                            onClick={() => openEditModal(post)}
                            title="Edit Post"
                          >
                            <Edit3 size={15} />
                          </button>
                          <button
                            className="post-action-icon-btn delete"
                            onClick={() => handleDeletePost(post._id)}
                            title="Delete Post"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Post Content */}
                  <div className="feed-post-body">
                    <p className="post-text">{post.content}</p>
                    {post.image && (
                      <div className="post-image-container">
                        <img src={post.image} alt="Post media" className="post-attached-image" />
                      </div>
                    )}
                  </div>

                  {/* Reaction Summary & Counts */}
                  <div className="feed-post-stats">
                    <span>
                      <Heart size={13} className="stat-heart-icon" /> {post.likesCount || 0} Likes
                    </span>
                    <span onClick={() => toggleComments(post._id)} style={{ cursor: 'pointer' }}>
                      {post.commentsCount || 0} Comments
                    </span>
                  </div>

                  {/* Post Action Buttons */}
                  <div className="feed-post-actions-bar">
                    <motion.button
                      className={`feed-act-btn ${post.isLiked ? 'liked' : ''}`}
                      onClick={() => handleToggleLike(post._id)}
                      whileTap={{ scale: 0.92 }}
                    >
                      <motion.span
                        animate={post.isLiked ? { scale: [1, 1.45, 1] } : { scale: 1 }}
                        transition={{ duration: 0.25 }}
                        style={{ display: 'inline-flex' }}
                      >
                        <Heart size={18} fill={post.isLiked ? '#ef4444' : 'none'} />
                      </motion.span>
                      <span>Like</span>
                    </motion.button>

                    <button
                      className="feed-act-btn"
                      onClick={() => toggleComments(post._id)}
                    >
                      <MessageSquare size={18} />
                      <span>Comment</span>
                    </button>

                    <button className="feed-act-btn" onClick={() => handleShare(post)}>
                      <Share2 size={18} />
                      <span>Share</span>
                    </button>
                  </div>

                  {/* Comments Section */}
                  {isCommentsOpen && (
                    <div className="comments-tray">
                      {/* Add Comment Input */}
                      <div className="add-comment-row">
                        <input
                          type="text"
                          placeholder="Write a constructive comment..."
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          className="form-control comment-input"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleAddComment(post._id);
                          }}
                        />
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => handleAddComment(post._id)}
                          disabled={!commentText.trim()}
                        >
                          <Send size={14} />
                        </button>
                      </div>

                      {/* Comments List */}
                      {loadingComments[post._id] ? (
                        <p style={{ fontSize: '0.82rem', color: '#94a3b8', padding: '12px' }}>Loading comments...</p>
                      ) : comments.length === 0 ? (
                        <p style={{ fontSize: '0.82rem', color: '#94a3b8', padding: '12px 0' }}>No comments yet. Start the conversation!</p>
                      ) : (
                        <div className="comments-stream">
                          {comments.map((c) => (
                            <div key={c._id} className="comment-item">
                              <div className="comment-author-avatar">
                                {c.author?.profilePicture ? (
                                  <img src={c.author.profilePicture} alt={c.author.fullName} />
                                ) : (
                                  <div className="comm-fallback">{c.author?.fullName?.charAt(0) || 'S'}</div>
                                )}
                              </div>
                              <div className="comment-bubble">
                                <div className="comment-bubble-top">
                                  <Link to={`/profile/${c.author?._id}`} className="comm-author-name">
                                    {c.author?.fullName}
                                  </Link>
                                  <span className="comm-time">
                                    {new Date(c.createdAt).toLocaleDateString()}
                                  </span>
                                  {(user?._id === c.author?._id || user?._id === post.author?._id || user?.role === 'admin') && (
                                    <button
                                      className="comm-del-btn"
                                      onClick={() => handleDeleteComment(post._id, c._id)}
                                      title="Delete comment"
                                    >
                                      <Trash2 size={12} />
                                    </button>
                                  )}
                                </div>
                                <p className="comm-content">{c.content}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatedGroup>
        )}

        {/* Edit Post Modal */}
        {editingPost && (
          <Modal
            isOpen={!!editingPost}
            onClose={() => setEditingPost(null)}
            title="Edit Your Post"
          >
            <form onSubmit={handleSaveEditPost} className="auth-form">
              <div className="form-group">
                <label className="form-label">Category</label>
                <select
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  className="form-control"
                >
                  {categories.filter((c) => c !== 'All').map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Content</label>
                <textarea
                  className="form-control"
                  rows="4"
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  required
                ></textarea>
              </div>

              <button type="submit" className="btn btn-primary btn-block btn-lg" style={{ marginTop: '16px' }}>
                Save Changes
              </button>
            </form>
          </Modal>
        )}
      </main>
    </div>
  );
};

export default CommunityFeedPage;
