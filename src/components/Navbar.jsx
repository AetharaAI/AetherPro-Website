// src/components/Navbar.jsx
import React from 'react';
import { Link } from 'react-router-dom'; // Import Link
import './Navbar.css';

function Navbar() {
  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">AetherPro Tech</Link> {/* Use Link */}
      <ul className="navbar-links">
        <li><Link to="/">Home</Link></li> {/* Use Link */}
        <li><Link to="/about">About</Link></li> {/* Use Link */}
        <li><Link to="/presenceos">PresenceOS</Link></li> {/* Use Link */}
        {/* <li><Link to="/blog">Blog</Link></li> */} {/* Use Link */}
      </ul>
    </nav>
  );
}

export default Navbar;