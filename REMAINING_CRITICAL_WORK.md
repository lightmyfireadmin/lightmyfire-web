# LightMyFire - Remaining Critical & High Priority Work

**Last Updated:** 2025-11-01
**Status:** Ready for Implementation

---

## ✅ COMPLETED (This Session)

1. ✅ Fixed SQL RLS policies (corrected `owner_id` → `saver_id`)
2. ✅ Populated all 26 language files with banner translations
3. ✅ Implemented RTL support in SetHtmlLang component
4. ✅ Fixed all `t()` translation function calls (removed parameters)

---

## 🔴 CRITICAL ISSUES REMAINING

### 1. **Revoke Exposed YouTube API Key** (⚡ DO THIS FIRST)

**Status:** NOT YET DONE
**Severity:** 🔴 CRITICAL
**Time Estimate:** 15 minutes
**Files Affected:** `.env.local`

**The Problem:**
```
YOUTUBE_API_KEY=AIzaSyB6k_GbaeQp7rT2ZYx6FjYywO310l9SRYE
```
- This API key is exposed in the repository
- Anyone with repo access can abuse it
- Risk of quota theft and cost overruns

**What You Need To Do:**

1. **Go to Google Cloud Console** immediately:
   - Visit: https://console.cloud.google.com/
   - Navigate to: APIs & Services > Credentials
   - Find the key `AIzaSyB6k_GbaeQp7rT2ZYx6FjYywO310l9SRYE`
   - Click it and delete it (or disable it)

2. **Generate a New Key:**
   - Create new API key in Google Cloud Console
   - Enable YouTube Data API v3
   - Copy the new key

3. **Update Your `.env.local`:**
   ```bash
   # Replace the old key with the new one
   YOUTUBE_API_KEY=<YOUR_NEW_KEY>
   ```

4. **Verify `.env.local` is in `.gitignore`:**
   ```bash
   cat .gitignore | grep env.local
   # Should output: .env.local
   ```

5. **Remove Old Key from Git History:**
   ```bash
   # Only if the key has been committed to git
   git filter-branch --force --index-filter \
     "git rm --cached --ignore-unmatch .env.local" \
     --prune-empty --tag-name-filter cat -- --all
   ```

**Verification:**
- [ ] Old key is deleted from Google Cloud
- [ ] New key is generated
- [ ] `.env.local` is in `.gitignore`
- [ ] Git history has been cleaned (if needed)
- [ ] App can still search YouTube (test by searching for a lighter)

---

### 2. **Fix Memory Leak in Post Rotation**

**Status:** NOT YET DONE
**Severity:** 🔴 CRITICAL (Performance)
**Time Estimate:** 15 minutes
**File:** `app/components/RandomPostFeed.tsx`

**The Problem:**
```typescript
// Lines 27-47
useEffect(() => {
  const interval1 = setInterval(() => { ... }, 7000);

  const timeout2 = setTimeout(() => {
    const interval2 = setInterval(() => { ... }, 7000);
    return () => clearInterval(interval2); // ❌ Never executes!
  }, 1000);

  return () => {
    clearInterval(interval1);
    clearTimeout(timeout2);
    // ❌ interval2 is NEVER cleaned up - MEMORY LEAK!
  };
}, [posts]);
```

**Impact:**
- Every time component renders, old intervals aren't cleared
- User leaves page open for hours → memory keeps growing
- Browser becomes slow/unresponsive

**The Fix:**
```typescript
useEffect(() => {
  if (posts.length === 0) return;

  const interval1 = setInterval(() => {
    setVisiblePostIndex1((prev) => (prev + 2) % posts.length);
  }, 7000);

  // Declare interval2 outside setTimeout so we can clean it up
  let interval2: NodeJS.Timeout | undefined;
  const timeout2 = setTimeout(() => {
    interval2 = setInterval(() => {
      setVisiblePostIndex2((prev) => (prev + 2) % posts.length);
    }, 7000);
  }, 1000);

  return () => {
    clearInterval(interval1);
    clearTimeout(timeout2);
    if (interval2) clearInterval(interval2); // ✅ Now properly cleaned up
  };
}, [posts]);
```

**Verification:**
- [ ] Open DevTools (Chrome)
- [ ] Go to Memory tab
- [ ] Record memory snapshot
- [ ] Leave page open for 30 seconds
- [ ] Record another snapshot
- [ ] Memory should stay flat (not growing)

---

## 🟡 HIGH PRIORITY ISSUES

### 3. **Extract Duplicate Supabase Client Code**

**Status:** NOT YET DONE
**Severity:** 🟠 HIGH
**Time Estimate:** 45 minutes
**Impact:** Remove 150+ lines of duplicate code

**The Problem:**
Same Supabase client initialization code exists in 9+ files:
- `app/[locale]/page.tsx:21-37`
- `app/[locale]/layout.tsx:23-39`
- `app/[locale]/my-profile/page.tsx:29-38`
- `app/[locale]/lighter/[id]/page.tsx:79-88`
- `middleware.ts:13-37`
- And 4+ more...

**The Fix:**

Create a new utility file:
**File:** `lib/supabase/server.ts`

```typescript
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createServerSupabaseClient() {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options) {
          cookieStore.set({ name, value: '', ...options });
        },
      },
    }
  );
}
```

Then replace in all files:
```typescript
// Before:
const cookieStore = cookies();
const supabase = createServerClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    cookies: {
      get(name: string) { return cookieStore.get(name)?.value; },
      set(name: string, value: string, options) { ... },
      remove(name: string, options) { ... },
    },
  }
);

// After:
import { createServerSupabaseClient } from '@/lib/supabase/server';
const supabase = await createServerSupabaseClient();
```

**Files to Update:**
1. `app/[locale]/page.tsx`
2. `app/[locale]/layout.tsx`
3. `app/[locale]/my-profile/page.tsx`
4. `app/[locale]/lighter/[id]/page.tsx`
5. `middleware.ts`
6. (And 4+ more)

---

### 4. **Remove Excessive `any` Types**

**Status:** NOT YET DONE
**Severity:** 🟠 HIGH
**Time Estimate:** 30 minutes
**Impact:** Improve type safety

**The Problem:**

**File: `app/components/Header.tsx:27`**
```typescript
// Current (bad):
type Session = { user: any } | null;

// Fix: Use proper Supabase type
import { Session } from '@supabase/supabase-js';
// Then remove the custom type definition
```

**File: `app/components/PostCard.tsx:99-107`**
```typescript
// Current (bad):
{(post as any).nationality && (
  <span>{countryCodeToFlag((post as any).nationality)}</span>
)}

// Fix: Add proper typing to DetailedPost
// In lib/types.ts:
export type DetailedPost = {
  // ... existing fields
  nationality: string | null;
  show_nationality: boolean;
  role?: 'user' | 'moderator' | 'admin';
};

// In PostCard.tsx:
{post.show_nationality && post.nationality && (
  <span title={getCountryName(post.nationality)}>
    {countryCodeToFlag(post.nationality)}
  </span>
)}
```

**File: `app/api/youtube-search/route.ts:53`**
```typescript
// Current:
const video: any = videosData[0];

// Fix:
interface YouTubeVideo {
  id: { videoId: string };
  snippet: {
    title: string;
    description: string;
    thumbnails: {
      default: { url: string };
    };
  };
}

const video: YouTubeVideo | undefined = videosData[0];
```

---

### 5. **Add Image Optimization**

**Status:** NOT YET DONE
**Severity:** 🟠 HIGH
**Time Estimate:** 1 hour
**Impact:** Better Lighthouse scores, faster load times

**The Problem:**
12+ images missing `width`, `height`, `priority`, and `sizes` attributes.

**Example: `app/[locale]/page.tsx:56-61`**

```typescript
// Current (bad):
<Image
  src="/illustrations/thumbs_up.png"
  alt="LightMyFire"
  className="w-full h-full object-contain" // ❌ No dimensions
/>

// Fix:
<Image
  src="/illustrations/thumbs_up.png"
  alt="LightMyFire - Give lighters a second life"
  width={120}
  height={197}
  priority // ✅ Above the fold (loads immediately)
  sizes="(max-width: 768px) 80px, 120px"
  className="w-full h-full object-contain"
/>
```

**Key Changes:**
- ✅ Add explicit `width` and `height`
- ✅ Add `priority` to above-the-fold images
- ✅ Add `sizes` for responsive images
- ✅ Keep existing `alt` and `className`

**Find All Image Components:**
```bash
grep -r "<Image" app --include="*.tsx" | grep -v "width="
```

**Images to Fix (Priority Order):**
1. Homepage hero image
2. Feature illustration images
3. Post card images
4. Profile avatar images
5. Lighter illustration images

---

### 6. **Extract Hardcoded Legal/About Pages**

**Status:** NOT YET DONE
**Severity:** 🟠 HIGH
**Time Estimate:** 2-3 hours
**Legal Requirement:** GDPR compliance

**The Problem:**
Legal content is hardcoded in components (not translatable):
- `app/[locale]/legal/terms/page.tsx` - 88 lines
- `app/[locale]/legal/privacy/page.tsx` - 153 lines
- `app/[locale]/legal/faq/page.tsx` - 73 lines
- `app/[locale]/about/page.tsx` - 34 lines
- `app/[locale]/dont-throw-me-away/page.tsx` - 187 lines

**GDPR Requirement:** Users must see privacy policy in their language.

**Solution Options:**

**Option A: Move to Locale Files (Recommended)**
```typescript
// locales/en.ts
export default {
  'legal.privacy.title': 'Privacy Policy',
  'legal.privacy.section1.title': 'Data Protection',
  'legal.privacy.section1.content': 'We collect...',
  // ... 50+ more keys
};

// Then in app/[locale]/legal/privacy/page.tsx:
import { useI18n } from '@/locales/client';

export default function PrivacyPage() {
  const t = useI18n();
  return (
    <div>
      <h1>{t('legal.privacy.title')}</h1>
      <section>
        <h2>{t('legal.privacy.section1.title')}</h2>
        <p>{t('legal.privacy.section1.content')}</p>
      </section>
    </div>
  );
}
```

**Option B: Move to Markdown Files**
```
content/legal/
├── privacy/
│   ├── en.md
│   ├── fr.md
│   ├── de.md
│   └── es.md
├── terms/
│   ├── en.md
│   ├── fr.md
│   └── ...
└── about/
    ├── en.md
    └── ...
```

Then load dynamically:
```typescript
import { readFileSync } from 'fs';
import { marked } from 'marked';
import { useI18n } from '@/locales/client';

export default function PrivacyPage() {
  const locale = useCurrentLocale();
  const markdown = readFileSync(`content/legal/privacy/${locale}.md`, 'utf-8');
  const html = await marked(markdown);

  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
```

**Recommended:** Option A (faster to implement, integrates with existing i18n system)

---

## 📊 PRIORITY MATRIX

| Issue | Priority | Time | Impact | Difficulty |
|-------|----------|------|--------|------------|
| Revoke API Key | 🔴 CRITICAL | 15 min | Security | Easy |
| Fix Memory Leak | 🔴 CRITICAL | 15 min | Performance | Easy |
| Extract Supabase Code | 🟠 HIGH | 45 min | Maintainability | Medium |
| Remove `any` Types | 🟠 HIGH | 30 min | Type Safety | Medium |
| Image Optimization | 🟠 HIGH | 1 hour | Performance | Easy |
| Extract Legal Pages | 🟠 HIGH | 2-3 hours | Compliance | Medium |

---

## 🎯 SUGGESTED EXECUTION ORDER

### Session 1: Critical Issues (30 minutes)
1. Revoke YouTube API Key (15 min)
2. Fix Memory Leak in RandomPostFeed (15 min)

### Session 2: High Priority - Easy (1.5 hours)
3. Remove `any` types from Header & PostCard (30 min)
4. Optimize all images (1 hour)

### Session 3: High Priority - Medium (2.5 hours)
5. Extract duplicate Supabase code (45 min)
6. Extract hardcoded legal pages (2+ hours)

---

## 📝 NEXT STEPS

You should work through issues **in this order**:

1. **First:** Revoke the exposed API key (critical security issue)
2. **Second:** Fix the memory leak (affects user experience)
3. **Then:** Continue with high-priority improvements

Ready to start? Which issue would you like to tackle first?

---

**Questions/Help:**
- Need help revoking the API key? Google Cloud Console steps are detailed above
- Need code snippets for any fix? All are provided in this document
- Want me to implement any of these? Just ask!
