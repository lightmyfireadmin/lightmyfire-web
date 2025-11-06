'use client';

import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useI18n } from '@/locales/client';
import LoadingSpinner from '@/app/components/LoadingSpinner';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

interface LighterData {
  name: string;
  backgroundColor: string;
  language: string;
}

interface ShippingAddress {
  name: string;
  email: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
}

interface StripePaymentFormProps {
  orderId: string;
  totalAmount: number;
  userEmail: string;
  packSize: number;
  lighterData: LighterData[];
  shippingAddress: ShippingAddress;
  onSuccess?: (lighterIds: string[]) => void;
  onError?: (error: string) => void;
}

function PaymentFormContent({
  orderId,
  totalAmount,
  userEmail,
  packSize,
  lighterData,
  shippingAddress,
  onSuccess,
  onError,
}: StripePaymentFormProps) {
  const t = useI18n();
  const stripe = useStripe();
  const elements = useElements();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cardholderName, setCardholderName] = useState('');
  const [cardholderEmail, setCardholderEmail] = useState(userEmail);

  // Auto-fill cardholder name from shipping address (can be edited if different)
  useEffect(() => {
    if (shippingAddress?.name) {
      setCardholderName(shippingAddress.name);
    }
  }, [shippingAddress]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      setError(t('order.payment.error_stripe_not_loaded'));
      return;
    }

    if (!cardholderName.trim()) {
      setError(t('order.payment.error_name_required'));
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const createIntentResponse = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          amount: Math.round(totalAmount),
          currency: 'eur',
          cardholderEmail,
          packSize,
        }),
      });

      if (!createIntentResponse.ok) {
        const errorData = await createIntentResponse.json();
        throw new Error(errorData.error || t('order.payment.error_create_intent'));
      }

      const { clientSecret } = await createIntentResponse.json();

      const cardElement = elements.getElement(CardElement);
      if (!cardElement) throw new Error('Card element not found');

      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: { name: cardholderName, email: cardholderEmail },
        },
      });

      if (stripeError) throw new Error(stripeError.message || t('order.payment.error_payment_failed'));

      if (paymentIntent.status === 'succeeded') {

        const orderResponse = await fetch('/api/process-sticker-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            paymentIntentId: paymentIntent.id,
            lighterData,
            shippingAddress,
          }),
        });

        if (!orderResponse.ok) {
          const errorData = await orderResponse.json();
          throw new Error(errorData.error || t('order.payment.error_process_order'));
        }

        const { lighterIds } = await orderResponse.json();
        onSuccess?.(lighterIds);
      } else if (paymentIntent.status === 'requires_action') {
        setError(t('order.payment.error_requires_action'));
      } else {
        throw new Error(t('order.payment.error_unexpected_status', { status: paymentIntent.status }));
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: 'var(--foreground)',
        '::placeholder': { color: 'var(--muted-foreground)' },
      },
      invalid: { color: '#ef4444' },
    },
    hidePostalCode: true,
  };

  const payAmount = (totalAmount / 100).toFixed(2);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-md bg-red-50 dark:bg-red-950/20 p-4 text-red-800 dark:text-red-200">
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">{t('order.payment.cardholder_info')}</h3>
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
            {t('order.payment.full_name')}
          </label>
          <input
            id="name"
            type="text"
            value={cardholderName}
            onChange={(e) => setCardholderName(e.target.value)}
            required
            disabled={isLoading}
            className="w-full px-4 py-2 rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
            placeholder={t('order.payment.full_name_placeholder')}
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
            {t('order.payment.email')}
          </label>
          <input
            id="email"
            type="email"
            value={cardholderEmail}
            onChange={(e) => setCardholderEmail(e.target.value)}
            required
            disabled={isLoading}
            className="w-full px-4 py-2 rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
            placeholder={t('order.payment.email_placeholder')}
          />
          <p className="text-xs text-muted-foreground mt-2">
            {t('order.payment.email_confirmation_notice')}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">{t('order.payment.card_info')}</h3>
        <div className="border border-border rounded-md p-4 bg-background/50">
          <CardElement options={cardElementOptions} />
        </div>
        <div className="text-sm text-muted-foreground">
          <span className="font-medium">{t('order.payment.order_id')}:</span>{' '}
          <span className="font-mono">{orderId}</span>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-background/50 p-4">
        <p className="text-xs text-muted-foreground flex items-center gap-2">
          <span>🔒</span>
          {t('order.payment.security_message')}
        </p>
      </div>

      <button
        type="submit"
        disabled={isLoading || !stripe || !elements}
        className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-semibold text-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <LoadingSpinner color="primary" size="sm" label="" />
            {t('order.payment.processing')}
          </>
        ) : (
          t('order.payment.pay_button', { amount: payAmount })
        )}
      </button>

      <p className="text-xs text-center text-muted-foreground">
        {t('order.payment.terms_agreement', {
          terms: (
            <a href="/legal/terms" className="text-primary underline">
              {t('order.payment.terms_link')}
            </a>
          ),
          privacy: (
            <a href="/legal/privacy" className="text-primary underline">
              {t('order.payment.privacy_link')}
            </a>
          ),
        })}
      </p>
    </form>
  );
}

export default function StripePaymentForm(props: StripePaymentFormProps) {
  const t = useI18n();
  const [isStripeLoaded, setIsStripeLoaded] = useState(false);
  const [stripeError, setStripeError] = useState<string | null>(null);

  useEffect(() => {
    console.log('StripePaymentForm mounted');
    console.log('Stripe key available:', !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
    console.log('Stripe key prefix:', process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.substring(0, 10));

    stripePromise
      .then((stripe) => {
        console.log('Stripe loaded successfully:', !!stripe);
        setIsStripeLoaded(true);
      })
      .catch((error) => {
        console.error('Failed to load Stripe:', error);
        setStripeError('Failed to load Stripe. Please check your configuration.');
      });
  }, []);

  if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
    return (
      <div className="rounded-md bg-yellow-50 dark:bg-yellow-950/20 p-4 text-yellow-800 dark:text-yellow-200">
        <p className="text-sm font-medium">⚠️ {t('order.payment.stripe_not_configured')}</p>
      </div>
    );
  }

  if (stripeError) {
    return (
      <div className="rounded-md bg-red-50 dark:bg-red-950/20 p-4 text-red-800 dark:text-red-200">
        <p className="text-sm font-medium">{stripeError}</p>
      </div>
    );
  }

  if (!isStripeLoaded) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <LoadingSpinner />
        <p className="text-sm text-muted-foreground mt-4">{t('order.payment.loading')}</p>
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise}>
      <PaymentFormContent {...props} />
    </Elements>
  );
}
