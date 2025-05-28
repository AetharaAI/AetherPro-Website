// src/components/common/LogoutButton.jsx (Conceptual)
import React from 'react';
import { useAuthStore } from '../../store/authStore';
import { useNavigate } from 'react-router-dom'; // For redirection

const LogoutButton = () => {
  const logout = useAuthStore((state) => state.logout);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login'); // Redirect to login page after logout
  };

  if (!isAuthenticated) {
    return null; // Don't show if not logged in
  }

  return (
    <button
      onClick={handleLogout}
      className="w-full px-4 py-2 bg-destructive text-primary-foreground rounded-md hover:bg-destructive/90 transition-colors"
    >
      Logout
    </button>
  );
};

export default LogoutButton;