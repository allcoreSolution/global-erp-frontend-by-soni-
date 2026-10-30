import axios from 'axios';

// Resolve API Base URL: automatically use live Render backend on production hosts, or env/localhost in local dev
const getBaseURL = () => {
  const envUrl = import.meta.env.VITE_API_BASE_URL;

  // Check if running on a production host (e.g. Render, Vercel, etc.)
  const isProductionHost =
    typeof window !== 'undefined' &&
    window.location.hostname &&
    window.location.hostname !== 'localhost' &&
    window.location.hostname !== '127.0.0.1';

  if (isProductionHost) {
    if (!envUrl || envUrl.includes('localhost') || envUrl.includes('127.0.0.1')) {
      return 'https://global-erp-backend-by-soni-8bxl.onrender.com/api';
    }
    return envUrl;
  }

  // Local development: use env or fallback to localhost:5000/api
  return envUrl || 'http://localhost:5000/api';
};

const api = axios.create({
  baseURL: getBaseURL(),
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
