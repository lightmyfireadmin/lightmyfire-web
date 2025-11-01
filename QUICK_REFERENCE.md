# LightMyFire - Quick Reference Guide

## Directory Tree (Simplified)

```
lightmyfire-web/
├── app/                          ← Next.js pages & API routes
│   ├── [locale]/                 ← All pages prefixed with /en, /fr, /de, /es
│   │   ├── page.tsx              ← Homepage
│   │   ├── layout.tsx            ← Main layout (Header, Footer, ToastWrapper)
│   │   ├── login/                ← Authentication
│   │   ├── save-lighter/         ← Save lighter flow (3 step wizard)
│   │   ├── lighter/[id]/         ← Lighter detail page
│   │   ├── lighter/[id]/add/     ← Add post form
│   │   ├── find/                 ← Find lighter by PIN
│   │   ├── my-profile/           ← User profile dashboard
│   │   ├── about/                ← About page
│   │   ├── legal/                ← Legal pages (FAQ, Privacy, Terms)
│   │   ├── dont-throw-me-away/   ← Refill guide
│   │   ├── moderation/           ← Moderation dashboard
│   │   └── globals.css           ← Global Tailwind styles
│   ├── api/                      ← Server-side API routes
│   │   ├── create-payment-intent/ ← Stripe integration
│   │   └── youtube-search/       ← YouTube API proxy
│   └── components/               ← Reusable UI components (22 total)
│
├── lib/                          ← Business logic & utilities
│   ├── supabase.ts              ← Supabase client config
│   ├── types.ts                 ← TypeScript interfaces
│   ├── constants.ts             ← Magic strings & config values
│   ├── context/                 ← Context providers (Toast)
│   ├── hooks/                   ← Custom React hooks
│   └── services/                ← Business logic services
│
├── locales/                      ← Internationalization (i18n)
│   ├── config.ts               ← i18n configuration
│   ├── en.ts, fr.ts, de.ts, etc. ← Translation files
│   ├── client.ts               ← Client-side i18n hooks
│   └── server.ts               ← Server-side i18n functions
│
├── public/                       ← Static assets
│   ├── LOGOLONG.png, LOGOSMALL.png
│   ├── illustrations/            ← Hero images & decorations
│   ├── flags/                   ← Country flag SVGs (256)
│   └── bgtile.png              ← Background pattern
│
├── supabase/                     ← Database configuration
│   └── migrations/              ← DB migrations
│
├── middleware.ts                 ← Next.js i18n + auth middleware
├── next.config.js               ← Next.js config
├── tailwind.config.js           ← Tailwind CSS config with custom colors
├── tsconfig.json                ← TypeScript config
└── package.json                 ← Dependencies
```

---

## Key Files by Task

### Frontend Components & Pages
- **Header**: `/app/components/Header.tsx` (z-50 mobile menu Dialog)
- **Footer**: `/app/components/Footer.tsx`
- **Navigation**: Uses `useCurrentLocale()` for language-aware links
- **Responsive**: Tailwind breakpoints: `sm:`, `md:`, `lg:`

### Styling
- **Global Styles**: `/app/globals.css`
- **Tailwind Config**: `/tailwind.config.js`
- **Colors**: Primary: `#B400A3` (magenta), Secondary: `#D7F2D4` (green)
- **Fonts**: Nunito Sans (body), Poppins (headings)
- **Button Classes**: `.btn-primary`, `.btn-secondary`

### Translations & Internationalization
- **Config**: `/locales/config.ts` (locales: en, fr, de, es)
- **Usage (Server)**: `const t = await getI18n(); t('key.path')`
- **Usage (Client)**: `const t = useI18n(); t('key.path')`
- **Translation Files**: `/locales/[locale].ts`

### Database & Supabase
- **Client Init**: `/lib/supabase.ts` (browser client)
- **Server Auth**: middleware.ts and page layouts
- **RPC Functions**: CreateNewPost, CreateNewLighter, ToggleLike, FlagPost
- **Storage Bucket**: `post-images`
- **Session Handling**: Cookie-based with Supabase SSR

### API Routes
- **YouTube Search**: `/app/api/youtube-search/route.ts` (GET)
- **Stripe Payments**: `/app/api/create-payment-intent/route.ts` (POST)
- **Security**: YOUTUBE_API_KEY is server-side only (NOT public)

### Types & Constants
- **Data Types**: `/lib/types.ts` (DetailedPost, Trophy, MyPostWithLighter)
- **RPC Functions**: `/lib/constants.ts` (RPC_FUNCTIONS, POST_TYPES, PIN_CONFIG)
- **File Upload**: Max 2MB, accepted: png/jpg/gif
- **PIN Format**: 6 characters, displayed as "ABC-123" (hyphen at position 3)

---

## Common Fixes Checklist

### Bug: Styling/Layout Issues
- [ ] Check `/app/globals.css` for CSS issues
- [ ] Check `tailwind.config.js` for color/font definitions
- [ ] Check component's className (Tailwind syntax)
- [ ] Test with `sm:`, `md:`, `lg:` responsive classes
- [ ] Check z-index for overlays (use `z-50` for modals)

### Bug: Translation Missing/Wrong
- [ ] Check all 4 translation files: en.ts, fr.ts, de.ts, es.ts
- [ ] Ensure key path matches usage: `t('section.subsection.key')`
- [ ] Don't forget to add to ALL active languages
- [ ] Test on page with `/en/`, `/fr/`, `/de/`, `/es/` prefix

### Bug: Page Not Loading / 404
- [ ] Check file location: `/app/[locale]/[route]/page.tsx`
- [ ] Verify route includes locale parameter in path
- [ ] Check middleware.ts route matcher
- [ ] Ensure page exports `export default` function

### Bug: API Error / Data Not Showing
- [ ] Check Supabase RPC function call in component
- [ ] Verify session exists: `const { data: { session } } = await supabase.auth.getSession()`
- [ ] Check response data structure matches `DetailedPost` type
- [ ] Verify user exists in profiles table (FK constraint)
- [ ] Check browser DevTools for network errors

### Bug: Mobile Menu / Dialog Not Working
- [ ] Check Dialog import: `from '@headlessui/react'`
- [ ] Verify state: `const [mobileMenuOpen, setMobileMenuOpen] = useState(false)`
- [ ] Check z-index: Should be `z-50` or higher
- [ ] Check Transition wrapper around dialog content
- [ ] Verify button click handler sets state: `onClick={() => setMobileMenuOpen(true)}`

### Bug: Form Submission Error
- [ ] Check form has `onSubmit` handler
- [ ] Verify input values are captured correctly
- [ ] Check Supabase RPC call has all required parameters
- [ ] Verify user_id is passed to backend
- [ ] Check for foreign key constraint violations
- [ ] Look for error toasts in browser

---

## Component Usage Examples

### Using Translations
```tsx
// Server Component
const t = await getI18n();
<h1>{t('home.hero.title')}</h1>

// Client Component
'use client';
const t = useI18n();
const lang = useCurrentLocale();
<Link href={`/${lang}/save-lighter`}>
  {t('nav.save_lighter')}
</Link>
```

### Using Supabase (Server)
```tsx
const supabase = createServerClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  { cookies: { /* ... */ } }
);
const { data: { session } } = await supabase.auth.getSession();
```

### Using Supabase (Client)
```tsx
'use client';
import { supabase } from '@/lib/supabase';
const { data, error } = await supabase.rpc('create_new_post', {
  p_lighter_id: '...',
  p_post_type: 'text',
  // ... other params
});
```

### Toast Notifications
```tsx
'use client';
import { useToast } from '@/lib/context/ToastContext';
const { showToast } = useToast();
showToast('Success!', 'success');
showToast('Error', 'error');
```

### Responsive Layout
```tsx
{/* Hidden on mobile, shown on lg+ */}
<div className="hidden lg:flex lg:gap-x-8">
  Navigation items
</div>

{/* Shown on mobile, hidden on lg+ */}
<div className="flex lg:hidden">
  Burger menu button
</div>
```

---

## Code Structure Patterns

### Page Components (Server)
```tsx
export const dynamic = 'force-dynamic'; // Always fetch fresh data
export default async function MyPage({ params: { locale } }) {
  const t = await getI18n();
  const cookieStore = cookies();
  const supabase = createServerClient(...);
  const { data: { session } } = await supabase.auth.getSession();
  
  return <div>{/* JSX */}</div>;
}
```

### Client Components
```tsx
'use client';
import { useI18n, useCurrentLocale } from '@/locales/client';
export default function MyComponent() {
  const t = useI18n();
  const lang = useCurrentLocale();
  
  return <div>{/* JSX */}</div>;
}
```

### Reusable Components
- Located in `/app/components/`
- Accept props for customization
- Use TypeScript for type safety
- Support both server and client use

---

## Testing Checklist

### Before Committing
- [ ] All 4 languages work: /en, /fr, /de, /es
- [ ] Mobile responsive (test with DevTools mobile view)
- [ ] Links use correct locale prefix: `/${locale}/path`
- [ ] No console errors or warnings
- [ ] Forms submit without errors
- [ ] Database queries return expected data
- [ ] Images load correctly
- [ ] Animations smooth (no janky transitions)
- [ ] Accessibility: Tab navigation works, ARIA labels present

---

## Deploy Notes

### Production Build
```bash
npm run build   # Creates .next folder
npm start       # Serves production build
```

### Environment Variables
Ensure these are set before deploy:
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- YOUTUBE_API_KEY (server-only, hidden from client)

### Deployment Platforms
- Next.js runs on: Vercel (native), Netlify, Railway, etc.
- Database: Supabase (PostgreSQL)
- Static files: Served from `/public` directory

---

## Documentation Files in Project

| File | Purpose |
|------|---------|
| **CODEBASE_STRUCTURE.md** | Detailed architecture overview |
| **CRITICAL_BUGS.md** | Known blocking issues |
| **REMAINING_FIXES_SESSION2.md** | Current todo items |
| **FEATURE_REQUESTS_COMPREHENSIVE.md** | Planned features |
| **IMPLEMENTATION_GUIDE.md** | Technical deep-dive |
| **YOUTUBE_API_SETUP.md** | YouTube integration guide |
| **README.md** | Project overview |

---

## Key Technologies

- **Framework**: Next.js 14.2.5
- **Language**: TypeScript 5
- **UI**: React 18 + Headless UI + Heroicons
- **Styling**: Tailwind CSS 3.4.4
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth + SSR cookies
- **i18n**: next-international
- **Data Fetching**: TanStack React Query
- **Maps**: Leaflet + React Leaflet
- **File Upload**: Supabase Storage
- **Payment**: Stripe (API route wrapper)

---

## Quick Command Reference

```bash
# Development
npm run dev          # Start dev server on localhost:3000

# Build
npm run build        # Compile for production
npm start            # Run production server

# Linting
npm run lint         # Check code quality

# File Editing
code .               # Open in VS Code
ls -la lightmyfire-web/  # See structure

# Git
git status           # Check uncommitted changes
git add .            # Stage changes
git commit -m "msg"  # Create commit
```

