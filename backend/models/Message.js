const mongoose = require('mongoose');

/**
 * Message Model
 * Represents individual messages within a conversation
 */
const messageSchema = new mongoose.Schema({
  // The conversation this message belongs to
  conversation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true
  },
  // Message sender (can be User or Employer)
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'senderModel'
  },
  senderModel: {
    type: String,
    required: true,
    enum: ['User', 'Employer']
  },
  // Message content
  content: {
    type: String,
    required: [true, 'Message content is required'],
    trim: true,
    maxlength: [5000, 'Message cannot exceed 5000 characters']
  },
  // Message type
  type: {
    type: String,
    enum: ['text', 'file', 'image', 'system'],
    default: 'text'
  },
  // File attachment (if any)
  attachment: {
    filename: String,
    originalName: String,
    mimetype: String,
    size: Number,
    url: String
  },
  // Read status
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date
  },
  // For system messages (e.g., "Application status changed to shortlisted")
  systemMessageType: {
    type: String,
    enum: ['status_change', 'interview_scheduled', 'offer_made', 'general'],
    default: null
  },
  // Message metadata
  metadata: {
    type: mongoose.Schema.Types.Mixed
  },
  // Soft delete
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
messageSchema.index({ conversation: 1, createdAt: -1 });
messageSchema.index({ sender: 1, senderModel: 1 });
messageSchema.index({ isRead: 1, conversation: 1 });

// Pre-save hook to update conversation's last message
messageSchema.post('save', async function(doc) {
  try {
    const Conversation = mongoose.model('Conversation');
    const conversation = await Conversation.findById(doc.conversation);
    
    if (conversation) {
      // Update last message
      conversation.lastMessage = {
        content: doc.content.substring(0, 100),
        sender: doc.sender,
        senderModel: doc.senderModel,
        sentAt: doc.createdAt
      };
      conversation.lastActivityAt = doc.createdAt;
      
      // Increment unread count for the recipient
      if (doc.senderModel === 'Employer') {
        conversation.unreadCount.applicant += 1;
      } else {
        conversation.unreadCount.employer += 1;
      }
      
      await conversation.save();
    }
  } catch (error) {
    console.error('Error updating conversation after message save:', error);
  }
});

// Method to mark as read
messageSchema.methods.markAsRead = function() {
  if (!this.isRead) {
    this.isRead = true;
    this.readAt = new Date();
    return this.save();
  }
  return Promise.resolve(this);
};

// Method to soft delete
messageSchema.methods.softDelete = function() {
  this.isDeleted = true;
  this.deletedAt = new Date();
  return this.save();
};

// Static method to mark all messages as read in a conversation
messageSchema.statics.markAllAsRead = async function(conversationId, recipientId, recipientModel) {
  const result = await this.updateMany(
    {
      conversation: conversationId,
      sender: { $ne: recipientId },
      isRead: false
    },
    {
      $set: {
        isRead: true,
        readAt: new Date()
      }
    }
  );
  
  // Update conversation unread count
  const Conversation = mongoose.model('Conversation');
  const conversation = await Conversation.findById(conversationId);
  if (conversation) {
    if (recipientModel === 'Employer') {
      conversation.unreadCount.employer = 0;
    } else {
      conversation.unreadCount.applicant = 0;
    }
    await conversation.save();
  }
  
  return result;
};

// Static method to get messages with pagination
messageSchema.statics.getMessages = async function(conversationId, page = 1, limit = 50) {
  const skip = (page - 1) * limit;
  
  const messages = await this.find({
    conversation: conversationId,
    isDeleted: false
  })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('sender', 'name email companyLogo')
    .lean();
  
  const total = await this.countDocuments({
    conversation: conversationId,
    isDeleted: false
  });
  
  return {
    messages: messages.reverse(), 
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalMessages: total,
      hasNextPage: page < Math.ceil(total / limit),
      hasPrevPage: page > 1
    }
  };
};

// Static method to create system message
messageSchema.statics.createSystemMessage = async function(conversationId, content, systemMessageType, metadata = {}) {
  const Conversation = mongoose.model('Conversation');
  const conversation = await Conversation.findById(conversationId);
  
  if (!conversation) {
    throw new Error('Conversation not found');
  }
  
  const message = await this.create({
    conversation: conversationId,
    sender: conversation.employer, 
    senderModel: 'Employer',
    content,
    type: 'system',
    systemMessageType,
    metadata
  });
  
  return message;
};

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
