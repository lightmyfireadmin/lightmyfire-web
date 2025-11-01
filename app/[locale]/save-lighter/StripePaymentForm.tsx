'use client';

import { useState } from 'react';
import { useI18n } from '@/locales/client';
import LoadingSpinner from '@/app/components/LoadingSpinner';

// Placeholder Stripe variables - replace with actual values when keys are available
const STRIPE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder_key_do_not_use';
const STRIPE_API_VERSION = '2024-04-10';

export default function StripePaymentForm({
  orderId,
  totalAmount,
  userEmail,
  onSuccess,
}: {
  orderId: string;
  totalAmount: number;
  userEmail: string;
  onSuccess?: () => void;
}) {
  const t = useI18n();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cardholderName, setCardholderName] = useState('');
  const [cardholderEmail, setCardholderEmail] = useState(userEmail);
  const [billingAddress, setBillingAddress] = useState({
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'US',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Placeholder payment processing - will be implemented with actual Stripe integration
      // This is where Stripe.confirmPayment or similar would be called

      // For now, simulate a payment request
      const paymentData = {
        orderId,
        amount: totalAmount,
        currency: 'EUR', // Placeholder currency
        cardholderName,
        cardholderEmail,
        billingAddress,
        stripePublishableKey: STRIPE_PUBLISHABLE_KEY,
        // Placeholder variables that will be populated by Stripe Elements
        cardToken: 'PLACEHOLDER_STRIPE_TOKEN',
        paymentMethodId: 'PLACEHOLDER_PAYMENT_METHOD_ID',
      };

      // Call backend API to create payment intent (placeholder)
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      });

      if (!response.ok) {
        throw new Error('Payment processing failed');
      }

      const result = await response.json();

      // Here we would confirm payment with Stripe client
      // const { error: stripeError } = await stripe.confirmCardPayment(result.clientSecret);

      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during payment');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Error Display */}
      {error && (
        <div className="rounded-md bg-red-50 p-4 text-red-800">
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Order Summary */}
      <div className="rounded-lg border border-border bg-background/50 p-4">
        <h3 className="text-lg font-semibold text-foreground mb-4">Order Summary</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Order ID:</span>
            <span className="font-mono text-foreground">{orderId}</span>
          </div>
          <div className="flex justify-between border-t border-border pt-2 mt-2">
            <span className="font-semibold text-foreground">Total Amount:</span>
            <span className="font-bold text-primary text-lg">€{(totalAmount / 100).toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Cardholder Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Cardholder Information</h3>

        <div>
          <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
            Full Name
          </label>
          <input
            id="name"
            type="text"
            value={cardholderName}
            onChange={(e) => setCardholderName(e.target.value)}
            required
            className="w-full px-4 py-2 rounded-md border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="John Doe"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            value={cardholderEmail}
            onChange={(e) => setCardholderEmail(e.target.value)}
            required
            className="w-full px-4 py-2 rounded-md border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="john@example.com"
          />
        </div>
      </div>

      {/* Billing Address */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Billing Address</h3>

        <div>
          <label htmlFor="street" className="block text-sm font-medium text-foreground mb-2">
            Street Address
          </label>
          <input
            id="street"
            type="text"
            value={billingAddress.street}
            onChange={(e) => setBillingAddress({ ...billingAddress, street: e.target.value })}
            required
            className="w-full px-4 py-2 rounded-md border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="123 Main Street"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="city" className="block text-sm font-medium text-foreground mb-2">
              City
            </label>
            <input
              id="city"
              type="text"
              value={billingAddress.city}
              onChange={(e) => setBillingAddress({ ...billingAddress, city: e.target.value })}
              required
              className="w-full px-4 py-2 rounded-md border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="New York"
            />
          </div>
          <div>
            <label htmlFor="state" className="block text-sm font-medium text-foreground mb-2">
              State / Province
            </label>
            <input
              id="state"
              type="text"
              value={billingAddress.state}
              onChange={(e) => setBillingAddress({ ...billingAddress, state: e.target.value })}
              className="w-full px-4 py-2 rounded-md border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="NY"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="postalCode" className="block text-sm font-medium text-foreground mb-2">
              Postal Code
            </label>
            <input
              id="postalCode"
              type="text"
              value={billingAddress.postalCode}
              onChange={(e) => setBillingAddress({ ...billingAddress, postalCode: e.target.value })}
              required
              className="w-full px-4 py-2 rounded-md border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="10001"
            />
          </div>
          <div>
            <label htmlFor="country" className="block text-sm font-medium text-foreground mb-2">
              Country
            </label>
            <select
              id="country"
              value={billingAddress.country}
              onChange={(e) => setBillingAddress({ ...billingAddress, country: e.target.value })}
              className="w-full px-4 py-2 rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="US">United States</option>
              <option value="GB">United Kingdom</option>
              <option value="CA">Canada</option>
              <option value="AU">Australia</option>
              <option value="FR">France</option>
              <option value="DE">Germany</option>
              <option value="IT">Italy</option>
              <option value="ES">Spain</option>
              <option value="NL">Netherlands</option>
              <option value="BE">Belgium</option>
              <option value="CH">Switzerland</option>
              <option value="AT">Austria</option>
              <option value="SE">Sweden</option>
              <option value="NO">Norway</option>
              <option value="DK">Denmark</option>
              <option value="FI">Finland</option>
            </select>
          </div>
        </div>
      </div>

      {/* Card Details - Stripe Elements Placeholder */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Payment Information</h3>

        <div className="border border-border rounded-md p-4 bg-background/50">
          <p className="text-sm text-muted-foreground mb-4">
            Stripe Elements Card Form will be rendered here with your Stripe publishable key.
          </p>

          {/* Placeholder for Stripe Card Element */}
          <div className="border border-dashed border-muted-foreground rounded px-4 py-8 text-center text-muted-foreground">
            <p className="text-sm">
              &lt;StripeCardElement id=&quot;card-element&quot; /&gt;
            </p>
            <p className="text-xs mt-2 text-muted-foreground/70">
              Placeholder - Stripe Elements will be integrated here
            </p>
          </div>
        </div>

        {/* Card Error Display Placeholder */}
        <div id="card-errors" className="text-sm text-red-600" role="alert"></div>
      </div>

      {/* Additional Security Information */}
      <div className="rounded-lg border border-border bg-background/50 p-4">
        <p className="text-xs text-muted-foreground flex items-center gap-2">
          <span>🔒</span>
          Your payment information is encrypted and secured by Stripe. We never store your full card details.
        </p>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full btn-primary text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <LoadingSpinner color="foreground" />
            Processing Payment...
          </>
        ) : (
          `Pay €${(totalAmount / 100).toFixed(2)}`
        )}
      </button>

      {/* Additional Info */}
      <p className="text-xs text-center text-muted-foreground">
        By completing this purchase, you agree to our{' '}
        <a href="/legal/terms" className="text-primary underline hover:text-primary/80">
          Terms of Service
        </a>
        {' '}and{' '}
        <a href="/legal/privacy" className="text-primary underline hover:text-primary/80">
          Privacy Policy
        </a>
        .
      </p>
    </form>
  );
}
