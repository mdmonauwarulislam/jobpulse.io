const express = require('express');
const { body, param } = require('express-validator');
const router = express.Router();

const {
  getEmployerProfile,
  updateEmployerProfile,
  uploadCompanyLogo,
  deleteCompanyLogo,
  getEmployerJobs,
  getEmployerStats,
  getEmployerApplications,
  getApplicationDetails,
  updateApplicationStatus,
  scheduleInterview,
  getEmployerById
} = require('../controllers/employerController');

const {
  protect,
  requireVerification,
  requireEmployer
} = require('../middleware/authMiddleware');

const { uploadLogo: uploadLogoMiddleware } = require('../middleware/uploadMiddleware');

// Validation middleware
const validateProfileUpdate = [
  body('name').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  body('company').optional().trim().isLength({ min: 2, max: 200 }).withMessage('Company name must be between 2 and 200 characters'),
  body('companyDescription').optional().trim().isLength({ max: 1000 }).withMessage('Company description cannot exceed 1000 characters'),
  body('companyWebsite').optional().isURL().withMessage('Please enter a valid website URL'),
  body('phone').optional().trim().isLength({ max: 20 }).withMessage('Phone number cannot exceed 20 characters'),
  body('address').optional().trim().isLength({ max: 200 }).withMessage('Address cannot exceed 200 characters'),
  body('industry').optional().trim().isLength({ max: 100 }).withMessage('Industry cannot exceed 100 characters'),
  body('companySize').optional().trim(),
  body('foundedYear').optional().isInt({ min: 1700, max: new Date().getFullYear() }).withMessage('Please enter a valid founded year'),
  body('location.city').optional().trim(),
  body('location.state').optional().trim(),
  body('location.country').optional().trim(),
  body('socialLinks.linkedin').optional().trim().matches(/^https?:\/\/(www\.)?linkedin\.com\/.+/).withMessage('Please enter a valid LinkedIn URL'),
  body('socialLinks.twitter').optional().trim(),
  body('socialLinks.facebook').optional().trim(),
  body('socialLinks.other').optional().trim()
];

const validateStatusUpdate = [
  param('applicationId').isMongoId().withMessage('Invalid application ID'),
  body('status').isIn(['pending', 'reviewed', 'shortlisted', 'rejected', 'hired']).withMessage('Invalid status'),
  body('notes').optional().trim().isLength({ max: 1000 }).withMessage('Notes cannot exceed 1000 characters')
];

const validateInterview = [
  param('applicationId').isMongoId().withMessage('Invalid application ID'),
  body('date').isISO8601().withMessage('Please provide a valid date'),
  body('time').optional().trim().isLength({ max: 50 }).withMessage('Time cannot exceed 50 characters'),
  body('location').optional().trim().isLength({ max: 200 }).withMessage('Location cannot exceed 200 characters'),
  body('type').optional().isIn(['in-person', 'phone', 'video']).withMessage('Invalid interview type'),
  body('notes').optional().trim().isLength({ max: 1000 }).withMessage('Notes cannot exceed 1000 characters')
];

// Public routes
router.get('/public/:employerId', getEmployerById);

// Protected routes - require employer authentication
router.use(protect, requireVerification, requireEmployer);

// Profile routes
router.get('/me', getEmployerProfile);
router.post('/complete-profile', validateProfileUpdate, require('../controllers/employerController').completeEmployerProfile);
router.put('/me', validateProfileUpdate, updateEmployerProfile);
router.post('/me/upload-logo', uploadLogoMiddleware, uploadCompanyLogo);
router.delete('/me/logo', deleteCompanyLogo);

// Dashboard & Stats
router.get('/stats', getEmployerStats);

// Job management
router.get('/jobs', getEmployerJobs);

// Application management
router.get('/applications', getEmployerApplications);
router.get('/applications/:applicationId', getApplicationDetails);
router.put('/applications/:applicationId/status', validateStatusUpdate, updateApplicationStatus);
router.post('/applications/:applicationId/interview', validateInterview, scheduleInterview);

module.exports = router;
