// components/Footer.tsx - Updated with Logo and Correct Links
import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            {/* CHANGED: Added logo */}
            <Link to="/" className="flex items-center space-x-2">
              <img className="h-8 w-auto" src="/aether-logo.png" alt="AetherPro Logo" />
              <span className="text-xl font-bold text-gray-900 dark:text-white">AetherPro</span>
            </Link>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              The next-generation AI orchestration platform for developers and enterprises.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wide mb-4">
              Product
            </h3>
            <ul className="space-y-2">
              <li><Link to="/docs" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-sm">Documentation</Link></li>
              <li><Link to="/pricing" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-sm">Pricing</Link></li>
              <li><Link to="/console" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-sm">Console</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wide mb-4">
              Company
            </h3>
            <ul className="space-y-2">
              {/* CHANGED: Updated links */}
              <li><Link to="/about" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-sm">About</Link></li>
              <li><Link to="/blog" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-sm">Blog</Link></li>
              <li><Link to="/careers" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-sm">Careers</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wide mb-4">
              Legal
            </h3>
            <ul className="space-y-2">
              {/* CHANGED: Updated links */}
              <li><Link to="/privacy" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-sm">Privacy</Link></li>
              <li><Link to="/terms" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-sm">Terms</Link></li>
              <li><Link to="/security" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-sm">Security</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
          <p className="text-center text-gray-600 dark:text-gray-400 text-sm">
            © 2025 AetherPro Technologies LLC. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;