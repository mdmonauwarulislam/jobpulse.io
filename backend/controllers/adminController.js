const User = require('../models/User');
const Employer = require('../models/Employer');
const Job = require('../models/Job');
const Application = require('../models/Application');
const Notification = require('../models/Notification');
const asyncHandler = require('../utils/asyncHandler'); 
const { logAdminAction } = require('../utils/auditLogger');
const AuditLog = require('../models/AuditLog'); 
const { deleteFile, getFileUrl } = require('../middleware/uploadMiddleware'); 

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
  const role = req.query.role; 

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
    .populate('skills');  

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

// --- Notification Management (Admin Only) ---
/**
 * @desc Get all notifications (Admin)
 * @route GET /api/admin/notifications
 * @access Private (Admin Only)
 */
const getAllNotifications = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const search = req.query.search;
  const filter = {};
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { message: { $regex: search, $options: 'i' } }
    ];
  }
  const skip = (page - 1) * limit;
  const notifications = await Notification.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
  const total = await Notification.countDocuments(filter);
  const totalPages = Math.ceil(total / limit);
  res.json({
    success: true,
    data: {
      notifications,
      pagination: {
        currentPage: page,
        totalPages,
        totalNotifications: total,
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
  const updateData = req.body; 

  // Prevent admin from changing their own role to non-admin or deleting their own account via this endpoint.
  // This is a safety measure. The `deleteUser` function also needs specific checks if applicable.
  if (req.user._id.toString() === userId && updateData.role && updateData.role !== 'admin') {
    return res.status(403).json({ success: false, error: 'An admin cannot change their own role to non-admin via this endpoint.' });
  }

  const user = await User.findByIdAndUpdate(
    userId,
    updateData,
    { new: true, runValidators: true } 
  ).select('-password -verificationToken -resetPasswordToken -resetPasswordExpire')
   .populate('skills');

  if (!user) {
    return res.status(404).json({ success: false, error: 'User not found.' });
  }

  // Recalculate isProfileComplete based on the virtual if profile fields were updated
  user.isProfileComplete = user.profileCompletion === 100;
  await user.save({ validateBeforeSave: false }); 

  // Audit log
  await logAdminAction({
    action: 'updateUser',
    performedBy: req.user._id,
    targetType: 'User',
    targetId: userId,
    details: updateData
  });

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
  await user.deleteOne(); 
  console.log(`✅ User ${userId} deleted by admin.`);

  // Audit log
  await logAdminAction({
    action: 'deleteUser',
    performedBy: req.user._id,
    targetType: 'User',
    targetId: userId,
    details: { email: user.email, name: user.name }
  });

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
      { name: { $regex: search, $options: 'i' } }, 
      { email: { $regex: search, $options: 'i' } },
      { company: { $regex: search, $options: 'i' } } 
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
  const updateData = req.body; 

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

  // Audit log
  await logAdminAction({
    action: 'updateEmployer',
    performedBy: req.user._id,
    targetType: 'Employer',
    targetId: employerId,
    details: updateData
  });

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
  await Job.deleteMany({ employer: employerId }); 
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

  // Audit log
  await logAdminAction({
    action: 'deleteEmployer',
    performedBy: req.user._id,
    targetType: 'Employer',
    targetId: employerId,
    details: { email: employer.email, company: employer.company }
  });

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
    if (oldFilename !== req.file.filename) { 
      try {
        await deleteFile(oldFilename);
        console.log(`✅ Old company logo ${oldFilename} deleted for employer ${employerId}.`);
      } catch (fileError) {
        console.warn(`⚠️ Could not delete old logo file for employer ${employerId}:`, fileError.message);
      }
    }
  }

  employer.companyLogo = getFileUrl(req.file.filename);
  employer.isProfileComplete = employer.profileCompletion === 100; 
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
  const status = req.query.status; 
  const includeExpired = req.query.includeExpired === 'true'; 

  if (page < 1 || limit < 1 || limit > 100) {
    return res.status(400).json({ success: false, error: 'Invalid page or limit parameter.' });
  }

  const filter = {};
  if (search) {
    filter.$or = [ 
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
    filter.applicationDeadline = { $gte: new Date() }; 
  }


  const skip = (page - 1) * limit;

  const jobs = await Job.find(filter)
    .populate('employer', 'companyName companyLogo email') 
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
  const status = req.query.status || 'all'; 

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
    .populate('job', 'title company location') 
    .populate('applicant', 'name email phone') 
    .populate('employer', 'companyName email') 
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

  const recentJobs = await Job.find({ isActive: true, applicationDeadline: { $gte: new Date() } }) 
    .populate('employer', 'companyName') 
    .select('title company createdAt')
    .sort({ createdAt: -1 })
    .limit(5);

  const recentApplications = await Application.find()
    .populate('job', 'title') 
    .populate('applicant', 'name') 
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
      recentEmployers, 
      recentJobs,
      recentApplications
    }
  });
});



/**
 * @desc Get audit logs with pagination and filtering (Admin)
 * @route GET /api/admin/audit-logs
 * @access Private (Admin Only)
 */
const getAuditLogs = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const action = req.query.action;
  const targetType = req.query.targetType;

  if (page < 1 || limit < 1 || limit > 100) {
    return res.status(400).json({ success: false, error: 'Invalid page or limit parameter.' });
  }

  const filter = {};
  if (action) filter.action = action;
  if (targetType) filter.targetType = targetType;

  const skip = (page - 1) * limit;

  const logs = await AuditLog.find(filter)
    .populate('performedBy', 'name email role') 
    .sort({ timestamp: -1 })
    .skip(skip)
    .limit(limit);

  const total = await AuditLog.countDocuments(filter);
  const totalPages = Math.ceil(total / limit);

  res.json({
    success: true,
    data: {
      logs,
      pagination: {
        currentPage: page,
        totalPages,
        totalLogs: total,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    }
  });
});


/**
 * @desc Update application status (Admin)
 * @route PATCH /api/admin/applications/:applicationId/status
 * @access Private (Admin Only)
 */
const updateApplicationStatus = asyncHandler(async (req, res) => {
  const { applicationId } = req.params;
  const { status } = req.body;
  const allowedStatuses = ['pending', 'reviewed', 'shortlisted', 'rejected', 'hired'];
  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({ success: false, error: 'Invalid status value.' });
  }
  const application = await Application.findById(applicationId);
  if (!application) {
    return res.status(404).json({ success: false, error: 'Application not found.' });
  }
  application.status = status;
  application.reviewedAt = new Date();
  application.reviewedBy = req.user._id;
  application.reviewedByModel = 'User';
  await application.save();
  await logAdminAction({
    action: 'updateApplicationStatus',
    performedBy: req.user._id,
    targetType: 'Application',
    targetId: applicationId,
    details: { status }
  });
  res.json({ success: true, message: 'Application status updated', data: { application } });
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
  uploadEmployerLogo, 
  getAllJobs, 
  getAllApplications,
  getDashboardStats,
  updateApplicationStatus,
  getAuditLogs,
  getAllNotifications
};
