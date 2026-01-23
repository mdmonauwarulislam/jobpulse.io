import { useState, useEffect } from 'react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import {
  FaBriefcase,
  FaSearch,
  FaTrash,
  FaEye,
  FaBuilding,
  FaMapMarkerAlt,
  FaDollarSign,
  FaClock,
  FaUsers,
  FaDownload,
  FaTimes,
  FaExternalLinkAlt,
  FaCheckCircle,
  FaTimesCircle
} from 'react-icons/fa';
import { api } from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/router';
import Head from 'next/head';
import DashboardLayout from '../../components/DashboardLayout';
import ConfirmationModal from '../../components/ConfirmationModal';

export default function AdminJobs() {
  const { userType } = useAuth();
  const router = useRouter();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);

  // Modal State
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
    isDangerous: false
  });

  useEffect(() => {
    if (userType !== 'admin') {
      router.push('/');
      return;
    }
    fetchJobs();
  }, [page, searchTerm, statusFilter, userType]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page,
        limit: 10,
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter && { status: statusFilter })
      });

      const response = await api.get(`/admin/jobs?${params}`);
      setJobs(response.data.data.jobs || []);
      setPagination(response.data.data.pagination || {});
    } catch (error) {
      toast.error('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchJobs();
  };

  const handleExport = () => {
    if (jobs.length === 0) {
      toast.error('No jobs to export');
      return;
    }

    const headers = ['ID', 'Title', 'Company', 'Location', 'Type', 'Status', 'Applications', 'Posted'];
    const csvContent = [
      headers.join(','),
      ...jobs.map(j => [
        j._id,
        `"${j.title}"`,
        `"${j.company}"`,
        `"${j.location}"`,
        j.jobType,
        j.isActive ? 'Active' : 'Inactive',
        j.applicationCount || 0,
        new Date(j.createdAt).toISOString().split('T')[0]
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `jobs_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDeleteClick = (jobId) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Job',
      message: 'Are you sure you want to delete this job? This will also delete all applications.',
      isDangerous: true,
      onConfirm: () => executeDeleteJob(jobId)
    });
  };

  const executeDeleteJob = async (jobId) => {
    setActionLoading(true);
    setConfirmModal(prev => ({ ...prev, isOpen: false }));
    try {
      await api.delete(`/admin/jobs/${jobId}`);
      toast.success('Job deleted successfully');
      setSelectedJob(null);
      fetchJobs();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to delete job');
    } finally {
      setActionLoading(false);
    }
  };

  const toggleJobStatus = async (jobId, currentStatus) => {
    setActionLoading(true);
    try {
      await api.put(`/jobs/${jobId}`, { isActive: !currentStatus });
      toast.success(`Job ${currentStatus ? 'deactivated' : 'activated'} successfully`);

      if (selectedJob && selectedJob._id === jobId) {
        setSelectedJob({ ...selectedJob, isActive: !currentStatus });
      }
      fetchJobs();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update job');
    } finally {
      setActionLoading(false);
    }
  };

  const formatSalary = (salary, salaryType) => {
    if (!salary) return 'Not specified';
    const formatted = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(salary);
    return `${formatted}/${salaryType === 'Hourly' ? 'hr' : 'yr'}`;
  };

  const getJobTypeColor = (type) => {
    const colors = {
      'Full-time': 'bg-green-500/20 text-green-300 border-green-500/30',
      'Part-time': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      'Contract': 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
      'Internship': 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      'Remote': 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
      'Temporary': 'bg-orange-500/20 text-orange-300 border-orange-500/30'
    };
    return colors[type] || 'bg-gray-500/20 text-gray-300 border-gray-500/30';
  };

  return (
    <DashboardLayout>
      <Head>
        <title>Job Management - JobPulse Admin</title>
      </Head>
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Job Management</h1>
          <p className="text-gray-400">Manage all job postings on the platform</p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center space-x-2 px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
        >
          <FaDownload />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-gray-900 border border-white/10 p-6 rounded-xl mb-8">
        <form onSubmit={handleSearch} className="grid md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-400 mb-2">Search</label>
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by title, company, or location..."
                className="w-full pl-10 pr-4 py-2 bg-black/50 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="w-full px-4 py-2 bg-black/50 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-orange-500"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="expired">Expired</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              className="w-full px-6 py-2 bg-orange-600 text-white font-medium rounded-lg hover:bg-orange-700 transition-colors"
            >
              Search
            </button>
          </div>
        </form>
      </div>

      {/* Jobs Grid */}
      <div>
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-gray-900 border border-white/10 p-6 rounded-xl animate-pulse">
                <div className="h-6 bg-gray-700/50 rounded mb-4 w-3/4"></div>
                <div className="h-4 bg-gray-700/50 rounded mb-2 w-1/2"></div>
                <div className="h-4 bg-gray-700/50 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <div className="bg-gray-900 border border-white/10 rounded-xl p-12 text-center">
            <FaBriefcase className="text-5xl text-gray-500 mx-auto mb-4" />
            <p className="text-gray-400">No jobs found</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job) => (
              <div
                key={job._id}
                className="bg-gray-900 border border-white/10 rounded-xl p-6 hover:border-orange-500/30 transition-all duration-300 flex flex-col"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-white mb-1 truncate" title={job.title}>{job.title}</h3>
                    <div className="flex items-center text-gray-400 text-sm">
                      <FaBuilding className="mr-2 flex-shrink-0" />
                      <span className="truncate">{job.employer?.companyName || job.company}</span>
                    </div>
                  </div>
                  <span className={`ml-2 px-2 py-1 rounded-lg text-xs font-medium border flex-shrink-0 ${getJobTypeColor(job.jobType)}`}>
                    {job.jobType}
                  </span>
                </div>

                <div className="space-y-2 mb-6 flex-1">
                  <div className="flex items-center text-gray-400 text-sm">
                    <FaMapMarkerAlt className="mr-2 text-orange-500 flex-shrink-0" />
                    <span className="truncate">{job.location}</span>
                  </div>
                  <div className="flex items-center text-gray-400 text-sm">
                    <FaDollarSign className="mr-2 text-green-500 flex-shrink-0" />
                    <span>{formatSalary(job.salary, job.salaryType)}</span>
                  </div>
                  <div className="flex items-center text-gray-400 text-sm">
                    <FaClock className="mr-2 text-blue-500 flex-shrink-0" />
                    <span>
                      {new Date(job.applicationDeadline) > new Date()
                        ? `Expires ${new Date(job.applicationDeadline).toLocaleDateString()}`
                        : 'Expired'
                      }
                    </span>
                  </div>
                  <div className="flex items-center text-gray-400 text-sm">
                    <FaUsers className="mr-2 text-purple-500 flex-shrink-0" />
                    <span className="font-medium text-white">{job.applicationCount || 0} applications</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <button
                    onClick={() => toggleJobStatus(job._id, job.isActive)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${job.isActive
                      ? 'bg-green-500/20 text-green-300 hover:bg-green-500/30'
                      : 'bg-red-500/20 text-red-300 hover:bg-red-500/30'
                      }`}
                  >
                    {job.isActive ? 'Active' : 'Inactive'}
                  </button>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setSelectedJob(job)}
                      className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg transition-colors"
                      title="View Details"
                    >
                      <FaEye />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(job._id)}
                      className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                      title="Delete Job"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="mt-8 flex items-center justify-between">
            <p className="text-sm text-gray-400">
              Page {pagination.currentPage} of {pagination.totalPages}
            </p>
            <div className="flex space-x-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={!pagination.hasPrevPage}
                className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 disabled:opacity-50 transition-colors"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={!pagination.hasNextPage}
                className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 disabled:opacity-50 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Job Details Modal */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" onClick={() => setSelectedJob(null)}>
              <div className="absolute inset-0 bg-gray-900 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

            <div className="inline-block align-bottom bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full border border-white/10">
              <div className="bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex justify-between items-start mb-6">
                  <h3 className="text-xl font-bold text-white pr-4">{selectedJob.title}</h3>
                  <button
                    onClick={() => setSelectedJob(null)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <FaTimes className="text-xl" />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Key Details */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-700/30 p-4 rounded-lg">
                      <p className="text-gray-400 text-xs mb-1">Company</p>
                      <p className="text-white font-medium flex items-center">
                        <FaBuilding className="mr-2 text-orange-500" />
                        {selectedJob.employer?.companyName || selectedJob.company}
                      </p>
                    </div>
                    <div className="bg-gray-700/30 p-4 rounded-lg">
                      <p className="text-gray-400 text-xs mb-1">Location</p>
                      <p className="text-white font-medium flex items-center">
                        <FaMapMarkerAlt className="mr-2 text-orange-500" />
                        {selectedJob.location}
                      </p>
                    </div>
                    <div className="bg-gray-700/30 p-4 rounded-lg">
                      <p className="text-gray-400 text-xs mb-1">Job Type</p>
                      <span className={`inline-block px-2 py-1 rounded text-xs font-medium border ${getJobTypeColor(selectedJob.jobType)}`}>
                        {selectedJob.jobType}
                      </span>
                    </div>
                    <div className="bg-gray-700/30 p-4 rounded-lg">
                      <p className="text-gray-400 text-xs mb-1">Salary</p>
                      <p className="text-white font-medium flex items-center">
                        <FaDollarSign className="mr-2 text-green-500" />
                        {formatSalary(selectedJob.salary, selectedJob.salaryType)}
                      </p>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-300 mb-2">Description Snippet</h4>
                    <div
                      className="bg-gray-900/50 p-4 rounded-lg text-gray-400 text-sm max-h-40 overflow-y-auto prose prose-invert max-w-none"
                      dangerouslySetInnerHTML={{ __html: selectedJob.description }}
                    />
                  </div>

                  {/* Status & Stats */}
                  <div className="flex items-center justify-between bg-gray-700/30 p-4 rounded-lg">
                    <div>
                      <p className="text-gray-400 text-xs mb-1">Status</p>
                      <div className="flex items-center space-x-2">
                        {selectedJob.isActive ? (
                          <span className="flex items-center text-green-400 text-sm font-bold">
                            <FaCheckCircle className="mr-1" /> Active
                          </span>
                        ) : (
                          <span className="flex items-center text-red-400 text-sm font-bold">
                            <FaTimesCircle className="mr-1" /> Inactive
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-400 text-xs mb-1">Applications</p>
                      <p className="text-purple-400 font-bold text-lg flex items-center justify-end">
                        <FaUsers className="mr-2" />
                        {selectedJob.applicationCount || 0}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-700/50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={() => handleDeleteClick(selectedJob._id)}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  <FaTrash className="mr-2" /> Delete Job
                </button>
                <button
                  type="button"
                  onClick={() => toggleJobStatus(selectedJob._id, selectedJob.isActive)}
                  className={`mt-3 w-full inline-flex justify-center rounded-md border shadow-sm px-4 py-2 text-base font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm ${selectedJob.isActive
                    ? 'border-gray-500 text-gray-300 hover:bg-gray-700 hover:text-white'
                    : 'border-transparent bg-green-600 text-white hover:bg-green-700'
                    }`}
                >
                  {selectedJob.isActive ? 'Deactivate' : 'Activate'}
                </button>
                <Link
                  href={`/jobs/${selectedJob._id}`}
                  target="_blank"
                  className="mt-3 w-full inline-flex justify-center items-center rounded-md border border-gray-500 shadow-sm px-4 py-2 bg-transparent text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  <FaExternalLinkAlt className="mr-2" />
                  Public Page
                </Link>
                <button
                  type="button"
                  onClick={() => setSelectedJob(null)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-500 shadow-sm px-4 py-2 bg-transparent text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        isDangerous={confirmModal.isDangerous}
      />
    </DashboardLayout>
  );
}
