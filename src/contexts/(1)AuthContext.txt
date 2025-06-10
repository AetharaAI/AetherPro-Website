// src/contexts/AuthContext.tsx - Authentication Context

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode, useRef } from 'react';
import { API_BASE_URL } from '../config'; 

// Define User type for clarity, matching your FastAPI Pydantic model
interface User {
  id: string;
  email: string;
  name: string;
  plan: string; 
  picture?: string;
  // Add other fields from your User Pydantic model as needed
}

interface AuthContextType {
  user: User | null;
  token: string | null; // JWT token from backend
  isAuthenticated: boolean;
  loading: boolean; // Loading state for initial auth check AND ongoing auth operations
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  authCallback: (jwtToken: string) => Promise<void>; // Function for OAuth callback
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Use state for user and token
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  // Derived state, no need to store separately if user and token are the source
  const isAuthenticated = !!user && !!token; 
  const [loading, setLoading] = useState(true); // Initial loading state for auth check

  // Use a ref to ensure initialCheckDone doesn't cause re-renders
  const initialCheckDone = useRef(false);

  // Function to save token and user info consistently
  const saveAuthData = useCallback((jwtToken: string, userData: User) => {
    localStorage.setItem('jwt_token', jwtToken);
    localStorage.setItem('user', JSON.stringify(userData));
    setToken(jwtToken);
    setUser(userData);
  }, []);

  // Function to clear auth data
  const clearAuthData = useCallback(() => {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  }, []);

  // Initial authentication check on component mount
  useEffect(() => {
    // Prevent running twice in StrictMode or on hot reloads
    if (initialCheckDone.current) {
        setLoading(false);
        return; 
    }

    const checkAuthState = async () => {
      setLoading(true); // Ensure loading is true at the start of check
      try {
        const storedToken = localStorage.getItem('jwt_token');
        const storedUser = localStorage.getItem('user');

        if (storedToken && storedUser) {
          try {
            const parsedUser: User = JSON.parse(storedUser);
            // Validate token with backend to ensure it's still valid
            const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
              method: 'GET',
              headers: { 
                'Authorization': `Bearer ${storedToken}`,
                'Content-Type': 'application/json' 
              }
            });

            if (response.ok) {
              const userData = await response.json();
              saveAuthData(storedToken, userData); // Re-save to refresh data/token expiry
            } else {
              console.warn('Stored token invalid or expired. Logging out.');
              clearAuthData();
            }
          } catch (e) {
            console.error("Failed to parse stored user data or verify token:", e);
            clearAuthData(); // Clear corrupted data
          }
        }
      } catch (error) {
        console.error('Initial auth check failed:', error);
        clearAuthData();
      } finally {
        setLoading(false); // Authentication check is complete
        initialCheckDone.current = true; // Mark initial check as done
      }
    };

    checkAuthState();
  }, [saveAuthData, clearAuthData]); 

  const login = async (email: string, password: string) => {
    setLoading(true); // Set loading for login operation
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || 'Login failed');
      }
      saveAuthData(data.token, data.user);
    } finally {
      setLoading(false); // Reset loading after login operation
    }
  };

  const signup = async (email: string, password: string, name: string) => {
    setLoading(true); // Set loading for signup operation
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || 'Signup failed');
      }
      saveAuthData(data.token, data.user);
    } finally {
      setLoading(false); // Reset loading after signup operation
    }
  };

  const logout = () => { 
    // No setLoading(true) here as it's a local clear and typically fast
    clearAuthData();
  };

  const authCallback = useCallback(async (jwtToken: string) => {
    setLoading(true); // Set loading for auth callback operation
    try {
      if (!jwtToken) {
        throw new Error("No JWT token provided for authentication callback.");
      }
      // Verify the token by calling /api/auth/me
      const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${jwtToken}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || 'Failed to verify OAuth token.');
      }
      saveAuthData(jwtToken, data);
    } finally {
      setLoading(false); // Reset loading after auth callback operation
    }
  }, [saveAuthData]);

  const value = {
    user,
    token,
    isAuthenticated,
    loading, 
    login,
    signup,
    logout,
    authCallback,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};