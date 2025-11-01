# LightMyFire Web - Codebase Documentation Index

Welcome! This document serves as your entry point to understanding the LightMyFire codebase. Start here to navigate all available documentation.

---

## Quick Facts

- **Project**: LightMyFire Web - Multilingual social platform for sharing lighter stories
- **Framework**: Next.js 14.2.5 with React 18 & TypeScript 5
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS 3.4.4
- **i18n**: 4 complete languages (en, fr, de, es) + 20 partial/empty
- **Status**: Active development (v0.8.0) with documented bugs to fix
- **Path**: `/Users/utilisateur/Desktop/LMFNEW/lightmyfire-web/`

---

## Documentation Guide

### Getting Started (Read These First)

#### 1. **CODEBASE_STRUCTURE.md** (25KB)
   - **Purpose**: Complete architectural overview
   - **Contains**: 
     - Framework & tech stack details
     - Complete directory structure with explanations
     - All components, pages, and utilities listed
     - Supabase integration guide
     - Styling system documentation
     - API routes reference
     - Configuration files guide
     - Known issues & bugs
   - **Read Time**: 15-20 minutes
   - **When to Use**: Need full understanding of how code is organized

#### 2. **QUICK_REFERENCE.md** (11KB)
   - **Purpose**: Fast lookup for common tasks
   - **Contains**:
     - Simplified directory tree
     - Key files by task (styling, translations, database, etc.)
     - Common fixes checklist
     - Component usage examples (code snippets)
     - Code patterns for pages & components
     - Testing checklist before committing
   - **Read Time**: 5-10 minutes
   - **When to Use**: Need quick answer to "where is X?" or "how do I fix Y?"

#### 3. **ARCHITECTURE_DIAGRAM.md** (28KB)
   - **Purpose**: Visual flows and system relationships
   - **Contains**:
     - High-level system architecture diagram
     - Request/response flow for routing with i18n
     - Translation system data flow
     - Supabase integration flow
     - Database relationship diagrams
     - Component hierarchy tree
     - File upload flow
     - API route architecture
     - Deployment architecture
     - Performance optimization points
   - **Read Time**: 10-15 minutes
   - **When to Use**: Need to understand how systems interact or debug data flow

---

### Bug Fixes & Tasks

#### 4. **CRITICAL_BUGS.md** (5.1KB)
   - **Status**: Active blocking issues to fix
   - **Contains**:
     - Burger menu not appearing on mobile
     - Image upload foreign key constraint error
     - Investigation steps for each bug
   - **When to Use**: When fixing blocking issues

#### 5. **REMAINING_FIXES_SESSION2.md** (6.0KB)
   - **Status**: Current to-do list from last session
   - **Contains**:
     - 8 remaining tasks to complete
     - How It Works cards alignment
     - Home subtitle changes
     - Profile page trophy positioning
     - Personalization cards improvements
   - **When to Use**: When prioritizing next bug fixes

#### 6. **FEEDBACK_FIXES.md** (5.7KB)
   - **Status**: User feedback items to address
   - **Contains**: Minor UI/UX improvements from testing
   - **When to Use**: Polish phase of development

---

### Feature & Implementation Guides

#### 7. **FEATURE_REQUESTS_COMPREHENSIVE.md** (13KB)
   - **Purpose**: Planned features and enhancements
   - **Contains**: Detailed feature request specs
   - **When to Use**: Planning new functionality

#### 8. **IMPLEMENTATION_GUIDE.md** (12KB)
   - **Purpose**: Deep technical documentation
   - **Contains**: Implementation patterns and technical architecture
   - **When to Use**: Need technical guidance for complex features

#### 9. **YOUTUBE_API_SETUP.md** (5.3KB)
   - **Purpose**: YouTube integration guide
   - **Contains**: YouTube API configuration and usage
   - **When to Use**: Working with music/song posts feature

#### 10. **LOGGING_SETUP.md** (8.4KB)
   - **Purpose**: Logging infrastructure guide
   - **Contains**: How to use logging system for debugging
   - **When to Use**: Adding logging to debug issues

---

### Additional Resources

#### 11. **INDEX_PAGE_IMPROVEMENTS.md** (9.4KB)
   - Homepage specific improvements

#### 12. **README.md** (1.4KB)
   - Project overview

---

## Common Tasks & Where to Look

### "I need to fix a UI bug"
1. Start: **QUICK_REFERENCE.md** → "Bug: Styling/Layout Issues" checklist
2. Then: **ARCHITECTURE_DIAGRAM.md** → "Component Hierarchy" section
3. Then: **CODEBASE_STRUCTURE.md** → "Section 3: Components Organization"

### "I need to fix a translation issue"
1. Start: **QUICK_REFERENCE.md** → "Bug: Translation Missing/Wrong" checklist
2. Then: **CODEBASE_STRUCTURE.md** → "Section 5: Localization & Translation System"
3. Check files: `/locales/[locale].ts` files

### "I need to fix a database error"
1. Start: **QUICK_REFERENCE.md** → "Bug: API Error / Data Not Showing" checklist
2. Then: **ARCHITECTURE_DIAGRAM.md** → "Supabase Integration Flow"
3. Then: **CODEBASE_STRUCTURE.md** → "Section 6: Supabase Integration"

### "I need to add a new page"
1. Read: **ARCHITECTURE_DIAGRAM.md** → "Routing & Locale Flow"
2. Check: **CODEBASE_STRUCTURE.md** → "Section 4: Pages & Routing Structure"
3. Copy pattern from existing page in `/app/[locale]/`

### "I need to understand the data model"
1. Read: **ARCHITECTURE_DIAGRAM.md** → "Data Type Relationships"
2. Then: **CODEBASE_STRUCTURE.md** → "Section 6: Supabase Integration" (Data Types subsection)
3. Check: `/lib/types.ts` for TypeScript interfaces

### "I'm new and need to understand everything"
1. Read in order:
   - **This file** (START_HERE.md) - 5 min
   - **QUICK_REFERENCE.md** - 10 min
   - **CODEBASE_STRUCTURE.md** - 20 min
   - **ARCHITECTURE_DIAGRAM.md** - 15 min
   - **Total: 50 minutes to full comprehension**

---

## Directory Structure at a Glance

```
lightmyfire-web/
├── app/                      ← Next.js pages, components, API routes
│   ├── [locale]/            ← All pages (prefixed /en, /fr, /de, /es)
│   ├── api/                 ← Server-side API routes
│   └── components/          ← 22 reusable UI components
│
├── lib/                      ← Business logic, utilities, services
│   ├── supabase.ts          ← Supabase client config
│   ├── types.ts             ← TypeScript interfaces
│   ├── constants.ts         ← Magic strings & RPC function names
│   ├── context/             ← Toast context
│   ├── hooks/               ← Custom React hooks
│   └── services/            ← Business logic
│
├── locales/                  ← Internationalization (i18n)
│   ├── en.ts, fr.ts, de.ts, es.ts  ← Translation files
│   ├── client.ts            ← Client-side i18n
│   └── server.ts            ← Server-side i18n
│
├── public/                   ← Static assets (logos, flags, images)
├── supabase/                 ← Database migrations
├── middleware.ts             ← Next.js i18n middleware
├── tailwind.config.js        ← Tailwind CSS configuration
└── [documentation files]     ← This directory

```

---

## Quick Command Reference

```bash
# Development
npm run dev          # Start dev server (localhost:3000)
npm run build        # Build for production
npm start            # Start production server
npm run lint         # Run ESLint

# Testing
# Check all 4 languages: /en/, /fr/, /de/, /es/
# Test on mobile
# Check console for errors

# Git
git status           # See uncommitted changes
git add .            # Stage all changes
git commit -m "msg"  # Create commit
git push             # Push to remote
```

---

## Key Concepts to Understand

### 1. **Locale-First Routing**
- ALL pages are under `[locale]` parameter
- Homepage is `/en/`, `/fr/`, `/de/`, or `/es/`
- Not just `/`
- Middleware redirects to correct locale

### 2. **Server & Client Components**
- Page files use `'use client'` OR are server by default
- Server components: fetch data directly
- Client components: use hooks, handle interactivity
- Mix both for best performance

### 3. **Translations**
- 4 active languages: English, French, German, Spanish
- Use `t('key.path')` in components
- Server: `const t = await getI18n()`
- Client: `const t = useI18n()`

### 4. **Database**
- Supabase provides PostgreSQL + Auth
- Use RPC functions for complex queries
- RPC function names in `lib/constants.ts`
- Always verify session exists before using user data

### 5. **Styling**
- Tailwind CSS with custom colors
- Primary color: `#B400A3` (magenta)
- Use `sm:`, `md:`, `lg:` for responsive design
- Custom animations in `globals.css`

---

## File Locations by Function

| What | Where |
|------|-------|
| **Main homepage** | `/app/[locale]/page.tsx` |
| **Layout (header/footer)** | `/app/[locale]/layout.tsx` |
| **Components** | `/app/components/*.tsx` |
| **Styling** | `/app/globals.css` + `tailwind.config.js` |
| **Translations** | `/locales/[locale].ts` |
| **i18n setup** | `/locales/config.ts`, `server.ts`, `client.ts` |
| **Database client** | `/lib/supabase.ts` |
| **Types & constants** | `/lib/types.ts`, `/lib/constants.ts` |
| **API routes** | `/app/api/[route]/route.ts` |
| **Database migrations** | `/supabase/migrations/` |
| **Environment vars** | `.env.local` |
| **Config files** | `next.config.js`, `tsconfig.json`, `tailwind.config.js` |

---

## What's Documented

- **Complete codebase structure** ✅
- **All pages and routes** ✅
- **All 22 components** ✅
- **Styling system** ✅
- **i18n system** ✅
- **Supabase integration** ✅
- **API routes** ✅
- **Database schema** ✅
- **Known bugs** ✅
- **Fix checklists** ✅
- **Code patterns** ✅
- **Deployment info** ✅

---

## Troubleshooting

### "I can't find where X is defined"
1. Check **CODEBASE_STRUCTURE.md** section 3 (components) or section 4 (pages)
2. Use QUICK_REFERENCE.md "Key Files by Task" table
3. Search in `/app/` for `.tsx` files

### "I don't understand why something is broken"
1. Check **ARCHITECTURE_DIAGRAM.md** for the relevant flow
2. Check **CRITICAL_BUGS.md** for known issues
3. Check **REMAINING_FIXES_SESSION2.md** for ongoing work

### "I'm not sure what the next priority is"
1. Check **CRITICAL_BUGS.md** - highest priority
2. Check **REMAINING_FIXES_SESSION2.md** - second priority
3. Check **FEEDBACK_FIXES.md** - polish items

### "I want to understand a specific feature"
1. Use Ctrl+F to search across docs
2. Check **CODEBASE_STRUCTURE.md** for detailed section
3. Check **ARCHITECTURE_DIAGRAM.md** for flow diagrams

---

## Document Maintenance

These documents were generated on **November 1, 2025** by exploring the actual codebase structure.

### When updating documentation:
- Keep this START_HERE.md as the main index
- Update CODEBASE_STRUCTURE.md when adding/removing files
- Update QUICK_REFERENCE.md when common tasks change
- Keep ARCHITECTURE_DIAGRAM.md when system flows change
- Keep bug documents updated with current issues

---

## Summary

You now have comprehensive documentation covering:
1. **What** the codebase does
2. **Where** each piece of code lives
3. **How** the systems interact
4. **Why** things are organized this way
5. **What's broken** and how to fix it
6. **What's coming** in the roadmap

Use this as your reference when:
- Onboarding to the project
- Fixing bugs
- Adding features
- Debugging issues
- Understanding architecture

**Next Step**: Read QUICK_REFERENCE.md (5-10 min) or CODEBASE_STRUCTURE.md (15-20 min) depending on your needs.

