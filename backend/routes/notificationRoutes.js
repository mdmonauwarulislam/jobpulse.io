const express = require('express');
const { param } = require('express-validator');
const router = express.Router();

const {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications,
  getPreferences,
  updatePreferences,
  createTestNotification
} = require('../controllers/notificationController');

const {
  protect,
  requireVerification
} = require('../middleware/authMiddleware');

// Validation middleware
const validateNotificationId = [
  param('notificationId').isMongoId().withMessage('Invalid notification ID')
];

// All routes require authentication
router.use(protect, requireVerification);

// Get all notifications (with pagination and filters)
router.get('/', getNotifications);

// Get unread count
router.get('/unread-count', getUnreadCount);

// Get notification preferences
router.get('/preferences', getPreferences);

// Update notification preferences
router.put('/preferences', updatePreferences);

// Mark all as read
router.put('/read-all', markAllAsRead);

// Delete all notifications
router.delete('/all', deleteAllNotifications);

// Mark specific notification as read
router.put('/:notificationId/read', validateNotificationId, markAsRead);

// Delete specific notification
router.delete('/:notificationId', validateNotificationId, deleteNotification);

// Create test notification (for development)
router.post('/test', createTestNotification);

module.exports = router;
