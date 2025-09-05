import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { 
  FaUsers, 
  FaBriefcase, 
  FaBuilding, 
  FaFileAlt, 
  FaChartLine,
  FaEye,
  FaEdit,
  FaTrash,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaShieldAlt
} from 'react-icons/fa';
import { api } from '../../utils/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalEmployers: 0,
    totalJobs: 0,
    totalApplications: 0,
    pendingJobs: 0,
    pendingApplications: 0
  });
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentJobs, setRecentJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, usersRes, jobsRes] = await Promise.all([
        api.get('/admin/dashboard'),
        api.get('/admin/users?limit=5'),
        api.get('/admin/jobs?limit=5')
      ]);

      setStats(statsRes.data.data || {
        totalUsers: 0,
        totalEmployers: 0,
        totalJobs: 0,
        totalApplications: 0,
        pendingJobs: 0,
        pendingApplications: 0
      });
      setRecentUsers(usersRes.data.data.users || []);
      setRecentJobs(jobsRes.data.data.jobs || []);
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
      case 'approved':
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
      case 'approved':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FaChartLine },
    { id: 'users', label: 'Users', icon: FaUsers },
    { id: 'employers', label: 'Employers', icon: FaBuilding },
    { id: 'jobs', label: 'Jobs', icon: FaBriefcase },
    { id: 'applications', label: 'Applications', icon: FaFileAlt }
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
        <title>Admin Dashboard - JobPulse</title>
        <meta name="description" content="Admin dashboard for JobPulse platform" />
      </Head>

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container-custom py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-2">
              <FaShieldAlt className="text-3xl text-primary-500" />
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Admin Dashboard
              </h1>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              Manage the JobPulse platform and monitor user activity
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="card"
            >
              <div className="card-body p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Users</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalUsers}</p>
                  </div>
                  <FaUsers className="text-3xl text-blue-500" />
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
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Employers</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalEmployers}</p>
                  </div>
                  <FaBuilding className="text-3xl text-green-500" />
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
              transition={{ duration: 0.3, delay: 0.3 }}
              className="card"
            >
              <div className="card-body p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Applications</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalApplications}</p>
                  </div>
                  <FaFileAlt className="text-3xl text-purple-500" />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.4 }}
              className="card"
            >
              <div className="card-body p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending Jobs</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.pendingJobs}</p>
                  </div>
                  <FaClock className="text-3xl text-yellow-500" />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.5 }}
              className="card"
            >
              <div className="card-body p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending Apps</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.pendingApplications}</p>
                  </div>
                  <FaClock className="text-3xl text-orange-500" />
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
                {/* Recent Users */}
                <div>
                  <div className="card">
                    <div className="card-header">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Users</h3>
                      <Link href="/admin/users" className="text-primary-600 hover:text-primary-500 text-sm">
                        View All
                      </Link>
                    </div>
                    <div className="card-body">
                      {recentUsers.length === 0 ? (
                        <div className="text-center py-8">
                          <FaUsers className="text-4xl text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-600 dark:text-gray-400">No users registered yet</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {recentUsers.map((user) => (
                            <div key={user._id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                              <div className="flex-1">
                                <h4 className="font-medium text-gray-900 dark:text-white">
                                  {user.firstName} {user.lastName}
                                </h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {user.email}
                                </p>
                                <p className="text-xs text-gray-500">
                                  Joined {new Date(user.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  user.role === 'admin' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300' :
                                  user.role === 'employer' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' :
                                  'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
                                }`}>
                                  {user.role}
                                </span>
                                <Link href={`/admin/users/${user._id}`} className="btn-outline btn-sm">
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

                {/* Recent Jobs */}
                <div>
                  <div className="card">
                    <div className="card-header">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Job Postings</h3>
                      <Link href="/admin/jobs" className="text-primary-600 hover:text-primary-500 text-sm">
                        View All
                      </Link>
                    </div>
                    <div className="card-body">
                      {recentJobs.length === 0 ? (
                        <div className="text-center py-8">
                          <FaBriefcase className="text-4xl text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-600 dark:text-gray-400">No jobs posted yet</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {recentJobs.map((job) => (
                            <div key={job._id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                              <div className="flex-1">
                                <h4 className="font-medium text-gray-900 dark:text-white">
                                  {job.title}
                                </h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {job.company.name} • {job.location}
                                </p>
                                <p className="text-xs text-gray-500">
                                  Posted {new Date(job.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                                  {job.status}
                                </span>
                                <Link href={`/admin/jobs/${job._id}`} className="btn-outline btn-sm">
                                  <FaEye className="mr-1" />
                                  Review
                                </Link>
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

            {activeTab === 'users' && (
              <div className="card">
                <div className="card-header">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">User Management</h3>
                </div>
                <div className="card-body">
                  <div className="text-center py-12">
                    <FaUsers className="text-6xl text-gray-400 mx-auto mb-6" />
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">User Management</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                      Manage all registered users on the platform
                    </p>
                    <Link href="/admin/users" className="btn-primary">
                      View All Users
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'employers' && (
              <div className="card">
                <div className="card-header">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Employer Management</h3>
                </div>
                <div className="card-body">
                  <div className="text-center py-12">
                    <FaBuilding className="text-6xl text-gray-400 mx-auto mb-6" />
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Employer Management</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                      Manage employer accounts and company profiles
                    </p>
                    <Link href="/admin/employers" className="btn-primary">
                      View All Employers
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'jobs' && (
              <div className="card">
                <div className="card-header">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Job Moderation</h3>
                </div>
                <div className="card-body">
                  <div className="text-center py-12">
                    <FaBriefcase className="text-6xl text-gray-400 mx-auto mb-6" />
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Job Moderation</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                      Review and moderate job postings
                    </p>
                    <Link href="/admin/jobs" className="btn-primary">
                      Review Jobs
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'applications' && (
              <div className="card">
                <div className="card-header">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Application Management</h3>
                </div>
                <div className="card-body">
                  <div className="text-center py-12">
                    <FaFileAlt className="text-6xl text-gray-400 mx-auto mb-6" />
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Application Management</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                      Monitor and manage job applications
                    </p>
                    <Link href="/admin/applications" className="btn-primary">
                      View All Applications
                    </Link>
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