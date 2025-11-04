# LightMyFire Setup & Configuration Guide

## 🎉 Completed Fixes

### 1. Database Optimizations
- ✅ **Fixed Like/Flag Functionality**: Resolved ambiguous `user_id` error that prevented users from liking/flagging posts
- ✅ **Added Performance Indexes**: Improved query performance for `lighter_contributions` and `moderation_queue` tables
- ✅ **Updated Views**: Fixed security advisor warning by converting `detailed_posts` view to use `security_invoker=true`

### 2. My Profile Page Performance
- ✅ **Added Caching**: Implemented 60-second revalidation to reduce database load
- ✅ **Optimized Updates**: Only updates profile points/level when there's a meaningful change (10+ points or level change)
- ✅ **Prevented Resource Abuse**: Reduced excessive database writes on every page load

### 3. Internationalization (i18n)
- ✅ **Added Missing Keys**: Added `home.mosaic.loading` and `home.mosaic.see_more` to all 27 locale files
- ✅ **Language Coverage**: en, fr, es, de, it, pt, nl, ru, pl, ja, ko, zh-CN, th, vi, hi, ar, fa, ur, mr, te, id, uk, tr

### 4. Contact Form Implementation
- ✅ **Created API Route**: `/app/api/contact/route.ts` using Resend API
- ✅ **Built Modal Component**: Reusable `ContactFormModal` with validation
- ✅ **Integrated in Save Lighter Flow**: Replaced mailto link with modal popup
- ✅ **Email Delivery**: Sends to `editionsrevel@gmail.com` with formatted HTML

---

## 🔧 Environment Configuration

### Required Environment Variables

Your `.env.local` file should contain:

```bash
# Resend API (Already configured)
RESEND_API_KEY=re_Ec3yTpX4_DBVaexmUDtMRWYLjPaur5EtM

# Stripe Keys (Already configured)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_51QgeN5FayiEdCFiW...
STRIPE_SECRET_KEY=sk_live_51QgeN5FayiEdCFiW...
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xdkugrvcehfedkcsylaw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# YouTube API
YOUTUBE_API_KEY=AIzaSyBRTXKZDG_yzia9Y3qX33e3FLoX1jN0Mas

# OpenAI API
OPENAI_API_KEY=sk-proj-DU6KXbTqd8B4JG4GatZ9...
```

---

## 💳 Stripe Configuration Guide

### Why You See the Warning

The warning "⚠️ Stripe not configured" appears because:
1. The Stripe publishable key is not being loaded in the browser
2. Or the environment variable is only available server-side

### Solution 1: Verify Environment Variable Loading

1. **Check if the key is present:**
   ```bash
   # In your terminal
   echo $NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
   ```

2. **Restart your development server:**
   ```bash
   # Kill the current process and restart
   npm run dev
   ```

3. **Verify in browser console:**
   ```javascript
   console.log(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
   ```

### Solution 2: Check Deployment Environment

If deploying to Vercel/Netlify:

1. **Go to your project settings**
2. **Add environment variables** in the dashboard:
   - Key: `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - Value: `pk_live_51QgeN5FayiEdCFiWPCs2ouVw6Vg816zUBGZdHINK1nJfHUitNuX6eIThcV7WukfeWStvkOmQCRQ2u9EVsPLJk0sV00p2Z8Ebq4`

3. **Redeploy your application**

### Solution 3: Verify Stripe Component Loading

Check `/app/[locale]/save-lighter/StripePaymentForm.tsx`:

```tsx
// This should load the key
const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

if (!stripePublishableKey) {
  return <div>Stripe not configured...</div>;
}
```

**If the key exists but still shows warning**, the Stripe library might not be loading. Check:
- Network tab for blocked requests
- Console for JavaScript errors
- CSP headers allowing Stripe domains

---

## 🗺️ Interactive Map Implementation Guide

### Current Status

- ✅ OpenStreetMap API integrated (nominatim.openstreetmap.org)
- ✅ CSP configured to allow requests
- ❌ No interactive map component yet

### Recommended Approach: React-Leaflet

**Why Leaflet?**
- Free and open-source
- Works with OpenStreetMap
- Lightweight (~40KB)
- Great React support

### Step-by-Step Implementation

#### 1. Install Dependencies

```bash
npm install leaflet react-leaflet
npm install --save-dev @types/leaflet
```

#### 2. Create Map Component

Create `/app/components/LocationPicker.tsx`:

```tsx
'use client';

import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix default marker icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/leaflet/marker-icon-2x.png',
  iconUrl: '/leaflet/marker-icon.png',
  shadowUrl: '/leaflet/marker-shadow.png',
});

interface LocationPickerProps {
  onLocationSelect: (lat: number, lng: number, name?: string) => void;
  initialLat?: number;
  initialLng?: number;
}

function LocationMarker({ onLocationSelect }: any) {
  const [position, setPosition] = useState<[number, number] | null>(null);

  const map = useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setPosition([lat, lng]);
      onLocationSelect(lat, lng);
    },
  });

  return position ? <Marker position={position} /> : null;
}

export default function LocationPicker({
  onLocationSelect,
  initialLat = 48.8566,
  initialLng = 2.3522,
}: LocationPickerProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-[400px] bg-muted animate-pulse rounded-lg" />;
  }

  return (
    <MapContainer
      center={[initialLat, initialLng]}
      zoom={13}
      style={{ height: '400px', width: '100%', borderRadius: '0.5rem' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <LocationMarker onLocationSelect={onLocationSelect} />
    </MapContainer>
  );
}
```

#### 3. Download Leaflet Marker Icons

```bash
# Create directory
mkdir -p public/leaflet

# Download icons (or copy from node_modules/leaflet/dist/images/)
cp node_modules/leaflet/dist/images/marker-icon.png public/leaflet/
cp node_modules/leaflet/dist/images/marker-icon-2x.png public/leaflet/
cp node_modules/leaflet/dist/images/marker-shadow.png public/leaflet/
```

#### 4. Update CSP for Leaflet

In `next.config.js`, add to `img-src`:

```javascript
img-src 'self' data: https: blob: https://*.tile.openstreetmap.org;
```

#### 5. Integrate into AddPostForm

In `/app/[locale]/lighter/[id]/add/AddPostForm.tsx`:

```tsx
import dynamic from 'next/dynamic';

// Dynamically import to avoid SSR issues
const LocationPicker = dynamic(() => import('@/app/components/LocationPicker'), {
  ssr: false,
  loading: () => <div className="h-[400px] bg-muted animate-pulse rounded-lg" />
});

// In the location post type section:
{postType === 'location' && (
  <>
    <LocationPicker
      onLocationSelect={(lat, lng) => {
        setLocationLat(lat);
        setLocationLng(lng);
      }}
      initialLat={locationLat || 48.8566}
      initialLng={locationLng || 2.3522}
    />

    {/* Keep existing location name input */}
    <input
      type="text"
      value={locationName}
      onChange={(e) => setLocationName(e.target.value)}
      placeholder="Location name (e.g., 'Eiffel Tower')"
      className="..."
    />
  </>
)}
```

#### 6. Add Reverse Geocoding (Optional)

When user clicks on map, fetch location name:

```tsx
const fetchLocationName = async (lat: number, lng: number) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
    );
    const data = await response.json();
    return data.display_name || 'Unknown location';
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return '';
  }
};

// In click handler:
map.click(async (e) => {
  const { lat, lng } = e.latlng;
  const name = await fetchLocationName(lat, lng);
  onLocationSelect(lat, lng, name);
});
```

### Alternative: Mapbox

If you prefer Mapbox (more polished UI):

1. **Sign up at https://www.mapbox.com/**
2. **Get free API token** (50,000 requests/month)
3. **Install:**
   ```bash
   npm install mapbox-gl react-map-gl
   ```
4. **Use similar approach but with Mapbox component**

---

## 🚀 Next Steps

### Immediate Actions

1. **Apply Database Migration:**
   ```sql
   -- In Supabase SQL Editor, run:
   -- Already applied via MCP, but verify in migrations table
   SELECT * FROM supabase_migrations.schema_migrations
   WHERE name LIKE '%fix_toggle_like%';
   ```

2. **Test Contact Form:**
   - Go to Save Lighter page
   - Click "Contact Us for Custom Branding"
   - Fill out form and submit
   - Check editionsrevel@gmail.com for email

3. **Verify Stripe:**
   - Restart dev server: `npm run dev`
   - Go to payment page
   - Check if warning is gone

4. **Test Like/Flag Functionality:**
   - Log in as a user
   - Try liking a post
   - Should work without errors now

### Optional Improvements

1. **Implement Interactive Map** (see guide above)
2. **Add Contact Button to FAQ Page** (when created)
3. **Optimize Unused Indexes** (from Supabase advisor)
4. **Add Rate Limiting** to contact form API route
5. **Implement Email Templates** using React Email

---

## 📊 Performance Monitoring

### Check Database Performance

```sql
-- In Supabase SQL Editor

-- Check if new indexes are being used
SELECT schemaname, tablename, indexname, idx_scan
FROM pg_stat_user_indexes
WHERE indexname IN ('idx_lighter_contributions_lighter_id', 'idx_moderation_queue_reviewed_by')
ORDER BY idx_scan DESC;

-- Monitor profile page query performance
SELECT query, mean_exec_time, calls
FROM pg_stat_statements
WHERE query LIKE '%profiles%'
ORDER BY mean_exec_time DESC
LIMIT 10;
```

### Monitor Resend API Usage

- **Dashboard:** https://resend.com/emails
- **Free tier:** 3,000 emails/month
- **Cost:** $20/month for 50,000 emails

---

## 🐛 Troubleshooting

### Contact Form Not Working

1. **Check Resend API key:**
   ```bash
   echo $RESEND_API_KEY
   ```

2. **Verify email sending:**
   - Check Resend dashboard
   - Look for errors in server logs
   - Check spam folder

3. **Test API route directly:**
   ```bash
   curl -X POST http://localhost:3000/api/contact \
     -H "Content-Type: application/json" \
     -d '{"name":"Test","email":"test@example.com","message":"Test message"}'
   ```

### Stripe Warning Persists

1. **Hard refresh browser:** Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
2. **Clear Next.js cache:** `rm -rf .next`
3. **Check browser console** for specific errors
4. **Verify key format:** Should start with `pk_live_` or `pk_test_`

### Map Not Loading

1. **Check CSP:** Ensure OpenStreetMap domains are allowed
2. **Check Leaflet CSS:** Must be imported before using map
3. **Use dynamic import:** Leaflet requires browser APIs
4. **Check network tab:** Ensure tiles are loading

---

## 📝 Summary

**✅ Completed:**
- Database performance optimizations
- Like/flag functionality fixed
- My Profile page optimized
- All i18n keys added (27 languages)
- Contact form with Resend API
- Documentation created

**⚠️ Needs Attention:**
- Verify Stripe configuration in deployment
- Implement interactive map (optional)
- Test contact form delivery

**📚 Reference:**
- Resend Docs: https://resend.com/docs
- Leaflet Docs: https://leafletjs.com/
- React-Leaflet: https://react-leaflet.js.org/
- Stripe Docs: https://stripe.com/docs

---

Need help? Contact: editionsrevel@gmail.com (now with the contact form! 🎉)
