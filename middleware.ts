import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { type NextRequest } from 'next/server';
import { createI18nMiddleware } from 'next-international/middleware';
import { i18n } from './locales/config';

const I18nMiddleware = createI18nMiddleware({
  locales: i18n.locales,
  defaultLocale: i18n.defaultLocale,
});

export async function middleware(request: NextRequest) {
  const response = I18nMiddleware(request);
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

  await supabase.auth.getSession();

  return response;
}

export const config = {
  matcher: [

    '/((?!api|_next/static|_next/image|assets|flags|illustrations|favicon.ico|.*\\..*).*)',
  ],
};
