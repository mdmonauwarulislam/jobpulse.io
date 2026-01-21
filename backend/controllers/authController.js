const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const EmployerProfile = require('../models/EmployerProfile');
const CandidateProfile = require('../models/CandidateProfile');
const AdminProfile = require('../models/AdminProfile');
const { sendEmail } = require('../config/mailer'); 
const asyncHandler = require('../utils/asyncHandler'); 

// Helper function to send JWT token in response
const sendTokenResponse = async (user, statusCode, res, profile) => {
  // Payload uses public userId, NOT Mongo _id
  const token = jwt.sign({ userId: user.userId, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d' 
  });

  const options = {
    expires: new Date(Date.now() + (process.env.JWT_COOKIE_EXPIRE || 30) * 24 * 60 * 60 * 1000), 
    httpOnly: true 
  };

  if (process.env.NODE_ENV === 'production') {
    options.secure = true;
    options.sameSite = 'None'; 
  }

  res.cookie('token', token, options);

  // Construct response data
  const responseData = {
    id: user._id, // Keep internal ID if frontend uses it, but prefer userId
    userId: user.userId,
    name: user.name,
    email: user.email,
    isVerified: user.isVerified,
    role: user.role,
    isProfileComplete: profile ? profile.isProfileComplete : false,
    profileCompletion: profile ? profile.profileCompletion : 0
  };

  // Add profile specific data
  if (user.role === 'employer' && profile) {
    responseData.company = profile.company;
    responseData.companyLogo = profile.companyLogo;
    responseData.companyWebsite = profile.companyWebsite;
    responseData.companyDescription = profile.companyDescription;
    responseData.industry = profile.industry;
    responseData.location = profile.location;
  } else if (user.role === 'candidate' && profile) {
     // Add candidate specific fields if needed in auth response
  } else if (user.role === 'admin' && profile) {
     responseData.roleLevel = profile.roleLevel;
     responseData.permissions = profile.permissions;
  }

  res.status(statusCode).json({
    success: true,
    message: 'Authentication successful',
    data: { [user.role]: responseData, token } 
  });
};

/**
 * @desc Register a new user (job seeker / candidate)
 * @route POST /api/auth/register-user
 * @access Public
 */
const registerUser = asyncHandler(async (req, res, next) => {
  const { name, email, password } = req.body;

  // Check if user already exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    return res.status(400).json({ success: false, error: 'Email already registered.' });
  }

  // 1. Create User (Auth)
  const user = await User.create({
    name,
    email,
    password,
    role: 'candidate'
  });

  // 2. Create Candidate Profile
  await CandidateProfile.create({
    user: user._id,
    userId: user.userId
  });

  // Generate verification token
  const verificationToken = user.generateVerificationToken();
  await user.save({ validateBeforeSave: false }); 

  // Send verification email
  const emailResult = await sendEmail(user.email, 'verification', [user.name, verificationToken]);
  if (!emailResult.success) {
    console.error(`❌ Failed to send verification email to ${user.email}:`, emailResult.error);
  }

  const profile = await CandidateProfile.findOne({ user: user._id });
  sendTokenResponse(user, 201, res, profile);
});

/**
 * @desc Register a new employer
 * @route POST /api/auth/register-employer
 * @access Public
 */
const registerEmployer = asyncHandler(async (req, res, next) => {
  const { name, email, password, company } = req.body;

  // Check if user already exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    return res.status(400).json({ success: false, error: 'Email already registered.' });
  }

  // 1. Create User (Auth)
  const user = await User.create({
    name,
    email,
    password,
    role: 'employer'
  });

  // 2. Create Employer Profile
  await EmployerProfile.create({
    user: user._id,
    userId: user.userId,
    company
  });

  // Generate verification token
  const verificationToken = user.generateVerificationToken();
  await user.save({ validateBeforeSave: false });

  // Send verification email
  const emailResult = await sendEmail(user.email, 'verification', [user.name, verificationToken]);
  if (!emailResult.success) {
    console.error(`❌ Failed to send verification email to ${user.email}:`, emailResult.error);
  }

  const profile = await EmployerProfile.findOne({ user: user._id });
  sendTokenResponse(user, 201, res, profile);
});



/**
 * @desc Login user (job seeker)
 * @route POST /api/auth/login-user
 * @access Public
 */
const loginUser = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, error: 'Please provide email and password' });
  }

  // Check user and password
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ success: false, error: 'Invalid credentials' });
  }

  // Ensure role matches (optional safety check)
  if (user.role !== 'candidate') {
    return res.status(401).json({ success: false, error: 'Invalid account type. Please login as Employer.' });
  }

  const profile = await CandidateProfile.findOne({ user: user._id });
  sendTokenResponse(user, 200, res, profile);
});

/**
 * @desc Login employer
 * @route POST /api/auth/login-employer
 * @access Public
 */
const loginEmployer = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, error: 'Please provide email and password' });
  }

  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ success: false, error: 'Invalid credentials' });
  }

  if (user.role !== 'employer') {
    return res.status(401).json({ success: false, error: 'Invalid account type. Please login as Job Seeker.' });
  }

  const profile = await EmployerProfile.findOne({ user: user._id });
  sendTokenResponse(user, 200, res, profile);
});

/**
 * @desc Login admin
 * @route POST /api/auth/login-admin
 * @access Public
 */
const loginAdmin = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email, role: 'admin' }).select('+password');

  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ success: false, error: 'Invalid credentials or not an admin account.' });
  }

  // Ensure AdminProfile exists (auto-create if missing for existing admins)
  let adminProfile = await AdminProfile.findOne({ user: user._id });
  if (!adminProfile) {
    adminProfile = await AdminProfile.create({
      user: user._id,
      userId: user.userId,
      roleLevel: 'super_admin', // Default to super_admin for existing admins
      permissions: ['full_access']
    });
  }

  // Update last login
  adminProfile.lastLogin = new Date();
  await adminProfile.save();

  sendTokenResponse(user, 200, res, adminProfile);
});


/**
 * @desc Verify email using token
 * @route POST /api/auth/verify-email
 * @access Public
 */
const verifyEmail = asyncHandler(async (req, res, next) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ success: false, error: 'Verification token is required.' });
  }

  const hashedToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');

  // Verify against User model (Auth)
  const user = await User.findOne({
    verificationToken: hashedToken,
    verificationTokenExpire: { $gt: Date.now() }
  });

  if (!user) {
    return res.status(400).json({ success: false, error: 'Invalid or expired verification token.' });
  }

  if (user.isVerified) {
    return res.status(400).json({ success: false, error: 'Email is already verified.' });
  }

  user.clearVerificationToken();
  await user.save({ validateBeforeSave: false }); 

  res.json({ success: true, message: 'Email verified successfully! You can now log in.' });
});

/**
 * @desc Resend verification email
 * @route POST /api/auth/resend-verification
 * @access Public
 */
const resendVerification = asyncHandler(async (req, res, next) => {
  const { email } = req.body; 

  if (!email) {
    return res.status(400).json({ success: false, error: 'Email is required.' });
  }

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(404).json({ success: false, error: 'User not found.' });
  }

  if (user.isVerified) {
    return res.status(400).json({ success: false, error: 'Email already verified.' });
  }

  const newToken = user.generateVerificationToken();
  await user.save({ validateBeforeSave: false });

  const emailResult = await sendEmail(user.email, 'verification', [user.name, newToken]);

  if (!emailResult.success) {
    return res.status(500).json({ success: false, error: 'Failed to send email.' });
  }

  res.json({ success: true, message: 'Verification email resent.' });
});

/**
 * @desc Request password reset token
 * @route POST /api/auth/forgot-password
 * @access Public
 */
const forgotPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body; 

  if (!email) {
    return res.status(400).json({ success: false, error: 'Email is required.' });
  }

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(200).json({ success: true, message: 'If account exists, email sent.' });
  }

  const resetToken = user.generatePasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const emailResult = await sendEmail(user.email, 'passwordReset', [user.name, resetToken]);

  if (!emailResult.success) {
    return res.status(500).json({ success: false, error: 'Failed to send email.' });
  }

  res.status(200).json({ success: true, message: 'Password reset email sent.' });
});

/**
 * @desc Reset password using token
 * @route PUT /api/auth/reset-password
 * @access Public
 */
const resetPassword = asyncHandler(async (req, res, next) => {
  const { token, password } = req.body;

  if (!token || !password) {
    return res.status(400).json({ success: false, error: 'Token and new password required.' });
  }

  const hashedToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() } 
  }).select('+password'); 

  if (!user) {
    return res.status(400).json({ success: false, error: 'Invalid/expired token.' });
  }

  user.password = password;
  user.clearPasswordResetToken(); 
  await user.save({ validateBeforeSave: true }); 

  res.status(200).json({ success: true, message: 'Password reset successfully.' });
});

/**
 * @desc Get authenticated user's profile
 * @route GET /api/auth/me 
 * @access Private
 */
const getMe = asyncHandler(async (req, res, next) => {
  // Provided by protect middleware
  const user = req.user;
  const profile = req.profile; 

  if (!user) {
    return res.status(404).json({ success: false, error: 'User not found.' });
  }

  const responseData = {
    userId: user.userId,
    name: user.name,
    email: user.email,
    isVerified: user.isVerified,
    role: user.role,
    isProfileComplete: profile ? profile.isProfileComplete : false,
    profileCompletion: profile ? profile.profileCompletion : 0
  };

  if (user.role === 'employer' && profile) {
    // Merge all profile fields automatically to ensure nothing IS missing
    Object.assign(responseData, profile.toObject());
  } else if (user.role === 'admin' && profile) {
    responseData.roleLevel = profile.roleLevel;
    responseData.permissions = profile.permissions;
  }

  res.status(200).json({
    success: true,
    data: {
      [user.role]: responseData, // Keeps legacy frontend compatibility: data.user or data.employer
      profile // Can also return full profile if needed
    }
  });
});


// Logout function (clears cookie on client-side)
const logout = asyncHandler(async (req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000), 
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax', 
  });

  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
});


// Update password (authenticated)
const updatePassword = asyncHandler(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  // Validate input
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ success: false, error: 'Please provide both current and new passwords' });
  }

  // Get user with password
  const user = await User.findById(req.user.id).select('+password');

  // Check current password
  if (!(await user.comparePassword(currentPassword))) {
    return res.status(401).json({ success: false, error: 'Incorrect current password' });
  }

  // Update password
  user.password = newPassword;
  await user.save();

  sendTokenResponse(user, 200, res, null); // Re-issue token/cookie just in case (optional but good practice)
});

/**
 * @desc Unified Login for all roles
 * @route POST /api/auth/login
 * @access Public
 */
const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, error: 'Please provide email and password' });
  }

  // Check user and password
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ success: false, error: 'Invalid credentials' });
  }

  let profile;

  // Fetch profile based on role
  if (user.role === 'candidate') {
    profile = await CandidateProfile.findOne({ user: user._id });
  } else if (user.role === 'employer') {
    profile = await EmployerProfile.findOne({ user: user._id });
  } else if (user.role === 'admin') {
    profile = await AdminProfile.findOne({ user: user._id });
    
    // Auto-create admin profile if missing (legacy support)
    if (!profile) {
       profile = await AdminProfile.create({
        user: user._id,
        userId: user.userId,
        roleLevel: 'super_admin',
        permissions: ['full_access']
      });
    }
    // Update last login for admin
    profile.lastLogin = new Date();
    await profile.save();
  }

  // Use the existing helper to send response
  sendTokenResponse(user, 200, res, profile);
});

module.exports = {
  registerUser,
  registerEmployer,
  loginUser,
  loginEmployer,
  loginAdmin,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
  updatePassword, // Added this
  getMe, 
  logout,
  login // Unified login
};
