# Production Deployment Checklist

**Last Updated**: 2025-11-09
**Branch**: `claude/review-email-scheduling-011CUwFqqxSb1vAvHujowbBy`
**Status**: 10/61 critical tasks completed

---

## 1. Required Environment Variables

### NEW Variables to Add on Vercel

```bash
# CRITICAL - Required for internal API authentication
INTERNAL_AUTH_SECRET=<generate with: openssl rand -hex 32>

# CRITICAL - Required for admin testing mode (if needed)
ADMIN_TESTING_PASSWORD=<secure password - remove lightmyfire2025>

# Fulfillment email (defaults to mitch@lightmyfire.app if not set)
FULFILLMENT_EMAIL=mitch@lightmyfire.app
```

### Existing Variables (Verify Correct Names)

```bash
# Already configured - verify these exact names
PRINTFUL_API_KEY=<your_printful_key>
RESEND_API_KEY=<your_resend_key>
SUPABASE_SERVICE_ROLE_KEY=<your_service_role_key>
YOUTUBE_API_KEY=<your_youtube_key>
OPENAI_API_KEY=<your_openai_key>
EMAIL_PASSWORD=<your_email_password>
NEXT_PUBLIC_SITE_URL=https://lightmyfire.app
NEXT_PUBLIC_SUPABASE_URL=<your_supabase_url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your_anon_key>
STRIPE_SECRET_KEY=<your_stripe_secret>
```

---

## 2. Supabase/Database Tasks

### HIGH PRIORITY - Database Changes

#### A. Email Verification Requirement
**Task**: Implement email verification requirement
**SQL Migration**:
```sql
-- Add email_verified check to RPC functions
-- Modify create_new_post function
CREATE OR REPLACE FUNCTION create_new_post(
  p_lighter_id TEXT,
  p_title TEXT,
  p_content TEXT,
  p_post_type TEXT,
  p_image_url TEXT DEFAULT NULL,
  p_youtube_url TEXT DEFAULT NULL,
  p_location_lat FLOAT DEFAULT NULL,
  p_location_lng FLOAT DEFAULT NULL,
  p_location_name TEXT DEFAULT NULL
) RETURNS posts AS $$
DECLARE
  v_post posts;
  v_user_id UUID;
BEGIN
  -- Get authenticated user
  v_user_id := auth.uid();

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;

  -- Check if email is verified
  IF NOT EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = v_user_id
    AND email_confirmed_at IS NOT NULL
  ) THEN
    RAISE EXCEPTION 'Email verification required';
  END IF;

  -- Check 24-hour cooldown
  IF EXISTS (
    SELECT 1 FROM posts
    WHERE lighter_id = p_lighter_id
    AND user_id = v_user_id
    AND created_at > NOW() - INTERVAL '24 hours'
  ) THEN
    RAISE EXCEPTION 'Must wait 24 hours between posts on same lighter';
  END IF;

  -- Insert post
  INSERT INTO posts (
    lighter_id, user_id, title, content, post_type,
    image_url, youtube_url, location_lat, location_lng, location_name
  ) VALUES (
    p_lighter_id, v_user_id, p_title, p_content, p_post_type,
    p_image_url, p_youtube_url, p_location_lat, p_location_lng, p_location_name
  ) RETURNING * INTO v_post;

  RETURN v_post;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

#### B. Order Processing Idempotency
**Task**: Make order processing idempotent
**SQL Migration**:
```sql
-- Add unique constraint to prevent duplicate orders
ALTER TABLE sticker_orders
ADD CONSTRAINT unique_payment_intent
UNIQUE (payment_intent_id);

-- Add index for performance
CREATE INDEX idx_sticker_orders_payment_intent
ON sticker_orders(payment_intent_id);

-- Add processing_started_at column for lock detection
ALTER TABLE sticker_orders
ADD COLUMN IF NOT EXISTS processing_started_at TIMESTAMPTZ;

-- Add index for concurrent processing detection
CREATE INDEX idx_sticker_orders_processing
ON sticker_orders(payment_intent_id, processing_started_at);
```

#### C. Auto-block High Severity Content
**Task**: Auto-block high severity moderated content
**SQL Migration**:
```sql
-- Add auto_blocked column to posts
ALTER TABLE posts
ADD COLUMN IF NOT EXISTS auto_blocked BOOLEAN DEFAULT FALSE;

-- Add index for moderation queries
CREATE INDEX idx_posts_moderation_status
ON posts(moderation_status, auto_blocked);

-- Update RPC function to auto-block
CREATE OR REPLACE FUNCTION moderate_post(
  p_post_id INT,
  p_action TEXT,
  p_moderator_notes TEXT DEFAULT NULL
) RETURNS posts AS $$
DECLARE
  v_post posts;
  v_moderator_id UUID;
BEGIN
  v_moderator_id := auth.uid();

  -- Auto-block if flagged-severe
  IF p_action = 'flagged-severe' THEN
    UPDATE posts
    SET moderation_status = p_action,
        auto_blocked = TRUE,
        moderated_by = v_moderator_id,
        moderated_at = NOW(),
        moderator_notes = p_moderator_notes
    WHERE id = p_post_id
    RETURNING * INTO v_post;
  ELSE
    UPDATE posts
    SET moderation_status = p_action,
        auto_blocked = FALSE,
        moderated_by = v_moderator_id,
        moderated_at = NOW(),
        moderator_notes = p_moderator_notes
    WHERE id = p_post_id
    RETURNING * INTO v_post;
  END IF;

  RETURN v_post;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

#### D. Rate Limiting for flag_post RPC
**Task**: Add rate limiting to flag_post RPC function
**SQL Migration**:
```sql
-- Create flag_attempts tracking table
CREATE TABLE IF NOT EXISTS flag_attempts (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id INT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  flagged_at TIMESTAMPTZ DEFAULT NOW(),
  ip_address TEXT
);

-- Add indexes
CREATE INDEX idx_flag_attempts_user_time
ON flag_attempts(user_id, flagged_at DESC);

CREATE INDEX idx_flag_attempts_post
ON flag_attempts(post_id);

-- Update flag_post function with rate limiting
CREATE OR REPLACE FUNCTION flag_post(p_post_id INT)
RETURNS BOOLEAN AS $$
DECLARE
  v_user_id UUID;
  v_recent_flags INT;
BEGIN
  v_user_id := auth.uid();

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;

  -- Check if user has flagged more than 5 posts in last hour
  SELECT COUNT(*) INTO v_recent_flags
  FROM flag_attempts
  WHERE user_id = v_user_id
  AND flagged_at > NOW() - INTERVAL '1 hour';

  IF v_recent_flags >= 5 THEN
    RAISE EXCEPTION 'Rate limit exceeded. Maximum 5 flags per hour.';
  END IF;

  -- Log the flag attempt
  INSERT INTO flag_attempts (user_id, post_id)
  VALUES (v_user_id, p_post_id);

  -- Update post moderation status
  UPDATE posts
  SET moderation_status = 'flagged',
      flag_count = COALESCE(flag_count, 0) + 1
  WHERE id = p_post_id;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

#### E. Performance Optimization Indexes
**Task**: Add database indexes for performance optimization
**SQL Migration**:
```sql
-- Posts table indexes
CREATE INDEX IF NOT EXISTS idx_posts_lighter_created
ON posts(lighter_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_posts_user_created
ON posts(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_posts_moderation
ON posts(moderation_status)
WHERE moderation_status != 'approved';

CREATE INDEX IF NOT EXISTS idx_posts_lighter_user_recent
ON posts(lighter_id, user_id, created_at DESC);

-- Lighters table indexes
CREATE INDEX IF NOT EXISTS idx_lighters_user
ON lighters(user_id);

CREATE INDEX IF NOT EXISTS idx_lighters_pin
ON lighters(pin_code);

-- Likes table indexes
CREATE INDEX IF NOT EXISTS idx_likes_post
ON likes(post_id);

CREATE INDEX IF NOT EXISTS idx_likes_user_post
ON likes(user_id, post_id);

-- Sticker orders indexes
CREATE INDEX IF NOT EXISTS idx_sticker_orders_user
ON sticker_orders(user_id);

CREATE INDEX IF NOT EXISTS idx_sticker_orders_status
ON sticker_orders(fulfillment_status);

-- Trophies indexes
CREATE INDEX IF NOT EXISTS idx_trophies_user
ON trophies(user_id);

CREATE INDEX IF NOT EXISTS idx_trophies_lighter
ON trophies(lighter_id);
```

#### F. Moderation Action Logging
**Task**: Add moderator action logging to database
**SQL Migration**:
```sql
-- Create moderation_logs table
CREATE TABLE IF NOT EXISTS moderation_logs (
  id BIGSERIAL PRIMARY KEY,
  post_id INT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  moderator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  previous_status TEXT,
  new_status TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes
CREATE INDEX idx_moderation_logs_post
ON moderation_logs(post_id, created_at DESC);

CREATE INDEX idx_moderation_logs_moderator
ON moderation_logs(moderator_id, created_at DESC);

-- Add RLS policies
ALTER TABLE moderation_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Moderators can view all logs"
ON moderation_logs FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'moderator')
  )
);
```

### MEDIUM PRIORITY - Database Changes

#### G. Lighter Ownership Validation
**Task**: Add lighter ownership validation before post creation
**Note**: Add check in `create_new_post` RPC function
```sql
-- Add to create_new_post function after authentication check
IF NOT EXISTS (
  SELECT 1 FROM lighters
  WHERE id = p_lighter_id
  AND (user_id = v_user_id OR user_id IS NULL)
) THEN
  RAISE EXCEPTION 'You do not own this lighter';
END IF;
```

#### H. Post Text Length Validation
**Task**: Implement post text length validation (max 500 chars)
**SQL Migration**:
```sql
-- Add constraint to posts table
ALTER TABLE posts
ADD CONSTRAINT content_length_check
CHECK (LENGTH(content) <= 500);
```

#### I. Location Coordinates Validation
**Task**: Add validation for location coordinates range
**SQL Migration**:
```sql
-- Add constraints to posts table
ALTER TABLE posts
ADD CONSTRAINT lat_range_check
CHECK (location_lat IS NULL OR (location_lat >= -90 AND location_lat <= 90));

ALTER TABLE posts
ADD CONSTRAINT lng_range_check
CHECK (location_lng IS NULL OR (location_lng >= -180 AND location_lng <= 180));
```

---

## 3. Vercel/Code Tasks

### HIGH PRIORITY - Code Changes

#### A. Password Reset Email Validation
**File**: `app/api/auth/reset-password/route.ts`
**Changes Needed**:
```typescript
// Validate email format before processing
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(email)) {
  return NextResponse.json(
    { error: 'Invalid email format' },
    { status: 400 }
  );
}

// Check if user exists before sending reset
const { data: user } = await supabase.auth.admin.getUserByEmail(email);
if (!user) {
  // Return success anyway to prevent email enumeration
  return NextResponse.json({
    success: true,
    message: 'If this email exists, a reset link has been sent'
  });
}
```

#### B. Timing-Safe Comparison for Webhooks
**Files**:
- `app/api/webhooks/printful/route.ts`
- `app/api/webhooks/stripe/route.ts` (if exists)

**Changes Needed**:
```typescript
import crypto from 'crypto';

// Instead of direct string comparison
const isValid = crypto.timingSafeEqual(
  Buffer.from(receivedSignature),
  Buffer.from(expectedSignature)
);
```

#### C. Limit Data Exposure in my-orders Endpoint
**File**: `app/api/my-orders/route.ts`
**Changes Needed**:
```typescript
// Only return necessary fields, exclude sensitive data
const { data: orders } = await supabase
  .from('sticker_orders')
  .select(`
    id,
    created_at,
    quantity,
    amount_paid,
    shipping_name,
    shipping_address,
    shipping_city,
    shipping_postal_code,
    shipping_country,
    fulfillment_status,
    tracking_number
  `)
  .eq('user_id', session.user.id)
  .order('created_at', { ascending: false });

// DO NOT return: payment_intent_id, sticker_file_url, lighter_ids
```

#### D. OpenAI API Key Validation on Startup
**File**: `app/api/moderate-content/route.ts`
**Add validation**:
```typescript
// At top of file
if (!process.env.OPENAI_API_KEY) {
  console.error('CRITICAL: OPENAI_API_KEY not configured. Content moderation will fail.');
}

// In POST handler
if (!process.env.OPENAI_API_KEY) {
  return NextResponse.json(
    { error: 'Moderation service not configured' },
    { status: 503 }
  );
}
```

#### E. Actual Moderation Result Logging
**File**: `app/api/moderate-content/route.ts`
**Changes Needed**:
```typescript
// Log full moderation results for audit trail
console.log('Moderation result:', {
  timestamp: new Date().toISOString(),
  userId: session?.user?.id,
  contentType: type,
  contentPreview: content.substring(0, 100),
  flagged: moderation.flagged,
  categories: moderation.categories,
  categoryScores: moderation.category_scores,
  decision: moderation.flagged ? 'BLOCKED' : 'APPROVED'
});

// Store in database if flagged
if (moderation.flagged) {
  await supabaseAdmin
    .from('moderation_logs')
    .insert({
      content_type: type,
      content_hash: crypto.createHash('sha256').update(content).digest('hex'),
      flagged: true,
      categories: moderation.categories,
      category_scores: moderation.category_scores,
      user_id: session?.user?.id
    });
}
```

#### F. View Full Content Button for Moderators
**File**: `app/[locale]/admin/moderation/page.tsx`
**Add expansion UI**:
```typescript
// Add state for expanded posts
const [expandedPosts, setExpandedPosts] = useState<Set<number>>(new Set());

// In post rendering
<div className="post-content">
  <p className={expandedPosts.has(post.id) ? '' : 'line-clamp-3'}>
    {post.content}
  </p>
  {post.content.length > 150 && (
    <button
      onClick={() => {
        const newExpanded = new Set(expandedPosts);
        if (newExpanded.has(post.id)) {
          newExpanded.delete(post.id);
        } else {
          newExpanded.add(post.id);
        }
        setExpandedPosts(newExpanded);
      }}
      className="text-blue-600 hover:underline text-sm mt-2"
    >
      {expandedPosts.has(post.id) ? t('admin.show_less') : t('admin.view_full')}
    </button>
  )}
</div>
```

### MEDIUM PRIORITY - Code Changes

#### G. Fix Payment Intent Double-Retrieval
**File**: `app/api/process-sticker-order/route.ts`
**Line 240**: Remove redundant Stripe call
```typescript
// BEFORE (inefficient)
amount_paid: await stripe.paymentIntents.retrieve(paymentIntentId).then(pi => pi.amount),

// AFTER (use already retrieved paymentIntent)
amount_paid: paymentIntent.amount,
```

#### H. Webhook Timestamp Validation
**File**: `app/api/webhooks/printful/route.ts`
**Add timestamp check**:
```typescript
// Add header check
const timestamp = request.headers.get('x-printful-timestamp');
if (timestamp) {
  const requestTime = parseInt(timestamp);
  const currentTime = Date.now() / 1000;

  // Reject requests older than 5 minutes
  if (Math.abs(currentTime - requestTime) > 300) {
    return NextResponse.json(
      { error: 'Request timestamp invalid' },
      { status: 401 }
    );
  }
}
```

#### I. Debounce Like Button
**File**: `components/LikeButton.tsx`
**Add debouncing**:
```typescript
import { useState, useCallback } from 'react';

const [isProcessing, setIsProcessing] = useState(false);

const handleLike = useCallback(async () => {
  if (isProcessing) return;

  setIsProcessing(true);
  try {
    // ... existing like logic
  } finally {
    setTimeout(() => setIsProcessing(false), 500);
  }
}, [isProcessing, /* other deps */]);
```

#### J. Handle Deleted Users vs Anonymous Posts
**Files**: Various post display components
**Add distinction**:
```typescript
// In post queries
const { data: posts } = await supabase
  .from('posts')
  .select(`
    *,
    profiles:user_id (
      id,
      username,
      avatar_url,
      deleted_at
    )
  `);

// In rendering
const displayName = post.profiles?.deleted_at
  ? t('post.deleted_user')
  : (post.profiles?.username || t('post.anonymous'));
```

#### K. Trophy Grant Retry Mechanism
**File**: `lib/trophies.ts` (or relevant trophy logic file)
**Add retry logic**:
```typescript
async function grantTrophy(userId: string, trophyType: string, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const { data, error } = await supabase
        .from('trophies')
        .insert({ user_id: userId, trophy_type: trophyType });

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error(`Trophy grant attempt ${attempt} failed:`, error);

      if (attempt === maxRetries) {
        // Log to admin for manual review
        console.error('Trophy grant failed after all retries:', {
          userId,
          trophyType,
          error
        });
        return { success: false, error };
      }

      // Wait before retry (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
}
```

#### L. Image Dimensions and File Type Validation
**File**: `app/api/upload-image/route.ts`
**Add validation**:
```typescript
import sharp from 'sharp';

// Validate file type
const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
if (!allowedTypes.includes(file.type)) {
  return NextResponse.json(
    { error: 'Invalid file type. Only JPEG, PNG, and WebP allowed.' },
    { status: 400 }
  );
}

// Validate dimensions
const metadata = await sharp(buffer).metadata();
if (metadata.width > 4096 || metadata.height > 4096) {
  return NextResponse.json(
    { error: 'Image too large. Maximum 4096x4096 pixels.' },
    { status: 400 }
  );
}

// Validate file size (already have buffer)
if (buffer.length > 5 * 1024 * 1024) { // 5MB
  return NextResponse.json(
    { error: 'File too large. Maximum 5MB.' },
    { status: 400 }
  );
}
```

#### M. Lighter Pass Transaction Handling
**File**: `app/api/pass-lighter/route.ts`
**Wrap in transaction**:
```typescript
// Use Supabase RPC for atomic operation
const { data, error } = await supabase.rpc('transfer_lighter', {
  p_lighter_id: lighterId,
  p_new_user_id: newUserId,
  p_location_lat: locationLat,
  p_location_lng: locationLng
});

// Create RPC function in Supabase:
/*
CREATE OR REPLACE FUNCTION transfer_lighter(
  p_lighter_id TEXT,
  p_new_user_id UUID,
  p_location_lat FLOAT,
  p_location_lng FLOAT
) RETURNS lighters AS $$
DECLARE
  v_lighter lighters;
BEGIN
  -- Update lighter ownership
  UPDATE lighters
  SET user_id = p_new_user_id,
      pass_count = pass_count + 1,
      current_location_lat = p_location_lat,
      current_location_lng = p_location_lng,
      updated_at = NOW()
  WHERE id = p_lighter_id
  RETURNING * INTO v_lighter;

  -- Log the transfer
  INSERT INTO lighter_transfers (
    lighter_id, from_user_id, to_user_id, transferred_at
  ) VALUES (
    p_lighter_id, v_lighter.user_id, p_new_user_id, NOW()
  );

  RETURN v_lighter;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
*/
```

#### N. Image Upload Race Condition
**File**: `app/[locale]/lighter/[id]/add/AddPostForm.tsx`
**Fix async handling**:
```typescript
// Ensure image upload completes before post creation
let finalImageUrl = null;

if (imageFile) {
  setUploadingImage(true);
  try {
    const uploadResult = await uploadImage(imageFile);
    if (!uploadResult.success) {
      setError(t('add_post.error.image_upload_failed'));
      return;
    }
    finalImageUrl = uploadResult.url;
  } catch (err) {
    setError(t('add_post.error.image_upload_failed'));
    return;
  } finally {
    setUploadingImage(false);
  }
}

// Now create post with uploaded image URL
const { data: post, error: postError } = await supabase
  .rpc('create_new_post', {
    p_lighter_id: lighterId,
    p_title: title,
    p_content: content,
    p_post_type: postType,
    p_image_url: finalImageUrl,
    // ...
  });
```

### LOW PRIORITY - Code Changes

#### O. Pagination for Posts
**File**: `app/[locale]/lighter/[id]/page.tsx`
**Add pagination**:
```typescript
const POSTS_PER_PAGE = 20;
const [page, setPage] = useState(0);

const { data: posts } = await supabase
  .from('posts')
  .select('*', { count: 'exact' })
  .eq('lighter_id', lighterId)
  .eq('moderation_status', 'approved')
  .order('created_at', { ascending: false })
  .range(page * POSTS_PER_PAGE, (page + 1) * POSTS_PER_PAGE - 1);
```

#### P. Payment Webhook Error Handling
**Files**: All webhook handlers
**Add comprehensive error handling**:
```typescript
try {
  // ... webhook processing
} catch (error) {
  console.error('Webhook processing failed:', {
    error: error instanceof Error ? error.message : 'Unknown error',
    stack: error instanceof Error ? error.stack : undefined,
    webhookData: JSON.stringify(body).substring(0, 500)
  });

  // Return 200 to prevent retries for client errors
  if (error instanceof Error && error.message.includes('validation')) {
    return NextResponse.json(
      { error: 'Invalid webhook data', received: true },
      { status: 200 }
    );
  }

  // Return 500 for server errors to trigger retry
  return NextResponse.json(
    { error: 'Internal server error' },
    { status: 500 }
  );
}
```

---

## 4. Testing Checklist

### Critical Features to Test Before Launch

- [ ] **User Registration & Login**
  - [ ] Email verification required
  - [ ] Cannot post without verified email
  - [ ] Session persists correctly
  - [ ] Logout clears all storage

- [ ] **Sticker Ordering**
  - [ ] Payment amount calculated server-side
  - [ ] Pack sizes validated (10, 20, 50)
  - [ ] Shipping rates validated (0-5000 cents)
  - [ ] Order idempotency (no duplicate orders)
  - [ ] Fulfillment email sent to mitch@lightmyfire.app
  - [ ] Customer confirmation email sent
  - [ ] ZIP files created correctly for 2+ sheets
  - [ ] PNG files not corrupted

- [ ] **QR Code Generation**
  - [ ] Uses production URL (lightmyfire.app)
  - [ ] QR codes scan correctly
  - [ ] Links to correct lighter

- [ ] **Post Creation**
  - [ ] 24-hour cooldown enforced
  - [ ] Moderation runs on all posts
  - [ ] High severity content auto-blocked
  - [ ] Image uploads work
  - [ ] Location data saved correctly

- [ ] **Content Moderation**
  - [ ] OpenAI moderation API working
  - [ ] Flagged content requires review
  - [ ] Moderators can view full content
  - [ ] Moderation actions logged
  - [ ] Users not notified of moderation

- [ ] **Security**
  - [ ] No hardcoded passwords
  - [ ] HMAC tokens work correctly
  - [ ] Webhooks verify signatures
  - [ ] Rate limiting active
  - [ ] SQL injection prevented

- [ ] **Internationalization**
  - [ ] All UI text translated (EN, FR, DE, ES)
  - [ ] Launch announcement popup shows mitch@lightmyfire.app
  - [ ] Error messages translated
  - [ ] Email templates support all languages

---

## 5. Deployment Steps

### Step 1: Environment Variables
1. Add `INTERNAL_AUTH_SECRET` to Vercel
   ```bash
   openssl rand -hex 32
   ```
2. Update `ADMIN_TESTING_PASSWORD` (remove default)
3. Verify all other environment variables

### Step 2: Database Migrations
Run SQL migrations in order:
1. Email verification in RPC functions
2. Order idempotency constraints
3. Auto-block moderation updates
4. Rate limiting for flags
5. Performance indexes
6. Moderation logging table
7. Additional constraints

### Step 3: Code Deployment
1. Merge branch to main (after PR review)
2. Deploy to Vercel
3. Run smoke tests

### Step 4: Post-Deployment Verification
1. Test user registration flow
2. Create test sticker order
3. Verify emails received at mitch@lightmyfire.app
4. Test QR code scanning
5. Test post creation with cooldown
6. Test content moderation

---

## 6. Rollback Plan

If critical issues found after deployment:

1. **Immediate**: Revert Vercel deployment to previous version
2. **Database**: Migrations are backwards compatible (use `DROP` statements if needed)
3. **Monitoring**: Watch error logs for 24 hours post-deployment
4. **Support**: mitch@lightmyfire.app for user reports

---

## 7. Outstanding Questions

1. **Email Verification**: Should users be required to verify email before ANY action, or just before posting?
2. **Moderation Appeals**: Do we need an appeal mechanism for rejected posts?
3. **Order Fulfillment**: Manual process - need documentation for mitch on how to fulfill orders?
4. **Performance**: Expected user load? May need CDN/caching strategy.

---

## Summary Statistics

- **Completed**: 10 critical fixes
- **High Priority Remaining**: 11 tasks (6 database, 5 code)
- **Medium Priority Remaining**: 22 tasks (3 database, 19 code)
- **Low Priority Remaining**: 18 tasks (0 database, 18 code)
- **Total Remaining**: 51 tasks

**Estimated Time to Complete High Priority**: 8-12 hours
**Estimated Time to Complete All**: 30-40 hours
