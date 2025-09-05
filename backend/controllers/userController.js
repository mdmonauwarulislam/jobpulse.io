const User = require('../models/User');
const Application = require('../models/Application');
const asyncHandler = require('../utils/asyncHandler'); // Import the new async handler utility
const { deleteFile, getFileUrl } = require('../middleware/uploadMiddleware'); // Assuming this exists

// Get user profile
const getUserProfile = asyncHandler(async (req, res) => {
  // req.user is populated by the 'protect' middleware
  const user = await User.findById(req.user._id)
    .select('-password -verificationToken -resetPasswordToken -resetPasswordExpire')
    .populate('skills');

  if (!user) {
    return res.status(404).json({ success: false, error: 'User profile not found.' });
  }

  res.json({
    success: true,
    data: { user, profileCompletion: user.profileCompletion }
  });
});

// Update user profile
const updateUserProfile = asyncHandler(async (req, res) => {
  const {
    name,
    phone,
    address,
    summary,
    education,
    experience,
    skills 
  } = req.body;

  const user = await User.findById(req.user._id);

  if (!user) {
    return res.status(404).json({ success: false, error: 'User not found.' });
  }

  // Update basic fields if provided
  if (name !== undefined) user.name = name;
  if (phone !== undefined) user.phone = phone;
  if (address !== undefined) user.address = address;
  if (summary !== undefined) user.summary = summary;

  // Handle structured arrays (education, experience)
  // These should ideally be sent as JSON from the frontend.
  // If using multipart/form-data for file uploads, they might come as stringified JSON.
  // We parse them if they are strings.
  try {
    if (education !== undefined) {
      user.education = Array.isArray(education) ? education : JSON.parse(education);
    }
    if (experience !== undefined) {
      user.experience = Array.isArray(experience) ? experience : JSON.parse(experience);
    }
    // For skills, we expect an array of Skill IDs.
    // The actual management (add/remove) of skills will be done via dedicated routes.
    if (skills !== undefined) {
      user.skills = Array.isArray(skills) ? skills : JSON.parse(skills);
    }
  } catch (parseError) {
    console.error('❌ JSON parsing error for education, experience, or skills:', parseError);
    return res.status(400).json({ success: false, error: 'Invalid format for education, experience, or skills. Please ensure they are valid JSON arrays.' });
  }

  // The `isProfileComplete` field is now directly set based on the `profileCompletion` virtual.
  // This ensures consistency between the two.
  user.isProfileComplete = user.profileCompletion === 100;

  // Save the updated user document. `validateBeforeSave: true` ensures schema validations run.
  await user.save({ validateBeforeSave: true });

  // Re-fetch the user to get the latest `profileCompletion` and populated `skills`
  const updatedUser = await User.findById(user._id)
    .select('-password -verificationToken -resetPasswordToken -resetPasswordExpire')
    .populate('skills');

  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: { user: updatedUser, profileCompletion: updatedUser.profileCompletion }
  });
});

// Upload resume
const uploadResume = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      error: 'No file uploaded. Please select a resume file.'
    });
  }

  const user = await User.findById(req.user._id);

  if (!user) {
    // This case should ideally not happen if 'protect' middleware works correctly
    return res.status(404).json({ success: false, error: 'User not found.' });
  }

  // Delete old resume file from storage if a new one is being uploaded and it's different
  if (user.resumeUrl) {
    const oldFilename = user.resumeUrl.split('/').pop();
    const newFilename = req.file.filename;
    if (oldFilename !== newFilename) { // Only delete if the filename has truly changed
      try {
        await deleteFile(oldFilename); // Ensure deleteFile handles non-existent files gracefully
        console.log(`✅ Old resume file ${oldFilename} deleted successfully.`);
      } catch (fileError) {
        console.warn(`⚠️ Could not delete old resume file ${oldFilename}:`, fileError.message);
        // Do not block the request for this warning; proceed with new upload
      }
    }
  }

  // Update user with new resume URL
  user.resumeUrl = getFileUrl(req.file.filename);
  await user.save({ validateBeforeSave: true });

  res.json({
    success: true,
    message: 'Resume uploaded successfully!',
    data: {
      resumeUrl: user.resumeUrl
    }
  });
});

// Delete resume
const deleteResume = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    return res.status(404).json({ success: false, error: 'User not found.' });
  }
  
  if (!user.resumeUrl) {
    return res.status(400).json({
      success: false,
      error: 'No resume found to delete for this user.'
    });
  }

  // Delete file from storage
  const filename = user.resumeUrl.split('/').pop();
  try {
    await deleteFile(filename); // Ensure deleteFile handles non-existent files gracefully
    console.log(`✅ Resume file ${filename} deleted successfully from storage.`);
  } catch (fileError) {
    console.warn(`⚠️ Could not delete resume file ${filename} from storage:`, fileError.message);
    // Proceed even if file deletion fails, as the main goal is to clear the URL in DB
  }

  // Remove resume URL from user document
  user.resumeUrl = undefined;
  await user.save({ validateBeforeSave: true });

  res.json({
    success: true,
    message: 'Resume deleted successfully!'
  });
});

// Get user applications with pagination
const getUserApplications = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const status = req.query.status || 'all'; // Default to 'all'
  const userId = req.user._id;

  // Basic validation for page and limit
  if (page < 1 || limit < 1 || limit > 100) { // Limit to 100 per page to prevent abuse
    return res.status(400).json({ success: false, error: 'Invalid page or limit parameter.' });
  }

  // Build filter
  const filter = { applicant: userId };
  if (status !== 'all') {
    // Ensure status is one of the allowed values for security and data integrity
    const allowedStatuses = ['pending', 'reviewed', 'shortlisted', 'rejected', 'hired']; // Example statuses
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ success: false, error: `Invalid application status provided. Allowed values are: ${allowedStatuses.join(', ')}.` });
    }
    filter.status = status;
  }

  // Calculate pagination
  const skip = (page - 1) * limit;
  
  // Get applications with job details
  const applications = await Application.find(filter)
    .populate('job', 'title company location jobType salary salaryType createdAt') // Populate relevant job fields
    .sort({ createdAt: -1 }) // Sort by most recent
    .skip(skip)
    .limit(limit);

  // Get total count for pagination
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

// Get user application statistics
const getUserStats = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // Get application counts by status using aggregation
  const stats = await Application.aggregate([
    { $match: { applicant: userId } }, // Filter by current user
    {
      $group: {
        _id: '$status', // Group by status field
        count: { $sum: 1 } // Count documents in each group
      }
    },
    {
      $project: { // Reshape output to remove _id and rename to 'status'
        _id: 0,
        status: '$_id',
        count: 1
      }
    }
  ]);

  // Get total applications
  const totalApplications = await Application.countDocuments({ applicant: userId });

  // Get recent applications (last 5)
  const recentApplications = await Application.find({ applicant: userId })
    .populate('job', 'title company') // Populate only necessary job details
    .sort({ createdAt: -1 }) // Sort by most recent
    .limit(5);

  // Format stats into a predictable object, ensuring all statuses are present
  const statusCounts = {
    pending: 0,
    reviewed: 0,
    shortlisted: 0,
    rejected: 0,
    hired: 0
  };

  stats.forEach(stat => {
    statusCounts[stat.status] = stat.count;
  });

  res.json({
    success: true,
    data: {
      totalApplications,
      statusCounts,
      recentApplications
    }
  });
});

// Change password
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  // Input validation for passwords should be done by express-validator on the route level.

  // Get user with password selected (+password ensures it's included despite select: false)
  const user = await User.findById(req.user._id).select('+password');

  if (!user) {
    return res.status(404).json({ success: false, error: 'User not found.' });
  }

  // Verify current password
  const isPasswordValid = await user.comparePassword(currentPassword);
  if (!isPasswordValid) {
    return res.status(400).json({
      success: false,
      error: 'Current password is incorrect. Please try again.'
    });
  }

  // Ensure new password is not the same as current for security and better UX
  const isNewPasswordSame = await user.comparePassword(newPassword);
  if (isNewPasswordSame) {
    return res.status(400).json({
      success: false,
      error: 'New password cannot be the same as the current password.'
    });
  }

  // Update password (pre-save hook will hash it automatically)
  user.password = newPassword;
  await user.save({ validateBeforeSave: true }); // Ensure schema validation runs for password minLength etc.

  // Clear any password reset tokens if present, as password has been successfully changed
  user.clearPasswordResetToken();
  await user.save({ validateBeforeSave: false }); // Save without re-running all validators for this small update

  res.json({
    success: true,
    message: 'Password changed successfully!'
  });
});

// Delete user account
const deleteUserAccount = asyncHandler(async (req, res) => {
  const { password } = req.body;

  // Input validation for password should be done by express-validator on the route level.

  // Get user with password selected
  const user = await User.findById(req.user._id).select('+password');

  if (!user) {
    return res.status(404).json({ success: false, error: 'User not found.' });
  }

  // Verify password for security before deletion
  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    return res.status(400).json({
      success: false,
      error: 'Incorrect password. Account deletion requires correct password.'
    });
  }

  // Delete user's resume file from storage if it exists
  if (user.resumeUrl) {
    const filename = user.resumeUrl.split('/').pop();
    try {
      await deleteFile(filename);
      console.log(`✅ Resume file ${filename} deleted during account deletion.`);
    } catch (fileError) {
      console.warn(`⚠️ Could not delete resume file ${filename} during account deletion:`, fileError.message);
      // Log but don't prevent deletion if file storage fails
    }
  }

  // Delete user's associated applications
  await Application.deleteMany({ applicant: req.user._id });
  console.log(`✅ All applications for user ${req.user._id} deleted.`);

  // Finally, delete the user document from the database
  await User.findByIdAndDelete(req.user._id);
  console.log(`✅ User account ${req.user._id} deleted successfully.`);

  // You might want to invalidate their session/token here (e.g., clear cookie on frontend)
  // For backend, simply returning success is enough.
  res.json({
    success: true,
    message: 'Account and all associated data deleted successfully. We\'re sad to see you go!'
  });
});

module.exports = {
  getUserProfile,
  updateUserProfile,
  uploadResume,
  deleteResume,
  getUserApplications,
  getUserStats,
  changePassword,
  deleteUserAccount
};
