import React from "react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-8 px-4">
      <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8 text-sm">
        {/* Column 1 */}
        <div>
          <h3 className="text-lg font-semibold mb-3">AetherPro</h3>
          <p className="text-gray-400">
            Intelligent multi-agent orchestration. One interface, infinite capabilities.
          </p>
        </div>

        {/* Column 2: Quick Links */}
        <div>
          <h4 className="font-semibold mb-3">Navigation</h4>
          <ul className="space-y-2">
            <li><Link to="/" className="text-gray-300 hover:text-white">Home</Link></li>
            <li><Link to="/product" className="text-gray-300 hover:text-white">Product</Link></li>
            <li><Link to="/pricing" className="text-gray-300 hover:text-white">Pricing</Link></li>
            <li><Link to="/docs" className="text-gray-300 hover:text-white">Documentation</Link></li>
            <li><Link to="/contact" className="text-gray-300 hover:text-white">Contact</Link></li>
          </ul>
        </div>

        {/* Column 3: Contact */}
        <div>
          <h4 className="font-semibold mb-3">Contact</h4>
          <p className="text-gray-400">Email: support@aetherprotech.com</p>
          <p className="text-gray-400">Location: Indiana, USA</p>
        </div>
      </div>

      <div className="mt-8 text-center text-gray-500 text-xs">
        &copy; {new Date().getFullYear()} AetherPro Technologies LLC. All rights reserved.
      </div>
    </footer>
  );
}
