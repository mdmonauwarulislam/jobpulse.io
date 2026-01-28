const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser'); // NEW: Import cookie-parser for JWTs in cookies
require('dotenv').config();

const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/authRoutes');
const jobRoutes = require('./routes/jobRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const employerRoutes = require('./routes/employerRoutes');
const skillRoutes = require('./routes/skillRoutes');
const chatRoutes = require('./routes/chatRoutes');           // Chat/messaging routes
const notificationRoutes = require('./routes/notificationRoutes'); // Notification routes
const resumeRoutes = require('./routes/resumeRoutes'); // Resume routes

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Security middleware
app.use(helmet()); // Sets various HTTP headers for security
app.use(compression()); // Compresses response bodies for faster loading

// CORS configuration - Ensure your frontend URL is correctly set in .env
app.use(cors({
  // origin: process.env.FRONTEND_URL || 'http://localhost:3000', // Allow requests from your frontend
  origin: "*", // Allow requests from your frontend
  credentials: true // Allow cookies to be sent with requests
}));


// Body parsing middleware
app.use(express.json({ limit: '10mb' })); // Parses JSON request bodies
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // Parses URL-encoded request bodies
app.use(cookieParser()); // NEW: Parses cookies from request headers

// Static file serving for uploads (e.g., resumes, company logos)
app.use('/uploads', express.static('uploads'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'JobPulse API is running',
    timestamp: new Date().toISOString()
  });
});

// API Routes - Mount all your routes here
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/employers', employerRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/chat', chatRoutes);               // Chat/messaging routes
app.use('/api/notifications', notificationRoutes); // Notification routes
app.use('/api/resumes', resumeRoutes); // Resume routes

// 404 handler - This catches any requests that didn't match the above routes
app.use('*', (req, res) => {
  res.status(404).json({ success: false, error: 'Route not found' }); // Standardized error response
});

// Error handling middleware - This must be the LAST middleware
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 JobPulse API server running on port ${PORT}`);
  console.log(`📧 Environment: ${process.env.NODE_ENV}`);
  console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL}`);
});

module.exports = app;
