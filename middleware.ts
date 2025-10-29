import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { type NextRequest } from 'next/server';
import { createI18nMiddleware } from 'next-international/middleware';
import { i18n } from './locales/config';

const I18nMiddleware = createI18nMiddleware({
  locales: i18n.locales,
  defaultLocale: i18n.defaultLocale,
});

export async function middleware(request: NextRequest) {
  // 1. Run the i18n middleware. This will handle locale detection and redirection/rewriting.
  const response = I18nMiddleware(request);

  // 2. Create a Supabase client that will read from the request and apply cookies to the response.
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          // The i18n middleware might have created a new response (e.g., for a redirect).
          // We need to ensure cookies are set on that response.
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: CookieOptions) {
          // Same as above for removing cookies.
          response.cookies.set({
            name,
            value: '',
            ...options,
          });
        },
      },
    }
  );

  // 3. Refresh the session. This will update the cookies on the `response` object if needed.
  await supabase.auth.getSession();

  // 4. Return the response, which now has i18n routing applied and any updated auth cookies.
  return response;
}

export const config = {
  matcher: [
    // Skip all internal paths (_next) and static files with extensions (e.g. .png, .xml, .txt)
    // Also skips 'api' routes.
    '/((?!api|_next/static|_next/image|assets|illustrations|favicon.ico|.*\\..*).*)',
  ],
};
