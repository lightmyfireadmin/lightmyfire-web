import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from '@/app/api/create-payment-intent/route';
import { createMockSupabaseClient, createMockStripe, createMockNextRequest } from '../mocks';

// Create mock instance at module level
const mockSupabaseClient = createMockSupabaseClient();

// Mock modules
vi.mock('@/lib/supabase-server', () => ({
  createServerSupabaseClient: vi.fn(() => mockSupabaseClient),
}));

vi.mock('stripe', () => ({
  default: vi.fn(() => createMockStripe()),
}));

vi.mock('next/headers', () => ({
  cookies: vi.fn(() => ({ get: vi.fn(), set: vi.fn() })),
}));

vi.mock('@/lib/rateLimit', () => ({
  rateLimit: vi.fn(() => ({ success: true })),
}));

describe('/api/create-payment-intent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Set required environment variables
    process.env.RESEND_API_KEY = 'test_resend_key';
    process.env.FULFILLMENT_EMAIL = 'test@fulfillment.com';
    process.env.STRIPE_SECRET_KEY = 'sk_test_mock';
  });

  it('should create a payment intent successfully', async () => {
    const request = createMockNextRequest({
      body: {
        orderId: 'test-order-123',
        cardholderEmail: 'test@example.com',
        packSize: 10,
        shippingRate: 299,
        currency: 'eur',
      },
    }) as unknown as NextRequest;

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.clientSecret).toBeDefined();
    expect(data.paymentIntentId).toBeDefined();
  });

  it('should reject invalid pack sizes', async () => {
    const request = createMockNextRequest({
      body: {
        orderId: 'test-order-123',
        cardholderEmail: 'test@example.com',
        packSize: 7, // Invalid: not 10, 20, or 50
        shippingRate: 299,
        currency: 'eur',
      },
    }) as unknown as NextRequest;

    const response = await POST(request);

    expect(response.status).toBe(400);
  });

  it('should require authentication', async () => {
    // Override the session to return null (unauthenticated)
    mockSupabaseClient.auth.getSession = vi.fn().mockResolvedValue({
      data: { session: null },
      error: null,
    });

    const request = createMockNextRequest({
      body: {
        orderId: 'test-order-123',
        cardholderEmail: 'test@example.com',
        packSize: 10,
        shippingRate: 299,
        currency: 'eur',
      },
    }) as unknown as NextRequest;

    const response = await POST(request);

    expect(response.status).toBe(401);

    // Restore the default session for other tests
    mockSupabaseClient.auth.getSession = vi.fn().mockResolvedValue({
      data: {
        session: {
          user: { id: 'test-user-id', email: 'test@example.com' },
        },
      },
      error: null,
    });
  });
});
