import { NextRequest } from 'next/server';

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

const RATE_LIMITS = {
  payment: { requests: 5, windowMs: 60 * 1000 }, // 5 per minute
  moderation: { requests: 10, windowMs: 60 * 1000 }, // 10 per minute
  youtube: { requests: 20, windowMs: 60 * 1000 }, // 20 per minute
  admin: { requests: 50, windowMs: 60 * 1000 }, // 50 per minute
  contact: { requests: 3, windowMs: 60 * 60 * 1000 }, // 3 per hour
  shipping: { requests: 30, windowMs: 60 * 1000 }, // 30 per minute
  default: { requests: 30, windowMs: 60 * 1000 }, // 30 per minute
} as const;

export type RateLimitType = keyof typeof RATE_LIMITS;

/**
 * Rate limits requests based on IP address or identifier.
 *
 * @param {NextRequest} request - The incoming request.
 * @param {RateLimitType} [type='default'] - The rate limit type.
 * @param {string} [identifier] - Optional custom identifier (e.g., user ID).
 * @returns {{ success: boolean; remaining: number; resetTime: number }} Rate limit result.
 */
export function rateLimit(
  request: NextRequest,
  type: RateLimitType = 'default',
  identifier?: string
): { success: boolean; remaining: number; resetTime: number } {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ||
             request.headers.get('x-real-ip') ||
             'unknown';

  const key = identifier ? `${type}:${identifier}` : `${type}:${ip}`;
  const now = Date.now();
  const limit = RATE_LIMITS[type];

  const record = store[key];

  if (!record || now > record.resetTime) {
    store[key] = {
      count: 1,
      resetTime: now + limit.windowMs,
    };

    return {
      success: true,
      remaining: limit.requests - 1,
      resetTime: now + limit.windowMs,
    };
  }

  if (record.count >= limit.requests) {
    return {
      success: false,
      remaining: 0,
      resetTime: record.resetTime,
    };
  }

  record.count++;

  return {
    success: true,
    remaining: limit.requests - record.count,
    resetTime: record.resetTime,
  };
}

// Cleanup interval (every minute)
setInterval(() => {
  const now = Date.now();
  Object.keys(store).forEach((key) => {
    if (store[key].resetTime < now) {
      delete store[key];
    }
  });
}, 60 * 1000);
