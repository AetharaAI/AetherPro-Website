// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet, Navigate } from 'react-router-dom'; // Added Navigate
import Navbar from './components/layout/Navbar'; 
import Footer from './components/layout/Footer'; 
import Sidebar from './components/layout/Sidebar'; 
import LoginForm from './components/common/LoginForm';
import SignupForm from './components/common/SignupForm'; // Assuming SignupForm is in pages directly, not common
import NotFoundPage from './pages/NotFoundPage';

// Import all your pages
import LandingPage from './pages/LandingPage';
import ChatPage from './pages/ChatPage';
import DashboardPage from './pages/DashboardPage';
import MemoryExplorerPage from './pages/MemoryExplorerPage';
import PresenceOSPage from './pages/PresenceOSPage'; // Corrected path
import SettingsPage from './pages/SettingsPage';
import AboutPage from './pages/AboutPage'; 

// State management
import { useAuthStore } from './store/authStore';

// 1. Public Layout Component
const PublicLayout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <Outlet /> {/* This renders the child routes defined in App.jsx */}
      </main>
      <Footer />
    </div>
  );
};

// 2. Authenticated/Studio Layout Component
const StudioLayout = () => {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    // If not authenticated, redirect to login page
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen bg-background text-foreground">
      {/* Left Sidebar for Studio Navigation */}
      <aside className="w-64 flex-shrink-0 bg-sidebar text-sidebar-foreground shadow-lg overflow-y-auto">
        <Sidebar /> 
      </aside>

      {/* Main Content Area */}
      <main className="flex-grow flex flex-col overflow-hidden bg-background">
        <div className="flex-grow overflow-y-auto">
          <Outlet /> {/* This renders the child routes defined in App.jsx */}
        </div>
      </main>

      {/* Right Sidebar (for model parameters, agent details, etc.) */}
      <aside className="w-80 flex-shrink-0 bg-card text-card-foreground shadow-lg border-l border-border overflow-y-auto hidden lg:block">
        <div className="p-4 h-full">
          <h2 className="text-xl font-semibold mb-4 text-primary">Model Controls</h2>
          <p className="text-sm text-muted-foreground">Adjust LLM parameters, select agents, view metrics...</p>
        </div>
      </aside>
    </div>
  );
};

// 3. Main App Component (Contains only ONE Router and all Routes)
function App() {
  return (
    <Router> {/* Only one Router at the top */}
      <Routes>
        {/* Public Routes (using PublicLayout) */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/signup" element={<SignupForm />} /> {/* Ensure SignupForm is in pages */}
          {/* Add more public routes here */}
        </Route>

        {/* Authenticated/Studio Routes (using StudioLayout) */}
        <Route element={<StudioLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/memory-explorer" element={<MemoryExplorerPage />} />
          <Route path="/presenceos" element={<PresenceOSPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          {/* Add more authenticated routes here */}
        </Route>

        {/* Catch-all for 404 - can be outside layouts or within a specific one */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
}

export default App;