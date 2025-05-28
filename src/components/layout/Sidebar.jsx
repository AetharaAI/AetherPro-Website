// src/components/layout/Sidebar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import LogoutButton from '../common/LogoutButton'; // Assuming this component exists

export default function Sidebar() {
  return (
    <div className="w-64 bg-sidebar text-sidebar-foreground h-screen p-4 flex flex-col shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center text-sidebar-primary-foreground">AetherPro</h2>
      <nav className="flex-grow">
        <ul className="space-y-2"> {/* Reduced spacing for more links */}
          <li>
            <NavLink to="/dashboard" 
              className={({ isActive }) => 
                `block p-2 rounded-md transition-colors ${isActive ? 'bg-sidebar-primary text-sidebar-primary-foreground' : 'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'}`
              }
            >
              Dashboard
            </NavLink>
          </li>
          <li>
            <NavLink to="/chat" 
              className={({ isActive }) => 
                `block p-2 rounded-md transition-colors ${isActive ? 'bg-sidebar-primary text-sidebar-primary-foreground' : 'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'}`
              }
            >
              Chat Studio
            </NavLink>
          </li>
          <li>
            <NavLink to="/memory-explorer" 
              className={({ isActive }) => 
                `block p-2 rounded-md transition-colors ${isActive ? 'bg-sidebar-primary text-sidebar-primary-foreground' : 'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'}`
              }
            >
              Memory Explorer
            </NavLink>
          </li>
          <li>
            <NavLink to="/presenceos" 
              className={({ isActive }) => 
                `block p-2 rounded-md transition-colors ${isActive ? 'bg-sidebar-primary text-sidebar-primary-foreground' : 'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'}`
              }
            >
              PresenceOS Status
            </NavLink>
          </li>
          <li>
            <NavLink to="/settings" 
              className={({ isActive }) => 
                `block p-2 rounded-md transition-colors ${isActive ? 'bg-sidebar-primary text-sidebar-primary-foreground' : 'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'}`
              }
            >
              Settings
            </NavLink>
          </li>
          {/* Add more specialized links here if needed */}
          {/* Example: Agent Management, API Keys, etc. */}
          {/* <li>
            <NavLink to="/agents" 
              className={({ isActive }) => 
                `block p-2 rounded-md transition-colors ${isActive ? 'bg-sidebar-primary text-sidebar-primary-foreground' : 'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'}`
              }
            >
              Agent Management
            </NavLink>
          </li> */}
        </ul>
      </nav>

      {/* Authentication Links / Logout Button at the bottom */}
      <div className="mt-auto pt-4 border-t border-sidebar-border">
        {/* Conditional rendering for login/signup/logout */}
        {/* Assuming useAuthStore provides isAuthenticated status */}
        {/* Example:
        {!isAuthenticated ? (
          <div className="space-y-2">
            <Link to="/login" className="block p-2 rounded-md text-center bg-blue-500 text-white hover:bg-blue-600">Login</Link>
            <Link to="/signup" className="block p-2 rounded-md text-center border border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white">Sign Up</Link>
          </div>
        ) : (
          <LogoutButton /> // Your LogoutButton component
        )}
        */}
        <LogoutButton /> {/* Placeholder, assumes LogoutButton handles auth check internally */}
      </div>
    </div>
  );
}