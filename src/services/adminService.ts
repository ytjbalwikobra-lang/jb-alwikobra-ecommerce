import { createClient } from '@supabase/supabase-js';

// Admin service with elevated permissions for CRUD operations
class AdminService {
  private adminClient: any = null;
  private static instance: AdminService | null = null;
  // Lightweight in-memory cache (SWR-style)
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

  private constructor() {
    this.initializeAdminClient();
  }

  public static getInstance(): AdminService {
    if (!AdminService.instance) {
      AdminService.instance = new AdminService();
    }
    return AdminService.instance;
  }

  private initializeAdminClient() {
    // Prevent multiple initialization
    if (this.adminClient) {
      return;
    }

    const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
    const serviceRoleKey = process.env.REACT_APP_SUPABASE_SERVICE_ROLE_KEY;

    if (supabaseUrl && serviceRoleKey) {
    this.adminClient = createClient(supabaseUrl, serviceRoleKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
          detectSessionInUrl: false,
      flowType: 'implicit',
      storageKey: 'supabase-admin-service'
        },
        global: {
          headers: {
            'X-Client-Info': 'admin-service'
          }
        }
      });
      console.log('✅ AdminService: Initialized with service role');
    } else {
      console.warn('⚠️ Admin service requires REACT_APP_SUPABASE_SERVICE_ROLE_KEY environment variable');
      console.warn('⚠️ Admin functionality will be limited without service role key');
      // Set to null explicitly to prevent any undefined behavior
      this.adminClient = null;
    }
  }

  private isAdminClient(): boolean {
    return this.adminClient !== null;
  }

  // Product CRUD operations with admin privileges
  async createProduct(productData: any): Promise<{ data: any; error: any }> {
    if (!this.isAdminClient()) {
      return { 
        data: null, 
        error: { message: 'Admin client not available. Service role key required.' }
      };
    }

    try {
      const payload = {
        name: productData.name,
        description: productData.description,
        price: productData.price,
        original_price: productData.originalPrice ?? productData.original_price ?? null,
        image: productData.image || '',
        images: productData.images || [],
        category: productData.category || 'general',
        account_level: productData.accountLevel ?? productData.account_level ?? null,
        account_details: productData.accountDetails ?? productData.account_details ?? null,
        is_flash_sale: productData.isFlashSale ?? false,
        has_rental: productData.hasRental ?? false,
        stock: productData.stock ?? 1,
        game_title_id: productData.gameTitleId ?? productData.game_title_id ?? null,
        tier_id: productData.tierId ?? productData.tier_id ?? null,
        game_title: productData.gameTitle ?? productData.game_title ?? null
      };

      console.log('🔧 AdminService: Creating product with payload:', payload);

      const { data, error } = await this.adminClient
        .from('products')
        .insert([payload])
        .select()
        .single();

      if (error) {
        console.error('❌ AdminService: Product creation error:', error);
        return { data: null, error };
      }

      console.log('✅ AdminService: Product created successfully:', data?.id);
      return { data, error: null };

    } catch (error) {
      console.error('💥 AdminService: Unexpected error:', error);
      return { data: null, error };
    }
  }

  async updateProduct(id: string, updates: any): Promise<{ data: any; error: any }> {
    if (!this.isAdminClient()) {
      return { 
        data: null, 
        error: { message: 'Admin client not available. Service role key required.' }
      };
    }

    try {
      const payload: any = {};
      
      // Map frontend fields to database fields
      if (updates.name !== undefined) payload.name = updates.name;
      if (updates.description !== undefined) payload.description = updates.description;
      if (updates.price !== undefined) payload.price = updates.price;
      if (updates.originalPrice !== undefined) payload.original_price = updates.originalPrice;
      if (updates.original_price !== undefined) payload.original_price = updates.original_price;
      if (updates.image !== undefined) payload.image = updates.image;
      if (updates.images !== undefined) payload.images = updates.images;
      if (updates.category !== undefined) payload.category = updates.category;
      if (updates.accountLevel !== undefined) payload.account_level = updates.accountLevel;
      if (updates.account_level !== undefined) payload.account_level = updates.account_level;
      if (updates.accountDetails !== undefined) payload.account_details = updates.accountDetails;
      if (updates.account_details !== undefined) payload.account_details = updates.account_details;
      if (updates.isFlashSale !== undefined) payload.is_flash_sale = updates.isFlashSale;
      if (updates.is_flash_sale !== undefined) payload.is_flash_sale = updates.is_flash_sale;
      if (updates.hasRental !== undefined) payload.has_rental = updates.hasRental;
      if (updates.has_rental !== undefined) payload.has_rental = updates.has_rental;
      if (updates.stock !== undefined) payload.stock = updates.stock;
      if (updates.gameTitleId !== undefined) payload.game_title_id = updates.gameTitleId;
      if (updates.game_title_id !== undefined) payload.game_title_id = updates.game_title_id;
      if (updates.tierId !== undefined) payload.tier_id = updates.tierId;
      if (updates.tier_id !== undefined) payload.tier_id = updates.tier_id;
      if (updates.gameTitle !== undefined) payload.game_title = updates.gameTitle;
      if (updates.game_title !== undefined) payload.game_title = updates.game_title;

      console.log('🔧 AdminService: Updating product with payload:', payload);

      const { data, error } = await this.adminClient
        .from('products')
        .update(payload)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('❌ AdminService: Product update error:', error);
        return { data: null, error };
      }

      console.log('✅ AdminService: Product updated successfully:', data?.id);
      return { data, error: null };

    } catch (error) {
      console.error('💥 AdminService: Unexpected error:', error);
      return { data: null, error };
    }
  }

  async deleteProduct(id: string): Promise<{ success: boolean; error: any; archived?: boolean }> {
    if (!this.isAdminClient()) {
      return { 
        success: false, 
        error: { message: 'Admin client not available. Service role key required.' }
      };
    }

    try {
      console.log('🔧 AdminService: Deleting product:', id);

      // First delete related rental options
      await this.adminClient
        .from('rental_options')
        .delete()
        .eq('product_id', id);

      // Then delete related flash sales
      await this.adminClient
        .from('flash_sales')
        .delete()
        .eq('product_id', id);

      // Then delete the product
      const { error } = await this.adminClient
        .from('products')
        .delete()
        .eq('id', id);

      if (error) {
        // Handle FK conflict (e.g., orders referencing product): fallback to archive
        if ((error as any).code === '409' || (error as any).message?.includes('foreign key')) {
          console.warn('⚠️ AdminService: FK conflict deleting product, archiving instead');
          const { error: upErr } = await this.adminClient
            .from('products')
            .update({ is_active: false, archived_at: new Date().toISOString() })
            .eq('id', id);
          if (upErr) {
            console.error('❌ AdminService: Archive fallback failed:', upErr);
            return { success: false, error: upErr };
          }
          return { success: true, error: null, archived: true };
        }
        console.error('❌ AdminService: Product deletion error:', error);
        return { success: false, error };
      }

      console.log('✅ AdminService: Product deleted successfully:', id);
      return { success: true, error: null };

    } catch (error) {
      console.error('💥 AdminService: Unexpected error:', error);
      return { success: false, error };
    }
  }

  // Flash sale operations
  async createFlashSale(flashSaleData: any): Promise<{ data: any; error: any }> {
    if (!this.isAdminClient()) {
      return { 
        data: null, 
        error: { message: 'Admin client not available. Service role key required.' }
      };
    }

    try {
      const payload = {
        product_id: flashSaleData.product_id,
        sale_price: flashSaleData.sale_price,
        original_price: flashSaleData.original_price ?? null,
        start_time: flashSaleData.start_time ? new Date(flashSaleData.start_time).toISOString() : null,
        end_time: flashSaleData.end_time ? new Date(flashSaleData.end_time).toISOString() : null,
        stock: flashSaleData.stock ?? null,
        is_active: flashSaleData.is_active ?? true
      };

      console.log('🔧 AdminService: Creating flash sale with payload:', payload);

      const { data, error } = await this.adminClient
        .from('flash_sales')
        .insert([payload])
        .select()
        .single();

      if (error) {
        console.error('❌ AdminService: Flash sale creation error:', error);
        return { data: null, error };
      }

      console.log('✅ AdminService: Flash sale created successfully:', data?.id);
      return { data, error: null };

    } catch (error) {
      console.error('💥 AdminService: Unexpected error:', error);
      return { data: null, error };
    }
  }

  async updateFlashSale(id: string, updates: any): Promise<{ data: any; error: any }> {
    if (!this.isAdminClient()) {
      return {
        data: null,
        error: { message: 'Admin client not available. Service role key required.' }
      };
    }

    try {
      const payload: any = { ...updates };
      // Normalize dates if provided
      if (payload.start_time) payload.start_time = new Date(payload.start_time).toISOString();
      if (payload.end_time) payload.end_time = new Date(payload.end_time).toISOString();
      Object.keys(payload).forEach(k => payload[k] === undefined && delete payload[k]);

      const { data, error } = await this.adminClient
        .from('flash_sales')
        .update(payload)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('❌ AdminService: Flash sale update error:', error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      console.error('💥 AdminService: Unexpected error:', error);
      return { data: null, error } as any;
    }
  }

  async deleteFlashSale(id: string): Promise<{ success: boolean; error: any }> {
    if (!this.isAdminClient()) {
      return {
        success: false,
        error: { message: 'Admin client not available. Service role key required.' }
      };
    }

    try {
      const { error } = await this.adminClient
        .from('flash_sales')
        .delete()
        .eq('id', id);
      if (error) {
        console.error('❌ AdminService: Flash sale delete error:', error);
        return { success: false, error };
      }
      return { success: true, error: null };
    } catch (error) {
      console.error('💥 AdminService: Unexpected error:', error);
      return { success: false, error } as any;
    }
  }

  async getFlashSales(options: { onlyActive?: boolean; notEndedOnly?: boolean } = {}): Promise<{ data: any[]; error: any }>{
    if (!this.isAdminClient()) {
      return { data: [], error: { message: 'Admin client not available. Service role key required.' } };
    }
    try {
      const key = `flashSales:${JSON.stringify({ onlyActive: options.onlyActive !== false, notEndedOnly: options.notEndedOnly !== false })}`;
      const cached = AdminService.getFromCache<{ data: any[]; error: any }>(key);
      if (cached && cached.data && cached.error == null) {
        // Background revalidate (SWR)
        const existing = (AdminService as any).cache.get(key);
        if (!existing?.inflight) {
          const inflight = (async () => {
            const fresh = await this.fetchFlashSalesInternal(options);
            if (fresh && !fresh.error) AdminService.setCache(key, fresh, 30_000); // 30s TTL
            (AdminService as any).cache.set(key, { ...((AdminService as any).cache.get(key) || {}), inflight: undefined });
          })();
          AdminService.setInflight(key, inflight);
        }
        return cached;
      }

      // If there's an in-flight request, await it; else fetch fresh
      const existing = (AdminService as any).cache.get(key);
      if (existing?.inflight) {
        await existing.inflight;
        const post = AdminService.getFromCache<{ data: any[]; error: any }>(key);
        if (post) return post;
      }

      const fetchP = this.fetchFlashSalesInternal(options);
      AdminService.setInflight(key, fetchP);
      const fresh = await fetchP;
      if (!fresh.error) AdminService.setCache(key, fresh, 30_000);
      (AdminService as any).cache.set(key, { ...((AdminService as any).cache.get(key) || {}), inflight: undefined });
      return fresh;
    } catch (error) {
      console.error('💥 AdminService: Unexpected error:', error);
      return { data: [], error } as any;
    }
  }

  // Internal fetcher for flash sales (no cache)
  private async fetchFlashSalesInternal(options: { onlyActive?: boolean; notEndedOnly?: boolean } = {}) {
    try {
      const { onlyActive = true, notEndedOnly = true } = options;
      let query = this.adminClient
        .from('flash_sales')
        .select(`
          id, product_id, sale_price, original_price, start_time, end_time, stock, is_active, created_at,
          products (
            id, name, description, price, original_price, image, images, category,
            game_title, game_title_id, tier_id, account_level, account_details,
            has_rental, stock, is_active, archived_at, created_at, updated_at,
            game_titles:game_title_id ( id, name, slug, logo_url ),
            tiers:tier_id ( id, name, slug, color, background_gradient, icon )
          )
        `)
        .order('created_at', { ascending: false });

      if (onlyActive) {
        query = query.eq('is_active', true);
      }
      if (notEndedOnly) {
        query = query.gte('end_time', new Date().toISOString());
      }

      const { data, error } = await query;
      if (!error) {
        const mapped = (data || []).map((row: any) => {
          const p = row.products;
          const gt = p?.game_titles;
          const tr = p?.tiers;
          // Build enriched product with sale overlay
          const product = p ? {
            id: p.id,
            name: p.name,
            description: p.description || '',
            // Overlay sale price while preserving original
            price: row.sale_price ?? p.price,
            originalPrice: (row.original_price ?? p.original_price ?? p.price) || null,
            image: p.image || '',
            images: Array.isArray(p.images) ? p.images : (p.images ? [p.images] : []),
            category: p.category || 'general',
            gameTitle: p.game_title || (gt?.name || ''),
            tier: undefined,
            tierId: p.tier_id || undefined,
            gameTitleId: p.game_title_id || undefined,
            tierData: tr ? {
              id: tr.id,
              name: tr.name,
              slug: tr.slug,
              color: tr.color,
              backgroundGradient: tr.background_gradient,
              icon: tr.icon,
              description: undefined,
              borderColor: undefined,
              priceRangeMin: undefined,
              priceRangeMax: undefined,
              isActive: true,
              sortOrder: 0,
              createdAt: '',
              updatedAt: ''
            } : undefined,
            gameTitleData: gt ? {
              id: gt.id,
              name: gt.name,
              slug: gt.slug,
              icon: '',
              color: '',
              logoUrl: gt.logo_url || undefined,
              isPopular: false,
              isActive: true,
              sortOrder: 0,
              createdAt: '',
              updatedAt: ''
            } : undefined,
            accountLevel: p.account_level || undefined,
            accountDetails: p.account_details || undefined,
            isFlashSale: true,
            flashSaleEndTime: row.end_time,
            hasRental: p.has_rental ?? false,
            rentalOptions: [],
            stock: p.stock ?? 0,
            isActive: p.is_active ?? true,
            archivedAt: p.archived_at ?? null,
            createdAt: p.created_at,
            updatedAt: p.updated_at
          } : undefined;

          return {
            id: row.id,
            productId: row.product_id,
            salePrice: row.sale_price,
            originalPrice: row.original_price,
            startTime: row.start_time,
            endTime: row.end_time,
            stock: row.stock,
            isActive: row.is_active,
            createdAt: row.created_at,
            product
          };
        });
  return { data: mapped, error: null };
      }

      // Fallback when join not available: fetch base rows and hydrate product names
      console.warn('⚠️ Falling back to basic flash_sales select (no join):', error?.message);
      let basic = this.adminClient
        .from('flash_sales')
        .select('id, product_id, sale_price, original_price, start_time, end_time, stock, is_active, created_at')
        .order('created_at', { ascending: false });
      if (options.onlyActive) basic = basic.eq('is_active', true);
      if (options.notEndedOnly) basic = basic.gte('end_time', new Date().toISOString());
      const { data: rows, error: basicErr } = await basic;
      if (basicErr) {
        console.error('❌ AdminService: basic getFlashSales error:', basicErr);
        return { data: [], error: basicErr };
      }
      const ids = (rows || []).map((r: any) => r.product_id).filter(Boolean);
      // Hydrate full product rows for cards
      let productMap = new Map<string, any>();
      if (ids.length) {
        try {
          const { data: prods } = await this.adminClient
            .from('products')
            .select(`
              id, name, description, price, original_price, image, images, category,
              game_title, game_title_id, tier_id, account_level, account_details,
              has_rental, stock, is_active, archived_at, created_at, updated_at,
              game_titles:game_title_id ( id, name, slug, logo_url ),
              tiers:tier_id ( id, name, slug, color, background_gradient, icon )
            `)
            .in('id', ids);
          for (const p of prods || []) productMap.set(p.id, p);
        } catch {}
      }
      const mapped = (rows || []).map((row: any) => {
        const p = productMap.get(row.product_id);
        const gt = p?.game_titles;
        const tr = p?.tiers;
        const product = p ? {
          id: p.id,
          name: p.name,
          description: p.description || '',
          price: row.sale_price ?? p.price,
          originalPrice: (row.original_price ?? p.original_price ?? p.price) || null,
          image: p.image || '',
          images: Array.isArray(p.images) ? p.images : (p.images ? [p.images] : []),
          category: p.category || 'general',
          gameTitle: p.game_title || (gt?.name || ''),
          tier: undefined,
          tierId: p.tier_id || undefined,
          gameTitleId: p.game_title_id || undefined,
          tierData: tr ? {
            id: tr.id,
            name: tr.name,
            slug: tr.slug,
            color: tr.color,
            backgroundGradient: tr.background_gradient,
            icon: tr.icon,
            description: undefined,
            borderColor: undefined,
            priceRangeMin: undefined,
            priceRangeMax: undefined,
            isActive: true,
            sortOrder: 0,
            createdAt: '',
            updatedAt: ''
          } : undefined,
          gameTitleData: gt ? {
            id: gt.id,
            name: gt.name,
            slug: gt.slug,
            icon: '',
            color: '',
            logoUrl: gt.logo_url || undefined,
            isPopular: false,
            isActive: true,
            sortOrder: 0,
            createdAt: '',
            updatedAt: ''
          } : undefined,
          accountLevel: p.account_level || undefined,
          accountDetails: p.account_details || undefined,
          isFlashSale: true,
          flashSaleEndTime: row.end_time,
          hasRental: p.has_rental ?? false,
          rentalOptions: [],
          stock: p.stock ?? 0,
          isActive: p.is_active ?? true,
          archivedAt: p.archived_at ?? null,
          createdAt: p.created_at,
          updatedAt: p.updated_at
        } : undefined;

        return {
          id: row.id,
          productId: row.product_id,
          salePrice: row.sale_price,
          originalPrice: row.original_price,
          startTime: row.start_time,
          endTime: row.end_time,
          stock: row.stock,
          isActive: row.is_active,
          createdAt: row.created_at,
          product
        };
      });
      return { data: mapped, error: null };
    } catch (error) {
      console.error('💥 AdminService: Unexpected error:', error);
      return { data: [], error } as any;
    }
  }

  // Image upload with admin privileges
  async uploadImage(file: File, path: string): Promise<{ data: any; error: any }> {
    if (!this.isAdminClient()) {
      return { 
        data: null, 
        error: { message: 'Admin client not available. Service role key required.' }
      };
    }

    try {
      console.log('🔧 AdminService: Uploading image:', path);

      const { data, error } = await this.adminClient.storage
        .from('product-images')
        .upload(path, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('❌ AdminService: Image upload error:', error);
        return { data: null, error };
      }

      // Get public URL
      const { data: urlData } = this.adminClient.storage
        .from('product-images')
        .getPublicUrl(path);

      console.log('✅ AdminService: Image uploaded successfully:', urlData.publicUrl);
      return { data: { ...data, publicUrl: urlData.publicUrl }, error: null };

    } catch (error) {
      console.error('💥 AdminService: Unexpected error:', error);
      return { data: null, error };
    }
  }

  // --- Lookup helpers ---
  async getGameTitles(): Promise<{ data: any[]; error: any }> {
    if (!this.isAdminClient()) {
      return { data: [], error: { message: 'Admin client not available. Service role key required.' } };
    }
    try {
      const { data, error } = await this.adminClient
        .from('game_titles')
  .select('id, name, slug, icon, color, logo_url, logo_path, is_popular, is_active, sort_order, created_at, updated_at')
        .order('name');
      if (error) return { data: [], error };
      return { data: data || [], error: null };
    } catch (error) {
      return { data: [], error } as any;
    }
  }

  async getTiers(): Promise<{ data: any[]; error: any }> {
    if (!this.isAdminClient()) {
      return { data: [], error: { message: 'Admin client not available. Service role key required.' } };
    }
    try {
      const { data, error } = await this.adminClient
        .from('tiers')
        .select('id, name, slug, description, color')
        .order('name');
      if (error) return { data: [], error };
      return { data: data || [], error: null };
    } catch (error) {
      return { data: [], error } as any;
    }
  }

  // Rental options helpers
  async getRentalOptions(productId: string): Promise<{ data: any[]; error: any }> {
    if (!this.isAdminClient()) {
      return { data: [], error: { message: 'Admin client not available. Service role key required.' } };
    }
    try {
      const { data, error } = await this.adminClient
        .from('rental_options')
        .select('id, duration, price, description')
        .eq('product_id', productId)
        .order('price', { ascending: true });
      if (error) return { data: [], error };
      return { data: data || [], error: null };
    } catch (error) {
      return { data: [], error } as any;
    }
  }

  async saveRentalOptions(productId: string, options: Array<{ duration: string; price: number; description?: string }>): Promise<{ success: boolean; error: any }> {
    if (!this.isAdminClient()) {
      return { success: false, error: { message: 'Admin client not available. Service role key required.' } };
    }
    try {
      // Replace strategy: delete then insert
      await this.adminClient.from('rental_options').delete().eq('product_id', productId);
      if (!options || options.length === 0) return { success: true, error: null };
      const payload = options.slice(0, 4).map(o => ({
        product_id: productId,
        duration: o.duration,
        price: o.price,
        description: o.description ?? null
      }));
      const { error } = await this.adminClient.from('rental_options').insert(payload);
      if (error) return { success: false, error };
      return { success: true, error: null };
    } catch (error) {
      return { success: false, error } as any;
    }
  }

  // --- Game Titles CRUD ---
  async createGameTitle(payload: any): Promise<{ data: any; error: any }> {
    if (!this.isAdminClient()) {
      return { data: null, error: { message: 'Admin client not available. Service role key required.' } };
    }
    try {
      const { data, error } = await this.adminClient
        .from('game_titles')
        .insert(payload)
        .select()
        .single();
      if (error) return { data: null, error };
      return { data, error: null };
    } catch (error) {
      return { data: null, error } as any;
    }
  }

  async updateGameTitle(id: string, payload: any): Promise<{ data: any; error: any }> {
    if (!this.isAdminClient()) {
      return { data: null, error: { message: 'Admin client not available. Service role key required.' } };
    }
    try {
      const { data, error } = await this.adminClient
        .from('game_titles')
        .update(payload)
        .eq('id', id)
        .select()
        .single();
      if (error) return { data: null, error };
      return { data, error: null };
    } catch (error) {
      return { data: null, error } as any;
    }
  }

  async deleteGameTitle(id: string): Promise<{ success: boolean; error: any }> {
    if (!this.isAdminClient()) {
      return { success: false, error: { message: 'Admin client not available. Service role key required.' } };
    }
    try {
      const { error } = await this.adminClient
        .from('game_titles')
        .delete()
        .eq('id', id);
      if (error) return { success: false, error };
      return { success: true, error: null };
    } catch (error) {
      return { success: false, error } as any;
    }
  }

  // --- Website Settings ---
  private getStorageBucket(): string {
    return process.env.REACT_APP_SUPABASE_STORAGE_BUCKET || 'product-images';
  }

  private async uploadSettingsAsset(file: File, kind: 'logo' | 'favicon'): Promise<string | null> {
    // Uploads to <bucket>/settings/
    try {
      const bucket = this.getStorageBucket();
      const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const safeName = file.name.replace(/[^a-zA-Z0-9-_\.]/g, '_');
      const path = `settings/${Date.now()}_${Math.random().toString(36).slice(2)}_${kind}.${ext}`;
      const { error } = await this.adminClient.storage.from(bucket).upload(path, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type || `image/${ext}`
      });
      if (error) throw error;
      const { data } = this.adminClient.storage.from(bucket).getPublicUrl(path);
      return data?.publicUrl || null;
    } catch (e) {
      console.error('AdminService.uploadSettingsAsset error:', e);
      return null;
    }
  }

  async getWebsiteSettings(): Promise<{ data: any | null; error: any }> {
    if (!this.isAdminClient()) {
      return { data: null, error: { message: 'Admin client not available. Service role key required.' } };
    }
    try {
      const { data, error } = await this.adminClient
        .from('website_settings')
        .select('*')
        .limit(1)
        .maybeSingle();
      if (error) return { data: null, error };
      return { data, error: null };
    } catch (error) {
      return { data: null, error } as any;
    }
  }

  async upsertWebsiteSettings(input: {
    siteName?: string;
    contactEmail?: string;
    contactPhone?: string;
    whatsappNumber?: string;
    address?: string;
    facebookUrl?: string;
    instagramUrl?: string;
    tiktokUrl?: string;
    youtubeUrl?: string;
    heroTitle?: string;
    heroSubtitle?: string;
    logoFile?: File | null;
    faviconFile?: File | null;
    logoUrl?: string | null;
    faviconUrl?: string | null;
  }): Promise<{ success: boolean; error: any; data?: any }> {
    if (!this.isAdminClient()) {
      return { success: false, error: { message: 'Admin client not available. Service role key required.' } };
    }
    try {
      const current = await this.getWebsiteSettings();
      const payload: any = {
        site_name: input.siteName ?? current.data?.site_name ?? null,
        contact_email: input.contactEmail ?? current.data?.contact_email ?? null,
        contact_phone: input.contactPhone ?? current.data?.contact_phone ?? null,
        whatsapp_number: input.whatsappNumber ?? current.data?.whatsapp_number ?? null,
        address: input.address ?? current.data?.address ?? null,
        facebook_url: input.facebookUrl ?? current.data?.facebook_url ?? null,
        instagram_url: input.instagramUrl ?? current.data?.instagram_url ?? null,
        tiktok_url: input.tiktokUrl ?? current.data?.tiktok_url ?? null,
        youtube_url: input.youtubeUrl ?? current.data?.youtube_url ?? null,
        hero_title: input.heroTitle ?? current.data?.hero_title ?? null,
        hero_subtitle: input.heroSubtitle ?? current.data?.hero_subtitle ?? null,
      };

      // Handle uploads first
      if (input.logoFile instanceof File) {
        const url = await this.uploadSettingsAsset(input.logoFile, 'logo');
        if (url) payload.logo_url = url;
      } else if (input.logoUrl !== undefined) {
        payload.logo_url = input.logoUrl;
      }

      if (input.faviconFile instanceof File) {
        const url = await this.uploadSettingsAsset(input.faviconFile, 'favicon');
        if (url) payload.favicon_url = url;
      } else if (input.faviconUrl !== undefined) {
        payload.favicon_url = input.faviconUrl;
      }

      let data: any = null;
      let error: any = null;
      // If a settings row exists, update it; otherwise insert one
      const existingId = current?.data?.id as string | undefined;
      if (existingId) {
        const resp = await this.adminClient
          .from('website_settings')
          .update(payload)
          .eq('id', existingId)
          .select()
          .single();
        data = resp.data;
        error = resp.error;
      } else {
        const resp = await this.adminClient
          .from('website_settings')
          .insert(payload)
          .select()
          .single();
        data = resp.data;
        error = resp.error;
      }
      if (error) return { success: false, error };
      return { success: true, error: null, data };
    } catch (error) {
      return { success: false, error } as any;
    }
  }

  // Product retrieval with filtering and pagination
  async getProducts(options: {
    page?: number;
    perPage?: number;
    search?: string;
    category?: string;
    gameTitle?: string; // legacy text filter
    gameTitleId?: string; // preferred FK filter
    status?: string; // 'active' | 'archived' | 'inactive'
  } = {}): Promise<{ data: any[] | null; error: any; count?: number }> {
    if (!this.isAdminClient()) {
      return { 
        data: null, 
        error: { message: 'Admin client not available. Service role key required.' }
      };
    }

    try {
      const {
        page = 1,
        perPage = 10,
        search = '',
        category = '',
  gameTitle = '',
  gameTitleId = '',
  status = ''
      } = options;

      let query = this.adminClient
        .from('products')
        .select(`
          *,
          game_titles:game_title_id ( id, name ),
          tiers:tier_id ( id, name )
        `, { count: 'exact' });

      // Apply filters
      if (search.trim()) {
        query = query.ilike('name', `%${search.trim()}%`);
      }

      if (category.trim()) {
        query = query.eq('category', category.trim());
      }

      if (gameTitleId.trim()) {
        query = query.eq('game_title_id', gameTitleId.trim());
      } else if (gameTitle.trim()) {
        // fallback legacy text filter
        query = query.ilike('game_title', `%${gameTitle.trim()}%`);
      }

      // Status semantics
      if (status === 'active') {
        query = query.eq('is_active', true).is('archived_at', null);
      } else if (status === 'archived') {
        query = query.not('archived_at', 'is', null);
      } else if (status === 'inactive') {
        query = query.eq('is_active', false);
      }

      // Apply pagination
      const from = (page - 1) * perPage;
      const to = from + perPage - 1;
      query = query.range(from, to);

      // Order by creation date
      query = query.order('created_at', { ascending: false });

      const { data, error, count } = await query;

      if (error) {
        console.error('❌ AdminService: Error fetching products:', error);
        return { data: null, error, count: 0 };
      }

      const mapped = (data || []).map((row: any) => ({
        ...row,
        originalPrice: row.original_price ?? null,
        gameTitleId: row.game_title_id ?? null,
        tierId: row.tier_id ?? null,
        gameTitle: row.game_title ?? null,
        accountLevel: row.account_level ?? null,
        accountDetails: row.account_details ?? null,
        hasRental: row.has_rental ?? false,
        isActive: row.is_active ?? true,
        archivedAt: row.archived_at ?? null,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        gameTitleData: row.game_titles ? { id: row.game_titles.id, name: row.game_titles.name } : undefined,
        tierData: row.tiers ? { id: row.tiers.id, name: row.tiers.name } : undefined,
      }));

      console.log(`✅ AdminService: Retrieved ${mapped?.length || 0} products`);
      return { data: mapped, error: null, count: count || 0 };

    } catch (error: any) {
      console.error('💥 AdminService: Unexpected error fetching products:', error);
      return { data: null, error, count: 0 };
    }
  }

  // Test admin connection
  async testConnection(): Promise<{ success: boolean; message: string }> {
    if (!this.isAdminClient()) {
      return {
        success: false,
        message: 'Admin client not initialized. Check REACT_APP_SUPABASE_SERVICE_ROLE_KEY environment variable.'
      };
    }

    try {
      // Test basic read operation
      const { data, error } = await this.adminClient
        .from('products')
        .select('id')
        .limit(1);

      if (error) {
        return {
          success: false,
          message: `Admin connection failed: ${error.message}`
        };
      }

      return {
        success: true,
        message: 'Admin service connected successfully'
      };

    } catch (error) {
      return {
        success: false,
        message: `Admin connection test failed: ${error}`
      };
    }
  }

  async getUsers(): Promise<{ data: any[]; error: any }> {
    if (!this.isAdminClient()) {
      return { 
        data: [], 
        error: { message: 'Admin client not available. Service role key required.' }
      };
    }

    try {
      console.log('🔧 AdminService: Fetching users with last_login_at');

      const { data, error } = await this.adminClient
        .from('users')
        .select('id, name, email, phone, phone_verified, is_admin, is_active, created_at, updated_at, last_login_at')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ AdminService: Users fetch error:', error);
        return { data: [], error };
      }

      console.log('✅ AdminService: Users fetched successfully:', data?.length);
      return { data: data || [], error: null };

    } catch (error) {
      console.error('💥 AdminService: Unexpected error:', error);
      return { data: [], error };
    }
  }

  // Get dashboard statistics
  async getDashboardStats(range?: { start?: string; end?: string }) {
    try {
      if (!this.isAdminClient()) {
        return {
          success: false,
          data: {
            totalProducts: 0,
            flashSales: 0,
            totalOrders: 0,
            totalRevenue: 0,
            averageOrders: 0,
            totalUsers: 0,
            dailyOrders: 0,
            orderStatuses: { paid: 0, pending: 0, cancelled: 0 },
            conversionRate: 0
          }
        };
      }

      // Build range filters
      let startISO: string | undefined;
      let endISO: string | undefined;
      if (range?.start) {
        startISO = new Date(range.start).toISOString();
      }
      if (range?.end) {
        // include full end day by adding 1 day and using lt
        const end = new Date(range.end);
        end.setHours(23,59,59,999);
        endISO = end.toISOString();
      }

      // Real dashboard queries from database
      const [
        productsResult,
        flashSalesResult,
        usersResult,
        ordersInRangeResult
      ] = await Promise.all([
        // a. Total Produk = Count dari produk yang tersedia
        this.adminClient
          .from('products')
          .select('id', { count: 'exact', head: true })
          .eq('is_active', true)
          .is('archived_at', null),

        // b. Flash Sales = Count dari produk yang aktif di flash sale
        this.adminClient
          .from('flash_sales')
          .select('id', { count: 'exact', head: true })
          .eq('is_active', true)
          .gte('end_time', new Date().toISOString()),

        // f. Total pengguna = Sum dari tabel users dengan yang sudah terverifikasi
        this.adminClient
          .from('users')
          .select('id', { count: 'exact', head: true })
          .eq('phone_verified', true),

        // Orders within selected range (for dynamic dashboard)
        (function(self){
          let q = self.adminClient
            .from('orders')
            .select('id, amount, status, created_at');
          if (startISO) q = q.gte('created_at', startISO);
          if (endISO) q = q.lte('created_at', endISO);
          return q;
        })(this)
      ]);

      // Calculate totals (dynamic by range)
      const totalProducts = productsResult.count || 0;
      const flashSales = flashSalesResult.count || 0;
      const orders = (ordersInRangeResult.data || []).map((o: any) => ({
        ...o,
        amount: typeof o.amount === 'string' ? parseFloat(o.amount) : (typeof o.amount === 'number' ? o.amount : 0)
      }));
      const totalOrders = orders.length;

  // Calculate revenue for paid/completed orders within range
  const paidOrdersList = orders.filter((o: any) => o.status === 'paid' || o.status === 'completed');
  const totalRevenue = paidOrdersList.reduce((sum: number, o: any) => sum + (o.amount || 0), 0);
  const averageOrders = paidOrdersList.length > 0 ? totalRevenue / paidOrdersList.length : 0;

      const totalUsers = usersResult.count || 0;
      // dailyOrders: paid orders today within range if today is included, otherwise 0
      const today = new Date();
      const dayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
      const dayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23,59,59,999).toISOString();
  const dailyOrders = orders.filter((o: any) => (o.status === 'paid' || o.status === 'completed') && o.created_at >= dayStart && o.created_at <= dayEnd).length;

      // Calculate order statuses
      const orderStatuses = { paid: 0, pending: 0, canceled: 0, completed: 0 } as any;
      orders.forEach((order: any) => {
        if (order.status === 'paid') orderStatuses.paid++;
        else if (order.status === 'pending') orderStatuses.pending++;
        else if (order.status === 'completed') orderStatuses.completed++;
        else if (order.status === 'cancelled' || order.status === 'canceled') orderStatuses.canceled++;
      });

      // i. Insight performa = tingkat konversi (paid orders / total orders * 100)
      const conversionRate = totalOrders > 0 ? (orderStatuses.paid / totalOrders * 100) : 0;

  // Build daily breakdown: orders = total created per day; revenue = paid+completed only
  const dailyMap = new Map<string, { revenue: number; orders: number }>();
      const startDate = startISO ? new Date(startISO) : new Date(new Date().getTime() - 7*24*60*60*1000);
      const endDate = endISO ? new Date(endISO) : new Date();
      // Normalize to date-only (local)
      const cursor = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
      const endDay = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
      while (cursor <= endDay) {
        const key = cursor.toISOString().slice(0,10);
        dailyMap.set(key, { revenue: 0, orders: 0 });
        cursor.setDate(cursor.getDate() + 1);
      }
      for (const o of orders) {
        const d = new Date(o.created_at);
        const key = new Date(d.getFullYear(), d.getMonth(), d.getDate()).toISOString().slice(0,10);
        const cur = dailyMap.get(key) || { revenue: 0, orders: 0 };
        const addRevenue = (o.status === 'paid' || o.status === 'completed') ? (o.amount || 0) : 0;
        dailyMap.set(key, { revenue: cur.revenue + addRevenue, orders: cur.orders + 1 });
      }
      const dailyRevenue = Array.from(dailyMap.entries()).map(([k, v]) => ({ date: k, revenue: v.revenue, orders: v.orders }));

      return {
        success: true,
        data: {
          totalProducts,
          flashSales,
          totalOrders,
          totalRevenue,
          averageOrders,
          totalUsers,
          dailyOrders,
          orderStatuses,
          conversionRate,
          dailyRevenue
        }
      };

    } catch (error) {
      console.error('Error getting dashboard stats:', error);
      // Return fallback mock data on error
      return {
        success: false,
        data: {
          totalProducts: 0,
          flashSales: 0,
          totalOrders: 0,
          totalRevenue: 0,
          averageOrders: 0,
          totalUsers: 0,
          dailyOrders: 0,
          orderStatuses: { paid: 0, pending: 0, cancelled: 0 },
          conversionRate: 0
        }
      };
    }
  }
}

// Export singleton instance
export const adminService = AdminService.getInstance();
