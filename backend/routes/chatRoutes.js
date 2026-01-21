const express = require('express');
const { body, param } = require('express-validator');
const router = express.Router();

const {
  getConversations,
  getConversation,
  startConversation,
  sendMessage,
  markConversationAsRead,
  archiveConversation,
  getUnreadCount,
  getMessages
} = require('../controllers/chatController');

const {
  protect,
  requireVerification
} = require('../middleware/authMiddleware');

// Validation middleware
const validateStartConversation = [
  body('applicationId').isMongoId().withMessage('Invalid application ID'),
  body('initialMessage').optional().trim().isLength({ min: 1, max: 5000 }).withMessage('Message must be between 1 and 5000 characters')
];

const validateSendMessage = [
  param('conversationId').isMongoId().withMessage('Invalid conversation ID'),
  body('content').trim().isLength({ min: 1, max: 5000 }).withMessage('Message must be between 1 and 5000 characters'),
  body('type').optional().isIn(['text', 'file', 'image']).withMessage('Invalid message type')
];

const validateConversationId = [
  param('conversationId').isMongoId().withMessage('Invalid conversation ID')
];

// All routes require authentication
router.use(protect, requireVerification);

// Get all conversations
router.get('/conversations', getConversations);

// Get unread count
router.get('/unread-count', getUnreadCount);

// Start a new conversation (employer only)
router.post('/conversations', validateStartConversation, startConversation);

// Get a specific conversation with messages
router.get('/conversations/:conversationId', validateConversationId, getConversation);

// Get messages for a conversation (paginated)
router.get('/conversations/:conversationId/messages', validateConversationId, getMessages);

// Send a message
router.post('/conversations/:conversationId/messages', validateSendMessage, sendMessage);

// Mark conversation as read
router.put('/conversations/:conversationId/read', validateConversationId, markConversationAsRead);

// Archive conversation
router.put('/conversations/:conversationId/archive', validateConversationId, archiveConversation);

module.exports = router;
