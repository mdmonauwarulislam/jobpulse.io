const Skill = require('../models/Skill');
const asyncHandler = require('../utils/asyncHandler');

/**
 * @desc Get all skills or search skills by query.
 * @route GET /api/v1/skills
 * @access Public (can be optionally authenticated for more features)
 */
const getSkills = asyncHandler(async (req, res) => {
  const { search, category, page = 1, limit = 10 } = req.query;

  let query = {};
  if (search) {
    // Case-insensitive search on name and category using text index
    query.$text = { $search: search };
  }
  if (category) {
    query.category = new RegExp(category, 'i'); // Case-insensitive exact match for category
  }

  // Only show approved skills to general users/job seekers
  // Admins might need to see unapproved skills, which can be handled by a separate admin route/middleware
  if (req.userType !== 'admin') { // Assuming admin has req.userType === 'admin'
    query.isApproved = true;
  }

  const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
  
  const skills = await Skill.find(query)
    .sort({ name: 1 }) // Sort alphabetically by name
    .skip(skip)
    .limit(parseInt(limit, 10));

  const totalSkills = await Skill.countDocuments(query);
  const totalPages = Math.ceil(totalSkills / parseInt(limit, 10));

  res.status(200).json({
    success: true,
    data: {
      skills,
      pagination: {
        currentPage: parseInt(page, 10),
        totalPages,
        totalSkills,
        hasNextPage: parseInt(page, 10) < totalPages,
        hasPrevPage: parseInt(page, 10) > 1
      }
    }
  });
});

/**
 * @desc Get a single skill by ID
 * @route GET /api/v1/skills/:id
 * @access Public
 */
const getSkillById = asyncHandler(async (req, res) => {
  const skill = await Skill.findById(req.params.id);

  if (!skill) {
    return res.status(404).json({ success: false, error: 'Skill not found.' });
  }

  // If not admin, only show if approved
  if (req.userType !== 'admin' && !skill.isApproved) {
    return res.status(404).json({ success: false, error: 'Skill not found or not approved.' });
  }

  res.status(200).json({
    success: true,
    data: skill
  });
});

/**
 * @desc Add a new skill (can be requested by any authenticated user)
 * @route POST /api/v1/skills
 * @access Private (Auth Required), Admin approval might be needed
 */
const addSkill = asyncHandler(async (req, res) => {
  const { name, category } = req.body;

  // Set isApproved based on user role or default policy
  // For production, you might want to require admin approval for all new skills added by non-admins
  const isApproved = req.userType === 'admin' ? true : false; // Admins can auto-approve

  const skill = await Skill.create({ name, category, isApproved });

  res.status(201).json({
    success: true,
    message: 'Skill added successfully. It may require admin approval before becoming searchable.',
    data: skill
  });
});

/**
 * @desc Update a skill (Admin only)
 * @route PUT /api/v1/skills/:id
 * @access Private (Admin Only)
 */
const updateSkill = asyncHandler(async (req, res) => {
  const { name, category, isApproved } = req.body;

  let skill = await Skill.findById(req.params.id);

  if (!skill) {
    return res.status(404).json({ success: false, error: 'Skill not found.' });
  }

  // Only allow admin to update
  // This check is redundant if `requireAdmin` middleware is used on the route, but good for safety
  if (req.userType !== 'admin') {
    return res.status(403).json({ success: false, error: 'Access denied. Admin privileges required to update skills.' });
  }

  if (name !== undefined) skill.name = name;
  if (category !== undefined) skill.category = category;
  if (isApproved !== undefined) skill.isApproved = isApproved;

  skill = await skill.save({ validateBeforeSave: true }); // Run schema validation

  res.status(200).json({
    success: true,
    message: 'Skill updated successfully.',
    data: skill
  });
});

/**
 * @desc Delete a skill (Admin only)
 * @route DELETE /api/v1/skills/:id
 * @access Private (Admin Only)
 */
const deleteSkill = asyncHandler(async (req, res) => {
  const skill = await Skill.findById(req.params.id);

  if (!skill) {
    return res.status(404).json({ success: false, error: 'Skill not found.' });
  }

  // Only allow admin to delete
  if (req.userType !== 'admin') {
    return res.status(403).json({ success: false, error: 'Access denied. Admin privileges required to delete skills.' });
  }

  await skill.deleteOne(); // Use deleteOne() or deleteMany() instead of remove()

  res.status(200).json({
    success: true,
    message: 'Skill deleted successfully.'
  });
});

module.exports = {
  getSkills,
  getSkillById,
  addSkill,
  updateSkill,
  deleteSkill
};
