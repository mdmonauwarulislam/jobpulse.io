import axios from 'axios';
import Cookies from 'js-cookie';

// Create axios instance
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = Cookies.get('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle authentication errors - but NOT for login/register endpoints
    const isAuthEndpoint = error.config?.url?.includes('/auth/login') || 
                           error.config?.url?.includes('/auth/register') ||
                           error.config?.url?.includes('/auth/forgot-password') ||
                           error.config?.url?.includes('/auth/reset-password') ||
                           error.config?.url?.includes('/auth/verify') ||
                           error.config?.url?.includes('/auth/me');
    
    // Handle 401 (Unauthorized) - user is not authenticated
    if (error.response?.status === 401 && !isAuthEndpoint) {
      // Clear token and redirect to login only for protected routes
      Cookies.remove('token');
      Cookies.remove('userType');
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem('token');
        window.localStorage.removeItem('userType');
        // Only redirect if not already on login/register pages
        if (!window.location.pathname.includes('/auth/')) {
          window.location.href = '/auth/login';
        }
      }
    }
    
    // Handle 403 (Forbidden) - user is authenticated but not verified or lacks permissions
    // Don't redirect automatically for 403, let the component handle it
    // This prevents infinite redirect loops when user is not verified
    
    // Handle other errors
    if (error.response?.data?.error) {
      console.error('API Error:', error.response.data.error);
    }
    
    return Promise.reject(error);
  }
);

// API helper functions
export const apiHelpers = {
  // GET request
  get: async (url, config = {}) => {
    try {
      const response = await api.get(url, config);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // POST request
  post: async (url, data = {}, config = {}) => {
    try {
      const response = await api.post(url, data, config);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // PUT request
  put: async (url, data = {}, config = {}) => {
    try {
      const response = await api.put(url, data, config);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // DELETE request
  delete: async (url, config = {}) => {
    try {
      const response = await api.delete(url, config);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // File upload
  upload: async (url, formData, config = {}) => {
    try {
      const response = await api.post(url, formData, {
        ...config,
        headers: {
          'Content-Type': 'multipart/form-data',
          ...config.headers,
        },
      });
      return response;
    } catch (error) {
      throw error;
    }
  },
};

export { api };
export default api; 