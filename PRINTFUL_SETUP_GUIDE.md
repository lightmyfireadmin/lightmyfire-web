# Printful API Setup Guide

## Issue: "Using fallback shipping rates (Printful API unavailable)"

This message appears because the `PRINTFUL_API_KEY` environment variable is not configured.

## Solution:

### Step 1: Get Your Printful API Key

1. Go to https://www.printful.com/dashboard
2. Navigate to **Settings** → **Stores**
3. Click on your store
4. Go to **"API" tab**
5. Click **"Generate API Key"** or **"Create API Token"**
6. Copy the generated API key (starts with something like `xxxxxx:xxxxxxxxx`)

### Step 2: Add to Local Environment

Add this line to your `.env.local` file:

```bash
PRINTFUL_API_KEY=your_actual_api_key_here
```

### Step 3: Add to Vercel (Production)

1. Go to https://vercel.com/dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add new variable:
   - **Name**: `PRINTFUL_API_KEY`
   - **Value**: Your Printful API key
   - **Environments**: Production, Preview, Development (check all)
5. Click **Save**
6. **Redeploy** your application for changes to take effect

### Step 4: Verify Setup

After adding the API key and restarting your development server:

1. Go to `/save-lighter` page
2. Fill in shipping address
3. Check browser console - you should see:
   - ✅ `"Fetching Printful shipping rates:"`
   - ✅ `"Printful rates received:"`
   - ❌ NOT "Using fallback shipping rates"

## Troubleshooting:

### API Key Not Working?

1. **Check format**: Printful API keys look like: `xxxxxx:xxxxxxx-xxxxx-xxxxx-xxxxx-xxxxxxxxxxxxx`
2. **Check permissions**: Ensure the API key has "Orders" permission enabled
3. **Check store**: Make sure the API key is for the correct Printful store
4. **Restart server**: After adding env vars, restart with `npm run dev`

### Still Using Fallback Rates?

Check the server logs for detailed error messages:
```bash
npm run dev
```

Look for lines like:
- `"Failed to fetch Printful shipping rates:"` followed by error details
- `"PRINTFUL_API_KEY not configured, using fallback rates"`

Common errors:
- **401 Unauthorized**: API key is invalid or expired
- **403 Forbidden**: API key doesn't have required permissions
- **404 Not Found**: Variant ID might be incorrect
- **Network error**: Check internet connection

## Current Configuration:

- **Sticker Product**: Kiss Cut Sticker Sheet - 8.5" x 11"
- **Variant ID**: 9413 (configured in `lib/printful.ts`)
- **Supported Countries**: 20 countries (see fallback rates)
- **Currency**: EUR

## Fallback Rates:

The app will work WITHOUT the API key using these approximate rates:
- France: €2.99 standard / €5.99 express
- Germany: €2.99 standard / €5.99 express
- US: €4.99 standard / €9.99 express
- etc.

However, **live Printful rates are recommended** for:
- Accurate pricing
- Real-time delivery estimates
- Automatic order fulfillment
