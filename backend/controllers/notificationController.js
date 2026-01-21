const Notification = require('../models/Notification');
const asyncHandler = require('../utils/asyncHandler');

/**
 * @desc Get all notifications for the current user
 * @route GET /api/notifications
 * @access Private
 */
const getNotifications = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const userType = req.userType;
  const { page = 1, limit = 20, type, unreadOnly = false } = req.query;
  
  const recipientModel = userType === 'employer' ? 'Employer' : 'User';
  
  const result = await Notification.getNotifications(userId, recipientModel, {
    page: parseInt(page),
    limit: parseInt(limit),
    type,
    unreadOnly: unreadOnly === 'true'
  });
  
  res.json({
    success: true,
    data: result
  });
});

/**
 * @desc Get unread notification count
 * @route GET /api/notifications/unread-count
 * @access Private
 */
const getUnreadCount = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const userType = req.userType;
  
  const recipientModel = userType === 'employer' ? 'Employer' : 'User';
  const count = await Notification.getUnreadCount(userId, recipientModel);
  
  res.json({
    success: true,
    data: { unreadCount: count }
  });
});

/**
 * @desc Mark a notification as read
 * @route PUT /api/notifications/:notificationId/read
 * @access Private
 */
const markAsRead = asyncHandler(async (req, res) => {
  const { notificationId } = req.params;
  const userId = req.user._id;
  const userType = req.userType;
  
  const recipientModel = userType === 'employer' ? 'Employer' : 'User';
  
  const notification = await Notification.findOne({
    _id: notificationId,
    recipient: userId,
    recipientModel
  });
  
  if (!notification) {
    return res.status(404).json({
      success: false,
      error: 'Notification not found'
    });
  }
  
  await notification.markAsRead();
  
  res.json({
    success: true,
    message: 'Notification marked as read'
  });
});

/**
 * @desc Mark all notifications as read
 * @route PUT /api/notifications/read-all
 * @access Private
 */
const markAllAsRead = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const userType = req.userType;
  
  const recipientModel = userType === 'employer' ? 'Employer' : 'User';
  
  const result = await Notification.markAllAsRead(userId, recipientModel);
  
  res.json({
    success: true,
    message: 'All notifications marked as read',
    data: { modifiedCount: result.modifiedCount }
  });
});

/**
 * @desc Delete a notification
 * @route DELETE /api/notifications/:notificationId
 * @access Private
 */
const deleteNotification = asyncHandler(async (req, res) => {
  const { notificationId } = req.params;
  const userId = req.user._id;
  const userType = req.userType;
  
  const recipientModel = userType === 'employer' ? 'Employer' : 'User';
  
  const notification = await Notification.findOneAndDelete({
    _id: notificationId,
    recipient: userId,
    recipientModel
  });
  
  if (!notification) {
    return res.status(404).json({
      success: false,
      error: 'Notification not found'
    });
  }
  
  res.json({
    success: true,
    message: 'Notification deleted'
  });
});

/**
 * @desc Delete all notifications
 * @route DELETE /api/notifications/all
 * @access Private
 */
const deleteAllNotifications = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const userType = req.userType;
  
  const recipientModel = userType === 'employer' ? 'Employer' : 'User';
  
  const result = await Notification.deleteMany({
    recipient: userId,
    recipientModel
  });
  
  res.json({
    success: true,
    message: 'All notifications deleted',
    data: { deletedCount: result.deletedCount }
  });
});

/**
 * @desc Get notification preferences (placeholder for future)
 * @route GET /api/notifications/preferences
 * @access Private
 */
const getPreferences = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: {
      preferences: {
        email: {
          applicationReceived: true,
          applicationStatusChanged: true,
          newMessage: true,
          jobExpiring: true,
          systemAnnouncements: true
        },
        push: {
          applicationReceived: true,
          applicationStatusChanged: true,
          newMessage: true,
          jobExpiring: false,
          systemAnnouncements: false
        },
        inApp: {
          all: true
        }
      }
    }
  });
});

/**
 * @desc Update notification preferences (placeholder for future)
 * @route PUT /api/notifications/preferences
 * @access Private
 */
const updatePreferences = asyncHandler(async (req, res) => {
  const { preferences } = req.body;
  
  res.json({
    success: true,
    message: 'Notification preferences updated',
    data: { preferences }
  });
});

/**
 * @desc Create a test notification (for development)
 * @route POST /api/notifications/test
 * @access Private (Admin only in production)
 */
const createTestNotification = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const userType = req.userType;
  
  const recipientModel = userType === 'employer' ? 'Employer' : 'User';
  
  const notification = await Notification.createNotification({
    recipient: userId,
    recipientModel,
    type: 'system_announcement',
    title: 'Test Notification',
    message: 'This is a test notification to verify the notification system is working correctly.',
    priority: 'normal'
  });
  
  res.status(201).json({
    success: true,
    message: 'Test notification created',
    data: { notification }
  });
});

module.exports = {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications,
  getPreferences,
  updatePreferences,
  createTestNotification
};
