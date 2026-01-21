import { useState, useEffect } from 'react';
import Head from 'next/head';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { FaBookmark, FaSpinner, FaTrash } from 'react-icons/fa';
import DashboardLayout from '../../components/DashboardLayout';
import JobCard from '../../components/JobCard';
import { api } from '../../utils/api';
import { withAuth } from '../../utils/withAuth';
import { useRouter } from 'next/router';

function SavedJobs() {
    const [savedJobs, setSavedJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        fetchSavedJobs();
    }, []);

    const fetchSavedJobs = async () => {
        try {
            const { data } = await api.get('/users/saved-jobs');
            if (data.success) {
                setSavedJobs(data.data.savedJobs);
            }
        } catch (error) {
            console.error('Failed to fetch saved jobs:', error);
            toast.error('Failed to load saved jobs');
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveSavedJob = async (jobId, e) => {
        e.stopPropagation(); // Prevent navigation if clicking remove
        e.preventDefault();

        try {
            await api.delete(`/users/saved-jobs/${jobId}`);
            toast.success('Job removed from saved list');
            // Refresh list
            setSavedJobs(prev => prev.filter(item => item.job._id !== jobId));
        } catch (error) {
            console.error('Failed to remove saved job:', error);
            toast.error('Failed to remove job');
        }
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="min-h-[60vh] flex items-center justify-center">
                    <FaSpinner className="animate-spin text-4xl text-primary-500" />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <Head>
                <title>Saved Jobs - JobPulse</title>
            </Head>

            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    Saved Jobs
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                    Manage the jobs you have bookmarked for later.
                </p>
            </div>

            {savedJobs.length === 0 ? (
                <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
                    <FaBookmark className="mx-auto text-5xl text-gray-300 dark:text-gray-600 mb-4" />
                    <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">No saved jobs yet</h3>
                    <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-6">
                        Jobs you save will appear here. Browse jobs and click the bookmark icon to save them.
                    </p>
                    <button
                        onClick={() => router.push('/jobs')}
                        className="btn-primary"
                    >
                        Browse Jobs
                    </button>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {savedJobs.map((item, index) => (
                        <div key={item._id || index} className="relative group">
                            <JobCard
                                job={item.job}
                                onApply={() => router.push(`/jobs/${item.job._id}`)}
                            />
                            <button
                                onClick={(e) => handleRemoveSavedJob(item.job._id, e)}
                                className="absolute top-4 right-4 z-10 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600 focus:outline-none"
                                title="Remove from saved"
                            >
                                <FaTrash size={14} />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </DashboardLayout>
    );
}

export default withAuth(SavedJobs, {
    requiredUserType: 'user',
    redirectTo: '/auth/login'
});
