import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { 
  FaBriefcase, 
  FaUsers, 
  FaFileAlt, 
  FaBuilding, 
  FaPlus, 
  FaEye, 
  FaEdit, 
  FaTrash,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaChartLine
} from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../utils/api';

export default function EmployerDashboard() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState({
    totalJobs: 0,
    activeJobs: 0,
    totalApplications: 0,
    pendingApplications: 0
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [jobsRes, applicationsRes] = await Promise.all([
        api.get('/jobs/employer'),
        api.get('/applications/employer')
      ]);

      setJobs(jobsRes.data.data.jobs || []);
      setApplications(applicationsRes.data.data.applications || []);

      // Calculate stats
      const jobsData = jobsRes.data.data.jobs || [];
      const appsData = applicationsRes.data.data.applications || [];
      
      setStats({
        totalJobs: jobsData.length,
        activeJobs: jobsData.filter(job => job.status === 'active').length,
        totalApplications: appsData.length,
        pendingApplications: appsData.filter(app => app.status === 'pending').length
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
        return <FaClock className="text-yellow-500" />;
      case 'accepted':
        return <FaCheckCircle className="text-green-500" />;
      case 'rejected':
        return <FaTimesCircle className="text-red-500" />;
      default:
        return <FaClock className="text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'accepted':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FaChartLine },
    { id: 'jobs', label: 'Job Postings', icon: FaBriefcase },
    { id: 'applications', label: 'Applications', icon: FaUsers },
    { id: 'company', label: 'Company Profile', icon: FaBuilding }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container-custom py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-1/4 mb-8"></div>
            <div className="grid md:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-300 dark:bg-gray-700 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Employer Dashboard - JobPulse</title>
        <meta name="description" content="Manage your job postings and applications" />
      </Head>

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container-custom py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  Welcome back, {user?.firstName}!
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Manage your job postings and review applications
                </p>
              </div>
              <Link href="/employer/jobs/create" className="btn-primary">
                <FaPlus className="mr-2" />
                Post New Job
              </Link>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="card"
            >
              <div className="card-body p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Jobs</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalJobs}</p>
                  </div>
                  <FaBriefcase className="text-3xl text-primary-500" />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="card"
            >
              <div className="card-body p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Jobs</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.activeJobs}</p>
                  </div>
                  <FaCheckCircle className="text-3xl text-green-500" />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="card"
            >
              <div className="card-body p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Applications</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalApplications}</p>
                  </div>
                  <FaUsers className="text-3xl text-blue-500" />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
              className="card"
            >
              <div className="card-body p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending Reviews</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.pendingApplications}</p>
                  </div>
                  <FaClock className="text-3xl text-yellow-500" />
                </div>
              </div>
            </motion.div>
          </div>

          {/* Tabs */}
          <div className="mb-8">
            <div className="border-b border-gray-200 dark:border-gray-700">
              <nav className="-mb-px flex space-x-8">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                  >
                    <tab.icon className="mr-2" />
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Tab Content */}
          <div className="space-y-8">
            {activeTab === 'overview' && (
              <div className="grid lg:grid-cols-2 gap-8">
                {/* Recent Jobs */}
                <div>
                  <div className="card">
                    <div className="card-header">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Job Postings</h3>
                      <Link href="/employer/jobs" className="text-primary-600 hover:text-primary-500 text-sm">
                        View All
                      </Link>
                    </div>
                    <div className="card-body">
                      {jobs.length === 0 ? (
                        <div className="text-center py-8">
                          <FaBriefcase className="text-4xl text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-600 dark:text-gray-400 mb-4">No job postings yet</p>
                          <Link href="/employer/jobs/create" className="btn-primary">
                            Post Your First Job
                          </Link>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {jobs.slice(0, 5).map((job) => (
                            <div key={job._id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                              <div className="flex-1">
                                <h4 className="font-medium text-gray-900 dark:text-white">
                                  {job.title}
                                </h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {job.location} • {job.type}
                                </p>
                                <p className="text-xs text-gray-500">
                                  Posted {new Date(job.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  job.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
                                }`}>
                                  {job.status}
                                </span>
                                <Link href={`/employer/jobs/${job._id}`} className="btn-outline btn-sm">
                                  <FaEye className="mr-1" />
                                  View
                                </Link>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Recent Applications */}
                <div>
                  <div className="card">
                    <div className="card-header">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Applications</h3>
                      <Link href="/employer/applications" className="text-primary-600 hover:text-primary-500 text-sm">
                        View All
                      </Link>
                    </div>
                    <div className="card-body">
                      {applications.length === 0 ? (
                        <div className="text-center py-8">
                          <FaUsers className="text-4xl text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-600 dark:text-gray-400">No applications yet</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {applications.slice(0, 5).map((application) => (
                            <div key={application._id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                              <div className="flex-1">
                                <h4 className="font-medium text-gray-900 dark:text-white">
                                  {application.user.firstName} {application.user.lastName}
                                </h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  Applied for {application.job.title}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {new Date(application.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                              <div className="flex items-center space-x-2">
                                {getStatusIcon(application.status)}
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                                  {application.status}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'jobs' && (
              <div className="card">
                <div className="card-header">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Job Postings</h3>
                  <Link href="/employer/jobs/create" className="btn-primary">
                    <FaPlus className="mr-2" />
                    Post New Job
                  </Link>
                </div>
                <div className="card-body">
                  {jobs.length === 0 ? (
                    <div className="text-center py-12">
                      <FaBriefcase className="text-6xl text-gray-400 mx-auto mb-6" />
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Job Postings Yet</h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-6">
                        Start posting jobs to attract talented candidates
                      </p>
                      <Link href="/employer/jobs/create" className="btn-primary">
                        Post Your First Job
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {jobs.map((job) => (
                        <div key={job._id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                                  {job.title}
                                </h4>
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                  job.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
                                }`}>
                                  {job.status}
                                </span>
                              </div>
                              <p className="text-gray-600 dark:text-gray-400 mb-2">
                                {job.location} • {job.type} • ${job.salaryMin}-${job.salaryMax}
                              </p>
                              <p className="text-sm text-gray-500 mb-4">
                                Posted on {new Date(job.createdAt).toLocaleDateString()}
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                                {job.description}
                              </p>
                            </div>
                            <div className="flex items-center space-x-2 ml-4">
                              <Link href={`/employer/jobs/${job._id}`} className="btn-outline btn-sm">
                                <FaEye className="mr-1" />
                                View
                              </Link>
                              <Link href={`/employer/jobs/${job._id}/edit`} className="btn-outline btn-sm">
                                <FaEdit className="mr-1" />
                                Edit
                              </Link>
                              <button className="btn-outline btn-sm text-red-600 hover:text-red-700">
                                <FaTrash className="mr-1" />
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'applications' && (
              <div className="card">
                <div className="card-header">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">All Applications</h3>
                </div>
                <div className="card-body">
                  {applications.length === 0 ? (
                    <div className="text-center py-12">
                      <FaUsers className="text-6xl text-gray-400 mx-auto mb-6" />
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Applications Yet</h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-6">
                        Applications will appear here once candidates start applying to your jobs
                      </p>
                      <Link href="/employer/jobs/create" className="btn-primary">
                        Post More Jobs
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {applications.map((application) => (
                        <div key={application._id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                                  {application.user.firstName} {application.user.lastName}
                                </h4>
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(application.status)}`}>
                                  {application.status}
                                </span>
                              </div>
                              <p className="text-gray-600 dark:text-gray-400 mb-2">
                                Applied for: {application.job.title}
                              </p>
                              <p className="text-sm text-gray-500 mb-4">
                                Applied on {new Date(application.createdAt).toLocaleDateString()}
                              </p>
                              {application.coverLetter && (
                                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                                  <h5 className="font-medium text-gray-900 dark:text-white mb-2">Cover Letter</h5>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {application.coverLetter}
                                  </p>
                                </div>
                              )}
                            </div>
                            <div className="flex items-center space-x-2 ml-4">
                              {getStatusIcon(application.status)}
                              <Link href={`/employer/applications/${application._id}`} className="btn-outline btn-sm">
                                <FaEye className="mr-1" />
                                Review
                              </Link>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'company' && (
              <div className="card">
                <div className="card-header">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Company Profile</h3>
                  <button className="btn-outline btn-sm">
                    <FaEdit className="mr-1" />
                    Edit Profile
                  </button>
                </div>
                <div className="card-body">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Company Name
                      </label>
                      <p className="text-gray-900 dark:text-white">
                        {user?.company?.name || 'Not provided'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Website
                      </label>
                      <p className="text-gray-900 dark:text-white">
                        {user?.company?.website || 'Not provided'}
                      </p>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Company Description
                      </label>
                      <p className="text-gray-900 dark:text-white">
                        {user?.company?.description || 'No description provided'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
} 