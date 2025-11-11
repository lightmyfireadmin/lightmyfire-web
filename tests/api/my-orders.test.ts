import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from '@/app/api/my-orders/route';

// Mock dependencies
vi.mock('@/lib/supabase-server', () => ({
  createServerSupabaseClient: vi.fn(() => ({
    auth: {
      getSession: vi.fn(),
    },
    from: vi.fn(),
  })),
}));

vi.mock('next/headers', () => ({
  cookies: vi.fn(() => ({})),
}));

vi.mock('@/lib/logger', () => ({
  logger: {
    error: vi.fn(),
  },
}));

import { createServerSupabaseClient } from '@/lib/supabase-server';

describe('/api/my-orders', () => {
  let mockSupabase: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabase = {
      auth: {
        getSession: vi.fn(),
      },
      from: vi.fn(),
    };
    vi.mocked(createServerSupabaseClient).mockReturnValue(mockSupabase);
  });

  describe('Authentication', () => {
    it('should return 401 if user is not authenticated', async () => {
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: null },
      });

      const request = new NextRequest('http://localhost:3000/api/my-orders', {
        method: 'GET',
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('UNAUTHORIZED');
    });

    it('should allow authenticated users to access their orders', async () => {
      mockSupabase.auth.getSession.mockResolvedValue({
        data: {
          session: {
            user: { id: 'user-123' },
          },
        },
      });

      const mockSelect = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      const mockOrder = vi.fn().mockReturnThis();
      const mockRange = vi.fn().mockResolvedValue({ data: [], error: null });

      mockSupabase.from.mockReturnValue({
        select: mockSelect,
        eq: mockEq,
        order: mockOrder,
        range: mockRange,
      });

      // Mock count query
      mockSelect.mockImplementationOnce(() => ({
        eq: vi.fn().mockResolvedValue({ count: 0 }),
      }));

      const request = new NextRequest('http://localhost:3000/api/my-orders', {
        method: 'GET',
      });

      const response = await GET(request);
      expect(response.status).toBe(200);
    });
  });

  describe('Pagination', () => {
    beforeEach(() => {
      mockSupabase.auth.getSession.mockResolvedValue({
        data: {
          session: {
            user: { id: 'user-123' },
          },
        },
      });
    });

    it('should default to page 1 with limit 10', async () => {
      const mockRange = vi.fn().mockResolvedValue({ data: [], error: null });
      const mockOrder = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      const mockSelect = vi.fn().mockReturnThis();

      mockSupabase.from.mockReturnValue({
        select: mockSelect,
        eq: mockEq,
        order: mockOrder,
        range: mockRange,
      });

      // Mock count query
      mockSelect.mockImplementationOnce(() => ({
        eq: vi.fn().mockResolvedValue({ count: 0 }),
      }));

      const request = new NextRequest('http://localhost:3000/api/my-orders', {
        method: 'GET',
      });

      await GET(request);

      // Check that range was called with correct offset (0-9 for first page)
      expect(mockRange).toHaveBeenCalledWith(0, 9);
    });

    it('should respect custom page and limit parameters', async () => {
      const mockRange = vi.fn().mockResolvedValue({ data: [], error: null });
      const mockOrder = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      const mockSelect = vi.fn().mockReturnThis();

      mockSupabase.from.mockReturnValue({
        select: mockSelect,
        eq: mockEq,
        order: mockOrder,
        range: mockRange,
      });

      // Mock count query
      mockSelect.mockImplementationOnce(() => ({
        eq: vi.fn().mockResolvedValue({ count: 100 }),
      }));

      const request = new NextRequest(
        'http://localhost:3000/api/my-orders?page=3&limit=20',
        { method: 'GET' }
      );

      await GET(request);

      // Page 3 with limit 20: offset = (3-1) * 20 = 40, range = 40-59
      expect(mockRange).toHaveBeenCalledWith(40, 59);
    });

    it('should enforce maximum limit of 50', async () => {
      const mockRange = vi.fn().mockResolvedValue({ data: [], error: null });
      const mockOrder = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      const mockSelect = vi.fn().mockReturnThis();

      mockSupabase.from.mockReturnValue({
        select: mockSelect,
        eq: mockEq,
        order: mockOrder,
        range: mockRange,
      });

      // Mock count query
      mockSelect.mockImplementationOnce(() => ({
        eq: vi.fn().mockResolvedValue({ count: 100 }),
      }));

      const request = new NextRequest(
        'http://localhost:3000/api/my-orders?page=1&limit=100', // Try to get 100
        { method: 'GET' }
      );

      await GET(request);

      // Should be capped at 50: range = 0-49
      expect(mockRange).toHaveBeenCalledWith(0, 49);
    });

    it('should return pagination metadata in response', async () => {
      const mockSelect = vi.fn();

      mockSupabase.from.mockReturnValue({
        select: mockSelect,
      });

      // First call: count query
      mockSelect.mockReturnValueOnce({
        eq: vi.fn().mockResolvedValue({ count: 45 }),
      });

      // Second call: data query
      mockSelect.mockReturnValueOnce({
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        range: vi.fn().mockResolvedValue({ data: [], error: null }),
      });

      const request = new NextRequest(
        'http://localhost:3000/api/my-orders?page=2&limit=10',
        { method: 'GET' }
      );

      const response = await GET(request);
      const data = await response.json();

      expect(data.pagination).toBeDefined();
      expect(data.pagination.page).toBe(2);
      expect(data.pagination.pageSize).toBe(10);
      expect(data.pagination.totalItems).toBe(45);
      expect(data.pagination.totalPages).toBe(5);
      expect(data.pagination.hasNextPage).toBe(true);
      expect(data.pagination.hasPrevPage).toBe(true);
    });
  });

  describe('Data Transformation', () => {
    it('should not expose sensitive fields', async () => {
      mockSupabase.auth.getSession.mockResolvedValue({
        data: {
          session: {
            user: { id: 'user-123' },
          },
        },
      });

      const mockOrder = {
        id: 'order-123',
        payment_intent_id: 'pi_secret',
        printful_order_id: 12345,
        sticker_file_url: 'https://secret.pdf',
        lighter_ids: ['lighter-1', 'lighter-2'],
        quantity: 10,
        amount_paid: 2999,
        currency: 'EUR',
        shipping_name: 'John Doe',
        shipping_email: 'john@example.com',
        shipping_address: '123 Main St',
        shipping_city: 'Paris',
        shipping_postal_code: '75001',
        shipping_country: 'FR',
        status: 'shipped',
        tracking_number: 'TRACK123',
        tracking_url: 'https://tracking.com',
        carrier: 'DHL',
        lighter_names: ['Lighter 1', 'Lighter 2'],
        on_hold: false,
        hold_reason: null,
        failure_reason: null,
        cancellation_reason: null,
        created_at: '2025-01-01T00:00:00Z',
        paid_at: '2025-01-01T00:05:00Z',
        shipped_at: '2025-01-02T00:00:00Z',
        delivered_at: null,
      };

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockImplementation((query, options) => {
          if (options?.count === 'exact') {
            return {
              eq: vi.fn().mockResolvedValue({ count: 1 }),
            };
          }
          return {
            eq: vi.fn().mockReturnThis(),
            order: vi.fn().mockReturnThis(),
            range: vi.fn().mockResolvedValue({ data: [mockOrder], error: null }),
          };
        }),
      });

      const request = new NextRequest('http://localhost:3000/api/my-orders', {
        method: 'GET',
      });

      const response = await GET(request);
      const data = await response.json();

      const order = data.data[0];

      // Should NOT expose these fields
      expect(order.payment_intent_id).toBeUndefined();
      expect(order.printful_order_id).toBeUndefined();
      expect(order.sticker_file_url).toBeUndefined();
      expect(order.lighter_ids).toBeUndefined();

      // Should expose these fields
      expect(order.id).toBe('order-123');
      expect(order.orderId).toBe('LMF-order-123');
      expect(order.status).toBe('shipped');
      expect(order.quantity).toBe(10);
      expect(order.amount).toBe(2999);
      expect(order.trackingNumber).toBe('TRACK123');
    });

    it('should transform order data to customer-facing format', async () => {
      mockSupabase.auth.getSession.mockResolvedValue({
        data: {
          session: {
            user: { id: 'user-123' },
          },
        },
      });

      const mockOrder = {
        id: 'order-456',
        quantity: 20,
        amount_paid: 4999,
        currency: 'EUR',
        shipping_name: 'Jane Smith',
        shipping_email: 'jane@example.com',
        shipping_address: '456 Oak Ave',
        shipping_city: 'Lyon',
        shipping_postal_code: '69001',
        shipping_country: 'FR',
        status: 'pending',
        tracking_number: null,
        tracking_url: null,
        carrier: null,
        lighter_names: ['My Lighter'],
        on_hold: false,
        hold_reason: null,
        failure_reason: null,
        cancellation_reason: null,
        created_at: '2025-01-10T00:00:00Z',
        paid_at: '2025-01-10T00:05:00Z',
        shipped_at: null,
        delivered_at: null,
      };

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockImplementation((query, options) => {
          if (options?.count === 'exact') {
            return {
              eq: vi.fn().mockResolvedValue({ count: 1 }),
            };
          }
          return {
            eq: vi.fn().mockReturnThis(),
            order: vi.fn().mockReturnThis(),
            range: vi.fn().mockResolvedValue({ data: [mockOrder], error: null }),
          };
        }),
      });

      const request = new NextRequest('http://localhost:3000/api/my-orders', {
        method: 'GET',
      });

      const response = await GET(request);
      const data = await response.json();

      const order = data.data[0];

      expect(order.orderId).toBe('LMF-order-456');
      expect(order.customerName).toBe('Jane Smith');
      expect(order.customerEmail).toBe('jane@example.com');
      expect(order.shippingAddress.address).toBe('456 Oak Ave');
      expect(order.shippingAddress.city).toBe('Lyon');
      expect(order.lighterNames).toEqual(['My Lighter']);
    });
  });

  describe('Error Handling', () => {
    it('should return 500 on database error', async () => {
      mockSupabase.auth.getSession.mockResolvedValue({
        data: {
          session: {
            user: { id: 'user-123' },
          },
        },
      });

      const mockSelect = vi.fn();
      mockSupabase.from.mockReturnValue({
        select: mockSelect,
      });

      // First call: count query succeeds
      mockSelect.mockReturnValueOnce({
        eq: vi.fn().mockResolvedValue({ count: 10 }),
      });

      // Second call: orders query fails
      mockSelect.mockReturnValueOnce({
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        range: vi.fn().mockResolvedValue({
          data: null,
          error: { message: 'Database connection failed' },
        }),
      });

      const request = new NextRequest('http://localhost:3000/api/my-orders', {
        method: 'GET',
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('DATABASE_ERROR');
    });
  });

  describe('Response Format', () => {
    it('should return standardized paginated response format', async () => {
      mockSupabase.auth.getSession.mockResolvedValue({
        data: {
          session: {
            user: { id: 'user-123' },
          },
        },
      });

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockImplementation((query, options) => {
          if (options?.count === 'exact') {
            return {
              eq: vi.fn().mockResolvedValue({ count: 5 }),
            };
          }
          return {
            eq: vi.fn().mockReturnThis(),
            order: vi.fn().mockReturnThis(),
            range: vi.fn().mockResolvedValue({ data: [], error: null }),
          };
        }),
      });

      const request = new NextRequest('http://localhost:3000/api/my-orders', {
        method: 'GET',
      });

      const response = await GET(request);
      const data = await response.json();

      // Check standard paginated response format
      expect(data).toHaveProperty('success');
      expect(data).toHaveProperty('data');
      expect(data).toHaveProperty('pagination');
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
    });
  });
});
