import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from '@/app/api/create-payment-intent/route';
import { createMockSupabaseClient, createMockStripe, createMockNextRequest } from '../mocks';

// Mock modules
vi.mock('@/lib/supabase-server', () => ({
  createServerSupabaseClient: () => createMockSupabaseClient(),
}));

vi.mock('stripe', () => ({
  default: vi.fn(() => createMockStripe()),
}));

vi.mock('next/headers', () => ({
  cookies: () => ({ get: vi.fn(), set: vi.fn() }),
}));

describe('/api/create-payment-intent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create a payment intent successfully', async () => {
    const request = createMockNextRequest({
      body: {
        lighterData: Array(10).fill({ name: 'Test', backgroundColor: '#FF0000', language: 'en' }),
        shippingAddress: {
          name: 'Test User',
          email: 'test@example.com',
          address: '123 Test St',
          city: 'Paris',
          postalCode: '75001',
          country: 'FR',
        },
        shippingMethod: 'standard',
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
        lighterData: Array(7).fill({ name: 'Test', backgroundColor: '#FF0000', language: 'en' }), // Invalid: not 10, 20, or 50
        shippingAddress: {
          name: 'Test User',
          email: 'test@example.com',
          address: '123 Test St',
          city: 'Paris',
          postalCode: '75001',
          country: 'FR',
        },
        shippingMethod: 'standard',
      },
    }) as unknown as NextRequest;

    const response = await POST(request);

    expect(response.status).toBe(400);
  });

  it('should require authentication', async () => {
    const mockClient = createMockSupabaseClient();
    mockClient.auth.getSession = vi.fn().mockResolvedValue({
      data: { session: null },
      error: null,
    });

    vi.mock('@/lib/supabase-server', () => ({
      createServerSupabaseClient: () => mockClient,
    }));

    const request = createMockNextRequest({
      body: {
        lighterData: Array(10).fill({ name: 'Test', backgroundColor: '#FF0000', language: 'en' }),
        shippingAddress: {
          name: 'Test User',
          email: 'test@example.com',
          address: '123 Test St',
          city: 'Paris',
          postalCode: '75001',
          country: 'FR',
        },
        shippingMethod: 'standard',
      },
    }) as unknown as NextRequest;

    const response = await POST(request);

    expect(response.status).toBe(401);
  });
});
