
import { useState, useEffect } from 'react';
import Head from 'next/head';
import { motion } from 'framer-motion';
import { FaBell, FaCheckCircle, FaTimesCircle, FaPaperPlane } from 'react-icons/fa';
import { api } from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/router';

export default function AdminNotifications() {
  const { userType } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    title: '',
    message: '',
    type: 'system_announcement',
    priority: 'normal',
    recipient: '',
    recipientModel: '',
  });
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (userType !== 'admin') {
      router.push('/');
      return;
    }
    fetchNotifications();
  }, [userType]);


  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/notifications');
      setNotifications(response.data.data.notifications || []);
    } catch (error) {
      // fallback: show nothing
    } finally {
      setLoading(false);
    }
  };


  // Admin can only delete, not mark as read for others, so just remove this button


  const handleDelete = async (notificationId) => {
    try {
      await api.delete(`/admin/notifications/${notificationId}`);
      fetchNotifications();
    } catch {}
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSend = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      const payload = {
        title: form.title,
        message: form.message,
        type: form.type,
        priority: form.priority,
      };
      if (form.recipient) payload.recipient = form.recipient;
      if (form.recipientModel) payload.recipientModel = form.recipientModel;
      await api.post('/admin/notifications', payload);
      setForm({ title: '', message: '', type: 'system_announcement', priority: 'normal', recipient: '', recipientModel: '' });
      fetchNotifications();
    } catch {}
    setSending(false);
  };

  return (
    <>
      <Head>
        <title>Admin Notifications - JobPulse</title>
        <meta name="description" content="Admin notifications management" />
      </Head>
      <div className="min-h-screen bg-black py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <div className="flex items-center space-x-3 mb-2">
              <FaBell className="text-3xl text-orange-500" />
              <h1 className="text-3xl font-bold text-white">Admin Notifications</h1>
            </div>
            <p className="text-gray-400">View, send, and manage all system notifications.</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 mb-8">
            <form onSubmit={handleSend} className="space-y-4">
              <div className="flex flex-col md:flex-row md:space-x-4">
                <input name="title" value={form.title} onChange={handleFormChange} required placeholder="Title" className="flex-1 mb-2 md:mb-0 px-3 py-2 rounded bg-black/40 border border-white/10 text-white" />
                <input name="message" value={form.message} onChange={handleFormChange} required placeholder="Message" className="flex-1 px-3 py-2 rounded bg-black/40 border border-white/10 text-white" />
              </div>
              <div className="flex flex-col md:flex-row md:space-x-4">
                <select name="type" value={form.type} onChange={handleFormChange} className="mb-2 md:mb-0 px-3 py-2 rounded bg-black/40 border border-white/10 text-white">
                  <option value="system_announcement">System Announcement</option>
                  <option value="maintenance_notice">Maintenance Notice</option>
                  <option value="job_posted">Job Posted</option>
                  <option value="welcome">Welcome</option>
                </select>
                <select name="priority" value={form.priority} onChange={handleFormChange} className="px-3 py-2 rounded bg-black/40 border border-white/10 text-white">
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div className="flex flex-col md:flex-row md:space-x-4">
                <input name="recipient" value={form.recipient} onChange={handleFormChange} placeholder="Recipient ID (optional)" className="flex-1 mb-2 md:mb-0 px-3 py-2 rounded bg-black/40 border border-white/10 text-white" />
                <select name="recipientModel" value={form.recipientModel} onChange={handleFormChange} className="px-3 py-2 rounded bg-black/40 border border-white/10 text-white">
                  <option value="">All</option>
                  <option value="User">User</option>
                  <option value="Employer">Employer</option>
                </select>
              </div>
              <button type="submit" disabled={sending} className="flex items-center space-x-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded shadow">
                <FaPaperPlane />
                <span>{sending ? 'Sending...' : 'Send Notification'}</span>
              </button>
            </form>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                <FaBell className="text-5xl mx-auto mb-4 opacity-50" />
                <p>No notifications found</p>
              </div>
            ) : (
              <ul className="divide-y divide-white/10">
                {notifications.map((n) => (
                  <li key={n._id} className="flex items-center justify-between py-4">
                    <div>
                      <div className="text-white font-medium">{n.title || n.message}</div>
                      <div className="text-gray-400 text-sm">{n.createdAt ? new Date(n.createdAt).toLocaleString() : ''}</div>
                      <div className="text-xs text-gray-500">{n.type} | {n.priority}</div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button onClick={() => handleDelete(n._id)} className="p-2 text-red-400 hover:text-red-300" title="Delete">
                        <FaTimesCircle />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </motion.div>
        </div>
      </div>
    </>
  );
}
