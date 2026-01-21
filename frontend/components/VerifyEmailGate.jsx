import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/router';
import { api } from '../utils/api';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { FiMail, FiRefreshCw, FiArrowRight } from 'react-icons/fi';

/**
 * A wrapper component that blocks access to children if the user's email is not verified.
 * Displays a verification prompt instead.
 */
const VerifyEmailGate = ({ children }) => {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [resending, setResending] = useState(false);

  // If loading or not user (and not specifically loading user), don't show anything yet.
  // withAuth should handle the "not user" redirect case, but if this is used standalone, 
  // we might want to handle it (though usually it's inside withAuth).
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  // If user is not logged in, we can render children (if the page is public) 
  // or return null (if we assume this is only for protected routes).
  // Assuming this gate is used within/after withAuth, user should exist.
  // If not, we'll let withAuth handle the redirect.
  if (!user) {
    return null;
  }

  // If verified, render the protected content
  if (user.isVerified) {
    return <>{children}</>;
  }

  const handleResendVerification = async () => {
    setResending(true);
    try {
      await api.post('/auth/resend-verification', { email: user.email });
      toast.success('Verification email sent! Please check your inbox.');
    } catch (error) {
      const msg = error.response?.data?.error || 'Failed to resend verification email.';
      toast.error(msg);
    } finally {
      setResending(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/auth/login');
    } catch (error) {
      console.error('Logout failed', error);
      // Force redirect anyway
      router.push('/auth/login');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 sm:px-6 lg:px-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700"
      >
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-primary-100 dark:bg-primary-900/30">
            <FiMail className="h-8 w-8 text-primary-600 dark:text-primary-400" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
            Verify your email
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            We've sent a verification email to <span className="font-medium text-gray-900 dark:text-gray-200">{user.email}</span>.
          </p>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Please check your inbox and click the link to verify your account before accessing this page.
          </p>
        </div>

        <div className="mt-8 space-y-4">
          <button
            onClick={handleResendVerification}
            disabled={resending}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
          >
            {resending ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Sending...
              </span>
            ) : (
              <span className="flex items-center">
                <FiRefreshCw className="mr-2" /> Resend Verification Email
              </span>
            )}
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">or</span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
          >
            Back to Login / Sign In with different account
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default VerifyEmailGate;
