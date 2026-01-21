import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
  FaUsers,
  FaSearch,
  FaEye,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaArrowLeft,
  FaBriefcase,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaFileAlt,
  FaComment,
  FaStar,
  FaCalendarAlt,
  FaUserCheck,
  FaTimes,
  FaVideo,
  FaMapMarker
} from 'react-icons/fa';

import { api } from '../../../utils/api';
import { useAuth } from '../../../contexts/AuthContext';
import { useRouter } from 'next/router';
import { withAuth } from '../../../utils/withAuth';
import DashboardLayout from '../../../components/DashboardLayout';

function EmployerApplications() {
  const { user, userType, loading: authLoading } = useAuth();
  const router = useRouter();

  const [applications, setApplications] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [jobFilter, setJobFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});

  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showInterviewModal, setShowInterviewModal] = useState(false);

  const [newStatus, setNewStatus] = useState('');
  const [statusNotes, setStatusNotes] = useState('');

  const [interviewData, setInterviewData] = useState({
    scheduledDate: '',
    scheduledTime: '',
    type: 'video',
    location: '',
    meetingLink: '',
    notes: ''
  });

  const hasFetchedJobsRef = useRef(false);

  /* ---------------- FETCH JOBS ---------------- */
  const fetchJobs = async () => {
    try {
      const res = await api.get('/employers/jobs?limit=100');
      setJobs(res.data.data.jobs || []);
    } catch (err) {
      console.error(err);
    }
  };

  /* ---------------- FETCH APPLICATIONS ---------------- */
  const fetchApplications = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page,
        limit: 10,
        ...(statusFilter && { status: statusFilter }),
        ...(jobFilter && { jobId: jobFilter })
      });

      const res = await api.get(`/employers/applications?${params}`);
      setApplications(res.data.data.applications || []);
      setPagination(res.data.data.pagination || {});
    } catch (err) {
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- FETCH APPLICATION DETAILS ---------------- */
  const fetchApplicationDetails = async (applicationId) => {
    try {
      setLoadingDetails(true);
      const res = await api.get(`/employers/applications/${applicationId}`);
      setSelectedApplication(res.data.data.application);
      setShowDetailModal(true);
    } catch (err) {
      toast.error('Failed to load application details');
    } finally {
      setLoadingDetails(false);
    }
  };

  /* ---------------- EFFECT ---------------- */
  useEffect(() => {
    if (authLoading) return;

    if (userType !== 'employer') {
      router.replace('/');
      return;
    }

    if (!user?.isVerified) {
      setLoading(false);
      return;
    }

    if (!hasFetchedJobsRef.current) {
      hasFetchedJobsRef.current = true;
      fetchJobs();
    }

    fetchApplications();
  }, [authLoading, userType, user, page, statusFilter, jobFilter]);

  /* ---------------- STATUS UPDATE ---------------- */
  const handleStatusUpdate = async () => {
    if (!newStatus || !selectedApplication) return;

    setActionLoading(true);
    try {
      await api.put(
        `/employers/applications/${selectedApplication._id}/status`,
        { status: newStatus, notes: statusNotes }
      );

      toast.success('Status updated');
      setShowStatusModal(false);
      setNewStatus('');
      setStatusNotes('');
      fetchApplications();
    } catch {
      toast.error('Failed to update status');
    } finally {
      setActionLoading(false);
    }
  };

  /* ---------------- INTERVIEW ---------------- */
  const handleScheduleInterview = async () => {
    if (!interviewData.scheduledDate || !interviewData.scheduledTime) {
      toast.error('Date & time required');
      return;
    }

    setActionLoading(true);
    try {
      const scheduledAt = new Date(
        `${interviewData.scheduledDate}T${interviewData.scheduledTime}`
      );

      await api.post(
        `/employers/applications/${selectedApplication._id}/interview`,
        {
          scheduledAt,
          type: interviewData.type,
          location:
            interviewData.type === 'in-person'
              ? interviewData.location
              : undefined,
          meetingLink:
            interviewData.type === 'video'
              ? interviewData.meetingLink
              : undefined,
          notes: interviewData.notes
        }
      );

      toast.success('Interview scheduled');
      setShowInterviewModal(false);
      fetchApplications();
    } catch {
      toast.error('Failed to schedule interview');
    } finally {
      setActionLoading(false);
    }
  };

  /* ---------------- HELPERS ---------------- */
  const getStatusIcon = (status) =>
  ({
    pending: FaClock,
    reviewed: FaEye,
    shortlisted: FaStar,
    rejected: FaTimesCircle,
    hired: FaCheckCircle
  }[status] || FaClock);

  const getStatusColor = (status) =>
  ({
    pending: 'text-yellow-400',
    reviewed: 'text-blue-400',
    shortlisted: 'text-green-400',
    rejected: 'text-red-400',
    hired: 'text-emerald-400'
  }[status] || 'text-gray-400');

  const filteredApplications = applications.filter((app) => {
    if (!searchTerm) return true;
    const s = searchTerm.toLowerCase();
    return (
      app.applicant?.name?.toLowerCase().includes(s) ||
      app.applicant?.email?.toLowerCase().includes(s) ||
      app.job?.title?.toLowerCase().includes(s)
    );
  });

  /* ---------------- LOADER ---------------- */
  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-96">
          <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  /* ---------------- UI ---------------- */
  return (
    <DashboardLayout>
      <Head>
        <title>Applications - Employer</title>
      </Head>

      <div className="space-y-6">
        {/* Header & Filters */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Applications</h1>
            <p className="text-gray-500 dark:text-gray-400">Manage and track candidate applications</p>
          </div>

          <div className="flex gap-3">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search applicants..."
                className="pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <select
              className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="reviewed">Reviewed</option>
              <option value="shortlisted">Shortlisted</option>
              <option value="rejected">Rejected</option>
              <option value="hired">Hired</option>
            </select>

            <select
              className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none max-w-[200px]"
              value={jobFilter}
              onChange={(e) => setJobFilter(e.target.value)}
            >
              <option value="">All Jobs</option>
              {jobs.map(job => (
                <option key={job._id} value={job._id}>{job.title}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Content */}
        {filteredApplications.length > 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700">
                  <tr>
                    <th className="px-6 py-4 font-semibold text-gray-700 dark:text-gray-300">Candidate</th>
                    <th className="px-6 py-4 font-semibold text-gray-700 dark:text-gray-300">Applied For</th>
                    <th className="px-6 py-4 font-semibold text-gray-700 dark:text-gray-300">Date</th>
                    <th className="px-6 py-4 font-semibold text-gray-700 dark:text-gray-300">Status</th>
                    <th className="px-6 py-4 font-semibold text-gray-700 dark:text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {filteredApplications.map((app) => {
                    const StatusIcon = getStatusIcon(app.status);
                    return (
                      <tr key={app._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 font-bold">
                              {app.applicant?.name?.charAt(0) || 'U'}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">{app.applicant?.name || 'Unknown'}</p>
                              <p className="text-sm text-gray-500">{app.applicant?.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-medium text-gray-700 dark:text-gray-300">{app.job?.title}</span>
                          <span className="block text-xs text-gray-500">{app.job?.type}</span>
                        </td>
                        <td className="px-6 py-4 text-gray-500">
                          {new Date(app.appliedAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-white dark:bg-gray-800 border shadow-sm ${getStatusColor(app.status)}`}>
                            <StatusIcon /> {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => fetchApplicationDetails(app._id)}
                              className="p-2 text-gray-500 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                              title="View Details"
                            >
                              <FaEye />
                            </button>
                            <button
                              onClick={() => { setSelectedApplication(app); setNewStatus(app.status); setShowStatusModal(true); }}
                              className="p-2 text-gray-500 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-colors"
                              title="Update Status"
                            >
                              <FaCheckCircle />
                            </button>
                            <button
                              onClick={() => { setSelectedApplication(app); setShowInterviewModal(true); }}
                              className="p-2 text-gray-500 hover:text-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
                              title="Schedule Interview"
                            >
                              <FaVideo />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {/* Simple Pagination Control if needed, logic is basic for now */}
            {pagination.totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700 flex justify-center gap-4">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="py-2">Page {page} of {pagination.totalPages}</span>
                <button
                  disabled={page === pagination.totalPages}
                  onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        ) : (
          /* EMPTY STATE - REQ: Show message when no applications */
          <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 border-dashed">
            <div className="w-20 h-20 bg-gray-50 dark:bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaFileAlt className="text-4xl text-gray-300 dark:text-gray-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Applications Found</h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
              {searchTerm || statusFilter || jobFilter
                ? "We couldn't find any applications matching your filters. Try adjusting them."
                : "You haven't received any applications for your job postings yet."}
            </p>
            {(searchTerm || statusFilter || jobFilter) && (
              <button
                onClick={() => { setSearchTerm(''); setStatusFilter(''); setJobFilter(''); }}
                className="mt-6 px-6 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-medium"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* STATUS MODAL */}
      <AnimatePresence>
        {showStatusModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowStatusModal(false)}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative bg-white dark:bg-gray-800 w-full max-w-md rounded-2xl p-8 shadow-2xl border border-gray-100 dark:border-gray-700"
            >
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Update Status</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">New Status</label>
                  <select
                    className="w-full pl-4 pr-10 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none appearance-none transition-all"
                    value={newStatus}
                    onChange={e => setNewStatus(e.target.value)}
                  >
                    <option value="pending">Pending</option>
                    <option value="reviewed">Reviewed</option>
                    <option value="shortlisted">Shortlisted</option>
                    <option value="rejected">Rejected</option>
                    <option value="hired">Hired</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Notes (Optional)</label>
                  <textarea
                    className="w-full p-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none resize-none transition-all"
                    rows={4}
                    value={statusNotes}
                    onChange={e => setStatusNotes(e.target.value)}
                    placeholder="Add internal notes about this candidate..."
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-100 dark:border-gray-700">
                <button
                  onClick={() => setShowStatusModal(false)}
                  className="px-6 py-2.5 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleStatusUpdate}
                  disabled={actionLoading}
                  className="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-xl font-medium hover:from-orange-600 hover:to-pink-600 shadow-lg shadow-orange-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:-translate-y-0.5"
                >
                  {actionLoading ? 'Saving...' : 'Update Status'}
                </button>
              </div>
            </motion.div>
          </div>
        )
        }
      </AnimatePresence >

      {/* INTERVIEW MODAL */}
      < AnimatePresence >
        {showInterviewModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowInterviewModal(false)}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative bg-white dark:bg-gray-800 w-full max-w-lg rounded-2xl p-8 shadow-2xl border border-gray-100 dark:border-gray-700"
            >
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Schedule Interview</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Date</label>
                    <input type="date" className="w-full p-4 rounded-xl input-field dark:bg-gray-900 border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-primary-500 outline-none transition-all" value={interviewData.scheduledDate} onChange={e => setInterviewData({ ...interviewData, scheduledDate: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Time</label>
                    <input
                      type="time"
                      className="w-full p-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                      value={interviewData.scheduledTime}
                      onChange={e => setInterviewData({ ...interviewData, scheduledTime: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Type</label>
                  <div className="relative">
                    <select
                      className="w-full pl-4 pr-10 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none appearance-none transition-all"
                      value={interviewData.type}
                      onChange={e => setInterviewData({ ...interviewData, type: e.target.value })}
                    >
                      <option value="video">Video Call</option>
                      <option value="phone">Phone Call</option>
                      <option value="in-person">In Person</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-500">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                  </div>
                </div>
                {interviewData.type === 'video' && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Meeting Link</label>
                    <input type="url" className="w-full input-field dark:bg-gray-900 rounded-xl p-4 dark:border-gray-700 focus:ring-2 focus:ring-primary-500 outline-none transition-all" placeholder="https://zoom.us/..." value={interviewData.meetingLink} onChange={e => setInterviewData({ ...interviewData, meetingLink: e.target.value })} />
                  </div>
                )}
                {interviewData.type === 'in-person' && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Location Address</label>
                    <input type="text" className="w-full input-field dark:bg-gray-900 rounded-xl p-4 border-gray-200 focus:ring-2 focus:ring-primary-500 outline-none transition-all" placeholder="Office address..." value={interviewData.location} onChange={e => setInterviewData({ ...interviewData, location: e.target.value })} />
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-100 dark:border-gray-700">
                <button
                  onClick={() => setShowInterviewModal(false)}
                  className="px-6 py-2.5 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleScheduleInterview}
                  disabled={actionLoading}
                  className="px-6 py-2.5 bg-primary-500 rounded-xl font-medium hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:-translate-y-0.5"
                >
                  Schedule Interview
                </button>
              </div>
            </motion.div >
          </div >
        )}
      </AnimatePresence >

      {/* DETAILS MODAL */}
      < AnimatePresence >
        {showDetailModal && selectedApplication && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowDetailModal(false)}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative bg-white dark:bg-gray-800 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl p-8 shadow-2xl border border-gray-100 dark:border-gray-700"
              style={{ scrollbarWidth: 'thin', scrollbarColor: '#ff6b35 transparent' }}
            >
              <div className="flex justify-between items-start mb-8 pb-6 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 text-2xl font-bold">
                    {selectedApplication.applicant?.name?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedApplication.applicant?.name}</h2>
                    <p className="text-gray-500">{selectedApplication.job?.title}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                >
                  <FaTimes size={20} />
                </button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 dark:bg-gray-700/30 rounded-xl">
                    <p className="text-sm text-gray-500 mb-1">Email</p>
                    <p className="font-medium text-gray-900 dark:text-white">{selectedApplication.applicant?.email}</p>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-700/30 rounded-xl">
                    <p className="text-sm text-gray-500 mb-1">Phone</p>
                    <p className="font-medium text-gray-900 dark:text-white">{selectedApplication.applicant?.phone || 'N/A'}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white mb-2">Resume</h4>
                  <a
                    href={selectedApplication.resumeUrl || selectedApplication.applicant?.resumeUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-orange-500 transition-colors group"
                  >
                    <div className="w-10 h-10 bg-red-50 text-red-500 rounded-lg flex items-center justify-center">
                      <FaFileAlt />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white group-hover:text-orange-500">View Resume</p>
                      <p className="text-xs text-gray-500">PDF / Docx</p>
                    </div>
                  </a>
                </div>

                {/* Cover Letter */}
                {selectedApplication.coverLetter && (
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white mb-2">Cover Letter</h4>
                    <div className="p-4 bg-gray-50 dark:bg-gray-700/30 rounded-xl text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                      {selectedApplication.coverLetter}
                    </div>
                  </div>
                )}
              </div>

              {/* Summary */}
              {selectedApplication.applicant?.summary && (
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white mb-2">Summary</h4>
                  <p className="text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/30 p-4 rounded-xl">
                    {selectedApplication.applicant.summary}
                  </p>
                </div>
              )}

              {/* Skills */}
              {selectedApplication.applicant?.skills?.length > 0 && (
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white mb-2">Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedApplication.applicant.skills.map((skill, index) => (
                      <span key={index} className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg text-sm font-medium">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Experience */}
              {selectedApplication.applicant?.experience?.length > 0 && (
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white mb-3">Experience</h4>
                  <div className="space-y-3">
                    {selectedApplication.applicant.experience.map((exp, index) => (
                      <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700/30 rounded-xl">
                        <h5 className="font-bold text-gray-900 dark:text-white">{exp.jobTitle}</h5>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{exp.company} • {exp.duration}</p>
                        {exp.description && <p className="text-sm text-gray-500 mt-2">{exp.description}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Education */}
              {selectedApplication.applicant?.education?.length > 0 && (
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white mb-3">Education</h4>
                  <div className="space-y-3">
                    {selectedApplication.applicant.education.map((edu, index) => (
                      <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700/30 rounded-xl">
                        <h5 className="font-bold text-gray-900 dark:text-white">{edu.degree}</h5>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{edu.institution} • {edu.year}</p>
                        {edu.description && <p className="text-sm text-gray-500 mt-2">{edu.description}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )
        }
      </AnimatePresence >
    </DashboardLayout >
  );
}

export default withAuth(EmployerApplications, {
  requiredUserType: 'employer',
  requireVerification: false,
  redirectTo: '/auth/login'
});
