/**
 * Centralized URL construction helpers to ensure consistency across auth flows
 */

export function getBaseUrl(): string {
  const url =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXT_PUBLIC_VERCEL_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    'http://localhost:3000';

  const fullUrl = url.includes('http') ? url : `https://${url}`;

  return fullUrl.endsWith('/') ? fullUrl.slice(0, -1) : fullUrl;
}

export function getAuthCallbackUrl(locale: string): string {
  const baseUrl = getBaseUrl();
  return `${baseUrl}/${locale}/auth/callback`;
}

export function getPasswordResetUrl(locale: string): string {
  const baseUrl = getBaseUrl();
  return `${baseUrl}/${locale}/reset-password`;
}

export function getHomeUrl(locale: string, queryParams?: Record<string, string>): string {
  const baseUrl = getBaseUrl();
  let url = `${baseUrl}/${locale}`;

  if (queryParams && Object.keys(queryParams).length > 0) {
    const params = new URLSearchParams(queryParams);
    url += `?${params.toString()}`;
  }

  return url;
}
