
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
import { createCheckoutSession, createBillingPortalSession } from '../utils/stripe';

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