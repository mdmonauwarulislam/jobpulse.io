const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: [true, 'Job is required']
  },
  applicant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Applicant is required']
  },
  coverLetter: {
    type: String,
    trim: true,
    maxlength: [2000, 'Cover letter cannot exceed 2000 characters']
  },
  resumeUrl: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'shortlisted', 'rejected', 'hired'],
    default: 'pending'
  },
  employerNotes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },
  isWithdrawn: {
    type: Boolean,
    default: false
  },
  withdrawnAt: {
    type: Date
  },
  appliedAt: {
    type: Date,
    default: Date.now
  },
  reviewedAt: {
    type: Date
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'reviewedByModel'
  },
  reviewedByModel: {
    type: String,
    enum: ['Employer', 'User'] 
  }
}, {
  timestamps: true
});

// Index for efficient queries
applicationSchema.index({ job: 1, applicant: 1 }, { unique: true });
applicationSchema.index({ applicant: 1, status: 1 });
applicationSchema.index({ job: 1, status: 1 });

// Virtual for application age
applicationSchema.virtual('ageInDays').get(function() {
  const now = new Date();
  const applied = this.appliedAt || this.createdAt;
  const diffTime = Math.abs(now - applied);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Method to mark as reviewed
applicationSchema.methods.markAsReviewed = function(reviewerId, reviewerModel, notes = '') {
  this.status = 'reviewed';
  this.reviewedAt = new Date();
  this.reviewedBy = reviewerId;
  this.reviewedByModel = reviewerModel;
  if (notes) {
    this.employerNotes = notes;
  }
  return this.save();
};

// Method to update status
applicationSchema.methods.updateStatus = function(status, notes = '') {
  this.status = status;
  if (status === 'reviewed' && !this.reviewedAt) {
    this.reviewedAt = new Date();
  }
  if (notes) {
    this.employerNotes = notes;
  }
  return this.save();
};

// Method to withdraw application
applicationSchema.methods.withdraw = function() {
  this.isWithdrawn = true;
  this.withdrawnAt = new Date();
  return this.save();
};

// Ensure virtual fields are serialized
applicationSchema.set('toJSON', { virtuals: true });
applicationSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Application', applicationSchema); 