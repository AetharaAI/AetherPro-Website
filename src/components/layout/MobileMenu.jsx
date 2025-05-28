import { useState } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from './Sidebar';

const MobileMenu = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Hamburger button */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 text-white bg-gray-800 p-2 rounded"
        onClick={() => setIsOpen(!isOpen)}
      >
        ☰
      </button>

      {/* Slide-out menu */}
      <div className={`fixed top-0 left-0 h-full w-64 bg-gray-900 text-white p-4 transform transition-transform duration-300 z-40 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <button
          className="text-right w-full mb-4"
          onClick={() => setIsOpen(false)}
        >
          ✕
        </button>
        <nav className="space-y-2">
          <Link to="/dashboard" onClick={() => setIsOpen(false)}>Dashboard</Link>
          <Link to="/chat" onClick={() => setIsOpen(false)}>Chat</Link>
          <Link to="/memory-explorer" onClick={() => setIsOpen(false)}>Memory Explorer</Link>
          <Link to="/presenceos" onClick={() => setIsOpen(false)}>PresenceOS</Link>
          <Link to="/settings" onClick={() => setIsOpen(false)}>Settings</Link>
        </nav>
      </div>
    </>
  );
};

export default MobileMenu;
