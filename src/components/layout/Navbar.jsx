// src/components/layout/Navbar.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="bg-card border-b sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold text-primary">
          AetherProTech
        </Link>
        <div className="space-x-4">
          <Link to="/chat" className="text-sm font-medium text-muted-foreground hover:text-primary">Chat</Link>
          {/* Add links to Admin, Memory, Settings later */}
          {/* <Link to="/admin" className="text-sm font-medium text-muted-foreground hover:text-primary">Dashboard</Link> */}
        </div>
      </div>
    </nav>
  );
};
export default Navbar;