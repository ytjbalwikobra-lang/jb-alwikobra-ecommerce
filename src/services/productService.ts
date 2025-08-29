import { supabase } from './supabase.ts';
import { Product, FlashSale, Tier, GameTitle, ProductTier } from '../types/index.ts';

// Sample data untuk development/testing
const sampleTiers: Tier[] = [
  {
    id: '1',
    name: 'Reguler',
    slug: 'reguler',
    description: 'Akun standar untuk pemula',
    color: '#6b7280',
    borderColor: '#9ca3af',
    backgroundGradient: 'from-pink-600 to-rose-600',
    icon: 'Trophy',
    priceRangeMin: 0,
    priceRangeMax: 500000,
    isActive: true,
    sortOrder: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Pelajar',
    slug: 'pelajar',
    description: 'Akun premium untuk pelajar',
    color: '#3b82f6',
    borderColor: '#60a5fa',
    backgroundGradient: 'from-blue-500 to-indigo-600',
    icon: 'Users',
    priceRangeMin: 500000,
    priceRangeMax: 2000000,
    isActive: true,
    sortOrder: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '3',
    name: 'Premium',
    slug: 'premium',
    description: 'Akun premium terbaik',
    color: '#f59e0b',
    borderColor: '#fbbf24',
    backgroundGradient: 'from-amber-500 to-orange-600',
    icon: 'Crown',
    priceRangeMin: 2000000,
    isActive: true,
    sortOrder: 3,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const sampleGameTitles: GameTitle[] = [
  {
    id: '1',
    name: 'Mobile Legends',
    slug: 'mobile-legends',
    description: 'MOBA terpopuler di Indonesia',
    icon: 'Sword',
    color: '#10b981',
    isPopular: true,
    isActive: true,
    sortOrder: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    name: 'PUBG Mobile',
    slug: 'pubg-mobile',
    description: 'Battle Royale terpopuler',
    icon: 'Target',
    color: '#dc2626',
    isPopular: true,
    isActive: true,
    sortOrder: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '3',
    name: 'Free Fire',
    slug: 'free-fire',
    description: 'Battle Royale ringan',
    icon: 'Zap',
    color: '#ea580c',
    isPopular: true,
    isActive: true,
    sortOrder: 3,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const sampleProducts: Product[] = [
  {
    id: '1',
    name: 'Akun ML Sultan Mythic Glory 1000 Points',
    description: 'Akun Mobile Legends dengan rank Mythic Glory 1000 points. Semua hero unlocked, 500+ skin epic/legend. Akun aman dan terpercaya.',
    price: 2500000,
    originalPrice: 3000000,
    image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400',
    images: ['https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400'],
    gameTitle: 'Mobile Legends',
    tier: 'premium',
    tierId: '3',
    gameTitleId: '1',
    tierData: sampleTiers[2],
    gameTitleData: sampleGameTitles[0],
    accountLevel: 'Mythic Glory',
    accountDetails: 'All heroes unlocked, 500+ skins, Winrate 75%',
    isFlashSale: true,
    flashSaleEndTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    hasRental: true,
    rentalOptions: [
      { id: '1', duration: '1 Hari', price: 150000, description: 'Akses full 24 jam' },
      { id: '2', duration: '3 Hari', price: 400000, description: 'Akses 3x24 jam + bonus coaching' },
    ],
    stock: 5,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Akun PUBG Mobile Conqueror Asia',
    description: 'Akun PUBG Mobile rank Conqueror server Asia. KD ratio 4.5, tier rewards lengkap, senjata mythic tersedia.',
    price: 1800000,
    originalPrice: 2200000,
    image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400',
    images: ['https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400'],
    category: 'Battle Royale',
    gameTitle: 'PUBG Mobile',
    tier: 'pelajar',
    tierId: '2',
    gameTitleId: '2',
    tierData: sampleTiers[1],
    gameTitleData: sampleGameTitles[1],
    accountLevel: 'Conqueror',
    accountDetails: 'KD 4.5, All season rewards, Mythic weapons',
    isFlashSale: false,
    hasRental: true,
    rentalOptions: [
      { id: '3', duration: '1 Hari', price: 120000, description: 'Akses ranked full' },
      { id: '4', duration: '3 Hari', price: 300000, description: 'Main sepuasnya 3 hari' },
    ],
    stock: 8,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Akun Free Fire Grandmaster Ranked',
    description: 'Akun Free Fire Grandmaster dengan koleksi bundle lengkap. Pet maxed, gun skin rare, character unlocked semua.',
    price: 800000,
    originalPrice: 1000000,
    image: 'https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=400',
    images: ['https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=400'],
    category: 'Battle Royale',
    gameTitle: 'Free Fire',
    tier: 'pelajar',
    tierId: '2',
    gameTitleId: '3',
    tierData: sampleTiers[1],
    gameTitleData: sampleGameTitles[2],
    accountLevel: 'Grandmaster',
    accountDetails: 'All characters, All pets maxed, Rare gun skins',
    isFlashSale: true,
    flashSaleEndTime: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    hasRental: false,
    stock: 12,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export class ProductService {
  static async getAllProducts(): Promise<Product[]> {
    try {
      // Check if Supabase is configured
      if (!process.env.REACT_APP_SUPABASE_URL || !process.env.REACT_APP_SUPABASE_ANON_KEY) {
        console.warn('Supabase not configured, using sample data');
        return sampleProducts;
      }

      if (!supabase) return sampleProducts;

      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          rental_options (*),
          tiers (
            id, name, slug, description, color, border_color, 
            background_gradient, icon, price_range_min, price_range_max,
            is_active, sort_order, created_at, updated_at
          ),
          game_titles (
            id, name, slug, description, icon, color,
            logo_url, is_popular, is_active, sort_order, created_at, updated_at
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error:', error);
        console.warn('Falling back to sample data');
        return sampleProducts;
      }

      return data?.map(product => ({
        ...product,
        rentalOptions: product.rental_options || [],
        tierData: product.tiers,
        gameTitleData: product.game_titles,
        // Backward compatibility
        tier: product.tiers?.slug as ProductTier,
        gameTitle: product.game_titles?.name || product.game_title
      })) || sampleProducts;
    } catch (error) {
      console.error('Error fetching products:', error);
      console.warn('Using sample data due to error');
      return sampleProducts;
    }
  }

  static async getProductById(id: string): Promise<Product | null> {
    try {
      // Check if Supabase is configured
      if (!process.env.REACT_APP_SUPABASE_URL || !process.env.REACT_APP_SUPABASE_ANON_KEY) {
        console.warn('Supabase not configured, using sample data');
        return sampleProducts.find(p => p.id === id) || null;
      }

  if (!supabase) return sampleProducts.find(p => p.id === id) || null;

  const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          rental_options (*)
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.error('Supabase error:', error);
        return sampleProducts.find(p => p.id === id) || null;
      }

      return data ? {
        ...data,
        rentalOptions: data.rental_options || []
      } : null;
    } catch (error) {
      console.error('Error fetching product:', error);
      return sampleProducts.find(p => p.id === id) || null;
    }
  }

  static async getFlashSales(): Promise<(FlashSale & { product: Product })[]> {
    try {
      // Check if Supabase is configured
      if (!process.env.REACT_APP_SUPABASE_URL || !process.env.REACT_APP_SUPABASE_ANON_KEY) {
        console.warn('Supabase not configured, using sample data');
        const flashSaleProducts = sampleProducts.filter(p => p.isFlashSale);
        return flashSaleProducts.map(product => ({
          id: `flash-${product.id}`,
          productId: product.id,
          salePrice: product.price,
          originalPrice: product.originalPrice || product.price,
          startTime: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
          endTime: product.flashSaleEndTime || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          stock: product.stock,
          isActive: true,
          createdAt: product.createdAt,
          product
        }));
      }

      if (!supabase) {
        const flashSaleProducts = sampleProducts.filter(p => p.isFlashSale);
        return flashSaleProducts.map(product => ({
          id: `flash-${product.id}`,
          productId: product.id,
          salePrice: product.price,
          originalPrice: product.originalPrice || product.price,
          startTime: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
          endTime: product.flashSaleEndTime || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          stock: product.stock,
          isActive: true,
          createdAt: product.createdAt,
          product
        }));
      }

      const { data, error } = await supabase
        .from('flash_sales')
        .select(`
          *,
          products (
            *,
            game_titles (*),
            tiers (*)
          )
        `)
        .eq('is_active', true)
        .gte('end_time', new Date().toISOString());

      if (error) {
        console.error('Supabase error:', error);
        const flashSaleProducts = sampleProducts.filter(p => p.isFlashSale);
        return flashSaleProducts.map(product => ({
          id: `flash-${product.id}`,
          productId: product.id,
          salePrice: product.price,
          originalPrice: product.originalPrice || product.price,
          startTime: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
          endTime: product.flashSaleEndTime || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          stock: product.stock,
          isActive: true,
          createdAt: product.createdAt,
          product
        }));
      }

      return data?.map((sale: any) => {
        const prod = sale.products || {};
        const gt = prod.game_titles;
        const tier = prod.tiers;
        const product = {
          ...prod,
          // Enrich with joined data for UI badges/monogram
          gameTitleData: gt ? {
            id: gt.id,
            slug: gt.slug,
            name: gt.name,
            description: gt.description,
            icon: gt.icon,
            color: gt.color,
            logoUrl: gt.logo_url ?? gt.logoUrl,
            isPopular: gt.is_popular ?? gt.isPopular,
            isActive: gt.is_active ?? gt.isActive,
            sortOrder: gt.sort_order ?? gt.sortOrder,
            createdAt: gt.created_at ?? gt.createdAt,
            updatedAt: gt.updated_at ?? gt.updatedAt,
          } : undefined,
          gameTitle: gt?.name || prod.gameTitle,
          tierData: tier ? {
            id: tier.id,
            name: tier.name,
            slug: tier.slug,
            description: tier.description,
            color: tier.color,
            borderColor: tier.border_color ?? tier.borderColor,
            backgroundGradient: tier.background_gradient ?? tier.backgroundGradient,
            icon: tier.icon,
            priceRangeMin: tier.price_range_min ?? tier.priceRangeMin,
            priceRangeMax: tier.price_range_max ?? tier.priceRangeMax,
            isActive: tier.is_active ?? tier.isActive,
            sortOrder: tier.sort_order ?? tier.sortOrder,
            createdAt: tier.created_at ?? tier.createdAt,
            updatedAt: tier.updated_at ?? tier.updatedAt,
          } : undefined,
          // Ensure flash sale styling/timer can use these
          isFlashSale: true,
          flashSaleEndTime: sale.end_time || sale.endTime,
          // Apply sale price and preserve original
          price: sale.sale_price ?? sale.salePrice ?? prod.price,
          originalPrice: sale.original_price ?? sale.originalPrice ?? prod.original_price ?? prod.originalPrice ?? prod.price,
        } as any;

        return { ...sale, product };
      }) || [];
    } catch (error) {
      console.error('Error fetching flash sales:', error);
      const flashSaleProducts = sampleProducts.filter(p => p.isFlashSale);
      return flashSaleProducts.map(product => ({
        id: `flash-${product.id}`,
        productId: product.id,
        salePrice: product.price,
        originalPrice: product.originalPrice || product.price,
        startTime: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        endTime: product.flashSaleEndTime || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        stock: product.stock,
        isActive: true,
        createdAt: product.createdAt,
        product
      }));
    }
  }

  static async getActiveFlashSaleByProductId(productId: string): Promise<{
    salePrice: number;
    originalPrice: number;
    endTime: string;
    startTime?: string;
  } | null> {
    try {
      // Sample fallback
      if (!process.env.REACT_APP_SUPABASE_URL || !process.env.REACT_APP_SUPABASE_ANON_KEY || !supabase) {
        const flashSales = await this.getFlashSales();
        const found = flashSales.find(fs => fs.productId === productId && fs.isActive);
        if (!found) return null;
        const now = new Date();
        const end = new Date(found.endTime);
        if (end.getTime() <= now.getTime()) return null;
        return {
          salePrice: found.salePrice,
          originalPrice: found.originalPrice,
          endTime: found.endTime,
          startTime: found.startTime,
        };
      }

      const nowIso = new Date().toISOString();
      const { data, error } = await supabase
        .from('flash_sales')
        .select('*')
        .eq('product_id', productId)
        .eq('is_active', true)
        .lte('start_time', nowIso)
        .gte('end_time', nowIso)
        .order('start_time', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Supabase error fetching active flash sale:', error);
        return null;
      }

      if (!data) return null;

      return {
        salePrice: data.sale_price ?? data.salePrice,
        originalPrice: data.original_price ?? data.originalPrice,
        endTime: data.end_time ?? data.endTime,
        startTime: data.start_time ?? data.startTime,
      };
    } catch (e) {
      console.error('Error getActiveFlashSaleByProductId:', e);
      return null;
    }
  }

  static async createProduct(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product | null> {
    try {
  if (!supabase) return null;

  const { data, error } = await supabase
        .from('products')
        .insert([product])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating product:', error);
      return null;
    }
  }

  static async updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
    try {
  if (!supabase) return null;

  const { data, error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating product:', error);
      return null;
    }
  }

  static async deleteProduct(id: string): Promise<boolean> {
    try {
  if (!supabase) return false;

  const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting product:', error);
      return false;
    }
  }

  static async getTiers(): Promise<Tier[]> {
    try {
      if (!supabase) {
        return sampleTiers;
      }

      const { data, error } = await supabase
        .from('tiers')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) {
        console.error('Error fetching tiers:', error);
        return sampleTiers;
      }

      return data?.map(tier => ({
        ...tier,
        isActive: tier.is_active,
        sortOrder: tier.sort_order,
        borderColor: tier.border_color,
        backgroundGradient: tier.background_gradient,
        priceRangeMin: tier.price_range_min,
        priceRangeMax: tier.price_range_max,
        createdAt: tier.created_at,
        updatedAt: tier.updated_at
      })) || sampleTiers;
    } catch (error) {
      console.error('Error fetching tiers:', error);
      return sampleTiers;
    }
  }

  static async getGameTitles(): Promise<GameTitle[]> {
    try {
      if (!supabase) {
        return sampleGameTitles;
      }

      const { data, error } = await supabase
        .from('game_titles')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) {
        console.error('Error fetching game titles:', error);
        return sampleGameTitles;
      }

      return data?.map(gameTitle => ({
        ...gameTitle,
        isPopular: gameTitle.is_popular,
        isActive: gameTitle.is_active,
        sortOrder: gameTitle.sort_order,
        logoUrl: gameTitle.logo_url,
        createdAt: gameTitle.created_at,
        updatedAt: gameTitle.updated_at
      })) || sampleGameTitles;
    } catch (error) {
      console.error('Error fetching game titles:', error);
      return sampleGameTitles;
    }
  }

  static async getCategories(): Promise<string[]> {
    try {
      // Categories have been removed from the system
      return [];
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  }
}
