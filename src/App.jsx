import React from 'react';
import { Routes, Route, Outlet } from 'react-router-dom';
import PresenceOSPage from './pages/PresenceOSPage';
import ChatPage from './pages/ChatPage';
import Navbar from './components/layout/Navbar'; // Assuming you create this
import Footer from './components/layout/Footer'; // Assuming you create this
import NotFoundPage from './pages/NotFoundPage';
import Sidebar from './components/layout/Sidebar'; // Assuming you create this
import LoginForm from './components/common/LoginForm';
import SignupForm from './components/common/SignupForm'; // Assuming you create this
import DashboardPage from './pages/DashboardPage';
import LogoutButton from './components/common/LogoutButton'; // Assuming you create this

//import AdminDashboardPage from './pages/AdminDashboardPage'; // Import your admin dashboard page
import HomePage from './pages/HomePage';
import MemoryExplorerPage from './pages/MemoryExplorerPage'; // Import your memory explorer page
import SettingsPage from './pages/SettingsPage'; // Import your settings page
import MobileMenu from './components/layout/MobileMenu';
// Import other pages as you create them


// Basic Layout component if you want Navbar/Footer on multiple pages
const MainLayout = () => {
  return (
    <>
      <div className=" min-h-screen flex flex-col bg-background text-foreground">
        <Navbar />
        <div className="flex flex-1">
          <Sidebar /> {/* Sidebar for navigation */}
          {/* Main content Area */}
          <div className="flex-1 p-4"> {/* Adjust margin-left based on sidebar width */}
            <main className="flex-grow container mx-auto px-4 py-8"> {/* Adjust padding as needed */}
              <Outlet /> {/* Child routes will render here */}
            </main>
            <Footer />
          </div>
        </div>
      </div>
    </>
  );
};
function App() {
  return (
    <Routes>
      {/* Wrap all pages in MainLayout so they share sidebar + navbar */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/signup" element={<SignupForm />} />
        <Route path="/logout" element={<LogoutButton />} />
        <Route path="/memory" element={<MemoryExplorerPage />} />
        <Route path="/presence" element={<PresenceOSPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

export default App;