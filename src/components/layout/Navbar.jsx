// src/components/layout/Navbar.jsx
import React from 'react';
import { Link } from 'react-router-dom'; // Assuming you might want to link logo to home

const Navbar = () => {
  return (
    // This Navbar will be used only for public/non-studio pages, or as a very thin top bar.
    // For the main studio layout, navigation is primarily handled by the Sidebar.
    <nav className="bg-card border-b border-border text-card-foreground">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold text-primary hover:text-primary-foreground transition-colors">
          AetherProTech
        </Link>
        {/* You could add a theme toggle or other global utilities here */}
      </div>
    </nav>
  );
};

export default Navbar;