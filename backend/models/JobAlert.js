const mongoose = require('mongoose');

const jobAlertSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: { // Name of the alert, e.g., "Frontend remote jobs"
    type: String, 
    required: true,
    trim: true
  },
  keywords: {
    type: String,
    trim: true
  },
  location: {
    type: String,
    trim: true
  },
  jobType: {
    type: String,
    enum: ['Full-time', 'Part-time', 'Contract', 'Internship', 'Temporary', 'Remote', 'Any'],
    default: 'Any'
  },
  minSalary: {
    type: Number
  },
  frequency: {
    type: String,
    enum: ['daily', 'weekly'],
    default: 'daily'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastSent: {
    type: Date
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('JobAlert', jobAlertSchema);
