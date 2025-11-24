/**
 * Centralized URL construction helpers to ensure consistency across auth flows
 */

/**
 * Gets the base URL of the application.
 * Falls back to localhost in development if env vars are missing.
 *
 * @returns {string} The base URL (e.g., https://lightmyfire.app).
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
 * Gets the authentication callback URL.
 *
 * @param {string} locale - The current locale.
 * @returns {string} The auth callback URL.
 */
export function getAuthCallbackUrl(locale: string): string {
  const baseUrl = getBaseUrl();
  return `${baseUrl}/${locale}/auth/callback`;
}

/**
 * Gets the password reset URL.
 *
 * @param {string} locale - The current locale.
 * @returns {string} The password reset URL.
 */
export function getPasswordResetUrl(locale: string): string {
  const baseUrl = getBaseUrl();
  return `${baseUrl}/${locale}/reset-password`;
}

/**
 * Gets the home URL, optionally with query parameters.
 *
 * @param {string} locale - The current locale.
 * @param {Record<string, string>} [queryParams] - Optional query parameters.
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
