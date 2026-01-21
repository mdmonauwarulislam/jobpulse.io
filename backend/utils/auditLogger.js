const AuditLog = require('../models/AuditLog');

/**
 * Helper to log admin actions
 * @param {Object} params
 * @param {String} params.action - Action name (e.g., 'deleteUser')
 * @param {ObjectId} params.performedBy - Admin user ID
 * @param {String} params.targetType - Target entity type (e.g., 'User')
 * @param {ObjectId} params.targetId - Target entity ID
 * @param {Object} [params.details] - Additional details
 */
async function logAdminAction({ action, performedBy, targetType, targetId, details }) {
  try {
    await AuditLog.create({
      action,
      performedBy,
      targetType,
      targetId,
      details,
    });
  } catch (err) {
    // Log error but do not block main flow
    console.error('Audit log error:', err.message);
  }
}

module.exports = { logAdminAction };
