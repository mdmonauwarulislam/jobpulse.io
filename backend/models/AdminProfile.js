const mongoose = require('mongoose');

const adminProfileSchema = new mongoose.Schema({
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
  roleLevel: {
    type: String,
    enum: ['super_admin', 'moderator', 'support'],
    default: 'super_admin'
  },
  permissions: [{
    type: String,
    enum: ['manage_users', 'manage_jobs', 'manage_content', 'view_reports', 'full_access']
  }],
  lastLogin: {
    type: Date
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('AdminProfile', adminProfileSchema);
