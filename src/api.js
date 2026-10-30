import axios from 'axios';

// Create an Axios instance with the base URL from .env, fallback to localhost
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT Token & Active Company ID before sending any request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('erp_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Dynamic Multi-Company Isolation Pass
    const activeCompanyId = localStorage.getItem('active_company_id');
    if (activeCompanyId) {
      config.headers['x-company-id'] = activeCompanyId;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle global errors like 401 Unauthorized
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // If the token is expired or invalid (401 error) on authenticated requests
    if (error.response && error.response.status === 401) {
      const isLoginRequest = error.config?.url?.includes('/auth/login');
      if (!isLoginRequest) {
        console.warn("Unauthorized! Token might have expired. Logging out...");
        const hadAuth = localStorage.getItem('erp_token') || localStorage.getItem('isLoggedIn');
        localStorage.removeItem('erp_token');
        localStorage.removeItem('isLoggedIn');
        if (hadAuth) {
          window.dispatchEvent(new Event('authChanged'));
        }
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
