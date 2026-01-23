import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
  FaUsers,
  FaBriefcase,
  FaBuilding,
  FaFileAlt,
  FaArrowRight
} from 'react-icons/fa';
import { api } from '../../utils/api';
// Use the unified DashboardLayout instead of the specific AdminLayout
import DashboardLayout from '../../components/DashboardLayout';
import { useAuth } from '../../contexts/AuthContext';
import { withAuth } from '../../utils/withAuth';
import VerifyEmailGate from '../../components/VerifyEmailGate';
import dynamic from 'next/dynamic';

// Dynamic import for charts (from old dashboard.js)
const AdminDashboardChart = dynamic(() => import('../../components/admin/AdminDashboardChart'), { ssr: false });

function AdminDashboard() {
  const { user, userType, loading: authLoading } = useAuth();

  // State for basic stats
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalEmployers: 0,
    totalJobs: 0,
    totalApplications: 0,
    pendingJobs: 0,
    pendingApplications: 0
  });

  // State for lists
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentJobs, setRecentJobs] = useState([]);

  // State for growth charts (from old dashboard.js)
  const [userGrowth, setUserGrowth] = useState([]);
  const [jobGrowth, setJobGrowth] = useState([]);
  const [applicationGrowth, setApplicationGrowth] = useState([]);

  const [loading, setLoading] = useState(true);
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    // Prevent fetching if user is not verified or not admin
    if (authLoading) return;

    // Prevent multiple fetches
    if (hasFetchedRef.current) return;

    // VerifyEmailGate handles verification
    if (user && userType === 'admin') {
      hasFetchedRef.current = true;

      const fetchDashboardData = async () => {
        try {
          // Combined data fetching: Basic stats + Growth data
          // Fetching 12 months for better trend visualization
          const [
            statsRes,
            usersRes,
            jobsRes,
            userGrowthRes,
            jobGrowthRes,
            applicationGrowthRes
          ] = await Promise.all([
            api.get('/admin/dashboard'),
            api.get('/admin/users?limit=5'),
            api.get('/admin/jobs?limit=5'),
            api.get('/admin/users?groupBy=month&count=true&limit=12'),
            api.get('/admin/jobs?groupBy=month&count=true&limit=12'),
            api.get('/admin/applications?groupBy=month&count=true&limit=12')
          ]);

          const statsData = statsRes.data.data.stats || {};
          setStats({
            totalUsers: statsData.totalUsers || 0,
            totalEmployers: statsData.totalEmployerProfiles || 0,
            totalJobs: statsData.totalJobs || 0,
            totalApplications: statsData.totalApplications || 0,
            pendingJobs: statsData.pendingJobs || 0,
            pendingApplications: statsData.pendingApplications || 0
          });
          setRecentUsers(usersRes.data.data.users || []);
          setRecentJobs(jobsRes.data.data.jobs || []);

          // Helper to normalize data for all 12 months to show full year trend
          const fullYearMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          const normalizeChartData = (backendData) => {
            const dataMap = new Map((backendData || []).map(item => [item.label, item.count]));
            return fullYearMonths.map(month => ({
              label: month,
              count: dataMap.get(month) || 0
            }));
          };

          setUserGrowth(normalizeChartData(userGrowthRes.data.data));
          setJobGrowth(normalizeChartData(jobGrowthRes.data.data));
          setApplicationGrowth(normalizeChartData(applicationGrowthRes.data.data));

        } catch (error) {
          console.error(error);
          // Handle 403 (forbidden) errors gracefully
          if (error.response?.status === 403) {
            toast.error('Please verify your email to access the dashboard');
          } else {
            toast.error('Failed to load dashboard data');
          }
        } finally {
          setLoading(false);
        }
      };

      fetchDashboardData();
    }
  }, [user, userType, authLoading]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-300';
      case 'active':
        return 'bg-green-500/20 text-green-300';
      case 'rejected':
      case 'inactive':
        return 'bg-red-500/20 text-red-300';
      default:
        return 'bg-gray-500/20 text-gray-300';
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-gray-700/50 rounded w-1/4"></div>
          <div className="grid md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-700/50 rounded-xl"></div>
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <VerifyEmailGate>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Dashboard Overview
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Welcome back! Here's what's happening on JobPulse.
          </p>
        </div>

        {/* Quick Actions Bar (Optional, from old file logic if needed, 
            but sidebar usually handles this. keeping it clean for now 
            unless requested) */}

        {/* Stats Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { label: 'Total Users', value: stats.totalUsers, icon: FaUsers, color: 'text-blue-500', bg: 'bg-blue-500/10' },
            { label: 'Employers', value: stats.totalEmployers, icon: FaBuilding, color: 'text-green-500', bg: 'bg-green-500/10' },
            { label: 'Active Jobs', value: stats.totalJobs, icon: FaBriefcase, color: 'text-orange-500', bg: 'bg-orange-500/10' },
            { label: 'Applications', value: stats.totalApplications, icon: FaFileAlt, color: 'text-purple-500', bg: 'bg-purple-500/10' },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-xl p-6 flex items-center justify-between hover:shadow-lg transition-all"
            >
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-lg ${stat.bg}`}>
                <stat.icon className={`text-2xl ${stat.color}`} />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Analytics Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 mb-8">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">User Growth</h2>
            {userGrowth.length === 0 ? (
              <div className="text-gray-400 text-center py-8 border border-dashed border-gray-700 rounded-lg">No user registration data available.</div>
            ) : (
              <AdminDashboardChart
                data={userGrowth}
                title="New Users Trend"
                label="New Users"
                type="line"
                color="rgba(59, 130, 246, 0.7)"
              />
            )}
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Job Postings</h2>
            {jobGrowth.length === 0 ? (
              <div className="text-gray-400 text-center py-8 border border-dashed border-gray-700 rounded-lg">No job posting data available.</div>
            ) : (
              <AdminDashboardChart
                data={jobGrowth}
                title="Job Postings Trend"
                label="New Jobs"
                type="bar" // Keeping as bar for contrast
                color="rgba(249, 115, 22, 0.7)"
              />
            )}
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Applications Submitted</h2>
          <div className="max-w-full">
            {applicationGrowth.length === 0 ? (
              <div className="text-gray-400 text-center py-8 border border-dashed border-gray-700 rounded-lg">No application data available.</div>
            ) : (
              <AdminDashboardChart
                data={applicationGrowth}
                title="Applications Trend"
                label="Applications"
                type="line"
                color="rgba(139, 92, 246, 0.7)"
              />
            )}
          </div>
        </div>

        {/* Recent Activity Grid */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Recent Users */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-xl overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-white/10 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Users</h3>
              <Link href="/admin/users" className="text-orange-500 hover:text-orange-400 text-sm font-medium flex items-center">
                View All <FaArrowRight className="ml-1 text-xs" />
              </Link>
            </div>
            <div>
              {recentUsers.length === 0 ? (
                <div className="p-8 text-center text-gray-400">No users yet</div>
              ) : (
                <div className="divide-y divide-gray-200 dark:divide-white/10">
                  {recentUsers.map((user) => (
                    <div key={user._id} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-600 flex items-center justify-center text-white font-bold">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{user.name}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${user.role === 'admin' ? 'bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-300' : 'bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-300'
                        }`}>
                        {user.role}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Recent Jobs */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-xl overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-white/10 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Jobs</h3>
              <Link href="/admin/jobs" className="text-orange-500 hover:text-orange-400 text-sm font-medium flex items-center">
                View All <FaArrowRight className="ml-1 text-xs" />
              </Link>
            </div>
            <div>
              {recentJobs.length === 0 ? (
                <div className="p-8 text-center text-gray-400">No jobs yet</div>
              ) : (
                <div className="divide-y divide-gray-200 dark:divide-white/10">
                  {recentJobs.map((job) => (
                    <div key={job._id} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                      <div className="min-w-0 flex-1 mr-4">
                        <p className="font-medium text-gray-900 dark:text-white truncate">{job.title}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                          {job.employer?.companyName || job.company}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(job.isActive ? 'active' : 'inactive')}`}>
                        {job.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </VerifyEmailGate>
    </DashboardLayout>
  );
}

// Protect this route - require admin authentication
export default withAuth(AdminDashboard, {
  requiredUserType: 'admin',
  redirectTo: '/auth/login'
});