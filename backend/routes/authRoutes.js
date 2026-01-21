const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const {
  registerUser,
  registerEmployer,
  loginUser,
  loginEmployer,
  loginAdmin,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
  updatePassword, // Added import
  getMe, // Renamed from getProfile in controller
  logout,
  login
} = require('../controllers/authController');

const {
  protect // Use the consolidated protect middleware
  // requireVerification - will be handled by logic on frontend after auth flow
} = require('../middleware/authMiddleware');

// Validation middleware for registration and login
const validateRegistration = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
];

const validateEmployerRegistration = [
  body('name').trim().notEmpty().withMessage('Contact person name is required').isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('company').trim().notEmpty().withMessage('Company name is required').isLength({ min: 2, max: 200 }).withMessage('Company name must be between 2 and 200 characters')
];

const validateLogin = [
  body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email'),
  body('password').notEmpty().withMessage('Password is required')
];

const validateVerifyEmail = [
  body('token').notEmpty().withMessage('Verification token is required')
];

const validateForgotPassword = [
  body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email'),
  body('userType').notEmpty().withMessage('User type (user or employer) is required').isIn(['user', 'employer']).withMessage('Invalid user type')
];

const validateResetPassword = [
  body('token').notEmpty().withMessage('Reset token is required'),
  body('password').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
  body('userType').notEmpty().withMessage('User type (user or employer) is required').isIn(['user', 'employer']).withMessage('Invalid user type')
];

const validateResendVerification = [
  body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email')
];

// Public authentication routes
router.post('/login', validateLogin, login); // Unified login route
router.post('/register-user', validateRegistration, registerUser);
router.post('/register-employer', validateEmployerRegistration, registerEmployer);
router.post('/login-user', validateLogin, loginUser);
router.post('/login-employer', validateLogin, loginEmployer);
router.post('/login-admin', validateLogin, loginAdmin); // Admin login is still a 'user' role with 'admin' enum
router.post('/verify-email', validateVerifyEmail, verifyEmail);
router.post('/resend-verification', validateResendVerification, resendVerification);
router.post('/forgot-password', validateForgotPassword, forgotPassword);
router.put('/reset-password', validateResetPassword, resetPassword); // Using PUT for reset as it's an update

// Protected auth routes (requires authentication)
// The /me endpoint here provides current user/employer details without needing to go to specific profile routes
router.get('/me', protect, getMe);
router.put('/update-password', protect, updatePassword); // Added password update route
router.post('/logout', protect, logout); // Logout route, clears cookie

// The following routes are now handled by their specific controllers/routes:
// router.post('/employer/upload-logo', getUserFromToken, uploadLogo, uploadEmployerLogo); // Moved to employerRoutes

module.exports = router;
