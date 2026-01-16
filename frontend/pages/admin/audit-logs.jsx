import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { 
  FaClipboardList, 
  FaFilter, 
  FaUserShield, 
  FaClock
} from 'react-icons/fa';
import { api } from '../../utils/api';
import AdminLayout from '../../components/admin/AdminLayout';

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [actionFilter, setActionFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  useEffect(() => {
    fetchLogs();
  }, [page, actionFilter, typeFilter]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page,
        limit: 20, // Higher limit for logs
        ...(actionFilter && { action: actionFilter }),
        ...(typeFilter && { targetType: typeFilter })
      });
      
      const response = await api.get(`/admin/audit-logs?${params}`);
      setLogs(response.data.data.logs || []);
      setPagination(response.data.data.pagination || {});
    } catch (error) {
      toast.error('Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  const formatAction = (action) => {
    return action.replace(/([A-Z])/g, ' $1').trim().toUpperCase();
  };

  return (
    <AdminLayout title="Audit Logs">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Audit Logs</h1>
        <p className="text-gray-400">Track all administrative actions and system events.</p>
      </div>

      {/* Filters */}
      <div className="card p-6 mb-8 bg-gray-900 border border-white/10">
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Action Type</label>
            <input
              type="text"
              placeholder="e.g. DELETE_USER"
              value={actionFilter}
              onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
              className="w-full px-4 py-2 bg-black/50 border border-white/20 rounded-lg text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Target Type</label>
            <select
              value={typeFilter}
              onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
              className="w-full px-4 py-2 bg-black/50 border border-white/20 rounded-lg text-white"
            >
              <option value="">All Entities</option>
              <option value="User">User</option>
              <option value="Employer">Employer</option>
              <option value="Job">Job</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => { setActionFilter(''); setTypeFilter(''); setPage(1); }}
              className="px-6 py-2 bg-white/5 text-gray-400 hover:text-white rounded-lg transition-colors border border-white/10"
            >
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          </div>
        ) : logs.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            <FaClipboardList className="text-4xl mx-auto mb-4 opacity-50" />
            <p>No audit logs found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Action</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Admin</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Target</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Details</th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {logs.map((log) => (
                  <tr key={log._id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs font-bold">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <FaUserShield className="text-gray-500" />
                        <span className="text-sm text-gray-300">
                          {log.performedBy?.name || 'Unknown'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-white">
                        {log.targetType}
                      </div>
                      <div className="text-xs text-gray-500 font-mono">
                        {log.targetId}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <pre className="text-xs text-gray-400 bg-black/30 p-2 rounded max-w-xs overflow-x-auto scrollbar-thin">
                        {JSON.stringify(log.details, null, 2)}
                      </pre>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2 text-gray-400 text-sm">
                        <FaClock className="text-xs" />
                        <span>{new Date(log.timestamp).toLocaleString()}</span>
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
    </AdminLayout>
  );
}
