import { useState, useEffect } from 'react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { 
  FaBuilding, 
  FaSearch, 
  FaEdit, 
  FaTrash, 
  FaEye,
  FaCheckCircle,
  FaTimesCircle,
  FaGlobe,
  FaBriefcase,
  FaDownload
} from 'react-icons/fa';
import { api } from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/router';
import AdminLayout from '../../components/admin/AdminLayout';

export default function AdminEmployers() {
  const { userType } = useAuth();
  const router = useRouter();
  const [employers, setEmployers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [selectedEmployer, setSelectedEmployer] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (userType !== 'admin') {
      router.push('/');
      return;
    }
    fetchEmployers();
  }, [page, searchTerm, userType]);

  const fetchEmployers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page,
        limit: 10,
        ...(searchTerm && { search: searchTerm })
      });
      
      const response = await api.get(`/admin/employers?${params}`);
      setEmployers(response.data.data.employers || []);
      setPagination(response.data.data.pagination || {});
    } catch (error) {
      toast.error('Failed to load employers');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchEmployers();
  };

  const handleExport = () => {
    if (employers.length === 0) {
      toast.error('No employers to export');
      return;
    }
    
    const headers = ['ID', 'Company', 'Contact Name', 'Email', 'Verified', 'Active', 'Joined'];
    const csvContent = [
      headers.join(','), 
      ...employers.map(e => [
        e._id,
        `"${e.company}"`,
        `"${e.name}"`,
        e.email,
        e.isVerified ? 'Yes' : 'No',
        e.isActive !== false ? 'Yes' : 'No',
        new Date(e.createdAt).toISOString().split('T')[0]
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `employers_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDeleteEmployer = async (employerId) => {
    if (!confirm('Are you sure you want to delete this employer? This will also delete all their job postings.')) {
      return;
    }

    setActionLoading(true);
    try {
      await api.delete(`/admin/employers/${employerId}`);
      toast.success('Employer deleted successfully');
      fetchEmployers();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to delete employer');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateEmployer = async (employerId, updates) => {
    setActionLoading(true);
    try {
      await api.put(`/admin/employers/${employerId}`, updates);
      toast.success('Employer updated successfully');
      setShowModal(false);
      fetchEmployers();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update employer');
    } finally {
      setActionLoading(false);
    }
  };

  const toggleVerification = async (employerId, currentStatus) => {
    await handleUpdateEmployer(employerId, { isVerified: !currentStatus });
  };

  const toggleActive = async (employerId, currentStatus) => {
    await handleUpdateEmployer(employerId, { isActive: !currentStatus });
  };

  return (
    <AdminLayout title="Employer Management">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Employer Management</h1>
          <p className="text-gray-400">Manage all registered employers on the platform</p>
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
        <form onSubmit={handleSearch} className="grid md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-400 mb-2">Search</label>
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by company, name, or email..."
                className="w-full pl-10 pr-4 py-2 bg-black/50 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-orange-500"
              />
            </div>
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

      {/* Employers Table */}
      <div className="bg-gray-900 border border-white/10 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          </div>
        ) : employers.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            No employers found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Company</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Active</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Joined</th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {employers.map((employer) => (
                  <tr key={employer._id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-teal-500 rounded-lg flex items-center justify-center overflow-hidden shrink-0">
                          {employer.companyLogo ? (
                            <img src={employer.companyLogo} alt={employer.company} className="w-full h-full object-cover" />
                          ) : (
                            <FaBuilding className="text-white text-sm" />
                          )}
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-white">{employer.company}</div>
                          {employer.companyWebsite && (
                            <a href={employer.companyWebsite} target="_blank" rel="noopener noreferrer" className="text-xs text-orange-400 hover:text-orange-300 flex items-center">
                              <FaGlobe className="mr-1" /> Website
                            </a>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-white">{employer.name}</div>
                      <div className="text-sm text-gray-400">{employer.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => toggleVerification(employer._id, employer.isVerified)}
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium transition-colors ${
                          employer.isVerified 
                            ? 'bg-green-500/20 text-green-300 hover:bg-green-500/30' 
                            : 'bg-red-500/20 text-red-300 hover:bg-red-500/30'
                        }`}
                      >
                        {employer.isVerified ? <FaCheckCircle className="mr-1" /> : <FaTimesCircle className="mr-1" />}
                        {employer.isVerified ? 'Verified' : 'Unverified'}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => toggleActive(employer._id, employer.isActive)}
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium transition-colors ${
                          employer.isActive !== false
                            ? 'bg-blue-500/20 text-blue-300 hover:bg-blue-500/30' 
                            : 'bg-gray-500/20 text-gray-300 hover:bg-gray-500/30'
                        }`}
                      >
                        {employer.isActive !== false ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                      {new Date(employer.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => { setSelectedEmployer(employer); setShowModal(true); }}
                          className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg transition-colors"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDeleteEmployer(employer._id)}
                          className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-white/10 flex justify-between items-center">
            <span className="text-sm text-gray-400">
              Page {pagination.currentPage} of {pagination.totalPages}
            </span>
            <div className="space-x-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={!pagination.hasPrevPage}
                className="px-3 py-1 bg-white/10 text-white rounded hover:bg-white/20 disabled:opacity-50"
              >
                Prev
              </button>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={!pagination.hasNextPage}
                className="px-3 py-1 bg-white/10 text-white rounded hover:bg-white/20 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Edit Modal (Preserved existing fields) */}
      {showModal && selectedEmployer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-gray-900 rounded-xl border border-white/20 p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-white mb-4">Edit Employer</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Company Name</label>
                <input
                  type="text"
                  value={selectedEmployer.company}
                  onChange={(e) => setSelectedEmployer({ ...selectedEmployer, company: e.target.value })}
                  className="w-full px-4 py-2 bg-black/50 border border-white/20 rounded-lg text-white"
                />
              </div>
               <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Contact Name</label>
                  <input
                    type="text"
                    value={selectedEmployer.name}
                    onChange={(e) => setSelectedEmployer({ ...selectedEmployer, name: e.target.value })}
                    className="w-full px-4 py-2 bg-black/50 border border-white/20 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
                  <input
                    type="email"
                    value={selectedEmployer.email}
                    onChange={(e) => setSelectedEmployer({ ...selectedEmployer, email: e.target.value })}
                    className="w-full px-4 py-2 bg-black/50 border border-white/20 rounded-lg text-white"
                  />
                </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleUpdateEmployer(selectedEmployer._id, {
                  name: selectedEmployer.name,
                  company: selectedEmployer.company,
                  email: selectedEmployer.email,
                  isVerified: selectedEmployer.isVerified,
                  isActive: selectedEmployer.isActive
                })}
                disabled={actionLoading}
                className="px-4 py-2 bg-orange-600 rounded-lg text-white hover:bg-orange-700 transition-colors disabled:opacity-50"
              >
                {actionLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
