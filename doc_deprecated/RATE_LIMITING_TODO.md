# Rate Limiting - Known Limitation & Future Upgrade

## Current Implementation

**Location**: `lib/rateLimit.ts`

**Type**: In-memory rate limiting using JavaScript Map object

**Scope**: Works correctly for single-instance deployments

## Limitations

### 1. **Not Distributed** ❌
- Rate limits are stored in server memory
- Each serverless function instance has its own rate limit store
- Users can bypass limits by triggering different function instances

### 2. **Not Persistent** ❌
- Limits reset on server restart/redeployment
- No persistence across deployments

### 3. **Vercel Serverless Issue** ⚠️
- Vercel spins up multiple function instances
- Each instance has separate rate limit tracking
- A user hitting 5 different instances can make 150 requests instead of 30

## Current Rate Limits

```typescript
const RATE_LIMITS = {
  payment: { requests: 5, windowMs: 60 * 1000 },     // 5/min
  moderation: { requests: 10, windowMs: 60 * 1000 }, // 10/min
  youtube: { requests: 20, windowMs: 60 * 1000 },    // 20/min
  admin: { requests: 50, windowMs: 60 * 1000 },      // 50/min
  contact: { requests: 3, windowMs: 60 * 60 * 1000 },// 3/hour
  shipping: { requests: 30, windowMs: 60 * 1000 },   // 30/min
  default: { requests: 30, windowMs: 60 * 1000 },    // 30/min
}
```

## Recommended Upgrade

### Option 1: Upstash Redis (Recommended)
```bash
npm install @upstash/redis @upstash/ratelimit
```

**Pros**:
- Serverless-friendly (connection pooling)
- Free tier: 10,000 commands/day
- Built-in sliding window algorithm
- Global edge locations

**Setup**:
1. Create Upstash account: https://upstash.com
2. Create Redis database
3. Add env vars: `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`
4. Update `lib/rateLimit.ts`

**Example Code**:
```typescript
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(30, "60 s"),
  analytics: true,
});

export async function rateLimit(identifier: string) {
  const { success, limit, remaining, reset } = await ratelimit.limit(identifier);
  return { success, remaining, resetTime: reset };
}
```

### Option 2: Vercel KV
```bash
npm install @vercel/kv
```

**Pros**:
- Native Vercel integration
- Durable Redis storage
- Simple setup in Vercel dashboard

**Cons**:
- Paid only (no free tier)
- Vendor lock-in

### Option 3: Keep Current (with Monitoring)
For MVP/early launch, current implementation is acceptable if:
- [ ] Monitor for abuse patterns
- [ ] Set up CloudFlare rate limiting at edge
- [ ] Plan upgrade when scaling issues appear

## Migration Steps

1. **Install Upstash Redis** (or Vercel KV)
2. **Add environment variables**
3. **Update `lib/rateLimit.ts`**:
   - Replace Map with Redis calls
   - Keep same API interface
4. **Test thoroughly** before deploying
5. **Monitor performance** with Upstash analytics

## When to Upgrade

**Upgrade NOW if**:
- Launching to large audience (>1000 users)
- Handling sensitive operations (payments, admin)
- Expecting traffic spikes

**Can wait if**:
- MVP/beta with <100 users
- Using CloudFlare rate limiting at edge
- Monitoring for abuse

## Decision

**Current Status**: ✅ Acceptable for launch with monitoring

**Recommended Action**:
- Monitor initial launch traffic
- Upgrade to Upstash within 30 days if successful
- Cost: $0/month (free tier) vs current: $0/month

---

**Created**: 2025-01-12
**Last Updated**: 2025-01-12
**Status**: Documented - No immediate action required
