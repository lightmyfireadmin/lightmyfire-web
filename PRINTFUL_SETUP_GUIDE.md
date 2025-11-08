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

### Debugging on Vercel Production

If the API key is set on Vercel but still not working:

**Step 1: Check Vercel Function Logs**

1. Go to https://vercel.com/dashboard
2. Select your project
3. Go to **Deployments** → Click on latest deployment
4. Click **Functions** tab
5. Find `/api/calculate-shipping` function
6. Check the logs for error details

**Step 2: Look for These Error Details**

With the updated logging, you should see:
```json
{
  "error": "Printful API error: Unauthorized",
  "apiKeyPresent": true,
  "apiKeyLength": 45,
  "variantId": 9413
}
```

**Step 3: Common Vercel-Specific Issues**

1. **Extra spaces in env var**: Edit the env var on Vercel and re-save without extra whitespace
2. **Quotes in env var**: Remove any quotes around the API key (use raw key only)
3. **Need to redeploy**: After changing env vars, you MUST trigger a new deployment
4. **Wrong environment**: Make sure env var is set for "Production" not just "Preview"
5. **API key expired**: Generate a new API key from Printful dashboard

**Step 4: Test API Key Directly**

To verify your API key works, test it with curl:
```bash
curl -X GET "https://api.printful.com/store" \
  -H "Authorization: Bearer YOUR_API_KEY_HERE"
```

If you get a 200 response with store info, the key is valid.

**Step 5: Verify Variant ID**

Test if variant 9413 exists:
```bash
curl -X GET "https://api.printful.com/products/variant/9413" \
  -H "Authorization: Bearer YOUR_API_KEY_HERE"
```

If you get 404, the variant ID is incorrect and needs updating.

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
