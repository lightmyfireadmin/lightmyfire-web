import { describe, it, expect } from 'vitest';
import { NextRequest } from 'next/server';
import { rateLimit } from '@/lib/rateLimit';

describe('rateLimit', () => {
  // Use unique IPs for each test to avoid state collision
  let testCounter = 0;
  const getUniqueIP = () => `10.${Math.floor(testCounter / 255)}.${testCounter++ % 255}.1`;

  const createMockRequest = (ip?: string): NextRequest => {
    const headers: Record<string, string> = {};
    if (ip) {
      headers['x-forwarded-for'] = ip;
    }
    return new NextRequest('http://localhost:3000/api/test', {
      method: 'POST',
      headers,
    });
  };

  describe('IP-based Rate Limiting', () => {
    it('should allow first request', () => {
      const request = createMockRequest(getUniqueIP());
      const result = rateLimit(request, 'default');

      expect(result.success).toBe(true);
      expect(result.remaining).toBe(29); // 30 - 1 = 29
    });

    it('should track requests per IP', () => {
      const ip = getUniqueIP();
      const request = createMockRequest(ip);

      // First request
      const result1 = rateLimit(request, 'default');
      expect(result1.success).toBe(true);
      expect(result1.remaining).toBe(29);

      // Second request
      const result2 = rateLimit(request, 'default');
      expect(result2.success).toBe(true);
      expect(result2.remaining).toBe(28);
    });

    it('should isolate different IPs', () => {
      const request1 = createMockRequest(getUniqueIP());
      const request2 = createMockRequest(getUniqueIP());

      rateLimit(request1, 'default');
      rateLimit(request1, 'default');

      const result = rateLimit(request2, 'default');
      expect(result.success).toBe(true);
      expect(result.remaining).toBe(29); // Fresh IP
    });

    it('should use x-real-ip header if x-forwarded-for is missing', () => {
      const request = new NextRequest('http://localhost:3000/api/test', {
        method: 'POST',
        headers: {
          'x-real-ip': getUniqueIP(),
        },
      });

      const result = rateLimit(request, 'default');
      expect(result.success).toBe(true);
    });

    it('should handle multiple IPs in x-forwarded-for (use first)', () => {
      const ip = getUniqueIP();
      const request = new NextRequest('http://localhost:3000/api/test', {
        method: 'POST',
        headers: {
          'x-forwarded-for': `${ip}, 10.0.0.1, 172.16.0.1`,
        },
      });

      const result1 = rateLimit(request, 'default');
      const result2 = rateLimit(request, 'default');

      expect(result1.remaining).toBe(29);
      expect(result2.remaining).toBe(28);
    });

    it('should use "unknown" if no IP headers present', () => {
      const request = new NextRequest('http://localhost:3000/api/test', {
        method: 'POST',
      });

      const result = rateLimit(request, 'default');
      expect(result.success).toBe(true);
    });
  });

  describe('Identifier-based Rate Limiting', () => {
    it('should use identifier instead of IP when provided', () => {
      const request = createMockRequest(getUniqueIP());
      const identifier = `test-user-${testCounter++}`;

      const result1 = rateLimit(request, 'payment', identifier);
      expect(result1.success).toBe(true);
      expect(result1.remaining).toBe(4); // Payment limit is 5

      const result2 = rateLimit(request, 'payment', identifier);
      expect(result2.success).toBe(true);
      expect(result2.remaining).toBe(3);
    });

    it('should isolate different identifiers', () => {
      const request = createMockRequest(getUniqueIP());
      const id1 = `test-user-${testCounter++}`;
      const id2 = `test-user-${testCounter++}`;

      rateLimit(request, 'payment', id1);
      rateLimit(request, 'payment', id1);

      const result = rateLimit(request, 'payment', id2);
      expect(result.success).toBe(true);
      expect(result.remaining).toBe(4); // Fresh identifier
    });
  });

  describe('Rate Limit Types', () => {
    it('should enforce payment limit (5 requests per minute)', () => {
      const request = createMockRequest(getUniqueIP());

      // Make 5 requests (limit)
      for (let i = 0; i < 5; i++) {
        const result = rateLimit(request, 'payment');
        expect(result.success).toBe(true);
      }

      // 6th request should be blocked
      const result = rateLimit(request, 'payment');
      expect(result.success).toBe(false);
      expect(result.remaining).toBe(0);
    });

    it('should enforce moderation limit (10 requests per minute)', () => {
      const request = createMockRequest(getUniqueIP());

      // Make 10 requests (limit)
      for (let i = 0; i < 10; i++) {
        const result = rateLimit(request, 'moderation');
        expect(result.success).toBe(true);
      }

      // 11th request should be blocked
      const result = rateLimit(request, 'moderation');
      expect(result.success).toBe(false);
    });

    it('should enforce youtube limit (20 requests per minute)', () => {
      const request = createMockRequest(getUniqueIP());

      // Make 20 requests (limit)
      for (let i = 0; i < 20; i++) {
        rateLimit(request, 'youtube');
      }

      const result = rateLimit(request, 'youtube');
      expect(result.success).toBe(false);
    });

    it('should enforce admin limit (50 requests per minute)', () => {
      const request = createMockRequest(getUniqueIP());

      // Make 50 requests (limit)
      for (let i = 0; i < 50; i++) {
        rateLimit(request, 'admin');
      }

      const result = rateLimit(request, 'admin');
      expect(result.success).toBe(false);
    });

    it('should enforce contact limit (3 requests per hour)', () => {
      const request = createMockRequest(getUniqueIP());

      // Make 3 requests (limit)
      for (let i = 0; i < 3; i++) {
        const result = rateLimit(request, 'contact');
        expect(result.success).toBe(true);
      }

      // 4th request should be blocked
      const result = rateLimit(request, 'contact');
      expect(result.success).toBe(false);
    });

    it('should enforce shipping limit (30 requests per minute)', () => {
      const request = createMockRequest(getUniqueIP());

      // Make 30 requests (limit)
      for (let i = 0; i < 30; i++) {
        rateLimit(request, 'shipping');
      }

      const result = rateLimit(request, 'shipping');
      expect(result.success).toBe(false);
    });

    it('should enforce default limit (30 requests per minute)', () => {
      const request = createMockRequest(getUniqueIP());

      // Make 30 requests (limit)
      for (let i = 0; i < 30; i++) {
        rateLimit(request, 'default');
      }

      const result = rateLimit(request, 'default');
      expect(result.success).toBe(false);
    });
  });

  describe('Remaining Count', () => {
    it('should accurately track remaining requests', () => {
      const request = createMockRequest(getUniqueIP());

      const results = [];
      for (let i = 0; i < 5; i++) {
        results.push(rateLimit(request, 'payment'));
      }

      expect(results[0].remaining).toBe(4);
      expect(results[1].remaining).toBe(3);
      expect(results[2].remaining).toBe(2);
      expect(results[3].remaining).toBe(1);
      expect(results[4].remaining).toBe(0);
    });

    it('should return 0 remaining when limit exceeded', () => {
      const request = createMockRequest(getUniqueIP());

      // Use up limit
      for (let i = 0; i < 5; i++) {
        rateLimit(request, 'payment');
      }

      // Exceeded
      const result = rateLimit(request, 'payment');
      expect(result.remaining).toBe(0);
    });
  });

  describe('Type Isolation', () => {
    it('should isolate different rate limit types', () => {
      const request = createMockRequest(getUniqueIP());

      // Use up payment limit
      for (let i = 0; i < 5; i++) {
        rateLimit(request, 'payment');
      }

      // Payment should be blocked
      expect(rateLimit(request, 'payment').success).toBe(false);

      // But moderation should still work (different type)
      expect(rateLimit(request, 'moderation').success).toBe(true);
      expect(rateLimit(request, 'youtube').success).toBe(true);
      expect(rateLimit(request, 'admin').success).toBe(true);
    });

    it('should isolate identifiers within same type', () => {
      const request = createMockRequest(getUniqueIP());
      const id1 = `test-user-${testCounter++}`;
      const id2 = `test-user-${testCounter++}`;

      // Use up limit for id1
      for (let i = 0; i < 5; i++) {
        rateLimit(request, 'payment', id1);
      }

      // id1 blocked
      expect(rateLimit(request, 'payment', id1).success).toBe(false);

      // id2 still allowed (different identifier)
      expect(rateLimit(request, 'payment', id2).success).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid successive requests', () => {
      const request = createMockRequest(getUniqueIP());

      // Rapid fire 5 requests
      const results = Array.from({ length: 5 }, () =>
        rateLimit(request, 'payment')
      );

      expect(results.every(r => r.success)).toBe(true);
      expect(results[4].remaining).toBe(0);

      // 6th should fail
      expect(rateLimit(request, 'payment').success).toBe(false);
    });

    it('should handle missing rate limit type with default', () => {
      const request = createMockRequest(getUniqueIP());

      // No type specified, should use default (30 requests)
      const result = rateLimit(request);
      expect(result.success).toBe(true);
      expect(result.remaining).toBe(29);
    });

    it('should provide resetTime in future', () => {
      const request = createMockRequest(getUniqueIP());
      const now = Date.now();

      const result = rateLimit(request, 'payment');

      // Reset time should be in the future
      expect(result.resetTime).toBeGreaterThan(now);
      expect(result.resetTime).toBeLessThanOrEqual(now + 60 * 1000 + 100); // Allow 100ms tolerance
    });

    it('should maintain same resetTime across requests in window', () => {
      const request = createMockRequest(getUniqueIP());

      const result1 = rateLimit(request, 'payment');
      const result2 = rateLimit(request, 'payment');

      // Both should have same reset time (within 10ms tolerance for execution time)
      expect(Math.abs(result1.resetTime - result2.resetTime)).toBeLessThan(10);
    });

    it('should handle empty x-forwarded-for header', () => {
      const request = new NextRequest('http://localhost:3000/api/test', {
        method: 'POST',
        headers: {
          'x-forwarded-for': '',
        },
      });

      // Should not crash, should handle gracefully
      const result = rateLimit(request, 'default');
      expect(result.success).toBe(true);
    });

    it('should handle whitespace in x-forwarded-for', () => {
      const ip = getUniqueIP();
      const request = new NextRequest('http://localhost:3000/api/test', {
        method: 'POST',
        headers: {
          'x-forwarded-for': ` ${ip} , 10.0.0.1`,
        },
      });

      const result = rateLimit(request, 'default');
      expect(result.success).toBe(true);
    });
  });

  describe('Response Structure', () => {
    it('should return all required fields', () => {
      const request = createMockRequest(getUniqueIP());
      const result = rateLimit(request, 'payment');

      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('remaining');
      expect(result).toHaveProperty('resetTime');
      expect(typeof result.success).toBe('boolean');
      expect(typeof result.remaining).toBe('number');
      expect(typeof result.resetTime).toBe('number');
    });

    it('should return success:true when within limit', () => {
      const request = createMockRequest(getUniqueIP());
      const result = rateLimit(request, 'payment');

      expect(result.success).toBe(true);
      expect(result.remaining).toBeGreaterThanOrEqual(0);
    });

    it('should return success:false when limit exceeded', () => {
      const request = createMockRequest(getUniqueIP());

      // Use up limit
      for (let i = 0; i < 5; i++) {
        rateLimit(request, 'payment');
      }

      const result = rateLimit(request, 'payment');
      expect(result.success).toBe(false);
      expect(result.remaining).toBe(0);
    });
  });
});
