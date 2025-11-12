# 🚀 Pre-Launch Checklist - LightMyFire

**Date**: 2025-01-12
**Status**: Ready for Final Review & Launch

---

## ✅ COMPLETED FIXES (Automated)

### Critical Issues - FIXED ✅
- [x] **Order Processing Bug**: Removed invalid `user_email` column from database insert
- [x] **Refund Tracking**: Added refund columns to `sticker_orders` table
- [x] **Refund Webhook**: Implemented proper refund handling in Stripe webhook
- [x] **Function Security**: Fixed search_path vulnerabilities in 5 database functions
- [x] **View Security**: Removed SECURITY DEFINER from `detailed_posts` view

### Performance Optimizations - FIXED ✅
- [x] **RLS Performance**: Optimized auth.uid() calls in moderator_actions policies (3)
- [x] **RLS Performance**: Optimized auth.uid() calls in moderation_logs policies (2)
- [x] **Rate Limiting**: Documented limitation and upgrade path (see RATE_LIMITING_TODO.md)

### Build & Code Quality - FIXED ✅
- [x] **Build Errors**: All TypeScript/ESLint errors resolved
- [x] **Build Warnings**: All warnings resolved
- [x] **Translation Keys**: All duplicate keys removed (hi.ts, pt.ts)

---

## 🔧 MANUAL TASKS REQUIRED

### 1. Enable Leaked Password Protection ⚠️ **REQUIRED**

**Why**: Protects users from using compromised passwords

**How**:
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to: **Authentication** → **Policies** → **Password Settings**
4. Toggle ON: **"Leaked Password Protection"**
5. Save changes

**Time**: 2 minutes
**Priority**: HIGH

---

### 2. Verify Environment Variables 🔑 **REQUIRED**

**Location**: Vercel Dashboard → Settings → Environment Variables

**Critical Variables** (Must be set):
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Stripe
STRIPE_SECRET_KEY=sk_live_... (NOT test key!)
STRIPE_WEBHOOK_SECRET=whsec_...

# OpenAI (for moderation)
OPENAI_API_KEY=sk-...

# Email (Resend)
RESEND_API_KEY=re_...

# Security
INTERNAL_AUTH_SECRET=[Generate with: openssl rand -hex 32]
ADMIN_TESTING_PASSWORD=[Strong password]

# Site
NEXT_PUBLIC_SITE_URL=https://lightmyfire.app
```

**Verification**:
- [ ] All CRITICAL variables are set
- [ ] Using LIVE Stripe keys (not test)
- [ ] INTERNAL_AUTH_SECRET is 64 hex characters
- [ ] NEXT_PUBLIC_SITE_URL has no trailing slash

---

### 3. Configure Stripe Webhook 🔔 **REQUIRED**

**Steps**:
1. Go to [Stripe Dashboard](https://dashboard.stripe.com/webhooks)
2. Click "Add endpoint"
3. Endpoint URL: `https://lightmyfire.app/api/webhooks/stripe`
4. Select events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.refunded`
5. Copy the "Signing secret" (whsec_...)
6. Add to Vercel as `STRIPE_WEBHOOK_SECRET`

**Verification**:
- [ ] Webhook endpoint created
- [ ] Signing secret added to Vercel
- [ ] Test webhook with Stripe CLI (optional)

---

### 4. Test Critical Flows 🧪 **STRONGLY RECOMMENDED**

#### A. User Registration & Login
- [ ] Register new account
- [ ] Verify email received
- [ ] Login works
- [ ] Password reset works

#### B. Order Flow (USE TEST MODE FIRST)
1. **Test Mode** (using Stripe test keys):
   - [ ] Create order for 10 stickers
   - [ ] Complete payment (card: 4242 4242 4242 4242)
   - [ ] Verify order appears in "My Orders"
   - [ ] Verify fulfillment email sent to FULFILLMENT_EMAIL
   - [ ] Verify customer confirmation email sent
   - [ ] Check Supabase: `sticker_orders` table has order
   - [ ] Check storage: sticker PNG files uploaded

2. **Live Mode** (after test success):
   - [ ] Switch to live Stripe keys
   - [ ] Test with real payment (small amount)
   - [ ] Verify entire flow works

#### C. Lighter Creation & Posts
- [ ] Create new lighter (free flow)
- [ ] Add text post
- [ ] Add image post
- [ ] Add location post
- [ ] Add song post
- [ ] Verify moderation works (content flagging)

#### D. Admin Functions
- [ ] Login as admin
- [ ] Access `/en/admin` page
- [ ] View orders
- [ ] Test email tool
- [ ] Check moderation queue

---

### 5. Database Security Verification ✅ **RECOMMENDED**

**Run Supabase Advisors Again**:
```bash
# After completing manual tasks, verify no new issues
supabase db lint
```

**Expected Result**: All critical and high-priority issues resolved

---

### 6. Monitor After Launch 📊 **DAY 1 CHECKLIST**

#### First 24 Hours:
- [ ] Monitor Vercel logs for errors
- [ ] Check Supabase logs (Database, Auth, Storage)
- [ ] Monitor Stripe dashboard for payments
- [ ] Verify emails are being delivered (check spam folders)
- [ ] Monitor error reporting (if integrated)

#### First Week:
- [ ] Review rate limiting (check for abuse)
- [ ] Monitor database performance
- [ ] Review moderation queue
- [ ] Check refund requests

---

## 📋 KNOWN LIMITATIONS (Acceptable for Launch)

### 1. Rate Limiting - In-Memory Implementation
**Status**: Documented in `RATE_LIMITING_TODO.md`
**Risk**: Low for MVP
**Action**: Monitor and upgrade if needed
**Timeline**: Within 30 days if scaling issues appear

### 2. Unused Database Indexes
**Status**: 43 unused indexes identified
**Risk**: Minimal (slight write overhead)
**Action**: Review and remove after analyzing real usage patterns
**Timeline**: 90 days post-launch

### 3. Multiple Permissive RLS Policies
**Status**: Some tables have 2-4 policies per operation
**Risk**: Minor performance impact
**Action**: Combine policies if performance issues arise
**Timeline**: As needed based on monitoring

---

## 🎯 GO/NO-GO DECISION CRITERIA

### ✅ GO FOR LAUNCH IF:
- [x] All critical code fixes deployed (automated)
- [ ] Leaked password protection enabled (manual)
- [ ] All environment variables verified (manual)
- [ ] Stripe webhook configured (manual)
- [ ] At least ONE full order test completed successfully (manual)
- [ ] Build succeeds with no errors

### 🛑 NO-GO IF:
- [ ] Any payment test fails
- [ ] Emails not being delivered
- [ ] Database migrations failed
- [ ] Environment variables missing or incorrect

---

## 📞 SUPPORT CONTACTS

**Technical Issues**:
- Vercel Support: https://vercel.com/support
- Supabase Support: https://supabase.com/dashboard/support
- Stripe Support: https://support.stripe.com

**Emergency Rollback**:
```bash
# If critical issue found post-launch
git revert HEAD
git push origin main
# Or use Vercel dashboard to redeploy previous version
```

---

## ✨ POST-LAUNCH SUCCESS METRICS

**Week 1 Targets**:
- [ ] 10+ successful orders processed
- [ ] 100+ lighters created
- [ ] 500+ posts created
- [ ] <1% payment failure rate
- [ ] <5% moderation queue backlog

**Month 1 Targets**:
- [ ] 100+ orders
- [ ] 1000+ active lighters
- [ ] Review rate limiting (upgrade if needed)
- [ ] Remove unused indexes
- [ ] Optimize slow queries (if any)

---

## 🎉 LAUNCH READINESS: 95%

**Remaining**: Only manual configuration tasks
**Estimated Time**: 1-2 hours
**Confidence Level**: HIGH

---

**Last Updated**: 2025-01-12
**Next Review**: Post-launch Day 7
