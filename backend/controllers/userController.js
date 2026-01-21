const User = require('../models/User');
const CandidateProfile = require('../models/CandidateProfile');
const Application = require('../models/Application');
const asyncHandler = require('../utils/asyncHandler');
const { deleteFile, getFileUrl } = require('../middleware/uploadMiddleware');

const getUserProfile = asyncHandler(async (req, res) => {
  // req.profile is attached by protect middleware
  const candidateProfile = req.profile;

  if (!candidateProfile) {
     // If profile missing for some reason, maybe return basic user info or error
     // For now, let's error as it should exist for a valid candidate
     return res.status(404).json({ success: false, error: 'Candidate profile not found.' });
  }

  // Merge User data
  const userData = {
    _id: req.user._id,
    userId: req.user.userId,
    name: req.user.name,
    email: req.user.email,
    isVerified: req.user.isVerified
  };

  res.json({
    success: true,
    data: { 
        user: { ...userData, ...candidateProfile.toObject() }, 
        profileCompletion: candidateProfile.profileCompletion 
    }
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

  const candidateProfile = await CandidateProfile.findOne({ user: req.user._id });
  const user = await User.findById(req.user._id);

  if (!candidateProfile || !user) {
    return res.status(404).json({ success: false, error: 'User or Profile not found.' });
  }

  // Update User fields
  if (name !== undefined) user.name = name;
  await user.save({ validateBeforeSave: false });

  // Update Profile fields
  // Update Profile fields
  if (phone !== undefined) candidateProfile.phone = phone;
  if (summary !== undefined) candidateProfile.summary = summary;
  
  if (req.body.location) {
     candidateProfile.location = { ...candidateProfile.location, ...req.body.location };
  }
  // If address was sent, try to map it to location city (fallback) or ignore? 
  // User asked to replace address with location.
  if (req.body.profilePic !== undefined) candidateProfile.profilePic = req.body.profilePic; // Allow updating URL directly if needed

  try {
    if (education !== undefined) {
      candidateProfile.education = Array.isArray(education) ? education : JSON.parse(education);
    }
    if (experience !== undefined) {
      candidateProfile.experience = Array.isArray(experience) ? experience : JSON.parse(experience);
    }
    if (skills !== undefined) {
      candidateProfile.skills = Array.isArray(skills) ? skills : JSON.parse(skills);
    }
  } catch (parseError) {
    console.error('❌ JSON parsing error for education, experience, or skills:', parseError);
    return res.status(400).json({ success: false, error: 'Invalid format for education, experience, or skills. Please ensure they are valid JSON arrays.' });
  }

  // Save to update virtual calculation
  await candidateProfile.save();
  
  candidateProfile.isProfileComplete = candidateProfile.profileCompletion === 100;
  await candidateProfile.save();

  const updatedProfile = await CandidateProfile.findOne({ user: req.user._id });

  const userData = {
    _id: user._id,
    userId: user.userId,
    name: user.name,
    email: user.email,
    isVerified: user.isVerified
  };

  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: { 
        user: { ...userData, ...updatedProfile.toObject() }, 
        profileCompletion: updatedProfile.profileCompletion 
    }
  });
});

const uploadProfilePic = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      error: 'No file uploaded. Please select a profile picture.'
    });
  }

  const candidateProfile = await CandidateProfile.findOne({ user: req.user._id });

  if (!candidateProfile) {
    return res.status(404).json({ success: false, error: 'Candidate profile not found.' });
  }

  if (candidateProfile.profilePic) {
    const oldFilename = candidateProfile.profilePic.split('/').pop();
    const newFilename = req.file.filename;
    if (oldFilename !== newFilename) { 
      try {
        await deleteFile(oldFilename); 
        console.log(`✅ Old profile pic ${oldFilename} deleted.`);
      } catch (fileError) {
        console.warn(`⚠️ Could not delete old profile pic ${oldFilename}:`, fileError.message);
      }
    }
  }

  candidateProfile.profilePic = req.file.path; // Cloudinary URL
  await candidateProfile.save();
  
  // Update completion status
  candidateProfile.isProfileComplete = candidateProfile.profileCompletion === 100;
  await candidateProfile.save();

  res.json({
    success: true,
    message: 'Profile picture uploaded successfully!',
    data: {
      profilePic: candidateProfile.profilePic
    }
  });
});

const uploadResume = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      error: 'No file uploaded. Please select a resume file.'
    });
  }

  const candidateProfile = await CandidateProfile.findOne({
    user: req.user._id
  });

  if (!candidateProfile) {
    return res.status(404).json({
      success: false,
      error: 'Candidate profile not found.'
    });
  }

  /* ---------------- DELETE OLD RESUME ---------------- */
  if (candidateProfile.resumePublicId) {
    await deleteFile(candidateProfile.resumePublicId, 'raw');
  } else if (candidateProfile.resumeUrl) {
    // Fallback for VERY old records
    try {
      const url = new URL(candidateProfile.resumeUrl);
      const parts = url.pathname.split('/');
      const folder = parts[parts.length - 2];
      const filename = parts[parts.length - 1].split('.')[0];
      const publicId = `${folder}/${filename}`;

      await deleteFile(publicId, 'raw');
    } catch (err) {
      console.warn('⚠️ Could not parse old resume URL');
    }
  }

  /* ---------------- SAVE NEW RESUME ---------------- */
  candidateProfile.resumeUrl = req.file.path;        // Cloudinary URL
  candidateProfile.resumePublicId = req.file.filename; // FULL public_id
  candidateProfile.isProfileComplete =
    candidateProfile.profileCompletion === 100;

  await candidateProfile.save();

  res.status(200).json({
    success: true,
    message: 'Resume uploaded successfully!',
    data: {
      resumeUrl: candidateProfile.resumeUrl
    }
  });
});

/* ------------------------------------------------ */

const deleteResume = asyncHandler(async (req, res) => {
  const candidateProfile = await CandidateProfile.findOne({
    user: req.user._id
  });

  if (!candidateProfile) {
    return res.status(404).json({
      success: false,
      error: 'Candidate profile not found.'
    });
  }

  if (!candidateProfile.resumePublicId) {
    return res.status(400).json({
      success: false,
      error: 'No resume found to delete.'
    });
  }

  await deleteFile(candidateProfile.resumePublicId, 'raw');

  candidateProfile.resumeUrl = undefined;
  candidateProfile.resumePublicId = undefined;
  candidateProfile.isProfileComplete =
    candidateProfile.profileCompletion === 100;

  await candidateProfile.save();

  res.status(200).json({
    success: true,
    message: 'Resume deleted successfully!'
  });
});


const getUserApplications = asyncHandler(async (req, res) => {
  // Application.applicant refs User (ObjectId).
  // req.user._id is the User ObjectId.
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
  const candidateProfile = await CandidateProfile.findOne({ user: req.user._id });

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
  
  if (candidateProfile && candidateProfile.resumeUrl) {
    const filename = candidateProfile.resumeUrl.split('/').pop();
    try {
      await deleteFile(filename);
      console.log(`✅ Resume file ${filename} deleted during account deletion.`);
    } catch (fileError) {
      console.warn(`⚠️ Could not delete resume file ${filename} during account deletion:`, fileError.message);
    }
  }

  await Application.deleteMany({ applicant: req.user._id });
  console.log(`✅ All applications for user ${req.user._id} deleted.`);

  if (candidateProfile) {
    await CandidateProfile.findByIdAndDelete(candidateProfile._id);
  }

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
  uploadProfilePic,
  uploadResume,
  deleteResume,
  getUserApplications,
  getUserStats,
  changePassword,
  deleteUserAccount
};
