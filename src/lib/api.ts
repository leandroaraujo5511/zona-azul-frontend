import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';

// Get API URL from environment or use default
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

// Create axios instance
export const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token to requests
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('zonaazul_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ error?: { code?: string; message?: string } }>) => {
    if (error.response) {
      // Token expired or invalid
      if (error.response.status === 401) {
        // Don't clear tokens if we're on the login page (might be a login attempt)
        const isLoginPage = window.location.pathname === '/login';
        const isLoginRequest = error.config?.url?.includes('/auth/login');
        
        // Don't redirect if we're on a public notification page
        const isPublicNotificationPage = window.location.pathname.startsWith('/notificacao');
        
        if (!isLoginPage && !isLoginRequest && !isPublicNotificationPage) {
          // Clear tokens and redirect to login
          localStorage.removeItem('zonaazul_token');
          localStorage.removeItem('zonaazul_refresh_token');
          localStorage.removeItem('zonaazul_user');
          
          // Use setTimeout to avoid blocking and allow error to propagate
          setTimeout(() => {
            // Double check we're still not on login page
            if (window.location.pathname !== '/login') {
              window.location.href = '/login';
            }
          }, 100);
        }
      }

      // Extract error message from response
      const errorMessage = error.response.data?.error?.message || error.message || 'An error occurred';
      
      // Reject with formatted error
      return Promise.reject({
        message: errorMessage,
        code: error.response.data?.error?.code,
        status: error.response.status,
      });
    }

    // Network error
    return Promise.reject({
      message: 'Network error. Please check your connection.',
      code: 'NETWORK_ERROR',
      status: 0,
    });
  }
);

// Types for API responses
export interface ApiError {
  message: string;
  code?: string;
  status?: number;
}

export default api;

