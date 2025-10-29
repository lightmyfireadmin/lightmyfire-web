import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

// i18n configuration
const locales = ['en', 'fr'];
const defaultLocale = 'en';

export async function middleware(request: NextRequest) {
  // Check if there is any supported locale in the pathname
  const pathname = request.nextUrl.pathname;
  const pathnameIsMissingLocale = locales.every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  );

  let response;

  // Redirect if there is no locale
  if (pathnameIsMissingLocale) {
    const locale = defaultLocale;
    // e.g. incoming request is /about -> /en/about
    response = NextResponse.redirect(
      new URL(`/${locale}${pathname}`, request.url)
    );
  } else {
    response = NextResponse.next();
  }

  // Now, create a Supabase client with cookie handlers that operate on the response
  const supabase = createServerClient(
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

  // This refreshes the session and potentially sets cookies on the response
  await supabase.auth.getSession();

  return response;
}

// This ensures the middleware runs on all routes
export const config = {
  matcher: [
    // Skip all internal paths (_next) and static assets.
    '/((?!api|_next/static|_next/image|assets|illustrations|favicon.ico|sw.js).*)',
  ],
};
