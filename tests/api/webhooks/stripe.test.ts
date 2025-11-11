import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from '@/app/api/webhooks/stripe/route';
import Stripe from 'stripe';

// Mock Stripe
const mockConstructEvent = vi.fn();
vi.mock('stripe', () => ({
  default: vi.fn(() => ({
    webhooks: {
      constructEvent: mockConstructEvent,
    },
  })),
}));

// Mock Supabase
const mockSupabaseClient = {
  from: vi.fn(),
  rpc: vi.fn(),
};

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => mockSupabaseClient),
}));

// Mock logger
vi.mock('@/lib/logger', () => ({
  logger: {
    event: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

describe('/api/webhooks/stripe', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = {
      ...originalEnv,
      STRIPE_SECRET_KEY: 'sk_test_mock',
      STRIPE_WEBHOOK_SECRET: 'whsec_test_mock',
      NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
      SUPABASE_SERVICE_ROLE_KEY: 'test_service_role_key',
    };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('Environment Validation', () => {
    it('should return 500 if STRIPE_SECRET_KEY is missing', async () => {
      delete process.env.STRIPE_SECRET_KEY;

      const request = new NextRequest('http://localhost:3000/api/webhooks/stripe', {
        method: 'POST',
        body: 'test body',
        headers: {
          'stripe-signature': 'test_signature',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Stripe not configured');
    });

    it('should return 500 if STRIPE_WEBHOOK_SECRET is missing', async () => {
      delete process.env.STRIPE_WEBHOOK_SECRET;

      const request = new NextRequest('http://localhost:3000/api/webhooks/stripe', {
        method: 'POST',
        body: 'test body',
        headers: {
          'stripe-signature': 'test_signature',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Webhook secret not configured');
    });

    it('should return 500 if Supabase configuration is missing', async () => {
      delete process.env.NEXT_PUBLIC_SUPABASE_URL;

      const request = new NextRequest('http://localhost:3000/api/webhooks/stripe', {
        method: 'POST',
        body: 'test body',
        headers: {
          'stripe-signature': 'test_signature',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Database not configured');
    });
  });

  describe('Signature Verification', () => {
    it('should return 400 if stripe-signature header is missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/webhooks/stripe', {
        method: 'POST',
        body: 'test body',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('No signature provided');
    });

    it('should return 400 if signature verification fails', async () => {
      mockConstructEvent.mockImplementation(() => {
        throw new Error('Invalid signature');
      });

      const request = new NextRequest('http://localhost:3000/api/webhooks/stripe', {
        method: 'POST',
        body: JSON.stringify({ type: 'test.event' }),
        headers: {
          'stripe-signature': 'invalid_signature',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Webhook Error');
    });

    it('should detect timestamp validation failures', async () => {
      mockConstructEvent.mockImplementation(() => {
        throw new Error('Timestamp outside the tolerance zone');
      });

      const request = new NextRequest('http://localhost:3000/api/webhooks/stripe', {
        method: 'POST',
        body: JSON.stringify({ type: 'test.event' }),
        headers: {
          'stripe-signature': 'test_signature',
        },
      });

      const response = await POST(request);

      expect(response.status).toBe(400);
    });
  });

  describe('Timestamp Validation', () => {
    it('should reject events older than 5 minutes', async () => {
      const oldTimestamp = Math.floor(Date.now() / 1000) - 400; // 6 minutes 40 seconds ago

      const mockEvent: Stripe.Event = {
        id: 'evt_test_old',
        object: 'event',
        api_version: '2025-10-29.clover',
        created: oldTimestamp,
        data: { object: {} },
        livemode: false,
        pending_webhooks: 0,
        request: null,
        type: 'payment_intent.succeeded',
      };

      mockConstructEvent.mockReturnValue(mockEvent);

      const request = new NextRequest('http://localhost:3000/api/webhooks/stripe', {
        method: 'POST',
        body: JSON.stringify(mockEvent),
        headers: {
          'stripe-signature': 'test_signature',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Webhook event too old');
    });

    it('should accept events within 5 minutes', async () => {
      const recentTimestamp = Math.floor(Date.now() / 1000) - 60; // 1 minute ago

      const mockPaymentIntent: Stripe.PaymentIntent = {
        id: 'pi_test_recent',
        object: 'payment_intent',
        amount: 2999,
        currency: 'eur',
        status: 'succeeded',
        metadata: { orderId: 'order-123' },
      } as Stripe.PaymentIntent;

      const mockEvent: Stripe.Event = {
        id: 'evt_test_recent',
        object: 'event',
        api_version: '2025-10-29.clover',
        created: recentTimestamp,
        data: { object: mockPaymentIntent },
        livemode: false,
        pending_webhooks: 0,
        request: null,
        type: 'payment_intent.succeeded',
      };

      mockConstructEvent.mockReturnValue(mockEvent);

      // Mock idempotency check - event not yet processed
      mockSupabaseClient.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: null, error: null }),
          }),
        }),
        insert: vi.fn().mockResolvedValue({ data: {}, error: null }),
      });

      // Mock RPC call
      mockSupabaseClient.rpc.mockResolvedValue({ data: {}, error: null });

      const request = new NextRequest('http://localhost:3000/api/webhooks/stripe', {
        method: 'POST',
        body: JSON.stringify(mockEvent),
        headers: {
          'stripe-signature': 'test_signature',
        },
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
    });
  });

  describe('Idempotency', () => {
    it('should return 200 if event was already processed', async () => {
      const mockEvent: Stripe.Event = {
        id: 'evt_test_duplicate',
        object: 'event',
        api_version: '2025-10-29.clover',
        created: Math.floor(Date.now() / 1000) - 60,
        data: { object: {} as any },
        livemode: false,
        pending_webhooks: 0,
        request: null,
        type: 'payment_intent.succeeded',
      };

      mockConstructEvent.mockReturnValue(mockEvent);

      // Mock that event already exists
      mockSupabaseClient.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { id: 'evt_test_duplicate' },
              error: null,
            }),
          }),
        }),
      });

      const request = new NextRequest('http://localhost:3000/api/webhooks/stripe', {
        method: 'POST',
        body: JSON.stringify(mockEvent),
        headers: {
          'stripe-signature': 'test_signature',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.status).toBe('already_processed');
    });

    it('should handle race condition with duplicate event ID (23505 error)', async () => {
      const mockEvent: Stripe.Event = {
        id: 'evt_test_race',
        object: 'event',
        api_version: '2025-10-29.clover',
        created: Math.floor(Date.now() / 1000) - 60,
        data: { object: {} as any },
        livemode: false,
        pending_webhooks: 0,
        request: null,
        type: 'payment_intent.succeeded',
      };

      mockConstructEvent.mockReturnValue(mockEvent);

      // Mock idempotency check returns null (not found)
      const mockInsert = vi.fn().mockResolvedValue({
        data: null,
        error: { code: '23505', message: 'duplicate key value violates unique constraint' },
      });

      mockSupabaseClient.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: null, error: null }),
          }),
        }),
        insert: mockInsert,
      });

      const request = new NextRequest('http://localhost:3000/api/webhooks/stripe', {
        method: 'POST',
        body: JSON.stringify(mockEvent),
        headers: {
          'stripe-signature': 'test_signature',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.status).toBe('already_processed');
    });

    it('should return 500 if webhook event tracking fails with non-duplicate error', async () => {
      const mockEvent: Stripe.Event = {
        id: 'evt_test_error',
        object: 'event',
        api_version: '2025-10-29.clover',
        created: Math.floor(Date.now() / 1000) - 60,
        data: { object: {} as any },
        livemode: false,
        pending_webhooks: 0,
        request: null,
        type: 'payment_intent.succeeded',
      };

      mockConstructEvent.mockReturnValue(mockEvent);

      // Mock database error (not duplicate)
      mockSupabaseClient.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: null, error: null }),
          }),
        }),
        insert: vi.fn().mockResolvedValue({
          data: null,
          error: { code: 'PGRST000', message: 'Database connection failed' },
        }),
      });

      const request = new NextRequest('http://localhost:3000/api/webhooks/stripe', {
        method: 'POST',
        body: JSON.stringify(mockEvent),
        headers: {
          'stripe-signature': 'test_signature',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to track webhook event');
    });
  });

  describe('Event Handling: payment_intent.succeeded', () => {
    it('should successfully process payment_intent.succeeded event', async () => {
      const mockPaymentIntent: Stripe.PaymentIntent = {
        id: 'pi_test_success',
        object: 'payment_intent',
        amount: 2999,
        currency: 'eur',
        status: 'succeeded',
        metadata: { orderId: 'order-123' },
      } as Stripe.PaymentIntent;

      const mockEvent: Stripe.Event = {
        id: 'evt_test_payment_success',
        object: 'event',
        api_version: '2025-10-29.clover',
        created: Math.floor(Date.now() / 1000) - 60,
        data: { object: mockPaymentIntent },
        livemode: false,
        pending_webhooks: 0,
        request: null,
        type: 'payment_intent.succeeded',
      };

      mockConstructEvent.mockReturnValue(mockEvent);

      // Mock successful database operations
      mockSupabaseClient.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: null, error: null }),
          }),
        }),
        insert: vi.fn().mockResolvedValue({ data: {}, error: null }),
      });

      mockSupabaseClient.rpc.mockResolvedValue({ data: {}, error: null });

      const request = new NextRequest('http://localhost:3000/api/webhooks/stripe', {
        method: 'POST',
        body: JSON.stringify(mockEvent),
        headers: {
          'stripe-signature': 'test_signature',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.received).toBe(true);

      // Verify RPC was called with correct payment intent ID
      expect(mockSupabaseClient.rpc).toHaveBeenCalledWith('update_order_payment_succeeded', {
        p_payment_intent_id: 'pi_test_success',
      });
    });

    it('should return 500 if RPC call fails', async () => {
      const mockPaymentIntent: Stripe.PaymentIntent = {
        id: 'pi_test_rpc_fail',
        object: 'payment_intent',
        amount: 2999,
        currency: 'eur',
        status: 'succeeded',
        metadata: { orderId: 'order-123' },
      } as Stripe.PaymentIntent;

      const mockEvent: Stripe.Event = {
        id: 'evt_test_rpc_fail',
        object: 'event',
        api_version: '2025-10-29.clover',
        created: Math.floor(Date.now() / 1000) - 60,
        data: { object: mockPaymentIntent },
        livemode: false,
        pending_webhooks: 0,
        request: null,
        type: 'payment_intent.succeeded',
      };

      mockConstructEvent.mockReturnValue(mockEvent);

      mockSupabaseClient.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: null, error: null }),
          }),
        }),
        insert: vi.fn().mockResolvedValue({ data: {}, error: null }),
      });

      // Mock RPC failure
      mockSupabaseClient.rpc.mockResolvedValue({
        data: null,
        error: { message: 'RPC failed', details: 'Order not found' },
      });

      const request = new NextRequest('http://localhost:3000/api/webhooks/stripe', {
        method: 'POST',
        body: JSON.stringify(mockEvent),
        headers: {
          'stripe-signature': 'test_signature',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Database update failed');
    });
  });

  describe('Event Handling: payment_intent.payment_failed', () => {
    it('should successfully process payment_intent.payment_failed event', async () => {
      const mockPaymentIntent: Stripe.PaymentIntent = {
        id: 'pi_test_failed',
        object: 'payment_intent',
        amount: 2999,
        currency: 'eur',
        status: 'requires_payment_method',
        metadata: { orderId: 'order-123' },
        last_payment_error: {
          code: 'card_declined',
          message: 'Your card was declined',
          type: 'card_error',
          decline_code: 'insufficient_funds',
        } as any,
      } as Stripe.PaymentIntent;

      const mockEvent: Stripe.Event = {
        id: 'evt_test_payment_failed',
        object: 'event',
        api_version: '2025-10-29.clover',
        created: Math.floor(Date.now() / 1000) - 60,
        data: { object: mockPaymentIntent },
        livemode: false,
        pending_webhooks: 0,
        request: null,
        type: 'payment_intent.payment_failed',
      };

      mockConstructEvent.mockReturnValue(mockEvent);

      const mockEq = vi.fn().mockResolvedValue({ data: {}, error: null });
      const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq });

      mockSupabaseClient.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: null, error: null }),
          }),
        }),
        insert: vi.fn().mockResolvedValue({ data: {}, error: null }),
        update: mockUpdate,
      });

      const request = new NextRequest('http://localhost:3000/api/webhooks/stripe', {
        method: 'POST',
        body: JSON.stringify(mockEvent),
        headers: {
          'stripe-signature': 'test_signature',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.received).toBe(true);

      // Verify update chain was called correctly
      expect(mockUpdate).toHaveBeenCalled();
      expect(mockEq).toHaveBeenCalledWith('payment_intent_id', 'pi_test_failed');
    });

    it('should still return 200 even if payment failure update fails', async () => {
      const mockPaymentIntent: Stripe.PaymentIntent = {
        id: 'pi_test_update_fail',
        object: 'payment_intent',
        amount: 2999,
        currency: 'eur',
        status: 'requires_payment_method',
        metadata: { orderId: 'order-123' },
        last_payment_error: {
          code: 'card_declined',
          message: 'Your card was declined',
          type: 'card_error',
        } as any,
      } as Stripe.PaymentIntent;

      const mockEvent: Stripe.Event = {
        id: 'evt_test_update_fail',
        object: 'event',
        api_version: '2025-10-29.clover',
        created: Math.floor(Date.now() / 1000) - 60,
        data: { object: mockPaymentIntent },
        livemode: false,
        pending_webhooks: 0,
        request: null,
        type: 'payment_intent.payment_failed',
      };

      mockConstructEvent.mockReturnValue(mockEvent);

      // Mock update failure
      mockSupabaseClient.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: null, error: null }),
          }),
        }),
        insert: vi.fn().mockResolvedValue({ data: {}, error: null }),
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: null,
            error: { message: 'Update failed' },
          }),
        }),
      });

      const request = new NextRequest('http://localhost:3000/api/webhooks/stripe', {
        method: 'POST',
        body: JSON.stringify(mockEvent),
        headers: {
          'stripe-signature': 'test_signature',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      // Should still return 200 to prevent retries
      expect(response.status).toBe(200);
      expect(data.received).toBe(true);
    });
  });

  describe('Event Handling: charge.refunded', () => {
    it('should successfully process charge.refunded event', async () => {
      const mockCharge: Stripe.Charge = {
        id: 'ch_test_refunded',
        object: 'charge',
        amount: 2999,
        amount_refunded: 2999,
        currency: 'eur',
        payment_intent: 'pi_test_123',
        refunded: true,
        refunds: {
          object: 'list',
          data: [
            {
              id: 'ref_test_123',
              reason: 'requested_by_customer',
            } as any,
          ],
          has_more: false,
          url: '/v1/charges/ch_test_refunded/refunds',
        },
      } as Stripe.Charge;

      const mockEvent: Stripe.Event = {
        id: 'evt_test_refund',
        object: 'event',
        api_version: '2025-10-29.clover',
        created: Math.floor(Date.now() / 1000) - 60,
        data: { object: mockCharge },
        livemode: false,
        pending_webhooks: 0,
        request: null,
        type: 'charge.refunded',
      };

      mockConstructEvent.mockReturnValue(mockEvent);

      mockSupabaseClient.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: null, error: null }),
          }),
        }),
        insert: vi.fn().mockResolvedValue({ data: {}, error: null }),
      });

      const request = new NextRequest('http://localhost:3000/api/webhooks/stripe', {
        method: 'POST',
        body: JSON.stringify(mockEvent),
        headers: {
          'stripe-signature': 'test_signature',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.received).toBe(true);
    });
  });

  describe('Event Handling: Unhandled Events', () => {
    it('should successfully process unhandled event types', async () => {
      const mockEvent: Stripe.Event = {
        id: 'evt_test_unhandled',
        object: 'event',
        api_version: '2025-10-29.clover',
        created: Math.floor(Date.now() / 1000) - 60,
        data: { object: {} as any },
        livemode: false,
        pending_webhooks: 0,
        request: null,
        type: 'customer.created',
      };

      mockConstructEvent.mockReturnValue(mockEvent);

      mockSupabaseClient.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: null, error: null }),
          }),
        }),
        insert: vi.fn().mockResolvedValue({ data: {}, error: null }),
      });

      const request = new NextRequest('http://localhost:3000/api/webhooks/stripe', {
        method: 'POST',
        body: JSON.stringify(mockEvent),
        headers: {
          'stripe-signature': 'test_signature',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.received).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should return 500 on unexpected processing errors', async () => {
      // Mock valid signature verification
      const mockEvent: Stripe.Event = {
        id: 'evt_test_error',
        object: 'event',
        api_version: '2025-10-29.clover',
        created: Math.floor(Date.now() / 1000) - 60,
        data: { object: {} as any },
        livemode: false,
        pending_webhooks: 0,
        request: null,
        type: 'payment_intent.succeeded',
      };

      mockConstructEvent.mockReturnValue(mockEvent);

      // Mock Supabase to throw unexpected error
      mockSupabaseClient.from.mockImplementation(() => {
        throw new Error('Unexpected database catastrophe');
      });

      const request = new NextRequest('http://localhost:3000/api/webhooks/stripe', {
        method: 'POST',
        body: JSON.stringify(mockEvent),
        headers: {
          'stripe-signature': 'test_signature',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Webhook processing failed');
    });
  });
});
