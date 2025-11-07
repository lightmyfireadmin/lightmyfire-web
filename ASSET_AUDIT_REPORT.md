# LightMyFire Asset Audit Report

**Date:** 2025-11-07
**Total Assets Analyzed:** 302 files (65MB)
**Unused Assets Found:** 277 files (33.7MB - 52% waste!)
**Potential Total Savings:** 51-58MB (78-89% reduction)

---

## Executive Summary

The LightMyFire webapp contains significant asset bloat with over **half of all assets completely unused**. The most critical findings:

- **Entire `/flags` directory** (254 files, 466KB) is unused - app uses Unicode emoji flags instead
- **15 of 18 font files** (2.4MB) are unused - only 3 needed for server-side sticker generation
- **8 of 15 illustrations** (27.4MB) are unused - leftover from design exploration
- **4 of 20 new assets** (3.3MB) are unused marketing images

**Quick Wins:**
- Delete unused files: **33.7MB immediate savings**
- Optimize used illustrations: **15-20MB additional savings**
- Replace loading.gif with CSS: **868KB savings**

---

## 🚨 CRITICAL FINDINGS

### 1. Unused Illustrations - 27.4MB Wasted ⚠️

**DELETE THESE 8 FILES:**

| File | Size | Status | References |
|------|------|--------|------------|
| `variety.png` | 7.6MB | ❌ UNUSED | 0 |
| `big_group.png` | 4.9MB | ❌ UNUSED | 0 |
| `community.png` | 4.3MB | ❌ UNUSED | 0 |
| `commenting.png` | 3.1MB | ❌ UNUSED | 0 |
| `sharing.png` | 2.5MB | ❌ UNUSED | 0 |
| `confused.png` | 2.0MB | ❌ UNUSED | 0 |
| `presentation_card.png` | 2.0MB | ❌ UNUSED | 0 |
| `flame_item.png` | 1.0MB | ❌ UNUSED | 0 |

**SUBTOTAL: 27.4MB**

**KEEP THESE 7 FILES:**

| File | Size | Used In | References |
|------|------|---------|------------|
| `around_the_world.png` | 2.8MB | 4 pages | page.tsx, about/page.tsx, PinEntryForm.tsx, save-lighter/page.tsx |
| `thumbs_up.png` | 3.1MB | 2 pages | page.tsx, ModerationQueue.tsx |
| `telling_stories.png` | 4.7MB | 4 pages | page.tsx, lighter/[id]/page.tsx, MyPostsList.tsx, save-lighter/page.tsx |
| `personalise.png` | 2.0MB | 3 pages | page.tsx, my-profile/page.tsx, save-lighter/page.tsx |
| `CTA_rainbow_arrow.png` | 2.3MB | 1 page | page.tsx |
| `dreaming_hoping.png` | 3.0MB | 1 page | EmptyLighterPosts.tsx |
| `assistance_questions.png` | 2.7MB | 1 page | legal/faq/page.tsx |

---

### 2. Entire Flags Directory Unused - 466KB Wasted

**DELETE ENTIRE DIRECTORY:** `/public/flags/` (254 PNG files)

**Why Unused:**
- App uses Unicode flag emojis via `countryCodeToFlag()` function
- Function converts ISO codes to emoji (e.g., "US" → 🇺🇸)
- Implementation in: `/lib/countryToFlag.ts`
- Used in: `/app/components/PostCard.tsx:10`
- **Zero references to `/flags/` directory anywhere in codebase**

**SUBTOTAL: 466KB**

---

### 3. Font Files Bloat - 2.4MB Wasted

**DELETE THESE 15 FILES:**

All italic and unused weight variants of Poppins (2.4MB total):
- Poppins-Black.ttf (148KB)
- Poppins-BlackItalic.ttf (168KB)
- Poppins-BoldItalic.ttf (173KB)
- Poppins-ExtraLight.ttf (158KB)
- Poppins-ExtraLightItalic.ttf (182KB)
- Poppins-Italic.ttf (178KB)
- Poppins-Light.ttf (157KB)
- Poppins-LightItalic.ttf (181KB)
- Poppins-MediumItalic.ttf (177KB)
- Poppins-Regular.ttf (155KB)
- Poppins-SemiBold.ttf (152KB)
- Poppins-SemiBoldItalic.ttf (175KB)
- Poppins-Thin.ttf (158KB)
- Poppins-ThinItalic.ttf (183KB)
- Poppins-ExtraBoldItalic.ttf (170KB)

**KEEP THESE 3 FILES:**

| File | Size | Purpose | Referenced In |
|------|------|---------|---------------|
| `Poppins-ExtraBold.ttf` | 150KB | Sticker generation (weight: 800) | generate-printful-stickers/route.ts:16 |
| `Poppins-Bold.ttf` | 151KB | Sticker generation (weight: bold) | generate-printful-stickers/route.ts:24 |
| `Poppins-Medium.ttf` | 153KB | Sticker generation (weight: 500) | generate-printful-stickers/route.ts:32 |

**Font Usage Explanation:**
- **Web Display:** Fonts loaded via Google Fonts CDN (`/app/globals.css:1`)
- **Sticker Generation:** Node Canvas requires local TTF files for server-side rendering
- **Conclusion:** Only 3 font files needed for server-side sticker generation

**SUBTOTAL: 2.4MB**

---

### 4. Unused New Assets - 3.3MB Wasted

**DELETE THESE 4 FILES:**

| File | Size | Status | Type |
|------|------|--------|------|
| `act_for_planet.png` | 1.1MB | ❌ UNUSED | Marketing |
| `human_mosaic.png` | 976KB | ❌ UNUSED | Marketing |
| `sustainable_lighter.png` | 660KB | ❌ UNUSED | Marketing |
| `creative_lighter.png` | 596KB | ❌ UNUSED | Marketing |

**KEEP THESE 16 FILES:**

**Trophy Images (ALL 10 USED):**
| File | Size | Used In |
|------|------|---------|
| `fire_starter_trophy.png` | 660KB | TrophyList.tsx:37 |
| `story_teller_trophy.png` | 592KB | TrophyList.tsx:38 |
| `chronicles_trophy.png` | 561KB | TrophyList.tsx:39 |
| `epic_saga_trophy.png` | 400KB | TrophyList.tsx:40 |
| `collector_trophy.png` | 494KB | TrophyList.tsx:41 |
| `community_builder_trophy.png` | 347KB | TrophyList.tsx:42 |
| `globe_trotter_trophy.png` | 856KB | TrophyList.tsx:43 |
| `popular_contributor_trophy.png` | 414KB | TrophyList.tsx:44 |
| `photographer_trophy.png` | 479KB | TrophyList.tsx:45 |
| `musician_trophy.png` | 302KB | TrophyList.tsx:46 |

**Lighter Type Images (ALL 6 USED):**
| File | Size | Used In |
|------|------|---------|
| `butane_refillable.png` | 588KB | dont-throw-me-away/page.tsx:71 |
| `gasoline_refillable.png` | 819KB | dont-throw-me-away/page.tsx:105 |
| `non_refillable.png` | 558KB | dont-throw-me-away/page.tsx:141 |
| `butane_refill_process.png` | 455KB | dont-throw-me-away/page.tsx:190 |
| `gasoline_refill_process.png` | 550KB | dont-throw-me-away/page.tsx:248 |
| `sticker_bg_layer.png` | 901KB | FullStickerPreview.tsx:106, generate-printful-stickers/route.ts |

**SUBTOTAL: 3.3MB**

---

### 5. Root Directory Cleanup - 170KB Wasted

**DELETE THESE 8 FILES:**

| File | Size | Reason |
|------|------|--------|
| `SEE1.png` | 8KB | No references |
| `circle-scatter-haikei.png` | 130KB | No references |
| `file.svg` | 391B | Next.js default, unused |
| `globe.svg` | 1.1KB | No references |
| `next.svg` | 1.4KB | Next.js default, unused |
| `seethrough.png` | 31KB | No references |
| `vercel.svg` | 128B | Vercel default, unused |
| `window.svg` | 385B | Next.js default, unused |

**KEEP THESE 5 FILES:**

| File | Size | Used In | References |
|------|------|---------|------------|
| `LOGOLONG.png` | 94KB | Logo | Header.tsx, FullStickerPreview.tsx, stickerToPng.ts, generate-printful-stickers/route.ts, generate-sticker-pdf/route.ts |
| `bgtile.png` | 1.4MB | Background pattern | globals.css:182, 202 |
| `loading.gif` | 868KB | Loading states | loading.tsx, AddPostForm.tsx:549, 554 |
| `favicon.png` | 4.7KB | Apple touch icon | layout.tsx:10 |
| `webclip.png` | 45KB | Apple touch icon | layout.tsx:10 |

**Note:** `favicon.ico` exists in `/app/favicon.ico` (15KB) and is automatically used by Next.js

**SUBTOTAL: 170KB**

---

## 📊 OPTIMIZATION OPPORTUNITIES

### Critical: Oversized Active Assets

**A. Used Illustrations (27.3MB - Need Optimization)**

All 7 actively-used illustrations are excessively large:

| File | Current Size | Est. WebP Size | Savings |
|------|--------------|----------------|---------|
| `telling_stories.png` | 4.7MB | ~940KB | 3.76MB |
| `thumbs_up.png` | 3.1MB | ~620KB | 2.48MB |
| `dreaming_hoping.png` | 3.0MB | ~600KB | 2.40MB |
| `around_the_world.png` | 2.8MB | ~560KB | 2.24MB |
| `assistance_questions.png` | 2.7MB | ~540KB | 2.16MB |
| `CTA_rainbow_arrow.png` | 2.3MB | ~460KB | 1.84MB |
| `personalise.png` | 2.0MB | ~400KB | 1.60MB |

**Total Potential Savings: ~16.5MB (60-80% reduction)**

**Recommendations:**
1. Convert to WebP format with quality 80
2. Or optimize with TinyPNG/ImageOptim
3. Implement Next.js Image Optimization for automatic format conversion

---

**B. Background Tile (1.4MB - CRITICAL)**

- **File:** `bgtile.png` (1.4MB)
- **Impact:** Loads on EVERY page
- **Current:** Large PNG with repeating pattern
- **Recommendation:**
  - Compress more aggressively (target: 200-300KB)
  - Or create smaller repeating pattern tile
  - Or use CSS gradient as fallback

**Potential Savings: 1.1MB**

---

**C. Loading GIF (868KB)**

- **File:** `loading.gif` (868KB)
- **Used:** loading.tsx, AddPostForm.tsx
- **Recommendation:** Replace with CSS spinner or SVG animation
- **Benefit:** 868KB savings + faster load time

**Example CSS Spinner (0KB):**
```css
.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #FF6B6B;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}
```

**Potential Savings: 868KB**

---

**D. Trophy Assets (5.1MB total)**

Largest trophies could be optimized:
- globe_trotter_trophy.png (856KB → ~350KB)
- fire_starter_trophy.png (660KB → ~270KB)
- story_teller_trophy.png (592KB → ~240KB)
- chronicles_trophy.png (561KB → ~230KB)

**Potential Savings: 2-3MB**

---

## 🎯 ACTION PLAN

### Phase 1: Delete Unused Assets (33.7MB Immediate Savings)

**SAFE TO DELETE - Zero References:**

```bash
# Backup first (optional but recommended)
tar -czf assets-backup-$(date +%Y%m%d).tar.gz public/

# Delete unused illustrations (27.4MB)
rm public/illustrations/variety.png
rm public/illustrations/big_group.png
rm public/illustrations/community.png
rm public/illustrations/commenting.png
rm public/illustrations/sharing.png
rm public/illustrations/confused.png
rm public/illustrations/presentation_card.png
rm public/illustrations/flame_item.png

# Delete unused new assets (3.3MB)
rm public/newassets/act_for_planet.png
rm public/newassets/human_mosaic.png
rm public/newassets/sustainable_lighter.png
rm public/newassets/creative_lighter.png

# Delete entire flags directory (466KB)
rm -rf public/flags/

# Delete unused fonts (2.4MB)
cd public/fonts/
rm Poppins-Black.ttf
rm Poppins-BlackItalic.ttf
rm Poppins-BoldItalic.ttf
rm Poppins-ExtraLight.ttf
rm Poppins-ExtraLightItalic.ttf
rm Poppins-Italic.ttf
rm Poppins-Light.ttf
rm Poppins-LightItalic.ttf
rm Poppins-MediumItalic.ttf
rm Poppins-Regular.ttf
rm Poppins-SemiBold.ttf
rm Poppins-SemiBoldItalic.ttf
rm Poppins-Thin.ttf
rm Poppins-ThinItalic.ttf
rm Poppins-ExtraBoldItalic.ttf
cd ../..

# Delete unused root files (170KB)
rm public/SEE1.png
rm public/circle-scatter-haikei.png
rm public/file.svg
rm public/globe.svg
rm public/next.svg
rm public/seethrough.png
rm public/vercel.svg
rm public/window.svg
```

**After Deletion:**
- Run: `npm run build` to verify no broken references
- Test: Homepage, sticker generation, trophy system
- Commit: `git add -A && git commit -m "chore: Remove 33.7MB of unused assets"`

---

### Phase 2: Optimize Used Assets (15-20MB Additional Savings)

**Tool Recommendations:**
- **ImageOptim** (Mac) - Lossless PNG optimization
- **TinyPNG** (Web) - Great compression with quality preservation
- **Squoosh** (Web) - WebP conversion with preview
- **Next.js Image Optimization** - Automatic format conversion

**Priority Order:**
1. Convert 7 illustrations to WebP (~16.5MB savings)
2. Optimize bgtile.png (~1.1MB savings)
3. Replace loading.gif with CSS (~868KB savings)
4. Optimize trophy images (~2-3MB savings)

---

### Phase 3: Implement Next.js Image Optimization

Update image imports to use Next.js `<Image>` component:

```tsx
import Image from 'next/image';

// Before
<img src="/illustrations/thumbs_up.png" alt="..." />

// After (automatic WebP conversion on modern browsers)
<Image
  src="/illustrations/thumbs_up.png"
  alt="..."
  width={400}
  height={300}
  quality={80}
/>
```

**Benefits:**
- Automatic format conversion (WebP, AVIF)
- Lazy loading
- Responsive images
- No code changes needed after initial implementation

---

## 📈 SUMMARY STATISTICS

### Current State
| Category | Files | Size |
|----------|-------|------|
| **Total Assets** | 302 | 65MB |
| **Used Assets** | 25 | 31.3MB |
| **Unused Assets** | 277 | 33.7MB |

### Asset Breakdown
| Directory | Total Files | Used | Unused | Wasted Space |
|-----------|-------------|------|--------|--------------|
| Illustrations | 15 | 7 | 8 | 27.4MB |
| New Assets | 20 | 16 | 4 | 3.3MB |
| Flags | 254 | 0 | 254 | 466KB |
| Fonts | 18 | 3 | 15 | 2.4MB |
| Root | 13 | 5 | 8 | 170KB |

### Optimization Potential
| Action | Savings | Effort |
|--------|---------|--------|
| Delete unused files | 33.7MB | Low (5 min) |
| Optimize illustrations | 16.5MB | Medium (30 min) |
| Optimize background | 1.1MB | Low (5 min) |
| Replace loading GIF | 868KB | Medium (15 min) |
| Optimize trophies | 2-3MB | Medium (20 min) |
| **TOTAL** | **54-55MB** | **~70 minutes** |

### Final Result
- **Current:** 65MB total assets
- **After Cleanup:** 31.3MB (51.7% reduction)
- **After Optimization:** 10-11MB (83-85% reduction!)

---

## ✅ VERIFICATION CHECKLIST

After deleting assets, verify these critical paths:

**Homepage:**
- [ ] Background pattern loads (bgtile.png)
- [ ] Hero illustrations display (around_the_world.png, thumbs_up.png, etc.)
- [ ] CTA arrow displays (CTA_rainbow_arrow.png)

**Sticker Generation:**
- [ ] Logo renders on stickers (LOGOLONG.png)
- [ ] Fonts load correctly (3 Poppins variants)
- [ ] Background layer displays (sticker_bg_layer.png)

**Trophy System:**
- [ ] All 10 trophies display in my-profile
- [ ] Trophy images load without errors

**Lighter Types:**
- [ ] Refillable lighter images display
- [ ] Refill process diagrams load

**General:**
- [ ] No broken image references in console
- [ ] No 404 errors for missing assets
- [ ] Build completes without warnings
- [ ] Loading states work (loading.gif or replacement)

---

## 🔍 ADDITIONAL FINDINGS

### Positive Findings
✅ All trophy images properly used (10/10)
✅ All lighter type images properly used (6/6)
✅ Logo used consistently across 5 locations
✅ No broken image references detected
✅ Unicode flags working correctly (no PNG flags needed)

### Areas for Improvement
⚠️ Illustrations extremely large (4-7MB each)
⚠️ Background tile could be smaller
⚠️ Loading GIF could be replaced with CSS
⚠️ No WebP format images (missing modern optimization)
⚠️ No image lazy loading implementation

---

## 📋 MAINTENANCE RECOMMENDATIONS

**Going Forward:**

1. **Asset Addition Policy:**
   - Optimize images before adding to repo
   - Use WebP format when possible
   - Target < 200KB per image
   - Document asset usage in commit message

2. **Regular Audits:**
   - Run asset audit quarterly
   - Check for unused assets before major releases
   - Monitor asset size growth

3. **Automation:**
   - Add pre-commit hook to check image sizes
   - Implement automatic image optimization in build process
   - Use Next.js Image Optimization for all images

4. **Tools:**
   - ImageOptim for batch optimization
   - Squoosh for WebP conversion
   - Lighthouse for performance auditing

---

**Report Generated:** 2025-11-07
**Next Audit:** 2026-02-07 (3 months)
**Reviewed By:** Automated Asset Analysis
**Approved For Cleanup:** Pending user confirmation
