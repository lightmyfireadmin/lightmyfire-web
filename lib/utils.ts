
/**
 * Formats an amount in cents to a localized currency string.
 *
 * @param {number} amountInCents - The amount in cents.
 * @param {string} [currency='EUR'] - The currency code (ISO 4217).
 * @param {string} [locale='en-US'] - The locale string.
 * @returns {string} The formatted currency string.
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
    // Fallback if Intl fails
    console.error('Currency formatting error:', error);
    return `${currency} ${(amountInCents / 100).toFixed(2)}`;
  }
}

/**
 * Formats an amount in cents to a string with fixed decimals (no currency symbol).
 *
 * @param {number} amountInCents - The amount in cents.
 * @param {number} [decimals=2] - Number of decimal places.
 * @returns {string} The formatted number string.
 */
export function formatCurrencyAmount(
  amountInCents: number,
  decimals = 2
): string {
  return (amountInCents / 100).toFixed(decimals);
}

/**
 * Gets the symbol for a given currency code.
 *
 * @param {string} [currency='EUR'] - The currency code.
 * @param {string} [locale='en-US'] - The locale string.
 * @returns {string} The currency symbol (e.g., '€', '$').
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
    // Fallback symbols
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
 * Checks if a locale is Right-To-Left (RTL).
 *
 * @param {string} locale - The locale code.
 * @returns {boolean} True if RTL, false otherwise.
 */
export function isRTL(locale: string): boolean {
  const rtlLocales = ['ar', 'fa', 'ur', 'he', 'yi'];
  return rtlLocales.some(rtl => locale.toLowerCase().startsWith(rtl));
}

/**
 * Truncates a string to a maximum length, adding a suffix if truncated.
 *
 * @param {string} text - The text to truncate.
 * @param {number} maxLength - The maximum length.
 * @param {string} [suffix='...'] - The suffix to add.
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
 * Debounces a function execution.
 *
 * @template T
 * @param {T} func - The function to debounce.
 * @param {number} wait - The wait time in milliseconds.
 * @returns {Function} The debounced function.
 */
// Using 'any' here is intentional as we're creating a generic wrapper for any function
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
 * Formats a date relative to now (e.g., "2 hours ago").
 *
 * @param {Date | string} date - The date to format.
 * @param {string} [locale='en-US'] - The locale string.
 * @returns {string} The relative time string.
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
    // Fallback for environments without Intl.RelativeTimeFormat
    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return dateObj.toLocaleDateString(locale);
  }
}

/**
 * Utility for merging Tailwind CSS classes.
 *
 * @param {...(string | boolean | undefined | null)[]} classes - Class names to merge.
 * @returns {string} The merged class string.
 */
export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}
