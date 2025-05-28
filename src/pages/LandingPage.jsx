// src/pages/LandingPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar'; // Import Navbar for the public layout
import Footer from '../components/layout/Footer'; // Import Footer for the public layout

// This page is wrapped by PublicLayout in App.jsx, which provides Navbar/Footer already.
// So, this component just needs to render its main content.

const LandingPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground p-8">
      {/* The Navbar and Footer are provided by PublicLayout, so they don't need to be here */}
      
      <h1 className="text-5xl md:text-7xl font-bold text-primary mb-4 text-center animate-fade-in-down">
        AetherProTech
      </h1>
      <p className="text-xl md:text-2xl text-muted-foreground mb-8 text-center animate-fade-in-up delay-200">
        Empowering Intelligent Collaboration with Next-Gen AI
      </p>
      <div className="space-y-4 sm:space-y-0 sm:space-x-4 flex flex-col sm:flex-row animate-fade-in-up delay-400">
        <Link 
          to="/chat" 
          className="px-8 py-3 bg-primary text-primary-foreground font-semibold rounded-lg shadow-lg hover:bg-primary/90 transition-colors transform hover:scale-105"
        >
          Launch AI Studio
        </Link>
        <Link 
          to="/about" 
          className="px-8 py-3 border border-secondary text-secondary-foreground font-semibold rounded-lg shadow-lg hover:bg-secondary hover:text-secondary-foreground transition-colors transform hover:scale-105"
        >
          Learn More
        </Link>
      </div>

      <div className="mt-12 text-sm text-muted-foreground text-center animate-fade-in-up delay-600">
        Already a member? <Link to="/login" className="text-primary hover:underline">Login here</Link>
      </div>
    </div>
  );
};

export default LandingPage;