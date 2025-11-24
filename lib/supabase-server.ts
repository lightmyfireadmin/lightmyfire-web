import { createServerClient, type CookieOptions } from '@supabase/ssr';
import type { NextRequest, NextResponse } from 'next/server';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

/**
 * Type alias for a strongly-typed Supabase client using the project's Database schema.
 */
type TypedSupabaseClient = SupabaseClient<Database>;

/**
 * Creates a server-side Supabase client for Server Components, Server Actions, and API Routes.
 *
 * This client is designed to work within the Next.js App Router environment where cookies
 * are accessed via the `next/headers` API. It handles reading, writing, and removing
 * cookies to manage the user's session automatically.
 *
 * @param {ReturnType<typeof import('next/headers').cookies>} cookieStore - The Next.js cookie store instance.
 * @returns {TypedSupabaseClient} The initialized and typed Supabase client.
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
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch (error) {
            // The `delete` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
}

/**
 * Creates a server-side Supabase client specifically for Middleware.
 *
 * In Next.js Middleware, request and response objects are handled differently.
 * This function allows the Supabase client to read cookies from the incoming `request`
 * and set or remove cookies on the outgoing `response`.
 *
 * @param {NextRequest} request - The incoming Next.js request object.
 * @param {NextResponse} response - The outgoing Next.js response object.
 * @returns {TypedSupabaseClient} The initialized and typed Supabase client for middleware.
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
