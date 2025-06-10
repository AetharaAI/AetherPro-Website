// src/pages/AuthCallbackPage.tsx - OAuth Callback Handler
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { AlertCircle, CheckCircle } from 'lucide-react';

const AuthCallbackPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { authCallback } = useAuth();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const handleCallback = async () => {
      console.log('🔄 OAuth callback page loaded');
      console.log('🔍 URL search params:', Object.fromEntries(searchParams.entries()));

      try {
        // Check for error in URL params first
        const errorParam = searchParams.get('error');
        if (errorParam) {
          console.error('❌ OAuth error in URL:', errorParam);
          throw new Error(`OAuth error: ${errorParam}`);
        }

        // Get the token from URL params
        const token = searchParams.get('token');
        console.log('🔍 Token from URL:', token ? `${token.substring(0, 20)}...` : 'null');

        if (!token) {
          console.error('❌ No token found in URL params');
          throw new Error('No authentication token received');
        }

        console.log('✅ Token found, calling authCallback...');
        await authCallback(token);
        
        console.log('✅ Auth callback successful, setting success status');
        setStatus('success');
        
        // Redirect to dashboard after a brief delay
        setTimeout(() => {
          console.log('🧭 Redirecting to dashboard...');
          navigate('/dashboard', { replace: true });
        }, 2000);

      } catch (err: any) {
        console.error('❌ OAuth callback error:', err);
        setError(err.message || 'Authentication failed');
        setStatus('error');
        
        // Redirect to login after error delay
        setTimeout(() => {
          console.log('🧭 Redirecting to login due to error...');
          navigate('/login', { replace: true });
        }, 3000);
      }
    };

    handleCallback();
  }, [searchParams, authCallback, navigate]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <h2 className="mt-4 text-xl font-semibold text-gray-900 dark:text-white">
            Completing sign in...
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Please wait while we authenticate your account.
          </p>
          
          {/* Debug info in development */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-left max-w-md mx-auto">
              <div className="text-sm font-mono">
                <div className="font-bold text-blue-700 dark:text-blue-300 mb-2">🔍 Debug Info:</div>
                <div className="space-y-1 text-blue-600 dark:text-blue-400">
                  <div>URL: {window.location.href}</div>
                  <div>Params: {JSON.stringify(Object.fromEntries(searchParams.entries()))}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/20">
            <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="mt-4 text-xl font-semibold text-gray-900 dark:text-white">
            Sign in successful!
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Redirecting you to your dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/20">
            <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="mt-4 text-xl font-semibold text-gray-900 dark:text-white">
            Authentication failed
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {error}
          </p>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Redirecting you back to sign in...
          </p>
        </div>
      </div>
    );
  }

  return null;
};

export default AuthCallbackPage;