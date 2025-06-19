// App.tsx - Updated without OAuth routes

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import DocsPage from './pages/DocsPage';
import PricingPage from './pages/PricingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import ApiKeysPage from './pages/ApiKeysPage';
import ConsolePage from './pages/ConsolePage';
import ProtectedRoute from './components/ProtectedRoute';
import LoadingSpinner from './components/LoadingSpinner';

// Import the new pages
import SettingsPage from './pages/SettingsPage';
import PrivacyPage from './pages/PrivacyPage';
import TermsPage from './pages/TermsPage';
import SecurityPage from './pages/SecurityPage';
import CareersPage from './pages/CareersPage';

// Placeholder pages for About and Blog
const PlaceholderPage = ({ title }: { title: string }) => (
  <div className="text-center py-20">
    <h1 className="text-4xl font-bold dark:text-white">{title}</h1>
    <p className="text-gray-500 mt-4">This page is under construction.</p>
  </div>
);

function App() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/docs" element={<DocsPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/security" element={<SecurityPage />} />
          <Route path="/careers" element={<CareersPage />} />
          <Route path="/about" element={<PlaceholderPage title="About Us" />} />
          <Route path="/blog" element={<PlaceholderPage title="Blog" />} />

          {/* Auth Routes */}
          <Route 
            path="/login" 
            element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />} 
          />
          <Route 
            path="/signup" 
            element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <SignupPage />} 
          />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={<ProtectedRoute><DashboardPage /></ProtectedRoute>}
          />
          <Route
            path="/account/api-keys"
            element={<ProtectedRoute><ApiKeysPage /></ProtectedRoute>}
          />
          <Route
            path="/console"
            element={<ProtectedRoute><ConsolePage /></ProtectedRoute>}
          />
          <Route
            path="/account/settings"
            element={<ProtectedRoute><SettingsPage /></ProtectedRoute>}
          />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;