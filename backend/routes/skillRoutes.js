const express = require('express');
const { body, query } = require('express-validator');
const router = express.Router();

const {
  getSkills,
  getSkillById,
  addSkill,
  updateSkill,
  deleteSkill
} = require('../controllers/skillController');

const { protect, requireAdmin, optionalAuth } = require('../middleware/authMiddleware');

// Validation middleware for skills
const validateSkillCreation = [
  body('name')
    .notEmpty().withMessage('Skill name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Skill name must be between 2 and 100 characters')
    .trim(),
  body('category').optional()
    .isLength({ max: 100 }).withMessage('Category cannot exceed 100 characters')
    .trim()
];

const validateSkillUpdate = [
  body('name').optional()
    .isLength({ min: 2, max: 100 }).withMessage('Skill name must be between 2 and 100 characters')
    .trim(),
  body('category').optional()
    .isLength({ max: 100 }).withMessage('Category cannot exceed 100 characters')
    .trim(),
  body('isApproved').optional().isBoolean().withMessage('isApproved must be a boolean')
];

// Publicly accessible skill search/listing (optionally authenticated for admin view)
router.get('/', optionalAuth, getSkills); // Allow anyone to search skills, but admins see more
router.get('/:id', optionalAuth, getSkillById);

// Protected routes for adding/modifying skills
router.post('/', protect, validateSkillCreation, addSkill); // Any authenticated user can suggest a skill (might need admin approval)
router.put('/:id', protect, requireAdmin, validateSkillUpdate, updateSkill); // Only admin can update
router.delete('/:id', protect, requireAdmin, deleteSkill); // Only admin can delete

module.exports = router;
