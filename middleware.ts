import { type NextRequest } from 'next/server';
import { createI18nMiddleware } from 'next-international/middleware';
import { i18n } from './locales/config';
import { createServerSupabaseClientForMiddleware } from '@/lib/supabase-server';

/**
 * Initializes the internationalization middleware with supported locales.
 */
const I18nMiddleware = createI18nMiddleware({
  locales: i18n.locales,
  defaultLocale: i18n.defaultLocale,
});

/**
 * The main middleware function for the Next.js application.
 *
 * Responsibilities:
 * 1.  **Internationalization**: Handles locale routing (e.g., redirecting `/` to `/en/`).
 * 2.  **Authentication**: Refreshes the Supabase session token if it's expired.
 *     This ensures that `auth.getUser()` in server components receives a valid session.
 *
 * @param {NextRequest} request - The incoming request object.
 * @returns {Promise<Response>} The modified response with updated headers/cookies.
 */
export async function middleware(request: NextRequest) {
  // 1. Handle I18n routing
  const response = I18nMiddleware(request);

  // 2. Refresh Supabase session
  // This modifies the response object in-place (setting cookies)
  const supabase = createServerSupabaseClientForMiddleware(request, response);
  await supabase.auth.getSession();

  return response;
}

/**
 * Middleware configuration object.
 *
 * `matcher` defines which paths the middleware should run on.
 * We exclude:
 * - API routes (`/api/...`)
 * - Static assets (`/_next/...`, `/assets/...`, `/illustrations/...`)
 * - Files with extensions (e.g., `favicon.ico`)
 * - Authentication callbacks (`/auth/callback`)
 */
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|assets|flags|illustrations|favicon.ico|auth/callback|.*\\..*).*)',
  ],
};
