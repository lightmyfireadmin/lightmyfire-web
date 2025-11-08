# LightMyFire Production Deployment Checklist

## Pre-Launch Environment Variables

### Critical - Must Be Set
- [ ] `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- [ ] `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (server-only)
- [ ] `STRIPE_SECRET_KEY` - Stripe secret key for payment processing
- [ ] `STRIPE_WEBHOOK_SECRET` - Stripe webhook signature verification secret
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe publishable key
- [ ] `RESEND_API_KEY` - Resend API key for sending emails
- [ ] `FULFILLMENT_EMAIL` - Email address for order fulfillment notifications
- [ ] `YOUTUBE_API_KEY` - YouTube API key for music search
- [ ] `NEXT_PUBLIC_APP_URL` - Full production URL (e.g., https://lightmyfire.app)

## Payment Flow Verification

### Stripe Configuration
- [ ] Stripe account in production mode (not test mode)
- [ ] Payment intents enabled in Stripe dashboard
- [ ] Webhook endpoint configured: `https://yourdomain.com/api/webhooks/stripe`
- [ ] Webhook events subscribed to:
  - `payment_intent.succeeded`
  - `payment_intent.payment_failed`
  - `charge.refunded`
- [ ] Webhook signing secret copied to `STRIPE_WEBHOOK_SECRET`
- [ ] Currency set to EUR in pricing configuration

### Test Payment Flow
- [ ] Create a test order with real Stripe test card
- [ ] Verify payment intent created successfully
- [ ] Verify payment confirmation works
- [ ] Verify lighters created in database
- [ ] Verify sticker file generated and uploaded to storage
- [ ] Verify fulfillment email sent to `FULFILLMENT_EMAIL`
- [ ] Verify customer confirmation email sent
- [ ] Check Stripe webhook logs for successful delivery

### Email Configuration (Resend)
- [ ] Domain verified in Resend dashboard
- [ ] DNS records configured (SPF, DKIM)
- [ ] Sender email verified: `orders@lightmyfire.app`
- [ ] Test fulfillment email delivery
- [ ] Test customer confirmation email delivery
- [ ] Check spam folder to ensure deliverability

## Authentication Flow Verification

### Basic Auth Tests
- [ ] Email/password signup works
- [ ] Email/password login works
- [ ] Google OAuth login works
- [ ] Session persists across page reloads
- [ ] Logout works correctly

### Password Reset Flow
- [ ] Forgot password form submits
- [ ] Reset email received (check spam folder)
- [ ] Reset link redirects to correct URL
- [ ] New password meets requirements (8+ chars, uppercase, lowercase, number)
- [ ] Password change succeeds
- [ ] Can login with new password

### Security Checks
- [ ] Rate limiting active on payment endpoints (5 req/min)
- [ ] Rate limiting active on password reset (3 req/hour)
- [ ] Session expires appropriately
- [ ] Protected routes redirect to login when unauthenticated

## Database Health

### Supabase Configuration
- [ ] Row Level Security (RLS) enabled on all tables
- [ ] Service role key kept secret (never exposed to client)
- [ ] Database migrations applied successfully
- [ ] RPC functions working:
  - `create_bulk_lighters`
  - `update_order_payment_succeeded`
  - `grant_unlocked_trophies`

### Storage Buckets
- [ ] `sticker-orders` bucket exists
- [ ] Proper permissions configured
- [ ] File upload works
- [ ] Signed URLs generate correctly

## Error Handling & Monitoring

### Payment Error Scenarios
- [ ] Insufficient funds - shows user-friendly error
- [ ] Card declined - shows user-friendly error
- [ ] Network timeout - shows retry message
- [ ] Stripe API error - logs to console, shows generic error to user

### Auth Error Scenarios
- [ ] Invalid email format - validation error shown
- [ ] Weak password - requirements shown
- [ ] Account doesn't exist - appropriate message
- [ ] Too many requests - rate limit message shown

### Logging
- [ ] Critical errors logged with context
- [ ] Payment successes logged with order details
- [ ] Failed payments logged with error codes
- [ ] Webhook events logged

## Performance & Optimization

- [ ] Images optimized with Next.js Image component
- [ ] Static pages pre-rendered where possible
- [ ] API routes have appropriate caching headers
- [ ] Rate limiting in place to prevent abuse

## Security Hardening

- [ ] All environment variables use strong, unique values
- [ ] No sensitive data in client-side code
- [ ] HTTPS enforced in production
- [ ] CORS configured appropriately
- [ ] Content Security Policy headers set (if applicable)

## Post-Deployment Verification

### Immediate Checks (within 1 hour)
- [ ] Homepage loads correctly
- [ ] Create account flow works
- [ ] Create a lighter works
- [ ] Test payment with Stripe test card (if in test mode)
- [ ] Check error tracking service for any crashes

### First 24 Hours
- [ ] Monitor Stripe dashboard for payment activity
- [ ] Check email deliverability rates
- [ ] Monitor server logs for unexpected errors
- [ ] Verify webhook success rate is high (>95%)

### First Week
- [ ] Review user-reported issues
- [ ] Analyze payment success rate
- [ ] Check for any failed email deliveries
- [ ] Monitor database performance

## Rollback Plan

If critical issues occur:
1. Identify the issue through logs
2. If payment-related, pause Stripe payments temporarily
3. If auth-related, communicate with users via email
4. Deploy fix or rollback to previous version
5. Verify fix in staging environment first
6. Re-deploy to production
7. Monitor closely for 24 hours

## Support Contacts

- Stripe Support: https://support.stripe.com
- Supabase Support: https://supabase.com/support
- Resend Support: https://resend.com/support

## Notes

- All fixes applied on: [Date]
- Pre-launch review completed by: [Name]
- Production deployment date: [Date]
