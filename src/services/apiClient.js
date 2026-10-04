import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

const apiClient = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    }
});

apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('jwt_token') || localStorage.getItem('medistock_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add Tenant ID based on selected workspace
    const branchInfoStr = localStorage.getItem('medistock_branch');
    if (branchInfoStr) {
      try {
        const branchInfo = JSON.parse(branchInfoStr);
        const tenantMap = {
           'br-1': 'tenant_main',
           'br-2': 'tenant_icu',
           'br-3': 'tenant_er'
        };
        config.headers['X-Tenant-ID'] = tenantMap[branchInfo.id] || 'tenant_main';
      } catch (e) {
        config.headers['X-Tenant-ID'] = 'tenant_main';
      }
    } else {
      config.headers['X-Tenant-ID'] = 'tenant_main';
    }
    
    return config;
}, (error) => Promise.reject(error));

apiClient.interceptors.response.use(
    response => response,
    error => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('jwt_token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default apiClient;
