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

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/docs" element={<DocsPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route 
            path="/login" 
            element={user ? <Navigate to="/dashboard" /> : <LoginPage />} 
          />
          <Route 
            path="/signup" 
            element={user ? <Navigate to="/dashboard" /> : <SignupPage />} 
          />
          <Route
            path="/dashboard"
            element={<DashboardPage />}
          />
          <Route
            path="/account/api-keys"
            element={
              <ProtectedRoute>
                <ApiKeysPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/console"
            element={<ConsolePage />}
          />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;