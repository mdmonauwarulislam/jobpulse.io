const SavedJob = require('../models/SavedJob');
const Job = require('../models/Job');
const asyncHandler = require('../utils/asyncHandler');

/**
 * @desc    Save a job
 * @route   POST /api/users/saved-jobs
 * @access  Private (Candidate)
 */
const saveJob = asyncHandler(async (req, res) => {
  const { jobId, note } = req.body;
  const userId = req.user._id;

  const job = await Job.findById(jobId);
  if (!job) {
    return res.status(404).json({ success: false, error: 'Job not found' });
  }

  // Check if already saved
  const existingSavedJob = await SavedJob.findOne({ user: userId, job: jobId });
  if (existingSavedJob) {
    return res.status(400).json({ success: false, error: 'Job already saved' });
  }

  const savedJob = await SavedJob.create({
    user: userId,
    job: jobId,
    note
  });

  res.status(201).json({
    success: true,
    message: 'Job saved successfully',
    data: savedJob
  });
});

/**
 * @desc    Get all saved jobs
 * @route   GET /api/users/saved-jobs
 * @access  Private (Candidate)
 */
const getSavedJobs = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { page = 1, limit = 10 } = req.query;

  const skip = (Number(page) - 1) * Number(limit);

  const savedJobs = await SavedJob.find({ user: userId })
    .populate({
      path: 'job',
      populate: { path: 'employer', select: 'company companyLogo location' }
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  const total = await SavedJob.countDocuments({ user: userId });
  const totalPages = Math.ceil(total / Number(limit));

  res.json({
    success: true,
    data: {
      savedJobs,
      pagination: {
        currentPage: Number(page),
        totalPages,
        totalJobs: total,
        hasNextPage: Number(page) < totalPages,
        hasPrevPage: Number(page) > 1
      }
    }
  });
});

/**
 * @desc    Remove saved job
 * @route   DELETE /api/users/saved-jobs/:jobId
 * @access  Private (Candidate)
 */
const removeSavedJob = asyncHandler(async (req, res) => {
  const { jobId } = req.params;
  const userId = req.user._id;

  // Find by job ID directly or SavedJob ID? Let's support Job ID for UX convenience
  // But safest is: findOneAndDelete({ user: userId, job: jobId })
  
  const deleted = await SavedJob.findOneAndDelete({ user: userId, job: jobId });

  if (!deleted) {
      // Try treating jobId as the savedJob _id just in case
      const deletedById = await SavedJob.findOneAndDelete({ _id: jobId, user: userId });
      if(!deletedById) {
        return res.status(404).json({ success: false, error: 'Saved job not found' });
      }
  }

  res.json({
    success: true,
    message: 'Job removed from saved list'
  });
});

module.exports = {
  saveJob,
  getSavedJobs,
  removeSavedJob
};
