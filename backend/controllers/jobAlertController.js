const JobAlert = require('../models/JobAlert');
const asyncHandler = require('../utils/asyncHandler');

/**
 * @desc    Create a job alert
 * @route   POST /api/users/job-alerts
 * @access  Private (Candidate)
 */
const createJobAlert = asyncHandler(async (req, res) => {
  const { title, keywords, location, jobType, minSalary, frequency } = req.body;
  const userId = req.user._id;

  // Basic validation
  if (!title) {
      return res.status(400).json({ success: false, error: 'Alert title is required' });
  }

  // Limit alerts per user (e.g. 10) to prevent spam
  const count = await JobAlert.countDocuments({ user: userId });
  if (count >= 10) {
      return res.status(400).json({ success: false, error: 'Maximum limit of 10 active alerts reached.' });
  }

  const alert = await JobAlert.create({
    user: userId,
    title,
    keywords,
    location,
    jobType,
    minSalary: minSalary ? Number(minSalary) : undefined,
    frequency
  });

  res.status(201).json({
    success: true,
    message: 'Job alert created successfully',
    data: alert
  });
});

/**
 * @desc    Get all job alerts
 * @route   GET /api/users/job-alerts
 * @access  Private (Candidate)
 */
const getJobAlerts = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const alerts = await JobAlert.find({ user: userId }).sort({ createdAt: -1 });

  res.json({
    success: true,
    data: alerts
  });
});

/**
 * @desc    Delete job alert
 * @route   DELETE /api/users/job-alerts/:alertId
 * @access  Private (Candidate)
 */
const deleteJobAlert = asyncHandler(async (req, res) => {
  const { alertId } = req.params;
  const userId = req.user._id;

  const alert = await JobAlert.findOneAndDelete({ _id: alertId, user: userId });

  if (!alert) {
    return res.status(404).json({ success: false, error: 'Job alert not found' });
  }

  res.json({
    success: true,
    message: 'Job alert deleted successfully'
  });
});

/**
 * @desc    Update job alert
 * @route   PUT /api/users/job-alerts/:alertId
 * @access  Private (Candidate)
 */
const updateJobAlert = asyncHandler(async (req, res) => {
    const { alertId } = req.params;
    const userId = req.user._id;
    const updateData = req.body;

    const alert = await JobAlert.findOneAndUpdate(
        { _id: alertId, user: userId },
        updateData,
        { new: true, runValidators: true }
    );

    if (!alert) {
        return res.status(404).json({ success: false, error: 'Job alert not found' });
    }

    res.json({
        success: true,
        message: 'Job alert updated',
        data: alert
    });
});

module.exports = {
  createJobAlert,
  getJobAlerts,
  deleteJobAlert,
  updateJobAlert
};
