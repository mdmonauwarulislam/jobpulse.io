const mongoose = require('mongoose');

const savedJobSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  note: {
    type: String, // Optional note user can add
    maxlength: 500
  }
}, {
  timestamps: true
});

// Compound index to prevent saving same job multiple times
savedJobSchema.index({ user: 1, job: 1 }, { unique: true });

module.exports = mongoose.model('SavedJob', savedJobSchema);
