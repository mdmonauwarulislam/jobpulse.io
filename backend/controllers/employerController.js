const Employer = require('../models/Employer');
const Job = require('../models/Job'); // Import Job model to query for employer's jobs
const asyncHandler = require('../utils/asyncHandler');
const { deleteFile, getFileUrl } = require('../middleware/uploadMiddleware'); // Assuming logo uploads use similar functions

/**
 * @desc Get employer profile
 * @route GET /api/v1/employers/me
 * @access Private (Employer Only)
 */
const getEmployerProfile = asyncHandler(async (req, res) => {
  // req.user is populated by 'protect' middleware and is an Employer document
  const employer = await Employer.findById(req.user._id)
    .select('-password -verificationToken -resetPasswordToken -resetPasswordExpire -isAdminApproved');

  if (!employer) {
    return res.status(404).json({ success: false, error: 'Employer profile not found.' });
  }

  res.json({
    success: true,
    data: { employer, profileCompletion: employer.profileCompletion }
  });
});

/**
 * @desc Update employer profile
 * @route PUT /api/v1/employers/me
 * @access Private (Employer Only)
 */
const updateEmployerProfile = asyncHandler(async (req, res) => {
  const {
    name, // Contact person name
    company,
    companyDescription,
    companyWebsite,
    phone,
    address
  } = req.body;

  const employer = await Employer.findById(req.user._id);

  if (!employer) {
    return res.status(404).json({ success: false, error: 'Employer not found.' });
  }

  // Update fields if provided
  if (name !== undefined) employer.name = name;
  if (company !== undefined) employer.company = company;
  if (companyDescription !== undefined) employer.companyDescription = companyDescription;
  if (companyWebsite !== undefined) employer.companyWebsite = companyWebsite;
  if (phone !== undefined) employer.phone = phone;
  if (address !== undefined) employer.address = address;

  // Recalculate isProfileComplete based on the virtual
  employer.isProfileComplete = employer.profileCompletion === 100;

  await employer.save({ validateBeforeSave: true });

  // Re-fetch to get accurate profileCompletion after save
  const updatedEmployer = await Employer.findById(employer._id)
    .select('-password -verificationToken -resetPasswordToken -resetPasswordExpire -isAdminApproved');

  res.json({
    success: true,
    message: 'Employer profile updated successfully',
    data: { employer: updatedEmployer, profileCompletion: updatedEmployer.profileCompletion }
  });
});

/**
 * @desc Upload company logo
 * @route POST /api/v1/employers/me/upload-logo
 * @access Private (Employer Only)
 */
const uploadCompanyLogo = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      error: 'No file uploaded. Please select a logo image.'
    });
  }

  const employer = await Employer.findById(req.user._id);

  if (!employer) {
    return res.status(404).json({ success: false, error: 'Employer not found.' });
  }

  // Delete old logo if exists
  if (employer.companyLogo) {
    const oldFilename = employer.companyLogo.split('/').pop();
    if (oldFilename !== req.file.filename) { // Prevent deleting if it's the same file
      try {
        await deleteFile(oldFilename);
        console.log(`✅ Old company logo ${oldFilename} deleted.`);
      } catch (fileError) {
        console.warn(`⚠️ Could not delete old logo file ${oldFilename}:`, fileError.message);
      }
    }
  }

  employer.companyLogo = getFileUrl(req.file.filename);
  // Recalculate isProfileComplete after adding logo
  employer.isProfileComplete = employer.profileCompletion === 100;

  await employer.save({ validateBeforeSave: true });

  res.json({
    success: true,
    message: 'Company logo uploaded successfully',
    data: {
      companyLogo: employer.companyLogo
    }
  });
});

/**
 * @desc Delete company logo
 * @route DELETE /api/v1/employers/me/logo
 * @access Private (Employer Only)
 */
const deleteCompanyLogo = asyncHandler(async (req, res) => {
  const employer = await Employer.findById(req.user._id);

  if (!employer) {
    return res.status(404).json({ success: false, error: 'Employer not found.' });
  }

  if (!employer.companyLogo) {
    return res.status(400).json({ success: false, error: 'No company logo found to delete.' });
  }

  const filename = employer.companyLogo.split('/').pop();
  try {
    await deleteFile(filename);
    console.log(`✅ Company logo ${filename} deleted from storage.`);
  } catch (fileError) {
    console.warn(`⚠️ Could not delete company logo file ${filename} from storage:`, fileError.message);
  }

  employer.companyLogo = undefined;
  // Recalculate isProfileComplete after removing logo
  employer.isProfileComplete = employer.profileCompletion === 100;

  await employer.save({ validateBeforeSave: true });

  res.json({
    success: true,
    message: 'Company logo deleted successfully'
  });
});


/**
 * @desc Get all jobs posted by the authenticated employer
 * @route GET /api/v1/employers/me/jobs
 * @access Private (Employer Only)
 * @param {boolean} req.query.includeExpired - If true, includes expired jobs. Default is false.
 * @param {number} req.query.page
 * @param {number} req.query.limit
 */
const getEmployerJobs = asyncHandler(async (req, res) => {
  const employerId = req.user._id;
  const includeExpired = req.query.includeExpired === 'true'; // Convert to boolean
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;

  const query = { employer: employerId };

  // By default, only show active and non-expired jobs
  query.isActive = true;
  if (!includeExpired) {
    query.applicationDeadline = { $gte: new Date() }; // Deadline is greater than or equal to now
  }

  const skip = (page - 1) * limit;

  const jobs = await Job.find(query)
    .sort({ createdAt: -1 }) // Newest jobs first
    .skip(skip)
    .limit(limit);

  const total = await Job.countDocuments(query);
  const totalPages = Math.ceil(total / limit);

  res.status(200).json({
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

/**
 * @desc Get a specific employer's public profile (for job seekers to view company details)
 * @route GET /api/v1/employers/:id
 * @access Public
 */
const getEmployerPublicProfile = asyncHandler(async (req, res) => {
  const employer = await Employer.findById(req.params.id).select(
    '-password -verificationToken -resetPasswordToken -resetPasswordExpire -isActive -isVerified' // Exclude sensitive fields
  );

  if (!employer) {
    return res.status(404).json({ success: false, error: 'Employer not found.' });
  }

  // Optionally, you might only want to show verified and active employers
  if (!employer.isVerified || !employer.isActive) {
     return res.status(404).json({ success: false, error: 'Employer not found or not active.' });
  }

  res.status(200).json({
    success: true,
    data: employer
  });
});

/**
 * @desc Get all public jobs posted by a specific employer (for job seekers)
 * @route GET /api/v1/employers/:id/jobs
 * @access Public
 * @param {number} req.query.page
 * @param {number} req.query.limit
 */
const getEmployerPublicJobs = asyncHandler(async (req, res) => {
  const employerId = req.params.id;
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;

  // Ensure the employer exists and is active/verified before fetching jobs
  const employer = await Employer.findById(employerId);
  if (!employer || !employer.isVerified || !employer.isActive) {
    return res.status(404).json({ success: false, error: 'Employer not found or not active.' });
  }

  // Only show active and non-expired jobs for public view
  const query = {
    employer: employerId,
    isActive: true,
    applicationDeadline: { $gte: new Date() }
  };

  const skip = (page - 1) * limit;

  const jobs = await Job.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Job.countDocuments(query);
  const totalPages = Math.ceil(total / limit);

  res.status(200).json({
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


/**
 * @desc Change employer password
 * @route PUT /api/v1/employers/me/change-password
 * @access Private (Employer Only)
 */
const changeEmployerPassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const employer = await Employer.findById(req.user._id).select('+password');

  if (!employer) {
    return res.status(404).json({ success: false, error: 'Employer not found.' });
  }

  const isPasswordValid = await employer.comparePassword(currentPassword);
  if (!isPasswordValid) {
    return res.status(400).json({ success: false, error: 'Current password is incorrect.' });
  }

  const isNewPasswordSame = await employer.comparePassword(newPassword);
  if (isNewPasswordSame) {
    return res.status(400).json({ success: false, error: 'New password cannot be the same as the current password.' });
  }

  employer.password = newPassword;
  await employer.save({ validateBeforeSave: true });

  employer.clearPasswordResetToken(); // Clear any existing reset tokens
  await employer.save({ validateBeforeSave: false });

  res.json({ success: true, message: 'Employer password changed successfully!' });
});

/**
 * @desc Delete employer account
 * @route DELETE /api/v1/employers/me
 * @access Private (Employer Only)
 */
const deleteEmployerAccount = asyncHandler(async (req, res) => {
  const { password } = req.body;

  const employer = await Employer.findById(req.user._id).select('+password');

  if (!employer) {
    return res.status(404).json({ success: false, error: 'Employer not found.' });
  }

  const isPasswordValid = await employer.comparePassword(password);
  if (!isPasswordValid) {
    return res.status(400).json({ success: false, error: 'Incorrect password. Cannot delete account.' });
  }

  // Delete company logo if exists
  if (employer.companyLogo) {
    const filename = employer.companyLogo.split('/').pop();
    try {
      await deleteFile(filename);
      console.log(`✅ Company logo ${filename} deleted during account deletion.`);
    } catch (fileError) {
      console.warn(`⚠️ Could not delete logo file ${filename} during account deletion:`, fileError.message);
    }
  }

  // Optionally, decide what to do with associated job postings:
  // 1. Delete all jobs posted by this employer:
  await Job.deleteMany({ employer: req.user._id });
  console.log(`✅ All jobs posted by employer ${req.user._id} deleted.`);
  // 2. Or, set them to inactive / mark them as from a "deleted employer"
  //    await Job.updateMany({ employer: req.user._id }, { isActive: false, employer: null });

  // Finally, delete the employer document
  await Employer.findByIdAndDelete(req.user._id);
  console.log(`✅ Employer account ${req.user._id} deleted successfully.`);

  res.json({ success: true, message: 'Employer account and all associated jobs deleted successfully.' });
});


module.exports = {
  getEmployerProfile,
  updateEmployerProfile,
  uploadCompanyLogo,
  deleteCompanyLogo,
  getEmployerJobs,
  getEmployerPublicProfile,
  getEmployerPublicJobs,
  changeEmployerPassword,
  deleteEmployerAccount
};
