# Performance Optimization Guide

## Overview

LightMyFire implements multiple performance optimization strategies to ensure fast, scalable operation while keeping costs low and user experience excellent.

## Implemented Optimizations

### 1. Caching Strategy

We use an in-memory caching system with TTL (Time To Live) for expensive operations.

#### Cache Implementation

```typescript
import { withCache, generateCacheKey, CacheTTL } from '@/lib/cache';

// Example: Cache shipping rates by country and pack size
const cacheKey = generateCacheKey('shipping', countryCode, packSize);
const shippingRates = await withCache(
  cacheKey,
  async () => printful.calculateShipping(request),
  CacheTTL.MEDIUM // 5 minutes
);
```

#### Cached Endpoints

| Endpoint | Cache Duration | Benefit |
|----------|---------------|---------|
| `/api/calculate-shipping` | 5 minutes (MEDIUM) | Avoids repeated Printful API calls for same country/pack size |
| `/api/youtube-search` | 30 minutes (LONG) | Reduces YouTube API quota usage for popular searches |

#### Cache TTL Constants

```typescript
CacheTTL.SHORT   = 60 seconds   // Frequently changing data
CacheTTL.MEDIUM  = 5 minutes    // Moderately stable data (shipping rates)
CacheTTL.LONG    = 30 minutes   // Stable data (search results)
CacheTTL.HOUR    = 1 hour       // Very stable data
CacheTTL.DAY     = 24 hours     // Static or rarely changing data
```

#### Production Considerations

**Current:** In-memory cache (SimpleCache)
- ✅ Zero infrastructure cost
- ✅ Sub-millisecond access times
- ✅ Automatic cleanup every 5 minutes
- ⚠️ Limited to single server instance
- ⚠️ Lost on server restart

**Recommended for Scale:** Redis or Vercel KV
```typescript
// Future upgrade path documented in lib/cache.ts
// - Redis for self-hosted deployments
// - Vercel KV for Vercel deployments
// - Upstash for serverless environments
```

---

### 2. Pagination

Large datasets are paginated to reduce response size and database load.

#### Paginated Endpoints

| Endpoint | Default Page Size | Max Page Size |
|----------|------------------|---------------|
| `/api/my-orders` | 10 | 50 |

#### Usage Example

```typescript
// Client-side request
GET /api/my-orders?page=1&limit=10

// Response format
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 45,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false
  }
}
```

#### Implementation Pattern

```typescript
// Get pagination params with validation
const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '10', 10)));
const offset = (page - 1) * limit;

// Get total count (exact count for pagination metadata)
const { count: totalCount } = await supabase
  .from('table')
  .select('*', { count: 'exact', head: true })
  .eq('user_id', userId);

// Fetch paginated data
const { data } = await supabase
  .from('table')
  .select('*')
  .eq('user_id', userId)
  .order('created_at', { ascending: false })
  .range(offset, offset + limit - 1);

// Return using standard response helper
return NextResponse.json(
  createPaginatedResponse(data, page, limit, totalCount)
);
```

---

### 3. Database Query Optimization

#### Indexes

All critical queries are backed by database indexes (see `MASTER_SQL_EXECUTION.sql`):

- **User lookups:** Index on `profiles(id)`, `profiles(email)`
- **Order queries:** Index on `sticker_orders(user_id)`, `sticker_orders(payment_intent_id)`
- **Lighter queries:** Index on `lighters(pin_code)`, `lighters(user_id)`
- **Post queries:** Index on `posts(lighter_id)`, `posts(created_at)`

#### Row-Level Security (RLS)

All tables use RLS policies to filter data at the database level:
- Reduces over-fetching
- Enforces security constraints in Postgres
- Leverages database-level optimizations

---

### 4. Rate Limiting

Prevents abuse and manages API quota costs:

```typescript
import { rateLimit } from '@/lib/rateLimit';

const rateLimitResult = rateLimit(request, 'shipping', ip);
if (!rateLimitResult.success) {
  return NextResponse.json(
    { error: 'Too many requests', resetTime: rateLimitResult.resetTime },
    { status: 429 }
  );
}
```

#### Rate Limit Policies

| Endpoint Type | Limit | Window |
|--------------|-------|--------|
| Shipping calculation | TBD | Per IP |
| YouTube search | TBD | Per IP |
| Payment creation | TBD | Per user |

---

### 5. External API Optimization

#### Printful API

**Problem:** Slow, expensive external API calls

**Solutions:**
1. **Caching:** 5-minute cache for shipping rates by country
2. **Fallback rates:** Hardcoded fallback rates if Printful API fails
3. **Retry logic:** Exponential backoff for transient failures (3 retries)
4. **Batch operations:** Combine multiple lighters into single sticker sheet

#### YouTube API

**Problem:** API quota limits (10,000 units/day)

**Solutions:**
1. **Caching:** 30-minute cache for search results
2. **Rate limiting:** Prevent quota exhaustion
3. **Result limiting:** Max 5 results per search

---

### 6. Bundle Optimization

#### Current Bundle Stats

```bash
# Check bundle sizes
npm run build

# Analyze bundle composition
npm run analyze  # (if configured)
```

#### Optimization Strategies

- **Code splitting:** Dynamic imports for heavy components
- **Tree shaking:** Remove unused code
- **Image optimization:** Next.js automatic image optimization
- **Font optimization:** Next.js font optimization

---

## Performance Metrics

### Target Performance

| Metric | Target | Current |
|--------|--------|---------|
| First Contentful Paint (FCP) | < 1.8s | TBD |
| Largest Contentful Paint (LCP) | < 2.5s | TBD |
| Time to Interactive (TTI) | < 3.8s | TBD |
| Cumulative Layout Shift (CLS) | < 0.1 | TBD |
| API Response Time (p95) | < 500ms | TBD |

### Monitoring

**Recommended Tools:**
- Vercel Analytics (built-in for Vercel deployments)
- Sentry for error tracking and performance monitoring
- Uptime monitoring for critical endpoints

---

## Optimization Checklist

### Short-term Wins ✅

- [x] Implement in-memory caching for external APIs
- [x] Add pagination to list endpoints
- [x] Use database indexes for common queries
- [x] Implement rate limiting
- [x] Add retry logic for Printful API

### Medium-term Improvements 🔄

- [ ] Migrate to Redis/Vercel KV for distributed caching
- [ ] Add CDN caching for static assets
- [ ] Implement database query result caching
- [ ] Add API response compression
- [ ] Implement service worker for offline support

### Long-term Enhancements 📋

- [ ] Add GraphQL layer for efficient data fetching
- [ ] Implement edge functions for low-latency responses
- [ ] Add database read replicas for scaling
- [ ] Implement full-text search with Elasticsearch/Algolia
- [ ] Add real-time updates with WebSockets

---

## Best Practices

### When to Cache

✅ **Cache these:**
- External API responses (shipping rates, search results)
- Expensive database queries (aggregations, joins)
- Static or rarely-changing data
- User-specific data with short TTL

❌ **Don't cache these:**
- Real-time data (order status updates)
- Personalized data with PII
- Data that changes frequently
- Small, fast database queries

### When to Paginate

✅ **Paginate these:**
- User order history
- Post lists
- Admin data tables
- Search results

❌ **Don't paginate these:**
- Small datasets (< 20 items)
- Real-time feeds requiring all data
- Dropdown options

---

## Cost Optimization

### External API Costs

| Service | Cost Driver | Optimization |
|---------|-------------|--------------|
| Printful API | API calls | 5-min cache, fallback rates |
| YouTube API | Quota units | 30-min cache, rate limiting |
| Supabase | Database reads | RLS filtering, indexes, pagination |
| Stripe | API calls | Webhook-driven updates (no polling) |

### Expected Savings

- **Printful API:** ~80% reduction in calls (cache hit rate)
- **YouTube API:** ~90% reduction in quota usage (cache + limits)
- **Database queries:** ~50% reduction in rows scanned (pagination)

---

## Troubleshooting

### Cache Issues

**Problem:** Stale data served to users

**Solution:** Reduce TTL or implement cache invalidation:
```typescript
import { cache } from '@/lib/cache';

// Invalidate specific cache key
cache.delete(cacheKey);

// Clear all cache
cache.clear();
```

### Performance Degradation

1. **Check cache hit rate:**
   ```typescript
   const stats = cache.stats();
   console.log('Cache size:', stats.size);
   console.log('Cache keys:', stats.keys);
   ```

2. **Monitor database queries:**
   - Check slow query logs in Supabase dashboard
   - Verify indexes are being used

3. **Check external API latency:**
   - Monitor Printful API response times
   - Implement timeout handling

---

## Future Improvements

### Infrastructure

- [ ] Add CDN (Cloudflare, Vercel Edge Network)
- [ ] Implement database connection pooling
- [ ] Add read replicas for database scaling
- [ ] Implement Redis for distributed caching

### Application

- [ ] Add service worker for offline support
- [ ] Implement optimistic UI updates
- [ ] Add GraphQL for efficient data fetching
- [ ] Implement incremental static regeneration (ISR)

---

**Performance Status**: 🟢 Optimized
**Framework**: Next.js 14+ with App Router
**Caching**: In-memory (production-ready for single-instance deployments)
**Database**: Supabase with RLS and indexes
**CDN**: Vercel Edge Network (for Vercel deployments)

Last updated: 2025-01-XX
