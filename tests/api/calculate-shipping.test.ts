import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from '@/app/api/calculate-shipping/route';

// Mock external dependencies
vi.mock('@/lib/rateLimit', () => ({
  rateLimit: vi.fn(() => ({ success: true })),
}));

vi.mock('@/lib/printful', () => ({
  printful: {
    calculateShipping: vi.fn(),
  },
  LIGHTMYFIRE_PRINTFUL_CONFIG: {
    STICKER_SHEET_VARIANT_ID: 9413,
  },
}));

vi.mock('@/lib/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  },
}));

vi.mock('@/lib/cache', () => ({
  withCache: vi.fn((key, fn) => fn()), // Pass through without caching in tests
  generateCacheKey: vi.fn((prefix, ...args) => `${prefix}:${args.join(':')}`),
  CacheTTL: {
    MEDIUM: 300,
  },
}));

import { rateLimit } from '@/lib/rateLimit';
import { printful } from '@/lib/printful';

describe('/api/calculate-shipping', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Validation', () => {
    it('should return error if country code is missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/calculate-shipping', {
        method: 'POST',
        body: JSON.stringify({ packSize: 10 }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('VALIDATION_ERROR');
      expect(data.error.message).toContain('Country code is required');
    });

    it('should return error for invalid pack size', async () => {
      const request = new NextRequest('http://localhost:3000/api/calculate-shipping', {
        method: 'POST',
        body: JSON.stringify({ countryCode: 'FR', packSize: 15 }), // Invalid size
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('VALIDATION_ERROR');
      expect(data.error.message).toContain('Invalid pack size');
      expect(data.error.details.validSizes).toEqual([10, 20, 50]);
    });

    it('should accept valid pack sizes (10, 20, 50)', async () => {
      vi.mocked(printful.calculateShipping).mockResolvedValue([
        {
          id: 'STANDARD',
          name: 'Standard Shipping',
          rate: '2.99',
          minDeliveryDays: 7,
          maxDeliveryDays: 14,
          currency: 'EUR',
        },
      ]);

      for (const packSize of [10, 20, 50]) {
        const request = new NextRequest('http://localhost:3000/api/calculate-shipping', {
          method: 'POST',
          body: JSON.stringify({ countryCode: 'FR', packSize }),
        });

        const response = await POST(request);
        expect(response.status).toBe(200);
      }
    });
  });

  describe('Rate Limiting', () => {
    it('should return 429 when rate limit exceeded', async () => {
      vi.mocked(rateLimit).mockReturnValueOnce({
        success: false,
        resetTime: Date.now() + 60000,
      });

      const request = new NextRequest('http://localhost:3000/api/calculate-shipping', {
        method: 'POST',
        body: JSON.stringify({ countryCode: 'FR', packSize: 10 }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(429);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('RATE_LIMIT_EXCEEDED');
    });
  });

  describe('Printful Integration', () => {
    it('should return shipping rates from Printful when API is available', async () => {
      const mockRates = [
        {
          id: 'STANDARD',
          name: 'Standard Shipping',
          rate: '2.99',
          minDeliveryDays: 7,
          maxDeliveryDays: 14,
          currency: 'EUR',
        },
        {
          id: 'EXPRESS',
          name: 'Express Shipping',
          rate: '5.99',
          minDeliveryDays: 3,
          maxDeliveryDays: 5,
          currency: 'EUR',
        },
      ];

      vi.mocked(printful.calculateShipping).mockResolvedValue(mockRates);

      const request = new NextRequest('http://localhost:3000/api/calculate-shipping', {
        method: 'POST',
        body: JSON.stringify({ countryCode: 'FR', packSize: 10 }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.rates.standard.rate).toBe(299); // Cents
      expect(data.data.rates.express.rate).toBe(599); // Cents
      expect(data.data.usedFallback).toBe(false);
    });

    it('should use fallback rates when Printful API fails', async () => {
      vi.mocked(printful.calculateShipping).mockRejectedValue(
        new Error('Printful API unavailable')
      );

      const request = new NextRequest('http://localhost:3000/api/calculate-shipping', {
        method: 'POST',
        body: JSON.stringify({ countryCode: 'FR', packSize: 10 }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.usedFallback).toBe(true);
      expect(data.data.rates.standard.rate).toBe(299); // Fallback rate for FR
      expect(data.data.rates.express.rate).toBe(599);
    });

    it('should use DEFAULT fallback rates for unknown countries', async () => {
      vi.mocked(printful.calculateShipping).mockRejectedValue(
        new Error('Printful API unavailable')
      );

      const request = new NextRequest('http://localhost:3000/api/calculate-shipping', {
        method: 'POST',
        body: JSON.stringify({ countryCode: 'XX', packSize: 10 }), // Unknown country
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.usedFallback).toBe(true);
      expect(data.data.rates.standard.rate).toBe(599); // DEFAULT fallback
      expect(data.data.rates.express.rate).toBe(1199);
    });
  });

  describe('Pack Size Multipliers', () => {
    it('should apply size multiplier for larger packs when using fallback', async () => {
      vi.mocked(printful.calculateShipping).mockRejectedValue(
        new Error('Printful API unavailable')
      );

      // Pack size 50 should have 1.2x multiplier
      const request = new NextRequest('http://localhost:3000/api/calculate-shipping', {
        method: 'POST',
        body: JSON.stringify({ countryCode: 'FR', packSize: 50 }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      // Base FR rate is 299, with 1.2x multiplier = 358.8 → 359
      expect(data.data.rates.standard.rate).toBeGreaterThan(299);
    });
  });

  describe('Response Format', () => {
    it('should return standardized API response format', async () => {
      vi.mocked(printful.calculateShipping).mockResolvedValue([
        {
          id: 'STANDARD',
          name: 'Standard Shipping',
          rate: '2.99',
          minDeliveryDays: 7,
          maxDeliveryDays: 14,
          currency: 'EUR',
        },
      ]);

      const request = new NextRequest('http://localhost:3000/api/calculate-shipping', {
        method: 'POST',
        body: JSON.stringify({ countryCode: 'FR', packSize: 10 }),
      });

      const response = await POST(request);
      const data = await response.json();

      // Check standard API response format
      expect(data).toHaveProperty('success');
      expect(data).toHaveProperty('data');
      expect(data).toHaveProperty('message');
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('rates');
      expect(data.data.rates).toHaveProperty('standard');
      expect(data.data.rates).toHaveProperty('express');
    });

    it('should include currency and estimated days in response', async () => {
      vi.mocked(printful.calculateShipping).mockResolvedValue([
        {
          id: 'STANDARD',
          name: 'Standard Shipping',
          rate: '2.99',
          minDeliveryDays: 7,
          maxDeliveryDays: 14,
          currency: 'EUR',
        },
      ]);

      const request = new NextRequest('http://localhost:3000/api/calculate-shipping', {
        method: 'POST',
        body: JSON.stringify({ countryCode: 'FR', packSize: 10 }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(data.data.rates.standard.currency).toBe('EUR');
      expect(data.data.rates.standard.estimatedDays).toBe('7-14');
    });
  });

  describe('Error Handling', () => {
    it('should return 500 on unexpected errors', async () => {
      // Mock request.json() to throw an error
      const request = new NextRequest('http://localhost:3000/api/calculate-shipping', {
        method: 'POST',
        body: JSON.stringify({ countryCode: 'FR', packSize: 10 }),
      });

      // Mock request.json to throw
      vi.spyOn(request, 'json').mockRejectedValue(new Error('JSON parse catastrophic failure'));

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('INTERNAL_SERVER_ERROR');
    });
  });
});
