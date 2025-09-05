const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const Employer = require('../models/Employer');
const { sendEmail } = require('../config/mailer'); // Assuming path to your mailer utility
const asyncHandler = require('../utils/asyncHandler'); // Import the async handler

// Helper function to send JWT token in response
const sendTokenResponse = (model, statusCode, res, role) => {
  const token = jwt.sign({ id: model._id, role: role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d' // Use environment variable for expiry
  });

  // Options for cookie (e.g., httpOnly, secure in production)
  const options = {
    expires: new Date(Date.now() + (process.env.JWT_COOKIE_EXPIRE || 30) * 24 * 60 * 60 * 1000), // Convert days to milliseconds
    httpOnly: true // Prevent client-side JavaScript from accessing the cookie
  };

  // Only send secure cookie in production over HTTPS
  if (process.env.NODE_ENV === 'production') {
    options.secure = true;
    options.sameSite = 'None'; // Required for cross-site cookies with secure: true
  }

  // Set the token in a cookie
  res.cookie('token', token, options);

  // Prepare user/employer data to send in JSON response
  const responseData = {
    id: model._id,
    name: model.name || model.companyName, // Use companyName for employer, name for user
    email: model.email,
    isVerified: model.isVerified,
    role: role,
    isProfileComplete: model.isProfileComplete || (model.profileCompletion === 100), // Provide computed status
    profileCompletion: model.profileCompletion || undefined // Include profile completion for frontend
  };

  if (role === 'employer') {
    responseData.company = model.company;
  }

  res.status(statusCode).json({
    success: true,
    message: 'Authentication successful',
    data: { [role]: responseData, token } // Send token in body too for flexibility
  });
};

/**
 * @desc Register a new user (job seeker)
 * @route POST /api/auth/register-user
 * @access Public
 */
const registerUser = asyncHandler(async (req, res, next) => {
  const { name, email, password } = req.body;

  // Check if user already exists (handled by Mongoose unique constraint + errorHandler)
  const user = await User.create({ name, email, password });

  // Generate verification token
  const verificationToken = user.generateVerificationToken();
  await user.save({ validateBeforeSave: false }); // Save without re-validating password after token generation

  // Send verification email
  const emailResult = await sendEmail(user.email, 'verification', [user.name, verificationToken]);
  if (!emailResult.success) {
    console.error(`❌ Failed to send verification email to ${user.email}:`, emailResult.error);
    // Optionally, delete the user or mark them for re-verification if email sending is critical
    // For now, we allow registration but log the email error.
  }

  sendTokenResponse(user, 201, res, 'user');
});

/**
 * @desc Register a new employer
 * @route POST /api/auth/register-employer
 * @access Public
 */
const registerEmployer = asyncHandler(async (req, res, next) => {
  const { name, email, password, company } = req.body;

  // Check if employer already exists (handled by Mongoose unique constraint + errorHandler)
  const employer = await Employer.create({ name, email, password, company });

  // Generate verification token
  const verificationToken = employer.generateVerificationToken();
  await employer.save({ validateBeforeSave: false });

  // Send verification email
  const emailResult = await sendEmail(employer.email, 'verification', [employer.name, verificationToken]);
  if (!emailResult.success) {
    console.error(`❌ Failed to send verification email to ${employer.email}:`, emailResult.error);
  }

  sendTokenResponse(employer, 201, res, 'employer');
});

/**
 * @desc Login user (job seeker)
 * @route POST /api/auth/login-user
 * @access Public
 */
const loginUser = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Check if user exists and select password for comparison
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ success: false, error: 'Invalid credentials. Please check your email and password.' });
  }

  sendTokenResponse(user, 200, res, 'user');
});

/**
 * @desc Login employer
 * @route POST /api/auth/login-employer
 * @access Public
 */
const loginEmployer = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Check if employer exists and select password for comparison
  const employer = await Employer.findOne({ email }).select('+password');

  if (!employer || !(await employer.comparePassword(password))) {
    return res.status(401).json({ success: false, error: 'Invalid credentials. Please check your email and password.' });
  }

  sendTokenResponse(employer, 200, res, 'employer');
});

/**
 * @desc Login admin
 * @route POST /api/auth/login-admin
 * @access Public
 */
const loginAdmin = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Check if user exists and is an admin
  const user = await User.findOne({ email, role: 'admin' }).select('+password');

  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ success: false, error: 'Invalid credentials or not an admin account.' });
  }

  sendTokenResponse(user, 200, res, 'admin');
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

  // Hash the token received from the client to match the stored hashed token
  const hashedToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');

  // Attempt to find the token in User or Employer collection
  let account = await User.findOne({ verificationToken: hashedToken });

  if (!account) {
    account = await Employer.findOne({ verificationToken: hashedToken });
  }

  if (!account) {
    return res.status(400).json({ success: false, error: 'Invalid or expired verification token.' });
  }

  if (account.isVerified) {
    return res.status(400).json({ success: false, error: 'Email is already verified.' });
  }

  // Clear verification token and mark as verified
  account.clearVerificationToken();
  await account.save({ validateBeforeSave: false }); // Save without re-validating all fields

  res.json({ success: true, message: 'Email verified successfully! You can now log in.' });
});

/**
 * @desc Resend verification email
 * @route POST /api/auth/resend-verification
 * @access Public
 */
const resendVerification = asyncHandler(async (req, res, next) => {
  const { email } = req.body; // Expect email to identify the user/employer

  if (!email) {
    return res.status(400).json({ success: false, error: 'Email is required to resend verification.' });
  }

  let account = await User.findOne({ email });
  if (!account) {
    account = await Employer.findOne({ email });
  }

  if (!account) {
    return res.status(404).json({ success: false, error: 'Account not found with that email.' });
  }

  if (account.isVerified) {
    return res.status(400).json({ success: false, error: 'This email is already verified. No need to resend.' });
  }

  // Generate a new verification token
  const newToken = account.generateVerificationToken();
  await account.save({ validateBeforeSave: false });

  // Send the new verification email
  const emailResult = await sendEmail(account.email, 'verification', [account.name || account.companyName, newToken]);

  if (!emailResult.success) {
    return res.status(500).json({ success: false, error: 'Failed to resend verification email. Please try again later.' });
  }

  res.json({ success: true, message: 'Verification email resent. Please check your inbox.' });
});

/**
 * @desc Request password reset token
 * @route POST /api/auth/forgot-password
 * @access Public
 */
const forgotPassword = asyncHandler(async (req, res, next) => {
  const { email, userType } = req.body; // userType to distinguish between User and Employer

  if (!email || !userType) {
    return res.status(400).json({ success: false, error: 'Email and userType are required.' });
  }

  let account = null;
  if (userType === 'employer') {
    account = await Employer.findOne({ email });
  } else if (userType === 'user') { // Assume 'user' for job seekers and admin
    account = await User.findOne({ email });
  } else {
    return res.status(400).json({ success: false, error: 'Invalid userType. Must be "user" or "employer".' });
  }

  if (!account) {
    // Send a generic success message even if email not found to prevent enumeration attacks
    return res.status(200).json({ success: true, message: 'If an account with that email exists, a password reset email has been sent.' });
  }

  // Generate reset token and save it to the account
  const resetToken = account.generatePasswordResetToken();
  await account.save({ validateBeforeSave: false });

  // Send reset email
  const name = account.name || account.companyName; // Use appropriate name for email
  const emailResult = await sendEmail(account.email, 'passwordReset', [name, resetToken]);

  if (!emailResult.success) {
    return res.status(500).json({ success: false, error: 'Failed to send password reset email. Please try again later.' });
  }

  res.status(200).json({ success: true, message: 'Password reset email sent.' });
});

/**
 * @desc Reset password using token
 * @route PUT /api/auth/reset-password
 * @access Public
 */
const resetPassword = asyncHandler(async (req, res, next) => {
  const { token, password, userType } = req.body;

  if (!token || !password || !userType) {
    return res.status(400).json({ success: false, error: 'Token, new password, and userType are required.' });
  }

  // Hash the token received from the client
  const hashedToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');

  let account = null;
  if (userType === 'employer') {
    account = await Employer.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() } // Check if token is not expired
    }).select('+password'); // Select password to allow hashing
  } else if (userType === 'user') {
    account = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() }
    }).select('+password');
  } else {
    return res.status(400).json({ success: false, error: 'Invalid userType. Must be "user" or "employer".' });
  }

  if (!account) {
    return res.status(400).json({ success: false, error: 'Invalid or expired password reset token.' });
  }

  // Update password (pre-save hook will hash it)
  account.password = password;
  account.clearPasswordResetToken(); // Clear token after use
  await account.save({ validateBeforeSave: true }); // Ensure new password meets criteria

  res.status(200).json({ success: true, message: 'Password reset successfully. You can now log in with your new password.' });
});

/**
 * @desc Get authenticated user's profile (redundant with /api/users/profile and /api/employers/me)
 * @route GET /api/auth/me (Deprecated in favor of specific user/employer profile routes)
 * @access Private
 */
const getMe = asyncHandler(async (req, res, next) => {
  // This function is largely redundant now that we have /api/users/profile and /api/employers/me.
  // It's better to keep profile retrieval separate from auth.
  // However, if you insist on keeping it as a generic "me" endpoint, here's how it would look.
  // Ensure 'protect' middleware has run.

  let profileData;
  if (req.userType === 'employer') {
    profileData = await Employer.findById(req.user._id)
      .select('-password -verificationToken -resetPasswordToken -resetPasswordExpire -isAdminApproved');
  } else { // user or admin
    profileData = await User.findById(req.user._id)
      .select('-password -verificationToken -resetPasswordToken -resetPasswordExpire')
      .populate('skills'); // Assuming job seekers have skills populated
  }

  if (!profileData) {
    return res.status(404).json({ success: false, error: 'Profile not found.' });
  }

  res.status(200).json({
    success: true,
    data: {
      user: profileData, // Rename 'user' to 'profile' or keep specific
      profileCompletion: profileData.profileCompletion || undefined,
      isProfileComplete: profileData.isProfileComplete || (profileData.profileCompletion === 100)
    }
  });
});


// Logout function (clears cookie on client-side)
const logout = asyncHandler(async (req, res) => {
  // Clearing the cookie on the client side is typically handled by setting an expired cookie.
  // The server sends this response, and the client browser will delete the cookie.
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000), // Expires in 10 seconds
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax', // Adjust for production
  });

  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
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
  getMe, // Renamed from getProfile for clarity of intent
  logout
};
