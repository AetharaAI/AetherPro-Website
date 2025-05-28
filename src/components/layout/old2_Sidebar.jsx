// src/components/layout/Sidebar.jsx (Conceptual)
import React from 'react';
import { NavLink } from 'react-router-dom'; // Use NavLink for active styling

const Sidebar = () => {
  return (
    <div className="p-4 h-full flex flex-col justify-between">
      <div>
        <h1 className="text-2xl font-bold mb-6 text-center">AetherPro</h1>
        <nav>
          <ul>
            <li className="mb-2">
              <NavLink 
                to="/chat" 
                className={({ isActive }) => 
                  `block p-2 rounded-lg transition-colors ${isActive ? 'bg-blue-500 text-white' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`
                }
              >
                Chat Studio
              </NavLink>
            </li>
            <li className="mb-2">
              <NavLink 
                to="/dashboard" 
                className={({ isActive }) => 
                  `block p-2 rounded-lg transition-colors ${isActive ? 'bg-blue-500 text-white' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`
                }
              >
                Dashboard
              </NavLink>
            </li>
            <li className="mb-2">
              <NavLink 
                to="/memory-explorer" 
                className={({ isActive }) => 
                  `block p-2 rounded-lg transition-colors ${isActive ? 'bg-blue-500 text-white' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`
                }
              >
                Memory Explorer
              </NavLink>
            </li>
            <li className="mb-2">
              <NavLink 
                to="/presenceos" 
                className={({ isActive }) => 
                  `block p-2 rounded-lg transition-colors ${isActive ? 'bg-blue-500 text-white' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`
                }
              >
                PresenceOS Status
              </NavLink>
            </li>
            <li className="mb-2">
              <NavLink 
                to="/settings" 
                className={({ isActive }) => 
                  `block p-2 rounded-lg transition-colors ${isActive ? 'bg-blue-500 text-white' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`
                }
              >
                Settings
              </NavLink>
            </li>
          </ul>
        </nav>
      </div>
      {/* Logout button (if separate from Navbar) */}
      <div className="mt-auto">
        {/* Assuming LogoutButton component */}
        <LogoutButton /> 
      </div>
    </div>
  );
};

export default Sidebar;