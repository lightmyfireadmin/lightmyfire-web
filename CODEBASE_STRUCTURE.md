# LightMyFire Web - Comprehensive Codebase Overview
**Last Updated**: November 1, 2025  
**Project Version**: 0.8.0

---

## Executive Summary

LightMyFire is a Next.js 14 web application built with React 18, TypeScript, and Tailwind CSS. It's a multilingual social platform for sharing lighter stories with internationalization support (English, French, German, Spanish, and more). The app uses Supabase as its backend database and authentication system, with server-side and client-side components working together through Next.js App Router and middleware.

---

## 1. Framework & Technology Stack

### Core Framework
- **Framework**: Next.js 14.2.5 (App Router with dynamic routes)
- **Language**: TypeScript 5
- **Runtime**: Node.js with React 18
- **Bundler**: SWC (Next.js native bundler)

### UI & Styling
- **UI Library**: React 18
- **Styling**: Tailwind CSS 3.4.4
- **Component Library**: Headless UI (@headlessui/react 2.1.2)
- **Icons**: Heroicons (@heroicons/react 2.2.0)
- **Additional UI**: React Icons (5.5.0)

### Backend & Database
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth (@supabase/auth-ui-react, @supabase/ssr)
- **Client**: @supabase/supabase-js (2.44.4)

### State Management & Queries
- **Data Fetching**: TanStack React Query (5.90.5)

### Internationalization (i18n)
- **Library**: next-international (1.3.1)
- **Locale Matching**: @formatjs/intl-localematcher (0.6.2)
- **Language Negotiation**: negotiator (1.0.0)

### Map & Geolocation
- **Mapping**: Leaflet (1.9.4) + React Leaflet (4.2.1)
- **Map Feature**: Location posts with geolocation support

### File Processing & Utilities
- **PDF Generation**: pdf-lib (1.17.1)
- **QR Code**: qrcode (1.5.4)
- **Typography**: @tailwindcss/typography (0.5.19)

### Fonts
- **Nunito Sans**: Regular, Semibold, Bold (Body text)
- **Poppins**: Bold (Display/Headings)
- **Font Source**: Google Fonts API

---

## 2. Main Directory Structure

```
/Users/utilisateur/Desktop/LMFNEW/lightmyfire-web/
├── app/                                 # Next.js App Router
│   ├── [locale]/                        # Dynamic locale parameter
│   │   ├── (pages)
│   │   ├── auth/
│   │   ├── lighter/[id]/                # Lighter detail page + dynamic routes
│   │   ├── save-lighter/                # Save lighter flow
│   │   ├── find/                        # Find lighter by PIN
│   │   ├── login/                       # Authentication
│   │   ├── my-profile/                  # User profile
│   │   ├── about/                       # About page
│   │   ├── legal/                       # Legal pages (FAQ, Privacy, Terms)
│   │   ├── dont-throw-me-away/          # Refill guide
│   │   ├── moderation/                  # Moderation dashboard
│   │   ├── layout.tsx                   # Locale layout with Header/Footer/ToastWrapper
│   │   └── page.tsx                     # Homepage
│   ├── api/                             # API Routes (Next.js API)
│   │   ├── create-payment-intent/       # Stripe payment endpoint
│   │   └── youtube-search/              # YouTube API proxy
│   ├── components/                      # Shared UI Components
│   │   ├── Header.tsx                   # Navigation header with mobile menu
│   │   ├── Footer.tsx                   # Footer
│   │   ├── PostCard.tsx                 # Post display component
│   │   ├── LikeButton.tsx               # Like toggle
│   │   ├── PinEntryForm.tsx             # PIN search form
│   │   ├── LanguageSwitcher.tsx         # Language selection
│   │   ├── LoadingSpinner.tsx           # Loading state
│   │   ├── Toast.tsx / ToastWrapper.tsx # Notifications
│   │   ├── ConfirmModal.tsx             # Confirmation dialogs
│   │   ├── LocationSearch.tsx           # Location picker
│   │   ├── RandomPostFeed.tsx           # Post feed component
│   │   └── ... (22 total components)
│   └── globals.css                      # Global Tailwind styles
│
├── lib/                                 # Business logic & utilities
│   ├── supabase.ts                      # Supabase client initialization
│   ├── types.ts                         # TypeScript type definitions
│   ├── constants.ts                     # Magic strings & configuration
│   ├── countries.ts                     # Country list data
│   ├── countryToFlag.ts                 # Country flag emoji mapping
│   ├── fileValidation.ts                # File upload validators
│   ├── generateSticker.ts               # QR sticker generation
│   ├── download.ts                      # File download utilities
│   ├── env.ts                           # Environment variable access
│   ├── context/
│   │   └── ToastContext.tsx             # Toast notification context
│   ├── hooks/
│   │   ├── useFocusTrap.ts              # Accessibility hook for modals
│   │   └── useLogger.ts                 # Logging hook
│   └── services/
│       └── logger.ts                    # Logger service
│
├── locales/                             # Internationalization (i18n)
│   ├── config.ts                        # i18n configuration (locales: en, fr, de, es)
│   ├── client.ts                        # Client-side i18n functions
│   ├── server.ts                        # Server-side i18n functions
│   ├── en.ts                            # English translations
│   ├── fr.ts                            # French translations
│   ├── de.ts                            # German translations
│   ├── es.ts                            # Spanish translations
│   ├── hi.ts                            # Hindi translations (partial)
│   └── [ar.ts, pt.ts, ru.ts, ...]      # Other languages (empty or partial)
│
├── public/                              # Static assets
│   ├── LOGOLONG.png                     # Main logo
│   ├── LOGOSMALL.png                    # Logo small version
│   ├── bgtile.png                       # Background tile pattern
│   ├── illustrations/                   # SVG & PNG illustrations
│   │   ├── personalise.png
│   │   ├── around_the_world.png
│   │   ├── telling_stories.png
│   │   ├── CTA_rainbow_arrow.png
│   │   ├── thumbs_up.png
│   │   └── ... (21 total illustration files)
│   ├── flags/                           # Flag emoji SVGs (256 country flags)
│   └── [other assets]
│
├── supabase/                            # Supabase configuration
│   └── migrations/                      # Database migrations
│
├── middleware.ts                        # Next.js middleware for i18n + auth
├── next.config.js                       # Next.js configuration
├── tailwind.config.js                   # Tailwind CSS configuration
├── tsconfig.json                        # TypeScript configuration
├── postcss.config.js                    # PostCSS configuration
├── .env.local                           # Environment variables (local)
├── .env.example                         # Environment variable template
├── package.json                         # Dependencies & scripts
├── package-lock.json                    # Lock file
│
└── [Documentation Files]
    ├── CRITICAL_BUGS.md                 # Known critical issues
    ├── REMAINING_FIXES_SESSION2.md      # In-progress fixes
    ├── FEATURE_REQUESTS_COMPREHENSIVE.md # Planned features
    ├── IMPLEMENTATION_GUIDE.md          # Technical documentation
    ├── README.md                        # Project README
    └── ... (other docs)
```

---

## 3. Components Organization

### Location: `/app/components/`

**22 Reusable Components**:

| Component | Purpose | Type |
|-----------|---------|------|
| **Header.tsx** | Navigation with mobile menu (z-50 Dialog) | Layout |
| **Footer.tsx** | Footer with language support | Layout |
| **PostCard.tsx** | Single post display with media | Display |
| **PinEntryForm.tsx** | 6-char PIN input for finding lighters | Form |
| **LikeButton.tsx** | Like/unlike toggle button | Interactive |
| **LanguageSwitcher.tsx** | Language selection dropdown | Interactive |
| **RandomPostFeed.tsx** | Auto-loading post feed | Container |
| **LocationSearch.tsx** | Map-based location picker | Form |
| **LoadingSpinner.tsx** | Loading state indicator | Feedback |
| **Toast.tsx** / **ToastWrapper.tsx** | Notification system | Feedback |
| **ConfirmModal.tsx** | Confirmation dialogs | Modal |
| **InfoPopup.tsx** | Info tooltip with icon | Feedback |
| **LogoutButton.tsx** | User logout action | Interactive |
| **ModeratorBadge.tsx** | Moderator indicator | Display |
| **FlagButton.tsx** | Country flag selector | Interactive |
| **CookieConsent.tsx** | Cookie consent banner | Layout |
| **FormattedDate.tsx** | Localized date formatter | Display |
| **IconButton.tsx** | Reusable icon button | Interactive |
| **EmptyState.tsx** | Empty content placeholder | Display |
| **SuccessNotification.tsx** | Success message display | Feedback |
| **SetHtmlLang.tsx** | HTML lang attribute setter | Utility |
| **EmptyLighterPosts.tsx** | Empty posts placeholder | Display |

---

## 4. Pages & Routing Structure

### Dynamic Routing with `[locale]` Parameter
All pages are prefixed with locale: `/en/`, `/fr/`, `/de/`, `/es/`

| Route | File | Purpose |
|-------|------|---------|
| **/** | `app/[locale]/page.tsx` | Homepage with hero, how-it-works, feed |
| **/login** | `app/[locale]/login/page.tsx` | Authentication page |
| **/find** | `app/[locale]/find/page.tsx` | Find lighter by PIN |
| **/save-lighter** | `app/[locale]/save-lighter/page.tsx` | Save new lighter flow |
| **/lighter/[id]** | `app/[locale]/lighter/[id]/page.tsx` | Lighter detail page |
| **/lighter/[id]/add** | `app/[locale]/lighter/[id]/add/page.tsx` | Add post to lighter |
| **/my-profile** | `app/[locale]/my-profile/page.tsx` | User profile page |
| **/about** | `app/[locale]/about/page.tsx` | About page |
| **/legal/faq** | `app/[locale]/legal/faq/page.tsx` | FAQ |
| **/legal/privacy** | `app/[locale]/legal/privacy/page.tsx` | Privacy policy |
| **/legal/terms** | `app/[locale]/legal/terms/page.tsx` | Terms of service |
| **/dont-throw-me-away** | `app/[locale]/dont-throw-me-away/page.tsx` | Refill guide |
| **/moderation** | `app/[locale]/moderation/page.tsx` | Moderation dashboard |
| **/auth/callback** | `app/api/[locale]/auth/callback/route.ts` | OAuth callback |

---

## 5. Localization & Translation System

### Configuration
- **File**: `/locales/config.ts`
- **Default Locale**: `en` (English)
- **Supported Locales**: `en`, `fr`, `de`, `es`
- **Library**: next-international 1.3.1

### Translation Files (all in `/locales/`)
```
├── en.ts       ✅ Complete (English)
├── fr.ts       ✅ Complete (French)
├── de.ts       ✅ Complete (German)
├── es.ts       ✅ Complete (Spanish)
├── hi.ts       ⚠️ Partial (Hindi)
├── ar.ts       ❌ Empty (Arabic)
├── pt.ts       ❌ Empty (Portuguese)
├── ru.ts       ❌ Empty (Russian)
└── [11 more]   ❌ Empty
```

### How i18n Works
1. **Middleware** (`middleware.ts`): Detects locale from URL, sets cookie
2. **Server Functions**: `getI18n()`, `getCurrentLocale()` in `locales/server.ts`
3. **Client Functions**: `useI18n()`, `useCurrentLocale()` in `locales/client.ts`
4. **Usage**: `const t = await getI18n()` → `t('key.path')`

### Translation Keys Structure
```typescript
// From en.ts - typical structure
{
  home: {
    hero: {
      title: "Give lighters a second life",
      subtitle: "...",
      cta: "Save a lighter"
    },
    how_it_works: {
      step1: { title: "...", description: "..." },
      step2: { ... },
      step3: { ... }
    }
  },
  nav: { ... },
  // ... more sections
}
```

---

## 6. Supabase Integration & Database Logic

### Configuration
- **File**: `/lib/supabase.ts`
- **Type**: Client-side browser client (using `createBrowserClient`)
- **Auth**: Cookie-based session management

### Server-Side Supabase Client
- **Location**: Middleware (`middleware.ts`) and Layouts/Pages
- **Type**: `createServerClient` from `@supabase/ssr`
- **Cookie Handling**: Custom cookie getter/setter for Next.js cookies()

### RPC Functions (Stored Procedures)
Defined in `/lib/constants.ts`:
```typescript
RPC_FUNCTIONS = {
  GET_LIGHTER_ID_FROM_PIN,      // Find lighter by PIN
  CREATE_NEW_LIGHTER,           // Create new lighter
  CREATE_NEW_POST,              // Create post for lighter
  TOGGLE_LIKE,                  // Like/unlike post
  FLAG_POST,                    // Flag inappropriate content
}
```

### Storage Buckets
```typescript
SUPABASE_STORAGE_BUCKETS = {
  POST_IMAGES: 'post-images'   // Images for posts
}
```

### Database Migrations
- **Location**: `/supabase/migrations/`
- Handles: Users, Lighters, Posts, Likes, Flags, Trophies tables

### Data Types (from `/lib/types.ts`)
```typescript
DetailedPost {
  id, lighter_id, user_id, created_at, post_type,
  title, content_text, content_url,
  location_name, location_lat, location_lng,
  is_find_location, is_creation, is_anonymous, is_pinned,
  username, like_count, user_has_liked, nationality,
  show_nationality, is_public, is_flagged, flagged_count
}

MyPostWithLighter {
  id, title, post_type, created_at, lighter_id,
  lighters: { name }
}

Trophy {
  id, name, description, icon_name
}
```

---

## 7. Styling System

### Tailwind CSS Configuration
- **File**: `/tailwind.config.js`
- **Version**: 3.4.4
- **Content Paths**: `./app/**/*.{js,ts,jsx,tsx,mdx}`

### Custom Color Palette
```javascript
colors: {
  background: '#F8F8F4',           // Off-white
  foreground: '#2C2C2C',           // Dark text
  muted: '#EAEAEA',               // Light gray
  'muted-foreground': '#5C5C5C',   // Medium gray
  primary: '#B400A3',             // Magenta (main brand)
  'primary-foreground': '#FFFFFF', // White on magenta
  secondary: '#D7F2D4',           // Light green
  'secondary-foreground': '#1E4620', // Dark green
  accent: '#FFD700',              // Gold
  'accent-foreground': '#2C2C2C',  // Dark on gold
  border: '#D1D1D1',              // Border gray
  input: '#D1D1D1',               // Input border
  'post-text': '#3B82F6',         // Blue (for text posts)
  'post-image': '#22C55E',        // Green (for image posts)
  'post-location': '#EAB308',     // Yellow (for location posts)
  'post-song': '#EF4444',         // Red (for song posts)
  'post-refuel': '#F97316',       // Orange (for refuel posts)
  error: '#EF4444',               // Red
}
```

### Custom Fonts
```javascript
fontFamily: {
  sans: ['var(--font-nunito-sans)', ...defaultTheme.fontFamily.sans],
  display: ['var(--font-poppins)', ...defaultTheme.fontFamily.sans],
}
```

### Custom Animations
```javascript
keyframes: {
  fadeInOut: { '0%': { opacity: '0' }, '5%': { opacity: '1' }, ... },
  scrollBackground: { from: { background-position: '100% 100%' }, ... },
}

animation: {
  'fade-in-out': 'fadeInOut 4s ease-in-out infinite',
}
```

### Global Styles
- **File**: `/app/globals.css`
- **Includes**:
  - Font imports (Nunito Sans, Poppins)
  - Tailwind directives (@tailwind base/components/utilities)
  - Custom scrollbar styling
  - Button component styles (.btn-primary, .btn-secondary)
  - Animation definitions
  - Background pattern application

### Key CSS Classes
```css
.btn-primary      /* Magenta button with hover effects */
.btn-secondary    /* Outlined button */
.animate-fade-in-out    /* Post card fade animation */
.animate-spin-slow      /* Slow spinner animation */
.animate-slide-in       /* Toast slide-in animation */
```

---

## 8. API Routes (Next.js API Handler)

### Location: `/app/api/`

#### 1. **POST /api/create-payment-intent**
- **File**: `app/api/create-payment-intent/route.ts`
- **Purpose**: Create Stripe payment intents
- **Method**: POST
- **Authentication**: Server-side Supabase session
- **Payload**: Amount, currency, description
- **Response**: Payment intent details

#### 2. **GET /api/youtube-search**
- **File**: `app/api/youtube-search/route.ts`
- **Purpose**: Search YouTube videos (proxy)
- **Method**: GET
- **Query Params**: `query`, `maxResults`
- **Auth**: Uses server-side YouTube API key
- **Response**: Video list with thumbnails, titles, URLs
- **Security**: API key hidden from client (server-only)

### Environment Variables for APIs
```
NEXT_PUBLIC_SUPABASE_URL       # Public Supabase URL
NEXT_PUBLIC_SUPABASE_ANON_KEY # Public Supabase anon key
YOUTUBE_API_KEY               # Server-side only (NOT public)
```

---

## 9. Middleware & Authentication

### Middleware Configuration
- **File**: `/middleware.ts`
- **Purpose**: 
  1. Handle i18n routing (locale detection)
  2. Manage Supabase auth sessions
  3. Cookie synchronization
  4. Protected route handling

### How It Works
```typescript
1. I18nMiddleware processes locale detection
2. Supabase server client is created
3. Session is refreshed via getSession()
4. Response with updated cookies is returned
```

### Route Matcher
```typescript
matcher: [
  '/((?!api|_next/static|_next/image|assets|flags|illustrations|favicon.ico|.*\\..*).*)'
]
// Matches all routes except static files, API routes, images
```

---

## 10. Configuration Files

### Next.js Config
- **File**: `/next.config.js`
- **Settings**: Exposes NEXT_PUBLIC_VERCEL_URL env variable
- **i18n Note**: Disabled in config (handled by middleware)

### TypeScript Config
- **File**: `/tsconfig.json`
- **Target**: ES2017
- **Strict Mode**: Enabled
- **Path Alias**: `@/*` → Root directory
- **JSX Mode**: preserve (Next.js compatible)

### PostCSS Config
- **File**: `/postcss.config.js`
- **Plugins**: autoprefixer (for CSS compatibility)

### ESLint Config
- **File**: `.eslintrc.json`
- **Extends**: Next.js recommended config

---

## 11. File Upload & Validation

### Configuration (from `/lib/constants.ts`)
```typescript
FILE_UPLOAD = {
  MAX_SIZE_MB: 2,
  MAX_SIZE_BYTES: 2 * 1024 * 1024,
  ACCEPTED_TYPES: ['image/png', 'image/jpeg', 'image/gif'],
  ACCEPTED_EXTENSIONS: ['.png', '.jpg', '.jpeg', '.gif'],
}
```

### Validation Module
- **File**: `/lib/fileValidation.ts`
- **Validates**: File type, size, extension
- **Error Messages**: Localized feedback

### Storage Integration
- **Bucket**: `post-images` in Supabase Storage
- **Access**: Public URLs after upload
- **Used By**: AddPostForm, PostCard

---

## 12. Utilities & Services

### Available Utilities
- **`lib/download.ts`**: File download helper
- **`lib/generateSticker.ts`**: QR code + lighter sticker generation
- **`lib/countryToFlag.ts`**: Maps country codes to flag emojis
- **`lib/countries.ts`**: Complete country list
- **`lib/env.ts`**: Environment variable access utilities
- **`lib/hooks/useFocusTrap.ts`**: Accessibility hook for modals
- **`lib/hooks/useLogger.ts`**: Client-side logging

### Logger Service
- **File**: `/lib/services/logger.ts`
- **Purpose**: Centralized logging for debugging

### Toast Context
- **File**: `/lib/context/ToastContext.tsx`
- **Purpose**: Global notification management
- **Usage**: Show success, error, warning toasts

---

## 13. Environment Variables

### Local Configuration
- **File**: `/lightmyfire-web/.env.local`
- **Template**: `/lightmyfire-web/.env.example`

### Required Variables
```env
# Supabase (Public - can be exposed)
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...

# YouTube API (Server-side only - NOT public)
YOUTUBE_API_KEY=...

# Optional: Vercel deployment
NEXT_PUBLIC_VERCEL_URL=...
```

### Security Notes
- Variables with `NEXT_PUBLIC_` prefix are exposed to browser
- `YOUTUBE_API_KEY` must NOT have `NEXT_PUBLIC_` prefix
- API routes use server-side only keys

---

## 14. Post Type System

From `/lib/constants.ts`:
```typescript
POST_TYPES = {
  TEXT: 'text',           // Text story
  SONG: 'song',           // Music/song link
  IMAGE: 'image',         // Photo upload
  LOCATION: 'location',   // GPS coordinates
  REFUEL: 'refuel',       // Lighter refill info
}
```

### Post Type Colors (in Tailwind)
- **Text**: Blue (#3B82F6)
- **Image**: Green (#22C55E)
- **Location**: Yellow (#EAB308)
- **Song**: Red (#EF4444)
- **Refuel**: Orange (#F97316)

---

## 15. PIN System

From `/lib/constants.ts`:
```typescript
PIN_CONFIG = {
  PATTERN: /[^a-zA-Z0-9]/g,
  MAX_LENGTH: 6,
  DISPLAY_FORMAT_MAX_LENGTH: 7,  // "ABC-123"
  HYPHEN_POSITION: 3,
}
```

### PIN Format
- **Input**: 6 alphanumeric characters
- **Display**: "ABC-123" (hyphen after 3rd char)
- **Validation**: Must be >= 3 chars to search (as of REMAINING_FIXES_SESSION2.md)

---

## 16. Known Issues & Bugs

### Critical Issues (from CRITICAL_BUGS.md)
1. **Burger Menu Not Appearing on Mobile** - Dialog not rendering
2. **Image Upload Foreign Key Constraint** - user_id not passed to RPC

### Recent Fixes (from REMAINING_FIXES_SESSION2.md)
- PIN Hyphen Bug (>3 → >=3)
- Mobile Burger Menu Z-index
- Find Button Emoji (🔓 → 🔍)
- Header/Footer width constraints
- Question mark helper positioning

### Remaining Tasks (8 items)
1. How It Works cards alignment
2. Home subtitle InfoPopup removal
3. "I'm too young to die" title size
4. Duplicate "Become a Lightsaver" section
5. Save Lighter personalization cards
6. My Profile trophy positioning
7. Language dropdown styling
8. Mobile responsiveness tweaks

---

## 17. Project Statistics

### Code Metrics
- **React Components**: 22 reusable + multiple page components
- **TypeScript Files**: 40+ .ts/.tsx files
- **Translation Keys**: 100+ keys per language
- **Pages**: 13 main pages
- **API Endpoints**: 2 custom routes
- **Supported Languages**: 4 complete (en, fr, de, es) + 20 partial/empty

### Assets
- **Images**: 250+ flag SVGs + 21 illustration files
- **Icons**: Heroicons (2.2.0) + React Icons (5.5.0)
- **Fonts**: 2 web fonts (Nunito Sans, Poppins)

### Dependencies
- **Total**: 50+ npm packages
- **Size**: ~382MB node_modules (with dependencies)

---

## 18. Development Workflow

### Scripts (from package.json)
```bash
npm run dev      # Start dev server (localhost:3000)
npm run build    # Build for production
npm start        # Start production server
npm run lint     # Run ESLint
```

### Git Repository
- **Status**: Active git repo (`.git/` directory present)
- **Last Updated**: Nov 1, 2025

### Documentation Files
- `CRITICAL_BUGS.md` - Current blocking issues
- `REMAINING_FIXES_SESSION2.md` - In-progress tasks
- `FEATURE_REQUESTS_COMPREHENSIVE.md` - Planned features
- `IMPLEMENTATION_GUIDE.md` - Technical architecture
- `YOUTUBE_API_SETUP.md` - YouTube integration
- `LOGGING_SETUP.md` - Logging configuration

---

## 19. Performance & Optimization

### Features
- **Server Components**: Heavy use of async server components for data fetching
- **Dynamic Rendering**: `export const dynamic = 'force-dynamic'` on pages with real-time data
- **Image Optimization**: Next.js Image component for static/optimized images
- **Suspense Boundaries**: Used for streaming content
- **CSS Optimization**: Tailwind CSS purging unused styles

### Caching Strategy
- Supabase queries cache through React Query
- Static assets cached in `public/` directory

---

## 20. Accessibility Features

### Built-in A11y
- **Focus Trap**: Custom hook for modal focus management
- **ARIA Labels**: Used throughout components
- **Semantic HTML**: Proper heading hierarchy
- **Color Contrast**: Tailored color palette for accessibility
- **Keyboard Navigation**: Dialog and menu navigation support

---

## How to Plan Fixes

### For UI Bugs:
1. Check `/app/components/` for component location
2. Check `/app/globals.css` and `tailwind.config.js` for styling
3. Check `/app/[locale]/` page files for page-specific issues
4. Test responsiveness with breakpoints: sm, md, lg

### For Translation Issues:
1. Check `/locales/[locale].ts` for missing/incorrect strings
2. Use `getI18n()` on server or `useI18n()` on client
3. Ensure all translation keys exist in all active languages

### For Database Issues:
1. Check Supabase RPC functions calls in components
2. Verify data types in `/lib/types.ts`
3. Check `/lib/supabase.ts` for client initialization
4. Review middleware.ts for auth session handling

### For Functionality Bugs:
1. Check API routes in `/app/api/`
2. Check hooks in `/lib/hooks/`
3. Check services in `/lib/services/`
4. Review RPC function calls in constants.ts

---

## Quick File Location Reference

| Purpose | File Location |
|---------|--------------|
| Fix UI Layout | `/app/[locale]/page.tsx` or `/app/components/` |
| Fix Styling | `/app/globals.css` or `tailwind.config.js` |
| Fix i18n | `/locales/[locale].ts` |
| Fix Database | `/lib/supabase.ts` or component RPC calls |
| Fix API | `/app/api/[route]/route.ts` |
| Fix Auth | `middleware.ts` or `/app/[locale]/login/` |
| Add Component | Create in `/app/components/` |
| Add Utility | Create in `/lib/` |
| Fix Responsive | Check Tailwind breakpoint classes |

