// src/pages/AuthCallbackPage.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from 'src/contexts/AuthContext';
import LoadingSpinner from 'src/components/LoadingSpinner';
import { AlertCircle } from 'lucide-react';
import { FRONTEND_BASE_URL } from '../config'; // Use FRONTEND_BASE_URL for redirect if error

const AuthCallbackPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { authCallback } = useAuth(); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const handleCallback = async () => {
      const params = new URLSearchParams(location.search);
      const token = params.get('token');
      const errorParam = params.get('error'); // Check for error from backend

      if (errorParam) {
        setError(decodeURIComponent(errorParam)); // Decode if it's URL-encoded
        setLoading(false);
        return;
      }

      if (token) {
        try {
          // Pass the token to AuthContext to handle login and state update
          await authCallback(token);
          navigate('/console'); // Redirect to main console after successful auth
        } catch (err: any) {
          // If authCallback fails, ensure we log out any partially set state
          setError(err.message || 'Authentication failed during callback.');
          setLoading(false);
        }
      } else {
        // This case should ideally not happen if FastAPI redirects properly,
        // but it's a safeguard for direct navigation or missing params.
        setError('Authentication callback received no token.');
        setLoading(false);
      }
    };

    handleCallback();
  }, [location, navigate, authCallback]); // Add authCallback to dependencies

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        {loading && (
          <>
            <LoadingSpinner size="lg" />
            <h2 className="mt-6 text-center text-2xl font-bold text-gray-900 dark:text-white">
              Authenticating...
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
              Please wait while we log you in.
            </p>
          </>
        )}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex flex-col items-center">
              <AlertCircle className="w-8 h-8 text-red-500 mb-2" />
              <p className="text-sm font-medium text-red-700 dark:text-red-300">Authentication Error</p>
              <p className="text-xs text-red-600 dark:text-red-400 mt-1">{error}</p>
              <button
                onClick={() => navigate('/login')}
                className="mt-4 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Go to Login
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthCallbackPage;