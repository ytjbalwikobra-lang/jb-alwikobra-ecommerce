import { supabase } from './supabase.ts';
import { deletePublicUrls } from './storageService.ts';
import { Product, FlashSale, Tier, GameTitle, ProductTier } from '../types/index.ts';

// Capability detection: whether DB exposes relations (tiers/game_titles) in products
// Track database capabilities globally
let hasRelations: boolean | null = null; // null = unknown, true = supports relations, false = legacy schema
let hasFlashSaleJoin: boolean | null = null;
let hasGameTitleText: boolean | null = null; // whether products has legacy text column game_title
function isUuid(v?: string | null) {
  return typeof v === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);
}

// Sample data untuk development/testing
const sampleTiers: Tier[] = [
  {
    id: '1',
    name: 'Reguler',
    slug: 'reguler',
    description: 'Akun standar untuk pemula',
  color: '#C0C0C0',
  borderColor: '#D1D5DB',
  backgroundGradient: 'from-zinc-400 to-neutral-500',
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
  private static cache = new Map<string, { data: any; expiry: number; inflight?: Promise<any> }>();
  private static getFromCache<T = any>(key: string): T | null {
    const hit = this.cache.get(key);
    if (!hit) return null;
    if (Date.now() > hit.expiry) return null;
    return hit.data as T;
  }
  private static setCache<T = any>(key: string, data: T, ttlMs: number) {
    const existing = this.cache.get(key);
    this.cache.set(key, { data, expiry: Date.now() + ttlMs, inflight: existing?.inflight });
  }
  private static setInflight(key: string, p: Promise<any>) {
    const existing = this.cache.get(key);
    this.cache.set(key, { data: existing?.data, expiry: existing?.expiry || 0, inflight: p });
  }
  // Force reset of capability detection - useful after schema changes
  static resetCapabilities() {
    hasRelations = null;
    hasFlashSaleJoin = null;
    console.log('🔄 ProductService capabilities reset');
  }

  // Test and detect current schema capabilities
  static async detectSchemaCapabilities(): Promise<{
    hasRelationalSchema: boolean;
    hasRentalOptions: boolean;
    hasFlashSales: boolean;
  }> {
    if (!supabase) {
      return { hasRelationalSchema: false, hasRentalOptions: false, hasFlashSales: false };
    }

  const capabilities = {
      hasRelationalSchema: false,
      hasRentalOptions: false,
      hasFlashSales: false
    };

    try {
      // Test relational schema
      const { data, error } = await supabase
        .from('products')
        .select('id, game_title_id, tier_id')
        .limit(1);

      if (!error) {
        capabilities.hasRelationalSchema = true;
        hasRelations = true;
        console.log('✅ Relational schema detected');
      } else {
        hasRelations = false;
        console.log('⚠️ Legacy schema detected');
      }

      // Detect presence of legacy text column game_title
      try {
        const { error: gtErr } = await supabase
          .from('products')
          .select('game_title')
          .limit(1);
        if (!gtErr) {
          hasGameTitleText = true;
          console.log('✅ Legacy text column detected: products.game_title');
        } else {
          hasGameTitleText = false;
          console.log('ℹ️ No legacy text column products.game_title');
        }
      } catch (e) {
        hasGameTitleText = false;
        console.log('ℹ️ No legacy text column products.game_title');
      }

      // Test rental options
      const { error: rentalError } = await supabase
        .from('rental_options')
        .select('id')
        .limit(1);

      if (!rentalError) {
        capabilities.hasRentalOptions = true;
        console.log('✅ Rental options table available');
      }

      // Test flash sales
      const { error: flashError } = await supabase
        .from('flash_sales')
        .select('id')
        .limit(1);

      if (!flashError) {
        capabilities.hasFlashSales = true;
        console.log('✅ Flash sales table available');
      }

    } catch (error) {
      console.error('🔥 Schema detection failed:', error);
    }

    return capabilities;
  }

  static async getAllProducts(opts?: { includeArchived?: boolean }): Promise<Product[]> {
    try {
      // Check if Supabase is configured
      if (!process.env.REACT_APP_SUPABASE_URL || !process.env.REACT_APP_SUPABASE_ANON_KEY) {
        console.warn('Supabase not configured, using sample data');
        return sampleProducts;
      }

      if (!supabase) return sampleProducts;

      // If we already know relations are unsupported, skip relational select entirely
      if (hasRelations === false) {
        throw new Error('REL_SKIP');
      }
  let query = supabase
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
        `);
      if (!opts?.includeArchived) {
        // Hide archived/inactive products from public lists
        query = (query as any).eq('is_active', true).is('archived_at', null);
      }
      const { data, error } = await (query as any).order('created_at', { ascending: false });

      if (!error && data) {
        hasRelations = true;
        return data.map((product: any) => ({
          ...product,
          isActive: product.is_active ?? product.isActive,
          archivedAt: product.archived_at ?? product.archivedAt,
          rentalOptions: product.rental_options || [],
          hasRental: product.has_rental ?? product.hasRental ?? ((product.rental_options || []).length > 0),
          tierData: product.tiers,
          gameTitleData: product.game_titles,
          tier: product.tiers?.slug as ProductTier,
          gameTitle: product.game_titles?.name || product.game_title
        }));
      }

      if (error && (error as any).message !== 'REL_SKIP') {
        console.warn('Products relational select failed, trying basic select');
      }
      let q2: any = supabase.from('products').select('*');
      if (!opts?.includeArchived) {
        q2 = q2.eq('is_active', true).is('archived_at', null);
      }
      const { data: basic, error: err2 } = await q2.order('created_at', { ascending: false });
      if (err2) {
        console.error('Supabase error (basic products):', err2);
        return sampleProducts;
      }
      hasRelations = false;
      // Fetch rental options separately
      let rentalsByProduct = new Map<string, any[]>();
      try {
        const ids = (basic || []).map((p: any) => p.id);
        if (ids.length) {
          const { data: ros } = await supabase.from('rental_options').select('*').in('product_id', ids);
          for (const ro of ros || []) {
            const arr = rentalsByProduct.get(ro.product_id) || [];
            arr.push(ro);
            rentalsByProduct.set(ro.product_id, arr);
          }
        }
      } catch {}
  return (basic || []).map((p: any) => ({
        ...p,
  isActive: p.is_active ?? p.isActive,
  archivedAt: p.archived_at ?? p.archivedAt,
        rentalOptions: rentalsByProduct.get(p.id) || [],
        hasRental: p.has_rental ?? p.hasRental ?? ((rentalsByProduct.get(p.id) || []).length > 0),
        gameTitle: p.game_title || p.gameTitle,
      }));
    } catch (error) {
      console.error('Error fetching products:', error);
      console.warn('Using sample data due to error');
      return sampleProducts;
    }
  }

  static async getProductById(id: string): Promise<Product | null> {
    try {
      console.log('[ProductService] getProductById called with id:', id, 'type:', typeof id);
      
      // Check if Supabase is configured
      if (!process.env.REACT_APP_SUPABASE_URL || !process.env.REACT_APP_SUPABASE_ANON_KEY) {
        console.warn('Supabase not configured, using sample data');
        const sample = sampleProducts.find(p => p.id === id) || null;
        console.log('[ProductService] Returning sample product:', sample?.id);
        return sample;
      }

  if (!supabase) {
    const sample = sampleProducts.find(p => p.id === id) || null;
    console.log('[ProductService] No supabase client, returning sample:', sample?.id);
    return sample;
  }

  

  const { data, error } = await supabase
        .from('products')
        .select(`*`)
        .eq('id', id)
        .maybeSingle(); // Use maybeSingle() instead of single() to avoid 406 errors

      if (error) {
        console.error('Supabase error fetching product by ID:', JSON.stringify(error, null, 2));
        const sample = sampleProducts.find(p => p.id === id) || null;
        console.log('[ProductService] Error fallback to sample:', sample?.id);
        return sample;
      }

      if (!data) {
        console.log('[ProductService] No product found for id:', id);
        return null;
      }
      
      console.log('[ProductService] Found product from DB:', { id: data.id, name: data.name, idType: typeof data.id });
      
  let rentalOptions: any[] = [];
      try {
        const { data: ro } = await supabase.from('rental_options').select('*').eq('product_id', id);
        rentalOptions = ro || [];
      } catch {}
      
      const result = { ...data, rentalOptions, hasRental: (data as any).has_rental ?? (data as any).hasRental ?? (rentalOptions.length > 0) } as any;
      console.log('[ProductService] Returning final product:', { id: result.id, name: result.name, idType: typeof result.id });
      return result;
    } catch (error) {
      console.error('Error fetching product:', error);
      const sample = sampleProducts.find(p => p.id === id) || null;
      console.log('[ProductService] Exception fallback to sample:', sample?.id);
      return sample;
    }
  }

  // Get related products based on same game title or tier, excluding current
  static async getRelatedProductsByProduct(base: Product, limit = 3): Promise<Product[]> {
    try {
      if (!process.env.REACT_APP_SUPABASE_URL || !process.env.REACT_APP_SUPABASE_ANON_KEY || !supabase) {
        const pool = sampleProducts.filter(p => p.id !== base.id && (p.gameTitleId === base.gameTitleId || p.tierId === base.tierId || p.gameTitle === base.gameTitle));
        return pool.slice(0, limit);
      }

      let q: any = supabase
        .from('products')
        .select('*')
        .neq('id', base.id)
        .eq('is_active', true)
        .is('archived_at', null)
        .order('created_at', { ascending: false })
        .limit(limit * 3);

      const hasGame = !!base.gameTitleId || !!base.gameTitle;
      const hasTier = !!base.tierId;
      if (hasGame && hasTier) {
        const parts: string[] = [];
        if (base.gameTitleId) parts.push(`game_title_id.eq.${base.gameTitleId}`);
        else if (base.gameTitle) parts.push(`game_title.ilike.%${base.gameTitle}%`);
        parts.push(`tier_id.eq.${base.tierId}`);
        q = q.or(parts.join(','));
      } else if (hasGame) {
        if (base.gameTitleId) q = q.eq('game_title_id', base.gameTitleId);
        else if (base.gameTitle) q = q.ilike('game_title', `%${base.gameTitle}%`);
      } else if (hasTier) {
        q = q.eq('tier_id', base.tierId);
      }

      const { data, error } = await q;
      if (error) {
        console.warn('getRelatedProductsByProduct error:', error);
        return [];
      }
      const list: Product[] = (data || []).map((p: any) => ({
        ...p,
        isActive: p.is_active ?? p.isActive,
        archivedAt: p.archived_at ?? p.archivedAt,
      }));
      const dedup: Product[] = [];
      const seen = new Set<string>();
      for (const p of list) {
        if (seen.has(p.id)) continue;
        seen.add(p.id);
        dedup.push(p);
        if (dedup.length >= limit) break;
      }
      return dedup.slice(0, limit);
    } catch (e) {
      console.warn('getRelatedProductsByProduct fallback:', e);
      const pool = sampleProducts.filter(p => p.id !== base.id);
      return pool.slice(0, limit);
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

      // If we already know join is unsupported, skip relational join
      if (hasFlashSaleJoin === false) {
        throw new Error('REL_SKIP');
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

      if (!error && data) {
        hasFlashSaleJoin = true;
      }

      if (error) {
        if ((error as any).message !== 'REL_SKIP') {
          console.warn('Flash sales relational select failed, trying basic');
        }
        const { data: basic, error: err2 } = await supabase
          .from('flash_sales')
          .select('*')
          .eq('is_active', true)
          .gte('end_time', new Date().toISOString());
        if (err2) {
          console.error('Supabase error:', err2);
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
        hasFlashSaleJoin = false;
        const ids = (basic || []).map((b: any) => b.product_id);
        const { data: prods } = await supabase.from('products').select('*').in('id', ids);
        // Best-effort fetch rental options to derive hasRental when has_rental column is absent
        let rentalsMap = new Map<string, number>();
        try {
          if (ids.length) {
            const { data: ros } = await supabase
              .from('rental_options')
              .select('id, product_id')
              .in('product_id', ids);
            for (const ro of ros || []) {
              rentalsMap.set(ro.product_id, (rentalsMap.get(ro.product_id) || 0) + 1);
            }
          }
        } catch {}
        const pmap = new Map((prods || []).map((p: any) => [p.id, p]));
        return (basic || []).map((sale: any) => {
          const raw = pmap.get(sale.product_id) || {};
          const product = { ...raw, hasRental: (raw as any).has_rental ?? (raw as any).hasRental ?? ((rentalsMap.get(sale.product_id) || 0) > 0) };
          return {
            id: sale.id,
            productId: sale.product_id,
            salePrice: sale.sale_price,
            originalPrice: sale.original_price,
            startTime: sale.start_time,
            endTime: sale.end_time,
            stock: sale.stock,
            isActive: sale.is_active,
            createdAt: sale.created_at,
            product,
          };
        });
      }

      // When relational join succeeds, also check rental options to infer hasRental if needed
      let rentalsMap = new Map<string, number>();
      try {
        const prodIds = (data || []).map((s: any) => s.product_id || s.productId || s.products?.id).filter(Boolean);
        if (prodIds.length) {
          const { data: ros } = await supabase
            .from('rental_options')
            .select('id, product_id')
            .in('product_id', prodIds);
          for (const ro of ros || []) {
            rentalsMap.set(ro.product_id, (rentalsMap.get(ro.product_id) || 0) + 1);
          }
        }
      } catch {}

      return data?.map((sale: any) => {
        const prod = sale.products || {};
        const gt = prod.game_titles;
        const tier = prod.tiers;
        const product = {
          ...prod,
          hasRental: prod.has_rental ?? prod.hasRental ?? ((rentalsMap.get(prod.id) || 0) > 0),
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

  // Flash Sale CRUD
  static async createFlashSale(sale: {
    product_id: string;
    sale_price: number;
    original_price?: number | null;
    start_time?: string | null;
    end_time: string;
    stock?: number | null;
    is_active?: boolean;
  }): Promise<any | null> {
    try {
      if (!supabase) return null;
      // Ensure NOT NULL columns are respected per initial schema
      const payload: any = { ...sale };
      if (!payload.start_time) payload.start_time = new Date().toISOString();
      if (!payload.original_price || Number(payload.original_price) <= 0) payload.original_price = Number(payload.sale_price);
      if (typeof payload.stock === 'undefined') payload.stock = 0;
      // Normalize date strings to ISO
      if (payload.start_time) payload.start_time = new Date(payload.start_time).toISOString();
      if (payload.end_time) payload.end_time = new Date(payload.end_time).toISOString();

      const { data, error } = await (supabase as any)
        .from('flash_sales')
        .insert([payload])
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (e) {
      console.error('Error creating flash sale:', e);
      return null;
    }
  }

  static async updateFlashSale(id: string, updates: Partial<{
    product_id: string;
    sale_price: number;
    original_price?: number | null;
    start_time?: string | null;
    end_time: string;
    stock?: number | null;
    is_active?: boolean;
  }>): Promise<any | null> {
    try {
      if (!supabase) return null;
      const payload: any = { ...updates };
      // Normalize date strings to ISO when provided
      if (payload.start_time) payload.start_time = new Date(payload.start_time).toISOString();
      if (payload.end_time) payload.end_time = new Date(payload.end_time).toISOString();
      Object.keys(payload).forEach(k => payload[k] === undefined && delete payload[k]);

      const { data, error } = await (supabase as any)
        .from('flash_sales')
        .update(payload)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (e) {
      console.error('Error updating flash sale:', e);
      return null;
    }
  }

  static async deleteFlashSale(id: string): Promise<boolean> {
    try {
      if (!supabase) return false;
      const { error } = await (supabase as any)
        .from('flash_sales')
        .delete()
        .eq('id', id);
      if (error) throw error;
      return true;
    } catch (e) {
      console.error('Error deleting flash sale:', e);
      return false;
    }
  }

  static async createProduct(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'> & Record<string, any>): Promise<Product | null> {
    try {
      console.log('🚀 ProductService.createProduct called with:', {
        ...product,
        // Mask sensitive fields
        accountDetails: product.accountDetails ? '[PRESENT]' : '[EMPTY]'
      });

      if (!supabase) {
        console.error('❌ Supabase client not available');
        return null;
      }

      const payload: any = {
        name: product.name,
        description: product.description,
        price: product.price,
        original_price: product.originalPrice ?? product.original_price ?? null,
        image: product.image,
        images: product.images ?? [],
        category: product.category ?? 'general', // Add default category
        account_level: product.accountLevel ?? product.account_level ?? null,
        account_details: product.accountDetails ?? product.account_details ?? null,
        is_flash_sale: product.isFlashSale ?? false,
        has_rental: product.hasRental ?? false,
        stock: product.stock ?? 1,
      };

      if (hasRelations === true) {
        payload.game_title_id = product.gameTitleId ?? product.game_title_id ?? null;
        payload.tier_id = product.tierId ?? product.tier_id ?? null;
        console.log('📊 Using relational schema with foreign keys');
        // Some deployments still require text column game_title (NOT NULL). Include when present.
        if (hasGameTitleText === true) {
          payload.game_title = product.gameTitle ?? (product as any).game_title ?? 'General';
        }
      } else {
        payload.game_title = product.gameTitle ?? product.game_title ?? null;
        console.log('📋 Using legacy schema with text fields');
      }

      console.log('💾 Final create payload:', payload);

      const { data, error } = await supabase.from('products').insert([payload]).select().single();

      if (error) {
        console.error('❌ Database insert error:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        });

        // Special handling for RLS policy errors
        if (error.code === '42501') {
          console.error('🔒 RLS Policy Error Detected!');
          console.error('💡 This indicates that Row Level Security policies are blocking the operation.');
          console.error('🔧 To fix this, the database administrator needs to update RLS policies.');
          console.error('📋 Required policies for products table:');
          console.error('   - Allow INSERT operations for admin users');
          console.error('   - Allow UPDATE operations for admin users');
          console.error('   - Allow DELETE operations for admin users');
          
          // Provide a user-friendly error message
          const rlsError = new Error('Database access denied. This requires administrator access to fix Row Level Security policies.');
          (rlsError as any).code = 'RLS_POLICY_ERROR';
          (rlsError as any).originalError = error;
          throw rlsError;
        }

        throw error;
      }

      console.log('✅ Product created successfully:', data?.id);
      return data;
    } catch (error) {
      console.error('💥 ProductService.createProduct error:', error);
      return null;
    }
  }

  static async updateProduct(id: string, updates: Partial<Product> & Record<string, any>): Promise<Product | null> {
    try {
      console.log('🚀 ProductService.updateProduct called with:', {
        id,
        updates: {
          ...updates,
          // Mask sensitive fields
          accountDetails: updates.accountDetails ? '[PRESENT]' : '[EMPTY]'
        }
      });

      if (!supabase) {
        console.error('❌ Supabase client not available');
        return null;
      }

      if (!isUuid(id)) {
        console.warn('❌ Refusing to update non-UUID id (likely sample data):', id);
        return null;
      }

      const payload: any = {
        name: updates.name,
        description: updates.description,
        price: updates.price,
        original_price: (updates as any).original_price ?? updates.originalPrice,
        image: (updates as any).image,
        images: (updates as any).images,
        category: (updates as any).category ?? 'general', // Add default category for updates
        account_level: (updates as any).account_level ?? updates.accountLevel,
        account_details: (updates as any).account_details ?? updates.accountDetails,
        is_flash_sale: (updates as any).is_flash_sale ?? updates.isFlashSale,
        has_rental: (updates as any).has_rental ?? updates.hasRental,
        stock: (updates as any).stock ?? updates.stock,
      };

      if (hasRelations === true) {
        payload.game_title_id = (updates as any).game_title_id ?? updates.gameTitleId ?? null;
        payload.tier_id = (updates as any).tier_id ?? updates.tierId ?? null;
        console.log('📊 Using relational schema with foreign keys');
        // Also set text game_title if column exists
        if (hasGameTitleText === true) {
          payload.game_title = (updates as any).game_title ?? updates.gameTitle ?? 'General';
        }
      } else {
        payload.game_title = (updates as any).game_title ?? updates.gameTitle ?? null;
        console.log('📋 Using legacy schema with text fields');
      }

      // Remove undefined values to prevent database issues
      Object.keys(payload).forEach(k => {
        if (payload[k] === undefined) {
          delete payload[k];
        }
      });

      console.log('💾 Final update payload:', payload);

      const { data, error } = await supabase.from('products').update(payload).eq('id', id).select().single();

      if (error) {
        console.error('❌ Database update error:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
          payload: payload
        });
        throw error;
      }

      console.log('✅ Product updated successfully:', data?.id);
      return data;
    } catch (error) {
      console.error('💥 ProductService.updateProduct error:', error);
      return null;
    }
  }

  static async deleteProduct(id: string, options?: { images?: string[] }): Promise<boolean> {
    try {
  if (!supabase) return false;
  if (!isUuid(id)) {
    console.warn('Refusing to delete non-UUID id (likely sample data):', id);
    return false;
  }
  // Best-effort cleanup of dependent records to avoid FK constraint errors on delete
  try {
    // Some deployments don't have ON DELETE CASCADE on these tables
    await (supabase as any).from('rental_options').delete().eq('product_id', id);
  } catch (_) {}
  try {
    await (supabase as any).from('flash_sales').delete().eq('product_id', id);
  } catch (_) {}
  try {
    // Orders usually reference product_id without cascade; set to NULL to keep order history
    await (supabase as any).from('orders').update({ product_id: null }).eq('product_id', id);
  } catch (_) {}

  const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;
      // Best-effort delete related images from storage when provided
      if (options?.images && options.images.length) {
        try { await deletePublicUrls(options.images); } catch (_) {}
      }
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

      return data?.map(gameTitle => {
        // Get logo URL - prefer new logo_path with public URL, fallback to legacy logo_url
        let logoUrl = gameTitle.logo_url; // Legacy URL fallback
        
        if (gameTitle.logo_path) {
          // Convert storage path to public URL
          try {
            const { data: urlData } = (supabase as any).storage
              .from('game-logos')
              .getPublicUrl(gameTitle.logo_path);
            logoUrl = urlData.publicUrl;
          } catch (error) {
            console.warn('Failed to get public URL for logo_path:', gameTitle.logo_path);
            // Keep legacy logo_url as fallback
          }
        }

        return {
          ...gameTitle,
          isPopular: gameTitle.is_popular,
          isActive: gameTitle.is_active,
          sortOrder: gameTitle.sort_order,
          logoUrl,
          createdAt: gameTitle.created_at,
          updatedAt: gameTitle.updated_at
        };
      }) || sampleGameTitles;
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

  // Popular games with product counts for the Home page carousel
  static async getPopularGames(limit: number = 12): Promise<Array<{ id: string; name: string; slug: string; logoUrl?: string | null; count: number }>> {
    try {
      const cacheKey = `popularGames:${limit}`;
      const cached = this.getFromCache<Array<{ id: string; name: string; slug: string; logoUrl?: string | null; count: number }>>(cacheKey);
      if (cached) {
        // Background revalidation
        const existing = (this as any).cache.get(cacheKey);
        if (!existing?.inflight) {
          const inflight = (async () => {
            const fresh = await this.getPopularGamesInternal(limit);
            if (fresh?.length) this.setCache(cacheKey, fresh, 60_000); // 60s TTL
            (this as any).cache.set(cacheKey, { ...((this as any).cache.get(cacheKey) || {}), inflight: undefined });
          })();
          this.setInflight(cacheKey, inflight);
        }
        return cached;
      }

      const existing = (this as any).cache.get(cacheKey);
      if (existing?.inflight) {
        await existing.inflight;
        const post = this.getFromCache<typeof cached>(cacheKey);
        if (post) return post as any;
      }

      const inflight = this.getPopularGamesInternal(limit);
      this.setInflight(cacheKey, inflight);
      const fresh = await inflight;
      if (fresh?.length) this.setCache(cacheKey, fresh, 60_000);
      (this as any).cache.set(cacheKey, { ...((this as any).cache.get(cacheKey) || {}), inflight: undefined });
      return fresh;
    } catch (error) {
      console.error('Error fetching popular games:', error);
      return [];
    }
  }

  private static async getPopularGamesInternal(limit: number) {
    try {
      // Fallback to sample data when Supabase isn't configured
      if (!process.env.REACT_APP_SUPABASE_URL || !process.env.REACT_APP_SUPABASE_ANON_KEY || !supabase) {
        const counts = new Map<string, number>();
        for (const p of sampleProducts) {
          const key = p.gameTitle || p.gameTitleData?.name || 'Lainnya';
          counts.set(key, (counts.get(key) || 0) + 1);
        }
        const items = sampleGameTitles.map(gt => ({
          id: gt.id,
          name: gt.name,
          slug: gt.slug,
          logoUrl: (gt as any).logoUrl,
          count: counts.get(gt.name) || 0,
        })).filter(i => i.count > 0)
          .sort((a, b) => b.count - a.count)
          .slice(0, limit);
        return items;
      }

      // Load active game titles
      const { data: games, error: gErr } = await supabase
        .from('game_titles')
        .select('id, name, slug, logo_url, logo_path, is_active')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });
      if (gErr) throw gErr;

      const list = (games || []).map(g => {
        // Get logo URL - prefer new logo_path with public URL, fallback to legacy logo_url
        let logoUrl = g.logo_url; // Legacy URL fallback
        
        if (g.logo_path) {
          // Convert storage path to public URL
          try {
            const { data: urlData } = (supabase as any).storage
              .from('game-logos')
              .getPublicUrl(g.logo_path);
            logoUrl = urlData.publicUrl;
          } catch (error) {
            console.warn('Failed to get public URL for logo_path:', g.logo_path);
            // Keep legacy logo_url as fallback
          }
        }

        return { 
          id: g.id as string, 
          name: g.name as string, 
          slug: g.slug as string, 
          logoUrl 
        };
      });
      if (list.length === 0) return [];

      // Capability check: if relational schema is unknown, try detect quickly
      if (hasRelations === null) {
        try {
          const { error } = await supabase.from('products').select('game_title_id').limit(1);
          hasRelations = !error;
        } catch { hasRelations = false; }
      }

      // Count products per game (N queries; game titles expected to be small)
      const counts = await Promise.all(list.map(async (g) => {
        try {
          if (hasRelations) {
            const { count } = await (supabase as any)
              .from('products')
              .select('id', { count: 'exact', head: true })
              .eq('game_title_id', g.id);
            return { ...g, count: count || 0 };
          } else {
            const { count } = await (supabase as any)
              .from('products')
              .select('id', { count: 'exact', head: true })
              .eq('game_title', g.name);
            return { ...g, count: count || 0 };
          }
        } catch {
          return { ...g, count: 0 };
        }
      }));

  return counts
        .filter(item => item.count > 0)
        .sort((a, b) => b.count - a.count)
        .slice(0, limit);
    } catch (error) {
      console.error('Error fetching popular games:', error);
      return [];
    }
  }
}
