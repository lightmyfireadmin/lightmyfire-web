# Mobile Testing Guide - LightMyFire

**Purpose**: Ensure optimal mobile experience across devices before launch

**Last Updated**: 2025-01-12

---

## Quick Test Checklist

### Essential Tests (15 minutes)
- [ ] Home page loads and looks good on mobile
- [ ] Navigation menu works (hamburger/mobile menu)
- [ ] Forms are easy to use (no zoom on input focus)
- [ ] Buttons are easy to tap (no mis-taps)
- [ ] Images load properly
- [ ] PWA install prompt appears (if supported)

### Complete Tests (1-2 hours)
Complete all sections below

---

## Testing Methods

### 1. Chrome DevTools (Fastest - Start Here)

**How to Access**:
1. Open site in Chrome
2. Press `F12` or `Cmd+Option+I` (Mac) / `Ctrl+Shift+I` (Windows)
3. Click "Toggle device toolbar" icon or press `Cmd+Shift+M`

**Test These Devices**:
- iPhone 14 Pro (390x844)
- iPhone SE (375x667) - smallest modern iPhone
- Samsung Galaxy S20 (360x800)
- iPad (768x1024)

**What to Check**:
- [ ] All content visible (no horizontal scroll)
- [ ] Touch targets at least 44x44px
- [ ] Text readable without zoom (minimum 16px)
- [ ] Forms don't cause zoom on focus
- [ ] Navigation accessible
- [ ] Images scale properly

### 2. Real Device Testing (Required Before Launch)

**Recommended Devices**:
- iPhone (any model from iPhone X or newer)
- Android phone (Samsung, Pixel, or similar)
- iPad or Android tablet

**How to Test on Real Device**:

**Option A: Via Local Network**
```bash
# 1. Find your local IP
# Mac/Linux:
ipconfig getifaddr en0
# Windows:
ipconfig

# 2. Start dev server
npm run dev

# 3. On mobile device, visit:
http://YOUR_IP:3000
# Example: http://192.168.1.100:3000
```

**Option B: Via Deployed Preview**
```bash
# Deploy to Vercel preview
git push origin your-branch

# Get preview URL from Vercel dashboard
# Open on mobile device
```

### 3. BrowserStack (Optional - Professional Testing)

Free trial available: https://www.browserstack.com

**Best for**: Testing on devices you don't own

---

## Comprehensive Test Matrix

### A. Home Page (`/en`)

**Visual Tests**:
- [ ] Hero section visible above the fold
- [ ] Background pattern not overwhelming
- [ ] Illustrations load and look good
- [ ] Stats boxes animate smoothly
- [ ] CTA buttons prominent and tappable

**Interaction Tests**:
- [ ] "Find a Lighter" button works
- [ ] "Save a Lighter" button works
- [ ] Smooth scroll to sections
- [ ] No layout shift during load

**Performance Tests**:
- [ ] Page loads in under 3 seconds on 3G
- [ ] Images lazy load
- [ ] No janky animations

### B. Find a Lighter (`/en/find`)

**Form Tests**:
- [ ] PIN input field easy to tap
- [ ] Keyboard opens without zoom
- [ ] Input shows numbers keyboard (type="text" or "tel")
- [ ] Submit button always visible
- [ ] Error messages visible

**UX Tests**:
- [ ] Can type 6-digit PIN easily
- [ ] Validation feedback clear
- [ ] Loading state visible
- [ ] Success/error messages clear

### C. Save a Lighter (`/en/save-lighter`)

**Multi-Step Form**:
- [ ] Step indicators clear
- [ ] Progress visible
- [ ] Back button works
- [ ] Form fields don't cause zoom
- [ ] Submit buttons always reachable

**Image Upload**:
- [ ] Camera option available
- [ ] Photo library accessible
- [ ] Image preview works
- [ ] Cropping/editing functional (if implemented)

**Sticker Order Flow**:
- [ ] Quantity selector easy to use
- [ ] Price calculation visible
- [ ] Address form easy to complete
- [ ] Stripe payment form mobile-friendly
- [ ] Confirmation shows properly

### D. My Profile (`/en/my-profile`)

**Layout Tests**:
- [ ] Profile header looks good
- [ ] Lighter cards display properly
- [ ] Images load and scale correctly
- [ ] Grid/list view works

**Interaction Tests**:
- [ ] Can tap into lighters
- [ ] Can add new posts
- [ ] Can edit profile
- [ ] Pull-to-refresh works (if implemented)

### E. Lighter Detail Page (`/en/lighter/[pin]`)

**Content Display**:
- [ ] Lighter image prominent
- [ ] Timeline readable
- [ ] Posts display well
- [ ] Location map visible (if present)

**Post Creation**:
- [ ] Text post form easy to use
- [ ] Image upload works
- [ ] Location picker functional
- [ ] Song search works

### F. Navigation & Header

**Mobile Menu**:
- [ ] Hamburger icon clear and tappable
- [ ] Menu opens smoothly
- [ ] All links work
- [ ] Language switcher accessible
- [ ] Close button obvious

**Language Switching**:
- [ ] Language selector works
- [ ] Page reloads with correct language
- [ ] RTL languages (Arabic, Persian) display correctly

### G. Authentication

**Login**:
- [ ] Email input doesn't zoom
- [ ] Password input doesn't zoom
- [ ] "Show password" toggle works
- [ ] Submit button always visible
- [ ] Error messages clear

**Registration**:
- [ ] Form fields easy to complete
- [ ] Email verification clear
- [ ] Can click verification link on mobile

**Password Reset**:
- [ ] Email input works
- [ ] Reset link opens on mobile
- [ ] New password form functional

---

## PWA (Progressive Web App) Testing

### Installation Test

**iOS (Safari)**:
1. Open site in Safari
2. Tap Share button
3. Look for "Add to Home Screen"
4. [ ] Option appears
5. [ ] Icon and name correct
6. [ ] Opens in standalone mode (no Safari UI)

**Android (Chrome)**:
1. Open site in Chrome
2. Look for "Install" prompt or banner
3. [ ] Prompt appears automatically
4. [ ] Can install via menu (⋮ → "Install app")
5. [ ] Opens in standalone mode

### Installed App Test
- [ ] App icon appears on home screen
- [ ] Correct app name
- [ ] Opens without browser UI
- [ ] Theme color applies to status bar (#B400A3)
- [ ] Safe areas respected (notched devices)

### App Shortcuts Test
- [ ] Long-press app icon shows shortcuts
- [ ] "Find a Lighter" shortcut works
- [ ] "Save a Lighter" shortcut works
- [ ] "My Profile" shortcut works

---

## iOS-Specific Tests

### Safari-Specific Issues
- [ ] No 300ms tap delay (should feel instant)
- [ ] Form inputs don't cause zoom (16px minimum)
- [ ] Momentum scrolling works smoothly
- [ ] Pull-to-refresh doesn't interfere
- [ ] Safe area insets work (iPhone X+)

### iPhone Notch/Dynamic Island
- [ ] Content not hidden by notch
- [ ] Header respects safe area
- [ ] Footer respects safe area
- [ ] Landscape mode works

### Keyboard Behavior
- [ ] Keyboard doesn't cover input
- [ ] Can scroll to see covered content
- [ ] "Done" button accessible
- [ ] Keyboard dismisses when tapping outside

---

## Android-Specific Tests

### Chrome-Specific Issues
- [ ] Touch targets responsive
- [ ] Form inputs don't cause zoom
- [ ] Address bar hides on scroll
- [ ] Theme color applies

### Different Android Versions
- [ ] Android 10+ (gesture navigation)
- [ ] Android 8-9 (button navigation)

### Various Screen Sizes
- [ ] Small phones (< 375px width)
- [ ] Large phones (> 400px width)
- [ ] Tablets (landscape and portrait)

---

## Performance Testing

### Lighthouse Mobile Score

**How to Run**:
1. Open Chrome DevTools
2. Go to "Lighthouse" tab
3. Select "Mobile"
4. Check "Performance", "Accessibility", "Best Practices", "SEO"
5. Click "Generate report"

**Target Scores**:
- [ ] Performance: > 90
- [ ] Accessibility: > 90
- [ ] Best Practices: > 90
- [ ] SEO: > 90
- [ ] PWA: All checks passing

### Network Throttling Test
```
Chrome DevTools → Network tab → Throttling dropdown
```

**Test Profiles**:
- [ ] Fast 3G (1.6 Mbps download)
- [ ] Slow 3G (400 Kbps download)

**What to Check**:
- [ ] Page still usable
- [ ] Loading states visible
- [ ] Images load progressively
- [ ] No layout shift

---

## Accessibility Testing

### Screen Reader Test

**iOS VoiceOver**:
1. Settings → Accessibility → VoiceOver → ON
2. [ ] All buttons have labels
3. [ ] Images have alt text
4. [ ] Forms are navigable
5. [ ] Headings properly structured

**Android TalkBack**:
1. Settings → Accessibility → TalkBack → ON
2. Same checks as VoiceOver

### Color Contrast
- [ ] Text readable in bright sunlight
- [ ] Sufficient contrast (WCAG AA: 4.5:1)
- [ ] Interactive elements clearly visible

### Font Scaling
Test with OS font size settings:
- [ ] Works at 200% font size
- [ ] No text overflow
- [ ] Buttons still tappable

---

## Common Mobile Issues Checklist

### Layout Issues
- [ ] ❌ Horizontal scrollbar
- [ ] ❌ Content cut off on sides
- [ ] ❌ Overlapping elements
- [ ] ❌ Text too small
- [ ] ❌ Images too large

### Interaction Issues
- [ ] ❌ Buttons too small to tap
- [ ] ❌ Links too close together
- [ ] ❌ 300ms tap delay
- [ ] ❌ Zoom on input focus
- [ ] ❌ Scroll doesn't work

### Performance Issues
- [ ] ❌ Page loads slowly
- [ ] ❌ Images don't load
- [ ] ❌ Animations janky
- [ ] ❌ Unresponsive interactions

---

## Testing Tools

### Free Tools
- **Chrome DevTools** (built-in)
- **Safari Web Inspector** (built-in)
- **Firefox Responsive Design Mode** (built-in)
- **Mobile-Friendly Test**: https://search.google.com/test/mobile-friendly
- **PageSpeed Insights**: https://pagespeed.web.dev/

### Paid Tools (Optional)
- **BrowserStack**: Real device testing ($39/mo, free trial)
- **Sauce Labs**: Automated mobile testing ($39/mo)
- **LambdaTest**: Cross-browser testing ($15/mo)

---

## Quick Fix Reference

### Issue: Inputs Cause Zoom on iOS
**Fix**: Ensure input font-size is at least 16px
```css
input { font-size: 16px !important; }
```
✅ **Already implemented** in `app/globals.css:150`

### Issue: 300ms Tap Delay
**Fix**: Add `touch-action: manipulation`
```css
button { touch-action: manipulation; }
```
✅ **Already implemented** in `app/globals.css:132`

### Issue: Content Hidden by Notch
**Fix**: Use safe area insets
```css
body {
  padding-top: env(safe-area-inset-top);
}
```
✅ **Already implemented** in `app/globals.css:109`

### Issue: PWA Not Installing
**Fix**: Ensure manifest.json is linked in layout
```html
<link rel="manifest" href="/manifest.json">
```
⚠️ **Check if linked** in `app/layout.tsx`

---

## Pre-Launch Mobile Checklist

**Day Before Launch**:
- [ ] Test on at least 2 real devices (1 iOS, 1 Android)
- [ ] Run Lighthouse mobile audit (score > 90)
- [ ] Test PWA installation on both platforms
- [ ] Verify forms work without zoom
- [ ] Check safe areas on notched device
- [ ] Test in airplane mode (offline behavior)

**Launch Day**:
- [ ] Monitor mobile traffic in analytics
- [ ] Watch for mobile-specific errors in logs
- [ ] Check mobile bounce rate
- [ ] Monitor PWA install rate

**Week 1**:
- [ ] Collect user feedback on mobile experience
- [ ] Review mobile performance metrics
- [ ] Check for mobile-specific bug reports
- [ ] Test on any problematic devices reported

---

## Bug Reporting Template

When reporting mobile issues, include:

```
**Device**: iPhone 14 Pro / Samsung Galaxy S22
**OS Version**: iOS 17.2 / Android 14
**Browser**: Safari 17 / Chrome 120
**Screen Size**: 390x844 / 360x800

**Issue Description**: [Clear description]

**Steps to Reproduce**:
1.
2.
3.

**Expected**: [What should happen]
**Actual**: [What actually happens]

**Screenshots**: [Attach if possible]
```

---

## Success Criteria

**Mobile Experience is Launch-Ready When**:
- ✅ All critical flows work on iOS and Android
- ✅ Lighthouse mobile score > 90
- ✅ PWA installs successfully on both platforms
- ✅ No zoom on input focus
- ✅ Touch targets easily tappable
- ✅ Page loads in < 3s on 3G
- ✅ Safe areas respected on notched devices

---

**Testing Time Estimate**:
- Quick test: 15 minutes
- Thorough test: 1-2 hours
- Complete audit: 3-4 hours

**Recommended**: Do quick test after every major change, thorough test before each deploy, complete audit before launch.

---

**Questions or Issues?**
Document findings in GitHub Issues with "mobile" label.
