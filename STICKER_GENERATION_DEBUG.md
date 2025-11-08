# Sticker Generation Debugging Guide

## Common Issues & Solutions

### Issue 1: "Unauthorized. Please sign in to generate stickers."

**Cause**: User is not authenticated
**Solution**: Make sure you're logged in before ordering stickers

### Issue 2: Font files not found

**Error in logs**: `"Poppins-ExtraBold.ttf not found at: ..."`

**Solution**: Check that font files exist:
```bash
ls -la public/fonts/
```

Should show:
- `Poppins-ExtraBold.ttf`
- `Poppins-Bold.ttf`
- `Poppins-Medium.ttf`

If missing, these fonts need to be added to `public/fonts/`

### Issue 3: Logo image not found

**Error**: `"Failed to load logo image"`

**Solution**: Check that logo exists:
```bash
ls -la public/LMFLOGO.png
```

### Issue 4: Memory/Canvas errors

**Error**: `"Canvas: Out of memory"` or `"Maximum call stack exceeded"`

**Cause**: Generating too many high-resolution stickers at once (600 DPI)

**Solution**: Process in smaller batches (already implemented - 10 stickers per sheet max)

### Issue 5: Network timeout

**Error**: Request times out during generation

**Cause**: Large images take time to generate at 600 DPI

**Current timeout**: 5 minutes (300,000ms)
**Sheet dimensions**: 3498px × 4962px at 600 DPI

**Solution**: Already configured in route - no action needed

## How to Test Locally

### Step 1: Check server logs

Start dev server and watch for errors:
```bash
npm run dev
```

### Step 2: Test sticker generation

1. Navigate to `/save-lighter`
2. Open browser console (F12)
3. Fill in lighter names and select pack size
4. Fill in shipping address
5. Complete payment with Stripe test card: `4242 4242 4242 4242`
6. Watch console and server logs for errors

### Step 3: Check generated files

After generation, check:
```bash
ls -la /tmp/*.png   # Temporary sticker sheets
ls -la /tmp/*.zip   # ZIP archives
```

Note: These are temporary files and may be cleaned up automatically

## Debug Mode

To enable more verbose logging, add to `.env.local`:
```bash
DEBUG_STICKER_GENERATION=true
```

Then check logs for:
- Font registration success/failure
- Image loading times
- Canvas creation details
- QR code generation
- ZIP archive creation

## Architecture Overview

```
User Payment (Stripe)
       ↓
Webhook receives payment
       ↓
/api/process-sticker-order
       ↓
/api/generate-printful-stickers
       ↓
1. Create canvas (600 DPI)
2. Load fonts (Poppins)
3. Load logo image
4. Generate QR codes for each lighter
5. Draw stickers on sheet
6. Export as PNG
7. Create ZIP archive
8. Upload to Supabase storage
       ↓
/api/create-printful-order (future)
       ↓
Printful fulfillment
```

## Performance Specs

- **Sheet size**: 3498px × 4962px (600 DPI for print quality)
- **Stickers per sheet**: Up to 10
- **Processing time**: ~30-60 seconds for 10 stickers
- **Memory usage**: ~150-300MB per sheet
- **Output format**: PNG (lossless) in ZIP archive

## Troubleshooting Checklist

- [ ] User is authenticated (logged in)
- [ ] Fonts exist in `public/fonts/`
- [ ] Logo exists at `public/LMFLOGO.png`
- [ ] Server has enough memory (Node.js default: 512MB, increase if needed)
- [ ] Supabase storage bucket "stickers" exists and is accessible
- [ ] Network connection stable (large files to upload)
- [ ] No firewall blocking Supabase storage uploads

## Still Having Issues?

Share these details:
1. **Exact error message** (from browser console or server logs)
2. **When it fails** (which step in the process)
3. **Pack size** being ordered (10, 20, or 50 stickers)
4. **Environment** (local development or production/Vercel)
5. **Browser** and version
