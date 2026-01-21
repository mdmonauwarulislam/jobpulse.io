import { useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';

/**
 * Higher Order Component to protect routes based on authentication and user role
 * @param {Component} Component - The component to protect
 * @param {Object} options - Protection options
 * @param {string|Array} options.requiredUserType - 'employer', 'admin', 'user', or array of allowed types
 * @param {string} options.redirectTo - Where to redirect if not authorized (default: '/auth/login')
 */
export function withAuth(Component, options = {}) {
  const {
    requiredUserType = null,
    redirectTo = '/auth/login',
  } = options;

  return function AuthenticatedComponent(props) {
    const { user, loading, userType, isAuthenticated, isAdmin, isEmployer, isJobSeeker } = useAuth();
    const router = useRouter();
    const hasRedirectedRef = useRef(false);

    useEffect(() => {
      // Wait for auth to finish loading
      if (loading) return;

      const currentPath = router.pathname;
      const isOnLoginPage = currentPath.startsWith('/auth/login') || currentPath.startsWith('/auth/register');

      // 1. Check if user is authenticated
      if (!isAuthenticated() || !user) {
        if (!isOnLoginPage && !hasRedirectedRef.current) {
          hasRedirectedRef.current = true;
          // Use replace to prevent back-button loops
          router.replace(redirectTo);
        }
        return;
      }

      // 2. Check user type authorization if required
      if (requiredUserType) {
        const allowedTypes = Array.isArray(requiredUserType) ? requiredUserType : [requiredUserType];
        let hasAccess = false;

        if (allowedTypes.includes('admin') && userType === 'admin' && isAdmin()) {
          hasAccess = true;
        } else if (allowedTypes.includes('employer') && userType === 'employer' && isEmployer()) {
          hasAccess = true;
        } else if (allowedTypes.includes('user') && userType === 'user' && isJobSeeker()) {
          hasAccess = true;
        }

        if (!hasAccess && !hasRedirectedRef.current) {
          hasRedirectedRef.current = true;
          // Redirect to home if authorized but wrong role
          router.replace('/');
          // Optionally could redirect to a 403 page
        }
      }
    }, [loading, user, userType, router.pathname, isAuthenticated, isAdmin, isEmployer, isJobSeeker, requiredUserType, redirectTo]);

    // Show loading state while checking auth
    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        </div>
      );
    }

    // Don't render anything if not authenticated (will redirect)
    if (!isAuthenticated() || !user) {
      return null; 
    }

    // Check authorization for rendering (prevent flash of content)
    if (requiredUserType) {
      const allowedTypes = Array.isArray(requiredUserType) ? requiredUserType : [requiredUserType];
      let hasAccess = false;
      if (allowedTypes.includes('admin') && userType === 'admin' && isAdmin()) hasAccess = true;
      else if (allowedTypes.includes('employer') && userType === 'employer' && isEmployer()) hasAccess = true;
      else if (allowedTypes.includes('user') && userType === 'user' && isJobSeeker()) hasAccess = true;

      if (!hasAccess) {
        return null; // Will redirect
      }
    }

    return <Component {...props} />;
  };
}


