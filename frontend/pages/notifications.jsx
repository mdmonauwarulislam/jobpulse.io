import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { 
  FaBell, 
  FaBriefcase, 
  FaEnvelope, 
  FaCheckCircle, 
  FaTimesCircle,
  FaClock,
  FaTrash,
  FaEye,
  FaCheck,
  FaArrowLeft,
  FaUserCheck,
  FaStar,
  FaCalendarAlt,
  FaComment,
  FaHandshake,
  FaCog,
  FaTimes
} from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../utils/api';

export default function Notifications({ isEmbedded = false }) {
  const { user, userType } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState({
    email: true,
    push: true,
    types: {
      application_received: true,
      application_status_changed: true,
      new_message: true,
      interview_scheduled: true,
      job_alert: true
    }
  });

  useEffect(() => {
    fetchNotifications();
    fetchPreferences();
  }, [page, activeFilter]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page,
        limit: 20,
        ...(activeFilter === 'unread' && { unreadOnly: true })
      });
      
      const response = await api.get(`/notifications?${params}`);
      setNotifications(response.data.data.notifications || []);
      setPagination(response.data.data.pagination || {});
    } catch (error) {
      // Fallback to old API
      try {
        const response = await api.get('/users/notifications');
        setNotifications(response.data.data?.notifications || []);
      } catch (e) {
        toast.error('Failed to load notifications');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchPreferences = async () => {
    try {
      const response = await api.get('/notifications/preferences');
      setPreferences(response.data.data.preferences || preferences);
    } catch (error) {
      // Keep default preferences
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await api.put(`/notifications/${notificationId}/read`);
      setNotifications(notifications.map(notif => 
        notif._id === notificationId ? { ...notif, read: true } : notif
      ));
    } catch (error) {
      toast.error('Failed to mark notification as read');
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await api.delete(`/notifications/${notificationId}`);
      setNotifications(notifications.filter(notif => notif._id !== notificationId));
      toast.success('Notification deleted');
    } catch (error) {
      toast.error('Failed to delete notification');
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(notifications.map(notif => ({ ...notif, read: true })));
      toast.success('All notifications marked as read');
    } catch (error) {
      toast.error('Failed to mark all as read');
    }
  };

  const deleteAll = async () => {
    if (!confirm('Are you sure you want to delete all notifications?')) return;
    try {
      await api.delete('/notifications/all');
      setNotifications([]);
      toast.success('All notifications deleted');
    } catch (error) {
      toast.error('Failed to delete notifications');
    }
  };

  const updatePreferences = async () => {
    try {
      await api.put('/notifications/preferences', preferences);
      toast.success('Preferences updated');
      setShowPreferences(false);
    } catch (error) {
      toast.error('Failed to update preferences');
    }
  };

  const handleNotificationClick = (notification) => {
    markAsRead(notification._id);
    
    // Navigate based on notification type
    if (notification.link) {
      router.push(notification.link);
      return;
    }
    
    switch (notification.type) {
      case 'application_received':
        router.push('/employer/applications');
        break;
      case 'application_status_changed':
        router.push('/user/dashboard');
        break;
      case 'new_message':
        if (notification.metadata?.conversationId) {
          router.push(`/messages/${notification.metadata.conversationId}`);
        } else {
          router.push('/messages');
        }
        break;
      case 'interview_scheduled':
        router.push('/user/dashboard');
        break;
      case 'job_alert':
        if (notification.metadata?.jobId) {
          router.push(`/jobs/${notification.metadata.jobId}`);
        }
        break;
      default:
        break;
    }
  };

  const getNotificationIcon = (type) => {
    const icons = {
      application_received: <FaBriefcase className="text-blue-400" />,
      application_status_changed: <FaUserCheck className="text-green-400" />,
      application_viewed: <FaEye className="text-purple-400" />,
      shortlisted: <FaStar className="text-yellow-400" />,
      hired: <FaHandshake className="text-emerald-400" />,
      rejected: <FaTimesCircle className="text-red-400" />,
      new_message: <FaComment className="text-orange-400" />,
      interview_scheduled: <FaCalendarAlt className="text-cyan-400" />,
      job_alert: <FaBell className="text-yellow-400" />,
      profile_view: <FaEye className="text-pink-400" />,
      welcome: <FaCheckCircle className="text-green-400" />,
      job_application: <FaBriefcase className="text-blue-400" />,
      application_update: <FaCheckCircle className="text-green-400" />,
      email: <FaEnvelope className="text-purple-400" />,
      default: <FaBell className="text-gray-400" />
    };
    return icons[type] || icons.default;
  };

  const getNotificationBorder = (type) => {
    const colors = {
      application_received: 'border-l-blue-500',
      application_status_changed: 'border-l-green-500',
      shortlisted: 'border-l-yellow-500',
      hired: 'border-l-emerald-500',
      rejected: 'border-l-red-500',
      new_message: 'border-l-orange-500',
      interview_scheduled: 'border-l-cyan-500',
      job_alert: 'border-l-yellow-500',
      job_application: 'border-l-blue-500',
      application_update: 'border-l-green-500',
      email: 'border-l-purple-500',
      default: 'border-l-gray-500'
    };
    return colors[type] || colors.default;
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} min ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} hrs ago`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)} days ago`;
    return date.toLocaleDateString();
  };

  const filteredNotifications = notifications.filter(notification => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'unread') return !notification.read;
    return notification.type === activeFilter;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <>
      <Head>
        <title>Notifications - JobPulse</title>
        <meta name="description" content="View and manage your notifications" />
      </Head>

      <div className={`min-h-screen ${isEmbedded ? '' : 'bg-black relative overflow-hidden'}`}>
        {/* Background Effects */}
        {!isEmbedded && (
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-red-500/5 to-orange-400/5"></div>
            <motion.div
              className="absolute top-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"
              animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            />
          </div>
        )}

        <div className={`relative z-10 ${isEmbedded ? '' : 'min-h-screen py-8 px-4 sm:px-6 lg:px-8'}`}>
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              {!isEmbedded && (
                <div className="flex items-center space-x-4 mb-4">
                  <Link 
                    href={userType === 'employer' ? '/employer/dashboard' : '/user/dashboard'} 
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <FaArrowLeft className="text-xl" />
                  </Link>
                  <div className="flex-1 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <FaBell className="text-3xl text-orange-500" />
                      <div>
                        <h1 className="text-3xl font-bold text-white">Notifications</h1>
                        <p className="text-gray-400 text-sm">
                                {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowPreferences(true)}
                      className="p-2 text-gray-400 hover:text-white transition-colors"
                      title="Notification Settings"
                    >
                      <FaCog className="text-xl" />
                    </button>
                  </div>
                </div>
              )}
              {isEmbedded && (
                 <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Notifications</h1>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                                {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
                        </p>
                    </div>
                    <button
                      onClick={() => setShowPreferences(true)}
                      className="p-2 text-gray-400 hover:text-white transition-colors"
                      title="Notification Settings"
                    >
                      <FaCog className="text-xl" />
                    </button>
                 </div>
              )}
            </motion.div>

            {/* Filters and Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex flex-wrap items-center justify-between gap-4 mb-6"
            >
              <div className="flex flex-wrap gap-2">
                {['all', 'unread'].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => { setActiveFilter(filter); setPage(1); }}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                      activeFilter === filter
                        ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white'
                        : 'bg-white/5 text-gray-300 hover:bg-white/10'
                    }`}
                  >
                    {filter.charAt(0).toUpperCase() + filter.slice(1)}
                    {filter === 'unread' && unreadCount > 0 && (
                      <span className="ml-2 px-2 py-0.5 bg-white/20 rounded-full text-xs">
                        {unreadCount}
                      </span>
                    )}
                  </button>
                ))}
              </div>
              
              <div className="flex space-x-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-500/20 text-green-300 rounded-full hover:bg-green-500/30 transition-colors text-sm"
                  >
                    <FaCheck />
                    <span>Mark All Read</span>
                  </button>
                )}
                {notifications.length > 0 && (
                  <button
                    onClick={deleteAll}
                    className="flex items-center space-x-2 px-4 py-2 bg-red-500/20 text-red-300 rounded-full hover:bg-red-500/30 transition-colors text-sm"
                  >
                    <FaTrash />
                    <span>Clear All</span>
                  </button>
                )}
              </div>
            </motion.div>

            {/* Notifications List */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-3"
            >
              {loading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-4 animate-pulse">
                      <div className="flex items-start space-x-4">
                        <div className="w-10 h-10 bg-gray-700 rounded-full"></div>
                        <div className="flex-1">
                          <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
                          <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredNotifications.length === 0 ? (
                <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-12 text-center">
                  <FaBell className="text-5xl text-gray-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No notifications</h3>
                  <p className="text-gray-400">
                    {activeFilter === 'unread' 
                      ? "You're all caught up!" 
                      : "You don't have any notifications yet"}
                  </p>
                </div>
              ) : (
                <AnimatePresence>
                  {filteredNotifications.map((notification, index) => (
                    <motion.div
                      key={notification._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => handleNotificationClick(notification)}
                      className={`bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-4 cursor-pointer hover:bg-white/10 transition-all duration-300 border-l-4 ${getNotificationBorder(notification.type)} ${
                        !notification.read ? 'bg-white/[0.08]' : ''
                      }`}
                    >
                      <div className="flex items-start space-x-4">
                        <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center flex-shrink-0">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <h4 className={`font-medium ${notification.read ? 'text-gray-300' : 'text-white'}`}>
                                {notification.title}
                              </h4>
                              <p className="text-gray-400 text-sm mt-1">{notification.message}</p>
                            </div>
                            <div className="flex items-center space-x-2 flex-shrink-0">
                              {!notification.read && (
                                <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                              )}
                              <span className="text-xs text-gray-500">
                                {formatTime(notification.createdAt)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); deleteNotification(notification._id); }}
                          className="p-2 text-gray-500 hover:text-red-400 transition-colors"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between pt-4">
                  <p className="text-sm text-gray-400">
                    Page {pagination.currentPage} of {pagination.totalPages}
                  </p>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={!pagination.hasPrevPage}
                      className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setPage(p => p + 1)}
                      disabled={!pagination.hasNextPage}
                      className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>

        {/* Preferences Modal */}
        <AnimatePresence>
          {showPreferences && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-gray-900 rounded-2xl border border-white/20 p-6 w-full max-w-md"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-white">Notification Settings</h3>
                  <button
                    onClick={() => setShowPreferences(false)}
                    className="p-2 text-gray-400 hover:text-white transition-colors"
                  >
                    <FaTimes />
                  </button>
                </div>
                
                <div className="space-y-6">
                  {/* Delivery Methods */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-300 mb-3">Delivery Methods</h4>
                    <div className="space-y-3">
                      <label className="flex items-center justify-between p-3 bg-white/5 rounded-xl cursor-pointer">
                        <div className="flex items-center space-x-3">
                          <FaEnvelope className="text-orange-500" />
                          <span className="text-white">Email Notifications</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={preferences.email}
                          onChange={(e) => setPreferences(prev => ({ ...prev, email: e.target.checked }))}
                          className="w-5 h-5 text-orange-500 bg-black/50 border-white/20 rounded focus:ring-orange-500"
                        />
                      </label>
                      <label className="flex items-center justify-between p-3 bg-white/5 rounded-xl cursor-pointer">
                        <div className="flex items-center space-x-3">
                          <FaBell className="text-orange-500" />
                          <span className="text-white">Push Notifications</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={preferences.push}
                          onChange={(e) => setPreferences(prev => ({ ...prev, push: e.target.checked }))}
                          className="w-5 h-5 text-orange-500 bg-black/50 border-white/20 rounded focus:ring-orange-500"
                        />
                      </label>
                    </div>
                  </div>

                  {/* Notification Types */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-300 mb-3">Notification Types</h4>
                    <div className="space-y-2">
                      {[
                        { key: 'application_received', label: 'Application Received' },
                        { key: 'application_status_changed', label: 'Application Status Changes' },
                        { key: 'new_message', label: 'New Messages' },
                        { key: 'interview_scheduled', label: 'Interview Scheduled' },
                        { key: 'job_alert', label: 'Job Alerts' }
                      ].map((type) => (
                        <label key={type.key} className="flex items-center justify-between p-2 cursor-pointer">
                          <span className="text-gray-300">{type.label}</span>
                          <input
                            type="checkbox"
                            checked={preferences.types?.[type.key] ?? true}
                            onChange={(e) => setPreferences(prev => ({
                              ...prev,
                              types: { ...prev.types, [type.key]: e.target.checked }
                            }))}
                            className="w-4 h-4 text-orange-500 bg-black/50 border-white/20 rounded focus:ring-orange-500"
                          />
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => setShowPreferences(false)}
                    className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={updatePreferences}
                    className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition-colors"
                  >
                    Save Preferences
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
} 