# 🔧 Fixing the "Stripe not configured" Warning

## Why This Happens

The warning appears because:
1. The dev server was started BEFORE `.env.local` had the Stripe key
2. Or the browser cached the old version of the app
3. Environment variables are bundled at build time, not runtime

## ✅ **Step-by-Step Fix**

### 1. Stop the Dev Server
If `npm run dev` is currently running:
```bash
# Press Ctrl+C in the terminal where it's running
# Or find and kill the process:
ps aux | grep "next dev"
kill <process_id>
```

### 2. Clear Next.js Cache
```bash
rm -rf .next
```

### 3. Verify .env.local Has the Key
```bash
cat .env.local | grep NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
```

You should see:
```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_51QgeN5FayiEdCFiWPCs2ouVw6Vg816zUBGZdHINK1nJfHUitNuX6eIThcV7WukfeWStvkOmQCRQ2u9EVsPLJk0sV00p2Z8Ebq4
```

### 4. Restart the Dev Server
```bash
npm run dev
```

### 5. Hard Refresh Your Browser
- **Chrome/Edge**: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
- **Firefox**: Ctrl+F5 (Windows) or Cmd+Shift+R (Mac)
- **Safari**: Cmd+Option+R (Mac)

### 6. Check the Browser Console
Open DevTools (F12) and run:
```javascript
console.log(window.location.origin); // Should show your localhost URL
```

Then navigate to the payment page and the warning should be gone!

---

## 🧪 **Test if It's Working**

### Option 1: Check the Console
After restarting dev server, open browser console and go to any page:
```javascript
// This won't work in console, but the app should have it
// Look for errors in the console instead
```

### Option 2: Check the Network Tab
1. Open DevTools → Network tab
2. Navigate to the payment page
3. Look for requests to `js.stripe.com`
4. If Stripe is loading, you'll see these requests

### Option 3: Inspect the Element
1. Go to the payment page
2. Right-click on the Stripe payment form
3. If you see CardElement or Stripe Elements, it's working!

---

## 🚨 **If Warning Still Appears**

### Check 1: Verify File Location
```bash
pwd
# Should output: /Users/utilisateur/Desktop/LMFNEW/lightmyfire-web

ls -la .env.local
# Should show the file exists
```

### Check 2: Check for Typos
```bash
cat .env.local | grep STRIPE
```

Make sure it's:
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (not `STRIPE_PUBLISHABLE_KEY`)
- Key starts with `pk_live_` or `pk_test_`

### Check 3: Build the App
Sometimes dev mode has issues. Try:
```bash
npm run build
npm start
```

Then check `http://localhost:3000`

### Check 4: Check Next.js Version
```bash
npm list next
```

Should be Next.js 14+. If older, upgrade:
```bash
npm install next@latest
```

---

## 📝 **For Deployment (Vercel/Netlify)**

If deploying to production:

### Vercel:
1. Go to Project Settings → Environment Variables
2. Add: `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
3. Value: `pk_live_51QgeN5FayiEdCFiWPCs2ouVw6Vg816zUBGZdHINK1nJfHUitNuX6eIThcV7WukfeWStvkOmQCRQ2u9EVsPLJk0sV00p2Z8Ebq4`
4. Environment: Production, Preview, Development (check all)
5. Save and redeploy

### Netlify:
1. Site Settings → Environment Variables
2. Add variable with same key/value
3. Redeploy site

---

## ✅ **Expected Behavior**

### Before Fix:
```
⚠️ Stripe not configured. Add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY to .env.local
```

### After Fix:
You should see:
- Stripe payment form with card input fields
- No warning message
- Stripe logo in the form
- "Pay €X.XX" button

---

## 🎯 **Quick Commands**

Copy and paste these commands to fix it now:

```bash
# Stop dev server (Ctrl+C), then run:
cd /Users/utilisateur/Desktop/LMFNEW/lightmyfire-web
rm -rf .next
npm run dev
```

Then hard refresh your browser (Cmd+Shift+R on Mac, Ctrl+Shift+R on Windows).

**That's it!** The warning should disappear. 🎉

---

## 💡 **Why Terminal `echo` Doesn't Work**

When you run:
```bash
echo $NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
```

It's empty because:
1. `.env.local` is NOT loaded by your shell
2. It's only loaded by Next.js during build/dev
3. This is by design and is correct behavior

To load env vars in your shell, you'd need:
```bash
export $(cat .env.local | xargs)
echo $NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
```

But this is NOT necessary for Next.js to work!

---

Need help? The environment variables are correct - it's just a matter of restarting the dev server properly! 🚀
