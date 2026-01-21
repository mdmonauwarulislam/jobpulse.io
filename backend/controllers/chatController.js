const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const Application = require('../models/Application');
const Notification = require('../models/Notification');
const asyncHandler = require('../utils/asyncHandler');

/**
 * @desc Get all conversations for the current user
 * @route GET /api/chat/conversations
 * @access Private
 */
const getConversations = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const userType = req.userType;
  const { page = 1, limit = 20, status = 'active' } = req.query;
  
  const skip = (page - 1) * limit;
  
  // Build query based on user type
  const query = { status };
  
  if (userType === 'employer') {
    query.employer = userId;
    query['archivedBy.employer'] = false;
  } else {
    query.applicant = userId;
    query['archivedBy.applicant'] = false;
  }
  
  const conversations = await Conversation.find(query)
    .sort({ lastActivityAt: -1 })
    .skip(skip)
    .limit(parseInt(limit))
    .populate('employer', 'name company companyLogo')
    .populate('applicant', 'name email')
    .populate('job', 'title company')
    .populate('application', 'status')
    .lean();
  
  const total = await Conversation.countDocuments(query);
  const totalPages = Math.ceil(total / limit);
  
  // Add unread count for current user
  const conversationsWithUnread = conversations.map(conv => ({
    ...conv,
    myUnreadCount: userType === 'employer' ? conv.unreadCount.employer : conv.unreadCount.applicant
  }));
  
  res.json({
    success: true,
    data: {
      conversations: conversationsWithUnread,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalConversations: total,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    }
  });
});

/**
 * @desc Get a single conversation with messages
 * @route GET /api/chat/conversations/:conversationId
 * @access Private
 */
const getConversation = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;
  const userId = req.user._id;
  const userType = req.userType;
  const { page = 1, limit = 50 } = req.query;
  
  const conversation = await Conversation.findById(conversationId)
    .populate('employer', 'name company companyLogo email')
    .populate('applicant', 'name email phone resumeUrl')
    .populate('job', 'title company location jobType salary')
    .populate('application', 'status coverLetter appliedAt');
  
  if (!conversation) {
    return res.status(404).json({
      success: false,
      error: 'Conversation not found'
    });
  }
  
  // Check authorization
  const isParticipant = 
    (userType === 'employer' && conversation.employer._id.toString() === userId.toString()) ||
    (userType === 'user' && conversation.applicant._id.toString() === userId.toString());
  
  if (!isParticipant) {
    return res.status(403).json({
      success: false,
      error: 'Not authorized to view this conversation'
    });
  }
  
  // Get messages with pagination
  const messagesData = await Message.getMessages(conversationId, parseInt(page), parseInt(limit));
  
  // Mark messages as read
  const recipientModel = userType === 'employer' ? 'Employer' : 'User';
  await Message.markAllAsRead(conversationId, userId, recipientModel);
  
  // Mark conversation as read
  await conversation.markAsRead(userType === 'employer' ? 'employer' : 'applicant');
  
  res.json({
    success: true,
    data: {
      conversation,
      messages: messagesData.messages,
      pagination: messagesData.pagination
    }
  });
});

/**
 * @desc Start a new conversation (employer only - when shortlisting/contacting applicant)
 * @route POST /api/chat/conversations
 * @access Private (Employer only)
 */
const startConversation = asyncHandler(async (req, res) => {
  const { applicationId, initialMessage } = req.body;
  const employerId = req.user._id;
  
  if (req.userType !== 'employer') {
    return res.status(403).json({
      success: false,
      error: 'Only employers can initiate conversations'
    });
  }
  
  // Get the application
  const application = await Application.findById(applicationId)
    .populate('job')
    .populate('applicant', 'name email');
  
  if (!application) {
    return res.status(404).json({
      success: false,
      error: 'Application not found'
    });
  }
  
  // Verify employer owns this job
  if (application.job.employer.toString() !== employerId.toString()) {
    return res.status(403).json({
      success: false,
      error: 'Not authorized to contact this applicant'
    });
  }
  
  // Check if conversation already exists
  let conversation = await Conversation.findOne({ application: applicationId });
  
  if (conversation) {
    return res.status(400).json({
      success: false,
      error: 'A conversation already exists for this application',
      data: { conversationId: conversation._id }
    });
  }
  
  // Create new conversation
  conversation = await Conversation.create({
    application: applicationId,
    job: application.job._id,
    employer: employerId,
    applicant: application.applicant._id,
    initiatedBy: 'employer'
  });
  
  // Create initial message if provided
  if (initialMessage) {
    await Message.create({
      conversation: conversation._id,
      sender: employerId,
      senderModel: 'Employer',
      content: initialMessage
    });
  }
  
  // Create notification for applicant
  await Notification.createNotification({
    recipient: application.applicant._id,
    recipientModel: 'User',
    type: 'conversation_started',
    title: 'New Message from Employer',
    message: `${req.user.company} has started a conversation about your application for ${application.job.title}.`,
    relatedConversation: conversation._id,
    relatedApplication: applicationId,
    relatedJob: application.job._id,
    actionUrl: `/messages/${conversation._id}`
  });
  
  // Populate and return
  const populatedConversation = await Conversation.findById(conversation._id)
    .populate('employer', 'name company companyLogo')
    .populate('applicant', 'name email')
    .populate('job', 'title company');
  
  res.status(201).json({
    success: true,
    message: 'Conversation started successfully',
    data: { conversation: populatedConversation }
  });
});

/**
 * @desc Send a message in a conversation
 * @route POST /api/chat/conversations/:conversationId/messages
 * @access Private
 */
const sendMessage = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;
  const { content, type = 'text' } = req.body;
  const userId = req.user._id;
  const userType = req.userType;
  
  if (!content || content.trim().length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Message content is required'
    });
  }
  
  const conversation = await Conversation.findById(conversationId)
    .populate('employer', 'name company')
    .populate('applicant', 'name');
  
  if (!conversation) {
    return res.status(404).json({
      success: false,
      error: 'Conversation not found'
    });
  }
  
  // Check authorization
  const isParticipant = 
    (userType === 'employer' && conversation.employer._id.toString() === userId.toString()) ||
    (userType === 'user' && conversation.applicant._id.toString() === userId.toString());
  
  if (!isParticipant) {
    return res.status(403).json({
      success: false,
      error: 'Not authorized to send messages in this conversation'
    });
  }
  
  // Check if conversation is active
  if (conversation.status !== 'active') {
    return res.status(400).json({
      success: false,
      error: 'Cannot send messages to a closed or archived conversation'
    });
  }
  
  // Create message
  const message = await Message.create({
    conversation: conversationId,
    sender: userId,
    senderModel: userType === 'employer' ? 'Employer' : 'User',
    content: content.trim(),
    type
  });
  
  // Create notification for recipient
  const recipientId = userType === 'employer' ? conversation.applicant._id : conversation.employer._id;
  const recipientModel = userType === 'employer' ? 'User' : 'Employer';
  const senderName = userType === 'employer' ? conversation.employer.company : conversation.applicant.name;
  
  await Notification.notifyNewMessage(recipientId, recipientModel, conversationId, senderName);
  
  // Populate sender info
  const populatedMessage = await Message.findById(message._id)
    .populate('sender', 'name email company companyLogo');
  
  res.status(201).json({
    success: true,
    data: { message: populatedMessage }
  });
});

/**
 * @desc Mark conversation as read
 * @route PUT /api/chat/conversations/:conversationId/read
 * @access Private
 */
const markConversationAsRead = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;
  const userId = req.user._id;
  const userType = req.userType;
  
  const conversation = await Conversation.findById(conversationId);
  
  if (!conversation) {
    return res.status(404).json({
      success: false,
      error: 'Conversation not found'
    });
  }
  
  // Check authorization
  const isParticipant = 
    (userType === 'employer' && conversation.employer.toString() === userId.toString()) ||
    (userType === 'user' && conversation.applicant.toString() === userId.toString());
  
  if (!isParticipant) {
    return res.status(403).json({
      success: false,
      error: 'Not authorized'
    });
  }
  
  // Mark all messages as read
  const recipientModel = userType === 'employer' ? 'Employer' : 'User';
  await Message.markAllAsRead(conversationId, userId, recipientModel);
  
  // Mark conversation as read
  await conversation.markAsRead(userType === 'employer' ? 'employer' : 'applicant');
  
  res.json({
    success: true,
    message: 'Conversation marked as read'
  });
});

/**
 * @desc Archive a conversation
 * @route PUT /api/chat/conversations/:conversationId/archive
 * @access Private
 */
const archiveConversation = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;
  const userId = req.user._id;
  const userType = req.userType;
  
  const conversation = await Conversation.findById(conversationId);
  
  if (!conversation) {
    return res.status(404).json({
      success: false,
      error: 'Conversation not found'
    });
  }
  
  // Check authorization
  const isParticipant = 
    (userType === 'employer' && conversation.employer.toString() === userId.toString()) ||
    (userType === 'user' && conversation.applicant.toString() === userId.toString());
  
  if (!isParticipant) {
    return res.status(403).json({
      success: false,
      error: 'Not authorized'
    });
  }
  
  await conversation.archive(userType === 'employer' ? 'employer' : 'applicant');
  
  res.json({
    success: true,
    message: 'Conversation archived'
  });
});

/**
 * @desc Get unread message count
 * @route GET /api/chat/unread-count
 * @access Private
 */
const getUnreadCount = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const userType = req.userType;
  
  const query = { status: 'active' };
  
  if (userType === 'employer') {
    query.employer = userId;
    query['archivedBy.employer'] = false;
  } else {
    query.applicant = userId;
    query['archivedBy.applicant'] = false;
  }
  
  const conversations = await Conversation.find(query).select('unreadCount');
  
  const totalUnread = conversations.reduce((sum, conv) => {
    return sum + (userType === 'employer' ? conv.unreadCount.employer : conv.unreadCount.applicant);
  }, 0);
  
  res.json({
    success: true,
    data: {
      unreadCount: totalUnread,
      conversationsWithUnread: conversations.filter(conv => 
        (userType === 'employer' ? conv.unreadCount.employer : conv.unreadCount.applicant) > 0
      ).length
    }
  });
});

/**
 * @desc Get messages for a conversation (paginated)
 * @route GET /api/chat/conversations/:conversationId/messages
 * @access Private
 */
const getMessages = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;
  const { page = 1, limit = 50 } = req.query;
  const userId = req.user._id;
  const userType = req.userType;
  
  const conversation = await Conversation.findById(conversationId);
  
  if (!conversation) {
    return res.status(404).json({
      success: false,
      error: 'Conversation not found'
    });
  }
  
  // Check authorization
  const isParticipant = 
    (userType === 'employer' && conversation.employer.toString() === userId.toString()) ||
    (userType === 'user' && conversation.applicant.toString() === userId.toString());
  
  if (!isParticipant) {
    return res.status(403).json({
      success: false,
      error: 'Not authorized'
    });
  }
  
  const messagesData = await Message.getMessages(conversationId, parseInt(page), parseInt(limit));
  
  res.json({
    success: true,
    data: messagesData
  });
});

module.exports = {
  getConversations,
  getConversation,
  startConversation,
  sendMessage,
  markConversationAsRead,
  archiveConversation,
  getUnreadCount,
  getMessages
};
