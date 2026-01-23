import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import Head from 'next/head';

export default function DashboardRedirect() {
    const { user, userType, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading) {
            if (!user) {
                router.push('/auth/login');
                return;
            }

            switch (userType) {
                case 'admin':
                    router.push('/admin/dashboard');
                    break;
                case 'employer':
                    router.push('/employer/dashboard');
                    break;
                default:
                    router.push('/user/dashboard'); // Default for 'jobseeker' or others
            }
        }
    }, [user, userType, loading, router]);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center">
            <Head>
                <title>Loading Dashboard... | JobPulse</title>
            </Head>
            <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400">Restoring your session...</p>
            </div>
        </div>
    );
}
