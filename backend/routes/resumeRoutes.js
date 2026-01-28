const express = require('express');
const router = express.Router();

const {
  getResumes,
  getResume,
  createResume,
  updateResume,
  deleteResume
} = require('../controllers/resumeController');

const {
  protect,
  requireVerification,
  optionalAuth
} = require('../middleware/authMiddleware');

// Base routes for /api/resumes
router
  .route('/')
  .get(protect, getResumes)
  .post(protect, createResume);

router
  .route('/:id')
  .get(optionalAuth, getResume)
  .put(protect, updateResume)
  .delete(protect, deleteResume);

module.exports = router;
