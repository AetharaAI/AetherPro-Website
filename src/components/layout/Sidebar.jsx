import React, { useState } from "react";
import { Link } from "react-router-dom";

export default function Sidebar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed top-4 left-4 z-50 bg-gray-800 text-white p-2 rounded-md md:hidden"
      >
        ☰
      </button>

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-gray-900 text-white z-40 transition-transform duration-300 ease-in-out ${
          open ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        <div className="p-6 font-bold text-xl border-b border-gray-700">
          AetherPro
        </div>
        <nav className="p-4 space-y-4">
          <Link to="/" className="block hover:text-teal-400">Home</Link>
          <Link to="/product" className="block hover:text-teal-400">Product</Link>
          <Link to="/pricing" className="block hover:text-teal-400">Pricing</Link>
          <Link to="/docs" className="block hover:text-teal-400">Docs</Link>
          <Link to="/contact" className="block hover:text-teal-400">Contact</Link>
        </nav>
      </div>

      {/* Backdrop on mobile when sidebar open */}
      {open && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}
    </>
  );
}
