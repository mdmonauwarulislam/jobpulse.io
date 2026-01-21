const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const {
  submitApplication,
  getApplicationsForJob,
  getUserApplications,
  updateApplicationStatus,
  withdrawApplication,

  getApplicationById,
  checkApplicationStatus
} = require('../controllers/applicationController');

const {
  protect,
  requireVerification,
  requireJobSeeker,
  requireEmployer,
  requireAdmin
} = require('../middleware/authMiddleware');

const { uploadResume } = require('../middleware/uploadMiddleware');

// Validation middleware
const validateApplication = [
  body('jobId').isMongoId().withMessage('Invalid job ID'),
  body('coverLetter').optional().trim().isLength({ max: 2000 }).withMessage('Cover letter cannot exceed 2000 characters')
];

const validateStatusUpdate = [
  body('status').isIn(['pending', 'reviewed', 'shortlisted', 'rejected', 'hired']).withMessage('Invalid status'),
  body('notes').optional().trim().isLength({ max: 1000 }).withMessage('Notes cannot exceed 1000 characters')
];

// Job seeker routes
router.post('/', protect, requireVerification, requireJobSeeker, uploadResume, validateApplication, submitApplication);
router.get('/check/:jobId', protect, checkApplicationStatus);
router.get('/user', protect, requireVerification, requireJobSeeker, getUserApplications);
router.delete('/:applicationId', protect, requireVerification, requireJobSeeker, withdrawApplication);

// Employer/Admin routes
router.get('/job/:jobId', protect, requireVerification, getApplicationsForJob);
router.put('/:applicationId/status', protect, requireVerification, validateStatusUpdate, updateApplicationStatus);
router.get('/:applicationId', protect, requireVerification, (req, res, next) => {
  if (!req.params.applicationId.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(404).json({ success: false, error: 'Application not found' });
  }
  next();
}, getApplicationById);

module.exports = router; 