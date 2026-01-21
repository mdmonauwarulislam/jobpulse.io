const Application = require('../models/Application');
const Job = require('../models/Job');
const User = require('../models/User');
const EmployerProfile = require('../models/EmployerProfile');
const { sendEmail } = require('../config/mailer');

// Submit application
const submitApplication = async (req, res) => {
  try {
    const { jobId, coverLetter } = req.body;
    const applicantId = req.user._id;

    // Check if job exists and is active
    const job = await Job.findById(jobId);
    if (!job || !job.isActive) {
      return res.status(404).json({
        success: false,
        error: 'Job not found or not active'
      });
    }

    // Check if user has already applied
    const existingApplication = await Application.findOne({
      job: jobId,
      applicant: applicantId
    });

    if (existingApplication) {
      return res.status(400).json({
        success: false,
        error: 'You have already applied for this job'
      });
    }

    // Create application
    let resumeUrl = req.user.resumeUrl;
    if (req.file) {
      resumeUrl = req.file.path;
    }

    const application = await Application.create({
      job: jobId,
      applicant: applicantId,
      coverLetter,
      resumeUrl
    });

    // Increment job application count
    await job.incrementApplications();

    // Get employer info for email
    const employer = await EmployerProfile.findOne({ user: job.employer });
    
    // Send notification email to employer
    if (employer) {
      // EmployerProfile links to User, but we need the User's email.
      // We should probably populate it or fetch User separately if not populated.
      // However, job.employer is likely the User ObjectId (Ref: "User") or EmployerProfile ObjectId?
      // Let's check Job model. employer is Ref: 'EmployerProfile'.
      // So job.employer is the Profile ID (or User ID depending on recent changes).
      // Job.js says: employer: { type: Schema.ObjectId, ref: 'EmployerProfile' }
      // So job.employer is the EmployerProfile ID.
      // We need to fetch User from EmployerProfile.
       const employerUser = await User.findById(employer.user);
       if (employerUser) {
          await sendEmail(
            employerUser.email,
            'newApplication',
            [job.title, employer.company, req.user.name]
          );
       }
    }

    // Send confirmation email to applicant
    await sendEmail(
      req.user.email,
      'applicationReceived',
      [job.title, job.company]
    );

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: { application }
    });
  } catch (error) {
    console.error('❌ Submit application error:', error);
    res.status(500).json({
      success: false,
      error: 'Error submitting application'
    });
  }
};

// Get applications for a job (employer view)
const getApplicationsForJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { page = 1, limit = 10, status = 'all' } = req.query;

    // Check if job exists and user has permission
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        error: 'Job not found'
      });
    }

    // Check if user can view applications for this job
    if (req.userType === 'employer') {
      if (job.postedBy.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          error: 'Not authorized to view applications for this job'
        });
      }
    } else if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to view applications'
      });
    }

    // Build filter
    const filter = { job: jobId };
    if (status !== 'all') {
      filter.status = status;
    }

    // Calculate pagination
    const skip = (Number(page) - 1) * Number(limit);
    
    // Get applications with applicant details
    const applications = await Application.find(filter)
      .populate('applicant', 'name email phone summary skills experience education')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    // Get total count
    const total = await Application.countDocuments(filter);
    const totalPages = Math.ceil(total / Number(limit));

    res.json({
      success: true,
      data: {
        applications,
        job: {
          id: job._id,
          title: job.title,
          company: job.company
        },
        pagination: {
          currentPage: Number(page),
          totalPages,
          totalApplications: total,
          hasNextPage: Number(page) < totalPages,
          hasPrevPage: Number(page) > 1
        }
      }
    });
  } catch (error) {
    console.error('❌ Get applications for job error:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching applications'
    });
  }
};

// Get user's applications
const getUserApplications = async (req, res) => {
  try {
    const { page = 1, limit = 10, status = 'all' } = req.query;
    const userId = req.user._id;

    // Build filter
    const filter = { applicant: userId };
    if (status !== 'all') {
      filter.status = status;
    }

    // Calculate pagination
    const skip = (Number(page) - 1) * Number(limit);
    
    // Get applications with job details
    const applications = await Application.find(filter)
      .populate('job', 'title company location jobType salary salaryType')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    // Get total count
    const total = await Application.countDocuments(filter);
    const totalPages = Math.ceil(total / Number(limit));

    res.json({
      success: true,
      data: {
        applications,
        pagination: {
          currentPage: Number(page),
          totalPages,
          totalApplications: total,
          hasNextPage: Number(page) < totalPages,
          hasPrevPage: Number(page) > 1
        }
      }
    });
  } catch (error) {
    console.error('❌ Get user applications error:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching applications'
    });
  }
};

// Update application status
const updateApplicationStatus = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { status, notes } = req.body;

    // Find application
    const application = await Application.findById(applicationId)
      .populate('job', 'title company')
      .populate('applicant', 'name email');

    if (!application) {
      return res.status(404).json({
        success: false,
        error: 'Application not found'
      });
    }

    // Check if user can update this application
    const job = await Job.findById(application.job);
    if (req.userType === 'employer') {
      if (job.postedBy.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          error: 'Not authorized to update this application'
        });
      }
    } else if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update applications'
      });
    }

    // Update application status
    await application.updateStatus(status, notes);

    // Send notification email to applicant
    if (application.applicant.email) {
      const statusMessages = {
        'reviewed': 'Your application has been reviewed',
        'shortlisted': 'Congratulations! You have been shortlisted',
        'rejected': 'Your application was not selected for this position',
        'hired': 'Congratulations! You have been hired for this position'
      };

      const message = statusMessages[status] || 'Your application status has been updated';
      
      // Send status update email
      await sendEmail(
        application.applicant.email,
        'applicationStatusUpdate',
        [application.applicant.name, application.job.title, application.job.company, status, message]
      );
    }

    res.json({
      success: true,
      message: 'Application status updated successfully',
      data: { application }
    });
  } catch (error) {
    console.error('❌ Update application status error:', error);
    res.status(500).json({
      success: false,
      error: 'Error updating application status'
    });
  }
};

// Withdraw application
const withdrawApplication = async (req, res) => {
  try {
    const { applicationId } = req.params;

    // Find application
    const application = await Application.findById(applicationId);
    if (!application) {
      return res.status(404).json({
        success: false,
        error: 'Application not found'
      });
    }

    // Check if user can withdraw this application
    if (application.applicant.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to withdraw this application'
      });
    }

    // Check if application is already withdrawn
    if (application.isWithdrawn) {
      return res.status(400).json({
        success: false,
        error: 'Application is already withdrawn'
      });
    }

    // Withdraw application
    await application.withdraw();

    res.json({
      success: true,
      message: 'Application withdrawn successfully'
    });
  } catch (error) {
    console.error('❌ Withdraw application error:', error);
    res.status(500).json({
      success: false,
      error: 'Error withdrawing application'
    });
  }
};

// Get application by ID
const getApplicationById = async (req, res) => {
  try {
    const { applicationId } = req.params;

    const application = await Application.findById(applicationId)
      .populate('job', 'title company location jobType salary salaryType description')
      .populate('applicant', 'name email phone summary skills experience education resumeUrl');

    if (!application) {
      return res.status(404).json({
        success: false,
        error: 'Application not found'
      });
    }

    // Check if user can view this application
    const job = await Job.findById(application.job);
    if (req.userType === 'employer') {
      if (job.postedBy.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          error: 'Not authorized to view this application'
        });
      }
    } else if (req.user.role !== 'admin') {
      if (application.applicant.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          error: 'Not authorized to view this application'
        });
      }
    }

    res.json({
      success: true,
      data: { application }
    });
  } catch (error) {
    console.error('❌ Get application by ID error:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching application'
    });
  }
};

// Check application status
const checkApplicationStatus = async (req, res) => {
  try {
    const { jobId } = req.params;
    const userId = req.user._id;

    const application = await Application.findOne({
      job: jobId,
      applicant: userId
    })
    .select('status createdAt');

    res.json({
      success: true,
      hasApplied: !!application,
      application: application || null
    });
  } catch (error) {
    console.error('❌ Check application status error:', error);
    res.status(500).json({
      success: false,
      error: 'Error checking application status'
    });
  }
};

module.exports = {
  submitApplication,
  getApplicationsForJob,
  getUserApplications,
  updateApplicationStatus,
  updateApplicationStatus,
  withdrawApplication,
  getApplicationById,
  checkApplicationStatus
}; 