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

  // Add useEffect to redirect if profile is incomplete
  useEffect(() => {
    if (!loading && user && !user.isProfileComplete) {
      if (userType === 'employer') {
        if (router.pathname !== '/employer/complete-profile') {
          router.replace('/employer/complete-profile');
        }
      } else if (userType === 'user') {
        if (router.pathname !== '/user/complete-profile') {
          router.replace('/user/complete-profile');
        }
      }
    }
  }, [loading, user, userType, router]);

  const fetchUser = async (savedUserType) => {
    try {
      const response = await api.get('/auth/me');
      // Support both user and employer objects from backend
      const userObj = response.data.data.user || response.data.data.employer;
      setUser({ ...userObj, profileCompletion: response.data.data.profileCompletion });
      // Prefer userType from cookie, else infer from user data
      if (savedUserType) {
        setUserType(savedUserType);
      } else if (response.data.data.userType) {
        setUserType(response.data.data.userType);
      } else if (response.data.data.user?.role === 'admin') {
        setUserType('admin');
      } else if (response.data.data.employer) {
        setUserType('employer');
      } else {
        setUserType('user');
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password, type = 'user') => {
    try {
      const endpoint = type === 'employer' ? '/auth/login-employer' : 
                      type === 'admin' ? '/auth/login-admin' : '/auth/login-user';
      const response = await api.post(endpoint, { email, password });
      const { token, user: userData, employer } = response.data.data;
      // Set token and userType in cookies, localStorage, and headers
      Cookies.set('token', token, { expires: 30 });
      Cookies.set('userType', type, { expires: 30 });
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('userType', type);
        window.localStorage.setItem('token', token);
      }
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUserType(type);
      // Set user state directly from login response for immediate access
      if (type === 'employer' && employer) {
        setUser({ ...employer });
      } else if (userData) {
        setUser({ ...userData });
      }
      // Always fetch fresh user data from backend after login
      await fetchUser(type);
      toast.success('Login successful!');
      // Redirect based on user type
      if (type === 'admin') {
        router.push('/admin/dashboard');
      } else if (type === 'employer') {
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
      const { token, user: userInfo, employer } = response.data.data;
      
      // Set token and userType in cookies and headers
      Cookies.set('token', token, { expires: 30 });
      Cookies.set('userType', type, { expires: 30 });
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Set user data
      const user = userInfo || employer;
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

  const logout = () => {
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
    return userType === 'user' && user?.role === 'admin';
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