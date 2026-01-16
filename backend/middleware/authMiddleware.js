const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Ensure correct path to your User model
const Employer = require('../models/Employer'); // Ensure correct path to your Employer model

/**
 * Protect middleware: Authenticates a user based on JWT.
 * It fetches the user/employer document and attaches it to `req.user`,
 * and sets `req.userType` ('user' or 'employer').
 * This is the primary authentication middleware for protected routes.
 */
const protect = async (req, res, next) => {
  let token;

  // 1. Get token from headers, cookies, or query parameters
  if (req.header('Authorization')?.startsWith('Bearer')) {
    token = req.header('Authorization').replace('Bearer ', '');
  } else if (req.cookies?.token) {
    token = req.cookies.token;
  } else if (req.query.token) {
    token = req.query.token;
  }

  // 2. Check if token exists
  if (!token) {
    return res.status(401).json({ success: false, error: 'Access denied. No token provided.' });
  }

  try {
    // 3. Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 4. Fetch user/employer based on the role in the token
    let entity;
    if (decoded.role === 'employer') {
      entity = await Employer.findById(decoded.id).select('+password'); 
      if (!entity) {
        return res.status(401).json({ success: false, error: 'Employer not found.' });
      }
      req.user = entity;
      req.userType = 'employer';
    } else { // Assuming 'user' role for job seekers and admins
      entity = await User.findById(decoded.id).select('+password'); 
      if (!entity) {
        return res.status(401).json({ success: false, error: 'User (job seeker/admin) not found.' });
      }
      req.user = entity;
      req.userType = 'user'; 
    }
    
    next(); 

  } catch (error) {
    console.error('❌ Authentication failed:', error.message); 
    return res.status(401).json({ success: false, error: 'Invalid or expired token. Please log in again.' });
  }
};

/**
 * Middleware to ensure the user's account is verified.
 * Assumes `protect` middleware has already run and `req.user` is available.
 */
const requireVerification = (req, res, next) => {
  if (!req.user.isVerified) {
    return res.status(403).json({ 
      success: false,
      error: 'Account not verified. Please check your email and verify your account to proceed.' 
    });
  }
  next();
};

/**
 * Middleware to restrict access to admin users.
 * Assumes `protect` middleware has already run and `req.user` is available.
 */
const requireAdmin = (req, res, next) => {
  if (req.userType !== 'user' || req.user.role !== 'admin') {
    return res.status(403).json({ 
      success: false,
      error: 'Access denied. Admin privileges required.' 
    });
  }
  next();
};

/**
 * Middleware to restrict access to employer accounts.
 * Assumes `protect` middleware has already run and `req.user` and `req.userType` are available.
 */
const requireEmployer = (req, res, next) => {
  if (req.userType !== 'employer') {
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
 * Middleware to restrict access to job seeker accounts (non-admin users).
 * Assumes `protect` middleware has already run and `req.user` and `req.userType` are available.
 */
const requireJobSeeker = (req, res, next) => {
  if (req.userType !== 'user' || req.user.role === 'admin') {
    return res.status(403).json({ 
      success: false,
      error: 'Access denied. Job seeker privileges required.' 
    });
  }
  if (!req.user.isVerified) {
    return res.status(403).json({ 
      success: false,
      error: 'Job seeker account not verified. Please verify your email.' 
    });
  }
  next();
};


/**
 * Optional authentication middleware.
 * If a token is present and valid, it attaches `req.user` and `req.userType`.
 * If no token or an invalid token, it simply calls `next()` without error,
 * allowing public routes to still function.
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
      let entity;
      if (decoded.role === 'employer') {
        entity = await Employer.findById(decoded.id);
        if (entity && entity.isVerified) { 
          req.user = entity;
          req.userType = 'employer';
        }
      } else {
        entity = await User.findById(decoded.id);
        if (entity && entity.isVerified) { 
          req.user = entity;
          req.userType = 'user';
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
