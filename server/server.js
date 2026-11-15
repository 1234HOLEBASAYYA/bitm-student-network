const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middlewares
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/posts', require('./routes/postRoutes'));
app.use('/api/connections', require('./routes/connectionRoutes'));
app.use('/api/discussions', require('./routes/discussionRoutes'));
app.use('/api/projects', require('./routes/projectRoutes'));
app.use('/api/opportunities', require('./routes/opportunityRoutes'));
app.use('/api/events', require('./routes/eventRoutes'));
app.use('/api/messages', require('./routes/messageRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    message: 'BITM Student Network API is up and running!',
    timestamp: new Date().toISOString()
  });
});

// 404 Handler for API
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API route ${req.originalUrl} not found.`
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Global Error]:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(`BITM Student Network Backend Running`);
  console.log(`Server listening on port ${PORT}`);
  console.log(`API URL: http://localhost:${PORT}/api`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`=========================================`);
});
