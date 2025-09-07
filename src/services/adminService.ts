import { createClient } from '@supabase/supabase-js';

// Admin service with elevated permissions for CRUD operations
class AdminService {
  private adminClient: any = null;

  constructor() {
    this.initializeAdminClient();
  }

  private initializeAdminClient() {
    const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
    const serviceRoleKey = process.env.REACT_APP_SUPABASE_SERVICE_ROLE_KEY;

    if (supabaseUrl && serviceRoleKey) {
      this.adminClient = createClient(supabaseUrl, serviceRoleKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      });
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

  async deleteProduct(id: string): Promise<{ success: boolean; error: any }> {
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

      // Then delete the product
      const { error } = await this.adminClient
        .from('products')
        .delete()
        .eq('id', id);

      if (error) {
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

  // Product retrieval with filtering and pagination
  async getProducts(options: {
    page?: number;
    perPage?: number;
    search?: string;
    category?: string;
    gameTitle?: string;
    status?: string;
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
        status = ''
      } = options;

      let query = this.adminClient
        .from('products')
        .select('*', { count: 'exact' });

      // Apply filters
      if (search.trim()) {
        query = query.ilike('name', `%${search.trim()}%`);
      }

      if (category.trim()) {
        query = query.eq('category', category.trim());
      }

      if (gameTitle.trim()) {
        query = query.ilike('game_title', `%${gameTitle.trim()}%`);
      }

      if (status === 'active') {
        query = query.eq('is_active', true);
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

      console.log(`✅ AdminService: Retrieved ${data?.length || 0} products`);
      return { data: data || [], error: null, count: count || 0 };

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
}

// Export singleton instance
export const adminService = new AdminService();
