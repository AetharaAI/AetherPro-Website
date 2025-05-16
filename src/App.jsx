// src/App.jsx
import React from 'react';
import { Routes, Route, Link } from 'react-router-dom'; // Import Link for navigation
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import PresenceOSPage from './pages/PresenceOSPage';
// You'll create BlogPage later
import './App.css';

function App() {
  return (
    <>
      <Navbar /> {/* Navbar remains outside Routes to be on every page */}
      <div className="container">
        <Routes> {/* Defines where your page content will be rendered */}
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/presenceos" element={<PresenceOSPage />} />
          {/* <Route path="/blog" element={<BlogPage />} /> */}
        </Routes>
      </div>
      <footer className="footer">
        <p>© {new Date().getFullYear()} AetherPro Technologies LLC. All rights reserved.</p>
      </footer>
    </>
  );
}

export default App;