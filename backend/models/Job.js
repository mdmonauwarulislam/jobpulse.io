const mongoose = require('mongoose');

/**
 * @swagger
 * components:
 * schemas:
 * Job:
 * type: object
 * required:
 * - title
 * - company
 * - location
 * - jobType
 * - salary
 * - employer
 * properties:
 * title:
 * type: string
 * description: Job title (e.g., "Software Engineer").
 * maxLength: 200
 * company:
 * type: string
 * description: Name of the company posting the job.
 * maxLength: 200
 * location:
 * type: string
 * description: Job location (e.g., "Remote", "New York, NY").
 * maxLength: 200
 * jobType:
 * type: string
 * enum: [Full-time, Part-time, Contract, Internship, Temporary, Remote]
 * description: Type of employment.
 * salary:
 * type: number
 * description: Annual or hourly salary.
 * minimum: 0
 * salaryType:
 * type: string
 * enum: [Annual, Hourly, Monthly, Negotiable]
 * default: Annual
 * description: Type of salary (e.g., Annual, Hourly).
 * description:
 * type: string
 * description: Detailed job description.
 * maxLength: 5000
 * requirements:
 * type: string
 * description: Job requirements.
 * maxLength: 2000
 * responsibilities:
 * type: string
 * description: Job responsibilities.
 * maxLength: 2000
 * benefits:
 * type: string
 * description: Employee benefits.
 * maxLength: 1000
 * applicationDeadline:
 * type: string
 * format: date-time
 * description: Deadline for applications.
 * employer:
 * type: string
 * format: mongoId
 * description: Reference to the Employer who posted this job.
 * isActive:
 * type: boolean
 * description: Whether the job posting is currently active.
 * default: true
 * example:
 * title: "Frontend Developer"
 * company: "Tech Innovations"
 * location: "Remote"
 * jobType: "Full-time"
 * salary: 120000
 * salaryType: "Annual"
 * description: "We are looking for a skilled Frontend Developer..."
 * employer: "60d5ec49b8a8b1a3d4f5e6b9"
 */
const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Job title is required'],
    trim: true,
    maxlength: [200, 'Job title cannot exceed 200 characters']
  },
  company: { // Denormalized for quicker access, but actual company data is in Employer model
    type: String,
    required: [true, 'Company name is required'],
    trim: true,
    maxlength: [200, 'Company name cannot exceed 200 characters']
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true,
    maxlength: [200, 'Location cannot exceed 200 characters']
  },
  jobType: {
    type: String,
    enum: ['Full-time', 'Part-time', 'Contract', 'Internship', 'Temporary', 'Remote'],
    required: [true, 'Job type is required'],
    default: 'Full-time'
  },
  salary: {
    type: Number,
    required: [true, 'Salary is required'],
    min: [0, 'Salary cannot be negative']
  },
  salaryType: {
    type: String,
    enum: ['Annual', 'Hourly', 'Monthly', 'Negotiable'],
    default: 'Annual'
  },
  description: {
    type: String,
    trim: true,
    maxlength: [5000, 'Description cannot exceed 5000 characters']
  },
  requirements: {
    type: String,
    trim: true,
    maxlength: [2000, 'Requirements cannot exceed 2000 characters']
  },
  responsibilities: {
    type: String,
    trim: true,
    maxlength: [2000, 'Responsibilities cannot exceed 2000 characters']
  },
  benefits: {
    type: String,
    trim: true,
    maxlength: [1000, 'Benefits cannot exceed 1000 characters']
  },
  applicationDeadline: {
    type: Date,
    default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // Default 30 days from creation
  },
  employer: { // Reference to the Employer who posted this job
    type: mongoose.Schema.ObjectId,
    ref: 'Employer',
    required: true
  },
  isActive: { // For soft delete or deactivating a job posting
    type: Boolean,
    default: true
  }
}, {
  timestamps: true // Adds createdAt and updatedAt
});

// Create text index for search functionality
jobSchema.index({ title: 'text', company: 'text', location: 'text', description: 'text' });


module.exports = mongoose.model('Job', jobSchema);
