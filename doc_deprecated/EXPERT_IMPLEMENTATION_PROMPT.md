# Expert Implementation Prompt: LightMyFire Web Application Comprehensive Overhaul

## Executive Summary

The LightMyFire web application suffers from **critical systemic failures** that prevent core functionality from working. This is a **complex, multi-domain technical challenge** requiring expert intervention across payment processing, database operations, serverless architecture, internationalization, and backend systems.

**Current Status**: 🚨 **PRODUCTION-BREAKING ISSUES**  
**Business Impact**: 💰 **No orders can be processed**  
**Technical Debt**: 🔥 **High - requires fundamental architectural changes**

---

## Current State Analysis

### 🚨 Critical Failures (Production Blocking)

#### 1. **Payment System Completely Broken**
- **Order Processing**: `app/api/process-sticker-order/route.ts` fails due to database column mismatches
- **Database Schema Drift**: Code uses non-existent columns (`stripe_payment_intent_id`, `fulfillment_status`)
- **Real Columns**: Database has `payment_intent_id`, `status` (different names)
- **Impact**: Zero orders can be processed successfully
- **Files Affected**: 13+ API routes and webhook handlers

#### 2. **Serverless Environment Architecture Mismatch**
- **Deployment Target**: Vercel (Node.js serverless functions)
- **Code Dependencies**: Deno-specific edge functions using `npm:` imports
- **Runtime Conflict**: Deno code cannot run in Vercel's Node.js environment
- **Files**: `lib/edge-functions.md` contains Deno-specific code patterns
- **Impact**: Backend services completely non-functional in production

#### 3. **Sticker Generation System Failure**
- **Service**: `lib/sticker-generator.ts` and `lib/generateSticker.ts`
- **Storage Issues**: Generated stickers return 404 URLs
- **Dependencies**: `@napi-rs/canvas` requires native binaries (problematic in serverless)
- **Impact**: Core product (custom stickers) cannot be generated

#### 4. **Database Schema and Code Misalignment**
- **Type Safety**: `types/database.ts` outdated, doesn't match actual schema
- **Column References**: Multiple files reference non-existent columns
- **Foreign Keys**: Schema drift between code assumptions and database reality
- **Impact**: Type errors, runtime failures, development confusion

#### 5. **Internationalization Infrastructure Issues**
- **Locale Files**: `locales/` directory has inconsistencies
- **Translation Keys**: Mismatches between frontend and backend usage
- **Server/Client Split**: `locales/client.ts` vs `locales/server.ts` complications
- **Impact**: Multilingual support broken or incomplete

### ⚠️ High-Priority Issues

#### 6. **Mixed Runtime Dependencies**
- **Package Conflicts**: Both Node.js and Deno dependencies in `package.json`
- **Build Issues**: Webpack configuration conflicts with Vercel deployment
- **Bundle Size**: Large dependencies (`puppeteer`, `pdf-lib`) problematic for serverless

#### 7. **Security Vulnerabilities**
- **SQL Injection**: Potential vectors in user search functionality
- **Authentication**: Admin authorization patterns duplicated across routes
- **Environment Variables**: Some secrets may be exposed client-side

#### 8. **Performance & Scalability**
- **Serverless Limitations**: Long-running operations time out
- **Database Queries**: N+1 query patterns in some endpoints
- **Caching**: In-memory cache won't work across serverless instances

---

## Root Cause Analysis

### Architectural Mismatch
The application was **designed for Deno/edge functions** but is being **deployed to Vercel's Node.js serverless**. This fundamental runtime incompatibility causes cascading failures across all backend services.

### Schema Drift
Database schema has evolved independently from code, creating a **critical mismatch** between expected and actual column names, data types, and relationships.

### Dependency Hell
Multiple conflicting dependency chains (Node.js + Deno + native binaries) create an **unsustainable deployment environment**.

### Missing Testing
No automated tests catch schema mismatches or integration failures, allowing broken code to reach production.

---

## Expert Goals & Objectives

### Primary Mission: Restore Core Functionality
1. **Fix Payment Processing** - Enable order creation and processing
2. **Eliminate Runtime Conflicts** - Remove Deno dependencies, ensure Node.js compatibility
3. **Database Alignment** - Synchronize code with actual schema
4. **Sticker Generation** - Restore core product functionality
5. **Internationalization** - Complete multilingual support

### Secondary Mission: Long-term Sustainability
6. **Performance Optimization** - Ensure serverless-compatible architecture
7. **Security Hardening** - Address all identified vulnerabilities
8. **Testing Infrastructure** - Prevent future regressions
9. **Documentation** - Create maintainable codebase

---

## Comprehensive Implementation Roadmap

### Phase 1: Critical System Restoration (Week 1-2)

#### Priority 1A: Database Schema Fixes (Days 1-3)

```bash
# 1. Generate accurate TypeScript types
npx supabase gen types typescript --project-id <PROJECT_ID> > types/database.ts

# 2. Fix all column name mismatches
# Files requiring immediate fixes:
- app/api/process-sticker-order/route.ts (13 occurrences)
- app/api/webhooks/stripe/route.ts (2 occurrences) 
- app/api/webhooks/printful/route.ts (1 occurrence)
- app/api/my-orders/route.ts (2 occurrences)
- lib/supabase.ts (type references)
```

**Specific Column Fixes**:
```typescript
// BEFORE (broken):
stripe_payment_intent_id: paymentIntentId
fulfillment_status: 'processing'
.refund_amount

// AFTER (correct):
payment_intent_id: paymentIntentId  
status: 'processing'
// Remove non-existent columns, add logging
```

#### Priority 1B: Payment System Repair (Days 4-7)

**Tasks**:
1. **Update Payment Intent Processing**:
   - Fix `app/api/process-sticker-order/route.ts` line 229
   - Update webhook handlers to use correct column names
   - Test end-to-end payment flow

2. **Database Transaction Safety**:
   - Ensure orders are created atomically
   - Add proper error rollback
   - Implement order status tracking

3. **Stripe Integration**:
   - Verify webhook signatures
   - Test payment intent creation
   - Validate payment confirmation flow

**Success Criteria**:
- ✅ Order creation succeeds
- ✅ Payment webhooks update database
- ✅ Users can view their orders
- ✅ Email confirmations sent

#### Priority 1C: Runtime Environment Cleanup (Days 8-10)

**Eliminate Deno Dependencies**:
```typescript
// REMOVE from package.json:
"@napi-rs/canvas": "^0.1.82",  // Replace with serverless-compatible solution

// UPDATE edge function patterns:
# FROM: import { createClient } from "npm:@supabase/supabase-js@2.36.0";
# TO:   import { createClient } from '@supabase/supabase-js';

# FROM: Deno.env.get('RESEND_API_KEY')  
# TO:   process.env.RESEND_API_KEY
```

**Vercel-Specific Configuration**:
```javascript
// next.config.js additions:
webpack: (config, { isServer }) => {
  if (isServer) {
    config.externals.push('@napi-rs/canvas'); // Externalize native modules
  }
  return config;
}
```

### Phase 2: Sticker Generation System (Week 2-3)

#### Priority 2A: Serverless-Compatible Sticker Generation (Days 11-14)

**Current Problem**: `@napi-rs/canvas` requires native binaries incompatible with Vercel serverless.

**Solution Options**:
1. **Use Canvas API + Puppeteer** (Recommended):
   ```typescript
   // lib/sticker-generator.ts - Replace @napi-rs/canvas
   import puppeteer from 'puppeteer';
   
   export async function generateStickerSheets(stickerData) {
     const browser = await puppeteer.launch({
       headless: true,
       args: ['--no-sandbox', '--disable-setuid-sandbox']
     });
     // Generate images using HTML/CSS + Puppeteer
   }
   ```

2. **Alternative: Pre-generated Templates**:
   - Create sticker templates server-side
   - Use dynamic text overlay
   - Faster and more reliable

**Implementation Strategy**:
```typescript
// lib/sticker-generator.ts - New approach
interface StickerData {
  name: string;
  pinCode: string;
  backgroundColor: string;
  language: string;
}

export async function generateStickerSheets(data: StickerData[]) {
  // 1. Generate HTML template for each sticker
  // 2. Use Puppeteer to render as PNG
  // 3. Package into PDF sheets
  // 4. Upload to Supabase Storage
  // 5. Return signed URLs
}
```

#### Priority 2B: Storage & File Management (Days 15-17)

**Storage Bucket Issues**:
```typescript
// Fix storage operations in process-sticker-order/route.ts
async function ensureStickerStorageBucketExists(client: SupabaseClient) {
  // Verify bucket exists, create if needed
  // Set proper CORS policies
  // Configure public/private access correctly
}

// Fix signed URL generation
const { data: urlData } = await supabaseAdmin.storage
  .from('sticker-orders')
  .createSignedUrl(fileName, 604800); // 7 days expiry
```

### Phase 3: Internationalization Overhaul (Week 3-4)

#### Priority 3A: Locale File Synchronization (Days 18-21)

**Current Issues**:
- Mismatched keys between `locales/en.ts` and server usage
- Missing translation keys causing runtime errors
- Inconsistent file structure

**Solution**:
```typescript
// Sync locales with actual usage
// 1. Scan codebase for all t() calls
// 2. Generate complete key list
// 3. Ensure all locales have matching keys
// 4. Fix server/client split issues

// locales/en.ts - Ensure comprehensive coverage
export default {
  // Core app strings (200+ keys)
  // API error messages (50+ keys)  
  // Email templates (100+ keys)
  // Admin panel (80+ keys)
  // Total: 500+ translation keys
} as const;
```

#### Priority 3B: Backend i18n Support (Days 22-24)

**Email Internationalization**:
```typescript
// lib/email-i18n.ts - Ensure all languages supported
const SUPPORTED_LANGUAGES = [
  'en', 'es', 'fr', 'de', 'it', 'nl', 
  'pl', 'ru', 'uk', 'tr', 'ar', 'fa', 
  'ur', 'hi', 'mr', 'te', 'zh-CN', 'vi', 'id'
] as const;

export function getEmailTranslations(language: string) {
  // Return language-specific email templates
  // Ensure all 19 languages have complete coverage
}
```

### Phase 4: Performance & Security (Week 4-5)

#### Priority 4A: Serverless Optimization (Days 25-28)

**Connection Pooling**:
```typescript
// lib/supabase-server.ts - Optimize for serverless
let supabaseAdmin: SupabaseClient | null = null;

function getSupabaseAdmin() {
  if (!supabaseAdmin) {
    supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        },
        global: {
          headers: { 'x-my-custom-header': 'lightmyfire-web' }
        }
      }
    );
  }
  return supabaseAdmin;
}
```

**Caching Strategy**:
```typescript
// lib/cache.ts - Vercel-compatible caching
import { createClient } from '@vercel/kv';

export class ServerlessCache {
  private kv = createClient({
    url: process.env.KV_URL!,
    token: process.env.KV_REST_API_TOKEN!,
  });

  async get(key: string) {
    return await this.kv.get(key);
  }

  async set(key: string, value: any, ttl: number = 3600) {
    return await this.kv.setex(key, ttl, JSON.stringify(value));
  }
}
```

#### Priority 4B: Security Hardening (Days 29-32)

**SQL Injection Prevention**:
```typescript
// Fix admin search route
// app/api/admin/email-tool/search-users/route.ts
const { data: orders } = await supabase
  .from('sticker_orders')
  .select('user_id, user_email, shipping_name')
  .ilike('user_email', `%${query.replace(/[%_]/g, '\\$&')}%`) // Escape wildcards
  .not('user_email', 'is', null)
  .limit(20);
```

**Admin Authorization Helper**:
```typescript
// lib/admin-auth.ts - Centralized admin auth
export async function requireAdmin(request: NextRequest) {
  const session = await getSession();
  if (!session) throw new UnauthorizedError();

  const profile = await getProfile(session.user.id);
  if (profile?.role !== 'admin') throw new ForbiddenError();

  return { session, profile };
}
```

### Phase 5: Testing & Documentation (Week 5-6)

#### Priority 5A: Critical Path Testing (Days 33-35)

**End-to-End Test Suite**:
```typescript
// tests/e2e/payment-flow.test.ts
describe('Payment Flow', () => {
  test('Complete order processing', async () => {
    // 1. Create payment intent
    // 2. Process order with test data  
    // 3. Verify database entries
    // 4. Check email sending
    // 5. Validate sticker generation
  });

  test('Webhook handling', async () => {
    // Simulate Stripe webhook
    // Verify order status updates
    // Check email queue processing
  });
});
```

**Database Integration Tests**:
```typescript
// tests/integration/database.test.ts
describe('Database Operations', () => {
  test('Order creation and retrieval', async () => {
    const order = await createTestOrder();
    const retrieved = await getOrder(order.id);
    expect(retrieved.payment_intent_id).toBe(order.payment_intent_id);
  });
});
```

#### Priority 5B: Documentation & Deployment (Days 36-42)

**API Documentation**:
```markdown
# API Endpoints Documentation

## Order Processing
- `POST /api/process-sticker-order` - Create and process order
- `GET /api/my-orders` - Retrieve user orders
- `POST /api/webhooks/stripe` - Handle Stripe events

## Authentication & Authorization
- All protected routes require valid session
- Admin routes require admin role
- Rate limiting applies to payment endpoints
```

**Deployment Guide**:
```markdown
# Production Deployment Checklist

## Environment Variables
- [ ] NEXT_PUBLIC_SUPABASE_URL
- [ ] NEXT_PUBLIC_SUPABASE_ANON_KEY  
- [ ] SUPABASE_SERVICE_ROLE_KEY
- [ ] STRIPE_SECRET_KEY
- [ ] STRIPE_WEBHOOK_SECRET
- [ ] RESEND_API_KEY
- [ ] KV_URL (for Vercel KV cache)
- [ ] KV_REST_API_TOKEN

## Database Setup
- [ ] Run schema migrations
- [ ] Configure RLS policies
- [ ] Set up storage buckets
- [ ] Create necessary indexes

## External Services
- [ ] Configure Stripe webhooks
- [ ] Set up Resend email domain
- [ ] Configure Vercel deployment
```

---

## Technical Specifications

### Database Schema Requirements

**Critical Tables**:
```sql
-- sticker_orders table (must exist with these columns)
CREATE TABLE sticker_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  payment_intent_id TEXT UNIQUE NOT NULL,  -- Not stripe_payment_intent_id!
  quantity INTEGER NOT NULL,
  amount_paid INTEGER NOT NULL,  -- In cents
  shipping_name TEXT NOT NULL,
  shipping_email TEXT NOT NULL,
  shipping_address TEXT NOT NULL,
  shipping_city TEXT NOT NULL,
  shipping_postal_code TEXT NOT NULL,
  shipping_country TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',  -- Not fulfillment_status!
  lighter_ids UUID[],
  lighter_names TEXT[],
  sticker_file_url TEXT,
  sticker_file_size INTEGER,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### API Response Standards

**All endpoints must return standardized responses**:
```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
}

interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}
```

### Environment Variables

**Required for Production**:
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email
RESEND_API_KEY=re_...

# Caching (Vercel KV)
KV_URL=https://...
KV_REST_API_TOKEN=...
KV_REST_API_READ_ONLY_TOKEN=...

# App
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
FULFILLMENT_EMAIL=orders@lightmyfire.app
```

---

## Quality Assurance Checklist

### Pre-Production Testing

**Functional Tests**:
- [ ] Order creation flow works end-to-end
- [ ] Payment webhooks update database correctly
- [ ] Sticker generation produces downloadable files
- [ ] Email confirmations send to customers
- [ ] Admin panel functions properly
- [ ] My Orders page displays correctly
- [ ] Internationalization works for all supported languages

**Performance Tests**:
- [ ] Cold starts under 10 seconds
- [ ] API responses under 2 seconds
- [ ] Database queries optimized
- [ ] Storage uploads succeed reliably
- [ ] Email sending doesn't timeout

**Security Tests**:
- [ ] No SQL injection vulnerabilities
- [ ] Admin endpoints properly protected
- [ ] Payment data handled securely
- [ ] User sessions validate correctly
- [ ] Rate limiting prevents abuse

### Deployment Verification

**Post-Deployment Checks**:
- [ ] Health check endpoints respond
- [ ] Database connections working
- [ ] Storage buckets accessible
- [ ] Email service operational
- [ ] Payment webhooks received
- [ ] Error tracking functional

---

## Success Metrics

### Technical KPIs
- **Order Success Rate**: >98% (currently 0%)
- **API Response Time**: <2s average
- **Error Rate**: <1% of requests
- **Uptime**: >99.9%
- **Test Coverage**: >70% critical paths

### Business KPIs  
- **Order Processing**: From 0 to processing orders
- **Customer Satisfaction**: Reduced support tickets
- **Operational Efficiency**: Automated order fulfillment
- **International Growth**: Support for 19 languages

---

## Risk Mitigation

### High-Risk Areas

**Database Migration Risk**:
- **Risk**: Schema changes break existing functionality
- **Mitigation**: Test migrations on staging environment first
- **Rollback Plan**: Keep old schema version available

**Payment System Risk**:
- **Risk**: New payment flow has bugs
- **Mitigation**: Implement gradual rollout with monitoring
- **Fallback**: Maintain old system as backup temporarily

**Sticker Generation Risk**:
- **Risk**: New generation method fails
- **Mitigation**: Implement comprehensive error handling
- **Fallback**: Use manual sticker creation process

### Monitoring & Alerting

**Critical Alerts**:
- Order processing failures
- Payment webhook failures  
- Email sending failures
- Database connection issues
- Storage upload failures

**Performance Monitoring**:
- API response times
- Database query performance
- Serverless function cold starts
- Storage upload speeds

---

## Timeline Summary

| Phase | Duration | Critical Deliverables |
|-------|----------|----------------------|
| Phase 1 | Week 1-2 | Payment system restored, database aligned |
| Phase 2 | Week 2-3 | Sticker generation working |
| Phase 3 | Week 3-4 | Complete i18n support |
| Phase 4 | Week 4-5 | Performance optimized, security hardened |
| Phase 5 | Week 5-6 | Testing complete, documentation ready |

**Total Estimated Time**: 6 weeks  
**Priority**: Critical (business-blocking)  
**Resource Requirement**: Senior full-stack developer with serverless expertise

---

## Final Notes for Expert

This is a **high-complexity, high-impact project** requiring:

1. **Deep Technical Expertise**: Serverless architecture, payment systems, internationalization
2. **Systematic Approach**: Fix foundational issues before optimizing
3. **Quality Focus**: Comprehensive testing to prevent regressions
4. **Performance Mind**: Serverless environment constraints awareness
5. **Business Priority**: Restore core revenue-generating functionality

**Success depends on methodical execution of each phase and thorough testing before proceeding to the next.**

**The LightMyFire application has excellent potential and solid architectural foundations - these are fixable technical issues that will unlock significant business value once resolved.**

---

*Generated: November 20, 2025*  
*Priority: Critical*  
*Estimated Impact: Restores revenue-generating functionality*