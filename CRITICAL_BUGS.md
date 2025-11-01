# CRITICAL BUGS - MUST FIX FIRST
**SAVED BEFORE AUTO-COMPACT**
**Last Updated: 2024-11-01**

## 🔴 Priority 1: FIX IMMEDIATELY

### 1. Burger Menu Not Appearing on Mobile
**Status**: BROKEN - Core functionality
**Severity**: CRITICAL
**Description**: Mobile burger menu button doesn't show the navigation menu when touched/clicked
**File**: `app/components/Header.tsx`
**Components Affected**:
- Dialog component from @headlessui/react
- mobileMenuOpen state
- Mobile menu trigger button

**Investigation Steps**:
1. Check if Dialog is rendering at all on mobile
2. Check if mobileMenuOpen state is changing
3. Check z-index of Dialog (should be high)
4. Check if mobile breakpoint media query is working
5. Check if button click handler is attached

**Likely Causes**:
- Dialog not mounted on mobile
- State not updating on click
- CSS display: none affecting Dialog
- Z-index issue hiding Dialog

**Test Command**: Open on mobile device, click hamburger icon, should see overlay + menu slide from right

---

### 2. Image Upload Foreign Key Constraint Error
**Status**: BROKEN - Users can't upload images
**Severity**: CRITICAL
**Description**:
```
Error: insert or update on table "posts" violates foreign key constraint "posts_user_id_fkey"
```
**Files**:
- `app/[locale]/lighter/[id]/add/AddPostForm.tsx` (frontend)
- Supabase RPC function `create_new_post` (backend)

**Root Cause Analysis**:
The error indicates user_id is either:
1. Not being sent to the backend
2. Null/undefined when trying to insert
3. Referencing a user that doesn't exist in profiles table
4. Not being extracted from auth session correctly

**Investigation Steps**:
1. Check AddPostForm.tsx -> handleSubmit() -> supabase.rpc call
2. Verify p_is_anonymous parameter handling
3. Check if user.id is being passed correctly
4. Verify RPC function receives and uses user_id
5. Test with both anonymous=false and anonymous=true
6. Check if session.user exists when form is submitted
7. Verify user exists in profiles table

**Code Section to Check**:
```typescript
const { data, error: rpcError } = await supabase.rpc(RPC_FUNCTIONS.CREATE_NEW_POST, {
    p_lighter_id: lighterId,
    p_post_type: postType,
    p_title: title || null,
    // ... other params
    // MISSING? p_user_id: user.id // or similar
});
```

**Fix Likely Location**:
- Add user_id parameter to RPC call
- Or check if RPC function is extracting from session correctly
- Or ensure profiles record exists for user before insert

**Test**: Upload an image, should complete without FK error

---

### 3. Navigation Banner Shift on Login/Logout
**Status**: BROKEN - UX Issue
**Severity**: HIGH
**Description**: When logging in or logging out, navigation links shift to the right, making the last nav items unreadable. Refreshing fixes it temporarily.
**File**: `app/components/Header.tsx`
**Cause**: Likely conditional rendering removing/adding elements, causing layout shift

**Investigation Steps**:
1. Check Header component render logic for logged in vs logged out
2. Look for conditional elements that appear/disappear based on isLoggedIn
3. Check if logout button width differs from login button width
4. Look for flex layout issues
5. Check if nav items are being hidden vs removed from DOM

**Likely Causes**:
- Different width buttons (Login vs Logout)
- Conditional rendering causing flex layout shift
- Missing justify-between or similar constraint
- Z-index or absolute positioning issue

**Possible Fixes**:
- Use fixed width container for auth area
- Use visibility hidden instead of removing from DOM
- Use CSS to swap button content instead of conditional rendering
- Add flex-grow: 1 to nav items to prevent shift

**Test**: Login and logout, nav items should stay in same position

---

### 4. White Background Above Tiled Background (Add to Story Page)
**Status**: BROKEN - Visual issue
**Severity**: HIGH
**Description**: White/light background showing above the intended tiled background pattern on the Add to Story page
**Files**:
- `app/[locale]/lighter/[id]/add/page.tsx`
- `app/[locale]/lighter/[id]/add/AddPostForm.tsx`
- Possibly layout.tsx files

**Investigation Steps**:
1. Check page.tsx for any background styling
2. Check AddPostForm background
3. Check body/html background in globals.css
4. Check if body-with-bg class is applied
5. Check for white divs or containers with white bg
6. Inspect in browser DevTools to find source of white bg

**Likely Causes**:
- Body not has tiled background applied
- Absolute positioned element with white background
- Main container has white background
- Wrong z-index stacking order

**Expected**: Only tiled background visible, no white areas

**Test**: Navigate to Add Post page, should only see tiled background pattern, no white areas

---

## Quick Priority Checklist
- [ ] Fix burger menu - test on mobile
- [ ] Fix image upload - test image upload
- [ ] Fix nav shift - test login/logout
- [ ] Fix white background - test Add Post page visually

---

**ALL CHANGES DOCUMENTED ABOVE BEFORE AUTO-COMPACT**
**DO NOT LOSE THESE FILES**

Supporting Documentation:
- `FEATURE_REQUESTS_COMPREHENSIVE.md` - Complete feature list
- `IMPLEMENTATION_GUIDE.md` - Detailed implementation instructions
