import Link from 'next/link';
import Head from 'next/head';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
  FaBriefcase,
  FaUsers,
  FaPlus,
  FaEye,
  FaCheckCircle,
  FaClock
} from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../utils/api';
import { withAuth } from '../../utils/withAuth';
import VerifyEmailGate from '../../components/VerifyEmailGate';
import DashboardLayout from '../../components/DashboardLayout';
import { useState, useEffect, useRef } from 'react';

function EmployerDashboard() {
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

  const { userType, loading: authLoading } = useAuth();
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    // Prevent infinite loops: only fetch if user is verified and loading is complete
    if (authLoading) return;

    // Prevent multiple fetches
    if (hasFetchedRef.current) return;

    // Only fetch if user is authorized - VerifyEmailGate handles verification
    if (user && userType === 'employer') {
      hasFetchedRef.current = true;

      // Fetch dashboard data
      const fetchDashboardData = async () => {
        try {
          const [jobsRes, applicationsRes, statsRes] = await Promise.all([
            api.get('/employers/jobs?limit=5'),
            api.get('/employers/applications?limit=5'),
            api.get('/employers/stats')
          ]);

          setJobs(jobsRes.data.data.jobs || []);
          setApplications(applicationsRes.data.data.applications || []);

          if (statsRes.data.success) {
            setStats(statsRes.data.data.stats);
          }
        } catch (error) {
          if (error.response?.status === 403) {
            toast.error('Please verify your email to access dashboard data');
          } else {
            console.error('Dashboard fetch error:', error);
            toast.error('Failed to load dashboard data');
          }
        } finally {
          setLoading(false);
        }
      };

      fetchDashboardData();
    } else {
      // If user is not verified or no user, stop loading state
      // User can still see the page with verification message
      setLoading(false);
      hasFetchedRef.current = true;
    }
  }, [user, userType, authLoading]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <FaClock className="text-yellow-500" />;
      case 'accepted':
        return <FaCheckCircle className="text-green-500" />;
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

  const handleResendVerification = async () => {
    try {
      await api.post('/auth/resend-verification', { email: user?.email });
      toast.success('Verification email sent!');
    } catch (error) {
      toast.error('Failed to resend verification email');
    }
  };

  // Show loading state while auth is loading
  if (authLoading || loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <VerifyEmailGate>
        <Head>
          <title>Employer Dashboard - JobPulse</title>
          <meta name="description" content="Manage your job postings and applications" />
        </Head>

        <div>
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  Dashboard Overview
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Detailed analytics and recent activity
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

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Recent Jobs */}
            <div>
              <div className="card h-full">
                <div className="card-header flex justify-between items-center">
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
                      {jobs.filter(j => /^[a-fA-F0-9]{24}$/.test(j._id)).slice(0, 5).map((job) => (
                        <div key={job._id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                          <div className="flex-1 min-w-0 mr-4">
                            <h4 className="font-medium text-gray-900 dark:text-white truncate">
                              {job.title}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                              {job.location} • {job.type}
                            </p>
                            <p className="text-xs text-gray-500">
                              Posted {new Date(job.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2 flex-shrink-0">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${job.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
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
              <div className="card h-full">
                <div className="card-header flex justify-between items-center">
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
                          <div className="flex-1 min-w-0 mr-4">
                            <h4 className="font-medium text-gray-900 dark:text-white truncate">
                              {application.applicant?.name || 'Unknown Candidate'}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                              Applied for {application.job.title}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(application.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2 flex-shrink-0">
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
        </div>
      </VerifyEmailGate>
    </DashboardLayout>
  );
}

// Protect this route - require employer authentication
export default withAuth(EmployerDashboard, {
  requiredUserType: 'employer',
  redirectTo: '/auth/login'
}); 