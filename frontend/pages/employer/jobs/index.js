import { useState, useEffect } from 'react';
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
  FaFilter
} from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../utils/api';

export default function EmployerJobs() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [deletingJob, setDeletingJob] = useState(null);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await api.get('/jobs/employer');
      setJobs(response.data.data.jobs || []);
    } catch (error) {
      toast.error('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (jobId) => {
    if (!confirm('Are you sure you want to delete this job? This action cannot be undone.')) {
      return;
    }

    setDeletingJob(jobId);
    try {
      const response = await api.delete(`/jobs/${jobId}`);

      if (response.data.success) {
        toast.success('Job deleted successfully!');
        fetchJobs(); // Refresh the list
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
    const matchesStatus = !statusFilter || job.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container-custom py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-1/4 mb-8"></div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 bg-gray-300 dark:bg-gray-700 rounded"></div>
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
        <title>Manage Jobs - JobPulse</title>
        <meta name="description" content="Manage your job postings on JobPulse" />
      </Head>

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container-custom py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  Manage Job Postings
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  View, edit, and manage all your job postings
                </p>
              </div>
              <Link href="/employer/jobs/create" className="btn-primary">
                <FaPlus className="mr-2" />
                Post New Job
              </Link>
            </div>
          </motion.div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="card mb-8"
          >
            <div className="card-body p-6">
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
                      className="input-field pl-10"
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
                    className="input-field"
                  >
                    <option value="">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>

                {/* Clear Filters */}
                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setStatusFilter('');
                    }}
                    className="btn-outline w-full"
                  >
                    <FaFilter className="mr-2" />
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Jobs Grid */}
          {filteredJobs.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-center py-16"
            >
              <div className="max-w-md mx-auto">
                <FaBriefcase className="text-6xl text-gray-400 mx-auto mb-6" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {jobs.length === 0 ? 'No Jobs Posted Yet' : 'No Jobs Match Your Filters'}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {jobs.length === 0 
                    ? 'Start posting jobs to attract talented candidates to your company.'
                    : 'Try adjusting your search criteria or clear the filters.'
                  }
                </p>
                {jobs.length === 0 && (
                  <Link href="/employer/jobs/create" className="btn-primary">
                    <FaPlus className="mr-2" />
                    Post Your First Job
                  </Link>
                )}
              </div>
            </motion.div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredJobs.map((job, index) => (
                <motion.div
                  key={job._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="card hover-lift"
                >
                  <div className="card-body p-6">
                    {/* Job Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                          {job.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {job.location}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(job.status)}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                          {job.status}
                        </span>
                      </div>
                    </div>

                    {/* Job Details */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <FaBriefcase className="mr-2 text-primary-500" />
                        {job.type}
                      </div>
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <FaDollarSign className="mr-2 text-primary-500" />
                        ${job.salaryMin.toLocaleString()} - ${job.salaryMax.toLocaleString()}
                      </div>
                      {job.applicationCount > 0 && (
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                          <FaUsers className="mr-2 text-primary-500" />
                          {job.applicationCount} applications
                        </div>
                      )}
                    </div>

                    {/* Job Description Preview */}
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                      {job.description}
                    </p>

                    {/* Posted Date */}
                    <p className="text-xs text-gray-500 mb-4">
                      Posted {new Date(job.createdAt).toLocaleDateString()}
                    </p>

                    {/* Action Buttons */}
                    <div className="flex space-x-2">
                      <Link
                        href={`/jobs/${job._id}`}
                        className="btn-outline btn-sm flex-1"
                      >
                        <FaEye className="mr-1" />
                        View
                      </Link>
                      <Link
                        href={`/employer/jobs/${job._id}/edit`}
                        className="btn-outline btn-sm flex-1"
                      >
                        <FaEdit className="mr-1" />
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(job._id)}
                        disabled={deletingJob === job._id}
                        className="btn-outline btn-sm text-red-600 hover:text-red-700 border-red-600 hover:border-red-700"
                      >
                        {deletingJob === job._id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600 mr-1"></div>
                        ) : (
                          <FaTrash className="mr-1" />
                        )}
                        {deletingJob === job._id ? 'Deleting...' : 'Delete'}
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Stats */}
          {jobs.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-8"
            >
              <div className="card">
                <div className="card-body p-6">
                  <div className="grid md:grid-cols-4 gap-6 text-center">
                    <div>
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {jobs.length}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Total Jobs
                      </div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-600">
                        {jobs.filter(job => job.status === 'active').length}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Active Jobs
                      </div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-yellow-600">
                        {jobs.filter(job => job.status === 'pending').length}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Pending Jobs
                      </div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-blue-600">
                        {jobs.reduce((total, job) => total + (job.applicationCount || 0), 0)}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Total Applications
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
} 