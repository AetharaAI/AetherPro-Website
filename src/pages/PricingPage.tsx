// pages/PricingPage.tsx - Fixed with Debug Logging
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Import Link and useNavigate
import { Check, Zap, Crown, Rocket, AlertCircle, CheckCircle, XCircle } from 'lucide-react'; // Added icons for feedback
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner'; // Assuming you have this component
import { API_BASE_URL } from '../config'; // Import API_BASE_URL from your config

const PricingPage = () => {
  const { user, isAuthenticated, token } = useAuth(); // Get isAuthenticated and token
  const navigate = useNavigate(); // For programmatic navigation

  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annually'>('monthly');
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null); // State for which plan is loading
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Define your plans with Stripe Price IDs directly
  // IMPORTANT: Replace 'price_12345...' with your actual Stripe Price IDs!
  const plans = [
    {
      name: 'Free',
      icon: Zap,
      price: { monthly: 0, annually: 0 },
      description: 'Perfect for getting started and small projects',
      features: [
        '1,000 API calls per month',
        'Access to 3 AI models',
        'Basic support',
        'Standard rate limits',
        'Community access'
      ],
      limitations: [
        'No file processing',
        'No custom workflows',
        'Limited to 2 concurrent requests'
      ],
      cta: 'Get Started Free',
      popular: false,
      internalPlanName: 'free' // Matches user.plan
    },
    {
      name: 'Basic',
      icon: Crown,
      price: { monthly: 29, annually: 25 }, // $25/month billed annually
      description: 'For growing teams and production applications',
      features: [
        '50,000 API calls per month',
        'Access to all AI models',
        'File processing (PDF, DOCX, etc.)',
        'Priority support',
        'Higher rate limits',
        'Basic analytics dashboard',
        'Team collaboration (up to 5 users)'
      ],
      limitations: [
        'No custom model fine-tuning',
        'Standard SLA (99.5% uptime)'
      ],
      cta: 'Start Basic Plan',
      popular: true,
      internalPlanName: 'basic', // Matches user.plan
      stripePriceId: {
        monthly: 'price_1RWxRGHctdijlUvAQ3p4V9qX', // e.g., 'price_1N2O3P4Q5R6S7T8U9V0W1X2Y'
        annually: 'price_1RWxRGHctdijlUvACMAh87hY' // e.g., 'price_A1B2C3D4E5F6G7H8I9J0K1L2'
      }
    },
    {
      name: 'Pro',
      icon: Rocket,
      price: { monthly: 99, annually: 83 }, // $83/month billed annually
      description: 'For enterprises with advanced AI needs',
      features: [
        '500,000 API calls per month',
        'Custom model fine-tuning',
        'Advanced workflow orchestration',
        'Dedicated support channel',
        'Custom integrations',
        'Advanced analytics & reporting',
        'Unlimited team members',
        'Premium SLA (99.9% uptime)',
        'SOC 2 compliance',
        'Custom rate limits'
      ],
      limitations: [],
      cta: 'Contact Sales',
      popular: false,
      internalPlanName: 'pro', // Matches user.plan
      stripePriceId: {
        monthly: 'price_1RWxTjHctdijlUvAWTMmo4CF', 
        annually: 'price_1RWxTjHctdijlUvApBfUCMEf'
      }
    }
  ];

  const handleSubscribe = async (plan: typeof plans[0]) => { // Pass the whole plan object
    // 🔍 DEBUG: Add comprehensive logging
    console.log('=== STRIPE SUBSCRIPTION DEBUG START ===');
    console.log('💳 Plan clicked:', plan.name);
    console.log('💳 Plan object:', plan);
    console.log('💳 Billing cycle:', billingCycle);
    console.log('💳 User authenticated:', isAuthenticated);
    console.log('💳 Token exists:', !!token);
    console.log('💳 User object:', user);
    console.log('💳 API_BASE_URL:', API_BASE_URL);

    setError(null); // Clear previous errors
    setSuccessMessage(null); // Clear previous success messages

    if (!isAuthenticated || !token || !user) {
      // User is not logged in, redirect to login/signup page
      console.log('❌ User not authenticated, redirecting to login');
      navigate('/login'); 
      return;
    }

    if (user.plan === plan.internalPlanName) {
      console.log('❌ User already on this plan');
      setError(`You are already on the ${plan.name} plan.`);
      return;
    }

    if (plan.internalPlanName === 'free') {
      // Logic for switching to free plan (if applicable and different from current)
      // Usually, you can't "subscribe" to free via Stripe. This might be a backend API call
      // or simply a no-op if user is already on free.
      console.log('ℹ️ Free plan selected');
      setSuccessMessage('You are on the Free plan. No action needed for this plan.');
      return;
    }

    if (plan.internalPlanName === 'pro' && plan.cta === 'Contact Sales') {
      // For Pro plan, redirect to sales contact
      console.log('📧 Pro plan selected, redirecting to sales');
      window.location.href = 'mailto:sales@aetherpro.com';
      return;
    }

    setLoadingPlan(plan.name); // Set loading state for the specific plan

    try {
      // Prepare the payload
      const payload = {
        plan_name: plan.internalPlanName, // Send your internal plan name
        billing_cycle: billingCycle // Send billing cycle to backend
      };

      console.log('📤 Preparing to send request...');
      console.log('📤 Payload:', payload);
      console.log('📤 URL:', `${API_BASE_URL}/api/stripe/create-checkout-session`);
      console.log('📤 Headers:', {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token ? token.substring(0, 20) + '...' : 'none'}`
      });

      // For Basic or other paid plans handled via Stripe Checkout
      const response = await fetch(`${API_BASE_URL}/api/stripe/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // Use the token from AuthContext
        },
        body: JSON.stringify(payload)
      });

      console.log('📥 Response received:');
      console.log('📥 Status:', response.status);
      console.log('📥 Status text:', response.statusText);
      console.log('📥 Headers:', Object.fromEntries(response.headers.entries()));

      // Try to get response text first
      const responseText = await response.text();
      console.log('📥 Raw response text:', responseText);

      let data;
      try {
        data = JSON.parse(responseText);
        console.log('📥 Parsed response data:', data);
      } catch (parseError) {
        console.error('❌ Failed to parse response as JSON:', parseError);
        throw new Error(`Invalid response format: ${responseText}`);
      }

      if (!response.ok) {
        console.error('❌ Response not OK:', response.status, data);
        throw new Error(data.detail || data.message || `Failed to create checkout session for ${plan.name} plan. Status: ${response.status}`);
      }

      if (!data.session_url) {
        console.error('❌ No session_url in response:', data);
        throw new Error('No checkout session URL received from server');
      }

      console.log('✅ Success! Redirecting to:', data.session_url);
      // Redirect to Stripe Checkout
      window.location.href = data.session_url;

    } catch (err: any) {
      console.error('❌ Subscription error:', err);
      console.error('❌ Error stack:', err.stack);
      setError(err.message || 'Failed to initiate subscription. Please try again.');
    } finally {
      setLoadingPlan(null); // Reset loading state
      console.log('=== STRIPE SUBSCRIPTION DEBUG END ===');
    }
  };

  const handleManageSubscription = async () => {
    console.log('🔧 Manage subscription clicked');
    setError(null);
    setSuccessMessage(null);

    if (!isAuthenticated || !token || !user) {
      setError('Please log in to manage your your subscription.');
      navigate('/login');
      return;
    }
    if (user.plan === 'free') {
      setError('You are on the Free plan. No subscription to manage via the Stripe customer portal.');
      return;
    }

    setLoadingPlan('manage'); // Use a generic loading state for portal
    try {
      const response = await fetch(`${API_BASE_URL}/api/stripe/create-customer-portal-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Failed to create customer portal session.');
      }

      window.location.href = data.portal_url; // Redirect to Stripe Customer Portal
    } catch (err: any) {
      setError(err.message || 'Failed to open customer portal. Please try again.');
    } finally {
      setLoadingPlan(null);
    }
  };

  // Debug auth state on component mount
  useEffect(() => {
    console.log('🔍 PricingPage mounted - Auth state:');
    console.log('🔍 isAuthenticated:', isAuthenticated);
    console.log('🔍 token exists:', !!token);
    console.log('🔍 user:', user);
    console.log('🔍 API_BASE_URL:', API_BASE_URL);
  }, [isAuthenticated, token, user]);

  // Display success/error messages from redirect (e.g., after checkout)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('checkout_success') === 'true') {
      setSuccessMessage('Subscription successful! Your plan has been updated.');
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (params.get('checkout_canceled') === 'true') {
      setError('Subscription checkout canceled. You were not charged.');
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []); // Empty dependency array means this runs once on mount

  return (
    <div className="bg-white dark:bg-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Debug Info Panel (only show in development) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mb-8 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <h3 className="font-bold mb-2">Debug Info:</h3>
            <p>Authenticated: {isAuthenticated ? '✅' : '❌'}</p>
            <p>User Plan: {user?.plan || 'none'}</p>
            <p>Token: {token ? '✅' : '❌'}</p>
            <p>API URL: {API_BASE_URL}</p>
          </div>
        )}

        {/* Error/Success Messages */}
        {error && (
          <div className="mb-8 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center space-x-2">
            <XCircle className="w-5 h-5 text-red-500" />
            <span className="text-red-700 dark:text-red-300">{error}</span>
          </div>
        )}
        
        {successMessage && (
          <div className="mb-8 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span className="text-green-700 dark:text-green-300">{successMessage}</span>
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-3xl mx-auto">
            Choose the plan that fits your needs. Upgrade or downgrade at any time.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center space-x-4 mb-8">
            <span className={`text-sm font-medium ${billingCycle === 'monthly' ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
              Monthly
            </span>
            <button
              onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'annually' : 'monthly')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                billingCycle === 'annually' ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  billingCycle === 'annually' ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`text-sm font-medium ${billingCycle === 'annually' ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
              Annually
              <span className="ml-1 text-green-600 dark:text-green-400 font-semibold">(Save 20%)</span>
            </span>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative bg-white dark:bg-gray-800 rounded-xl shadow-sm border-2 transition-all hover:shadow-lg ${
                plan.popular
                  ? 'border-blue-500 ring-2 ring-blue-200 dark:ring-blue-800'
                  : 'border-gray-200 dark:border-gray-700'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="p-8">
                <div className="flex items-center space-x-3 mb-4">
                  <plan.icon className={`w-8 h-8 ${plan.popular ? 'text-blue-600' : 'text-gray-600 dark:text-gray-400'}`} />
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{plan.name}</h3>
                </div>

                <div className="mb-6">
                  <div className="flex items-baseline">
                    <span className="text-4xl font-bold text-gray-900 dark:text-white">
                      ${plan.price[billingCycle]}
                    </span>
                    <span className="ml-2 text-gray-600 dark:text-gray-400">
                      /{billingCycle === 'monthly' ? 'month' : 'year'}
                    </span>
                  </div>
                  {billingCycle === 'annually' && plan.price.monthly > 0 && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      ${plan.price.monthly}/month billed annually
                    </p>
                  )}
                </div>

                <p className="text-gray-600 dark:text-gray-400 mb-6">{plan.description}</p>

                <button
                  onClick={() => handleSubscribe(plan)} // Pass the whole plan object
                  disabled={loadingPlan === plan.name || loadingPlan === 'manage'} // Disable if this plan is loading, or overall manage is loading
                  className={`w-full flex justify-center items-center py-3 px-4 rounded-lg font-semibold transition-colors ${
                    plan.popular
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {loadingPlan === plan.name ? <LoadingSpinner size="sm" /> : plan.cta}
                </button>

                <div className="mt-8">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-4">What's included:</h4>
                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start space-x-3">
                        <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-600 dark:text-gray-400 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {plan.limitations.length > 0 && (
                    <div className="mt-6">
                      <h5 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Limitations:</h5>
                      <ul className="space-y-1">
                        {plan.limitations.map((limitation, index) => (
                          <li key={index} className="text-gray-500 dark:text-gray-400 text-sm">
                            • {limitation}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Manage Subscription Button (outside pricing cards) */}
        {isAuthenticated && user && user.plan !== 'free' && (
          <div className="mt-12 text-center">
            <button
              onClick={handleManageSubscription}
              disabled={loadingPlan === 'manage'}
              className="px-6 py-3 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center mx-auto"
            >
              {loadingPlan === 'manage' ? <LoadingSpinner size="sm" /> : 'Manage Your Subscription'}
            </button>
          </div>
        )}

        {/* FAQ Section */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
            Frequently Asked Questions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Can I change plans anytime?
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                What happens if I exceed my limits?
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                We'll notify you when you're approaching your limits. Excess usage is billed at standard rates.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Do you offer custom enterprise plans?
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Yes, we offer custom enterprise solutions with dedicated support and SLAs. Contact our sales team.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Is there a free trial for paid plans?
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                All paid plans come with a 14-day free trial. No credit card required to start.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;