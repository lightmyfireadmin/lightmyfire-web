import { NextRequest } from 'next/server';

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

const RATE_LIMITS = {
  payment: { requests: 5, windowMs: 60 * 1000 },
  moderation: { requests: 10, windowMs: 60 * 1000 },
  youtube: { requests: 20, windowMs: 60 * 1000 },
  admin: { requests: 50, windowMs: 60 * 1000 },
  default: { requests: 30, windowMs: 60 * 1000 },
} as const;

export type RateLimitType = keyof typeof RATE_LIMITS;

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

setInterval(() => {
  const now = Date.now();
  Object.keys(store).forEach((key) => {
    if (store[key].resetTime < now) {
      delete store[key];
    }
  });
}, 60 * 1000);
