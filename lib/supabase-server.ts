import { createServerClient, type CookieOptions } from '@supabase/ssr';
import type { NextRequest } from 'next/server';

/**
 * Factory function to create a server-side Supabase client
 * with proper cookie handling for Next.js applications.
 *
 * This utility prevents code duplication across server components
 * and ensures consistent cookie management throughout the app.
 *
 * Usage in Server Components:
 * ```typescript
 * import { createServerSupabaseClient } from '@/lib/supabase-server';
 * import { cookies } from 'next/headers';
 *
 * const cookieStore = cookies();
 * const supabase = createServerSupabaseClient(cookieStore);
 * ```
 *
 * Usage in Middleware:
 * ```typescript
 * import { createServerSupabaseClientForMiddleware } from '@/lib/supabase-server';
 * import type { NextRequest } from 'next/server';
 *
 * const supabase = createServerSupabaseClientForMiddleware(request, response);
 * ```
 */

// For Server Components (using Next.js cookies API)
export function createServerSupabaseClient(cookieStore: any) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set({ name, value: '', ...options });
        },
      },
    }
  );
}

// For Middleware (using NextRequest/NextResponse)
export function createServerSupabaseClientForMiddleware(
  request: NextRequest,
  response: any // NextResponse
) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: CookieOptions) {
          response.cookies.set({
            name,
            value: '',
            ...options,
          });
        },
      },
    }
  );
}
