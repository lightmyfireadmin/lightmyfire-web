import { describe, it, expect } from 'vitest';
import { PACK_PRICING, VALID_PACK_SIZES } from '@/lib/constants';

describe('Constants', () => {
  describe('PACK_PRICING', () => {
    it('should have pricing for all valid pack sizes', () => {
      VALID_PACK_SIZES.forEach((size) => {
        expect(PACK_PRICING[size]).toBeDefined();
        expect(typeof PACK_PRICING[size]).toBe('number');
        expect(PACK_PRICING[size]).toBeGreaterThan(0);
      });
    });

    it('should have reasonable pricing (in cents)', () => {
      // Prices should be in cents and reasonable (between €1 and €1000)
      Object.values(PACK_PRICING).forEach((price) => {
        expect(price).toBeGreaterThan(100); // > €1
        expect(price).toBeLessThan(100000); // < €1000
      });
    });

    it('should have increasing prices for larger packs', () => {
      expect(PACK_PRICING[10]).toBeLessThan(PACK_PRICING[20]);
      expect(PACK_PRICING[20]).toBeLessThan(PACK_PRICING[50]);
    });
  });

  describe('VALID_PACK_SIZES', () => {
    it('should contain exactly 3 valid sizes', () => {
      expect(VALID_PACK_SIZES).toHaveLength(3);
    });

    it('should include 10, 20, and 50', () => {
      expect(VALID_PACK_SIZES).toContain(10);
      expect(VALID_PACK_SIZES).toContain(20);
      expect(VALID_PACK_SIZES).toContain(50);
    });

    it('should be sorted in ascending order', () => {
      const sorted = [...VALID_PACK_SIZES].sort((a, b) => a - b);
      expect(VALID_PACK_SIZES).toEqual(sorted);
    });
  });
});
