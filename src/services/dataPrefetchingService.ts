/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-return */

/**
 * DATA PREFETCHING SERVICE
 * 
 * Intelligently prefetches data based on user behavior patterns:
 * - Predicts likely next user actions
 * - Preloads data during idle time
 * - Uses intersection observer for viewport-based preloading
 * - Tracks user patterns to improve predictions
 */

import { globalAPICache } from './globalAPICache';

interface PrefetchRule {
  trigger: string; // Current page/action
  prefetch: string[]; // URLs to prefetch
  priority: number; // 1-10, higher = more important
  delay?: number; // Delay in ms before prefetching
}

interface UserPattern {
  from: string;
  to: string;
  count: number;
  lastUsed: number;
}

interface PrefetchStats {
  totalPrefetches: number;
  cacheHits: number;
  networkSaves: number;
  accuracy: number;
}

class DataPrefetchingService {
  private prefetchRules: PrefetchRule[] = [];
  private userPatterns: Map<string, UserPattern> = new Map();
  private stats: PrefetchStats = { totalPrefetches: 0, cacheHits: 0, networkSaves: 0, accuracy: 0 };
  private currentPage = '';
  private prefetchQueue: Array<{ url: string; priority: number }> = [];
  private isProcessingQueue = false;

  constructor() {
    this.initializeRules();
    this.loadUserPatterns();
    this.startIdlePrefetching();
    this.trackPageNavigation();
  }

  /**
   * Initialize default prefetching rules
   */
  private initializeRules(): void {
    this.prefetchRules = [
      // Homepage → Products page
      {
        trigger: '/',
        prefetch: [
          '/api/admin?action=products&limit=20',
          '/api/admin?action=game-titles',
          '/api/admin?action=tiers'
        ],
        priority: 9,
        delay: 1000
      },

      // Products page → Product details
      {
        trigger: '/products',
        prefetch: [
          '/api/admin?action=flash-sales',
          '/api/admin?action=featured-products'
        ],
        priority: 8,
        delay: 500
      },

      // Admin dashboard → Related admin pages
      {
        trigger: '/admin/dashboard',
        prefetch: [
          '/api/admin?action=orders&limit=10',
          '/api/admin?action=users&limit=10',
          '/api/admin?action=recent-activity'
        ],
        priority: 7,
        delay: 2000
      },

      // Feed page → User interactions
      {
        trigger: '/feed',
        prefetch: [
          '/api/feed?action=notifications',
          '/api/feed?action=eligible-products'
        ],
        priority: 6,
        delay: 1500
      },

      // Product detail → Related products and checkout
      {
        trigger: '/product/',
        prefetch: [
          '/api/admin?action=related-products',
          '/api/admin?action=payment-methods'
        ],
        priority: 8,
        delay: 3000
      },

      // Authentication pages → Dashboard/Profile
      {
        trigger: '/login',
        prefetch: [
          '/api/admin?action=dashboard-stats',
          '/api/auth?action=user-profile'
        ],
        priority: 5,
        delay: 2000
      }
    ];
  }

  /**
   * Track page navigation for pattern learning
   */
  private trackPageNavigation(): void {
    if (typeof window === 'undefined') return;

    let previousPage = window.location.pathname;

    // Listen for navigation changes
    const trackNavigation = () => {
      const currentPage = window.location.pathname;
      
      if (previousPage !== currentPage) {
        this.learnUserPattern(previousPage, currentPage);
        this.triggerPrefetch(currentPage);
        previousPage = currentPage;
        this.currentPage = currentPage;
      }
    };

    // Handle both pushState and popState
    const originalPushState = history.pushState.bind(history);
    const originalReplaceState = history.replaceState.bind(history);

    history.pushState = function (...args: any[]) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      originalPushState(...args);
      setTimeout(trackNavigation, 0);
    };

    history.replaceState = function (...args: any[]) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      originalReplaceState(...args);
      setTimeout(trackNavigation, 0);
    };

    window.addEventListener('popstate', trackNavigation);

    // Initial trigger
    this.currentPage = window.location.pathname;
    setTimeout(() => this.triggerPrefetch(this.currentPage), 1000);
  }

  /**
   * Learn user navigation patterns
   */
  private learnUserPattern(from: string, to: string): void {
    const key = `${from}→${to}`;
    const existing = this.userPatterns.get(key);
    
    if (existing) {
      existing.count++;
      existing.lastUsed = Date.now();
    } else {
      this.userPatterns.set(key, {
        from,
        to,
        count: 1,
        lastUsed: Date.now()
      });
    }

    this.saveUserPatterns();
  }

  /**
   * Trigger prefetching based on current page
   */
  private triggerPrefetch(page: string): void {
    // Find matching rules
    const matchingRules = this.prefetchRules.filter(rule => 
      page.startsWith(rule.trigger) || page.includes(rule.trigger)
    );

    // Add learned patterns
    const learnedUrls = this.getPredictedUrls(page);

    // Combine and prioritize
    const allPrefetches: Array<{ url: string; priority: number; delay?: number }> = [];

    matchingRules.forEach(rule => {
      rule.prefetch.forEach(url => {
        allPrefetches.push({
          url,
          priority: rule.priority,
          delay: rule.delay
        });
      });
    });

    learnedUrls.forEach(url => {
      allPrefetches.push({
        url,
        priority: 5 // Medium priority for learned patterns
      });
    });

    // Schedule prefetching
    allPrefetches.forEach(item => {
      if (item.delay) {
        setTimeout(() => this.addToPrefetchQueue(item.url, item.priority), item.delay);
      } else {
        this.addToPrefetchQueue(item.url, item.priority);
      }
    });
  }

  /**
   * Get predicted URLs based on learned patterns
   */
  private getPredictedUrls(currentPage: string): string[] {
    const predictions: Array<{ url: string; score: number }> = [];
    
    // Find patterns that start from current page
    this.userPatterns.forEach(pattern => {
      if (pattern.from === currentPage) {
        const score = this.calculatePatternScore(pattern);
        
        // Convert destination page to API URLs
        const apiUrls = this.pageToApiUrls(pattern.to);
        apiUrls.forEach(url => {
          predictions.push({ url, score });
        });
      }
    });

    // Sort by score and return top predictions
    return predictions
      .sort((a, b) => b.score - a.score)
      .slice(0, 5) // Top 5 predictions
      .map(p => p.url);
  }

  /**
   * Calculate pattern relevance score
   */
  private calculatePatternScore(pattern: UserPattern): number {
    const recency = 1 - Math.min((Date.now() - pattern.lastUsed) / (7 * 24 * 60 * 60 * 1000), 1); // Decay over 7 days
    const frequency = Math.min(pattern.count / 10, 1); // Cap at 10 uses
    
    return (frequency * 0.7) + (recency * 0.3);
  }

  /**
   * Convert page path to relevant API URLs
   */
  private pageToApiUrls(page: string): string[] {
    const urlMap: Record<string, string[]> = {
      '/products': [
        '/api/admin?action=products&limit=20',
        '/api/admin?action=game-titles',
        '/api/admin?action=tiers'
      ],
      '/admin/dashboard': [
        '/api/admin?action=dashboard-stats',
        '/api/admin?action=daily-orders&days=7'
      ],
      '/admin/orders': [
        '/api/admin?action=orders&limit=20',
        '/api/admin?action=order-stats'
      ],
      '/admin/users': [
        '/api/admin?action=users&limit=20'
      ],
      '/feed': [
        '/api/feed?action=list&limit=10',
        '/api/feed?action=notifications'
      ],
      '/profile': [
        '/api/auth?action=user-profile',
        '/api/auth?action=order-history'
      ]
    };

    // Handle dynamic routes
    if (page.startsWith('/product/')) {
      return ['/api/admin?action=related-products'];
    }

    return urlMap[page] || [];
  }

  /**
   * Add URL to prefetch queue
   */
  private addToPrefetchQueue(url: string, priority: number): void {
    // Avoid duplicates
    if (this.prefetchQueue.some(item => item.url === url)) {
      return;
    }

    // Check if already cached
    if (globalAPICache.get(url)) {
      this.stats.cacheHits++;
      return;
    }

    this.prefetchQueue.push({ url, priority });
    this.prefetchQueue.sort((a, b) => b.priority - a.priority);

    if (!this.isProcessingQueue) {
      void this.processQueue();
    }
  }

  /**
   * Process prefetch queue during idle time
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessingQueue || this.prefetchQueue.length === 0) {
      return;
    }

    this.isProcessingQueue = true;

    while (this.prefetchQueue.length > 0) {
      // Check if browser is idle
      if (!this.isBrowserIdle()) {
        await this.waitForIdle();
      }

      const item = this.prefetchQueue.shift();
      if (!item) break;

      try {
        await globalAPICache.fetch(item.url);
        this.stats.totalPrefetches++;
        this.stats.networkSaves++;
      } catch (error) {
        // Silent fail for prefetching
        console.debug('Prefetch failed:', item.url, error);
      }

      // Small delay between requests
      await this.delay(100);
    }

    this.isProcessingQueue = false;
  }

  /**
   * Check if browser is idle
   */
  private isBrowserIdle(): boolean {
    // Simple heuristic: no mouse movement in last 500ms
    // In a real implementation, you might use requestIdleCallback
    return true; // Simplified for now
  }

  /**
   * Wait for browser to become idle
   */
  private async waitForIdle(): Promise<void> {
    return new Promise(resolve => {
      if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
        (window as any).requestIdleCallback(resolve);
      } else {
        setTimeout(resolve, 1000);
      }
    });
  }

  /**
   * Utility delay function
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Start idle-time prefetching
   */
  private startIdlePrefetching(): void {
    if (typeof window === 'undefined') return;

    // Prefetch common data during idle time
    const idlePrefetches = [
      '/api/admin?action=game-titles',
      '/api/admin?action=tiers',
      '/api/admin?action=website-settings'
    ];

    setTimeout(() => {
      idlePrefetches.forEach(url => {
        this.addToPrefetchQueue(url, 3); // Low priority
      });
    }, 5000); // Wait 5 seconds after page load
  }

  /**
   * Viewport-based prefetching using Intersection Observer
   */
  observeElement(element: HTMLElement, urls: string[]): void {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            urls.forEach(url => {
              this.addToPrefetchQueue(url, 6); // Medium-high priority
            });
            observer.unobserve(element);
          }
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(element);
  }

  /**
   * Manual prefetch for specific URLs
   */
  prefetch(urls: string | string[], priority = 5): void {
    const urlArray = Array.isArray(urls) ? urls : [urls];
    urlArray.forEach(url => {
      this.addToPrefetchQueue(url, priority);
    });
  }

  /**
   * Load user patterns from localStorage
   */
  private loadUserPatterns(): void {
    if (typeof window === 'undefined') return;

    try {
      const stored = localStorage.getItem('prefetch_patterns');
      if (stored) {
        const patterns = JSON.parse(stored);
        this.userPatterns = new Map(patterns);
      }
    } catch (error) {
      console.debug('Failed to load prefetch patterns:', error);
    }
  }

  /**
   * Save user patterns to localStorage
   */
  private saveUserPatterns(): void {
    if (typeof window === 'undefined') return;

    try {
      const patterns = Array.from(this.userPatterns.entries());
      localStorage.setItem('prefetch_patterns', JSON.stringify(patterns));
    } catch (error) {
      console.debug('Failed to save prefetch patterns:', error);
    }
  }

  /**
   * Get prefetching statistics
   */
  getStats(): PrefetchStats {
    this.stats.accuracy = this.stats.totalPrefetches > 0 
      ? (this.stats.cacheHits / this.stats.totalPrefetches) * 100 
      : 0;
    
    return { ...this.stats };
  }

  /**
   * Clear all patterns and stats
   */
  reset(): void {
    this.userPatterns.clear();
    this.prefetchQueue = [];
    this.stats = { totalPrefetches: 0, cacheHits: 0, networkSaves: 0, accuracy: 0 };
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem('prefetch_patterns');
    }
  }
}

// Export singleton instance
export const dataPrefetchingService = new DataPrefetchingService();

export default dataPrefetchingService;
