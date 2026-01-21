const mongoose = require('mongoose');

const employerProfileSchema = new mongoose.Schema({
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
  industry: {
    type: String,
    trim: true,
    maxlength: [100, 'Industry cannot exceed 100 characters']
  },
  companySize: {
    type: String, // You could also use an enum here e.g., '1-10', '11-50', etc.
    trim: true
  },
  foundedYear: {
    type: Number,
    min: [1700, 'Founded year seems too old'],
    max: [new Date().getFullYear(), 'Founded year cannot be in the future']
  },
  location: {
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    country: { type: String, trim: true }
  },
  socialLinks: {
    linkedin: {
      type: String,
      trim: true,
      match: [/^https?:\/\/(www\.)?linkedin\.com\/.+/, 'Please enter a valid LinkedIn URL']
    },
    twitter: { // using 'twitter' for X/Twitter
      type: String,
      trim: true
      // match regex if strictly enforcing X/Twitter URLs
    },
    facebook: {
      type: String,
      trim: true
      // match regex if needed
    },
    other: {
      type: String,
      trim: true
    }
  },
  company: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true,
    maxlength: [200, 'Company name cannot exceed 200 characters']
  },
  companyDescription: {
    type: String,
    trim: true,
    maxlength: [1000, 'Company description cannot exceed 1000 characters']
  },
  companyBenefits: {
    type: String, // Storing as HTML/Rich text string
    trim: true
  },
  companyCulture: {
    type: String, // Storing as HTML/Rich text string
    trim: true
  },
  companyWebsite: {
    type: String,
    trim: true,
    match: [/^https?:\/\/.+/, 'Please enter a valid website URL']
  },
  companyLogo: {
    type: String,
    trim: true
  },
  phone: {
    type: String,
    trim: true,
    maxlength: [20, 'Phone number cannot exceed 20 characters']
  },
  address: {
    type: String,
    trim: true,
    maxlength: [200, 'Address cannot exceed 200 characters']
  },
  isProfileComplete: { 
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Virtual for profile completion percentage
employerProfileSchema.virtual('profileCompletion').get(function() {
  let total = 10; // Increased total count for new significant fields
  let filled = 0;
  if (this.companyDescription && this.companyDescription.trim().length > 0) filled++;
  if (this.companyWebsite && this.companyWebsite.trim().length > 0) filled++;
  if (this.companyLogo && this.companyLogo.trim().length > 0) filled++;
  if (this.phone && this.phone.trim().length > 0) filled++;
  if (this.address && this.address.trim().length > 0) filled++;
  
  // New fields completion check
  if (this.industry && this.industry.trim().length > 0) filled++;
  if (this.companySize && this.companySize.trim().length > 0) filled++;
  if (this.foundedYear) filled++;
  if (this.location && (this.location.city || this.location.state || this.location.country)) filled++;
  if (this.socialLinks && (this.socialLinks.linkedin || this.socialLinks.twitter || this.socialLinks.facebook)) filled++;

  return Math.round((filled / total) * 100);
});

employerProfileSchema.set('toObject', { virtuals: true });
employerProfileSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('EmployerProfile', employerProfileSchema);
