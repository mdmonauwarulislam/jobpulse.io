const Resume = require('../models/Resume');
const ErrorResponse = require('../utils/errorResponse');
// Adjust path if asyncHandler is in utils
const asyncHandler = require('../utils/asyncHandler'); 

// @desc    Get all resumes for current user
// @route   GET /api/resumes
// @access  Private
exports.getResumes = asyncHandler(async (req, res, next) => {
  const resumes = await Resume.find({ user: req.user.id }).sort('-updatedAt');

  res.status(200).json({
    success: true,
    count: resumes.length,
    data: resumes
  });
});

// @desc    Get single resume
// @route   GET /api/resumes/:id
// @access  Private/Public
exports.getResume = asyncHandler(async (req, res, next) => {
  const resume = await Resume.findById(req.params.id);

  if (!resume) {
    return next(
      new ErrorResponse(`Resume not found with id of ${req.params.id}`, 404)
    );
  }

  // Check access: Owner, Admin, or Public
  const isOwner = req.user && resume.user.toString() === req.user.id;
  const isAdmin = req.user && req.user.role === 'admin';
  const isPublic = resume.isPublic;

  if (!isOwner && !isAdmin && !isPublic) {
    return next(
      new ErrorResponse(`User not authorized to access this resume`, 401)
    );
  }

  res.status(200).json({
    success: true,
    data: resume
  });
});

// @desc    Create new resume
// @route   POST /api/resumes
// @access  Private
exports.createResume = asyncHandler(async (req, res, next) => {
  req.body.user = req.user.id;

  // Default JSON structure if not provided
  if (!req.body.contentJson) {
    req.body.contentJson = {
      profile: {
        name: req.user.name || "Your Name",
        title: "Your Professional Title",
        location: "City, Country",
        email: req.user.email || "email@example.com",
        phone: "+1 234 567 8900",
        links: [
          { "label": "LinkedIn", "url": "https://linkedin.com/in/..." },
          { "label": "GitHub", "url": "https://github.com/..." }
        ]
      },
      summary: "Experienced professional with a proven track record...",
      experience: [
        {
          company: "Company Name",
          role: "Job Title",
          start: "Jan 2022",
          end: "Present",
          points: ["Achieved X by doing Y", "Led a team of Z people"]
        }
      ],
      education: [
        {
          degree: "Bachelor's Degree",
          college: "University Name",
          year: "2018 - 2022"
        }
      ],
      skills: {
        "Technical": ["Skill 1", "Skill 2"],
        "Soft Skills": ["Leadership", "Communication"]
      },
      projects: [
        {
          name: "Project Name",
          description: "Brief description of the project and your role.",
          tech: ["Tech A", "Tech B"],
          link: "https://project-link.com"
        }
      ]
    };
  }

  const resume = await Resume.create(req.body);

  res.status(201).json({
    success: true,
    data: resume
  });
});

// @desc    Update resume
// @route   PUT /api/resumes/:id
// @access  Private
exports.updateResume = asyncHandler(async (req, res, next) => {
  let resume = await Resume.findById(req.params.id);

  if (!resume) {
    return next(
      new ErrorResponse(`Resume not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user owns the resume
  if (resume.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(`User not authorized to update this resume`, 401)
    );
  }

  // Update updateAt
  req.body.updatedAt = Date.now();

  resume = await Resume.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: resume
  });
});

// @desc    Delete resume
// @route   DELETE /api/resumes/:id
// @access  Private
exports.deleteResume = asyncHandler(async (req, res, next) => {
  const resume = await Resume.findById(req.params.id);

  if (!resume) {
    return next(
      new ErrorResponse(`Resume not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user owns the resume
  if (resume.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(`User not authorized to delete this resume`, 401)
    );
  }

  await resume.remove();

  res.status(200).json({
    success: true,
    data: {}
  });
});
