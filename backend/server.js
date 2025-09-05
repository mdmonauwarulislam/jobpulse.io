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
const authRoutes = require('./routes/authRoutes'); // Will be created next
const jobRoutes = require('./routes/jobRoutes');
const applicationRoutes = require('./routes/applicationRoutes'); // Assuming you have this
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes'); // Assuming you have this
const employerRoutes = require('./routes/employerRoutes'); // NEW: Import employer routes
const skillRoutes = require('./routes/skillRoutes');     // NEW: Import skill routes

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Security middleware
app.use(helmet()); // Sets various HTTP headers for security
app.use(compression()); // Compresses response bodies for faster loading

// CORS configuration - Ensure your frontend URL is correctly set in .env
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000', // Allow requests from your frontend
  credentials: true // Allow cookies to be sent with requests
}));

// Rate limiting - Applied to all /api/ routes
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // Max 100 requests per IP per window
  message: {
    success: false, // Indicate failure for rate limit errors
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
app.use('/api/', limiter); // Apply rate limiting to all routes under /api/

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
// Order generally doesn't matter unless there are overlapping paths with stricter specificity
app.use('/api/auth', authRoutes); // Auth routes (login, register, verify, etc.)
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/employers', employerRoutes); // NEW: Employer-specific routes
app.use('/api/skills', skillRoutes);     // NEW: Skill management routes

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
