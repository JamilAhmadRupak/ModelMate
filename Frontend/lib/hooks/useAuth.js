'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentUser, isAuthenticated, logout, login as loginUser } from '@/lib/auth';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Check if token exists and is valid
        if (isAuthenticated()) {
          const userData = await getCurrentUser();
          
          if (userData && !userData.error) {
            setUser(userData);
            setIsLoggedIn(true);
          } else {
            // Token invalid or user fetch failed
            setUser(null);
            setIsLoggedIn(false);
            logout();
          }
        } else {
          setUser(null);
          setIsLoggedIn(false);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        setUser(null);
        setIsLoggedIn(false);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (credentials) => {
    setLoading(true);
    
    try {
      const result = await loginUser(credentials);
      
      if (result.success) {
        const userData = await getCurrentUser();
        
        if (userData && !userData.error) {
          setUser(userData);
          setIsLoggedIn(true);
          return { success: true };
        } else {
          return { success: false, error: 'Failed to get user data' };
        }
      }
      
      return result;
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const logoutUser = () => {
    logout();
    setUser(null);
    setIsLoggedIn(false);
  };

  const updateUser = (userData) => {
    setUser(userData);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      isLoggedIn, 
      login, 
      logout: logoutUser,
      updateUser 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  
  return context;
};
