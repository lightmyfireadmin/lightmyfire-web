/**
 * Simple in-memory cache implementation
 *
 * This provides a basic caching mechanism.
 * For production environments, especially those that are distributed or serverless,
 * consider using a more robust solution like Redis or Vercel KV.
 */

/**
 * Represents a single entry in the cache.
 *
 * @template T - The type of the data stored.
 */
interface CacheEntry<T> {
  /** The cached data. */
  data: T;
  /** The timestamp (in milliseconds) when this entry expires. */
  expiry: number;
}

/**
 * A simple in-memory cache class with automatic cleanup.
 */
class SimpleCache {
  /** The internal map storing cache entries. */
  private cache: Map<string, CacheEntry<unknown>> = new Map();
  /** The interval identifier for the cleanup process. */
  private cleanupInterval: NodeJS.Timeout | null = null;

  /**
   * Creates an instance of SimpleCache.
   * Starts a cleanup interval to remove expired entries every 5 minutes.
   */
  constructor() {
    // Cleanup expired entries every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);
  }

  /**
   * Retrieves a value from the cache.
   *
   * @template T - The expected type of the cached value.
   * @param {string} key - The unique identifier for the cache entry.
   * @returns {T | null} The cached value if found and valid; otherwise, null.
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
   * Stores a value in the cache with a specified Time To Live (TTL).
   *
   * @template T - The type of the data to store.
   * @param {string} key - The unique identifier for the cache entry.
   * @param {T} data - The data to store.
   * @param {number} [ttlSeconds=300] - The lifespan of the cache entry in seconds (default: 300).
   */
  set<T>(key: string, data: T, ttlSeconds = 300): void {
    const expiry = Date.now() + (ttlSeconds * 1000);
    this.cache.set(key, { data, expiry });
  }

  /**
   * Removes a specific key from the cache.
   *
   * @param {string} key - The unique identifier of the cache entry to remove.
   * @returns {boolean} True if the element existed and was removed; otherwise, false.
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Clears all data from the cache.
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Retrieves statistics about the current cache state.
   *
   * @returns {{ size: number; keys: string[] }} An object containing the number of entries and a list of keys.
   */
  stats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }

  /**
   * Iterates through the cache and removes expired entries.
   * This is called automatically by the cleanup interval.
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
   * Destroys the cache instance by clearing data and stopping the cleanup interval.
   * Should be called when the cache is no longer needed to prevent memory leaks.
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.clear();
  }
}

/** Global singleton instance of SimpleCache. */
export const cache = new SimpleCache();

/**
 * A wrapper function that tries to fetch data from the cache first.
 * If the data is missing or expired, it executes the provided fetch function,
 * stores the result in the cache, and then returns it.
 *
 * @template T - The type of the data being retrieved.
 * @param {string} key - The unique identifier for the cache entry.
 * @param {() => Promise<T>} fetchFn - The asynchronous function to execute if the cache misses.
 * @param {number} [ttlSeconds=300] - The lifespan of the cache entry in seconds.
 * @returns {Promise<T>} A promise that resolves to the data (either from cache or fetched).
 *
 * @example
 * const data = await withCache('user:123', () => fetchUserData(123), 60);
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
 * Generates a standardized cache key by combining a prefix and parameters.
 *
 * @param {string} prefix - The namespace or prefix for the key (e.g., "user", "order").
 * @param {...(string | number | boolean)[]} params - Additional segments to ensure uniqueness.
 * @returns {string} The constructed cache key (e.g., "user:123:active").
 */
export function generateCacheKey(prefix: string, ...params: (string | number | boolean)[]): string {
  return `${prefix}:${params.join(':')}`;
}

/**
 * Common Cache Time To Live (TTL) constants in seconds.
 */
export const CacheTTL = {
  /** 1 minute */
  SHORT: 60,
  /** 5 minutes */
  MEDIUM: 300,
  /** 30 minutes */
  LONG: 1800,
  /** 1 hour */
  HOUR: 3600,
  /** 24 hours */
  DAY: 86400,
} as const;
