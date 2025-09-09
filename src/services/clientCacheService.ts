// Client-side cache management service
interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

class ClientCacheService {
  private cache = new Map<string, CacheItem<any>>();

  async get<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttlMs: number = 300000 // 5 minutes default
  ): Promise<T> {
    const cached = this.cache.get(key);
    const now = Date.now();

    // Return cached data if still valid
    if (cached && (now - cached.timestamp) < cached.ttl) {
      return cached.data;
    }

    try {
      // Fetch fresh data
      const data = await fetcher();
      
      // Cache the result
      this.cache.set(key, {
        data,
        timestamp: now,
        ttl: ttlMs
      });

      return data;
    } catch (error) {
      // Return stale cache if available on error
      if (cached) {
        console.warn(`Using stale cache for ${key}:`, error);
        return cached.data;
      }
      throw error;
    }
  }

  invalidate(key: string): void {
    this.cache.delete(key);
  }

  invalidatePattern(pattern: string): void {
    const regex = new RegExp(pattern);
    // Use Array.from for ES5 compatibility without downlevelIteration
    Array.from(this.cache.keys()).forEach((key) => {
      if (regex.test(key)) this.cache.delete(key);
    });
  }

  clear(): void {
    this.cache.clear();
  }

  // Get cache info for debugging
  getCacheInfo(): { key: string; age: number; ttl: number }[] {
    const now = Date.now();
    return Array.from(this.cache.entries()).map(([key, item]) => ({
      key,
      age: now - item.timestamp,
      ttl: item.ttl
    }));
  }
}

export const clientCache = new ClientCacheService();
