import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaEye, 
  FaUsers, 
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaSearch,
  FaFilter,
  FaExclamationTriangle,
  FaBriefcase,
  FaDollarSign
} from 'react-icons/fa';
import { useAuth } from '../../../contexts/AuthContext';
import { api } from '../../../utils/api';
import { withAuth } from '../../../utils/withAuth';
import DashboardLayout from '../../../components/DashboardLayout';

function EmployerJobs() {
  const { user, userType, loading: authLoading } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [deletingJob, setDeletingJob] = useState(null);
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    if (authLoading) return;
    
    // Prevent multiple fetches
    if (hasFetchedRef.current) return;
    
    // Only fetch if user is verified
    if (user && !user.isVerified) {
      setLoading(false);
      hasFetchedRef.current = true;
      return;
    }
    
    if (user && user.isVerified && userType === 'employer') {
      hasFetchedRef.current = true;
      
      const fetchJobs = async () => {
        try {
          setLoading(true);
          const response = await api.get('/employers/jobs');
          setJobs(response.data.data.jobs || []);
        } catch (error) {
          if (error.response?.status === 403) {
            toast.error('Please verify your email to access jobs');
          } else {
            toast.error('Failed to load jobs');
          }
        } finally {
          setLoading(false);
        }
      };
      
      fetchJobs();
    }
  }, [user, userType, authLoading]);

  const handleDelete = async (jobId) => {
    if (!confirm('Are you sure you want to delete this job? This action cannot be undone.')) {
      return;
    }

    setDeletingJob(jobId);
    try {
      const response = await api.delete(`/jobs/${jobId}`);

      if (response.data.success) {
        toast.success('Job deleted successfully!');
        setJobs(jobs.filter(job => job._id !== jobId));
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete job. Please try again.';
      toast.error(message);
    } finally {
      setDeletingJob(null);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <FaCheckCircle className="text-green-500" />;
      case 'inactive':
        return <FaTimesCircle className="text-red-500" />;
      case 'pending':
        return <FaClock className="text-yellow-500" />;
      default:
        return <FaClock className="text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'inactive':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || 
      (statusFilter === 'active' && job.isActive) || 
      (statusFilter === 'inactive' && !job.isActive);
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full min-h-[400px]">
          <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Head>
        <title>Manage Jobs - JobPulse</title>
        <meta name="description" content="Manage your job postings on JobPulse" />
      </Head>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden min-h-[calc(100vh-100px)]">
        {/* Verification Banner - Show if user is not verified */}
        {user && !user.isVerified && (
           <div className="bg-yellow-500/10 border-l-4 border-yellow-500 p-4 m-6 mb-0">
             <div className="flex items-center justify-between">
               <div className="flex items-center">
                 <FaExclamationTriangle className="text-yellow-500 text-xl mr-3" />
                 <div>
                   <h3 className="text-lg font-semibold text-yellow-700 dark:text-yellow-500">
                     Verify Your Email
                   </h3>
                   <p className="text-sm text-yellow-600 dark:text-yellow-400">
                     Please verify your email address to address all profile features. Check your inbox for the verification link.
                   </p>
                 </div>
               </div>
               <button 
                 className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors ml-4" 
                 onClick={async () => {
                   try {
                     await api.post('/auth/resend-verification', { email: user?.email });
                     toast.success('Verification email sent!');
                   } catch (error) {
                     toast.error('Failed to resend verification email');
                   }
                 }}
               >
                 Resend Email
               </button>
             </div>
           </div>
         )}
         
         <div className="p-6 md:p-8">
           {/* Header */}
           <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
             <div>
               <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                 Manage Job Postings
               </h1>
               <p className="text-gray-600 dark:text-gray-400">
                 View, edit, and manage all your job postings
               </p>
             </div>
             <Link 
               href="/employer/jobs/create" 
               className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-medium rounded-xl hover:from-orange-600 hover:to-red-600 transition-all duration-300 shadow-lg shadow-orange-500/30"
             >
               <FaPlus className="mr-2" />
               Post New Job
             </Link>
           </div>

           {/* Filters */}
           <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6 mb-8">
              <div className="grid md:grid-cols-3 gap-4">
                {/* Search */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Search Jobs
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaSearch className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search by title or location..."
                      className="w-full pl-10 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>

                {/* Status Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Status
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                {/* Clear Filters */}
                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setStatusFilter('');
                    }}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center justify-center"
                  >
                    <FaFilter className="mr-2" />
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>

           {/* Jobs Grid */}
           {filteredJobs.length === 0 ? (
             <div className="text-center py-16 bg-gray-50 dark:bg-gray-700/30 rounded-xl border border-dashed border-gray-300 dark:border-gray-600">
               <div className="max-w-md mx-auto">
                 <FaBriefcase className="text-6xl text-gray-300 dark:text-gray-600 mx-auto mb-6" />
                 <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                   {jobs.length === 0 ? 'No Jobs Posted Yet' : 'No Jobs Match Your Filters'}
                 </h3>
                 <p className="text-gray-500 dark:text-gray-400 mb-6">
                   {jobs.length === 0 
                     ? 'Start posting jobs to attract talented candidates to your company.'
                     : 'Try adjusting your search criteria or clear the filters.'
                   }
                 </p>
                 {jobs.length === 0 && (
                   <Link 
                     href="/employer/jobs/create" 
                     className="inline-flex items-center px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                   >
                     <FaPlus className="mr-2" />
                     Post Your First Job
                   </Link>
                 )}
               </div>
             </div>
           ) : (
             <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
               {filteredJobs.map((job, index) => (
                 <motion.div
                   key={job._id}
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ duration: 0.5, delay: index * 0.1 }}
                   className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col h-full"
                 >
                   <div className="p-6 flex-1">
                     {/* Job Header */}
                     <div className="flex items-start justify-between mb-4">
                       <div className="flex-1 pr-2">
                         <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1 line-clamp-1">
                           {job.title}
                         </h3>
                         <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
                           {job.location}
                         </p>
                       </div>
                       <div className="flex-shrink-0">
                         <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                           job.isActive 
                             ? 'bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-400 border-green-200 dark:border-green-500/30' 
                             : 'bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-400 border-red-200 dark:border-red-500/30'
                         }`}>
                           {job.isActive ? (
                             <>
                               <FaCheckCircle className="mr-1" /> Active
                             </>
                           ) : (
                             <>
                               <FaTimesCircle className="mr-1" /> Inactive
                             </>
                           )}
                         </span>
                       </div>
                     </div>

                     {/* Job Details */}
                     <div className="space-y-3 mb-4">
                       <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                         <FaBriefcase className="mr-2 text-orange-500" />
                         {job.type || job.jobType}
                       </div>
                       <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                         <FaDollarSign className="mr-2 text-orange-500" />
                         {job.salaryMin ? `$${job.salaryMin.toLocaleString()} - $${job.salaryMax.toLocaleString()}` : (job.salary ? `$${job.salary.toLocaleString()}` : 'Negotiable')}
                       </div>
                       {job.applicationCount !== undefined && (
                         <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                           <FaUsers className="mr-2 text-orange-500" />
                           {job.applicationCount} applications
                         </div>
                       )}
                     </div>

                     {/* Job Description Preview */}
                     <div className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-3 min-h-[4.5em]">
                       {job.description ? job.description.replace(/<[^>]+>/g, '') : 'No description available.'}
                     </div>

                     {/* Posted Date */}
                     <div className="text-xs text-gray-400 border-t border-gray-100 dark:border-gray-700 pt-4 mb-4">
                       Posted {new Date(job.createdAt).toLocaleDateString()}
                     </div>
                   </div>

                   {/* Action Buttons */}
                   <div className="bg-gray-50 dark:bg-gray-700/30 px-6 py-4 rounded-b-xl border-t border-gray-100 dark:border-gray-700 grid grid-cols-3 gap-2">
                     <Link
                       href={`/employer/jobs/${job._id}`}
                       className="flex items-center justify-center px-3 py-2 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-500/20 transition-colors text-sm font-medium"
                     >
                       <FaEye className="mr-1.5" />
                       View
                     </Link>
                     <Link
                       href={`/employer/jobs/${job._id}/edit`}
                       className="flex items-center justify-center px-3 py-2 bg-orange-500/10 text-orange-600 dark:text-orange-400 rounded-lg hover:bg-orange-500/20 transition-colors text-sm font-medium"
                     >
                       <FaEdit className="mr-1.5" />
                       Edit
                     </Link>
                     <button
                       onClick={() => handleDelete(job._id)}
                       disabled={deletingJob === job._id}
                       className="flex items-center justify-center px-3 py-2 bg-red-500/10 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-500/20 transition-colors text-sm font-medium"
                     >
                       {deletingJob === job._id ? (
                         <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-red-600 mr-1.5"></div>
                       ) : (
                         <FaTrash className="mr-1.5" />
                       )}
                       {deletingJob === job._id ? '...' : 'Del'}
                     </button>
                   </div>
                 </motion.div>
               ))}
             </div>
           )}

           {/* Stats */}
           {jobs.length > 0 && (
             <div className="mt-8 bg-gray-50 dark:bg-gray-700/30 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                 <div className="grid md:grid-cols-4 gap-6 text-center divide-y md:divide-y-0 md:divide-x divide-gray-200 dark:divide-gray-600">
                   <div className="py-2 md:py-0">
                     <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                       {jobs.length}
                     </div>
                     <div className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                       Total Jobs
                     </div>
                   </div>
                   <div className="py-2 md:py-0">
                     <div className="text-3xl font-bold text-green-600 mb-1">
                       {jobs.filter(job => job.isActive).length}
                     </div>
                     <div className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                       Active Jobs
                     </div>
                   </div>
                   <div className="py-2 md:py-0">
                     <div className="text-3xl font-bold text-red-500 mb-1">
                       {jobs.filter(job => !job.isActive).length}
                     </div>
                     <div className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                       Inactive Jobs
                     </div>
                   </div>
                   <div className="py-2 md:py-0">
                     <div className="text-3xl font-bold text-blue-600 mb-1">
                       {jobs.reduce((total, job) => total + (job.applicationCount || 0), 0)}
                     </div>
                     <div className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                       Total Applications
                     </div>
                   </div>
                 </div>
               </div>
           )}
         </div>
      </div>
    </DashboardLayout>
  );
}

// Protect this route - require employer authentication (verification not required)
// Unverified users can access but will see verification message
export default withAuth(EmployerJobs, {
  requiredUserType: 'employer',
  requireVerification: false, // Allow unverified users to see the page
  redirectTo: '/auth/login'
}); 