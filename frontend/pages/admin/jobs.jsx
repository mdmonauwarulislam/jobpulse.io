import { useState, useEffect } from 'react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { 
  FaBriefcase, 
  FaSearch, 
  FaEdit, 
  FaTrash, 
  FaEye,
  FaBuilding,
  FaMapMarkerAlt,
  FaDollarSign,
  FaClock,
  FaUsers,
  FaDownload
} from 'react-icons/fa';
import { api } from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/router';
import AdminLayout from '../../components/admin/AdminLayout';

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

  const handleDeleteJob = async (jobId) => {
    if (!confirm('Are you sure you want to delete this job? This will also delete all applications.')) {
      return;
    }

    setActionLoading(true);
    try {
      await api.delete(`/jobs/${jobId}`);
      toast.success('Job deleted successfully');
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
    <AdminLayout title="Job Management">
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
                      <span className="truncate">{job.company}</span>
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
                    <span>{job.applicationCount || 0} applications</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <button
                    onClick={() => toggleJobStatus(job._id, job.isActive)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                      job.isActive 
                        ? 'bg-green-500/20 text-green-300 hover:bg-green-500/30' 
                        : 'bg-red-500/20 text-red-300 hover:bg-red-500/30'
                    }`}
                  >
                    {job.isActive ? 'Active' : 'Inactive'}
                  </button>
                  <div className="flex space-x-2">
                    <Link
                      href={`/jobs/${job._id}`}
                      className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg transition-colors"
                    >
                      <FaEye />
                    </Link>
                    <button
                      onClick={() => handleDeleteJob(job._id)}
                      className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
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
    </AdminLayout>
  );
}
