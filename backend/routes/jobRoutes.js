const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const {
  createJob,
  getAllJobs,
  getJobById,
  updateJob,
  deleteJob,
  getJobsByEmployer,
  getFeaturedJobs,
  searchJobs
} = require('../controllers/jobController');

const {
  getUserFromToken,
  requireVerification,
  requireEmployer,
  requireAdmin,
  optionalAuth
} = require('../middleware/authMiddleware');

// Validation middleware
const validateJob = [
  body('title').trim().isLength({ min: 5, max: 200 }).withMessage('Job title must be between 5 and 200 characters'),
  body('description').trim().isLength({ min: 20, max: 5000 }).withMessage('Job description must be between 20 and 5000 characters'),
  body('company').trim().isLength({ min: 2, max: 200 }).withMessage('Company name must be between 2 and 200 characters'),
  body('location').trim().isLength({ min: 2, max: 200 }).withMessage('Location must be between 2 and 200 characters'),
  body('jobType').isIn(['full-time', 'part-time', 'remote', 'contract', 'internship']).withMessage('Invalid job type'),
  body('experienceLevel').optional().isIn(['entry', 'junior', 'mid', 'senior', 'executive']).withMessage('Invalid experience level'),
  body('salary').optional().isNumeric().withMessage('Salary must be a number'),
  body('externalApplyUrl').optional().isURL().withMessage('Invalid URL format')
];

// Public routes
router.get('/', optionalAuth, getAllJobs);
router.get('/featured', getFeaturedJobs);
router.get('/search', searchJobs);
router.get('/:id', optionalAuth, getJobById);

// Protected routes
router.post('/', getUserFromToken, requireVerification, requireEmployer, validateJob, createJob);
router.put('/:id', getUserFromToken, requireVerification, validateJob, updateJob);
router.delete('/:id', getUserFromToken, requireVerification, deleteJob);

// Employer routes
router.get('/employer/:employerId', getUserFromToken, requireVerification, getJobsByEmployer);

module.exports = router; 