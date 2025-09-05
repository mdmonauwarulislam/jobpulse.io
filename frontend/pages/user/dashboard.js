import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { 
  FaUser, 
  FaBriefcase, 
  FaFileAlt, 
  FaBell, 
  FaCog, 
  FaEdit, 
  FaEye, 
  FaClock, 
  FaCheckCircle, 
  FaTimesCircle,
  FaDownload,
  FaUpload,
  FaRocket,
  FaChartLine,
  FaStar,
  FaMapMarkerAlt,
  FaBuilding,
  FaCalendarAlt
} from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../utils/api';

export default function UserDashboard() {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [stats, setStats] = useState({
    totalApplications: 0,
    pendingApplications: 0,
    acceptedApplications: 0,
    rejectedApplications: 0
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [applicationsRes, jobsRes] = await Promise.all([
        api.get('/applications/user'),
        api.get('/jobs?limit=5')
      ]);

      setApplications(applicationsRes.data.data.applications || []);
      setRecommendedJobs(jobsRes.data.data.jobs || []);

      // Calculate stats
      const apps = applicationsRes.data.data.applications || [];
      setStats({
        totalApplications: apps.length,
        pendingApplications: apps.filter(app => app.status === 'pending').length,
        acceptedApplications: apps.filter(app => app.status === 'accepted').length,
        rejectedApplications: apps.filter(app => app.status === 'rejected').length
      });
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <FaClock className="text-yellow-400" />;
      case 'accepted':
        return <FaCheckCircle className="text-green-400" />;
      case 'rejected':
        return <FaTimesCircle className="text-red-400" />;
      default:
        return <FaClock className="text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'accepted':
        return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'rejected':
        return 'bg-red-500/20 text-red-300 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FaUser },
    { id: 'applications', label: 'Applications', icon: FaBriefcase },
    { id: 'profile', label: 'Profile', icon: FaUser },
    { id: 'resume', label: 'Resume', icon: FaFileAlt },
    { id: 'settings', label: 'Settings', icon: FaCog }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-black relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-red-500/5 to-orange-400/5"></div>
        </div>
        <div className="relative z-10 min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Dashboard - JobPulse</title>
        <meta name="description" content="Your JobPulse dashboard" />
      </Head>

      <div className="min-h-screen bg-black relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-red-500/5 to-orange-400/5"></div>
          {/* Animated Beams */}
          <motion.div
            className="absolute top-0 left-0 w-3 h-full bg-gradient-to-b from-transparent via-orange-500/40 to-transparent blur"
            animate={{ opacity: [0.2, 0.7, 0.2], scaleY: [0.8, 1.2, 0.8] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            style={{ transform: 'rotate(15deg) translateX(-50%)', left: '20%' }}
          />
          <motion.div
            className="absolute top-1/3 left-0 right-0 h-3 bg-gradient-to-r from-transparent via-red-500/40 to-transparent blur"
            animate={{ opacity: [0.2, 0.7, 0.2], scaleX: [0.8, 1.2, 0.8] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          />
          <motion.div
            className="absolute top-0 bottom-0 right-1/4 w-3 bg-gradient-to-b from-transparent via-orange-400/40 to-transparent blur"
            animate={{ opacity: [0.2, 0.7, 0.2], scaleY: [0.8, 1.2, 0.8] }}
            transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          />
          <motion.div
            className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl"
            animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.3, 0.1] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-red-500/10 rounded-full blur-3xl"
            animate={{ scale: [1.2, 1, 1.2], opacity: [0.1, 0.3, 0.1] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          />
        </div>

        <div className="relative z-10 min-h-screen py-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="mb-8"
            >
              <div className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl border border-white/20 p-8 shadow-2xl">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h1 className="text-4xl font-bold text-white mb-2">
                      Welcome back, {user?.name}!
                    </h1>
                    <p className="text-gray-300 text-lg">
                      Track your applications and discover new opportunities
                    </p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <button className="p-3 bg-white/10 border border-white/20 rounded-xl text-white hover:bg-white/20 transition-all duration-300">
                      <FaBell className="text-xl" />
                    </button>
                    <Link href="/user/profile" className="p-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl text-white hover:from-orange-600 hover:to-red-600 transition-all duration-300">
                      <FaUser className="text-xl" />
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Stats Cards */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="grid md:grid-cols-4 gap-6 mb-8"
            >
              <div className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl border border-white/20 p-6 shadow-2xl hover:shadow-orange-500/25 transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-300 mb-1">Total Applications</p>
                    <p className="text-3xl font-bold text-white">{stats.totalApplications}</p>
                  </div>
                  <div className="p-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl">
                    <FaBriefcase className="text-2xl text-white" />
                  </div>
                </div>
              </div>

              <div className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl border border-white/20 p-6 shadow-2xl hover:shadow-yellow-500/25 transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-300 mb-1">Pending</p>
                    <p className="text-3xl font-bold text-white">{stats.pendingApplications}</p>
                  </div>
                  <div className="p-3 bg-yellow-500/20 border border-yellow-500/30 rounded-xl">
                    <FaClock className="text-2xl text-yellow-400" />
                  </div>
                </div>
              </div>

              <div className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl border border-white/20 p-6 shadow-2xl hover:shadow-green-500/25 transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-300 mb-1">Accepted</p>
                    <p className="text-3xl font-bold text-white">{stats.acceptedApplications}</p>
                  </div>
                  <div className="p-3 bg-green-500/20 border border-green-500/30 rounded-xl">
                    <FaCheckCircle className="text-2xl text-green-400" />
                  </div>
                </div>
              </div>

              <div className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl border border-white/20 p-6 shadow-2xl hover:shadow-red-500/25 transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-300 mb-1">Rejected</p>
                    <p className="text-3xl font-bold text-white">{stats.rejectedApplications}</p>
                  </div>
                  <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-xl">
                    <FaTimesCircle className="text-2xl text-red-400" />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Tabs */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="mb-8"
            >
              <div className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl border border-white/20 p-2 shadow-2xl">
                <div className="flex space-x-2">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center px-6 py-3 rounded-xl font-medium text-sm transition-all duration-300 ${
                        activeTab === tab.id
                          ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
                          : 'text-gray-300 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      <tab.icon className="mr-2" />
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Tab Content */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="space-y-8"
            >
              {activeTab === 'overview' && (
                <div className="grid lg:grid-cols-3 gap-8">
                  {/* Recent Applications */}
                  <div className="lg:col-span-2">
                    <div className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl border border-white/20 p-6 shadow-2xl">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-semibold text-white">Recent Applications</h3>
                        <Link href="/user/applications" className="text-orange-400 hover:text-orange-300 text-sm font-medium">
                          View All
                        </Link>
                      </div>
                      {applications.length === 0 ? (
                        <div className="text-center py-12">
                          <FaBriefcase className="text-6xl text-gray-400 mx-auto mb-6" />
                          <p className="text-gray-300 text-lg mb-4">No applications yet</p>
                          <Link href="/jobs" className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-red-600 transition-all duration-300">
                            <FaRocket className="mr-2" />
                            Browse Jobs
                          </Link>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {applications.slice(0, 5).map((application) => (
                            <div key={application._id} className="bg-white/5 border border-white/10 rounded-2xl p-4 hover:bg-white/10 transition-all duration-300">
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <h4 className="font-semibold text-white mb-1">
                                    {application.job.title}
                                  </h4>
                                  <p className="text-sm text-gray-300 mb-2">
                                    {application.job.company.name}
                                  </p>
                                  <p className="text-xs text-gray-400">
                                    Applied {new Date(application.createdAt).toLocaleDateString()}
                                  </p>
                                </div>
                                <div className="flex items-center space-x-3">
                                  {getStatusIcon(application.status)}
                                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(application.status)}`}>
                                    {application.status}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Recommended Jobs */}
                  <div>
                    <div className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl border border-white/20 p-6 shadow-2xl">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-semibold text-white">Recommended Jobs</h3>
                        <Link href="/jobs" className="text-orange-400 hover:text-orange-300 text-sm font-medium">
                          View All
                        </Link>
                      </div>
                      {recommendedJobs.length === 0 ? (
                        <div className="text-center py-8">
                          <FaStar className="text-4xl text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-300">No recommendations yet</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {recommendedJobs.slice(0, 3).map((job) => (
                            <div key={job._id} className="bg-white/5 border border-white/10 rounded-2xl p-4 hover:bg-white/10 transition-all duration-300">
                              <h4 className="font-semibold text-white mb-2">
                                {job.title}
                              </h4>
                              <div className="flex items-center text-sm text-gray-300 mb-2">
                                <FaBuilding className="mr-2" />
                                {job.company.name}
                              </div>
                              <div className="flex items-center text-sm text-gray-300 mb-3">
                                <FaMapMarkerAlt className="mr-2" />
                                {job.location}
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-400">
                                  {job.type}
                                </span>
                                <Link href={`/jobs/${job._id}`} className="text-orange-400 hover:text-orange-300 text-sm font-medium">
                                  View Job
                                </Link>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'applications' && (
                <div className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl border border-white/20 p-6 shadow-2xl">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-white">All Applications</h3>
                  </div>
                  {applications.length === 0 ? (
                    <div className="text-center py-12">
                      <FaBriefcase className="text-6xl text-gray-400 mx-auto mb-6" />
                      <h3 className="text-xl font-semibold text-white mb-2">No Applications Yet</h3>
                      <p className="text-gray-300 mb-6">
                        Start your job search and apply to positions that match your skills
                      </p>
                      <Link href="/jobs" className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-red-600 transition-all duration-300">
                        <FaRocket className="mr-2" />
                        Browse Jobs
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {applications.map((application) => (
                        <div key={application._id} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-3">
                                <h4 className="text-lg font-semibold text-white">
                                  {application.job.title}
                                </h4>
                                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(application.status)}`}>
                                  {application.status}
                                </span>
                              </div>
                              <div className="flex items-center text-gray-300 mb-2">
                                <FaBuilding className="mr-2" />
                                {application.job.company.name}
                              </div>
                              <div className="flex items-center text-gray-300 mb-3">
                                <FaMapMarkerAlt className="mr-2" />
                                {application.job.location}
                              </div>
                              <div className="flex items-center text-sm text-gray-400 mb-4">
                                <FaCalendarAlt className="mr-2" />
                                Applied on {new Date(application.createdAt).toLocaleDateString()}
                              </div>
                              {application.coverLetter && (
                                <div className="bg-white/5 border border-white/10 p-4 rounded-xl">
                                  <h5 className="font-medium text-white mb-2">Cover Letter</h5>
                                  <p className="text-sm text-gray-300">
                                    {application.coverLetter}
                                  </p>
                                </div>
                              )}
                            </div>
                            <div className="flex items-center space-x-3 ml-6">
                              {getStatusIcon(application.status)}
                              <Link href={`/jobs/${application.job._id}`} className="px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white hover:bg-white/20 transition-all duration-300 text-sm">
                                <FaEye className="mr-1" />
                                View Job
                              </Link>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'profile' && (
                <div className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl border border-white/20 p-6 shadow-2xl">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-white">Profile Information</h3>
                    <Link href="/user/complete-profile" className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-red-600 transition-all duration-300">
                      <FaEdit className="mr-2" />
                      Edit Profile
                    </Link>
                  </div>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Full Name
                      </label>
                                             <p className="text-white font-medium">
                         {user?.name}
                       </p>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Email
                      </label>
                      <p className="text-white font-medium">{user?.email}</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Phone
                      </label>
                      <p className="text-white font-medium">{user?.phone || 'Not provided'}</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Location
                      </label>
                      <p className="text-white font-medium">{user?.address || 'Not provided'}</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'resume' && (
                <div className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl border border-white/20 p-6 shadow-2xl">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-white">Resume Management</h3>
                  </div>
                  <div className="text-center py-12">
                    <FaFileAlt className="text-6xl text-gray-400 mx-auto mb-6" />
                    <h3 className="text-xl font-semibold text-white mb-2">Upload Your Resume</h3>
                    <p className="text-gray-300 mb-8">
                      Upload your resume to make applying to jobs easier
                    </p>
                    <div className="flex justify-center space-x-4">
                      <button className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-red-600 transition-all duration-300">
                        <FaUpload className="mr-2" />
                        Upload Resume
                      </button>
                      <button className="inline-flex items-center px-6 py-3 bg-white/10 border border-white/20 text-white rounded-xl font-semibold hover:bg-white/20 transition-all duration-300">
                        <FaDownload className="mr-2" />
                        Download Template
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'settings' && (
                <div className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl border border-white/20 p-6 shadow-2xl">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-white">Account Settings</h3>
                  </div>
                  <div className="space-y-8">
                    <div>
                      <h4 className="text-lg font-medium text-white mb-4">Notifications</h4>
                      <div className="space-y-4">
                        <label className="flex items-center">
                          <input type="checkbox" className="mr-3 w-4 h-4 text-orange-500 bg-white/10 border-white/20 rounded focus:ring-orange-500" defaultChecked />
                          <span className="text-gray-300">Email notifications for new job matches</span>
                        </label>
                        <label className="flex items-center">
                          <input type="checkbox" className="mr-3 w-4 h-4 text-orange-500 bg-white/10 border-white/20 rounded focus:ring-orange-500" defaultChecked />
                          <span className="text-gray-300">Application status updates</span>
                        </label>
                        <label className="flex items-center">
                          <input type="checkbox" className="mr-3 w-4 h-4 text-orange-500 bg-white/10 border-white/20 rounded focus:ring-orange-500" />
                          <span className="text-gray-300">Weekly job recommendations</span>
                        </label>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-lg font-medium text-white mb-4">Privacy</h4>
                      <div className="space-y-4">
                        <label className="flex items-center">
                          <input type="checkbox" className="mr-3 w-4 h-4 text-orange-500 bg-white/10 border-white/20 rounded focus:ring-orange-500" defaultChecked />
                          <span className="text-gray-300">Allow employers to view my profile</span>
                        </label>
                        <label className="flex items-center">
                          <input type="checkbox" className="mr-3 w-4 h-4 text-orange-500 bg-white/10 border-white/20 rounded focus:ring-orange-500" />
                          <span className="text-gray-300">Show my profile in search results</span>
                        </label>
                      </div>
                    </div>
                    <div className="pt-6 border-t border-white/10">
                      <button className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-red-600 transition-all duration-300">
                        Save Settings
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
} 