import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token storage utilities
export const getAuthTokens = () => {
  if (typeof window === 'undefined') return { access: null, refresh: null };
  
  try {
    const tokens = localStorage.getItem('authTokens');
    return tokens ? JSON.parse(tokens) : { access: null, refresh: null };
  } catch (error) {
    console.error('Error parsing tokens:', error);
    return { access: null, refresh: null };
  }
};

export const setAuthTokens = (tokens) => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem('authTokens', JSON.stringify(tokens));
  } catch (error) {
    console.error('Error storing tokens:', error);
  }
};

export const clearAuthTokens = () => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem('authTokens');
  } catch (error) {
    console.error('Error clearing tokens:', error);
  }
};

// Token refresh mechanism
let isRefreshing = false;
let failedRequestsQueue = [];

const processQueue = (error, token = null) => {
  failedRequestsQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  
  failedRequestsQueue = [];
};

const refreshTokens = async () => {
  const tokens = getAuthTokens();
  
  if (!tokens.refresh) {
    throw new Error('No refresh token available');
  }

  try {
    const response = await axios.post(`${API_BASE_URL}/token/refresh/`, {
      refresh: tokens.refresh,
    });

    const newTokens = {
      access: response.data.access,
      refresh: response.data.refresh || tokens.refresh, // Use new refresh token if provided
    };

    setAuthTokens(newTokens);
    return newTokens;
  } catch (error) {
    clearAuthTokens();
    throw error;
  }
};

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const tokens = getAuthTokens();
    
    if (tokens.access) {
      config.headers.Authorization = `Bearer ${tokens.access}`;
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedRequestsQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const newTokens = await refreshTokens();
        processQueue(null, newTokens.access);
        originalRequest.headers.Authorization = `Bearer ${newTokens.access}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        clearAuthTokens();
        if (typeof window !== 'undefined') {
          window.location.href = '/auth/login';
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
