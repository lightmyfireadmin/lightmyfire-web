import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';
import type { CookieOptions } from '@supabase/ssr';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest, { params }: { params: { lang: string } }) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const lang = params.lang;

  if (code) {
    const cookieStore = cookies();

    const supabase = createServerClient(
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
    await supabase.auth.exchangeCodeForSession(code);
  }

  // URL to redirect to after sign in, now with locale
  return NextResponse.redirect(`${requestUrl.origin}/${lang}`);
}
