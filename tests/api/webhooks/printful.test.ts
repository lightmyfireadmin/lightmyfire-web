import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST, GET } from '@/app/api/webhooks/printful/route';

// Mock Printful verification
vi.mock('@/lib/printful', () => ({
  verifyPrintfulWebhook: vi.fn(),
  getPrintfulOrderStatus: vi.fn(),
}));

// Import mocked functions
import { verifyPrintfulWebhook, getPrintfulOrderStatus } from '@/lib/printful';
const mockVerifyPrintfulWebhook = vi.mocked(verifyPrintfulWebhook);
const mockGetPrintfulOrderStatus = vi.mocked(getPrintfulOrderStatus);

// Mock Supabase
const mockSupabaseClient = {
  from: vi.fn(),
};

vi.mock('@/lib/supabase-server', () => ({
  createServerSupabaseClient: vi.fn(() => mockSupabaseClient),
}));

vi.mock('next/headers', () => ({
  cookies: vi.fn(() => ({ get: vi.fn(), set: vi.fn() })),
}));

// Mock email
vi.mock('@/lib/email', () => ({
  sendOrderShippedEmail: vi.fn(),
  sendCustomEmail: vi.fn().mockResolvedValue({}),
}));

import { sendOrderShippedEmail } from '@/lib/email';
const mockSendOrderShippedEmail = vi.mocked(sendOrderShippedEmail);

// Mock logger
vi.mock('@/lib/logger', () => ({
  logger: {
    event: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

describe('/api/webhooks/printful POST', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Signature Verification', () => {
    it('should return 401 if signature header is missing', async () => {
      const payload = {
        type: 'package_shipped',
        created: Math.floor(Date.now() / 1000),
        retries: 0,
        store: 123,
        data: {},
      };

      const request = new NextRequest('http://localhost:3000/api/webhooks/printful', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Invalid signature');
    });

    it('should return 401 if signature is invalid', async () => {
      mockVerifyPrintfulWebhook.mockReturnValue(false);

      const payload = {
        type: 'package_shipped',
        created: Math.floor(Date.now() / 1000),
        retries: 0,
        store: 123,
        data: {},
      };

      const request = new NextRequest('http://localhost:3000/api/webhooks/printful', {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: {
          'x-pf-signature': 'invalid_signature',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Invalid signature');
    });
  });

  describe('Timestamp Validation', () => {
    it('should reject webhooks older than 5 minutes', async () => {
      mockVerifyPrintfulWebhook.mockReturnValue(true);

      const oldTimestamp = Math.floor(Date.now() / 1000) - 400; // 6 minutes 40 seconds ago

      const payload = {
        type: 'package_shipped',
        created: oldTimestamp,
        retries: 0,
        store: 123,
        data: {},
      };

      const request = new NextRequest('http://localhost:3000/api/webhooks/printful', {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: {
          'x-pf-signature': 'valid_signature',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Webhook timestamp expired');
    });

    it('should reject webhooks with timestamp more than 1 minute in future', async () => {
      mockVerifyPrintfulWebhook.mockReturnValue(true);

      const futureTimestamp = Math.floor(Date.now() / 1000) + 120; // 2 minutes in future

      const payload = {
        type: 'package_shipped',
        created: futureTimestamp,
        retries: 0,
        store: 123,
        data: {},
      };

      const request = new NextRequest('http://localhost:3000/api/webhooks/printful', {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: {
          'x-pf-signature': 'valid_signature',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Invalid webhook timestamp');
    });

    it('should accept webhooks within valid time range', async () => {
      mockVerifyPrintfulWebhook.mockReturnValue(true);

      const validTimestamp = Math.floor(Date.now() / 1000) - 60; // 1 minute ago

      const payload = {
        type: 'package_shipped',
        created: validTimestamp,
        retries: 0,
        store: 123,
        data: {
          order: { id: 12345, external_id: 'order-123', status: 'shipped' },
          shipment: {
            id: 1,
            carrier: 'DHL',
            service: 'Express',
            tracking_number: 'TRACK123',
            tracking_url: 'https://tracking.com/TRACK123',
            ship_date: '2025-01-01',
            shipped_at: validTimestamp,
            reshipment: false,
          },
        },
      };

      // Mock idempotency check - not processed yet
      mockSupabaseClient.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: null, error: null }),
          }),
        }),
        insert: vi.fn().mockResolvedValue({ data: {}, error: null }),
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ data: {}, error: null }),
        }),
      });

      const request = new NextRequest('http://localhost:3000/api/webhooks/printful', {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: {
          'x-pf-signature': 'valid_signature',
        },
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
    });
  });

  describe('Idempotency', () => {
    it('should return 200 if webhook was already processed', async () => {
      mockVerifyPrintfulWebhook.mockReturnValue(true);

      const validTimestamp = Math.floor(Date.now() / 1000) - 60;

      const payload = {
        type: 'package_shipped',
        created: validTimestamp,
        retries: 0,
        store: 123,
        data: {
          order: { id: 12345, external_id: 'order-123', status: 'shipped' },
        },
      };

      // Mock idempotency check - already processed
      mockSupabaseClient.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { id: 'webhook-123', webhook_id: 'printful_package_shipped_12345' },
              error: null,
            }),
          }),
        }),
      });

      const request = new NextRequest('http://localhost:3000/api/webhooks/printful', {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: {
          'x-pf-signature': 'valid_signature',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.already_processed).toBe(true);
    });
  });

  describe('Event Handling: package_shipped', () => {
    it('should successfully process package_shipped event', async () => {
      mockVerifyPrintfulWebhook.mockReturnValue(true);
      mockSendOrderShippedEmail.mockResolvedValue({});

      const validTimestamp = Math.floor(Date.now() / 1000) - 60;

      const payload = {
        type: 'package_shipped',
        created: validTimestamp,
        retries: 0,
        store: 123,
        data: {
          order: { id: 12345, external_id: 'order-123', status: 'shipped' },
          shipment: {
            id: 1,
            carrier: 'DHL',
            service: 'Express',
            tracking_number: 'TRACK123',
            tracking_url: 'https://tracking.com/TRACK123',
            ship_date: '2025-01-01',
            shipped_at: validTimestamp,
            reshipment: false,
          },
        },
      };

      const mockStickerOrder = {
        id: 'order-123',
        shipping_email: 'customer@example.com',
        shipping_name: 'John Doe',
        quantity: 10,
        lighter_names: ['Lighter 1'],
      };

      const mockSelectSingle = vi.fn().mockResolvedValue({ data: mockStickerOrder, error: null });
      const mockUpdate = vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: {}, error: null }),
      });

      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'webhook_events') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({ data: null, error: null }),
              }),
            }),
            insert: vi.fn().mockResolvedValue({ data: {}, error: null }),
          };
        }
        // sticker_orders table
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({ single: mockSelectSingle }),
          }),
          update: mockUpdate,
        };
      });

      const request = new NextRequest('http://localhost:3000/api/webhooks/printful', {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: {
          'x-pf-signature': 'valid_signature',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(mockSendOrderShippedEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          orderId: 'order-123',
          customerEmail: 'customer@example.com',
          customerName: 'John Doe',
          trackingNumber: 'TRACK123',
        })
      );
    });

    it('should handle missing order data in package_shipped', async () => {
      mockVerifyPrintfulWebhook.mockReturnValue(true);

      const validTimestamp = Math.floor(Date.now() / 1000) - 60;

      const payload = {
        type: 'package_shipped',
        created: validTimestamp,
        retries: 0,
        store: 123,
        data: {}, // Missing order and shipment
      };

      mockSupabaseClient.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: null, error: null }),
          }),
        }),
        insert: vi.fn().mockResolvedValue({ data: {}, error: null }),
      });

      const request = new NextRequest('http://localhost:3000/api/webhooks/printful', {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: {
          'x-pf-signature': 'valid_signature',
        },
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
      expect(mockSendOrderShippedEmail).not.toHaveBeenCalled();
    });
  });

  describe('Event Handling: package_returned', () => {
    it('should successfully process package_returned event', async () => {
      mockVerifyPrintfulWebhook.mockReturnValue(true);

      const validTimestamp = Math.floor(Date.now() / 1000) - 60;

      const payload = {
        type: 'package_returned',
        created: validTimestamp,
        retries: 0,
        store: 123,
        data: {
          order: { id: 12345, external_id: 'order-123', status: 'returned' },
        },
      };

      const mockUpdate = vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: {}, error: null }),
      });

      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'webhook_events') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({ data: null, error: null }),
              }),
            }),
            insert: vi.fn().mockResolvedValue({ data: {}, error: null }),
          };
        }
        return { update: mockUpdate };
      });

      const request = new NextRequest('http://localhost:3000/api/webhooks/printful', {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: {
          'x-pf-signature': 'valid_signature',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });
  });

  describe('Event Handling: order_failed', () => {
    it('should successfully process order_failed event', async () => {
      mockVerifyPrintfulWebhook.mockReturnValue(true);

      const validTimestamp = Math.floor(Date.now() / 1000) - 60;

      const payload = {
        type: 'order_failed',
        created: validTimestamp,
        retries: 0,
        store: 123,
        data: {
          order: { id: 12345, external_id: 'order-123', status: 'failed' },
          reason: 'Out of stock',
        },
      };

      const mockStickerOrder = {
        id: 'order-123',
        shipping_email: 'customer@example.com',
        shipping_name: 'John Doe',
        quantity: 10,
        payment_intent_id: 'pi_test_123',
      };

      const mockSelectSingle = vi.fn().mockResolvedValue({ data: mockStickerOrder, error: null });
      const mockUpdate = vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: {}, error: null }),
      });

      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'webhook_events') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({ data: null, error: null }),
              }),
            }),
            insert: vi.fn().mockResolvedValue({ data: {}, error: null }),
          };
        }
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({ single: mockSelectSingle }),
          }),
          update: mockUpdate,
        };
      });

      const request = new NextRequest('http://localhost:3000/api/webhooks/printful', {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: {
          'x-pf-signature': 'valid_signature',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });
  });

  describe('Event Handling: order_canceled', () => {
    it('should successfully process order_canceled event', async () => {
      mockVerifyPrintfulWebhook.mockReturnValue(true);

      const validTimestamp = Math.floor(Date.now() / 1000) - 60;

      const payload = {
        type: 'order_canceled',
        created: validTimestamp,
        retries: 0,
        store: 123,
        data: {
          order: { id: 12345, external_id: 'order-123', status: 'canceled' },
          reason: 'Customer request',
        },
      };

      const mockStickerOrder = {
        id: 'order-123',
        shipping_email: 'customer@example.com',
        shipping_name: 'John Doe',
        quantity: 10,
        payment_intent_id: 'pi_test_123',
      };

      const mockSelectSingle = vi.fn().mockResolvedValue({ data: mockStickerOrder, error: null });
      const mockUpdate = vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: {}, error: null }),
      });

      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'webhook_events') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({ data: null, error: null }),
              }),
            }),
            insert: vi.fn().mockResolvedValue({ data: {}, error: null }),
          };
        }
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({ single: mockSelectSingle }),
          }),
          update: mockUpdate,
        };
      });

      const request = new NextRequest('http://localhost:3000/api/webhooks/printful', {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: {
          'x-pf-signature': 'valid_signature',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });
  });

  describe('Event Handling: order hold status', () => {
    it('should successfully process order_put_hold event', async () => {
      mockVerifyPrintfulWebhook.mockReturnValue(true);

      const validTimestamp = Math.floor(Date.now() / 1000) - 60;

      const payload = {
        type: 'order_put_hold',
        created: validTimestamp,
        retries: 0,
        store: 123,
        data: {
          order: { id: 12345, external_id: 'order-123', status: 'onhold' },
          reason: 'Payment verification required',
        },
      };

      const mockStickerOrder = {
        id: 'order-123',
        shipping_email: 'customer@example.com',
        shipping_name: 'John Doe',
        quantity: 10,
        payment_intent_id: 'pi_test_123',
      };

      const mockSelectSingle = vi.fn().mockResolvedValue({ data: mockStickerOrder, error: null });
      const mockUpdate = vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: {}, error: null }),
      });

      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'webhook_events') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({ data: null, error: null }),
              }),
            }),
            insert: vi.fn().mockResolvedValue({ data: {}, error: null }),
          };
        }
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({ single: mockSelectSingle }),
          }),
          update: mockUpdate,
        };
      });

      const request = new NextRequest('http://localhost:3000/api/webhooks/printful', {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: {
          'x-pf-signature': 'valid_signature',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it('should successfully process order_remove_hold event', async () => {
      mockVerifyPrintfulWebhook.mockReturnValue(true);

      const validTimestamp = Math.floor(Date.now() / 1000) - 60;

      const payload = {
        type: 'order_remove_hold',
        created: validTimestamp,
        retries: 0,
        store: 123,
        data: {
          order: { id: 12345, external_id: 'order-123', status: 'pending' },
        },
      };

      const mockStickerOrder = {
        id: 'order-123',
        shipping_email: 'customer@example.com',
        shipping_name: 'John Doe',
        quantity: 10,
        payment_intent_id: 'pi_test_123',
      };

      const mockSelectSingle = vi.fn().mockResolvedValue({ data: mockStickerOrder, error: null });
      const mockUpdate = vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: {}, error: null }),
      });

      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'webhook_events') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({ data: null, error: null }),
              }),
            }),
            insert: vi.fn().mockResolvedValue({ data: {}, error: null }),
          };
        }
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({ single: mockSelectSingle }),
          }),
          update: mockUpdate,
        };
      });

      const request = new NextRequest('http://localhost:3000/api/webhooks/printful', {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: {
          'x-pf-signature': 'valid_signature',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });
  });

  describe('Event Handling: order_updated', () => {
    it('should successfully process order_updated event', async () => {
      mockVerifyPrintfulWebhook.mockReturnValue(true);
      mockGetPrintfulOrderStatus.mockResolvedValue({ status: 'pending', id: 12345 });

      const validTimestamp = Math.floor(Date.now() / 1000) - 60;

      const payload = {
        type: 'order_updated',
        created: validTimestamp,
        retries: 0,
        store: 123,
        data: {
          order: { id: 12345, external_id: 'order-123', status: 'pending' },
        },
      };

      const mockUpdate = vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: {}, error: null }),
      });

      mockSupabaseClient.from.mockImplementation((table: string) => {
        if (table === 'webhook_events') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({ data: null, error: null }),
              }),
            }),
            insert: vi.fn().mockResolvedValue({ data: {}, error: null }),
          };
        }
        return { update: mockUpdate };
      });

      const request = new NextRequest('http://localhost:3000/api/webhooks/printful', {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: {
          'x-pf-signature': 'valid_signature',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(mockGetPrintfulOrderStatus).toHaveBeenCalledWith(12345);
    });
  });

  describe('Event Handling: Unhandled Events', () => {
    it('should successfully process unhandled event types', async () => {
      mockVerifyPrintfulWebhook.mockReturnValue(true);

      const validTimestamp = Math.floor(Date.now() / 1000) - 60;

      const payload = {
        type: 'product_synced' as any,
        created: validTimestamp,
        retries: 0,
        store: 123,
        data: {},
      };

      mockSupabaseClient.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: null, error: null }),
          }),
        }),
        insert: vi.fn().mockResolvedValue({ data: {}, error: null }),
      });

      const request = new NextRequest('http://localhost:3000/api/webhooks/printful', {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: {
          'x-pf-signature': 'valid_signature',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should return 200 even on processing errors to prevent retries', async () => {
      mockVerifyPrintfulWebhook.mockReturnValue(true);

      const validTimestamp = Math.floor(Date.now() / 1000) - 60;

      const payload = {
        type: 'package_shipped',
        created: validTimestamp,
        retries: 0,
        store: 123,
        data: {
          order: { id: 12345, external_id: 'order-123', status: 'shipped' },
        },
      };

      // Mock Supabase to throw error
      mockSupabaseClient.from.mockImplementation(() => {
        throw new Error('Database catastrophe');
      });

      const request = new NextRequest('http://localhost:3000/api/webhooks/printful', {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: {
          'x-pf-signature': 'valid_signature',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      // Should still return 200 to prevent Printful from retrying
      expect(response.status).toBe(200);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Processing error');
    });
  });
});

describe('/api/webhooks/printful GET', () => {
  const originalEnv = process.env.NODE_ENV;

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
  });

  it('should return 403 in production', async () => {
    process.env.NODE_ENV = 'production';

    const request = new NextRequest('http://localhost:3000/api/webhooks/printful?orderId=12345', {
      method: 'GET',
    });

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error).toBe('Not available in production');
  });

  it('should return 400 if orderId is missing', async () => {
    process.env.NODE_ENV = 'development';

    const request = new NextRequest('http://localhost:3000/api/webhooks/printful', {
      method: 'GET',
    });

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Missing orderId parameter');
  });

  it('should return order status successfully', async () => {
    process.env.NODE_ENV = 'development';
    mockGetPrintfulOrderStatus.mockResolvedValue({ status: 'pending', id: 12345 });

    const request = new NextRequest('http://localhost:3000/api/webhooks/printful?orderId=12345', {
      method: 'GET',
    });

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.status).toEqual({ status: 'pending', id: 12345 });
    expect(mockGetPrintfulOrderStatus).toHaveBeenCalledWith(12345);
  });

  it('should return 500 on error', async () => {
    process.env.NODE_ENV = 'development';
    mockGetPrintfulOrderStatus.mockRejectedValue(new Error('API failure'));

    const request = new NextRequest('http://localhost:3000/api/webhooks/printful?orderId=12345', {
      method: 'GET',
    });

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error).toBe('API failure');
  });
});
