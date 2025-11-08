# Quick Start: Production Deployment

## TL;DR - What You Need

### 1. Environment Variables (10 required)
```bash
# Copy .env.example to .env.local and fill these in:
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
RESEND_API_KEY=
FULFILLMENT_EMAIL=orders@yourdomain.com
YOUTUBE_API_KEY=
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

### 2. Stripe Setup (5 minutes)
1. Go to https://dashboard.stripe.com/webhooks
2. Click "Add endpoint"
3. URL: `https://yourdomain.com/api/webhooks/stripe`
4. Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`, `charge.refunded`
5. Copy signing secret to `STRIPE_WEBHOOK_SECRET`

### 3. Resend Email Setup (5 minutes)
1. Go to https://resend.com/domains
2. Add domain: `yourdomain.com`
3. Add DNS records (SPF, DKIM)
4. Get API key from https://resend.com/api-keys
5. Set `RESEND_API_KEY` and `FULFILLMENT_EMAIL`

### 4. Deploy
```bash
# Vercel (recommended)
vercel --prod

# Or build locally
npm run build
npm start
```

### 5. Test Payment Flow (15 minutes)
Use Stripe test card: `4242 4242 4242 4242`
- Create account
- Create lighter
- Order stickers
- Complete payment
- Check emails received
- Verify order in database

## What Was Fixed?

### Payment Flow
- Payment environment validation
- Better Stripe error handling
- Email sender domain fixed
- Enhanced webhook logging
- Environment variables documented

### Auth Flow
- Stronger passwords (8+ chars, uppercase, lowercase, number)
- Consistent URL construction
- Rate-limited password reset
- Better validation feedback

## When Things Go Wrong

### Payment not working?
1. Check Stripe webhook logs: https://dashboard.stripe.com/webhooks
2. Verify `STRIPE_SECRET_KEY` matches mode (test/live)
3. Check server logs for errors
4. Verify webhook endpoint is accessible

### Emails not sending?
1. Check Resend logs: https://resend.com/emails
2. Verify domain DNS records
3. Check `FULFILLMENT_EMAIL` is set
4. Look in spam folder

### Auth issues?
1. Check Supabase auth logs
2. Verify redirect URLs in Supabase dashboard
3. Check `NEXT_PUBLIC_APP_URL` is correct

## Production Checklist

Essential:
- [ ] All 10 environment variables set
- [ ] Stripe webhook configured
- [ ] Resend domain verified
- [ ] Test payment successful
- [ ] Test email delivery

Recommended:
- [ ] Set up error monitoring (Sentry, etc.)
- [ ] Configure backups
- [ ] Set up uptime monitoring
- [ ] Review DEPLOYMENT_CHECKLIST.md

## Support

- Full fixes documentation: `PRE_LAUNCH_FIXES_SUMMARY.md`
- Deployment checklist: `DEPLOYMENT_CHECKLIST.md`
- Environment variables: `.env.example`

**Status: Production Ready** ✅
