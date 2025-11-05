# 🚀 Deployment Guide for lightmyfire.app

## Current Status
✅ **Local Development**: All environment variables configured correctly in `.env.local`
⚠️ **Production**: Environment variables need to be configured on hosting platform

---

## Required Environment Variables for Production

### 1. **Supabase Configuration**
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```
**Get from**: `.env.local` file in your local project
**Note**: NEXT_PUBLIC_ variables are exposed to the browser (this is intentional)

### 3. **YouTube API** (⚠️ Server-side only - REQUIRED FOR FIX)
```bash
YOUTUBE_API_KEY=your_youtube_api_key_here
```
**Status**: ❌ Currently missing on production - causing 500 errors
**Get from**: `.env.local` file in your local project

### 4. **OpenAI API** (⚠️ Server-side only - SENSITIVE)
```bash
OPENAI_API_KEY=your_openai_api_key_here
```
**Get from**: `.env.local` file in your local project

### 5. **Stripe Live Keys** (⚠️ SENSITIVE - Live payment processing)
```bash
# Public key (can be exposed to client)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key_here

# Secret key (server-side only)
STRIPE_SECRET_KEY=your_stripe_secret_key_here

# Webhook secret (server-side only)
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret_here
```
**Get from**: `.env.local` file in your local project

### 6. **Email Notifications** (⚠️ Server-side only)
```bash
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_email_app_password_here
```
**Get from**: `.env.local` file in your local project

---

## Platform-Specific Setup Instructions

### **If Using Vercel** (Most Common for Next.js)

1. **Navigate to your project on Vercel Dashboard**
   - Go to https://vercel.com/dashboard
   - Select your `lightmyfire-web` project

2. **Add Environment Variables**
   - Click **Settings** → **Environment Variables**
   - Add each variable from the list above:
     - **Key**: Variable name (e.g., `YOUTUBE_API_KEY`)
     - **Value**: The corresponding value
     - **Environments**: Select **Production**, **Preview**, and **Development**

3. **Important Notes**
   - ⚠️ Variables prefixed with `NEXT_PUBLIC_` are exposed to the browser
   - ⚠️ All other variables are server-side only (never sent to client)
   - After adding variables, click **Redeploy** to apply changes

4. **Redeploy**
   ```bash
   git push origin main
   ```
   Or manually trigger redeploy from Vercel dashboard

---

### **If Using Netlify**

1. **Navigate to Site Settings**
   - Go to https://app.netlify.com
   - Select your site
   - Go to **Site settings** → **Environment variables**

2. **Add Variables**
   - Click **Add a variable**
   - Add each variable from the list above
   - Select scopes: **Production**, **Deploy previews**, and **Branch deploys**

3. **Redeploy**
   - Netlify will automatically redeploy when you push to main
   - Or manually trigger from **Deploys** tab

---

### **If Using Railway / Render / Other Platforms**

1. **Navigate to your project dashboard**
2. **Find Environment Variables / Settings section**
3. **Add all variables from the list above**
4. **Redeploy the service**

---

## Verification After Deployment

### 1. **Check YouTube API**
After deploying with the `YOUTUBE_API_KEY` variable:

```bash
# Test the API endpoint
curl -X POST https://lightmyfire.app/api/youtube-search \
  -H 'Content-Type: application/json' \
  -d '{"query":"test"}'
```

**Expected Response**: JSON with YouTube video results
**Current Response**: `{"error":"YouTube API is not configured"}` ❌

### 2. **Check Google Fonts**
- Open browser console on https://lightmyfire.app
- Should NOT see CSP errors about `fonts.googleapis.com`

### 3. **Check LocationPicker**
- Navigate to "Add Post" → "Place" type
- Search for a location
- Click on a result from dropdown
- Should successfully select location without console errors

---

## Security Best Practices

### ⚠️ **NEVER commit `.env.local` to Git**
Your `.env.local` file should NEVER be pushed to GitHub because it contains sensitive keys.

```bash
# Verify it's in .gitignore
cat .gitignore | grep env.local
```

Should output: `.env.local`

### ⚠️ **Variable Prefixes**
- `NEXT_PUBLIC_*` → Exposed to browser (use for non-sensitive client-side configs)
- No prefix → Server-side only (use for API keys, secrets, database credentials)

### ⚠️ **Rotating Secrets**
If any of these keys are compromised, rotate them immediately:
- **Stripe**: Dashboard → Developers → API keys → Roll keys
- **YouTube**: Google Cloud Console → Credentials → Regenerate
- **OpenAI**: Platform → API keys → Revoke and create new
- **Supabase**: Dashboard → Settings → API → Generate new

---

## Troubleshooting

### **Issue**: YouTube API still returns 500 error after deployment
**Solution**:
1. Verify variable is set on hosting platform
2. Check variable name is exactly: `YOUTUBE_API_KEY` (case-sensitive)
3. Redeploy the application (environment changes require redeploy)
4. Check server logs for "YOUTUBE_API_KEY is not set" message

### **Issue**: Build fails on deployment
**Solution**:
1. Run `npm run build` locally to test
2. Check for TypeScript errors: `npx tsc --noEmit`
3. Verify all dependencies are in `package.json`

### **Issue**: Stripe webhook not working
**Solution**:
1. Update webhook endpoint in Stripe Dashboard to point to production URL
2. Verify `STRIPE_WEBHOOK_SECRET` matches the one from Stripe Dashboard
3. Test webhook with Stripe CLI: `stripe trigger payment_intent.succeeded`

---

## Next Steps

1. ✅ **Push latest code to production**
   ```bash
   git push origin main
   ```

2. ⚠️ **Configure environment variables on hosting platform** (See platform-specific instructions above)

3. ✅ **Wait for deployment to complete**

4. ✅ **Test production application**
   - Test YouTube search functionality
   - Test location picker
   - Verify no CSP errors in console
   - Test a complete user flow (create lighter → add post)

5. 🔄 **Monitor for issues**
   - Check error logs on hosting platform
   - Monitor Sentry/error tracking if configured
   - Test all critical user paths

---

## Support

If you encounter issues during deployment:
1. Check hosting platform logs for errors
2. Verify all environment variables are correctly set
3. Ensure latest code is deployed (check git commit hash)
4. Test locally with `npm run build && npm start` to simulate production

**Current Local Environment**: ✅ Working
**Target Production URL**: https://lightmyfire.app
**Deployment Date**: 2025-11-05
