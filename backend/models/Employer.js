const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const employerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
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
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: {
    type: String,
    select: false
  },
  resetPasswordToken: {
    type: String,
    select: false
  },
  resetPasswordExpire: {
    type: Date,
    select: false
  },
  isActive: { 
    type: Boolean,
    default: true
  },
  isProfileComplete: { 
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Hash password before saving
employerSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next(); 
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Generate verification token
employerSchema.methods.generateVerificationToken = function() {
  const verificationToken = crypto.randomBytes(32).toString('hex');
  this.verificationToken = crypto
    .createHash('sha256')
    .update(verificationToken)
    .digest('hex');
  return verificationToken;
};

// Generate password reset token
employerSchema.methods.generatePasswordResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000; 
  return resetToken;
};

// Compare password
employerSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Clear verification token
employerSchema.methods.clearVerificationToken = function() {
  this.verificationToken = undefined;
  this.isVerified = true;
};

// Clear password reset token
employerSchema.methods.clearPasswordResetToken = function() {
  this.resetPasswordToken = undefined;
  this.resetPasswordExpire = undefined;
};

employerSchema.virtual('profileCompletion').get(function() {
  let total = 5; 
  let filled = 0;
  if (this.companyDescription && this.companyDescription.trim().length > 0) filled++;
  if (this.companyWebsite && this.companyWebsite.trim().length > 0) filled++;
  if (this.companyLogo && this.companyLogo.trim().length > 0) filled++;
  if (this.phone && this.phone.trim().length > 0) filled++;
  if (this.address && this.address.trim().length > 0) filled++;
  return Math.round((filled / total) * 100);
});

employerSchema.set('toObject', { virtuals: true });
employerSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Employer', employerSchema);
