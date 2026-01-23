import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Cookies from 'js-cookie';
import { api } from '../utils/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userType, setUserType] = useState(null);
  const router = useRouter();

  // Check if user is logged in on mount
  useEffect(() => {
    // Read token and userType from cookies, fallback to localStorage
    let token = Cookies.get('token');
    let savedUserType = Cookies.get('userType');
    if (!token && typeof window !== 'undefined') {
      token = window.localStorage.getItem('token');
      if (token) Cookies.set('token', token, { expires: 30 });
    }
    if (!savedUserType && typeof window !== 'undefined') {
      savedUserType = window.localStorage.getItem('userType');
      if (savedUserType) Cookies.set('userType', savedUserType, { expires: 30 });
    }
    // Always set token in axios headers if present
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    if (savedUserType) setUserType(savedUserType);
    if (token) {
      fetchUser(savedUserType);
    } else {
      setLoading(false);
    }
  }, []);

  // DISABLED: Redirect logic moved to individual pages and withAuth HOC
  // This prevents redirect loops by having each route handle its own redirects
  // The AuthContext only manages user state, not redirects
  // Pages using withAuth HOC handle redirects for protected routes
  // Complete-profile pages handle their own redirects

  const fetchUser = async (savedUserType) => {
    try {
      const response = await api.get('/auth/me');
      // Support both user and employer objects from backend
      // Support both user (legacy), candidate, and employer objects
      let userObj = response.data.data.user || response.data.data.candidate || response.data.data.employer || response.data.data.admin;
      const profileObj = response.data.data.profile || {};

      // Ensure admins are always verified
      if (userObj && (response.data.data.admin || userObj.role === 'admin' || response.data.data.userType === 'admin')) {
        if (userObj.isVerified === undefined) userObj.isVerified = true;
        // If it's explicitly false in DB but they are admin, we might want to override or trust DB.
        // Assuming internal admins should be verified:
        userObj.isVerified = true;
      }

      setUser({ ...userObj, ...profileObj, profileCompletion: response.data.data.profileCompletion });
      // Prefer userType from cookie, else infer from user data
      if (savedUserType) {
        setUserType(savedUserType);
      } else if (response.data.data.userType) {
        setUserType(response.data.data.userType);
      } else if (response.data.data.admin) {
        setUserType('admin');
      } else if (response.data.data.user?.role === 'admin') {
        setUserType('admin');
      } else if (response.data.data.employer) {
        setUserType('employer');
      } else {
        setUserType('user');
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      // Only logout on 401 (unauthorized), not on 403 (forbidden/not verified)
      // 403 means user is authenticated but not verified, which is handled by redirect logic
      if (error.response?.status === 401) {
        logout();
      } else {
        // For other errors (like 403), still set loading to false so UI can render
        setLoading(false);
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      // Unified login endpoint
      const response = await api.post('/auth/login', { email, password });

      // The backend returns { data: { [role]: userObj, token } }
      // We need to find the user object key (candidate, employer, admin, or user)
      const data = response.data.data;
      const token = data.token;

      // Determine user object and role
      let userObj = null;
      let role = null;

      if (data.candidate) {
        userObj = data.candidate;
        role = 'user'; // Frontend uses 'user' for candidate
      } else if (data.employer) {
        userObj = data.employer;
        role = 'employer';
      } else if (data.admin) { // Check for explicit admin key in response
        userObj = data.admin;
        role = 'admin';
        // Ensure admins are considered verified if the field is missing/false, as they are internal users
        if (userObj.isVerified === undefined) userObj.isVerified = true;
      } else if (data.user && data.user.role === 'admin') {
        userObj = data.user;
        role = 'admin';
        if (userObj.isVerified === undefined) userObj.isVerified = true;
      } else if (data.user) {
        // Fallback for generic user key
        userObj = data.user;
        role = userObj.role === 'candidate' ? 'user' : userObj.role;
      }

      if (!userObj || !role) {
        throw new Error('Invalid response from server');
      }

      // Set token and userType in cookies, localStorage, and headers
      Cookies.set('token', token, { expires: 30 });
      Cookies.set('userType', role, { expires: 30 });
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('userType', role);
        window.localStorage.setItem('token', token);
      }
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUserType(role);
      setUser(userObj);

      // Always fetch fresh user data from backend after login to ensure full profile sync
      await fetchUser(role);

      toast.success('Login successful!');

      // Redirect based on detected role
      if (role === 'admin') {
        router.push('/admin/dashboard');
      } else if (role === 'employer') {
        router.push('/employer/dashboard');
      } else {
        router.push('/user/dashboard');
      }
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      const message = error.response?.data?.error || 'Login failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const register = async (userData, type = 'user') => {
    try {
      const endpoint = type === 'employer' ? '/auth/register-employer' : '/auth/register-user';
      const response = await api.post(endpoint, userData);
      const { token, user: userInfo, candidate, employer } = response.data.data;

      // Set token and userType in cookies and headers
      Cookies.set('token', token, { expires: 30 });
      Cookies.set('userType', type, { expires: 30 });
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      // Set user data
      const user = userInfo || candidate || employer;
      setUser(user);
      setUserType(type);

      toast.success('Registration successful! Please check your email to verify your account.');

      // Redirect based on user type
      if (type === 'employer') {
        router.push('/employer/dashboard');
      } else {
        router.push('/user/dashboard');
      }

      return { success: true };
    } catch (error) {
      console.error('Registration error:', error);
      const message = error.response?.data?.error || 'Registration failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const logout = async () => {
    try {
      // Call backend to clear httpOnly cookie
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
      // Continue with client cleanup even if backend fails
    }

    // Remove token and userType from cookies, localStorage, and headers
    Cookies.remove('token');
    Cookies.remove('userType');
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('userType');
      window.localStorage.removeItem('token');
    }
    delete api.defaults.headers.common['Authorization'];

    // Clear user state
    setUser(null);
    setUserType(null);

    // Redirect to home
    router.push('/');

    toast.success('Logged out successfully');
  };

  const updateUser = (userData) => {
    setUser(prev => ({ ...prev, ...userData, profileCompletion: userData.profileCompletion ?? prev.profileCompletion }));
  };

  const isAuthenticated = () => {
    return !!user;
  };

  const isEmployer = () => {
    return userType === 'employer';
  };

  const isAdmin = () => {
    return userType === 'admin' || (user?.role === 'admin');
  };

  const isJobSeeker = () => {
    return userType === 'user' && user?.role !== 'admin';
  };

  const value = {
    user,
    userType,
    loading,
    login,
    register,
    logout,
    updateUser,
    isAuthenticated,
    isEmployer,
    isAdmin,
    isJobSeeker,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 