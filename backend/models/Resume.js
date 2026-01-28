const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const ResumeSchema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true,
    maxlength: [50, 'Title can not be more than 50 characters'],
    default: 'My Resume'
  },
  personalInfo: {
    fullName: { type: String, default: '' },
    email: { type: String, default: '' },
    phone: { type: String, default: '' },
    address: { type: String, default: '' },
    website: { type: String, default: '' },
    linkedin: { type: String, default: '' },
    github: { type: String, default: '' },
    summary: { type: String, default: '' }
  },
  education: [{
    institution: { type: String, default: '' },
    degree: { type: String, default: '' },
    fieldOfStudy: { type: String, default: '' },
    startDate: { type: String, default: '' },
    endDate: { type: String, default: '' },
    current: { type: Boolean, default: false },
    description: { type: String, default: '' }
  }],
  experience: [{
    company: { type: String, default: '' },
    title: { type: String, default: '' },
    location: { type: String, default: '' },
    startDate: { type: String, default: '' },
    endDate: { type: String, default: '' },
    current: { type: Boolean, default: false },
    description: { type: String, default: '' }
  }],
  skills: {
    type: [String],
    default: []
  },
  projects: [{
    title: { type: String, default: '' },
    description: { type: String, default: '' },
    technologies: { type: [String], default: [] },
    link: { type: String, default: '' }
  }],
  languages: [{
    language: { type: String, default: '' },
    proficiency: { type: String, default: '' }
  }],
  socialLinks: [{
    platform: { type: String, default: '' },
    url: { type: String, default: '' }
  }],
  // The raw JSON content for the editor. 
  // We keep the structured fields above for easier querying/indexing if needed, 
  // but the 'contentJson' will be the source of truth for the JSON editor.
  contentJson: {
    type: Object,
    default: {} 
  },
  templateId: {
    type: String,
    default: 'modern'
  },
  // Visual settings (margins, fonts, colors)
  settings: {
    type: Object,
    default: {}
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update updated_at on save
ResumeSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Resume', ResumeSchema);
