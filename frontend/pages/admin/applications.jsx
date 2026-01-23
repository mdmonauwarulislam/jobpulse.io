import { useState, useEffect } from 'react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { FaFileAlt, FaEye, FaTimes, FaDownload } from 'react-icons/fa';
import { api } from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/router';
import Head from 'next/head';
import DashboardLayout from '../../components/DashboardLayout';

export default function AdminApplications() {
  const { userType } = useAuth();
  const router = useRouter();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [selectedApplication, setSelectedApplication] = useState(null);

  useEffect(() => {
    if (userType !== 'admin') {
      router.push('/');
      return;
    }
    fetchApplications();
  }, [page, statusFilter, userType]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page,
        limit: 10,
        ...(statusFilter && { status: statusFilter })
      });
      const response = await api.get(`/admin/applications?${params}`);
      setApplications(response.data.data.applications || []);
      setPagination(response.data.data.pagination || {});
    } catch (error) {
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (applicationId, newStatus) => {
    try {
      await api.patch(`/admin/applications/${applicationId}/status`, { status: newStatus });
      toast.success('Status updated');
      fetchApplications();
      if (selectedApplication && selectedApplication._id === applicationId) {
        setSelectedApplication({ ...selectedApplication, status: newStatus });
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update status');
    }
  };

  return (
    <DashboardLayout>
      <Head>
        <title>Application Management - JobPulse Admin</title>
      </Head>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Application Management</h1>
        <p className="text-gray-400">Monitor and manage job applications</p>
      </div>

      <div className="bg-gray-900 border border-white/10 rounded-xl p-6 mb-8">
        <div className="max-w-xs">
          <label className="block text-sm font-medium text-gray-400 mb-2">Status Filter</label>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="w-full px-4 py-2 bg-black/50 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="reviewed">Reviewed</option>
            <option value="shortlisted">Shortlisted</option>
            <option value="rejected">Rejected</option>
            <option value="hired">Hired</option>
          </select>
        </div>
      </div>

      <div className="bg-gray-900 border border-white/10 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
          </div>
        ) : applications.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            <FaFileAlt className="text-5xl mx-auto mb-4 opacity-50" />
            <p>No applications found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Job</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Applicant</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Employer</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Applied</th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {applications.map((app) => (
                  <tr key={app._id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-white">{app.job?.title}</div>
                      <div className="text-xs text-gray-400">{app.job?.company}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-white">{app.applicant?.name}</div>
                      <div className="text-xs text-gray-400">{app.applicant?.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-white">{app.employer?.companyName}</div>
                      <div className="text-xs text-gray-400">{app.employer?.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={app.status}
                        onChange={e => handleStatusChange(app._id, e.target.value)}
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-black/50 border border-white/20 text-white cursor-pointer hover:bg-black/70`}
                      >
                        <option value="pending">Pending</option>
                        <option value="reviewed">Reviewed</option>
                        <option value="shortlisted">Shortlisted</option>
                        <option value="rejected">Rejected</option>
                        <option value="hired">Hired</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                      {new Date(app.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => setSelectedApplication(app)}
                          className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <FaEye />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {pagination.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-white/10 flex items-center justify-between">
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

      {/* Application Details Modal */}
      {selectedApplication && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" onClick={() => setSelectedApplication(null)}>
              <div className="absolute inset-0 bg-gray-900 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

            <div className="inline-block align-bottom bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full border border-white/10">
              <div className="bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-white">{selectedApplication.job?.title}</h3>
                    <p className="text-gray-400 text-sm">Applicant: {selectedApplication.applicant?.name}</p>
                  </div>
                  <button
                    onClick={() => setSelectedApplication(null)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <FaTimes className="text-xl" />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Status */}
                  <div className="bg-gray-700/30 p-4 rounded-lg flex justify-between items-center">
                    <span className="text-gray-300">Application Status</span>
                    <select
                      value={selectedApplication.status}
                      onChange={e => handleStatusChange(selectedApplication._id, e.target.value)}
                      className="bg-black/50 border border-white/20 text-white text-sm rounded-lg px-3 py-1 focus:ring-orange-500 focus:border-orange-500"
                    >
                      <option value="pending">Pending</option>
                      <option value="reviewed">Reviewed</option>
                      <option value="shortlisted">Shortlisted</option>
                      <option value="rejected">Rejected</option>
                      <option value="hired">Hired</option>
                    </select>
                  </div>

                  {/* Resume / Cover Letter */}
                  <div>
                    <h4 className="text-white font-medium mb-2">Resume / Cover Letter</h4>
                    {selectedApplication.resume ? (
                      <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                        <p className="text-gray-300 text-sm whitespace-pre-wrap font-mono">
                          {selectedApplication.resume}
                        </p>
                      </div>
                    ) : selectedApplication.resumeUrl ? (
                      <div className="bg-white/5 p-4 rounded-lg border border-white/10 flex items-center justify-between">
                        <span className="text-gray-300 text-sm">Resume File Uploaded</span>
                        <a
                          href={selectedApplication.resumeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center space-x-2 text-blue-400 hover:text-blue-300"
                        >
                          <FaDownload /> <span>Download Resume</span>
                        </a>
                      </div>
                    ) : (
                      <p className="text-gray-500 italic">No resume provided.</p>
                    )}
                  </div>

                  {/* Contact Info */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-700/30 p-3 rounded-lg">
                      <p className="text-xs text-gray-400">Email</p>
                      <p className="text-sm text-white">{selectedApplication.applicant?.email}</p>
                    </div>
                    <div className="bg-gray-700/30 p-3 rounded-lg">
                      <p className="text-xs text-gray-400">Phone</p>
                      <p className="text-sm text-white">{selectedApplication.applicant?.phone || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-700/50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={() => setSelectedApplication(null)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-500 shadow-sm px-4 py-2 bg-transparent text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
