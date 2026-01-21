const express = require('express');
const { body, param, query } = require('express-validator'); 
const router = express.Router();

const {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getAllEmployerProfiles,
  getEmployerProfileById,
  updateEmployerProfile,
  deleteEmployerProfile,
  uploadEmployerProfileLogo, 
  getAllJobs, 
  getAllApplications,
  getDashboardStats,
  getAuditLogs,
  getAllNotifications
} = require('../controllers/adminController');

const {
  protect, 
  requireAdmin,
} = require('../middleware/authMiddleware');

const { uploadLogo: uploadLogoMiddleware } = require('../middleware/uploadMiddleware');

const validateUserUpdate = [
  param('userId').isMongoId().withMessage('Invalid User ID format.'),
  body('name').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  body('email').optional().isEmail().normalizeEmail().withMessage('Please enter a valid email'),
  body('role').optional().isIn(['user', 'admin']).withMessage('Invalid role provided.').trim(),
  body('isVerified').optional().isBoolean().withMessage('isVerified must be a boolean'),
  body('isProfileComplete').optional().isBoolean().withMessage('isProfileComplete must be a boolean'),
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


router.use(protect, requireAdmin); 

router.get('/dashboard', getDashboardStats); 

router.get('/users', getAllUsers);
router.get('/users/:userId', getUserById);
router.put('/users/:userId', validateUserUpdate, updateUser);
router.delete('/users/:userId', deleteUser);

router.get('/employers', getAllEmployerProfiles);
router.get('/employers/:employerId', getEmployerProfileById);
router.put('/employers/:employerId', validateEmployerUpdate, updateEmployerProfile);
router.delete('/employers/:employerId', deleteEmployerProfile);
router.post('/employers/:employerId/upload-logo', uploadLogoMiddleware, uploadEmployerProfileLogo);


router.get('/jobs', getAllJobs); 

router.get('/applications', getAllApplications);
router.patch('/applications/:applicationId/status',
  param('applicationId').isMongoId().withMessage('Invalid Application ID format.'),
  body('status').isIn(['pending', 'reviewed', 'shortlisted', 'rejected', 'hired']).withMessage('Invalid status value.'),
  requireAdmin,
  require('../controllers/adminController').updateApplicationStatus
);

router.get('/audit-logs', getAuditLogs);

router.get('/notifications', getAllNotifications);

module.exports = router;
