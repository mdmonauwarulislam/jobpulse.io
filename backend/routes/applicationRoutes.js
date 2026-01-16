const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const {
  submitApplication,
  getApplicationsForJob,
  getUserApplications,
  updateApplicationStatus,
  withdrawApplication,
  getApplicationById
} = require('../controllers/applicationController');

const {
  protect,
  requireVerification,
  requireJobSeeker,
  requireEmployer,
  requireAdmin
} = require('../middleware/authMiddleware');

// Validation middleware
const validateApplication = [
  body('jobId').isMongoId().withMessage('Invalid job ID'),
  body('coverLetter').trim().isLength({ min: 10, max: 2000 }).withMessage('Cover letter must be between 10 and 2000 characters')
];

const validateStatusUpdate = [
  body('status').isIn(['pending', 'reviewed', 'shortlisted', 'rejected', 'hired']).withMessage('Invalid status'),
  body('notes').optional().trim().isLength({ max: 1000 }).withMessage('Notes cannot exceed 1000 characters')
];

// Job seeker routes
router.post('/', protect, requireVerification, requireJobSeeker, validateApplication, submitApplication);
router.get('/user', protect, requireVerification, requireJobSeeker, getUserApplications);
router.delete('/:applicationId', protect, requireVerification, requireJobSeeker, withdrawApplication);

// Employer/Admin routes
router.get('/job/:jobId', protect, requireVerification, getApplicationsForJob);
router.put('/:applicationId/status', protect, requireVerification, validateStatusUpdate, updateApplicationStatus);
router.get('/:applicationId', protect, requireVerification, getApplicationById);

module.exports = router; 