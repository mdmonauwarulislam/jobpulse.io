const Job = require('../models/Job');
const Application = require('../models/Application');
const EmployerProfile = require('../models/EmployerProfile');
const asyncHandler = require('../utils/asyncHandler');

// Create job
const createJob = async (req, res) => {
  try {
    const {
      title,
      description,
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

    // Verify employer profile exists (should be attached by protect middleware)
    if (!req.profile || req.user.role !== 'employer') {
      return res.status(403).json({ success: false, error: 'Only employers can post jobs.' });
    }

    const jobData = {
      title,
      description,
      location: location || req.profile.address, // Default to profile address if not set
      salary: salary ? Number(salary) : undefined,
      salaryType,
      jobType,
      experienceLevel,
      externalApplyUrl,
      requirements: requirements, 
      benefits: benefits,
      tags: tags ? tags.split(',').map(t => t.trim()) : [],
      applicationDeadline: applicationDeadline ? new Date(applicationDeadline) : undefined,
      
      employer: req.profile._id, // Link to EmployerProfile
      employerUserId: req.user.userId // Link to Public User ID
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
      // Use regex for partial matching instead of text search
      // This allows substring search (e.g., "react" finds "reactjs")
      const searchRegex = { $regex: search, $options: 'i' };
      filter.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { tags: searchRegex }
      ];
    }
    
    if (location) {
      filter.location = { $regex: location, $options: 'i' };
    }
    
    if (company) {
      // Find employers with matching company name
      const employers = await EmployerProfile.find({ company: { $regex: company, $options: 'i' } }).select('_id');
      const employerIds = employers.map(e => e._id);
      if (employerIds.length > 0) {
         filter.employer = { $in: employerIds };
      } else {
         filter.employer = null; 
      }
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

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const skip = (Number(page) - 1) * Number(limit);
    
    const jobs = await Job.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(Number(limit))
      .populate('employer', 'company companyLogo location'); 

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
    const mongoose = require('mongoose');
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, error: 'Invalid job ID format' });
    }

    const job = await Job.findById(id)
      .populate('employer', 'company companyLogo companyDescription companyWebsite');

    if (!job) {
      return res.status(404).json({ success: false, error: 'Job not found' });
    }

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

    const job = await Job.findById(id);
    if (!job) {
      return res.status(404).json({ success: false, error: 'Job not found' });
    }

    // Check ownership using employerUserId (String)
    if (req.user.role === 'employer') {
      if (job.employerUserId !== req.user.userId) {
        return res.status(403).json({ success: false, error: 'Not authorized to update this job' });
      }
    } else if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }

    // if (updateData.requirements) {
    //   updateData.requirements = updateData.requirements; 
    // }
    // if (updateData.benefits) {
    //   updateData.benefits = updateData.benefits;
    // }
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

    const job = await Job.findById(id);
    if (!job) {
      return res.status(404).json({ success: false, error: 'Job not found' });
    }

    if (req.user.role === 'employer') {
        if (job.employerUserId !== req.user.userId) {
          return res.status(403).json({ success: false, error: 'Not authorized to delete this job' });
        }
    } else if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }

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
    const { employerId } = req.params; // Expecting userId string
    const { page = 1, limit = 10, status = 'all' } = req.query;

    // Build filter using employerUserId
    const filter = { employerUserId: employerId };
    
    if (status !== 'all') {
      filter.isActive = status === 'active';
    }

    const skip = (Number(page) - 1) * Number(limit);
    
    const jobs = await Job.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

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
    .populate('employer', 'company companyLogo');

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
const searchJobs = asyncHandler(async (req, res) => {
  const { keyword, location, type, salary } = req.query;

  const query = {
     $and: [
        { isActive: true },
        { applicationDeadline: { $gte: new Date() } }
     ]
  };

  if (keyword) {
    const keywordRegex = new RegExp(keyword, 'i');
    
    // 1. Find employers matching the keyword
    const employers = await EmployerProfile.find({ company: keywordRegex }).select('_id');
    const employerIds = employers.map(emp => emp._id);

    // 2. Build search query
    // Match either text search on job fields OR employer ID match
    const keywordConditions = [
        { title: keywordRegex },
        { description: keywordRegex },
        { location: keywordRegex }
    ];

    if (employerIds.length > 0) {
        keywordConditions.push({ employer: { $in: employerIds } });
    }

    query.$and.push({ $or: keywordConditions });
  }

  if (location) {
    query.$and.push({ location: { $regex: location, $options: 'i' } });
  }

  if (type) {
    query.$and.push({ jobType: type });
  }

  if (salary) {
     // ... logic for salary range if needed, skipped for brevity or assume simple match
     // query.$and.push({ salary: { $gte: salary } });
  }

  const jobs = await Job.find(query)
    .populate('employer', 'company companyLogo location')
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    count: jobs.length,
    data: jobs
  });
});

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