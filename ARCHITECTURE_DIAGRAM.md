# LightMyFire - Architecture Diagram

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER'S BROWSER                            │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                  Next.js Client (React)                  │   │
│  │  ┌──────────────────────────────────────────────────┐   │   │
│  │  │ Pages (Server & Client Components)               │   │   │
│  │  │  - [locale]/page.tsx (Homepage)                  │   │   │
│  │  │  - [locale]/lighter/[id]/page.tsx (Detail)       │   │   │
│  │  │  - [locale]/save-lighter/page.tsx (Wizard)       │   │   │
│  │  │  - [locale]/my-profile/page.tsx (Profile)        │   │   │
│  │  │  - [locale]/login/page.tsx (Auth)                │   │   │
│  │  └──────────────────────────────────────────────────┘   │   │
│  │                                                           │   │
│  │  ┌──────────────────────────────────────────────────┐   │   │
│  │  │ Components (22 Reusable UI Pieces)               │   │   │
│  │  │  - Header.tsx (with mobile menu)                 │   │   │
│  │  │  - Footer.tsx                                    │   │   │
│  │  │  - PostCard.tsx, RandomPostFeed.tsx              │   │   │
│  │  │  - PinEntryForm.tsx, LocationSearch.tsx          │   │   │
│  │  │  - LikeButton.tsx, LanguageSwitcher.tsx          │   │   │
│  │  │  - Toast.tsx, ConfirmModal.tsx                   │   │   │
│  │  └──────────────────────────────────────────────────┘   │   │
│  │                                                           │   │
│  │  Styling: Tailwind CSS 3.4.4                             │   │
│  │  - /app/globals.css (font imports, animations)          │   │
│  │  - tailwind.config.js (colors, custom utilities)        │   │
│  │  - Custom colors: Primary #B400A3, Secondary #D7F2D4     │   │
│  │  - Custom fonts: Nunito Sans, Poppins                   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              ▲                                    │
│                              │                                    │
│                         (Browser Fetch)                          │
│                              │                                    │
└──────────────────────────────┼────────────────────────────────────┘
                               │
                    ┌──────────┴──────────┐
                    │                     │
        ┌───────────▼──────────┐  ┌──────▼───────────┐
        │  NEXT.JS SERVER      │  │  SUPABASE API    │
        │  (Node.js)           │  │  (PostgreSQL)    │
        └──────────┬──────────┘  └──────┬───────────┘
                   │                     │
        ┌──────────▼──────────┐          │
        │ /app/api/           │          │
        │ - youtube-search/   │──────────┤ (RPC calls)
        │   (GET)             │          │
        │ - create-payment-   │          │
        │   intent/ (POST)    │          │
        └─────────────────────┘          │
                                         │
                   ┌─────────────────────┴────────────────┐
                   │                                      │
            ┌──────▼────────┐          ┌────────▼────────┐
            │ PostgreSQL DB │          │ Storage Bucket  │
            │ - users       │          │ - post-images   │
            │ - lighters    │          │ (file uploads)  │
            │ - posts       │          │                 │
            │ - likes       │          └─────────────────┘
            │ - trophies    │
            │ - flags       │
            └───────────────┘
```

---

## Routing & Locale Flow

```
User requests: https://example.com/save-lighter
                              │
                              ▼
                    ┌─────────────────────┐
                    │  middleware.ts      │
                    │  - Detect locale    │
                    │  - Set i18n cookie  │
                    │  - Check auth       │
                    └────────────┬────────┘
                                 │
                    ┌────────────▼──────────────┐
                    │ I18nMiddleware detects   │
                    │ browser language or     │
                    │ default to 'en'         │
                    └────────────┬──────────────┘
                                 │
                    ┌────────────▼──────────────┐
                    │ Redirect to:             │
                    │ /en/save-lighter OR      │
                    │ /fr/save-lighter OR      │
                    │ /de/save-lighter OR      │
                    │ /es/save-lighter        │
                    └────────────┬──────────────┘
                                 │
                    ┌────────────▼───────────────────┐
                    │ Load Layout:                  │
                    │ /app/[locale]/layout.tsx      │
                    │ - Header                      │
                    │ - ToastWrapper                │
                    │ - I18nProviderClient          │
                    │ - Footer                      │
                    └────────────┬───────────────────┘
                                 │
                    ┌────────────▼──────────────────────┐
                    │ Load Page:                       │
                    │ /app/[locale]/save-lighter/      │
                    │ page.tsx                         │
                    │ - SaveLighterFlow component      │
                    └────────────┬──────────────────────┘
                                 │
                    ┌────────────▼──────────────────┐
                    │ Render with translations:    │
                    │ const t = await getI18n()    │
                    │ t('save_lighter.title')      │
                    │                              │
                    │ Render with localized links: │
                    │ Link href={`/${lang}/...`}   │
                    └──────────────────────────────┘
```

---

## Translation System (i18n) Flow

```
┌────────────────────────────────────────────────────────┐
│  locales/                                              │
│  ├─ config.ts                                          │
│  │  export const i18n = {                              │
│  │    defaultLocale: 'en',                             │
│  │    locales: ['en', 'fr', 'de', 'es']                │
│  │  }                                                   │
│  │                                                      │
│  ├─ server.ts                                          │
│  │  export async function getI18n() { ... }            │
│  │  export async function getCurrentLocale() { ... }   │
│  │                                                      │
│  ├─ client.ts                                          │
│  │  export function useI18n() { ... }                  │
│  │  export function useCurrentLocale() { ... }         │
│  │                                                      │
│  └─ Translation Files:                                 │
│     ├─ en.ts  ✅ Complete                              │
│     ├─ fr.ts  ✅ Complete                              │
│     ├─ de.ts  ✅ Complete                              │
│     ├─ es.ts  ✅ Complete                              │
│     ├─ hi.ts  ⚠️ Partial                               │
│     └─ [others] ❌ Empty                               │
│                                                        │
│  Structure (in each locale file):                      │
│  {                                                     │
│    home: {                                             │
│      hero: {                                           │
│        title: "Give lighters a second life",           │
│        cta: "Save a lighter"                           │
│      },                                                │
│      how_it_works: { step1: {...}, ... }               │
│    },                                                  │
│    nav: { ... },                                       │
│    buttons: { ... }                                    │
│  }                                                     │
└────────────────────────────────────────────────────────┘

Usage in Components:

SERVER COMPONENT:                CLIENT COMPONENT:
const t = await getI18n();       'use client';
<h1>{t('home.hero.title')}</h1>  const t = useI18n();
                                 const lang = useCurrentLocale();
                                 <Link href={`/${lang}/...`}>
```

---

## Supabase Integration Flow

```
┌─────────────────────────────────────────────────────────┐
│  Component (Client-side example)                        │
│  - User fills form                                      │
│  - onClick: handleSubmit()                              │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│  Supabase Client (lib/supabase.ts)                      │
│  import { supabase } from '@/lib/supabase'              │
│                                                          │
│  supabase.rpc('create_new_post', {                      │
│    p_lighter_id: '...',                                 │
│    p_post_type: 'text',                                 │
│    p_title: '...',                                      │
│    p_content_text: '...',                               │
│    p_is_anonymous: false,                               │
│    // ... other params                                  │
│  })                                                      │
└────────────────┬────────────────────────────────────────┘
                 │ (Network request)
                 ▼
┌─────────────────────────────────────────────────────────┐
│  Supabase Backend (PostgreSQL)                          │
│  /supabase/migrations/                                  │
│                                                          │
│  RPC Functions (from lib/constants.ts):                 │
│  - get_lighter_id_from_pin(pin)                         │
│  - create_new_lighter(name, ...)                        │
│  - create_new_post(lighter_id, ...)                     │
│  - toggle_like(post_id, ...)                            │
│  - flag_post(post_id, reason)                           │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│  Database Tables                                        │
│  - users                                                │
│  - profiles                                             │
│  - lighters (name, pin, user_id, ...)                   │
│  - posts (lighter_id, user_id, post_type, ...)          │
│  - likes (post_id, user_id)                             │
│  - trophies (user_id, name, ...)                        │
│  - flags (post_id, reason, ...)                         │
│  - storage/post-images (file uploads)                   │
└────────────────┬────────────────────────────────────────┘
                 │ (Return data)
                 ▼
┌─────────────────────────────────────────────────────────┐
│  Response to Component                                  │
│  {                                                       │
│    data: { id: 123, ... },                              │
│    error: null                                          │
│  }                                                       │
│                                                          │
│  or error:                                               │
│  {                                                       │
│    data: null,                                          │
│    error: { message: "FK constraint violation", ... }   │
│  }                                                       │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│  Component Logic                                        │
│  - Check for error                                      │
│  - Show toast notification                              │
│  - Update local state or redirect                       │
└─────────────────────────────────────────────────────────┘
```

---

## Data Type Relationships

```
┌──────────────────────────────────────────────┐
│  User (Supabase Auth)                        │
│  - id (UUID)                                 │
│  - email                                     │
│  └─ profile (relationship)                   │
│                                              │
└──────────────────┬───────────────────────────┘
                   │
                   │ owns many
                   ▼
┌──────────────────────────────────────────────┐
│  Lighter                                     │
│  - id (UUID)                                 │
│  - pin (ABC-123 format)                      │
│  - name (user given)                         │
│  - description                               │
│  - user_id (FK to users)                     │
│  └─ posts (relationship)                     │
│     └─ likes (relationship)                  │
│                                              │
└──────────────────┬───────────────────────────┘
                   │
                   │ has many
                   ▼
┌──────────────────────────────────────────────┐
│  Post (DetailedPost type)                    │
│  - id (Int)                                  │
│  - lighter_id (FK)                           │
│  - user_id (FK to users)                     │
│  - post_type (text|image|song|location)      │
│  - title (optional)                          │
│  - content_text (optional)                   │
│  - content_url (optional)                    │
│  - location_name, location_lat/lng (optional)│
│  - created_at (timestamp)                    │
│  - is_anonymous, is_pinned, is_public        │
│  └─ likes (relationship)                     │
│  └─ flags (relationship)                     │
│                                              │
└──────────────────┬───────────────────────────┘
                   │
        ┌──────────┴──────────┐
        │                     │
        ▼                     ▼
   ┌────────────┐      ┌──────────────┐
   │  Like      │      │  Flag        │
   │  - post_id │      │  - post_id   │
   │  - user_id │      │  - reason    │
   │  - count   │      │  - count     │
   └────────────┘      └──────────────┘
```

---

## Component Hierarchy

```
┌─────────────────────────────────────────────┐
│  RootLayout (app/layout.tsx)                │
│  - SetHtmlLang                              │
│  - body flex column layout                  │
│                                             │
│  └─ ┌────────────────────────────────────┐ │
│     │ LangLayout ([locale]/layout.tsx)   │ │
│     │ - I18nProviderClient               │ │
│     │ - ToastWrapper                     │ │
│     │ - Header (sticky z-50)             │ │
│     │ - main (flex-grow)                 │ │
│     │ - Footer                           │ │
│     │ - CookieConsent                    │ │
│     │                                    │ │
│     │ ┌─ Page Components:                │ │
│     │ │  - page.tsx (Homepage)           │ │
│     │ │  - login/page.tsx                │ │
│     │ │  - save-lighter/page.tsx         │ │
│     │ │  - lighter/[id]/page.tsx         │ │
│     │ │  - my-profile/page.tsx           │ │
│     │ │  - ...other pages                │ │
│     │ │                                  │ │
│     │ │  ├─ Shared Components:           │ │
│     │ │  │  - PostCard                   │ │
│     │ │  │  - RandomPostFeed             │ │
│     │ │  │  - PinEntryForm               │ │
│     │ │  │  - LocationSearch             │ │
│     │ │  │  - ... (22 components total)  │ │
│     │ │  │                               │ │
│     │ │  └─ Context:                     │ │
│     │ │     - ToastContext               │ │
│     │ │                                  │ │
│     │ └─ Features:                       │ │
│     │    - Error boundary (not-found)   │ │
│     │    - Loading states               │ │
│     │    - Suspense boundaries          │ │
│     │                                    │ │
│     └────────────────────────────────────┘ │
│                                             │
└─────────────────────────────────────────────┘
```

---

## File Upload & Storage Flow

```
User uploads image from AddPostForm
              │
              ▼
┌────────────────────────────────┐
│ fileValidation.ts              │
│ - Check file size (max 2MB)     │
│ - Check type (png/jpg/gif)      │
│ - Validate extension            │
└────────────────┬───────────────┘
                 │ (if valid)
                 ▼
┌────────────────────────────────┐
│ Supabase Storage               │
│ /post-images bucket            │
│ - Upload file                  │
│ - Get public URL               │
└────────────────┬───────────────┘
                 │
                 ▼
┌────────────────────────────────┐
│ Database (posts table)         │
│ - content_url: uploaded URL    │
│ - post_type: 'image'           │
│ - Store reference              │
└────────────────┬───────────────┘
                 │
                 ▼
┌────────────────────────────────┐
│ PostCard Component             │
│ - Fetch from content_url       │
│ - Display with Next.js Image   │
│ - Optimize & cache             │
└────────────────────────────────┘
```

---

## API Route Architecture

```
Request from Browser
        │
        ├─ /api/youtube-search?query=...&maxResults=5
        │  └─ youtube-search/route.ts (GET)
        │     ├─ Validate query parameters
        │     ├─ Call YouTube API (server-side key)
        │     ├─ Parse response
        │     └─ Return JSON to client
        │
        └─ /api/create-payment-intent
           └─ create-payment-intent/route.ts (POST)
              ├─ Verify Supabase session
              ├─ Create Stripe PaymentIntent
              ├─ Return client secret
              └─ Client completes payment

Key: YOUTUBE_API_KEY never exposed to browser
     Lives only in .env.local and server process
```

---

## Deployment Architecture

```
Local Development:
npm run dev → localhost:3000 with hot reload

Production Build:
npm run build → Creates optimized .next/ folder
npm start → Serves production build

Deployment Options:
1. Vercel (recommended for Next.js)
   - Auto-deploys from git
   - Environment variables via dashboard
   - CDN for static files

2. Other platforms: Netlify, Railway, etc.
   - Requires Node.js runtime
   - Set environment variables
   - Configure build command: npm run build

Environment Variables Required:
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- YOUTUBE_API_KEY (server-side only)
```

---

## Performance Optimization Points

```
┌────────────────────────────────────────────┐
│ Server Components (async)                  │
│ - Data fetching at page render time        │
│ - No client JavaScript for data loading    │
│ - Pages like: page.tsx, lighter/[id]/etc   │
└────────────────────────────────────────────┘
                    │
                    │ (data)
                    ▼
┌────────────────────────────────────────────┐
│ Client Components ('use client')           │
│ - Interactivity & state management         │
│ - Event handlers, modals, forms            │
│ - Components: Header, Footer, modals       │
└────────────────────────────────────────────┘
                    │
                    │ (queries)
                    ▼
┌────────────────────────────────────────────┐
│ React Query (@tanstack/react-query)        │
│ - Caches data from Supabase                │
│ - Handles background refetching            │
│ - Optimistic updates                       │
└────────────────────────────────────────────┘
                    │
                    │ (API calls)
                    ▼
┌────────────────────────────────────────────┐
│ Supabase + PostgreSQL                      │
│ - Database queries optimized               │
│ - Connection pooling                       │
│ - Row-level security policies              │
└────────────────────────────────────────────┘
```

