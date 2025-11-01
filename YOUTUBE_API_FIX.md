# YouTube API Configuration Fix

## Issue
YouTube API search returns "invalid API key" error despite having a valid key with correct quota and restrictions.

## Root Cause Analysis
The API route expects `YOUTUBE_API_KEY` but common mistakes include:
1. Wrong environment variable name
2. Environment variable not loaded in production
3. API key restrictions blocking server-side requests
4. Missing YouTube Data API v3 enablement

## Step-by-Step Fix

### 1. Check Environment Variable Name
Your API route expects: `YOUTUBE_API_KEY` (NOT `NEXT_PUBLIC_YOUTUBE_API_KEY`)

**File:** `/app/api/youtube-search/route.ts` (line 23)
```typescript
const apiKey = process.env.YOUTUBE_API_KEY;
```

**Your `.env.local` file should have:**
```env
# Correct - Server-side only
YOUTUBE_API_KEY=AIzaSy...your_actual_key_here

# NOT this (client-side would expose the key):
# NEXT_PUBLIC_YOUTUBE_API_KEY=AIzaSy...
```

### 2. Verify Google Cloud Console Settings

**Go to:** https://console.cloud.google.com/apis/credentials

#### A. Check API Key Settings:
1. Click on your API key
2. **Application restrictions:** Set to "None" (for testing) OR "HTTP referrers" with your domains
3. **API restrictions:**
   - Select "Restrict key"
   - Enable **YouTube Data API v3** ONLY

#### B. Enable YouTube Data API v3:
1. Go to: https://console.cloud.google.com/apis/library
2. Search for "YouTube Data API v3"
3. Click "Enable"
4. Wait 1-2 minutes for activation

### 3. Test the API Key Directly
Run this in your terminal to test if the key works:

```bash
curl "https://www.googleapis.com/youtube/v3/search?part=snippet&q=test&type=video&maxResults=1&key=YOUR_API_KEY_HERE"
```

**Expected success response:**
```json
{
  "items": [
    {
      "id": { "videoId": "..." },
      "snippet": { "title": "...", ... }
    }
  ]
}
```

**If you get an error:**
- `"error": {"code": 403, "message": "The request is missing a valid API key"}` → Key is invalid or expired
- `"error": {"code": 403, "message": "YouTube Data API has not been used..."}` → API not enabled
- `"error": {"code": 403, "message": "Request had insufficient authentication scopes"}` → Wrong API restrictions

### 4. Restart Your Development Server
After updating `.env.local`:

```bash
# Stop the dev server (Ctrl+C)
# Then restart:
npm run dev
# or
yarn dev
```

**Important:** Environment variables are only loaded when the server starts!

### 5. Check Production Environment (If deployed)
If deployed to Vercel/Netlify/etc., add the environment variable in your hosting dashboard:

**Vercel:**
1. Go to Project Settings → Environment Variables
2. Add: `YOUTUBE_API_KEY` = `your_key_here`
3. Redeploy the application

### 6. Debug the Actual Error
If the issue persists, check the server console logs:

**Look for these logs in your terminal:**
```
YouTube API Error: { ... }
```

The error details will tell you exactly what's wrong.

### 7. Common Gotchas

| Issue | Solution |
|-------|----------|
| "API key not valid" | Regenerate the key in Google Cloud Console |
| "Daily Limit Exceeded" | Check quota usage at console.cloud.google.com/apis/dashboard |
| "YouTube Data API v3 has not been used in project..." | Enable the API and wait 2 minutes |
| "Request had insufficient authentication scopes" | Check API restrictions on the key |
| Variable undefined in production | Add environment variable to hosting platform |
| Works locally but not in production | Environment variables not deployed |

### 8. Alternative: Use Service Account (Advanced)
If API key restrictions don't work, consider using a service account:

1. Create a service account in Google Cloud Console
2. Download the JSON key file
3. Use Google APIs Node.js Client library
4. Store credentials securely

**This is more complex but more secure for production.**

### 9. Verification Checklist
- [ ] `.env.local` has `YOUTUBE_API_KEY=...` (not NEXT_PUBLIC_)
- [ ] YouTube Data API v3 is enabled in Google Cloud Console
- [ ] API key has "YouTube Data API v3" in API restrictions
- [ ] API key application restrictions allow server requests
- [ ] Development server was restarted after changing `.env.local`
- [ ] Quota is not exceeded (check dashboard)
- [ ] Direct curl test with the API key works
- [ ] If deployed, environment variable is set in hosting platform

### 10. Test the Integration
Once configured, test in your app:

1. Go to "Add Post" page
2. Select "Song" post type
3. Switch to "Search" mode
4. Type a song name
5. You should see YouTube search results

**If still not working:**
- Check browser dev tools → Network tab
- Look for the POST request to `/api/youtube-search`
- Check the response for error details
- Check server terminal for error logs

## Quick Fix Script
Create a test file to verify your API key:

**File:** `/test-youtube-api.js`
```javascript
const apiKey = process.env.YOUTUBE_API_KEY || 'YOUR_KEY_HERE';

fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=test&type=video&maxResults=1&key=${apiKey}`)
  .then(res => res.json())
  .then(data => {
    if (data.error) {
      console.error('❌ YouTube API Error:', data.error);
    } else {
      console.log('✅ YouTube API works!', data.items[0].snippet.title);
    }
  })
  .catch(err => console.error('❌ Network error:', err));
```

Run with: `node test-youtube-api.js`

## Need More Help?
1. Check the exact error message in your server console
2. Verify your API key works with the curl command above
3. Check Google Cloud Console → APIs & Services → Dashboard for quota/errors
4. Make sure you're not using a browser API key for server-side requests

---

**Still stuck?** Share the exact error message from your server console (the one that starts with "YouTube API Error:") and I can provide more specific guidance.
