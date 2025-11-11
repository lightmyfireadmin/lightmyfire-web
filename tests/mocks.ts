import { vi } from 'vitest';

// Mock Supabase Client
export const createMockSupabaseClient = () => ({
  auth: {
    getSession: vi.fn().mockResolvedValue({
      data: {
        session: {
          user: {
            id: 'test-user-id',
            email: 'test@example.com',
          },
        },
      },
      error: null,
    }),
    getUser: vi.fn().mockResolvedValue({
      data: { user: { id: 'test-user-id', email: 'test@example.com' } },
      error: null,
    }),
  },
  from: vi.fn((table: string) => ({
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: {}, error: null }),
    order: vi.fn().mockReturnThis(),
  })),
  rpc: vi.fn().mockResolvedValue({ data: {}, error: null }),
});

// Mock Stripe
export const createMockStripe = () => ({
  paymentIntents: {
    create: vi.fn().mockResolvedValue({
      id: 'pi_test_123',
      client_secret: 'pi_test_123_secret',
      amount: 1000,
      currency: 'eur',
      status: 'requires_payment_method',
    }),
    retrieve: vi.fn().mockResolvedValue({
      id: 'pi_test_123',
      amount: 1000,
      currency: 'eur',
      status: 'succeeded',
    }),
    list: vi.fn().mockResolvedValue({
      data: [],
      has_more: false,
    }),
  },
  webhooks: {
    constructEvent: vi.fn((payload: unknown, signature: string, secret: string) => ({
      id: 'evt_test_123',
      type: 'payment_intent.succeeded',
      data: {
        object: {
          id: 'pi_test_123',
          amount: 1000,
          currency: 'eur',
        },
      },
    })),
  },
  charges: {
    retrieve: vi.fn().mockResolvedValue({
      id: 'ch_test_123',
      amount: 1000,
      refunded: false,
    }),
  },
});

// Mock Next Request
export const createMockNextRequest = (options: {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
} = {}) => ({
  method: options.method || 'POST',
  json: vi.fn().mockResolvedValue(options.body || {}),
  text: vi.fn().mockResolvedValue(JSON.stringify(options.body || {})),
  headers: {
    get: vi.fn((name: string) => options.headers?.[name] || null),
  },
  nextUrl: {
    origin: 'http://localhost:3000',
  },
});

// Mock cookies
export const createMockCookies = () => ({
  get: vi.fn((name: string) => ({ value: `mock-${name}` })),
  set: vi.fn(),
  delete: vi.fn(),
});
