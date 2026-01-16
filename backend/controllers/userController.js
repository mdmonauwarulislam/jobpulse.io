const User = require('../models/User');
const Application = require('../models/Application');
const asyncHandler = require('../utils/asyncHandler');
const { deleteFile, getFileUrl } = require('../middleware/uploadMiddleware');

const getUserProfile = asyncHandler(async (req, res) => {
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

  if (name !== undefined) user.name = name;
  if (phone !== undefined) user.phone = phone;
  if (address !== undefined) user.address = address;
  if (summary !== undefined) user.summary = summary;

  try {
    if (education !== undefined) {
      user.education = Array.isArray(education) ? education : JSON.parse(education);
    }
    if (experience !== undefined) {
      user.experience = Array.isArray(experience) ? experience : JSON.parse(experience);
    }
    if (skills !== undefined) {
      user.skills = Array.isArray(skills) ? skills : JSON.parse(skills);
    }
  } catch (parseError) {
    console.error('❌ JSON parsing error for education, experience, or skills:', parseError);
    return res.status(400).json({ success: false, error: 'Invalid format for education, experience, or skills. Please ensure they are valid JSON arrays.' });
  }

  user.isProfileComplete = user.profileCompletion === 100;

  await user.save({ validateBeforeSave: true });

  const updatedUser = await User.findById(user._id)
    .select('-password -verificationToken -resetPasswordToken -resetPasswordExpire')
    .populate('skills');

  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: { user: updatedUser, profileCompletion: updatedUser.profileCompletion }
  });
});

const uploadResume = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      error: 'No file uploaded. Please select a resume file.'
    });
  }

  const user = await User.findById(req.user._id);

  if (!user) {
    return res.status(404).json({ success: false, error: 'User not found.' });
  }

  if (user.resumeUrl) {
    const oldFilename = user.resumeUrl.split('/').pop();
    const newFilename = req.file.filename;
    if (oldFilename !== newFilename) { 
      try {
        await deleteFile(oldFilename); 
        console.log(`✅ Old resume file ${oldFilename} deleted successfully.`);
      } catch (fileError) {
        console.warn(`⚠️ Could not delete old resume file ${oldFilename}:`, fileError.message);
      }
    }
  }

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

  const filename = user.resumeUrl.split('/').pop();
  try {
    await deleteFile(filename); 
    console.log(`✅ Resume file ${filename} deleted successfully from storage.`);
  } catch (fileError) {
    console.warn(`⚠️ Could not delete resume file ${filename} from storage:`, fileError.message);
  }

  user.resumeUrl = undefined;
  await user.save({ validateBeforeSave: true });

  res.json({
    success: true,
    message: 'Resume deleted successfully!'
  });
});

const getUserApplications = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const status = req.query.status || 'all'; 
  const userId = req.user._id;

  if (page < 1 || limit < 1 || limit > 100) { 
    return res.status(400).json({ success: false, error: 'Invalid page or limit parameter.' });
  }
  const filter = { applicant: userId };
  if (status !== 'all') {
    const allowedStatuses = ['pending', 'reviewed', 'shortlisted', 'rejected', 'hired']; 
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ success: false, error: `Invalid application status provided. Allowed values are: ${allowedStatuses.join(', ')}.` });
    }
    filter.status = status;
  }

  const skip = (page - 1) * limit;
  
  const applications = await Application.find(filter)
    .populate('job', 'title company location jobType salary salaryType createdAt')
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

const getUserStats = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const stats = await Application.aggregate([
    { $match: { applicant: userId } }, 
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

  const totalApplications = await Application.countDocuments({ applicant: userId });

  const recentApplications = await Application.find({ applicant: userId })
    .populate('job', 'title company')
    .sort({ createdAt: -1 }) 
    .limit(5);

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

const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select('+password');

  if (!user) {
    return res.status(404).json({ success: false, error: 'User not found.' });
  }

  const isPasswordValid = await user.comparePassword(currentPassword);
  if (!isPasswordValid) {
    return res.status(400).json({
      success: false,
      error: 'Current password is incorrect. Please try again.'
    });
  }
  const isNewPasswordSame = await user.comparePassword(newPassword);
  if (isNewPasswordSame) {
    return res.status(400).json({
      success: false,
      error: 'New password cannot be the same as the current password.'
    });
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: true }); 

  user.clearPasswordResetToken();
  await user.save({ validateBeforeSave: false }); 

  res.json({
    success: true,
    message: 'Password changed successfully!'
  });
});

const deleteUserAccount = asyncHandler(async (req, res) => {
  const { password } = req.body;

  const user = await User.findById(req.user._id).select('+password');

  if (!user) {
    return res.status(404).json({ success: false, error: 'User not found.' });
  }
  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    return res.status(400).json({
      success: false,
      error: 'Incorrect password. Account deletion requires correct password.'
    });
  }
  if (user.resumeUrl) {
    const filename = user.resumeUrl.split('/').pop();
    try {
      await deleteFile(filename);
      console.log(`✅ Resume file ${filename} deleted during account deletion.`);
    } catch (fileError) {
      console.warn(`⚠️ Could not delete resume file ${filename} during account deletion:`, fileError.message);
    }
  }

  await Application.deleteMany({ applicant: req.user._id });
  console.log(`✅ All applications for user ${req.user._id} deleted.`);

  await User.findByIdAndDelete(req.user._id);
  console.log(`✅ User account ${req.user._id} deleted successfully.`);
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
