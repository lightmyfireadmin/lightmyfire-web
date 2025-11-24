/**
 * Simple in-memory cache implementation
 *
 * For production, consider Redis or Vercel KV for distributed caching
 */

interface CacheEntry<T> {
  data: T;
  expiry: number;
}

class SimpleCache {
  private cache: Map<string, CacheEntry<unknown>> = new Map();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Cleanup expired entries every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);
  }

  /**
   * Get a value from cache
   *
   * @param {string} key - The cache key
   * @returns {T | null} The cached value or null if not found or expired
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined;

    if (!entry) {
      return null;
    }

    // Check if expired
    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  /**
   * Set a value in cache with TTL (Time To Live) in seconds
   *
   * @param {string} key - The cache key
   * @param {T} data - The data to store
   * @param {number} [ttlSeconds=300] - Time to live in seconds (default: 300)
   */
  set<T>(key: string, data: T, ttlSeconds = 300): void {
    const expiry = Date.now() + (ttlSeconds * 1000);
    this.cache.set(key, { data, expiry });
  }

  /**
   * Delete a specific key
   *
   * @param {string} key - The cache key to delete
   * @returns {boolean} True if an element in the Map object existed and has been removed, or false if the element does not exist.
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Clear all cached data
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache stats
   *
   * @returns {{ size: number; keys: string[] }} Object containing size and list of keys
   */
  stats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }

  /**
   * Cleanup expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiry) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Destroy the cache and stop cleanup interval
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.clear();
  }
}

// Global cache instance
export const cache = new SimpleCache();

/**
 * Cache decorator for async functions
 *
 * @param {string} key - The cache key
 * @param {() => Promise<T>} fetchFn - The async function to fetch data if cache miss
 * @param {number} [ttlSeconds=300] - Time to live in seconds
 * @returns {Promise<T>} The cached or fetched data
 *
 * @example
 * const getCachedData = withCache('user:123', () => fetchUserData(123), 300);
 */
export async function withCache<T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttlSeconds = 300
): Promise<T> {
  // Try to get from cache
  const cached = cache.get<T>(key);
  if (cached !== null) {
    return cached;
  }

  // Fetch fresh data
  const data = await fetchFn();

  // Store in cache
  cache.set(key, data, ttlSeconds);

  return data;
}

/**
 * Generate cache key from parameters
 *
 * @param {string} prefix - The key prefix
 * @param {...(string | number | boolean)[]} params - Additional parameters to append to the key
 * @returns {string} The generated cache key
 */
export function generateCacheKey(prefix: string, ...params: (string | number | boolean)[]): string {
  return `${prefix}:${params.join(':')}`;
}

/**
 * Cache TTL constants (in seconds)
 */
export const CacheTTL = {
  SHORT: 60,        // 1 minute
  MEDIUM: 300,      // 5 minutes
  LONG: 1800,       // 30 minutes
  HOUR: 3600,       // 1 hour
  DAY: 86400,       // 24 hours
} as const;
