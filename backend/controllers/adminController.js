const User = require('../models/User');
const Employer = require('../models/Employer');
const Job = require('../models/Job');
const Application = require('../models/Application');
const asyncHandler = require('../utils/asyncHandler'); // Import the async handler
const { deleteFile, getFileUrl } = require('../middleware/uploadMiddleware'); // For logo deletion

// --- User Management (Admin Only) ---

/**
 * @desc Get all users (job seekers and other admins) with pagination and search
 * @route GET /api/admin/users
 * @access Private (Admin Only)
 */
const getAllUsers = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const search = req.query.search;
  const role = req.query.role; // Filter by 'user' or 'admin'

  // Basic validation for pagination
  if (page < 1 || limit < 1 || limit > 100) {
    return res.status(400).json({ success: false, error: 'Invalid page or limit parameter.' });
  }

  const filter = {};
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }
  if (role) {
    const allowedRoles = ['user', 'admin'];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ success: false, error: 'Invalid role filter. Must be "user" or "admin".' });
    }
    filter.role = role;
  }

  const skip = (page - 1) * limit;

  const users = await User.find(filter)
    .select('-password -verificationToken -resetPasswordToken -resetPasswordExpire')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('skills'); // Populate skills for user details

  const total = await User.countDocuments(filter);
  const totalPages = Math.ceil(total / limit);

  res.json({
    success: true,
    data: {
      users,
      pagination: {
        currentPage: page,
        totalPages,
        totalUsers: total,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    }
  });
});

/**
 * @desc Get single user by ID
 * @route GET /api/admin/users/:userId
 * @access Private (Admin Only)
 */
const getUserById = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const user = await User.findById(userId)
    .select('-password -verificationToken -resetPasswordToken -resetPasswordExpire')
    .populate('skills');

  if (!user) {
    return res.status(404).json({ success: false, error: 'User not found.' });
  }

  res.json({ success: true, data: { user } });
});

/**
 * @desc Update user details (Admin)
 * @route PUT /api/admin/users/:userId
 * @access Private (Admin Only)
 */
const updateUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const updateData = req.body; // Expects fields like name, email, role, isVerified, etc.

  // Prevent admin from changing their own role to non-admin or deleting their own account via this endpoint.
  // This is a safety measure. The `deleteUser` function also needs specific checks if applicable.
  if (req.user._id.toString() === userId && updateData.role && updateData.role !== 'admin') {
    return res.status(403).json({ success: false, error: 'An admin cannot change their own role to non-admin via this endpoint.' });
  }

  const user = await User.findByIdAndUpdate(
    userId,
    updateData,
    { new: true, runValidators: true } // Return updated doc, run schema validators
  ).select('-password -verificationToken -resetPasswordToken -resetPasswordExpire')
   .populate('skills');

  if (!user) {
    return res.status(404).json({ success: false, error: 'User not found.' });
  }

  // Recalculate isProfileComplete based on the virtual if profile fields were updated
  user.isProfileComplete = user.profileCompletion === 100;
  await user.save({ validateBeforeSave: false }); // Save again without full validation just for profileComplete

  res.json({ success: true, message: 'User updated successfully', data: { user } });
});

/**
 * @desc Delete user account (Admin)
 * @route DELETE /api/admin/users/:userId
 * @access Private (Admin Only)
 */
const deleteUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  // Prevent admin from deleting their own account
  if (req.user._id.toString() === userId) {
    return res.status(403).json({ success: false, error: 'An admin cannot delete their own account.' });
  }

  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ success: false, error: 'User not found.' });
  }

  // Delete user's applications
  await Application.deleteMany({ applicant: userId });
  console.log(`✅ All applications for user ${userId} deleted by admin.`);

  // Delete user's resume if exists
  if (user.resumeUrl) {
    const filename = user.resumeUrl.split('/').pop();
    try {
      await deleteFile(filename);
      console.log(`✅ Resume file ${filename} deleted for user ${userId} by admin.`);
    } catch (fileError) {
      console.warn(`⚠️ Could not delete resume file for user ${userId}:`, fileError.message);
    }
  }

  // Delete user document
  await user.deleteOne(); // Use deleteOne()
  console.log(`✅ User ${userId} deleted by admin.`);

  res.json({ success: true, message: 'User deleted successfully' });
});

// --- Employer Management (Admin Only) ---

/**
 * @desc Get all employers with pagination and search
 * @route GET /api/admin/employers
 * @access Private (Admin Only)
 */
const getAllEmployers = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const search = req.query.search;

  if (page < 1 || limit < 1 || limit > 100) {
    return res.status(400).json({ success: false, error: 'Invalid page or limit parameter.' });
  }

  const filter = {};
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } }, // Contact person name
      { email: { $regex: search, $options: 'i' } },
      { company: { $regex: search, $options: 'i' } } // Company name
    ];
  }

  const skip = (page - 1) * limit;

  const employers = await Employer.find(filter)
    .select('-password -verificationToken -resetPasswordToken -resetPasswordExpire')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Employer.countDocuments(filter);
  const totalPages = Math.ceil(total / limit);

  res.json({
    success: true,
    data: {
      employers,
      pagination: {
        currentPage: page,
        totalPages,
        totalEmployers: total,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    }
  });
});

/**
 * @desc Get single employer by ID
 * @route GET /api/admin/employers/:employerId
 * @access Private (Admin Only)
 */
const getEmployerById = asyncHandler(async (req, res) => {
  const { employerId } = req.params;

  const employer = await Employer.findById(employerId)
    .select('-password -verificationToken -resetPasswordToken -resetPasswordExpire');

  if (!employer) {
    return res.status(404).json({ success: false, error: 'Employer not found.' });
  }

  res.json({ success: true, data: { employer } });
});

/**
 * @desc Update employer details (Admin)
 * @route PUT /api/admin/employers/:employerId
 * @access Private (Admin Only)
 */
const updateEmployer = asyncHandler(async (req, res) => {
  const { employerId } = req.params;
  const updateData = req.body; // Can include any field from employer schema

  const employer = await Employer.findByIdAndUpdate(
    employerId,
    updateData,
    { new: true, runValidators: true }
  ).select('-password -verificationToken -resetPasswordToken -resetPasswordExpire');

  if (!employer) {
    return res.status(404).json({ success: false, error: 'Employer not found.' });
  }

  // Recalculate isProfileComplete based on the virtual if profile fields were updated
  employer.isProfileComplete = employer.profileCompletion === 100;
  await employer.save({ validateBeforeSave: false });

  res.json({ success: true, message: 'Employer updated successfully', data: { employer } });
});

/**
 * @desc Delete employer account (Admin)
 * @route DELETE /api/admin/employers/:employerId
 * @access Private (Admin Only)
 */
const deleteEmployer = asyncHandler(async (req, res) => {
  const { employerId } = req.params;

  const employer = await Employer.findById(employerId);
  if (!employer) {
    return res.status(404).json({ success: false, error: 'Employer not found.' });
  }

  // Delete employer's jobs
  await Job.deleteMany({ employer: employerId }); // Correctly references 'employer' field in Job model
  console.log(`✅ All jobs posted by employer ${employerId} deleted by admin.`);

  // Delete company logo if exists
  if (employer.companyLogo) {
    const filename = employer.companyLogo.split('/').pop();
    try {
      await deleteFile(filename);
      console.log(`✅ Company logo ${filename} deleted for employer ${employerId} by admin.`);
    } catch (fileError) {
      console.warn(`⚠️ Could not delete company logo for employer ${employerId}:`, fileError.message);
    }
  }

  // Delete employer document
  await employer.deleteOne();
  console.log(`✅ Employer ${employerId} deleted by admin.`);

  res.json({ success: true, message: 'Employer deleted successfully' });
});

/**
 * @desc Upload company logo for a specific employer (Admin initiated)
 * @route POST /api/admin/employers/:employerId/upload-logo
 * @access Private (Admin Only)
 */
const uploadEmployerLogo = asyncHandler(async (req, res) => {
  const { employerId } = req.params;

  if (!req.file) {
    return res.status(400).json({ success: false, error: 'No file uploaded. Please select a logo image.' });
  }

  const employer = await Employer.findById(employerId);

  if (!employer) {
    return res.status(404).json({ success: false, error: 'Employer not found.' });
  }

  // Delete old logo if exists
  if (employer.companyLogo) {
    const oldFilename = employer.companyLogo.split('/').pop();
    if (oldFilename !== req.file.filename) { // Prevent deleting if it's the same file
      try {
        await deleteFile(oldFilename);
        console.log(`✅ Old company logo ${oldFilename} deleted for employer ${employerId}.`);
      } catch (fileError) {
        console.warn(`⚠️ Could not delete old logo file for employer ${employerId}:`, fileError.message);
      }
    }
  }

  employer.companyLogo = getFileUrl(req.file.filename);
  employer.isProfileComplete = employer.profileCompletion === 100; // Update profile completeness
  await employer.save({ validateBeforeSave: true });

  res.json({
    success: true,
    message: 'Company logo uploaded successfully',
    data: { employer, logoUrl: employer.companyLogo }
  });
});


// --- Job Management (Admin Only) ---

/**
 * @desc Get all jobs with pagination and search (Admin)
 * @route GET /api/admin/jobs
 * @access Private (Admin Only)
 * @param {string} req.query.search
 * @param {string} req.query.status - 'active' or 'inactive'
 * @param {boolean} req.query.includeExpired - if true, shows expired jobs too
 */
const getAllJobs = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const search = req.query.search;
  const status = req.query.status; // 'active' or 'inactive'
  const includeExpired = req.query.includeExpired === 'true'; // Admin can view expired jobs

  if (page < 1 || limit < 1 || limit > 100) {
    return res.status(400).json({ success: false, error: 'Invalid page or limit parameter.' });
  }

  const filter = {};
  if (search) {
    filter.$or = [ // Use $or for broader search
      { title: { $regex: search, $options: 'i' } },
      { company: { $regex: search, $options: 'i' } },
      { location: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }
  if (status && (status === 'active' || status === 'inactive')) {
    filter.isActive = status === 'active';
  }

  // For admin, we might want to see expired jobs explicitly if requested
  if (!includeExpired) {
    filter.applicationDeadline = { $gte: new Date() }; // Only include non-expired jobs by default for admin
  }


  const skip = (page - 1) * limit;

  const jobs = await Job.find(filter)
    .populate('employer', 'companyName companyLogo email') // Populate employer details from 'employer' field
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Job.countDocuments(filter);
  const totalPages = Math.ceil(total / limit);

  res.json({
    success: true,
    data: {
      jobs,
      pagination: {
        currentPage: page,
        totalPages,
        totalJobs: total,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    }
  });
});

// --- Application Management (Admin Only) ---

/**
 * @desc Get all applications with pagination and status filter (Admin)
 * @route GET /api/admin/applications
 * @access Private (Admin Only)
 */
const getAllApplications = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const status = req.query.status || 'all'; // Filter by application status

  if (page < 1 || limit < 1 || limit > 100) {
    return res.status(400).json({ success: false, error: 'Invalid page or limit parameter.' });
  }

  const filter = {};
  if (status !== 'all') {
    const allowedStatuses = ['pending', 'reviewed', 'shortlisted', 'rejected', 'hired'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ success: false, error: `Invalid application status filter. Allowed: ${allowedStatuses.join(', ')}` });
    }
    filter.status = status;
  }

  const skip = (page - 1) * limit;
  
  const applications = await Application.find(filter)
    .populate('job', 'title company location') // Populate relevant job info
    .populate('applicant', 'name email phone') // Populate relevant applicant info
    .populate('employer', 'companyName email') // Populate relevant employer info
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Application.countDocuments(filter);
  const totalPages = Math.ceil(total / limit);

  res.json({
    success: true,
    data: {
      applications,
      pagination: {
        currentPage: page,
        totalPages,
        totalApplications: total,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    }
  });
});

// --- Dashboard Statistics (Admin Only) ---

/**
 * @desc Get dashboard statistics (Admin)
 * @route GET /api/admin/dashboard-stats
 * @access Private (Admin Only)
 */
const getDashboardStats = asyncHandler(async (req, res) => {
  // Get total counts
  const totalUsers = await User.countDocuments();
  const totalEmployers = await Employer.countDocuments();
  const totalJobs = await Job.countDocuments({ isActive: true, applicationDeadline: { $gte: new Date() } }); // Only active, non-expired jobs
  const totalApplications = await Application.countDocuments();

  // Get recent activities (last 5 each)
  const recentUsers = await User.find()
    .select('name email role createdAt')
    .sort({ createdAt: -1 })
    .limit(5);

  const recentEmployers = await Employer.find()
    .select('companyName email createdAt')
    .sort({ createdAt: -1 })
    .limit(5);

  const recentJobs = await Job.find({ isActive: true, applicationDeadline: { $gte: new Date() } }) // Only active, non-expired
    .populate('employer', 'companyName') // Populate company name for clarity
    .select('title company createdAt')
    .sort({ createdAt: -1 })
    .limit(5);

  const recentApplications = await Application.find()
    .populate('job', 'title') // Only need job title for recent applications
    .populate('applicant', 'name') // Only need applicant name
    .select('status createdAt')
    .sort({ createdAt: -1 })
    .limit(5);

  // Get application status counts using aggregation
  const applicationStats = await Application.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    },
    {
      $project: {
        _id: 0,
        status: '$_id',
        count: 1
      }
    }
  ]);

  const statusCounts = {
    pending: 0,
    reviewed: 0,
    shortlisted: 0,
    rejected: 0,
    hired: 0
  };

  applicationStats.forEach(stat => {
    statusCounts[stat.status] = stat.count;
  });

  res.json({
    success: true,
    data: {
      stats: {
        totalUsers,
        totalEmployers,
        totalJobs,
        totalApplications
      },
      statusCounts,
      recentUsers,
      recentEmployers, // Added recent employers
      recentJobs,
      recentApplications
    }
  });
});


module.exports = {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getAllEmployers,
  getEmployerById,
  updateEmployer,
  deleteEmployer,
  uploadEmployerLogo, // Keep this for admin-initiated logo uploads
  getAllJobs, // Admin version to see all jobs (active/inactive/expired if requested)
  getAllApplications,
  getDashboardStats
};
