const mongoose = require('mongoose');

/**
 * Notification Model
 * Represents system notifications for users and employers
 */
const notificationSchema = new mongoose.Schema({
  // Recipient of the notification
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'recipientModel'
  },
  recipientModel: {
    type: String,
    required: true,
    enum: ['User', 'Employer']
  },
  // Notification type
  type: {
    type: String,
    required: true,
    enum: [
      // Application notifications
      'application_received',      
      'application_viewed',        
      'application_status_changed', 
      'application_withdrawn',     
      
      // Chat notifications
      'new_message',               
      'conversation_started',      
      
      // Job notifications
      'job_posted',                
      'job_expiring',              
      'job_expired',                      
      'job_match',                 
      
      // Account notifications
      'profile_incomplete',        
      'account_verified',          
      'password_changed',          
      
      // Interview notifications
      'interview_scheduled',       
      'interview_reminder',        
      'interview_cancelled',       
      
      // System notifications
      'system_announcement',       
      'maintenance_notice',        
      'welcome'                    
    ]
  },
  // Notification title
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  // Notification message
  message: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  // Related entities (for navigation)
  relatedJob: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job'
  },
  relatedApplication: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Application'
  },
  relatedConversation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation'
  },
  relatedUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  relatedEmployer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employer'
  },
  // Action URL for the notification
  actionUrl: {
    type: String,
    trim: true
  },
  // Read status
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date
  },
  // Email notification sent
  emailSent: {
    type: Boolean,
    default: false
  },
  emailSentAt: {
    type: Date
  },
  // Push notification sent
  pushSent: {
    type: Boolean,
    default: false
  },
  pushSentAt: {
    type: Date
  },
  // Priority level
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  // Expiration (optional - for time-sensitive notifications)
  expiresAt: {
    type: Date
  },
  // Metadata for additional data
  metadata: {
    type: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
notificationSchema.index({ recipient: 1, recipientModel: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, recipientModel: 1, isRead: 1 });
notificationSchema.index({ type: 1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); 

// Method to mark as read
notificationSchema.methods.markAsRead = function() {
  if (!this.isRead) {
    this.isRead = true;
    this.readAt = new Date();
    return this.save();
  }
  return Promise.resolve(this);
};

// Static method to mark all as read for a user
notificationSchema.statics.markAllAsRead = async function(recipientId, recipientModel) {
  return this.updateMany(
    {
      recipient: recipientId,
      recipientModel: recipientModel,
      isRead: false
    },
    {
      $set: {
        isRead: true,
        readAt: new Date()
      }
    }
  );
};

// Static method to get unread count
notificationSchema.statics.getUnreadCount = async function(recipientId, recipientModel) {
  return this.countDocuments({
    recipient: recipientId,
    recipientModel: recipientModel,
    isRead: false
  });
};

// Static method to get notifications with pagination
notificationSchema.statics.getNotifications = async function(recipientId, recipientModel, options = {}) {
  const {
    page = 1,
    limit = 20,
    type = null,
    unreadOnly = false
  } = options;
  
  const skip = (page - 1) * limit;
  
  const filter = {
    recipient: recipientId,
    recipientModel: recipientModel
  };
  
  if (type) {
    filter.type = type;
  }
  
  if (unreadOnly) {
    filter.isRead = false;
  }
  
  const notifications = await this.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('relatedJob', 'title company')
    .populate('relatedApplication', 'status')
    .populate('relatedUser', 'name email')
    .populate('relatedEmployer', 'name company')
    .lean();
  
  const total = await this.countDocuments(filter);
  
  return {
    notifications,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalNotifications: total,
      hasNextPage: page < Math.ceil(total / limit),
      hasPrevPage: page > 1
    }
  };
};

// Static method to create notification helper
notificationSchema.statics.createNotification = async function(data) {
  const notification = await this.create(data);
  return notification;
};

// Static helper methods for common notification types
notificationSchema.statics.notifyApplicationReceived = async function(employerId, applicationId, jobId, applicantName, jobTitle) {
  return this.createNotification({
    recipient: employerId,
    recipientModel: 'Employer',
    type: 'application_received',
    title: 'New Application Received',
    message: `${applicantName} has applied for the ${jobTitle} position.`,
    relatedApplication: applicationId,
    relatedJob: jobId,
    actionUrl: `/employer/applications/${applicationId}`,
    priority: 'normal'
  });
};

notificationSchema.statics.notifyApplicationStatusChanged = async function(applicantId, applicationId, jobId, status, jobTitle, companyName) {
  const statusMessages = {
    reviewed: `Your application for ${jobTitle} at ${companyName} has been reviewed.`,
    shortlisted: `Congratulations! You've been shortlisted for ${jobTitle} at ${companyName}.`,
    rejected: `Your application for ${jobTitle} at ${companyName} was not selected to move forward.`,
    hired: `Congratulations! You've been hired for ${jobTitle} at ${companyName}!`
  };
  
  const priorities = {
    reviewed: 'normal',
    shortlisted: 'high',
    rejected: 'normal',
    hired: 'urgent'
  };
  
  return this.createNotification({
    recipient: applicantId,
    recipientModel: 'User',
    type: 'application_status_changed',
    title: `Application ${status.charAt(0).toUpperCase() + status.slice(1)}`,
    message: statusMessages[status] || `Your application status has been updated to ${status}.`,
    relatedApplication: applicationId,
    relatedJob: jobId,
    actionUrl: `/user/applications/${applicationId}`,
    priority: priorities[status] || 'normal',
    metadata: { status }
  });
};

notificationSchema.statics.notifyNewMessage = async function(recipientId, recipientModel, conversationId, senderName) {
  return this.createNotification({
    recipient: recipientId,
    recipientModel: recipientModel,
    type: 'new_message',
    title: 'New Message',
    message: `You have a new message from ${senderName}.`,
    relatedConversation: conversationId,
    actionUrl: `/messages/${conversationId}`,
    priority: 'normal'
  });
};

notificationSchema.statics.notifyInterviewScheduled = async function(applicantId, applicationId, jobId, jobTitle, companyName, interviewDate) {
  return this.createNotification({
    recipient: applicantId,
    recipientModel: 'User',
    type: 'interview_scheduled',
    title: 'Interview Scheduled',
    message: `Your interview for ${jobTitle} at ${companyName} has been scheduled for ${interviewDate}.`,
    relatedApplication: applicationId,
    relatedJob: jobId,
    actionUrl: `/user/applications/${applicationId}`,
    priority: 'high',
    metadata: { interviewDate }
  });
};

// Delete old notifications (cleanup job)
notificationSchema.statics.deleteOldNotifications = async function(daysOld = 90) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);
  
  return this.deleteMany({
    createdAt: { $lt: cutoffDate },
    isRead: true
  });
};

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
