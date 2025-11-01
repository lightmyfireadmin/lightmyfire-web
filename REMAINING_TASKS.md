# Remaining UI/UX Tasks - LightMyFire

## Summary of Completed Tasks ✅

1. ✅ **PIN Card Image Proportions** - Fixed with `object-contain` in container
2. ✅ **Language Dropdown Scroll Glitch** - Added `max-h-96 overflow-y-auto` to Menu.Items
3. ✅ **Mobile Header Alignment** - Added proper spacing and full-width styling for buttons
4. ✅ **Locale Selection Reversion** - Imported language names and fixed display
5. ✅ **Stats Cards 2x2 Grid** - Changed from `grid-cols-1` to `grid-cols-2` on mobile
6. ✅ **Stats Cards Font Scaling** - Added responsive font sizes based on value length
7. ✅ **RandomPostFeed Direction** - Changed from up to down (position starts at -100, moves to 120)
8. ✅ **RandomPostFeed Speed** - Reduced by 2/3 (0.5% per frame instead of 1.5%)
9. ✅ **RandomPostFeed Post Gaps** - Added `20px` gap with `calc()` in style
10. ✅ **RandomPostFeed Pause State** - Removed gray overlay, only stops movement
11. ✅ **Language Switcher Route** - Now stays on current page when changing language
12. ✅ **Desktop Column Gap** - Reduced from `mb-3` to `mb-1.5` on "Become a LightSaver" section

---

## Remaining Tasks to Complete

### Task 7: Check & Fix Banner Visibility on Mobile
**Status:** Pending Investigation
**Description:** User reports the banner might not be showing on mobile. Need to verify visibility and styling.

**Where:** `app/components/WelcomeBanner.tsx`

**What to Check:**
- Is banner hidden with `hidden` or `display: none` on mobile?
- Check for responsive classes like `md:block` or `lg:flex`
- Verify margin/padding doesn't push it off screen
- Check z-index isn't causing overlap issues

**Fix approach:**
- Ensure banner is visible on all screen sizes (mobile especially)
- Add `sm:` responsive classes if needed to adjust size on mobile
- Verify it doesn't conflict with header (z-index issues)

---

### Task 8: Investigate Why Only Banner Changes Language Correctly
**Status:** Pending Investigation
**Description:** User reports only the banner element changes language correctly. All other elements fall back to English for non-supported locales.

**Root Cause Analysis Needed:**
The banner is the only element translating correctly suggests:
1. Banner might be using a different i18n library or approach
2. Other components might not be reading locale from context properly
3. There might be a mismatch between locale file keys and component translation calls

**Files to Check:**
- `app/components/WelcomeBanner.tsx` - How does it get translations?
- `app/components/Header.tsx` - How does it call `t()`?
- Other components for consistency in i18n usage

**Investigation Steps:**
1. Check if WelcomeBanner uses `useI18n()` like other components
2. Verify all locale files have the same keys
3. Check if there's a timing issue with locale initialization

---

### Task 15: Fix Notification on Login/Logout - Make Stretchable & Superposable
**Status:** Pending Implementation
**Description:** Login/logout notifications currently shrink too much to be readable. Should be stretchable and can superpose over content.

**Files Involved:**
- `app/components/ToastWrapper.tsx` or `app/components/SuccessNotification.tsx`
- `app/lib/context/ToastContext.tsx`

**Requirements:**
- Notification should expand to show full message
- Should be able to overlay on top of page content
- Should have proper z-index to appear above other elements
- Should not shrink text or cut off content
- Should remain readable on all screen sizes

**Implementation Notes:**
- Toast notifications typically use `position: fixed` to float above content
- Consider using Headless UI or Radix UI Toast if not already
- Add `min-w-[300px]` or similar to prevent shrinking
- Ensure `z-index` is high enough (typically 50-9999)

---

### Task 16: Create Welcome Popup for First-Time Signup
**Status:** Pending Implementation
**Description:** New users see "welcome back" message even on first signup. Need a custom welcome popup instead.

**Requirements:**
- Show only on first login (user's first time)
- Include:
  - Welcome illustration
  - Personalized welcome message (use name if available)
  - Little walkthrough/onboarding hints:
    - "Use my profile to track your progress"
    - "Search for lighters on the homepage"
    - "Post stories to earn points"
- Closable with X button top-right
- Aesthetically pleasing popup/modal design

**Implementation Approach:**
1. Create new component: `app/components/FirstTimeWelcomePopup.tsx`
   - Use Headless UI Dialog for modal
   - Include illustration (maybe customize existing ones)
   - Add brief walkthrough text
   - Add close button

2. Detect first-time login in:
   - Layout or page component
   - Check if user has `last_login` timestamp in profiles table
   - Or check if it's their first session

3. Add to layout so it shows on first login:
   - `app/[locale]/layout.tsx` or specific page
   - Only show once per session

**Files to Create/Modify:**
- CREATE: `app/components/FirstTimeWelcomePopup.tsx`
- MODIFY: `app/[locale]/layout.tsx` - Add popup component
- MODIFY: Database schema if needed to track first login

---

### Task 17: Add Search Icon in Header to Navigate Back to Homepage
**Status:** Pending Implementation
**Description:** Users can only search for lighters on homepage. Add a magnifying glass icon in header (right of logo) as a quick way to navigate back to search.

**Requirements:**
- Magnifying glass icon in header
- Position: Right of logo (left side of header)
- Primary color outline style
- Clickable to navigate to homepage (`/[locale]/`)
- Should work on all screen sizes
- Visible on mobile and desktop

**Implementation Approach:**
1. Modify `app/components/Header.tsx`:
   - Add magnifying glass icon import
   - Add icon button right after logo (or in nav section)
   - Use `href={`/${lang}`}` or router.push to navigate
   - Style: Primary color outline, hover effects

2. Styling considerations:
   - Ensure it doesn't overlap with other header elements
   - Make it obvious it's clickable (hover state)
   - Mobile-friendly size (at least 44px touch target)

**CSS Classes Suggestion:**
```jsx
<Link
  href={`/${lang}`}
  className="inline-flex items-center justify-center p-2 rounded-md text-primary hover:bg-primary/10 transition-colors"
  aria-label="Search lighters"
>
  <MagnifyingGlassIcon className="h-5 w-5" />
</Link>
```

---

## SQL Migrations Ready to Apply

A comprehensive SQL migration file is available at: `SUPABASE_COMPLETE_SECURITY_FIX.sql`

To apply:
1. Go to Supabase Dashboard → SQL Editor
2. Copy and paste the entire file content
3. Execute to fix all security issues

This will:
- ✅ Remove SECURITY DEFINER from detailed_posts view
- ✅ Add SET search_path = public to 15 functions
- (Manual step) Enable leaked password protection in Auth Settings

---

## Next Priority Actions

1. **HIGH:** Verify banner visibility on mobile (Task 7)
2. **HIGH:** Investigate banner language translation (Task 8)
3. **MEDIUM:** Create welcome popup for new users (Task 16)
4. **MEDIUM:** Add search icon to header (Task 17)
5. **LOW:** Make notification toast better styled (Task 15)

---

## Files Modified This Session

1. `app/components/PinEntryForm.tsx` - Image proportions fix
2. `app/components/LanguageSwitcher.tsx` - Locale list import & dropdown scroll
3. `app/components/Header.tsx` - Mobile alignment
4. `app/components/LogoutButton.tsx` - Mobile variant
5. `app/components/RandomPostFeed.tsx` - Direction, speed, gaps, pause state
6. `app/[locale]/my-profile/page.tsx` - Stats grid and font scaling
7. `app/[locale]/page.tsx` - Desktop column gap
8. `locales/languages.ts` - Created new language mapping file
9. `SUPABASE_COMPLETE_SECURITY_FIX.sql` - Comprehensive security fixes

---

## Build Status
✅ Build passes successfully after all modifications.

---

## Notes

- All modifications maintain TypeScript type safety
- Changes are backward compatible
- No breaking changes to existing functionality
- All new features are responsive and mobile-optimized
