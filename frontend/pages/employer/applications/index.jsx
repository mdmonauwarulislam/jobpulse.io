import { useState, useEffect } from 'react';
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

export default function EmployerApplications() {
  const { user, userType } = useAuth();
  const router = useRouter();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [jobFilter, setJobFilter] = useState('');
  const [jobs, setJobs] = useState([]);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
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

  useEffect(() => {
    if (userType !== 'employer') {
      router.push('/');
      return;
    }
    fetchJobs();
    fetchApplications();
  }, [page, statusFilter, jobFilter, userType]);

  const fetchJobs = async () => {
    try {
      const response = await api.get('/employers/jobs?limit=100');
      setJobs(response.data.data.jobs || []);
    } catch (error) {
      console.error('Failed to load jobs', error);
    }
  };

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page,
        limit: 10,
        ...(statusFilter && { status: statusFilter }),
        ...(jobFilter && { jobId: jobFilter })
      });
      
      const response = await api.get(`/employers/applications?${params}`);
      setApplications(response.data.data.applications || []);
      setPagination(response.data.data.pagination || {});
    } catch (error) {
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!selectedApplication || !newStatus) return;
    
    setActionLoading(true);
    try {
      await api.put(`/employers/applications/${selectedApplication._id}/status`, {
        status: newStatus,
        notes: statusNotes
      });
      toast.success(`Application ${newStatus} successfully`);
      setShowStatusModal(false);
      setNewStatus('');
      setStatusNotes('');
      fetchApplications();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update status');
    } finally {
      setActionLoading(false);
    }
  };

  const startConversation = async (applicationId) => {
    setActionLoading(true);
    try {
      const response = await api.post('/chat/conversations', {
        applicationId,
        initialMessage: 'Hello! Thank you for your application. I would like to discuss this opportunity with you.'
      });
      toast.success('Conversation started');
      router.push(`/messages/${response.data.data.conversation._id}`);
    } catch (error) {
      if (error.response?.data?.data?.conversationId) {
        router.push(`/messages/${error.response.data.data.conversationId}`);
      } else {
        toast.error(error.response?.data?.error || 'Failed to start conversation');
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleScheduleInterview = async () => {
    if (!selectedApplication || !interviewData.scheduledDate || !interviewData.scheduledTime) {
      toast.error('Please fill in the required fields');
      return;
    }
    
    setActionLoading(true);
    try {
      const scheduledAt = new Date(`${interviewData.scheduledDate}T${interviewData.scheduledTime}`);
      await api.post(`/employers/applications/${selectedApplication._id}/interview`, {
        scheduledAt,
        type: interviewData.type,
        location: interviewData.type === 'in-person' ? interviewData.location : undefined,
        meetingLink: interviewData.type === 'video' ? interviewData.meetingLink : undefined,
        notes: interviewData.notes
      });
      toast.success('Interview scheduled successfully');
      setShowInterviewModal(false);
      setInterviewData({
        scheduledDate: '',
        scheduledTime: '',
        type: 'video',
        location: '',
        meetingLink: '',
        notes: ''
      });
      fetchApplications();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to schedule interview');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
      reviewed: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      shortlisted: 'bg-green-500/20 text-green-300 border-green-500/30',
      rejected: 'bg-red-500/20 text-red-300 border-red-500/30',
      hired: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
    };
    return colors[status] || 'bg-gray-500/20 text-gray-300 border-gray-500/30';
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: FaClock,
      reviewed: FaEye,
      shortlisted: FaStar,
      rejected: FaTimesCircle,
      hired: FaCheckCircle
    };
    return icons[status] || FaClock;
  };

  const filteredApplications = applications.filter(app => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      app.applicant?.name?.toLowerCase().includes(search) ||
      app.applicant?.email?.toLowerCase().includes(search) ||
      app.job?.title?.toLowerCase().includes(search)
    );
  });

  return (
    <>
      <Head>
        <title>Applications - Employer - JobPulse</title>
        <meta name="description" content="Manage job applications" />
      </Head>

      <div className="min-h-screen bg-black relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-red-500/5 to-orange-400/5"></div>
          <motion.div
            className="absolute top-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"
            animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>

        <div className="relative z-10 min-h-screen py-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <div className="flex items-center space-x-4 mb-4">
                <Link href="/employer/dashboard" className="text-gray-400 hover:text-white transition-colors">
                  <FaArrowLeft className="text-xl" />
                </Link>
                <div className="flex items-center space-x-3">
                  <FaUsers className="text-3xl text-orange-500" />
                  <h1 className="text-3xl font-bold text-white">Applications</h1>
                </div>
              </div>
              <p className="text-gray-400">Review and manage job applications</p>
            </motion.div>

            {/* Filters */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 mb-8"
            >
              <div className="grid md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Search</label>
                  <div className="relative">
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search applicants..."
                      className="w-full pl-10 pr-4 py-3 bg-black/50 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                    className="w-full px-4 py-3 bg-black/50 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="reviewed">Reviewed</option>
                    <option value="shortlisted">Shortlisted</option>
                    <option value="rejected">Rejected</option>
                    <option value="hired">Hired</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Job</label>
                  <select
                    value={jobFilter}
                    onChange={(e) => { setJobFilter(e.target.value); setPage(1); }}
                    className="w-full px-4 py-3 bg-black/50 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="">All Jobs</option>
                    {jobs.map(job => (
                      <option key={job._id} value={job._id}>{job.title}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    onClick={() => { setSearchTerm(''); setStatusFilter(''); setJobFilter(''); setPage(1); }}
                    className="w-full px-6 py-3 bg-white/10 text-white font-medium rounded-xl hover:bg-white/20 transition-all duration-300"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Applications List */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-4"
            >
              {loading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 animate-pulse">
                      <div className="flex items-center space-x-4">
                        <div className="w-14 h-14 bg-gray-700 rounded-full"></div>
                        <div className="flex-1">
                          <div className="h-5 bg-gray-700 rounded w-1/3 mb-2"></div>
                          <div className="h-4 bg-gray-700 rounded w-1/4"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredApplications.length === 0 ? (
                <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-12 text-center">
                  <FaUsers className="text-5xl text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400">No applications found</p>
                </div>
              ) : (
                filteredApplications.map((application) => {
                  const StatusIcon = getStatusIcon(application.status);
                  return (
                    <motion.div
                      key={application._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 hover:border-orange-500/30 transition-all duration-300"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex items-start space-x-4">
                          <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
                            {application.applicant?.name?.charAt(0) || 'U'}
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-white">{application.applicant?.name || 'Unknown'}</h3>
                            <p className="text-gray-400 text-sm flex items-center">
                              <FaBriefcase className="mr-2" />
                              Applied for: {application.job?.title || 'Unknown Job'}
                            </p>
                            <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-400">
                              <span className="flex items-center">
                                <FaEnvelope className="mr-1" />
                                {application.applicant?.email}
                              </span>
                              {application.applicant?.phone && (
                                <span className="flex items-center">
                                  <FaPhone className="mr-1" />
                                  {application.applicant.phone}
                                </span>
                              )}
                              <span className="flex items-center">
                                <FaCalendarAlt className="mr-1" />
                                {new Date(application.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(application.status)}`}>
                            <StatusIcon className="mr-1" />
                            {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                          </span>
                          
                          <div className="flex space-x-2">
                            <button
                              onClick={() => { setSelectedApplication(application); setShowDetailModal(true); }}
                              className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg transition-colors"
                              title="View Details"
                            >
                              <FaEye className="text-lg" />
                            </button>
                            <button
                              onClick={() => { setSelectedApplication(application); setShowStatusModal(true); }}
                              className="p-2 text-green-400 hover:text-green-300 hover:bg-green-500/10 rounded-lg transition-colors"
                              title="Update Status"
                            >
                              <FaUserCheck className="text-lg" />
                            </button>
                            <button
                              onClick={() => { setSelectedApplication(application); setShowInterviewModal(true); }}
                              className="p-2 text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 rounded-lg transition-colors"
                              title="Schedule Interview"
                            >
                              <FaCalendarAlt className="text-lg" />
                            </button>
                            <button
                              onClick={() => startConversation(application._id)}
                              className="p-2 text-orange-400 hover:text-orange-300 hover:bg-orange-500/10 rounded-lg transition-colors"
                              title="Message Applicant"
                            >
                              <FaComment className="text-lg" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between pt-4">
                  <p className="text-sm text-gray-400">
                    Page {pagination.currentPage} of {pagination.totalPages} ({pagination.totalApplications} total)
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

        {/* Application Detail Modal */}
        <AnimatePresence>
          {showDetailModal && selectedApplication && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-gray-900 rounded-2xl border border-white/20 w-full max-w-3xl max-h-[90vh] overflow-hidden"
              >
                <div className="p-6 border-b border-white/10 flex items-center justify-between">
                  <h3 className="text-xl font-bold text-white">Application Details</h3>
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="p-2 text-gray-400 hover:text-white transition-colors"
                  >
                    <FaTimes />
                  </button>
                </div>
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                  {/* Applicant Info */}
                  <div className="mb-6">
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                        {selectedApplication.applicant?.name?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <h4 className="text-xl font-semibold text-white">{selectedApplication.applicant?.name}</h4>
                        <p className="text-gray-400">{selectedApplication.applicant?.email}</p>
                      </div>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      {selectedApplication.applicant?.phone && (
                        <div className="flex items-center text-gray-300">
                          <FaPhone className="mr-2 text-orange-500" />
                          {selectedApplication.applicant.phone}
                        </div>
                      )}
                      {selectedApplication.applicant?.address && (
                        <div className="flex items-center text-gray-300">
                          <FaMapMarkerAlt className="mr-2 text-orange-500" />
                          {selectedApplication.applicant.address}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Summary */}
                  {selectedApplication.applicant?.summary && (
                    <div className="mb-6">
                      <h5 className="text-sm font-medium text-gray-400 mb-2">Professional Summary</h5>
                      <p className="text-gray-300 bg-black/30 rounded-xl p-4">{selectedApplication.applicant.summary}</p>
                    </div>
                  )}

                  {/* Cover Letter */}
                  <div className="mb-6">
                    <h5 className="text-sm font-medium text-gray-400 mb-2">Cover Letter</h5>
                    <p className="text-gray-300 bg-black/30 rounded-xl p-4 whitespace-pre-wrap">{selectedApplication.coverLetter}</p>
                  </div>

                  {/* Experience */}
                  {selectedApplication.applicant?.experience?.length > 0 && (
                    <div className="mb-6">
                      <h5 className="text-sm font-medium text-gray-400 mb-2">Experience</h5>
                      <div className="space-y-3">
                        {selectedApplication.applicant.experience.map((exp, i) => (
                          <div key={i} className="bg-black/30 rounded-xl p-4">
                            <h6 className="font-medium text-white">{exp.jobTitle}</h6>
                            <p className="text-orange-400">{exp.company}</p>
                            <p className="text-gray-400 text-sm">{exp.duration}</p>
                            {exp.description && <p className="text-gray-300 mt-2 text-sm">{exp.description}</p>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Education */}
                  {selectedApplication.applicant?.education?.length > 0 && (
                    <div className="mb-6">
                      <h5 className="text-sm font-medium text-gray-400 mb-2">Education</h5>
                      <div className="space-y-3">
                        {selectedApplication.applicant.education.map((edu, i) => (
                          <div key={i} className="bg-black/30 rounded-xl p-4">
                            <h6 className="font-medium text-white">{edu.degree}</h6>
                            <p className="text-orange-400">{edu.institution}</p>
                            <p className="text-gray-400 text-sm">{edu.year}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Resume */}
                  {(selectedApplication.resumeUrl || selectedApplication.applicant?.resumeUrl) && (
                    <div className="mb-6">
                      <a
                        href={selectedApplication.resumeUrl || selectedApplication.applicant?.resumeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-4 py-2 bg-orange-500/20 text-orange-300 rounded-xl hover:bg-orange-500/30 transition-colors"
                      >
                        <FaFileAlt className="mr-2" />
                        View Resume
                      </a>
                    </div>
                  )}
                </div>
                <div className="p-6 border-t border-white/10 flex justify-end space-x-3">
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => { setShowDetailModal(false); setShowStatusModal(true); }}
                    className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition-colors"
                  >
                    Update Status
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Status Update Modal */}
        <AnimatePresence>
          {showStatusModal && selectedApplication && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-gray-900 rounded-2xl border border-white/20 p-6 w-full max-w-md"
              >
                <h3 className="text-xl font-bold text-white mb-4">Update Application Status</h3>
                <p className="text-gray-400 mb-4">
                  Applicant: <span className="text-white">{selectedApplication.applicant?.name}</span>
                </p>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">New Status</label>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      className="w-full px-4 py-3 bg-black/50 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="">Select Status</option>
                      <option value="reviewed">Reviewed</option>
                      <option value="shortlisted">Shortlisted</option>
                      <option value="rejected">Rejected</option>
                      <option value="hired">Hired</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Notes (Optional)</label>
                    <textarea
                      value={statusNotes}
                      onChange={(e) => setStatusNotes(e.target.value)}
                      rows={3}
                      placeholder="Add notes about this decision..."
                      className="w-full px-4 py-3 bg-black/50 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => { setShowStatusModal(false); setNewStatus(''); setStatusNotes(''); }}
                    className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleStatusUpdate}
                    disabled={!newStatus || actionLoading}
                    className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition-colors disabled:opacity-50"
                  >
                    {actionLoading ? 'Updating...' : 'Update Status'}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Interview Scheduling Modal */}
        <AnimatePresence>
          {showInterviewModal && selectedApplication && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-gray-900 rounded-2xl border border-white/20 p-6 w-full max-w-lg"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-white flex items-center">
                    <FaCalendarAlt className="mr-2 text-orange-500" />
                    Schedule Interview
                  </h3>
                  <button
                    onClick={() => setShowInterviewModal(false)}
                    className="p-2 text-gray-400 hover:text-white transition-colors"
                  >
                    <FaTimes />
                  </button>
                </div>
                
                <p className="text-gray-400 mb-6">
                  Scheduling interview with <span className="text-white font-medium">{selectedApplication.applicant?.name}</span>
                  <br />
                  <span className="text-sm">for {selectedApplication.job?.title}</span>
                </p>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Date *</label>
                      <input
                        type="date"
                        value={interviewData.scheduledDate}
                        onChange={(e) => setInterviewData(prev => ({ ...prev, scheduledDate: e.target.value }))}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-4 py-3 bg-black/50 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Time *</label>
                      <input
                        type="time"
                        value={interviewData.scheduledTime}
                        onChange={(e) => setInterviewData(prev => ({ ...prev, scheduledTime: e.target.value }))}
                        className="w-full px-4 py-3 bg-black/50 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Interview Type</label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { value: 'video', label: 'Video Call', icon: FaVideo },
                        { value: 'phone', label: 'Phone', icon: FaPhone },
                        { value: 'in-person', label: 'In Person', icon: FaMapMarker }
                      ].map((type) => (
                        <button
                          key={type.value}
                          onClick={() => setInterviewData(prev => ({ ...prev, type: type.value }))}
                          className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                            interviewData.type === type.value
                              ? 'border-orange-500 bg-orange-500/20 text-orange-300'
                              : 'border-white/20 bg-black/30 text-gray-400 hover:border-white/40'
                          }`}
                        >
                          <type.icon className="text-lg mb-1" />
                          <span className="text-xs">{type.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {interviewData.type === 'video' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Meeting Link</label>
                      <input
                        type="url"
                        value={interviewData.meetingLink}
                        onChange={(e) => setInterviewData(prev => ({ ...prev, meetingLink: e.target.value }))}
                        placeholder="https://zoom.us/j/..."
                        className="w-full px-4 py-3 bg-black/50 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                  )}

                  {interviewData.type === 'in-person' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Location</label>
                      <input
                        type="text"
                        value={interviewData.location}
                        onChange={(e) => setInterviewData(prev => ({ ...prev, location: e.target.value }))}
                        placeholder="Office address..."
                        className="w-full px-4 py-3 bg-black/50 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Notes for Candidate</label>
                    <textarea
                      value={interviewData.notes}
                      onChange={(e) => setInterviewData(prev => ({ ...prev, notes: e.target.value }))}
                      rows={3}
                      placeholder="Any additional information for the candidate..."
                      className="w-full px-4 py-3 bg-black/50 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => { 
                      setShowInterviewModal(false); 
                      setInterviewData({
                        scheduledDate: '',
                        scheduledTime: '',
                        type: 'video',
                        location: '',
                        meetingLink: '',
                        notes: ''
                      });
                    }}
                    className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleScheduleInterview}
                    disabled={!interviewData.scheduledDate || !interviewData.scheduledTime || actionLoading}
                    className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition-colors disabled:opacity-50 flex items-center"
                  >
                    {actionLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Scheduling...
                      </>
                    ) : (
                      <>
                        <FaCalendarAlt className="mr-2" />
                        Schedule Interview
                      </>
                    )}
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
