import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { 
  FaBriefcase, 
  FaMapMarkerAlt, 
  FaDollarSign, 
  FaClock, 
  FaEdit,
  FaArrowLeft,
  FaUsers,
  FaFileAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaCalendarAlt,
  FaUser
} from 'react-icons/fa';
import { useAuth } from '../../../../contexts/AuthContext';
import { api } from '../../../../utils/api';
import { withAuth } from '../../../../utils/withAuth';

function JobDetails() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();
  const [job, setJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    shortlisted: 0,
    rejected: 0,
    hired: 0
  });

  useEffect(() => {
    if (id) {
      fetchJobDetails();
    }
  }, [id]);

  const fetchJobDetails = async () => {
    try {
      setLoading(true);
      // Fetch Job Details
      const jobRes = await api.get(`/jobs/${id}`);
      setJob(jobRes.data.data.job);

      // Fetch Applications for this job
      // Note: Assuming endpoint supports filtering by jobId
      const appsRes = await api.get(`/employers/applications?jobId=${id}&limit=100`); 
      const apps = appsRes.data.data.applications || [];
      setApplications(apps);

      // Calculate stats
      const newStats = apps.reduce((acc, app) => {
        acc.total++;
        if (app.status === 'pending') acc.pending++;
        if (app.status === 'shortlisted') acc.shortlisted++;
        if (app.status === 'rejected') acc.rejected++;
        if (app.status === 'hired') acc.hired++;
        return acc;
      }, { total: 0, pending: 0, shortlisted: 0, rejected: 0, hired: 0 });
      setStats(newStats);

    } catch (error) {
      console.error(error);
      toast.error('Failed to load job details');
      router.push('/employer/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (applicationId, newStatus) => {
    try {
      await api.put(`/employers/applications/${applicationId}/status`, { status: newStatus });
      toast.success(`Application marked as ${newStatus}`);
      fetchJobDetails(); // Refresh list/stats
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'open': // some apps use open
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'; 
      case 'inactive':
      case 'closed':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  const getAppStatusBadge = (status) => {
    switch (status) {
        case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
        case 'reviewed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
        case 'shortlisted': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
        case 'rejected': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
        case 'hired': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300';
        default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
        <div className="max-w-7xl mx-auto space-y-6 animate-pulse">
            <div className="h-8 bg-gray-300 dark:bg-gray-800 rounded w-1/4"></div>
            <div className="h-64 bg-gray-300 dark:bg-gray-800 rounded-xl"></div>
        </div>
      </div>
    );
  }

  if (!job) return null;

  return (
    <>
      <Head>
        <title>{job.title} - Job Details</title>
      </Head>

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
            {/* Header / Nav */}
            <div className="flex items-center justify-between mb-8">
                <Link href="/employer/dashboard" className="flex items-center text-gray-600 dark:text-gray-400 hover:text-primary-500 transition-colors">
                    <FaArrowLeft className="mr-2" /> Back to Dashboard
                </Link>
                <Link href={`/employer/jobs/${id}/edit`} className="btn-primary flex items-center">
                    <FaEdit className="mr-2" /> Edit Job
                </Link>
            </div>

            {/* Job Overview Card */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-soft border border-gray-200 dark:border-gray-700 overflow-hidden mb-8"
            >
                <div className="p-6 md:p-8">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{job.title}</h1>
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(job.isActive ? 'active' : 'inactive')}`}>
                                    {job.isActive ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-4 text-gray-600 dark:text-gray-400 mt-2">
                                <span className="flex items-center"><FaMapMarkerAlt className="mr-1" /> {job.location}</span>
                                <span className="flex items-center"><FaBriefcase className="mr-1" /> {job.jobType}</span>
                                <span className="flex items-center"><FaDollarSign className="mr-1" /> {job.salary ? `$${job.salary.toLocaleString()}` : 'Negotiable'}</span>
                                <span className="flex items-center"><FaCalendarAlt className="mr-1" /> Posted {new Date(job.createdAt).toLocaleDateString()}</span>
                            </div>
                        </div>
                        
                        <div className="flex gap-4">
                            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-700">
                                <div className="text-2xl font-bold text-primary-500">{stats.total}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide">Total Applications</div>
                            </div>
                            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-700">
                                <div className="text-2xl font-bold text-green-500">{stats.shortlisted}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide">Shortlisted</div>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Applications List */}
            <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                    <FaUsers className="mr-2 text-primary-500" /> 
                    Candidates ({applications.length})
                </h2>

                {applications.length === 0 ? (
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center border border-gray-200 dark:border-gray-700">
                        <FaUser className="text-5xl text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No applications yet</h3>
                        <p className="text-gray-500 dark:text-gray-400">When candidates apply, they will appear here.</p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {applications.map((app) => (
                            <motion.div 
                                key={app._id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:border-primary-500/50 transition-colors"
                            >
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center text-xl font-bold text-gray-600 dark:text-gray-300">
                                            {app.applicant?.name?.charAt(0) || 'U'}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                                                {app.applicant?.name || 'Unknown User'}
                                            </h3>
                                            <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                                                {app.applicant?.email}
                                            </div>
                                            <div className="flex items-center gap-2 mt-2">
                                                <span className={`px-2 py-0.5 rounded text-xs font-medium uppercase ${getAppStatusBadge(app.status)}`}>
                                                    {app.status}
                                                </span>
                                                <span className="text-xs text-gray-400">
                                                    Applied {new Date(app.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        {/* View Resume / Cover Letter - could expand to show modal */}
                                        {app.resume && (
                                            <a href={app.resume} target="_blank" rel="noopener noreferrer" className="btn-outline btn-sm">
                                                <FaFileAlt className="mr-1" /> Resume
                                            </a>
                                        )}
                                        
                                        {/* Actions */}
                                        <select 
                                            value={app.status}
                                            onChange={(e) => handleStatusUpdate(app._id, e.target.value)}
                                            className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block p-2.5"
                                        >
                                            <option value="pending">Pending</option>
                                            <option value="reviewed">Reviewed</option>
                                            <option value="shortlisted">Shortlisted</option>
                                            <option value="rejected">Rejected</option>
                                            <option value="hired">Hired</option>
                                        </select>
                                    </div>
                                </div>
                                
                                {/* Cover Letter snippet */}
                                {app.coverLetter && (
                                    <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg text-sm text-gray-600 dark:text-gray-400">
                                        <p className="line-clamp-2">{app.coverLetter}</p>
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
      </div>
    </>
  );
}

export default withAuth(JobDetails, {
  requiredUserType: 'employer',
  redirectTo: '/auth/login'
});
