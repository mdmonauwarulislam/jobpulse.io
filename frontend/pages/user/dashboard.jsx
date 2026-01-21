import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { 
  FaBriefcase, 
  FaClock, 
  FaCheckCircle, 
  FaTimesCircle,
  FaBuilding,
  FaMapMarkerAlt,
  FaEye
} from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../utils/api';
import { withAuth } from '../../utils/withAuth';
import VerifyEmailGate from '../../components/VerifyEmailGate';
import DashboardLayout from '../../components/DashboardLayout';

function UserDashboard() {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState({
    totalApplications: 0,
    pendingApplications: 0,
    acceptedApplications: 0,
    rejectedApplications: 0
  });
  const [loading, setLoading] = useState(true);

  const { userType, loading: authLoading } = useAuth();
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    if (authLoading) return;
    if (hasFetchedRef.current) return;
    
    if (user && userType === 'user') {
      hasFetchedRef.current = true;
      
      const fetchDashboardData = async () => {
        try {
          // No longer fetching recommended jobs as requested
          const applicationsRes = await api.get('/applications/user');
          const apps = applicationsRes.data.data.applications || [];

          setApplications(apps);

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
      
      fetchDashboardData();
    } else {
        setLoading(false);
    }
  }, [user, userType, authLoading]);

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
          <title>Dashboard - JobPulse</title>
          <meta name="description" content="Your JobPulse dashboard" />
        </Head>

        <div>
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Welcome back, {user?.name}!
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Here is an overview of your job search activities
            </p>
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
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Applications</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalApplications}</p>
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
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.pendingApplications}</p>
                  </div>
                  <FaClock className="text-3xl text-yellow-500" />
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
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Accepted</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.acceptedApplications}</p>
                  </div>
                  <FaCheckCircle className="text-3xl text-green-500" />
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
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Rejected</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.rejectedApplications}</p>
                  </div>
                  <FaTimesCircle className="text-3xl text-red-500" />
                </div>
              </div>
            </motion.div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Recent Applications */}
            <div className="lg:col-span-2">
              <div className="card h-full">
                <div className="card-header flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Applications</h3>
                  <Link href="/user/applications" className="text-primary-600 hover:text-primary-500 text-sm">
                    View All
                  </Link>
                </div>
                <div className="card-body">
                  {applications.length === 0 ? (
                    <div className="text-center py-8">
                      <FaBriefcase className="text-4xl text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 dark:text-gray-400 mb-4">No applications yet</p>
                      <Link href="/jobs" className="btn-primary">
                        Find Jobs
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {applications.slice(0, 5).map((application) => (
                        <div key={application._id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                          <div className="flex-1 min-w-0 mr-4">
                            <h4 className="font-medium text-gray-900 dark:text-white truncate">
                              {application.job.title}
                            </h4>
                            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mt-1">
                              <FaBuilding className="mr-2 text-gray-400" />
                              <span className="truncate">{application.job.employer?.company || application.job.company || 'Company'}</span>
                            </div>
                            <div className="flex items-center text-xs text-gray-500 mt-2">
                              <span className={`px-2 py-0.5 rounded-full ${getStatusColor(application.status)}`}>
                                {application.status}
                              </span>
                              <span className="mx-2">•</span>
                              <span>{new Date(application.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <Link href={`/jobs/${application.job._id}`} className="btn-outline btn-sm">
                            <FaEye className="mr-1" />
                            View
                          </Link>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Actions / Tips Widget */}
            <div>
              <div className="card h-full">
                <div className="card-header">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Quick Tips</h3>
                </div>
                <div className="card-body">
                  <div className="space-y-6">
                    <div className="bg-primary-50 dark:bg-primary-900/10 p-4 rounded-lg">
                      <h4 className="font-medium text-primary-800 dark:text-primary-300 mb-2">Complete Your Profile</h4>
                      <p className="text-sm text-primary-700 dark:text-primary-400 mb-3">
                        A complete profile increases your chances of getting hired by 40%.
                      </p>
                      <Link href="/user/profile" className="text-sm font-medium text-primary-600 hover:text-primary-500">
                        Update Profile →
                      </Link>
                    </div>

                    <div className="bg-green-50 dark:bg-green-900/10 p-4 rounded-lg">
                      <h4 className="font-medium text-green-800 dark:text-green-300 mb-2">Upload Resume</h4>
                      <p className="text-sm text-green-700 dark:text-green-400 mb-3">
                        Keep your resume up to date to apply for jobs quickly.
                      </p>
                      <Link href="/user/resume" className="text-sm font-medium text-green-600 hover:text-green-500">
                        Manage Resume →
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </VerifyEmailGate>
    </DashboardLayout>
  );
}

// Protect this route - require user authentication
export default withAuth(UserDashboard, {
  requiredUserType: 'user',
  redirectTo: '/auth/login'
});