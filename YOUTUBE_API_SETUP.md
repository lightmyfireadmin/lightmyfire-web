# YouTube API Setup Guide for LightMyFire

## Critical Security Note

⚠️ **NEVER expose the YouTube API key in client-side code or commit it to version control.**

This guide explains how to properly configure the YouTube API for secure server-side use.

---

## Step 1: Revoke the Exposed API Key

Since the API key `AIzaSyB6k_GbaeQp7rT2ZYx6FjYywO310l9SRYE` has been exposed, you MUST revoke it immediately:

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select your project
3. Navigate to **APIs & Services** > **Credentials**
4. Find the exposed API key in the "API Keys" section
5. Click the key and select **DELETE**
6. Create a new API key (see Step 2 below)

---

## Step 2: Create a New YouTube API Key

### 2a. Enable the YouTube Data API v3

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Ensure your project is selected
3. Navigate to **APIs & Services** > **Library**
4. Search for "YouTube Data API v3"
5. Click on it and press **ENABLE**

### 2b. Create an API Key

1. Go to **APIs & Services** > **Credentials**
2. Click **+ CREATE CREDENTIALS** > **API Key**
3. A dialog will show your new API key
4. Click **RESTRICT KEY** immediately
5. Follow the restriction steps below

---

## Step 3: Restrict Your API Key (IMPORTANT!)

### For Development:

1. Under **Key restrictions**:
   - **Application restrictions**: Select "HTTP referrers (web sites)"
   - Add your development domain (e.g., `localhost:3000`, `127.0.0.1:3000`)

2. Under **API restrictions**:
   - Select **Restrict key**
   - Choose **YouTube Data API v3** from the dropdown
   - Click **SAVE**

### For Production:

1. Under **Key restrictions**:
   - **Application restrictions**: Select "HTTP referrers (web sites)"
   - Add your production domains:
     - `lightmyfire.app`
     - `www.lightmyfire.app`
     - Any other production domains

2. Under **API restrictions**:
   - Select **Restrict key**
   - Choose **YouTube Data API v3**
   - Click **SAVE**

---

## Step 4: Set Environment Variables

### In `.env.local` (Development):

```env
# Get your API key from Google Cloud Console
# This is ONLY used server-side and never exposed to the client
YOUTUBE_API_KEY=your_new_api_key_here
```

### In Production (Vercel/Deployment):

1. Go to your deployment platform's environment variables settings
2. Add: `YOUTUBE_API_KEY=your_production_api_key`
3. Redeploy your application

---

## Step 5: Verify the Setup

1. Start your development server: `npm run dev`
2. Navigate to a lighter page and try to add a song post
3. Search for a song in the YouTube search box
4. Check the browser console (F12) - you should NOT see the API key
5. Check the Network tab - requests should go to `/api/youtube-search`, not YouTube directly

---

## Common Issues & Solutions

### Issue: "YouTube API Error: invalid API"

**Possible Causes:**
- API key not set or incorrect in `.env.local`
- YouTube Data API v3 not enabled in Google Cloud Console
- API key restrictions don't include your domain

**Solution:**
1. Verify API key is set in `.env.local`: `YOUTUBE_API_KEY=your_key`
2. Confirm YouTube Data API v3 is enabled
3. Check domain restrictions match your current domain
4. Restart the dev server after changing `.env.local`

### Issue: "Failed to search YouTube" error in UI

**Possible Causes:**
- Server-side API route not found
- Rate limiting exceeded
- Network error

**Solution:**
1. Check server logs for `/api/youtube-search` endpoint errors
2. Verify no rate limiting quotas are exceeded in Google Cloud Console
3. Try with a different search query
4. Check browser Network tab for the actual error response

### Issue: API key still visible in browser

**This should NOT happen with this setup!**

The API key should ONLY be on the server side.

**Debug:**
1. Open browser DevTools (F12)
2. Search for your API key (CTRL+F) - it should NOT appear
3. Check Network tab - requests to `/api/youtube-search` should NOT include the key in the URL
4. Verify `.env.local` is NOT committed to git (check `.gitignore`)

---

## Security Best Practices

✅ **DO:**
- Use `YOUTUBE_API_KEY` (no `NEXT_PUBLIC_` prefix) - server-side only
- Restrict API keys by domain and API
- Use HTTPS for all requests
- Keep API key out of version control
- Rotate keys periodically
- Use different keys for dev and production

❌ **DON'T:**
- Expose API key in client-side code
- Commit `.env.local` to git
- Use unrestricted API keys
- Share API keys in chat or logs
- Reuse the same key across projects

---

## Testing

### Manual Test:
1. Go to Add Song page
2. Type in search box: "test"
3. Should see YouTube results (not an error)
4. Open DevTools Network tab
5. See POST request to `/api/youtube-search`
6. Response should be JSON with video results

### Debug API Endpoint:
Use curl to test:
```bash
curl -X POST http://localhost:3000/api/youtube-search \
  -H "Content-Type: application/json" \
  -d '{"query": "test song"}'
```

Should return:
```json
{
  "items": [
    {
      "id": { "videoId": "..." },
      "snippet": { "title": "...", "thumbnails": { ... } }
    }
  ]
}
```

---

## References

- [Google Cloud Console](https://console.cloud.google.com)
- [YouTube Data API v3 Docs](https://developers.google.com/youtube/v3)
- [API Key Best Practices](https://cloud.google.com/docs/authentication/api-keys)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
