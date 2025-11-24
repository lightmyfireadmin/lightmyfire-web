/**
 * Centralized URL construction helpers to ensure consistency across auth flows,
 * emails, and redirects.
 */

/**
 * Retrieves the canonical base URL of the application.
 *
 * It prioritizes `NEXT_PUBLIC_SITE_URL`, then `NEXT_PUBLIC_VERCEL_URL`,
 * and falls back to `http://localhost:3000` for development.
 * It ensures the protocol (https) is present and trailing slashes are removed.
 *
 * @returns {string} The normalized base URL (e.g., "https://lightmyfire.app").
 */
export function getBaseUrl(): string {
  const url =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_VERCEL_URL ||
    'http://localhost:3000';

  const fullUrl = url.includes('http') ? url : `https://${url}`;

  return fullUrl.endsWith('/') ? fullUrl.slice(0, -1) : fullUrl;
}

/**
 * Constructs the URL for the authentication callback endpoint.
 * This is used during OAuth flows or email verification.
 *
 * @param {string} locale - The current locale code (e.g., 'en').
 * @returns {string} The complete auth callback URL.
 */
export function getAuthCallbackUrl(locale: string): string {
  const baseUrl = getBaseUrl();
  return `${baseUrl}/${locale}/auth/callback`;
}

/**
 * Constructs the URL for the password reset page.
 *
 * @param {string} locale - The current locale code.
 * @returns {string} The complete password reset URL.
 */
export function getPasswordResetUrl(locale: string): string {
  const baseUrl = getBaseUrl();
  return `${baseUrl}/${locale}/reset-password`;
}

/**
 * Constructs the URL for the home page, optionally appending query parameters.
 *
 * @param {string} locale - The current locale code.
 * @param {Record<string, string>} [queryParams] - Key-value pairs of query parameters to append.
 * @returns {string} The constructed home URL.
 */
export function getHomeUrl(locale: string, queryParams?: Record<string, string>): string {
  const baseUrl = getBaseUrl();
  let url = `${baseUrl}/${locale}`;

  if (queryParams && Object.keys(queryParams).length > 0) {
    const params = new URLSearchParams(queryParams);
    url += `?${params.toString()}`;
  }

  return url;
}
