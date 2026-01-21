const jwt = require('jsonwebtoken');
const User = require('../models/User');
const EmployerProfile = require('../models/EmployerProfile');
const CandidateProfile = require('../models/CandidateProfile');
const AdminProfile = require('../models/AdminProfile');

/**
 * Protect middleware: Authenticates a user based on JWT.
 * It fetches the user document and attaches it to `req.user`.
 * It also fetches the profile and attaches it to `req.profile`.
 */
const protect = async (req, res, next) => {
  let token;

  if (req.header('Authorization')?.startsWith('Bearer')) {
    token = req.header('Authorization').replace('Bearer ', '');
  } else if (req.cookies?.token) {
    token = req.cookies.token;
  } else if (req.query.token) {
    token = req.query.token;
  }

  if (!token) {
    return res.status(401).json({ success: false, error: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find User by public userId from token
    const user = await User.findOne({ userId: decoded.userId }).select('+password');
    
    if (!user) {
      return res.status(401).json({ success: false, error: 'User not found.' });
    }

    req.user = user;
    req.userType = user.role; // 'employer', 'candidate', or 'admin'

    // Fetch Profile based on role
    let profile = null;
    if (user.role === 'employer') {
      profile = await EmployerProfile.findOne({ user: user._id });
    } else if (user.role === 'candidate') {
      profile = await CandidateProfile.findOne({ user: user._id });
    } else if (user.role === 'admin') {
      profile = await AdminProfile.findOne({ user: user._id });
    }
    
    req.profile = profile;
    
    next(); 

  } catch (error) {
    console.error('❌ Authentication failed:', error.message); 
    return res.status(401).json({ success: false, error: 'Invalid or expired token. Please log in again.' });
  }
};

/**
 * Middleware to ensure the user's account is verified.
 */
const requireVerification = (req, res, next) => {
  if (req.user && !req.user.isVerified) {
    return res.status(403).json({ 
      success: false,
      error: 'Account not verified. Please check your email and verify your account to proceed.' 
    });
  }
  next();
};

/**
 * Middleware to restrict access to admin users.
 */
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      success: false,
      error: 'Access denied. Admin privileges required.' 
    });
  }
  next();
};

/**
 * Middleware to restrict access to employer accounts.
 */
const requireEmployer = (req, res, next) => {
  if (req.user.role !== 'employer') {
    return res.status(403).json({ 
      success: false,
      error: 'Access denied. Employer account required.' 
    });
  }
  if (!req.user.isVerified) {
    return res.status(403).json({ 
      success: false,
      error: 'Employer account not verified. Please verify your email.' 
    });
  }
  next();
};

/**
 * Middleware to restrict access to candidate (job seeker) accounts.
 */
const requireJobSeeker = (req, res, next) => {
  if (req.user.role !== 'candidate') {
    return res.status(403).json({ 
      success: false,
      error: 'Access denied. Candidate privileges required.' 
    });
  }
  if (!req.user.isVerified) {
    return res.status(403).json({ 
      success: false,
      error: 'Candidate account not verified. Please verify your email.' 
    });
  }
  next();
};


/**
 * Optional authentication middleware.
 */
const optionalAuth = async (req, res, next) => {
  let token;
  if (req.header('Authorization')?.startsWith('Bearer')) {
    token = req.header('Authorization').replace('Bearer ', '');
  } else if (req.cookies?.token) {
    token = req.cookies.token;
  } else if (req.query.token) {
    token = req.query.token;
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findOne({ userId: decoded.userId });
      
      if (user) {
        req.user = user;
        req.userType = user.role;
        
        if (user.role === 'employer') {
          req.profile = await EmployerProfile.findOne({ user: user._id });
        } else if (user.role === 'candidate') {
          req.profile = await CandidateProfile.findOne({ user: user._id });
        } else if (user.role === 'admin') {
          req.profile = await AdminProfile.findOne({ user: user._id });
        }
      }
    } catch (error) {
      console.warn('Optional authentication: Invalid or expired token, continuing as unauthenticated.');
    }
  }
  next();
};


module.exports = {
  protect,
  requireVerification,
  requireAdmin,
  requireEmployer,
  requireJobSeeker,
  optionalAuth,
};
