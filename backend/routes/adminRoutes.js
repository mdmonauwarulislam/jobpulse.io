const express = require('express');
const { body, param, query } = require('express-validator'); // Import param for ID validation
const router = express.Router();

const {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getAllEmployers,
  getEmployerById,
  updateEmployer,
  deleteEmployer,
  uploadEmployerLogo, // For admin to upload a logo for an employer
  getAllJobs, // Admin's view of all jobs
  getAllApplications,
  getDashboardStats,
} = require('../controllers/adminController');

const {
  protect, // Use the new consolidated protect middleware
  requireAdmin,
  // Removed requireVerification here as admin already has it built into their login flow
} = require('../middleware/authMiddleware');

const { uploadCompanyLogo: uploadLogoMiddleware } = require('../middleware/uploadMiddleware'); // Assuming this exists for file uploads

// Validation middleware for admin actions
const validateUserUpdate = [
  param('userId').isMongoId().withMessage('Invalid User ID format.'),
  body('name').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  body('email').optional().isEmail().normalizeEmail().withMessage('Please enter a valid email'),
  body('role').optional().isIn(['user', 'admin']).withMessage('Invalid role provided.').trim(),
  body('isVerified').optional().isBoolean().withMessage('isVerified must be a boolean'),
  body('isProfileComplete').optional().isBoolean().withMessage('isProfileComplete must be a boolean'),
  // Additional fields for user profile update (like education, experience, skills)
  body('phone').optional().trim().isLength({ max: 20 }).withMessage('Phone number cannot exceed 20 characters'),
  body('address').optional().trim().isLength({ max: 200 }).withMessage('Address cannot exceed 200 characters'),
  body('summary').optional().trim().isLength({ max: 1000 }).withMessage('Summary cannot exceed 1000 characters'),
  body('education').optional().isArray().withMessage('Education must be an array of objects.'),
  body('education.*.degree').optional().notEmpty().withMessage('Education degree is required.').isLength({ max: 100 }).withMessage('Degree cannot exceed 100 characters.'),
  body('education.*.institution').optional().notEmpty().withMessage('Education institution is required.').isLength({ max: 200 }).withMessage('Institution cannot exceed 200 characters.'),
  body('education.*.year').optional().notEmpty().withMessage('Education year is required.').isLength({ max: 10 }).withMessage('Year cannot exceed 10 characters.'),
  body('education.*.description').optional().isLength({ max: 500 }).withMessage('Education description cannot exceed 500 characters.'),
  body('experience').optional().isArray().withMessage('Experience must be an array of objects.'),
  body('experience.*.jobTitle').optional().notEmpty().withMessage('Experience job title is required.').isLength({ max: 100 }).withMessage('Job title cannot exceed 100 characters.'),
  body('experience.*.company').optional().notEmpty().withMessage('Experience company is required.').isLength({ max: 200 }).withMessage('Company cannot exceed 200 characters.'),
  body('experience.*.duration').optional().notEmpty().withMessage('Experience duration is required.').isLength({ max: 50 }).withMessage('Duration cannot exceed 50 characters.'),
  body('experience.*.description').optional().isLength({ max: 1000 }).withMessage('Experience description cannot exceed 1000 characters.'),
  body('skills').optional().isArray().withMessage('Skills must be an array of skill IDs.'),
  body('skills.*').optional().isMongoId().withMessage('Each skill must be a valid skill ID.'),
  body('resumeUrl').optional().isURL().withMessage('Invalid resume URL format.').trim()
];

const validateEmployerUpdate = [
  param('employerId').isMongoId().withMessage('Invalid Employer ID format.'),
  body('name').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Contact person name must be between 2 and 100 characters'),
  body('email').optional().isEmail().normalizeEmail().withMessage('Please enter a valid email'),
  body('company').optional().trim().isLength({ min: 2, max: 200 }).withMessage('Company name must be between 2 and 200 characters'),
  body('companyDescription').optional().trim().isLength({ max: 1000 }).withMessage('Company description cannot exceed 1000 characters'),
  body('companyWebsite').optional().trim().isURL().withMessage('Please enter a valid company website URL').isLength({ max: 200 }).withMessage('Website URL cannot exceed 200 characters'),
  body('companyLogo').optional().isURL().withMessage('Invalid company logo URL format.').trim(),
  body('phone').optional().trim().isLength({ max: 20 }).withMessage('Phone number cannot exceed 20 characters'),
  body('address').optional().trim().isLength({ max: 200 }).withMessage('Address cannot exceed 200 characters'),
  body('isVerified').optional().isBoolean().withMessage('isVerified must be a boolean'),
  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
  body('isProfileComplete').optional().isBoolean().withMessage('isProfileComplete must be a boolean')
];


// All routes in this router require admin authentication
router.use(protect, requireAdmin); // Removed requireVerification as admin role implies verification for login

// Dashboard
router.get('/dashboard', getDashboardStats); // Renamed from '/dashboard'

// User management
router.get('/users', getAllUsers);
router.get('/users/:userId', getUserById);
router.put('/users/:userId', validateUserUpdate, updateUser);
router.delete('/users/:userId', deleteUser);

// Employer management
router.get('/employers', getAllEmployers);
router.get('/employers/:employerId', getEmployerById);
router.put('/employers/:employerId', validateEmployerUpdate, updateEmployer);
router.delete('/employers/:employerId', deleteEmployer);
// Admin can upload logo for a specific employer (by ID)
router.post('/employers/:employerId/upload-logo', uploadLogoMiddleware, uploadEmployerLogo);


// Job management
router.get('/jobs', getAllJobs); // Admin can view all jobs, including inactive/expired ones

// Application management
router.get('/applications', getAllApplications);

module.exports = router;
