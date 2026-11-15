import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import LoadingSpinner from '../components/LoadingSpinner';
import Modal from '../components/Modal';
import api from '../services/api';
import {
  HelpCircle, MessageSquare, ThumbsUp, CheckCircle2, Search, PlusCircle,
  Tag, Eye, Clock, User, Filter, Check, ArrowRight, Trash2
} from 'lucide-react';
import { ScrollProgress } from '@/components/core/scroll-progress';
import { Spotlight } from '@/components/core/spotlight';
import { Magnetic } from '@/components/core/magnetic';
import { AnimatedGroup } from '@/components/core/animated-group';
import '../styles/discussions.css';

const DiscussionsPage = () => {
  const { user } = useAuth();
  const { id: paramDiscussionId } = useParams();
  const [discussions, setDiscussions] = useState([]);
  const [selectedDiscussion, setSelectedDiscussion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [solvedFilter, setSolvedFilter] = useState('All'); // 'All', 'true', 'false'

  // Ask Question Modal
  const [isAskModalOpen, setIsAskModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState('Programming');
  const [newTags, setNewTags] = useState('');
  const [submittingQuestion, setSubmittingQuestion] = useState(false);

  // New Answer Input
  const [answerContent, setAnswerContent] = useState('');
  const [submittingAnswer, setSubmittingAnswer] = useState(false);

  const categories = [
    'All',
    'Programming',
    'Data Structures and Algorithms',
    'Web Development',
    'Artificial Intelligence',
    'Machine Learning',
    'Database Management',
    'Computer Networks',
    'Cybersecurity',
    'Projects',
    'Other Technical Topics'
  ];

  const fetchDiscussions = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedCategory !== 'All') params.append('category', selectedCategory);
      if (solvedFilter !== 'All') params.append('solved', solvedFilter);
      if (search) params.append('search', search);

      const res = await api.get(`/discussions?${params.toString()}`);
      if (res.data.success) {
        setDiscussions(res.data.discussions);
      }
    } catch (err) {
      console.error('Error fetching discussions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiscussions();
  }, [selectedCategory, solvedFilter, search]);

  // Open single discussion detail
  const handleOpenDiscussion = async (id) => {
    try {
      const res = await api.get(`/discussions/${id}`);
      if (res.data.success) {
        setSelectedDiscussion(res.data.discussion);
      }
    } catch (err) {
      alert('Error fetching discussion details');
    }
  };

  // Auto-open discussion from route parameter
  useEffect(() => {
    if (paramDiscussionId) {
      handleOpenDiscussion(paramDiscussionId);
    }
  }, [paramDiscussionId]);

  // Submit Question
  const handleAskQuestion = async (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    try {
      setSubmittingQuestion(true);
      const res = await api.post('/discussions', {
        title: newTitle.trim(),
        content: newContent.trim(),
        category: newCategory,
        tags: newTags
      });

      if (res.data.success) {
        setDiscussions([res.data.discussion, ...discussions]);
        setIsAskModalOpen(false);
        setNewTitle('');
        setNewContent('');
        setNewTags('');
        setNewCategory('Programming');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error posting question');
    } finally {
      setSubmittingQuestion(false);
    }
  };

  // Post Answer
  const handlePostAnswer = async (e) => {
    e.preventDefault();
    if (!answerContent.trim() || !selectedDiscussion) return;

    try {
      setSubmittingAnswer(true);
      const res = await api.post(`/discussions/${selectedDiscussion._id}/answers`, {
        content: answerContent.trim()
      });

      if (res.data.success) {
        setSelectedDiscussion(res.data.discussion);
        setAnswerContent('');
        // Update discussions list count
        setDiscussions((prev) =>
          prev.map((d) => (d._id === selectedDiscussion._id ? { ...d, answersCount: (d.answersCount || 0) + 1 } : d))
        );
      }
    } catch (err) {
      alert('Error posting answer');
    } finally {
      setSubmittingAnswer(false);
    }
  };

  // Upvote Answer
  const handleUpvoteAnswer = async (answerId) => {
    try {
      const res = await api.post(`/discussions/${selectedDiscussion._id}/answers/${answerId}/upvote`);
      if (res.data.success) {
        // Refresh discussion
        handleOpenDiscussion(selectedDiscussion._id);
      }
    } catch (err) {
      console.error('Error upvoting:', err);
    }
  };

  // Mark Accepted Answer (Author only)
  const handleMarkAccepted = async (answerId) => {
    try {
      const res = await api.put(`/discussions/${selectedDiscussion._id}/answers/${answerId}/accept`);
      if (res.data.success) {
        setSelectedDiscussion(res.data.discussion);
        setDiscussions((prev) =>
          prev.map((d) => (d._id === selectedDiscussion._id ? { ...d, isSolved: res.data.discussion.isSolved } : d))
        );
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error marking accepted answer');
    }
  };

  // Delete Discussion
  const handleDeleteDiscussion = async (discussionId) => {
    if (!window.confirm('Are you sure you want to delete this discussion topic?')) return;
    try {
      const res = await api.delete(`/discussions/${discussionId}`);
      if (res.data.success) {
        setDiscussions((prev) => prev.filter((d) => d._id !== discussionId));
        if (selectedDiscussion?._id === discussionId) {
          setSelectedDiscussion(null);
        }
      }
    } catch (err) {
      alert('Error deleting discussion');
    }
  };

  return (
    <div className="dashboard-layout">
      <ScrollProgress
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: 'linear-gradient(90deg, #2563eb, #38bdf8, #10b981)',
          zIndex: 9999,
          transformOrigin: '0%',
        }}
      />
      <Sidebar />

      <main className="dashboard-main discussions-page">
        {/* Header Banner */}
        <div className="card disc-header-card">
          <div className="disc-header-title">
            <h2>Technical Discussion Forum</h2>
            <p>
              Ask questions, exchange technical solutions, discuss coding challenges, and learn collaboratively from peers.
            </p>
          </div>
          <Magnetic intensity={0.25} range={55}>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => setIsAskModalOpen(true)}
            >
              <PlusCircle size={16} /> Ask a Question
            </button>
          </Magnetic>
        </div>

        {/* If viewing a selected discussion thread */}
        {selectedDiscussion ? (
          <div className="card thread-detail-card">
            <button className="back-to-list-btn" onClick={() => setSelectedDiscussion(null)}>
              ← Back to all discussions
            </button>

            <div className="thread-header">
              <span className="badge badge-primary">{selectedDiscussion.category}</span>
              {selectedDiscussion.isSolved && (
                <span className="badge badge-success">
                  <CheckCircle2 size={13} /> Solved
                </span>
              )}
              <h2 className="thread-title">{selectedDiscussion.title}</h2>

              <div className="thread-meta">
                <span className="thread-author-tag">
                  Asked by <strong>{selectedDiscussion.author?.fullName}</strong> ({selectedDiscussion.author?.department})
                </span>
                <span>•</span>
                <span>{new Date(selectedDiscussion.createdAt).toLocaleDateString()}</span>
                <span>•</span>
                <span><Eye size={13} /> {selectedDiscussion.views || 0} views</span>
              </div>
            </div>

            <div className="thread-content-body">
              <p>{selectedDiscussion.content}</p>

              {selectedDiscussion.tags && selectedDiscussion.tags.length > 0 && (
                <div className="thread-tags">
                  {selectedDiscussion.tags.map((t, idx) => (
                    <span key={idx} className="thread-tag-chip">
                      #{t}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Answers Section */}
            <div className="answers-section">
              <h3>{selectedDiscussion.answers?.length || 0} Answers</h3>

              <div className="answers-list">
                {selectedDiscussion.answers?.map((ans) => {
                  const isQuestionAuthor = user && user._id === selectedDiscussion.author?._id;
                  const hasUpvoted = user && ans.upvotes?.includes(user._id);

                  return (
                    <div
                      key={ans._id}
                      className={`answer-card ${ans.isAccepted ? 'accepted-answer' : ''}`}
                    >
                      {ans.isAccepted && (
                        <div className="accepted-banner">
                          <CheckCircle2 size={16} /> Accepted Answer by Question Author
                        </div>
                      )}

                      <div className="answer-body-row">
                        {/* Upvote Column */}
                        <div className="vote-col">
                          <button
                            className={`vote-btn ${hasUpvoted ? 'voted' : ''}`}
                            onClick={() => handleUpvoteAnswer(ans._id)}
                            title="Upvote this helpful answer"
                          >
                            <ThumbsUp size={16} />
                            <span>{ans.upvotes?.length || 0}</span>
                          </button>

                          {isQuestionAuthor && (
                            <button
                              className={`accept-mark-btn ${ans.isAccepted ? 'active' : ''}`}
                              onClick={() => handleMarkAccepted(ans._id)}
                              title={ans.isAccepted ? 'Remove accepted status' : 'Mark as accepted answer'}
                            >
                              <Check size={18} />
                            </button>
                          )}
                        </div>

                        {/* Answer Content */}
                        <div className="answer-content-col">
                          <p className="ans-text">{ans.content}</p>

                          <div className="ans-author-meta">
                            <span>Answered by <strong>{ans.author?.fullName}</strong></span>
                            <span>•</span>
                            <span>{new Date(ans.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Add Answer Form */}
              <div className="card add-answer-card">
                <h4>Your Answer</h4>
                <form onSubmit={handlePostAnswer}>
                  <textarea
                    className="form-control"
                    rows="4"
                    placeholder="Provide a detailed, helpful answer with explanation or code snippets..."
                    value={answerContent}
                    onChange={(e) => setAnswerContent(e.target.value)}
                    required
                  ></textarea>

                  <Magnetic intensity={0.2} range={40}>
                    <button
                      type="submit"
                      className="btn btn-primary btn-sm"
                      style={{ marginTop: '12px' }}
                      disabled={submittingAnswer || !answerContent.trim()}
                    >
                      {submittingAnswer ? 'Posting Answer...' : 'Post Your Answer'}
                    </button>
                  </Magnetic>
                </form>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Search and Category Filter Bar */}
            <div className="card disc-filter-card">
              <div className="search-input-wrapper">
                <Search size={18} className="search-icon" />
                <input
                  type="text"
                  placeholder="Search discussions by topic, question, or technology..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="search-input"
                />
              </div>

              <div className="filter-options-row">
                <div className="filter-select-group">
                  <label>Category:</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="filter-select"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="filter-select-group">
                  <label>Status:</label>
                  <select
                    value={solvedFilter}
                    onChange={(e) => setSolvedFilter(e.target.value)}
                    className="filter-select"
                  >
                    <option value="All">All Questions</option>
                    <option value="true">Solved</option>
                    <option value="false">Unsolved</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Discussions Stream */}
            {loading ? (
              <LoadingSpinner text="Loading discussions..." />
            ) : discussions.length === 0 ? (
              <div className="card empty-state">
                <HelpCircle className="empty-state-icon" />
                <h3>No Discussions Found</h3>
                <p>No questions matched your search criteria. Be the first to ask!</p>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => setIsAskModalOpen(true)}
                >
                  Ask a Question
                </button>
              </div>
            ) : (
              <AnimatedGroup className="discussions-stream" preset="blur-slide">
                {discussions.map((d) => (
                  <div
                    key={d._id}
                    className="card discussion-row-card card-hoverable"
                    style={{ position: 'relative', overflow: 'hidden' }}
                  >
                    <Spotlight
                      className="from-blue-500/10 via-indigo-500/5 to-transparent"
                      size={180}
                    />

                    <div className="disc-row-left">
                      <div className="disc-stat-box">
                        <span className="disc-stat-num">{d.answersCount || 0}</span>
                        <span className="disc-stat-lbl">answers</span>
                      </div>
                      <div className="disc-stat-box views">
                        <span className="disc-stat-num">{d.views || 0}</span>
                        <span className="disc-stat-lbl">views</span>
                      </div>
                    </div>

                    <div className="disc-row-center">
                      <div className="disc-badge-row">
                        <span className="badge badge-primary">{d.category}</span>
                        {d.isSolved && (
                          <span className="badge badge-success">
                            <CheckCircle2 size={12} /> Solved
                          </span>
                        )}
                      </div>

                      <h3
                        className="disc-row-title"
                        onClick={() => handleOpenDiscussion(d._id)}
                      >
                        {d.title}
                      </h3>

                      <p className="disc-row-snippet">{d.content}</p>

                      <div className="disc-row-footer">
                        <div className="disc-tags-mini">
                          {d.tags?.slice(0, 3).map((t, idx) => (
                            <span key={idx} className="tag-mini">#{t}</span>
                          ))}
                        </div>

                        <div className="disc-author-stamp">
                          <span>Asked by <strong>{d.author?.fullName}</strong></span>
                          <span>•</span>
                          <span>{new Date(d.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    {(user?._id === d.author?._id || user?.role === 'admin') && (
                      <button
                        className="disc-del-btn"
                        onClick={() => handleDeleteDiscussion(d._id)}
                        title="Delete discussion"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                ))}
              </AnimatedGroup>
            )}
          </>
        )}

        {/* ASK QUESTION MODAL */}
        <Modal
          isOpen={isAskModalOpen}
          onClose={() => setIsAskModalOpen(false)}
          title="Ask a Technical Question"
          maxWidth="680px"
        >
          <form onSubmit={handleAskQuestion} className="auth-form">
            <div className="form-group">
              <label className="form-label">Category *</label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="form-control"
                required
              >
                {categories.filter((c) => c !== 'All').map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Question Title *</label>
              <input
                type="text"
                className="form-control"
                placeholder="Be specific (e.g. How to implement JWT refresh tokens in Node Express?)"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Detailed Question Details *</label>
              <textarea
                className="form-control"
                rows="6"
                placeholder="Describe your technical problem, academic concept, what you have tried, and what help you need..."
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                required
              ></textarea>
            </div>

            <div className="form-group">
              <label className="form-label">Tags (comma-separated)</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. React, MongoDB, DSA, LeetCode"
                value={newTags}
                onChange={(e) => setNewTags(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-block btn-lg"
              disabled={submittingQuestion || !newTitle.trim() || !newContent.trim()}
              style={{ marginTop: '16px' }}
            >
              {submittingQuestion ? 'Publishing Question...' : 'Post Question to Community'}
            </button>
          </form>
        </Modal>
      </main>
    </div>
  );
};

export default DiscussionsPage;
