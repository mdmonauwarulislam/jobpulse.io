const Job = require('../models/Job');
const Application = require('../models/Application');

// Create job
const createJob = async (req, res) => {
  try {
    const {
      title,
      description,
      company,
      location,
      salary,
      salaryType,
      jobType,
      experienceLevel,
      externalApplyUrl,
      requirements,
      benefits,
      tags,
      applicationDeadline
    } = req.body;

    const jobData = {
      title,
      description,
      company,
      location,
      salary: salary ? Number(salary) : undefined,
      salaryType,
      jobType,
      experienceLevel,
      externalApplyUrl,
      requirements: requirements ? requirements.split(',').map(r => r.trim()) : [],
      benefits: benefits ? benefits.split(',').map(b => b.trim()) : [],
      tags: tags ? tags.split(',').map(t => t.trim()) : [],
      applicationDeadline: applicationDeadline ? new Date(applicationDeadline) : undefined,
      postedBy: req.user._id,
      postedByModel: req.userType === 'employer' ? 'Employer' : 'User'
    };

    const job = await Job.create(jobData);

    res.status(201).json({
      success: true,
      message: 'Job created successfully',
      data: { job }
    });
  } catch (error) {
    console.error('❌ Create job error:', error);
    res.status(500).json({
      success: false,
      error: 'Error creating job'
    });
  }
};

// Get all jobs with filtering and pagination
const getAllJobs = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      location,
      company,
      jobType,
      experienceLevel,
      minSalary,
      maxSalary,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = { isActive: true };
    
    if (search) {
      filter.$text = { $search: search };
    }
    
    if (location) {
      filter.location = { $regex: location, $options: 'i' };
    }
    
    if (company) {
      filter.company = { $regex: company, $options: 'i' };
    }
    
    if (jobType) {
      filter.jobType = jobType;
    }
    
    if (experienceLevel) {
      filter.experienceLevel = experienceLevel;
    }
    
    if (minSalary || maxSalary) {
      filter.salary = {};
      if (minSalary) filter.salary.$gte = Number(minSalary);
      if (maxSalary) filter.salary.$lte = Number(maxSalary);
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Calculate pagination
    const skip = (Number(page) - 1) * Number(limit);
    
    // Get jobs with pagination
    const jobs = await Job.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(Number(limit))
      .populate('postedBy', 'name company');

    // Get total count for pagination
    const total = await Job.countDocuments(filter);
    const totalPages = Math.ceil(total / Number(limit));

    res.json({
      success: true,
      data: {
        jobs,
        pagination: {
          currentPage: Number(page),
          totalPages,
          totalJobs: total,
          hasNextPage: Number(page) < totalPages,
          hasPrevPage: Number(page) > 1
        }
      }
    });
  } catch (error) {
    console.error('❌ Get all jobs error:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching jobs'
    });
  }
};

// Get job by ID
const getJobById = async (req, res) => {
  try {
    const { id } = req.params;

    const job = await Job.findById(id)
      .populate('postedBy', 'name company companyDescription companyWebsite');

    if (!job) {
      return res.status(404).json({
        success: false,
        error: 'Job not found'
      });
    }

    // Increment views
    await job.incrementViews();

    res.json({
      success: true,
      data: { job }
    });
  } catch (error) {
    console.error('❌ Get job by ID error:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching job'
    });
  }
};

// Update job
const updateJob = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Find job and check ownership
    const job = await Job.findById(id);
    if (!job) {
      return res.status(404).json({
        success: false,
        error: 'Job not found'
      });
    }

    // Check if user can update this job
    if (req.userType === 'employer') {
      if (job.postedBy.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          error: 'Not authorized to update this job'
        });
      }
    } else if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update jobs'
      });
    }

    // Update arrays if provided
    if (updateData.requirements) {
      updateData.requirements = updateData.requirements.split(',').map(r => r.trim());
    }
    if (updateData.benefits) {
      updateData.benefits = updateData.benefits.split(',').map(b => b.trim());
    }
    if (updateData.tags) {
      updateData.tags = updateData.tags.split(',').map(t => t.trim());
    }

    const updatedJob = await Job.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Job updated successfully',
      data: { job: updatedJob }
    });
  } catch (error) {
    console.error('❌ Update job error:', error);
    res.status(500).json({
      success: false,
      error: 'Error updating job'
    });
  }
};

// Delete job
const deleteJob = async (req, res) => {
  try {
    const { id } = req.params;

    // Find job and check ownership
    const job = await Job.findById(id);
    if (!job) {
      return res.status(404).json({
        success: false,
        error: 'Job not found'
      });
    }

    // Check if user can delete this job
    if (req.userType === 'employer') {
      if (job.postedBy.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          error: 'Not authorized to delete this job'
        });
      }
    } else if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete jobs'
      });
    }

    // Soft delete by setting isActive to false
    job.isActive = false;
    await job.save();

    res.json({
      success: true,
      message: 'Job deleted successfully'
    });
  } catch (error) {
    console.error('❌ Delete job error:', error);
    res.status(500).json({
      success: false,
      error: 'Error deleting job'
    });
  }
};

// Get jobs by employer
const getJobsByEmployer = async (req, res) => {
  try {
    const { employerId } = req.params;
    const { page = 1, limit = 10, status = 'all' } = req.query;

    // Build filter
    const filter = { postedBy: employerId, postedByModel: 'Employer' };
    if (status !== 'all') {
      filter.isActive = status === 'active';
    }

    // Calculate pagination
    const skip = (Number(page) - 1) * Number(limit);
    
    // Get jobs
    const jobs = await Job.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    // Get total count
    const total = await Job.countDocuments(filter);
    const totalPages = Math.ceil(total / Number(limit));

    res.json({
      success: true,
      data: {
        jobs,
        pagination: {
          currentPage: Number(page),
          totalPages,
          totalJobs: total,
          hasNextPage: Number(page) < totalPages,
          hasPrevPage: Number(page) > 1
        }
      }
    });
  } catch (error) {
    console.error('❌ Get jobs by employer error:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching employer jobs'
    });
  }
};

// Get featured jobs
const getFeaturedJobs = async (req, res) => {
  try {
    const { limit = 6 } = req.query;

    const jobs = await Job.find({ 
      isActive: true, 
      isFeatured: true 
    })
    .sort({ createdAt: -1 })
    .limit(Number(limit))
    .populate('postedBy', 'name company');

    res.json({
      success: true,
      data: { jobs }
    });
  } catch (error) {
    console.error('❌ Get featured jobs error:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching featured jobs'
    });
  }
};

// Search jobs
const searchJobs = async (req, res) => {
  try {
    const { q, location, jobType, experienceLevel } = req.query;

    // Build search filter
    const filter = { isActive: true };
    
    if (q) {
      filter.$text = { $search: q };
    }
    
    if (location) {
      filter.location = { $regex: location, $options: 'i' };
    }
    
    if (jobType) {
      filter.jobType = jobType;
    }
    
    if (experienceLevel) {
      filter.experienceLevel = experienceLevel;
    }

    const jobs = await Job.find(filter)
      .sort({ score: { $meta: 'textScore' }, createdAt: -1 })
      .limit(20)
      .populate('postedBy', 'name company');

    res.json({
      success: true,
      data: { jobs }
    });
  } catch (error) {
    console.error('❌ Search jobs error:', error);
    res.status(500).json({
      success: false,
      error: 'Error searching jobs'
    });
  }
};

module.exports = {
  createJob,
  getAllJobs,
  getJobById,
  updateJob,
  deleteJob,
  getJobsByEmployer,
  getFeaturedJobs,
  searchJobs
}; 