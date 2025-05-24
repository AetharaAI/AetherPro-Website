import React from 'react';
import { Routes, Route, Outlet } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import ChatPage from './pages/ChatPage';
import Navbar from './components/layout/Navbar'; // Assuming you create this
import Footer from './components/layout/Footer'; // Assuming you create this
import NotFoundPage from './pages/NotFoundPage';
import Sidebar from './components/layout/Sidebar'; // Assuming you create this
import AdminDashboardPage from './pages/AdminDashboardPage'; // Import your admin dashboard page
import MemoryExplorerPage from './pages/MemoryExplorerPage'; // Import your memory explorer page
import SettingsPage from './pages/SettingsPage'; // Import your settings page
// Import other pages as you create them

// Basic Layout component if you want Navbar/Footer on multiple pages
const MainLayout = () => (
  <div className="flex min-h-screen bg-background text-foreground"> {/* Sidebar on the left */}
    <Sidebar /> 
    {/* Content area to the right of sidebar */}
    <div className="flex flex-col flex-grow ml-64">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8"> {/* Adjust padding as needed */}
        <Outlet /> {/* Child routes will render here */}
      </main>
      <Footer />
    </div>
  </div>
);

function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}> {/* Use a layout for pages with Navbar/Footer */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/admin" element={<AdminDashboardPage />} />
        
        <Route path="/memory" element={<MemoryExplorerPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        
        {/* Add other routes for Admin, Memory, Settings later */}
        {/* <Route path="/admin" element={<AdminDashboardPage />} /> */}
        {/* <Route path="/memory" element={<MemoryExplorerPage />} /> */}
        {/* <Route path="/settings" element={<SettingsPage />} /> */}
      
        <Route path="*" element={<NotFoundPage />} /> {/* Catch-all for 404 */}
      </Route>
    </Routes>
  );
}

export default App;