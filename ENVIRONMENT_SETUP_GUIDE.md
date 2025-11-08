# 🔐 LightMyFire Environment Variables - Complete Setup Guide

This guide covers all environment variables needed for **Vercel deployment** and **GitHub Actions**.

---

## 📋 Complete Environment Variables List

### **Required for All Environments**

| Variable | Type | Description | Where to Get |
|----------|------|-------------|--------------|
| `NEXT_PUBLIC_BASE_URL` | Public | Production URL | `https://lightmyfire.app` |
| `NEXT_PUBLIC_SUPABASE_URL` | Public | Supabase project URL | [Supabase Dashboard](https://supabase.com/dashboard) → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public | Supabase anonymous key | [Supabase Dashboard](https://supabase.com/dashboard) → Project Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Secret | Supabase service role key | [Supabase Dashboard](https://supabase.com/dashboard) → Project Settings → API |
| `OPENAI_API_KEY` | Secret | OpenAI API key for moderation | [OpenAI Platform](https://platform.openai.com/api-keys) |
| `STRIPE_SECRET_KEY` | Secret | Stripe secret key | [Stripe Dashboard](https://dashboard.stripe.com/apikeys) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Public | Stripe publishable key | [Stripe Dashboard](https://dashboard.stripe.com/apikeys) |
| `STRIPE_WEBHOOK_SECRET` | Secret | Stripe webhook signing secret | [Stripe Dashboard](https://dashboard.stripe.com/webhooks) |
| `RESEND_API_KEY` | Secret | Resend email API key | [Resend Dashboard](https://resend.com/api-keys) |
| `PRINTFUL_API_KEY` | Secret | Printful fulfillment API key | [Printful Dashboard](https://www.printful.com/dashboard/settings) |
| `YOUTUBE_API_KEY` | Secret | YouTube Data API v3 key | [Google Cloud Console](https://console.cloud.google.com/apis/credentials) |

### **Optional Variables**

| Variable | Type | Description | Default |
|----------|------|-------------|---------|
| `FULFILLMENT_EMAIL` | Config | Email for order notifications | `editionsrevel@gmail.com` |
| `PRINTFUL_WEBHOOK_SECRET` | Secret | Printful webhook verification | None (webhooks disabled) |
| `NEXT_PUBLIC_SITE_URL` | Public | Alternative site URL | Falls back to `BASE_URL` |
| `NEXT_PUBLIC_VERCEL_URL` | Auto | Auto-set by Vercel | Auto-generated |
| `NODE_ENV` | Auto | Environment mode | Auto-set by platform |

---

## 🚀 Vercel Deployment Setup

### **Step 1: Add Environment Variables to Vercel**

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project → **Settings** → **Environment Variables**
3. Add each variable below:

#### **Production Environment Variables**

```bash
# Application
NEXT_PUBLIC_BASE_URL=https://lightmyfire.app

# Supabase (Production)
NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_production_service_role_key

# Stripe (LIVE Keys)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
STRIPE_SECRET_KEY=sk_live_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# OpenAI
OPENAI_API_KEY=sk-xxxxx

# Resend (Production Domain)
RESEND_API_KEY=re_xxxxx

# Printful
PRINTFUL_API_KEY=xTZ2qeNGU4Zs6VkoBCNcilV2x2zLX4dWbBdNZoHh
PRINTFUL_WEBHOOK_SECRET=your_webhook_secret

# YouTube
YOUTUBE_API_KEY=xxxxx

# Email
FULFILLMENT_EMAIL=editionsrevel@gmail.com
```

#### **Preview/Development Environment Variables**

For preview deployments, use TEST keys:

```bash
# Stripe (TEST Keys for preview)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_test_xxxxx
```

### **Step 2: Environment Selection**

For each variable in Vercel, select which environments to apply:
- ✅ **Production** - Live site
- ✅ **Preview** - PR previews and branches
- ✅ **Development** - Local development (optional)

### **Step 3: Redeploy**

After adding variables:
1. Go to **Deployments** tab
2. Click **⋮** menu on latest deployment
3. Select **Redeploy**

---

## 🔒 GitHub Secrets Setup

### **Step 1: Add Repository Secrets**

1. Go to your GitHub repository
2. **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**

### **Required Secrets for GitHub Actions**

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Stripe (use TEST keys for CI/CD)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_test_xxxxx

# OpenAI
OPENAI_API_KEY=sk-xxxxx

# Resend
RESEND_API_KEY=re_xxxxx

# Printful
PRINTFUL_API_KEY=xTZ2qeNGU4Zs6VkoBCNcilV2x2zLX4dWbBdNZoHh

# YouTube
YOUTUBE_API_KEY=xxxxx

# Application
NEXT_PUBLIC_BASE_URL=https://lightmyfire.app
FULFILLMENT_EMAIL=editionsrevel@gmail.com
```

### **Step 2: GitHub Actions Workflow**

If you have a `.github/workflows/*.yml` file, ensure it references secrets:

```yaml
env:
  NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
  NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}
  SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
  STRIPE_SECRET_KEY: ${{ secrets.STRIPE_SECRET_KEY }}
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: ${{ secrets.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY }}
  OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
  RESEND_API_KEY: ${{ secrets.RESEND_API_KEY }}
  PRINTFUL_API_KEY: ${{ secrets.PRINTFUL_API_KEY }}
  YOUTUBE_API_KEY: ${{ secrets.YOUTUBE_API_KEY }}
  NEXT_PUBLIC_BASE_URL: ${{ secrets.NEXT_PUBLIC_BASE_URL }}
```

---

## 🧪 Local Development Setup

### **Step 1: Create `.env.local`**

```bash
# Copy the example file
cp .env.example .env.local
```

### **Step 2: Fill in Your Values**

Edit `.env.local` with your actual credentials:

```bash
# Application
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Supabase (Development Project)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Stripe (TEST Keys)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_test_xxxxx

# OpenAI
OPENAI_API_KEY=sk-xxxxx

# Resend (Development)
RESEND_API_KEY=re_xxxxx

# Printful (same for all environments)
PRINTFUL_API_KEY=xTZ2qeNGU4Zs6VkoBCNcilV2x2zLX4dWbBdNZoHh

# YouTube
YOUTUBE_API_KEY=xxxxx

# Email
FULFILLMENT_EMAIL=editionsrevel@gmail.com
```

### **Step 3: Verify Setup**

```bash
npm run dev
```

Check the console for any missing environment variable warnings.

---

## ✅ Environment Variables Checklist

### **Critical (App Won't Work Without These)**
- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- [ ] `STRIPE_SECRET_KEY`
- [ ] `RESEND_API_KEY`

### **Important (Core Features Disabled Without These)**
- [ ] `OPENAI_API_KEY` - Content moderation
- [ ] `PRINTFUL_API_KEY` - Order fulfillment & live shipping rates
- [ ] `YOUTUBE_API_KEY` - Song post search

### **Optional (Fallbacks Exist)**
- [ ] `STRIPE_WEBHOOK_SECRET` - Payment event handling
- [ ] `PRINTFUL_WEBHOOK_SECRET` - Order status updates
- [ ] `FULFILLMENT_EMAIL` - Order notification recipient

---

## 🔐 Security Best Practices

### **Never Commit These to Git:**
- `.env.local`
- `.env.production`
- Any file containing actual API keys

### **Public vs Secret Variables**

**NEXT_PUBLIC_* = Visible in Browser**
- Only use for non-sensitive data
- Safe: URLs, feature flags, public API keys
- Exposed in client-side JavaScript

**No Prefix = Server-Only**
- Used for sensitive credentials
- Never exposed to browser
- Only accessible in API routes and server components

### **Rotation Strategy**

Rotate these keys regularly:
1. `STRIPE_SECRET_KEY` - Every 90 days
2. `SUPABASE_SERVICE_ROLE_KEY` - Every 90 days
3. `OPENAI_API_KEY` - Every 90 days
4. `RESEND_API_KEY` - Every 90 days

---

## 🐛 Troubleshooting

### **"Environment variable not found" Error**

1. Check spelling matches exactly (case-sensitive)
2. Restart Next.js dev server after adding new variables
3. Verify variable is in correct environment (Vercel/GitHub)

### **Vercel Preview Using Wrong Environment**

1. Go to **Settings** → **Environment Variables**
2. Ensure variables are checked for **Preview** environment
3. Redeploy the preview branch

### **GitHub Actions Failing**

1. Check **Settings** → **Secrets and variables** → **Actions**
2. Verify all secrets are added
3. Check workflow file uses `${{ secrets.VARIABLE_NAME }}`

### **Stripe Webhooks Not Working**

1. Set up webhook endpoint in Stripe Dashboard:
   - URL: `https://lightmyfire.app/api/webhooks/stripe`
   - Events: `payment_intent.succeeded`, `payment_intent.payment_failed`
2. Copy webhook signing secret to `STRIPE_WEBHOOK_SECRET`

### **Printful Webhooks Not Working**

1. Set up webhook in Printful Dashboard:
   - URL: `https://lightmyfire.app/api/webhooks/printful`
   - Events: `order_created`, `order_updated`, `order_fulfilled`
2. Copy webhook secret to `PRINTFUL_WEBHOOK_SECRET`

---

## 📚 Additional Resources

- [Vercel Environment Variables Docs](https://vercel.com/docs/environment-variables)
- [Next.js Environment Variables Guide](https://nextjs.org/docs/basic-features/environment-variables)
- [GitHub Encrypted Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [Supabase API Keys](https://supabase.com/docs/guides/api/api-keys)
- [Stripe API Keys](https://stripe.com/docs/keys)
- [Printful API Docs](https://developers.printful.com/)

---

## 🎯 Quick Copy-Paste Templates

### **For Vercel** (Production)
```env
NEXT_PUBLIC_BASE_URL=https://lightmyfire.app
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
OPENAI_API_KEY=
RESEND_API_KEY=
PRINTFUL_API_KEY=xTZ2qeNGU4Zs6VkoBCNcilV2x2zLX4dWbBdNZoHh
YOUTUBE_API_KEY=
FULFILLMENT_EMAIL=editionsrevel@gmail.com
```

### **For GitHub Actions**
Same as above - copy all variables to GitHub Secrets.

### **For Local Development**
Copy `.env.example` to `.env.local` and fill in test/development keys.

---

**Last Updated:** 2025-01-08
**Maintainer:** LightMyFire Team
**Contact:** editionsrevel@gmail.com
