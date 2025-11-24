import { createBrowserClient } from '@supabase/ssr';
import { Database } from '@/types/database';

/**
 * Creates and exports a browser-side Supabase client instance.
 *
 * This client is designed for use in Client Components. It automatically handles
 * session persistence and cookie management in the browser. It is typed with
 * the project's Database schema for better type safety.
 *
 * @type {import('@supabase/supabase-js').SupabaseClient<Database>}
 */
export const supabase = createBrowserClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
