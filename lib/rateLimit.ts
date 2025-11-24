import { NextRequest } from 'next/server';

/**
 * Interface for the in-memory rate limit store.
 */
interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

/**
 * In-memory store for rate limiting.
 * Note: In a serverless environment like Vercel, this store is local to the lambda instance.
 * For strictly consistent rate limiting across distributed instances, use Redis or Vercel KV.
 */
const store: RateLimitStore = {};

/**
 * Rate limit configurations for different types of actions.
 */
const RATE_LIMITS = {
  payment: { requests: 5, windowMs: 60 * 1000 }, // 5 per minute
  moderation: { requests: 10, windowMs: 60 * 1000 }, // 10 per minute
  youtube: { requests: 20, windowMs: 60 * 1000 }, // 20 per minute
  admin: { requests: 50, windowMs: 60 * 1000 }, // 50 per minute
  contact: { requests: 3, windowMs: 60 * 60 * 1000 }, // 3 per hour
  shipping: { requests: 30, windowMs: 60 * 1000 }, // 30 per minute
  default: { requests: 30, windowMs: 60 * 1000 }, // 30 per minute
} as const;

/**
 * Type definition for valid rate limit categories.
 */
export type RateLimitType = keyof typeof RATE_LIMITS;

/**
 * Checks if a request exceeds the defined rate limits based on IP address or a custom identifier.
 *
 * @param {NextRequest} request - The incoming Next.js request object.
 * @param {RateLimitType} [type='default'] - The category of the rate limit (e.g., 'payment', 'api').
 * @param {string} [identifier] - An optional custom identifier (e.g., user ID) to use instead of IP.
 * @returns {{ success: boolean; remaining: number; resetTime: number }} An object containing:
 *   - `success`: `true` if the request is within limits, `false` otherwise.
 *   - `remaining`: The number of requests remaining in the current window.
 *   - `resetTime`: The timestamp (ms) when the current window resets.
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

/**
 * Periodic cleanup of expired rate limit records.
 * Runs every minute to prevent memory leaks in long-running processes.
 */
setInterval(() => {
  const now = Date.now();
  Object.keys(store).forEach((key) => {
    if (store[key].resetTime < now) {
      delete store[key];
    }
  });
}, 60 * 1000);
