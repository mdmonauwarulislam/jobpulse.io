import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
  FaBriefcase,
  FaBuilding,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaRocket,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaEye,
  FaComment
} from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../utils/api';
import { withAuth } from '../../utils/withAuth';
import VerifyEmailGate from '../../components/VerifyEmailGate';
import DashboardLayout from '../../components/DashboardLayout';

function UserApplications() {
  const { user, userType } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && userType === 'user') {
      const fetchApplications = async () => {
        try {
          const res = await api.get('/applications/user');
          setApplications(res.data.data.applications || []);
        } catch (error) {
          toast.error('Failed to load applications');
        } finally {
          setLoading(false);
        }
      };

      fetchApplications();
    }
  }, [user, userType]);

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

  if (loading) {
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
          <title>My Applications - JobPulse</title>
        </Head>

        <div>
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              My Applications
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Track the status of your job applications
            </p>
          </div>

          <div className="card">
            <div className="card-body p-6">
              {applications.length === 0 ? (
                <div className="text-center py-12">
                  <FaBriefcase className="text-6xl text-gray-300 dark:text-gray-600 mx-auto mb-6" />
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Applications Yet</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Start your job search and apply to positions that match your skills
                  </p>
                  <Link href="/jobs" className="btn-primary">
                    <FaRocket className="mr-2" />
                    Browse Jobs
                  </Link>
                </div>
              ) : (
                <div className="space-y-6">
                  {applications.map((application) => (
                    <div key={application._id} className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:shadow-lg transition-shadow duration-300">
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="text-xl font-semibold text-gray-900 dark:text-white">
                              {application.job.title}
                            </h4>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium p-2 border border-primary-500 ${getStatusColor(application.status)}`}>
                              {application.status}
                            </span>
                          </div>

                          <div className="grid md:grid-cols-2 gap-4 mb-4">
                            <div className="space-y-2">
                              <div className="flex items-center text-gray-600 dark:text-gray-400">
                                <FaBuilding className="mr-2 text-primary-500" />
                                {application.job.employer?.company || application.job.company || 'Company'}
                              </div>
                              <div className="flex items-center text-gray-600 dark:text-gray-400">
                                <FaMapMarkerAlt className="mr-2 text-primary-500" />
                                {application.job.location}
                              </div>
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-center text-gray-600 dark:text-gray-400">
                                <FaCalendarAlt className="mr-2 text-primary-500" />
                                Applied on {new Date(application.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                          </div>

                          {application.coverLetter && (
                            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-4 rounded-lg">
                              <h5 className="font-medium text-gray-900 dark:text-white mb-2">Cover Letter</h5>
                              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                                {application.coverLetter}
                              </p>
                            </div>
                          )}
                          {application.employerNotes && (
                            <div className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-100 dark:border-yellow-800 p-4 rounded-lg mt-4">
                              <h5 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2 flex items-center gap-2">
                                <FaComment className="text-yellow-500" />
                                Employer Note
                              </h5>
                              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                                {application.employerNotes}
                              </p>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center space-x-3 self-start">
                          {getStatusIcon(application.status)}
                          <Link href={`/jobs/${application.job._id}`} className="btn-outline btn-sm">
                            <FaEye className="mr-1" />
                            View Job
                          </Link>
                        </div>
                      </div>
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

export default withAuth(UserApplications, {
  requiredUserType: 'user',
  redirectTo: '/auth/login'
});
