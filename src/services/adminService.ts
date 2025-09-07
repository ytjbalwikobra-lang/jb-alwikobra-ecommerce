import { createClient } from '@supabase/supabase-js';

// Admin service with elevated permissions for CRUD operations
class AdminService {
  private adminClient: any = null;
  private static instance: AdminService | null = null;

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
          flowType: 'implicit'
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
  async getDashboardStats() {
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

      // Real dashboard queries from database
      const [
        productsResult,
        flashSalesResult,
        ordersResult,
        revenueResult,
        usersResult,
        dailyOrdersResult,
        orderStatusesResult
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

        // c. Total Pesanan = Count dari semua pesanan yang masuk
        this.adminClient
          .from('orders')
          .select('id', { count: 'exact', head: true }),

        // d. Total Pendapatan = Sum dari semua order dengan status paid
        this.adminClient
          .from('orders')
          .select('amount')
          .eq('status', 'paid'),

        // f. Total pengguna = Sum dari tabel users dengan yang sudah terverifikasi
        this.adminClient
          .from('users')
          .select('id', { count: 'exact', head: true })
          .eq('phone_verified', true),

        // g. Pendapatan harian = Count order dengan status paid hari ini
        this.adminClient
          .from('orders')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'paid')
          .gte('created_at', new Date(new Date().setHours(0, 0, 0, 0)).toISOString())
          .lt('created_at', new Date(new Date().setHours(23, 59, 59, 999)).toISOString()),

        // h. Status Pesanan = Count dari tabel orders berdasarkan status
        this.adminClient
          .from('orders')
          .select('status')
      ]);

      // Calculate totals
      const totalProducts = productsResult.count || 0;
      const flashSales = flashSalesResult.count || 0;
      const totalOrders = ordersResult.count || 0;
      
      // Calculate total revenue
      const totalRevenue = revenueResult.data?.reduce((sum, order) => 
        sum + (parseFloat(order.amount) || 0), 0) || 0;
      
      // e. Rata-rata pesanan = Average dari semua order dengan status paid
      const paidOrders = revenueResult.data?.length || 0;
      const averageOrders = paidOrders > 0 ? totalRevenue / paidOrders : 0;
      
      const totalUsers = usersResult.count || 0;
      const dailyOrders = dailyOrdersResult.count || 0;

      // Calculate order statuses
      const orderStatuses = { paid: 0, pending: 0, cancelled: 0 };
      orderStatusesResult.data?.forEach(order => {
        if (order.status === 'paid') orderStatuses.paid++;
        else if (order.status === 'pending') orderStatuses.pending++;
        else if (order.status === 'cancelled') orderStatuses.cancelled++;
      });

      // i. Insight performa = tingkat konversi (paid orders / total orders * 100)
      const conversionRate = totalOrders > 0 ? (orderStatuses.paid / totalOrders * 100) : 0;

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
          conversionRate
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
