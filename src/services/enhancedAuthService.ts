/**
 * Enhanced AuthService with World-Class Caching Integration
 * Wraps the existing auth functions with advanced caching and security
 */

import * as BaseAuthService from './authService';
import { globalCache, cacheUtils } from './globalCacheManager';

export interface AuthCacheConfig {
  /** TTL for user profile data (default: 2 minutes) */
  profileTTL?: number;
  /** TTL for role/permission data (default: 5 minutes) */
  roleTTL?: number;
  /** Enable secure caching (default: true) */
  secureMode?: boolean;
}

/**
 * Enhanced AuthService with intelligent caching and security
 */
export class EnhancedAuthService {
  private static instance: EnhancedAuthService;
  private config: Required<AuthCacheConfig>;
  
  // Cache tags for intelligent invalidation
  private static readonly CACHE_TAGS = {
    USER_PROFILE: 'user-profile',
    USER_ROLE: 'user-role',
    AUTH_STATE: 'auth-state',
    PERMISSIONS: 'permissions'
  } as const;

  private constructor(config: AuthCacheConfig = {}) {
    this.config = {
      profileTTL: config.profileTTL ?? 2 * 60 * 1000, // 2 minutes
      roleTTL: config.roleTTL ?? 5 * 60 * 1000, // 5 minutes
      secureMode: config.secureMode ?? true
    };
  }

  static getInstance(config?: AuthCacheConfig): EnhancedAuthService {
    if (!this.instance) {
      this.instance = new EnhancedAuthService(config);
    }
    return this.instance;
  }

  /**
   * Get current user profile with intelligent caching
   */
  async getCurrentUserProfile(): Promise<BaseAuthService.UserProfile | null> {
    if (!this.config.secureMode) {
      // In non-secure mode, use short-term caching
      const cacheKey = 'auth:current-user-profile';
      
      return globalCache.getOrSet(
        cacheKey,
        () => BaseAuthService.getCurrentUserProfile(),
        {
          ttl: this.config.profileTTL,
          tags: [EnhancedAuthService.CACHE_TAGS.USER_PROFILE]
        }
      );
    } else {
      // In secure mode, always fetch fresh for security
      return BaseAuthService.getCurrentUserProfile();
    }
  }

  /**
   * Check if user is logged in with caching
   */
  async isLoggedIn(): Promise<boolean> {
    if (!this.config.secureMode) {
      const cacheKey = 'auth:is-logged-in';
      
      return globalCache.getOrSet(
        cacheKey,
        () => BaseAuthService.isLoggedIn(),
        {
          ttl: this.config.profileTTL,
          tags: [EnhancedAuthService.CACHE_TAGS.AUTH_STATE]
        }
      );
    } else {
      return BaseAuthService.isLoggedIn();
    }
  }

  /**
   * Get current user ID with caching
   */
  async getCurrentUserId(): Promise<string | null> {
    if (!this.config.secureMode) {
      const cacheKey = 'auth:current-user-id';
      
      return globalCache.getOrSet(
        cacheKey,
        () => BaseAuthService.getAuthUserId(),
        {
          ttl: this.config.profileTTL,
          tags: [EnhancedAuthService.CACHE_TAGS.USER_PROFILE]
        }
      );
    } else {
      return BaseAuthService.getAuthUserId();
    }
  }

  /**
   * Get user role with longer caching
   */
  async getUserRole(): Promise<string | null> {
    const cacheKey = 'auth:user-role';
    
    return globalCache.getOrSet(
      cacheKey,
      () => BaseAuthService.getUserRole(),
      {
        ttl: this.config.roleTTL,
        tags: [EnhancedAuthService.CACHE_TAGS.USER_ROLE]
      }
    );
  }

  /**
   * Check if user is admin with role caching
   */
  async isAdmin(): Promise<boolean> {
    const cacheKey = 'auth:is-admin';
    
    return globalCache.getOrSet(
      cacheKey,
      () => BaseAuthService.isAdmin(),
      {
        ttl: this.config.roleTTL,
        tags: [EnhancedAuthService.CACHE_TAGS.USER_ROLE, EnhancedAuthService.CACHE_TAGS.PERMISSIONS]
      }
    );
  }

  /**
   * Login with cache invalidation
   */
  async login(credentials: any): Promise<any> {
    // Note: Base auth service doesn't have login, this would be implemented separately
    // For now, we'll clear caches when login state changes
    await this.clearAuthCache();
    return { success: true };
  }

  /**
   * Logout with cache invalidation
   */
  async logout(): Promise<void> {
    await BaseAuthService.logout();
    
    // Clear all auth-related caches after logout
    await this.clearAuthCache();
  }

  /**
   * Update profile with cache invalidation
   */
  async updateProfile(updates: Partial<BaseAuthService.UserProfile>): Promise<BaseAuthService.UserProfile> {
    // Note: Base auth service doesn't have updateProfile, using setLocalUserProfile
    BaseAuthService.setLocalUserProfile(updates as BaseAuthService.UserProfile);
    
    // Invalidate profile-related caches
    await globalCache.invalidateByTags([
      EnhancedAuthService.CACHE_TAGS.USER_PROFILE,
      EnhancedAuthService.CACHE_TAGS.AUTH_STATE
    ]);
    
    return updates as BaseAuthService.UserProfile;
  }

  /**
   * Change password with security considerations
   */
  async changePassword(oldPassword: string, newPassword: string): Promise<boolean> {
    // Note: Base auth service doesn't have changePassword
    // This would be implemented with actual auth provider
    console.warn('Change password not implemented in base auth service');
    
    // Clear all auth caches for security
    await this.clearAuthCache();
    
    return false;
  }

  /**
   * Clear all authentication-related caches
   */
  async clearAuthCache(): Promise<void> {
    await Promise.all(
      Object.values(EnhancedAuthService.CACHE_TAGS).map(tag =>
        globalCache.invalidateByTags([tag])
      )
    );
  }

  /**
   * Get authentication cache statistics
   */
  getAuthCacheStats(): {
    entries: number;
    hitRate: number;
    tags: string[];
  } {
    const stats = globalCache.getStats();
    return {
      entries: stats.entries,
      hitRate: stats.hitRate,
      tags: Object.values(EnhancedAuthService.CACHE_TAGS)
    };
  }

  /**
   * Enable/disable secure mode
   */
  setSecureMode(enabled: boolean): void {
    this.config.secureMode = enabled;
    if (enabled) {
      // Clear caches when enabling secure mode
      this.clearAuthCache();
    }
  }

  /**
   * Warm up auth caches (only in non-secure mode)
   */
  async warmupCache(): Promise<void> {
    if (this.config.secureMode) {
      console.info('Cache warmup skipped in secure mode');
      return;
    }

    try {
      await Promise.all([
        this.isLoggedIn(),
        this.getUserRole(),
        this.isAdmin()
      ]);
    } catch (error) {
      console.warn('Auth cache warmup partially failed:', error);
    }
  }
}

// Create and export singleton instance
export const enhancedAuthService = EnhancedAuthService.getInstance();

// Re-export base auth service functions for compatibility
export * from './authService';
