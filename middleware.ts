import { type NextRequest } from 'next/server';
import { createI18nMiddleware } from 'next-international/middleware';
import { i18n } from './locales/config';
import { createServerSupabaseClientForMiddleware } from '@/lib/supabase-server';

const I18nMiddleware = createI18nMiddleware({
  locales: i18n.locales,
  defaultLocale: i18n.defaultLocale,
});

export async function middleware(request: NextRequest) {
  const response = I18nMiddleware(request);
  const supabase = createServerSupabaseClientForMiddleware(request, response);

  await supabase.auth.getSession();

  return response;
}

export const config = {
  matcher: [

    '/((?!api|_next/static|_next/image|assets|flags|illustrations|favicon.ico|.*\\..*).*)',
  ],
};
