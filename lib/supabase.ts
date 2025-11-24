import { createBrowserClient } from '@supabase/ssr';

/**
 * The browser-side Supabase client instance.
 * Use this in Client Components.
 */
export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
