
// pages/DashboardPage.tsx - Dashboard Page
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  DollarSign, 
  Key, 
  Users, 
  Activity,
  Calendar,
  Download,
  ExternalLink
} from 'lucide-react';

interface UsageStats {
  totalRequests: number;
  requestsThisMonth: number;
  averageResponseTime: number;
  successRate: number;
  costThisMonth: number;
  remainingCredits: number;
}

const DashboardPage = () => {
  const { user, updateUser } = useAuth();
  const [stats, setStats] = useState<UsageStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [billingPortalLoading, setBillingPortalLoading] = useState(false);

  useEffect(() => {
    fetchUsageStats();
  }, []);

  const fetchUsageStats = async () => {
    try {
      const response = await fetch('/api/dashboard/stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch usage stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBillingPortal = async () => {
    setBillingPortalLoading(true);
    try {
      const response = await fetch('/api/stripe/billing-portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          returnUrl: window.location.href
        })
      });

      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      console.error('Error opening billing portal:', error);
    } finally {
      setBillingPortalLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Requests This Month',
      value: stats?.requestsThisMonth?.toLocaleString() || '0',
      icon: BarChart3,
      color: 'bg-blue-500',
      change: '+12%'
    },
    {
      title: 'Average Response Time',
      value: stats ? `${stats.averageResponseTime}ms` : '0ms',
      icon: Clock,
      color: 'bg-green-500',
      change: '-5%'
    },
    {
      title: 'Success Rate',
      value: stats ? `${stats.successRate}%` : '0%',
      icon: TrendingUp,
      color: 'bg-purple-500',
      change: '+2%'
    },
    {
      title: 'Cost This Month',
      value: stats ? `${stats.costThisMonth.toFixed(2)}` : '$0.00',
      icon: DollarSign,
      color: 'bg-orange-500',
      change: '+8%'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Welcome back, {user?.name}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Here's what's happening with your AetherPro usage
          </p>
        </div>

        {/* Plan Status */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Current Plan: {user?.plan?.charAt(0).toUpperCase() + user?.plan?.slice(1)}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {stats && `${stats.remainingCredits.toLocaleString()} credits remaining this month`}
              </p>
            </div>
            <div className="flex space-x-3">
              {user?.plan !== 'free' && (
                <button
                  onClick={handleBillingPortal}
                  disabled={billingPortalLoading}
                  className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
                >
                  {billingPortalLoading ? 'Loading...' : 'Manage Billing'}
                </button>
              )}
              <Link
                to="/pricing"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                {user?.plan === 'free' ? 'Upgrade Plan' : 'Change Plan'}
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{stat.value}</p>
                  <p className="text-sm text-green-600 dark:text-green-400 mt-1">{stat.change} from last month</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Quick Actions */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Link
                to="/console"
                className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                <Activity className="w-5 h-5 text-blue-600 mr-3" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Open Console</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Start chatting with AI models</p>
                </div>
                <ExternalLink className="w-4 h-4 text-gray-400 ml-auto" />
              </Link>

              <Link
                to="/account/api-keys"
                className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                <Key className="w-5 h-5 text-green-600 mr-3" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Manage API Keys</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Create and manage your API keys</p>
                </div>
                <ExternalLink className="w-4 h-4 text-gray-400 ml-auto" />
              </Link>

              <Link
                to="/docs"
                className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                <Calendar className="w-5 h-5 text-purple-600 mr-3" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">View Documentation</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Learn how to integrate AetherPro</p>
                </div>
                <ExternalLink className="w-4 h-4 text-gray-400 ml-auto" />
              </Link>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Activity</h3>
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                View All
              </button>
            </div>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 py-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 dark:text-white">API request completed</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">2 minutes ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 py-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 dark:text-white">New API key generated</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">1 hour ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 py-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 dark:text-white">Console session started</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">3 hours ago</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default DashboardPage;