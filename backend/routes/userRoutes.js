const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const {
  getUserProfile,
  updateUserProfile,
  uploadResume,
  deleteResume,
  getUserApplications,
  getUserStats,
  changePassword,
  deleteUserAccount
} = require('../controllers/userController');

const { completeProfile } = require('../controllers/authController');
const {
  getUserFromToken,
  requireVerification,
  requireJobSeeker,
  protect
} = require('../middleware/authMiddleware');

const { uploadResume: uploadResumeMiddleware } = require('../middleware/uploadMiddleware');

// Validation middleware
const validateProfileUpdate = [
  body('name').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  body('phone').optional().trim().isLength({ max: 20 }).withMessage('Phone number cannot exceed 20 characters'),
  body('address').optional().trim().isLength({ max: 200 }).withMessage('Address cannot exceed 200 characters'),
  body('summary').optional().trim().isLength({ max: 1000 }).withMessage('Summary cannot exceed 1000 characters')
];

const validatePasswordChange = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
];

const validateAccountDeletion = [
  body('password').notEmpty().withMessage('Password is required for account deletion')
];

// Protected routes (require authentication)
router.get('/profile', getUserFromToken, requireVerification, getUserProfile);
router.put('/profile', getUserFromToken, requireVerification, validateProfileUpdate, updateUserProfile);
router.post('/upload-resume', getUserFromToken, requireVerification, requireJobSeeker, uploadResumeMiddleware, uploadResume);
router.delete('/resume', getUserFromToken, requireVerification, requireJobSeeker, deleteResume);
router.get('/applications', getUserFromToken, requireVerification, requireJobSeeker, getUserApplications);
router.get('/stats', getUserFromToken, requireVerification, requireJobSeeker, getUserStats);
router.put('/change-password', getUserFromToken, requireVerification, validatePasswordChange, changePassword);
router.delete('/account', getUserFromToken, requireVerification, validateAccountDeletion, deleteUserAccount);
router.post('/complete-profile', protect, completeProfile);

module.exports = router;