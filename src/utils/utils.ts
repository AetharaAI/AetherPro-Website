
// utils/stripe.ts - Stripe integration utilities
export const createCheckoutSession = async (priceId: string, successUrl: string, cancelUrl: string) => {
  const response = await fetch('/api/stripe/create-checkout-session', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`
    },
    body: JSON.stringify({
      priceId,
      successUrl,
      cancelUrl
    })
  });

  if (!response.ok) {
    throw new Error('Failed to create checkout session');
  }

  return response.json();
};

export const createBillingPortalSession = async (returnUrl: string) => {
  const response = await fetch('/api/stripe/billing-portal', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`
    },
    body: JSON.stringify({
      returnUrl
    })
  });

  if (!response.ok) {
    throw new Error('Failed to create billing portal session');
  }

  return response.json();
};

// hooks/useStripe.ts - Custom hook for Stripe operations
import { useState } from 'react';
import { createCheckoutSession, createBillingPortalSession } from './stripe';

export const useStripe = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const redirectToCheckout = async (priceId: string) => {
    setLoading(true);
    setError(null);

    try {
      const { url } = await createCheckoutSession(
        priceId,
        `${window.location.origin}/dashboard?upgrade=success`,
        `${window.location.origin}/pricing`
      );
      
      window.location.href = url;
    } catch (err: any) {
      setError(err.message || 'Failed to start checkout');
    } finally {
      setLoading(false);
    }
  };

  const openBillingPortal = async () => {
    setLoading(true);
    setError(null);

    try {
      const { url } = await createBillingPortalSession(window.location.href);
      window.location.href = url;
    } catch (err: any) {
      setError(err.message || 'Failed to open billing portal');
    } finally {
      setLoading(false);
    }
  };

  return {
    redirectToCheckout,
    openBillingPortal,
    loading,
    error
  };
};

// package.json dependencies you'll need to add:
/*
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.8.0",
    "lucide-react": "^0.263.1",
    "uuid": "^9.0.0"
  },
  "devDependencies": {
    "@types/react": "^18.0.27",
    "@types/react-dom": "^18.0.10",
    "@types/uuid": "^9.0.0",
    "@vitejs/plugin-react": "^3.1.0",
    "autoprefixer": "^10.4.13",
    "postcss": "^8.4.21",
    "tailwindcss": "^3.2.4",
    "typescript": "^4.9.4",
    "vite": "^4.1.0"
  }
}
*/

// tailwind.config.js
/*
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {},
  },
  plugins: [],
}
*/

// Backend API endpoints you'll need to implement:
/*
Authentication:
- POST /api/auth/login
- POST /api/auth/signup  
- GET /api/auth/me
- POST /api/auth/api-keys
- GET /api/auth/api-keys
- DELETE /api/auth/api-keys/:id

Dashboard:
- GET /api/dashboard/stats

Stripe:
- POST /api/stripe/create-checkout-session
- POST /api/stripe/billing-portal
- POST /api/stripe/webhook (for handling subscription events)

Your existing AetherPro endpoints:
- GET /api/v1/modules
- POST /api/v1/prompt
- POST /api/v1/upload-file
- WebSocket /ws/chat
*/export default PricingPage;
