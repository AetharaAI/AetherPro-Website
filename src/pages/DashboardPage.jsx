import React from 'react';
import { Link } from 'react-router-dom';
import useAuthStore from '@/store/authStore';

const DashboardPage = () => {
  const { user, tier } = useAuthStore();

  const buttons = [
    { label: 'Chat', path: '/chat' },
    { label: 'Memory Explorer', path: '/memory' },
    { label: 'Settings', path: '/settings' },
    { label: 'Admin Panel', path: '/admin' },
    // Add more as you build them
  ];

  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <h1 className="text-3xl font-bold mb-6">Welcome, {user?.name || 'User'}!</h1>
      <p className="text-muted-foreground mb-4">Tier: {tier}</p>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
        {buttons.map((btn) => (
          <Link
            key={btn.path}
            to={btn.path}
            className="bg-card border border-border rounded-xl p-6 shadow hover:shadow-md transition duration-200"
          >
            <h2 className="text-xl font-semibold mb-2">{btn.label}</h2>
            <p className="text-muted-foreground">Go to {btn.label}</p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default DashboardPage;