import axios from 'axios';

// Create an Axios instance with the base URL from .env
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT Token before sending any request
api.interceptors.request.use(
  (config) => {
    // Priority 1: Check if there's a dynamically set token in localStorage
    let token = localStorage.getItem('erp_token');
    
    // Priority 2: Fallback to the token from .env (useful for testing before login works)
    if (!token) {
      token = import.meta.env.VITE_API_TOKEN;
    }
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
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
    // If the token is expired or invalid (401 error)
    if (error.response && error.response.status === 401) {
      console.warn("Unauthorized! Token might have expired. Logging out...");
      localStorage.removeItem('erp_token');
      // You can also force a redirect to the login page here if needed:
      // window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

export default api;
