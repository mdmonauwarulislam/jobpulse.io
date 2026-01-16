const Employer = require('../models/Employer');
const Job = require('../models/Job');
const Application = require('../models/Application');
const Notification = require('../models/Notification');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const asyncHandler = require('../utils/asyncHandler');
const { deleteFile, getFileUrl } = require('../middleware/uploadMiddleware');

/**
 * @desc Get employer profile
 * @route GET /api/v1/employers/me
 * @access Private (Employer Only)
 */
const getEmployerProfile = asyncHandler(async (req, res) => {
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
    name,
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

  if (name !== undefined) employer.name = name;
  if (company !== undefined) employer.company = company;
  if (companyDescription !== undefined) employer.companyDescription = companyDescription;
  if (companyWebsite !== undefined) employer.companyWebsite = companyWebsite;
  if (phone !== undefined) employer.phone = phone;
  if (address !== undefined) employer.address = address;

  employer.isProfileComplete = employer.profileCompletion === 100;

  await employer.save({ validateBeforeSave: true });
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

  if (employer.companyLogo) {
    const oldFilename = employer.companyLogo.split('/').pop();
    if (oldFilename !== req.file.filename) { 
      try {
        await deleteFile(oldFilename);
        console.log(`✅ Old company logo ${oldFilename} deleted.`);
      } catch (fileError) {
        console.warn(`⚠️ Could not delete old logo file ${oldFilename}:`, fileError.message);
      }
    }
  }

  employer.companyLogo = getFileUrl(req.file.filename);
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
  const includeExpired = req.query.includeExpired === 'true'; 
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;

  const query = { employer: employerId };

  query.isActive = true;
  if (!includeExpired) {
    query.applicationDeadline = { $gte: new Date() }; 
  }

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
 * @desc Get a specific employer's public profile (for job seekers to view company details)
 * @route GET /api/v1/employers/:id
 * @access Public
 */
const getEmployerPublicProfile = asyncHandler(async (req, res) => {
  const employer = await Employer.findById(req.params.id).select(
    '-password -verificationToken -resetPasswordToken -resetPasswordExpire -isActive -isVerified' 
  );

  if (!employer) {
    return res.status(404).json({ success: false, error: 'Employer not found.' });
  }

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

  const employer = await Employer.findById(employerId);
  if (!employer || !employer.isVerified || !employer.isActive) {
    return res.status(404).json({ success: false, error: 'Employer not found or not active.' });
  }
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

  employer.clearPasswordResetToken(); 
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

  if (employer.companyLogo) {
    const filename = employer.companyLogo.split('/').pop();
    try {
      await deleteFile(filename);
      console.log(`✅ Company logo ${filename} deleted during account deletion.`);
    } catch (fileError) {
      console.warn(`⚠️ Could not delete logo file ${filename} during account deletion:`, fileError.message);
    }
  }

  await Job.deleteMany({ employer: req.user._id });
  console.log(`✅ All jobs posted by employer ${req.user._id} deleted.`);

  await Employer.findByIdAndDelete(req.user._id);
  console.log(`✅ Employer account ${req.user._id} deleted successfully.`);

  res.json({ success: true, message: 'Employer account and all associated jobs deleted successfully.' });
});

/**
 * @desc Get employer dashboard stats
 * @route GET /api/employers/stats
 * @access Private (Employer Only)
 */
const getEmployerStats = asyncHandler(async (req, res) => {
  const employerId = req.user._id;
  
  const jobs = await Job.find({ employer: employerId });
  const jobIds = jobs.map(job => job._id);
  
  const applications = await Application.find({ job: { $in: jobIds } });
  
  const stats = {
    totalJobs: jobs.length,
    activeJobs: jobs.filter(job => job.isActive && new Date(job.applicationDeadline) >= new Date()).length,
    expiredJobs: jobs.filter(job => new Date(job.applicationDeadline) < new Date()).length,
    totalApplications: applications.length,
    pendingApplications: applications.filter(app => app.status === 'pending').length,
    reviewedApplications: applications.filter(app => app.status === 'reviewed').length,
    shortlistedApplications: applications.filter(app => app.status === 'shortlisted').length,
    rejectedApplications: applications.filter(app => app.status === 'rejected').length,
    hiredApplications: applications.filter(app => app.status === 'hired').length,
    totalViews: jobs.reduce((sum, job) => sum + (job.views || 0), 0),
    recentApplications: applications.filter(app => {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return new Date(app.createdAt) >= weekAgo;
    }).length
  };
  
  res.json({
    success: true,
    data: { stats }
  });
});

/**
 * @desc Get all applications for employer's jobs
 * @route GET /api/employers/applications
 * @access Private (Employer Only)
 */
const getEmployerApplications = asyncHandler(async (req, res) => {
  const employerId = req.user._id;
  const { page = 1, limit = 10, status, jobId, search } = req.query;
  
  const employerJobs = await Job.find({ employer: employerId }).select('_id');
  const jobIds = employerJobs.map(job => job._id);
  
  const filter = { job: { $in: jobIds } };
  
  if (status && status !== 'all') {
    filter.status = status;
  }
  
  if (jobId) {
    filter.job = jobId;
  }
  
  const skip = (parseInt(page) - 1) * parseInt(limit);
  
  let applicationsQuery = Application.find(filter)
    .populate('applicant', 'name email phone summary skills experience education resumeUrl')
    .populate('job', 'title company location jobType salary')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));
  
  const applications = await applicationsQuery;
  const total = await Application.countDocuments(filter);
  const totalPages = Math.ceil(total / parseInt(limit));
  
  res.json({
    success: true,
    data: {
      applications,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalApplications: total,
        hasNextPage: parseInt(page) < totalPages,
        hasPrevPage: parseInt(page) > 1
      }
    }
  });
});

/**
 * @desc Get single application details
 * @route GET /api/employers/applications/:applicationId
 * @access Private (Employer Only)
 */
const getApplicationDetails = asyncHandler(async (req, res) => {
  const { applicationId } = req.params;
  const employerId = req.user._id;
  
  const application = await Application.findById(applicationId)
    .populate('applicant', 'name email phone summary skills experience education resumeUrl address')
    .populate({
      path: 'job',
      select: 'title company location jobType salary employer',
      populate: { path: 'employer', select: 'company' }
    });
  
  if (!application) {
    return res.status(404).json({
      success: false,
      error: 'Application not found'
    });
  }
  
  if (application.job.employer._id.toString() !== employerId.toString()) {
    return res.status(403).json({
      success: false,
      error: 'Not authorized to view this application'
    });
  }
  
  const conversation = await Conversation.findOne({ application: applicationId });
  
  res.json({
    success: true,
    data: {
      application,
      hasConversation: !!conversation,
      conversationId: conversation?._id
    }
  });
});

/**
 * @desc Update application status
 * @route PUT /api/employers/applications/:applicationId/status
 * @access Private (Employer Only)
 */
const updateApplicationStatus = asyncHandler(async (req, res) => {
  const { applicationId } = req.params;
  const { status, notes } = req.body;
  const employerId = req.user._id;
  
  const application = await Application.findById(applicationId)
    .populate('job')
    .populate('applicant', 'name email');
  
  if (!application) {
    return res.status(404).json({
      success: false,
      error: 'Application not found'
    });
  }
  
  if (application.job.employer.toString() !== employerId.toString()) {
    return res.status(403).json({
      success: false,
      error: 'Not authorized to update this application'
    });
  }
  
  const previousStatus = application.status;
  
  application.status = status;
  if (notes) {
    application.employerNotes = notes;
  }
  if (status === 'reviewed' && !application.reviewedAt) {
    application.reviewedAt = new Date();
    application.reviewedBy = employerId;
    application.reviewedByModel = 'Employer';
  }
  
  await application.save();
  
  await Notification.notifyApplicationStatusChanged(
    application.applicant._id,
    applicationId,
    application.job._id,
    status,
    application.job.title,
    application.job.company
  );
  
  if ((status === 'shortlisted' || status === 'hired') && previousStatus !== status) {
    let conversation = await Conversation.findOne({ application: applicationId });
    
    if (!conversation) {
      conversation = await Conversation.create({
        application: applicationId,
        job: application.job._id,
        employer: employerId,
        applicant: application.applicant._id,
        initiatedBy: 'employer'
      });
      
      const statusMessage = status === 'shortlisted' 
        ? `Congratulations! Your application has been shortlisted for ${application.job.title}.`
        : `Congratulations! You have been hired for ${application.job.title}!`;
      
      await Message.createSystemMessage(
        conversation._id,
        statusMessage,
        'status_change',
        { status, previousStatus }
      );
    }
  }
  
  res.json({
    success: true,
    message: `Application status updated to ${status}`,
    data: { application }
  });
});

/**
 * @desc Schedule interview for an application
 * @route POST /api/employers/applications/:applicationId/interview
 * @access Private (Employer Only)
 */
const scheduleInterview = asyncHandler(async (req, res) => {
  const { applicationId } = req.params;
  const { date, time, location, type, notes } = req.body;
  const employerId = req.user._id;
  
  const application = await Application.findById(applicationId)
    .populate('job')
    .populate('applicant', 'name email');
  
  if (!application) {
    return res.status(404).json({
      success: false,
      error: 'Application not found'
    });
  }
  
  if (application.job.employer.toString() !== employerId.toString()) {
    return res.status(403).json({
      success: false,
      error: 'Not authorized to schedule interview for this application'
    });
  }
  
  application.interview = {
    scheduledAt: new Date(date),
    time,
    location,
    type: type || 'in-person',
    notes
  };
  
  if (application.status === 'pending' || application.status === 'reviewed') {
    application.status = 'shortlisted';
  }
  
  await application.save();
  
  const interviewDate = new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  await Notification.notifyInterviewScheduled(
    application.applicant._id,
    applicationId,
    application.job._id,
    application.job.title,
    application.job.company,
    `${interviewDate}${time ? ` at ${time}` : ''}`
  );
  
  let conversation = await Conversation.findOne({ application: applicationId });
  
  if (!conversation) {
    conversation = await Conversation.create({
      application: applicationId,
      job: application.job._id,
      employer: employerId,
      applicant: application.applicant._id,
      initiatedBy: 'employer'
    });
  }
  
  await Message.createSystemMessage(
    conversation._id,
    `An interview has been scheduled for ${interviewDate}${time ? ` at ${time}` : ''}${location ? ` at ${location}` : ''}${type ? ` (${type})` : ''}.`,
    'interview_scheduled',
    { date, time, location, type }
  );
  
  res.json({
    success: true,
    message: 'Interview scheduled successfully',
    data: { application, conversationId: conversation._id }
  });
});

/**
 * @desc Get employer by ID (public)
 * @route GET /api/employers/public/:employerId
 * @access Public
 */
const getEmployerById = asyncHandler(async (req, res) => {
  const { employerId } = req.params;
  
  const employer = await Employer.findById(employerId)
    .select('name company companyDescription companyWebsite companyLogo address');
  
  if (!employer) {
    return res.status(404).json({
      success: false,
      error: 'Employer not found'
    });
  }
  
  const jobCount = await Job.countDocuments({ 
    employer: employerId, 
    isActive: true,
    applicationDeadline: { $gte: new Date() }
  });
  
  res.json({
    success: true,
    data: {
      employer,
      jobCount
    }
  });
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
  deleteEmployerAccount,
  getEmployerStats,
  getEmployerApplications,
  getApplicationDetails,
  updateApplicationStatus,
  scheduleInterview,
  getEmployerById
};
