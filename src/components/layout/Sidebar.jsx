import React from 'react';
import { Link } from 'react-router-dom';


export default function Sidebar() {
  return (
    <aside className="w-64 bg-slate-800 text-white h-screen p-4">
    {/* Close button (mobile only) */}
    <button onClick={() => console.log('Close menu')} className="md:hidden text-white mb-4">
      ✕
    </button>
    <div className="w-64 bg-slate-800 text-white h-screen p-4">
      <h2 className="text-xl font-bold mb-6">AetherPro</h2>
      <ul className="space-y-4">
        <li><Link to="/" className="hover:text-blue-400">Home</Link></li>
        <li><Link to="/chat" className="hover:text-blue-400">Chat</Link></li>
        <li><Link to="/admin" className="hover:text-blue-400">Admin</Link></li>
        <li><Link to="/memory" className="hover:text-blue-400">Memory</Link></li>
        <li><Link to="/settings" className="hover:text-blue-400">Settings</Link></li>
        <div className="space-x-4"></div>
        <li><Link to="/login" className="hover:text-blue-400">Login</Link></li>
        <li><Link to="/signup" className="hover:text-blue-400">Sign Up</Link></li>
        <li><Link to="/logout" className="hover:text-blue-400">Logout</Link></li>
        <li><Link to="/dashboard" className="hover:text-blue-400">Dashboard</Link></li>
      </ul>
    </div>
    </aside>
  );
}