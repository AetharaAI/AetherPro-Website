
// pages/PricingPage.tsx - Pricing Page
import React, { useState } from 'react';
import { Check, Zap, Crown, Rocket } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const PricingPage = () => {
  const { user } = useAuth();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annually'>('monthly');

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
      popular: false
    },
    {
      name: 'Basic',
      icon: Crown,
      price: { monthly: 29, annually: 25 },
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
      popular: true
    },
    {
      name: 'Pro',
      icon: Rocket,
      price: { monthly: 99, annually: 83 },
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
      popular: false
    }
  ];

  const handleSubscribe = async (planName: string) => {
    if (!user) {
      // Redirect to signup
      window.location.href = '/signup';
      return;
    }

    if (planName === 'Free') {
      // Already on free plan or upgrade to free
      return;
    }

    if (planName === 'Pro') {
      // Contact sales flow
      window.location.href = 'mailto:sales@aetherpro.com';
      return;
    }

    // Stripe checkout for Basic plan
    try {
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          priceId: billingCycle === 'monthly' ? 'price_basic_monthly' : 'price_basic_annually',
          successUrl: `${window.location.origin}/dashboard?upgrade=success`,
          cancelUrl: `${window.location.origin}/pricing`
        })
      });

      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      console.error('Error creating checkout session:', error);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
                  onClick={() => handleSubscribe(plan.name)}
                  className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors ${
                    plan.popular
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {plan.cta}
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