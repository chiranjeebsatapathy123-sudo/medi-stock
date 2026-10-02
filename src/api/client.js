import axios from 'axios';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
client.interceptors.request.use(
  (config) => {
    // Add auth token if available (using localStorage strictly for the token, not for user state truth)
    const token = localStorage.getItem('medistock_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add correlation ID if useful for tracing
    config.headers['X-Request-ID'] = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(7);

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
client.interceptors.response.use(
  (response) => response,
  (error) => {
    // Global error handling
    if (error.response) {
      const { status } = error.response;
      if (status === 401) {
        // Unauthorized - trigger logout or token refresh logic
        localStorage.removeItem('medistock_token');
        // If we implement refresh tokens, we do it here instead of just redirecting
        window.dispatchEvent(new CustomEvent('auth:unauthorized'));
      } else if (status === 403) {
        // Forbidden
        console.error('Permission denied');
      }
    }
    
    return Promise.reject(error);
  }
);

export default client;
