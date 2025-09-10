/**
 * Enhanced Banner Service with iOS-compatible caching and data fetching
 * Ensures banners display actual data with iOS design system compatibility
 */

import { supabase } from './supabase';
import { globalCache } from './globalCacheManager';
import { Banner } from '../types/index';

// iOS-optimized banner data with proper aspect ratios and safe URLs
const IOS_OPTIMIZED_BANNERS: Banner[] = [
  {
    id: 'ios-banner-1',
    title: '🔥 Flash Sale Gaming Accounts',
    subtitle: 'Dapatkan diskon hingga 70% untuk akun premium pilihan!',
    imageUrl: 'https://images.unsplash.com/photo-1542751110-97427bbecf20?w=1200&h=800&fit=crop&auto=format&q=80',
    linkUrl: '/flash-sales',
    sortOrder: 1,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ios-banner-2',
    title: '🏆 Koleksi Akun Verified',
    subtitle: 'Akun terverifikasi dengan rank tinggi dan item langka',
    imageUrl: 'https://images.unsplash.com/photo-1605901309584-818e25960a8e?w=1200&h=800&fit=crop&auto=format&q=80',
    linkUrl: '/products?tier=premium',
    sortOrder: 2,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ios-banner-3',
    title: '💎 Rental System Terbaru',
    subtitle: 'Sewa akun favorit dengan sistem yang aman dan mudah',
    imageUrl: 'https://images.unsplash.com/photo-1556438064-2d7646166914?w=1200&h=800&fit=crop&auto=format&q=80',
    linkUrl: '/products?type=rental',
    sortOrder: 3,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ios-banner-4',
    title: '🎮 New Game Arrivals',
    subtitle: 'Akun untuk game mobile terbaru dan terpopuler',
    imageUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1200&h=800&fit=crop&auto=format&q=80',
    linkUrl: '/products?category=new',
    sortOrder: 4,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ios-banner-5',
    title: '⚡ Lightning Deals',
    subtitle: 'Penawaran kilat terbatas waktu untuk member VIP',
    imageUrl: 'https://images.unsplash.com/photo-1542744094-24638eff58bb?w=1200&h=800&fit=crop&auto=format&q=80',
    linkUrl: '/deals',
    sortOrder: 5,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

export interface BannerListResult {
  banners: Banner[];
  total: number;
  activeCount: number;
}

export class EnhancedBannerService {
  private static instance: EnhancedBannerService;
  private static readonly CACHE_TAGS = {
    BANNERS: 'banners',
    ACTIVE_BANNERS: 'active-banners'
  } as const;

  static getInstance(): EnhancedBannerService {
    if (!this.instance) {
      this.instance = new EnhancedBannerService();
    }
    return this.instance;
  }

  /**
   * Get all banners with iOS-optimized caching and fallback data
   */
  async list(): Promise<Banner[]> {
    const cacheKey = 'banners:all';
    
    return globalCache.getOrSet(
      cacheKey,
      async () => {
        try {
          // Try to fetch from Supabase
          if (supabase) {
            const banners = await this.fetchFromDatabase();
            if (banners.length > 0) {
              return banners;
            }
          }
          
          // Fallback to iOS-optimized mock data
          return this.getOptimizedMockBanners();
        } catch (error) {
          console.warn('Banner service error, using mock data:', error);
          return this.getOptimizedMockBanners();
        }
      },
      {
        ttl: 10 * 60 * 1000, // 10 minutes for banner data (longer cache)
        tags: [EnhancedBannerService.CACHE_TAGS.BANNERS]
      }
    );
  }

  /**
   * Get only active banners with iOS optimization
   */
  async getActiveBanners(): Promise<Banner[]> {
    const cacheKey = 'banners:active';
    
    return globalCache.getOrSet(
      cacheKey,
      async () => {
        const allBanners = await this.list();
        return allBanners
          .filter(banner => banner.isActive)
          .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
      },
      {
        ttl: 10 * 60 * 1000, // 10 minutes
        tags: [EnhancedBannerService.CACHE_TAGS.ACTIVE_BANNERS]
      }
    );
  }

  /**
   * Fetch banners from Supabase database
   */
  private async fetchFromDatabase(): Promise<Banner[]> {
    if (!supabase) {
      throw new Error('Supabase not configured');
    }

    // First, check if the banners table exists and has the expected structure
    const { data, error } = await supabase
      .from('banners')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Database query error for banners:', error);
      throw error;
    }

    if (!data || data.length === 0) {
      console.info('No banners found in database, using fallback data');
      return [];
    }

    // Transform database data to Banner interface
    const transformedBanners: Banner[] = data.map((banner: any) => ({
      id: banner.id,
      title: banner.title || '',
      subtitle: banner.subtitle || '',
      imageUrl: banner.image_url || banner.imageUrl || '',
      linkUrl: banner.link_url || banner.linkUrl || '',
      sortOrder: banner.sort_order || banner.sortOrder || 0,
      isActive: banner.is_active !== false, // Default to true if not specified
      createdAt: banner.created_at || banner.createdAt || new Date().toISOString(),
      updatedAt: banner.updated_at || banner.updatedAt || new Date().toISOString(),
    }));

    return transformedBanners;
  }

  /**
   * Get iOS-optimized mock banners with proper fallback
   */
  private getOptimizedMockBanners(): Banner[] {
    // Return banners optimized for iOS with proper image URLs and safe dimensions
    return IOS_OPTIMIZED_BANNERS.map(banner => ({
      ...banner,
      // Ensure image URLs work on iOS Safari
      imageUrl: banner.imageUrl.includes('?') 
        ? banner.imageUrl + '&fm=jpg&auto=compress' 
        : banner.imageUrl + '?fm=jpg&auto=compress&q=80'
    }));
  }

  /**
   * Create a new banner (with cache invalidation)
   */
  async createBanner(bannerData: Omit<Banner, 'id' | 'createdAt' | 'updatedAt'>): Promise<Banner | null> {
    try {
      if (!supabase) {
        console.warn('Cannot create banner: Supabase not configured');
        return null;
      }

      const { data, error } = await supabase
        .from('banners')
        .insert({
          title: bannerData.title,
          subtitle: bannerData.subtitle,
          image_url: bannerData.imageUrl,
          link_url: bannerData.linkUrl,
          sort_order: bannerData.sortOrder || 0,
          is_active: bannerData.isActive !== false
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating banner:', error);
        return null;
      }

      // Invalidate banner caches
      await this.clearCache();

      return {
        id: data.id,
        title: data.title,
        subtitle: data.subtitle,
        imageUrl: data.image_url,
        linkUrl: data.link_url,
        sortOrder: data.sort_order,
        isActive: data.is_active,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
    } catch (error) {
      console.error('Failed to create banner:', error);
      return null;
    }
  }

  /**
   * Update banner (with cache invalidation)
   */
  async updateBanner(id: string, updates: Partial<Banner>): Promise<Banner | null> {
    try {
      if (!supabase) {
        console.warn('Cannot update banner: Supabase not configured');
        return null;
      }

      const updateData: any = {};
      if (updates.title !== undefined) updateData.title = updates.title;
      if (updates.subtitle !== undefined) updateData.subtitle = updates.subtitle;
      if (updates.imageUrl !== undefined) updateData.image_url = updates.imageUrl;
      if (updates.linkUrl !== undefined) updateData.link_url = updates.linkUrl;
      if (updates.sortOrder !== undefined) updateData.sort_order = updates.sortOrder;
      if (updates.isActive !== undefined) updateData.is_active = updates.isActive;

      const { data, error } = await supabase
        .from('banners')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating banner:', error);
        return null;
      }

      // Invalidate banner caches
      await this.clearCache();

      return {
        id: data.id,
        title: data.title,
        subtitle: data.subtitle,
        imageUrl: data.image_url,
        linkUrl: data.link_url,
        sortOrder: data.sort_order,
        isActive: data.is_active,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
    } catch (error) {
      console.error('Failed to update banner:', error);
      return null;
    }
  }

  /**
   * Get banner statistics
   */
  async getStats(): Promise<BannerListResult> {
    const banners = await this.list();
    const activeCount = banners.filter(b => b.isActive).length;

    return {
      banners,
      total: banners.length,
      activeCount
    };
  }

  /**
   * Clear all banner caches
   */
  async clearCache(): Promise<void> {
    await globalCache.invalidateByTags([
      EnhancedBannerService.CACHE_TAGS.BANNERS,
      EnhancedBannerService.CACHE_TAGS.ACTIVE_BANNERS
    ]);
  }

  /**
   * Warm up banner cache
   */
  async warmupCache(): Promise<void> {
    try {
      await Promise.all([
        this.list(),
        this.getActiveBanners()
      ]);
    } catch (error) {
      console.warn('Banner cache warmup failed:', error);
    }
  }
}

// Create singleton instance
export const enhancedBannerService = EnhancedBannerService.getInstance();

// Legacy service compatibility
export const BannerService = {
  async list(): Promise<Banner[]> {
    return enhancedBannerService.list();
  }
};
