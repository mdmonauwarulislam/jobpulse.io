const mongoose = require('mongoose');

/**
 * Conversation Model
 * Represents a chat conversation between an employer and a job applicant
 * Created when an employer shortlists/accepts an application or initiates contact
 */
const conversationSchema = new mongoose.Schema({
  // The job application this conversation is related to
  application: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Application',
    required: true
  },
  // The job posting this conversation relates to
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  // Participants in the conversation
  employer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employer',
    required: true
  },
  applicant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Last message preview for listing
  lastMessage: {
    content: {
      type: String,
      trim: true
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'lastMessage.senderModel'
    },
    senderModel: {
      type: String,
      enum: ['User', 'Employer']
    },
    sentAt: {
      type: Date
    }
  },
  // Unread count for each participant
  unreadCount: {
    employer: {
      type: Number,
      default: 0
    },
    applicant: {
      type: Number,
      default: 0
    }
  },
  // Conversation status
  status: {
    type: String,
    enum: ['active', 'archived', 'closed'],
    default: 'active'
  },
  // Who initiated the conversation
  initiatedBy: {
    type: String,
    enum: ['employer', 'applicant'],
    required: true
  },
  // Timestamps for last activity
  lastActivityAt: {
    type: Date,
    default: Date.now
  },
  // Archived by participants
  archivedBy: {
    employer: {
      type: Boolean,
      default: false
    },
    applicant: {
      type: Boolean,
      default: false
    }
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
conversationSchema.index({ employer: 1, lastActivityAt: -1 });
conversationSchema.index({ applicant: 1, lastActivityAt: -1 });
conversationSchema.index({ application: 1 }, { unique: true });
conversationSchema.index({ status: 1 });

// Method to update last message
conversationSchema.methods.updateLastMessage = function(message) {
  this.lastMessage = {
    content: message.content.substring(0, 100), 
    sender: message.sender,
    senderModel: message.senderModel,
    sentAt: message.createdAt || new Date()
  };
  this.lastActivityAt = new Date();
  return this.save();
};

// Method to mark as read by a participant
conversationSchema.methods.markAsRead = function(participantType) {
  if (participantType === 'employer') {
    this.unreadCount.employer = 0;
  } else if (participantType === 'applicant') {
    this.unreadCount.applicant = 0;
  }
  return this.save();
};

// Method to increment unread count
conversationSchema.methods.incrementUnread = function(participantType) {
  if (participantType === 'employer') {
    this.unreadCount.employer += 1;
  } else if (participantType === 'applicant') {
    this.unreadCount.applicant += 1;
  }
  return this.save();
};

// Method to archive conversation
conversationSchema.methods.archive = function(participantType) {
  if (participantType === 'employer') {
    this.archivedBy.employer = true;
  } else if (participantType === 'applicant') {
    this.archivedBy.applicant = true;
  }
  
  // If both archived, set status to archived
  if (this.archivedBy.employer && this.archivedBy.applicant) {
    this.status = 'archived';
  }
  return this.save();
};

// Static method to find or create conversation
conversationSchema.statics.findOrCreate = async function(applicationId, jobId, employerId, applicantId, initiatedBy) {
  let conversation = await this.findOne({ application: applicationId });
  
  if (!conversation) {
    conversation = await this.create({
      application: applicationId,
      job: jobId,
      employer: employerId,
      applicant: applicantId,
      initiatedBy
    });
  }
  
  return conversation;
};

// Virtual for total unread
conversationSchema.virtual('totalUnread').get(function() {
  return this.unreadCount.employer + this.unreadCount.applicant;
});

const Conversation = mongoose.model('Conversation', conversationSchema);

module.exports = Conversation;
