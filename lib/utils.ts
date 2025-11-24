
/**
 * Formats a monetary amount in cents into a localized currency string.
 *
 * @param {number} amountInCents - The amount in cents (e.g., 1000 for $10.00).
 * @param {string} [currency='EUR'] - The ISO 4217 currency code.
 * @param {string} [locale='en-US'] - The IETF language tag for formatting.
 * @returns {string} The formatted currency string (e.g., "€10.00").
 */
export function formatCurrency(
  amountInCents: number,
  currency = 'EUR',
  locale = 'en-US'
): string {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
    }).format(amountInCents / 100);
  } catch (error) {
    // Fallback if Intl fails or currency code is invalid
    console.error('Currency formatting error:', error);
    return `${currency} ${(amountInCents / 100).toFixed(2)}`;
  }
}

/**
 * Formats a monetary amount in cents to a string with a fixed number of decimals.
 * Does not include the currency symbol.
 *
 * @param {number} amountInCents - The amount in cents.
 * @param {number} [decimals=2] - The number of decimal places to include.
 * @returns {string} The formatted number string (e.g., "10.00").
 */
export function formatCurrencyAmount(
  amountInCents: number,
  decimals = 2
): string {
  return (amountInCents / 100).toFixed(decimals);
}

/**
 * Retrieves the currency symbol for a given currency code.
 *
 * @param {string} [currency='EUR'] - The ISO 4217 currency code.
 * @param {string} [locale='en-US'] - The IETF language tag used for formatting determination.
 * @returns {string} The currency symbol (e.g., '€', '$') or the code itself if a symbol cannot be determined.
 */
export function getCurrencySymbol(
  currency = 'EUR',
  locale = 'en-US'
): string {
  try {
    const formatted = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(0);

    // Extract symbol by removing digits and separators
    return formatted.replace(/[\d\s,.-]/g, '').trim();
  } catch (error) {
    // Fallback symbols map for common currencies
    const symbols: Record<string, string> = {
      EUR: '€',
      USD: '$',
      GBP: '£',
      JPY: '¥',
      CNY: '¥',
      INR: '₹',
      AUD: 'A$',
      CAD: 'C$',
      CHF: 'CHF',
      SEK: 'kr',
      NOK: 'kr',
      DKK: 'kr',
      RUB: '₽',
      BRL: 'R$',
      MXN: '$',
      ZAR: 'R',
    };
    return symbols[currency] || currency;
  }
}

/**
 * Checks if the text direction for a given locale is Right-To-Left (RTL).
 *
 * @param {string} locale - The IETF language tag (e.g., 'ar', 'en').
 * @returns {boolean} `true` if the locale is typically RTL, `false` otherwise.
 */
export function isRTL(locale: string): boolean {
  const rtlLocales = ['ar', 'fa', 'ur', 'he', 'yi'];
  return rtlLocales.some(rtl => locale.toLowerCase().startsWith(rtl));
}

/**
 * Truncates a string to a specified maximum length and appends a suffix if truncated.
 *
 * @param {string} text - The input text string.
 * @param {number} maxLength - The maximum allowed length of the string.
 * @param {string} [suffix='...'] - The string to append if truncation occurs.
 * @returns {string} The truncated string.
 */
export function truncate(
  text: string,
  maxLength: number,
  suffix = '...'
): string {
  if (text.length <= maxLength) return text;
  if (maxLength < suffix.length) return text.substring(0, maxLength);
  return text.substring(0, maxLength - suffix.length) + suffix;
}

/**
 * Creates a debounced version of a function that delays its execution until after
 * a specified wait time has elapsed since the last time it was invoked.
 *
 * @template T
 * @param {T} func - The function to debounce.
 * @param {number} wait - The delay in milliseconds.
 * @returns {Function} A new function that wraps the original function with debouncing logic.
 */
// Using 'any' here is intentional as we're creating a generic wrapper for any function type
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Formats a date relative to the current time (e.g., "2 hours ago").
 *
 * @param {Date | string} date - The date object or ISO string to format.
 * @param {string} [locale='en-US'] - The IETF language tag.
 * @returns {string} The localized relative time string.
 */
export function formatRelativeTime(
  date: Date | string,
  locale = 'en-US'
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);

  try {
    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

    if (diffInSeconds < 60) return rtf.format(-diffInSeconds, 'second');
    if (diffInSeconds < 3600) return rtf.format(-Math.floor(diffInSeconds / 60), 'minute');
    if (diffInSeconds < 86400) return rtf.format(-Math.floor(diffInSeconds / 3600), 'hour');
    if (diffInSeconds < 604800) return rtf.format(-Math.floor(diffInSeconds / 86400), 'day');
    if (diffInSeconds < 2592000) return rtf.format(-Math.floor(diffInSeconds / 604800), 'week');
    if (diffInSeconds < 31536000) return rtf.format(-Math.floor(diffInSeconds / 2592000), 'month');
    return rtf.format(-Math.floor(diffInSeconds / 31536000), 'year');
  } catch (error) {
    // Fallback for environments where Intl.RelativeTimeFormat is not fully supported or fails
    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return dateObj.toLocaleDateString(locale);
  }
}

/**
 * Utility for conditionally merging class names.
 * Filters out falsy values and joins valid classes with a space.
 * Useful for combining Tailwind CSS classes dynamically.
 *
 * @param {...(string | boolean | undefined | null)[]} classes - A list of class names or conditional expressions.
 * @returns {string} A single string of space-separated class names.
 */
export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}
