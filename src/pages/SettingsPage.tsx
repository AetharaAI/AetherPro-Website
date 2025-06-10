// src/pages/SettingsPage.tsx

import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User, Shield, Trash2, Save, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SettingsPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState(user?.name || '');
  const [email] = useState(user?.email || '');

  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    // Placeholder for API call to update user profile
    console.log('Updating profile with name:', name);
    alert('Profile update functionality is a placeholder.');
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you absolutely sure you want to delete your account? This action is irreversible.')) {
      // Placeholder for API call to delete user account
      console.log('Deleting account for user:', user?.id);
      alert('Account deletion is a placeholder. Logging you out.');
      await logout();
      navigate('/');
    }
  };

  if (!user) {
    return <div>Loading user settings...</div>;
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Account Settings
        </h1>

        <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg overflow-hidden">
          {/* Profile Settings Section */}
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center mb-4">
              <User className="w-6 h-6 mr-3 text-gray-500 dark:text-gray-400" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Profile</h2>
            </div>
            <form onSubmit={handleProfileUpdate} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    disabled
                    className="mt-1 block w-full px-3 py-2 bg-gray-100 dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-md shadow-sm sm:text-sm cursor-not-allowed"
                  />
                </div>
              </div>
              <div className="text-right">
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </button>
              </div>
            </form>
          </div>

          <hr className="border-gray-200 dark:border-gray-700" />

          {/* Security & Account Deletion Section */}
          <div className="px-4 py-5 sm:p-6">
             <div className="flex items-center mb-4">
              <Shield className="w-6 h-6 mr-3 text-gray-500 dark:text-gray-400" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Security</h2>
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-400 p-4 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800 dark:text-red-300">Delete Account</h3>
                  <div className="mt-2 text-sm text-red-700 dark:text-red-400">
                    <p>Once you delete your account, all of your data will be permanently removed. This action cannot be undone.</p>
                  </div>
                  <div className="mt-4">
                     <button
                        onClick={handleDeleteAccount}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete My Account
                      </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;