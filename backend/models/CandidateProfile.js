const mongoose = require('mongoose');

const educationSchema = new mongoose.Schema({
  degree: {
    type: String,
    required: [true, 'Degree is required'],
    trim: true,
    maxlength: [100, 'Degree cannot exceed 100 characters']
  },
  institution: {
    type: String,
    required: [true, 'Institution is required'],
    trim: true,
    maxlength: [200, 'Institution cannot exceed 200 characters']
  },
  year: {
    type: String,
    required: [true, 'Year is required'],
    trim: true,
    maxlength: [10, 'Year cannot exceed 10 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  }
});

const experienceSchema = new mongoose.Schema({
  jobTitle: {
    type: String,
    required: [true, 'Job title is required'],
    trim: true,
    maxlength: [100, 'Job title cannot exceed 100 characters']
  },
  company: {
    type: String,
    required: [true, 'Company is required'],
    trim: true,
    maxlength: [200, 'Company cannot exceed 200 characters']
  },
  duration: {
    type: String,
    required: [true, 'Duration is required'],
    trim: true,
    maxlength: [50, 'Duration cannot exceed 50 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  }
});

const candidateProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  phone: {
    type: String,
    trim: true,
    maxlength: [20, 'Phone number cannot exceed 20 characters']
  },
  location: {
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    country: { type: String, trim: true }
  },
  summary: {
    type: String,
    trim: true,
    maxlength: [1000, 'Summary cannot exceed 1000 characters']
  },
  education: [educationSchema],
  experience: [experienceSchema],
  skills: [{
    type: String,
    trim: true
  }],
  profilePic: {
    type: String,
    trim: true
  },
  resumeUrl: {
    type: String,
    trim: true
  },
  resumePublicId: {
    type: String,
    trim: true
  },
  isProfileComplete: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Virtual for profile completion percentage
candidateProfileSchema.virtual('profileCompletion').get(function() {
  const totalRequiredFields = 7; // Increased by 1 for profilePic or location granularity, let's say 7
  // phone, location, summary, education, experience, skills, profilePic
  let filledFields = 0;

  if (this.phone && this.phone.trim().length > 0) filledFields++;
  if (this.location && (this.location.city || this.location.state || this.location.country)) filledFields++;
  if (this.summary && this.summary.trim().length > 0) filledFields++;
  if (this.education && Array.isArray(this.education) && this.education.length > 0) filledFields++;
  if (this.experience && Array.isArray(this.experience) && this.experience.length > 0) filledFields++;
  if (this.skills && Array.isArray(this.skills) && this.skills.length > 0) filledFields++;
  if (this.profilePic && this.profilePic.trim().length > 0) filledFields++;

  return Math.round((filledFields / totalRequiredFields) * 100);
});

candidateProfileSchema.set('toObject', { virtuals: true });
candidateProfileSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('CandidateProfile', candidateProfileSchema);
