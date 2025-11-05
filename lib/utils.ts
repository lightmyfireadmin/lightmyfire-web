/**
 * Utility Functions
 * Centralized location for common utility functions
 */

/**
 * Format currency amount with proper locale and currency
 * @param amountInCents - Amount in cents (e.g., 720 for €7.20)
 * @param currency - Currency code (ISO 4217)
 * @param locale - Locale code for formatting
 * @returns Formatted currency string
 */
export function formatCurrency(
  amountInCents: number,
  currency: string = 'EUR',
  locale: string = 'en-US'
): string {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
    }).format(amountInCents / 100);
  } catch (error) {
    // Fallback if locale or currency is invalid
    console.error('Currency formatting error:', error);
    return `${currency} ${(amountInCents / 100).toFixed(2)}`;
  }
}

/**
 * Format currency for display (cents to major unit)
 * @param amountInCents - Amount in cents
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted number string
 */
export function formatCurrencyAmount(
  amountInCents: number,
  decimals: number = 2
): string {
  return (amountInCents / 100).toFixed(decimals);
}

/**
 * Get currency symbol for a given currency code
 * @param currency - Currency code (ISO 4217)
 * @param locale - Locale for symbol format
 * @returns Currency symbol
 */
export function getCurrencySymbol(
  currency: string = 'EUR',
  locale: string = 'en-US'
): string {
  try {
    const formatted = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(0);

    // Extract symbol (remove numbers and spaces)
    return formatted.replace(/[\d\s,.-]/g, '').trim();
  } catch (error) {
    // Fallback currency symbols
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
 * Check if a locale uses RTL (right-to-left) text direction
 * @param locale - Locale code
 * @returns True if RTL, false if LTR
 */
export function isRTL(locale: string): boolean {
  const rtlLocales = ['ar', 'fa', 'ur', 'he', 'yi'];
  return rtlLocales.some(rtl => locale.toLowerCase().startsWith(rtl));
}

/**
 * Truncate text to a maximum length
 * @param text - Text to truncate
 * @param maxLength - Maximum length
 * @param suffix - Suffix to add when truncated (default: '...')
 * @returns Truncated text
 */
export function truncate(
  text: string,
  maxLength: number,
  suffix: string = '...'
): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - suffix.length) + suffix;
}

/**
 * Debounce function to limit execution rate
 * @param func - Function to debounce
 * @param wait - Wait time in milliseconds
 * @returns Debounced function
 */
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
 * Format relative time (e.g., "2 hours ago")
 * @param date - Date to format
 * @param locale - Locale for formatting
 * @returns Relative time string
 */
export function formatRelativeTime(
  date: Date | string,
  locale: string = 'en-US'
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
    // Fallback for unsupported locales
    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return dateObj.toLocaleDateString(locale);
  }
}

/**
 * Class name utility for conditional classes
 * @param classes - Class names or conditional objects
 * @returns Combined class string
 */
export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}
