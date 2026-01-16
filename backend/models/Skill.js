const mongoose = require('mongoose');

/**
 * @swagger
 * components:
 * schemas:
 * Skill:
 * type: object
 * required:
 * - name
 * properties:
 * name:
 * type: string
 * description: The name of the skill (e.g., "JavaScript", "Project Management").
 * minLength: 2
 * maxLength: 100
 * category:
 * type: string
 * description: The category of the skill (e.g., "Programming Languages", "Soft Skills").
 * maxLength: 100
 * isApproved:
 * type: boolean
 * description: Whether the skill has been approved by an admin. New user-added skills might need approval.
 * default: false
 * example:
 * name: React
 * category: Frontend Frameworks
 */
const skillSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Skill name is required'],
    unique: true, 
    trim: true,
    minlength: [2, 'Skill name must be at least 2 characters'],
    maxlength: [100, 'Skill name cannot exceed 100 characters']
  },
  category: {
    type: String,
    trim: true,
    maxlength: [100, 'Skill category cannot exceed 100 characters']
  },
  isApproved: {
    type: Boolean,
    default: false, 
    select: false 
  },
}, {
  timestamps: true 
});

// Create a text index on the name and category for efficient searching
skillSchema.index({ name: 'text', category: 'text' });

module.exports = mongoose.model('Skill', skillSchema);
