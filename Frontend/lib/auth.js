import { jwtDecode } from 'jwt-decode';
import api, { setAuthTokens, clearAuthTokens, getAuthTokens } from './api';

export const login = async (userData) => {
  try {
    const response = await api.post('/token/', userData);
    
    const tokens = {
      access: response.data.access,
      refresh: response.data.refresh,
    };

    console.log('Login successful:', tokens);
    setAuthTokens(tokens);
    
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.detail || error.response?.data?.non_field_errors?.[0] || 'Login failed'
    };
  }
};

export const register = async (userData) => {
  try {
    const response = await api.post('/auth/register/', userData);
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data || 'Registration failed'
    };
  }
};

export const logout = () => {
  clearAuthTokens();
  if (typeof window !== 'undefined') {
    window.location.href = '/auth/login';
  }
};

export const getCurrentUser = async () => {
  try {
    const response = await api.get('/users/me/');
    console.log('Current user data:', response.data);
    return response.data;
  } catch (error) {
    console.error('Failed to get current user:', error);
    
    // If 401, token is invalid
    if (error.response?.status === 401) {
      clearAuthTokens();
    }
    
    return null;
  }
};

export const isAuthenticated = () => {
  const tokens = getAuthTokens();
  
  if (!tokens.access) return false;

  try {
    const { exp } = jwtDecode(tokens.access);
    const isValid = Date.now() < exp * 1000;
    
    if (!isValid) {
      clearAuthTokens();
    }
    
    return isValid;
  } catch {
    clearAuthTokens();
    return false;
  }
};

export const getUserFromToken = () => {
  const tokens = getAuthTokens();
  
  if (!tokens.access) return null;

  try {
    return jwtDecode(tokens.access);
  } catch {
    return null;
  }
};

export const refreshToken = async () => {
  try {
    const tokens = getAuthTokens();
    
    if (!tokens.refresh) {
      throw new Error('No refresh token available');
    }

    const response = await api.post('/token/refresh/', {
      refresh: tokens.refresh,
    });

    const newTokens = {
      access: response.data.access,
      refresh: response.data.refresh || tokens.refresh,
    };

    setAuthTokens(newTokens);
    return newTokens;
  } catch (error) {
    clearAuthTokens();
    throw error;
  }
};
