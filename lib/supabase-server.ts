import { createServerClient, type CookieOptions } from '@supabase/ssr';
import type { NextRequest, NextResponse } from 'next/server';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

type TypedSupabaseClient = SupabaseClient<Database>;

/**
 * Creates a server-side Supabase client for Server Components, Server Actions, and API Routes.
 *
 * @param {ReturnType<typeof import('next/headers').cookies>} cookieStore - The Next.js cookie store.
 * @returns {TypedSupabaseClient} The typed Supabase client.
 */
export function createServerSupabaseClient(cookieStore: ReturnType<typeof import('next/headers').cookies>): TypedSupabaseClient {
  return createServerClient<Database>(
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

/**
 * Creates a server-side Supabase client specifically for Middleware.
 * This handles request/response cookie management differently than standard server components.
 *
 * @param {NextRequest} request - The incoming request.
 * @param {NextResponse} response - The outgoing response.
 * @returns {TypedSupabaseClient} The typed Supabase client.
 */
export function createServerSupabaseClientForMiddleware(
  request: NextRequest,
  response: NextResponse
): TypedSupabaseClient {
  return createServerClient<Database>(
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

export type { TypedSupabaseClient };
