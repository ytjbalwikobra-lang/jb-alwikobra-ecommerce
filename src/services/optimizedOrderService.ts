// Optimized Order Service with pagination
import { supabase } from '../services/supabase';

interface OrderFilters {
  search?: string;
  status?: string;
  paymentMethod?: string;
  orderType?: string;
  dateFrom?: string;
  dateTo?: string;
  amountMin?: number;
  amountMax?: number;
}

interface PaginationOptions {
  page?: number;
  limit?: number;
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

class OptimizedOrderService {
  private static cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  private static CACHE_TTL = 2 * 60 * 1000; // 2 minutes

  private static getCacheKey(key: string, filters?: any): string {
    return filters ? `${key}:${JSON.stringify(filters)}` : key;
  }

  private static getFromCache<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  }

  private static setCache<T>(key: string, data: T, ttl: number = this.CACHE_TTL): void {
    this.cache.set(key, { data, timestamp: Date.now(), ttl });
  }

  static async getOrdersPaginated(
    filters: OrderFilters = {},
    pagination: PaginationOptions = {}
  ): Promise<PaginatedResponse<any>> {
    const { page = 1, limit = 20 } = pagination;
    const cacheKey = this.getCacheKey('orders_paginated', { filters, pagination });
    const cached = this.getFromCache<PaginatedResponse<any>>(cacheKey);
    if (cached) return cached;

    try {
      if (!supabase) throw new Error('Supabase not configured');

      // Build query with optimized select
      let query = supabase
        .from('orders')
        .select(`
          id, customer_name, customer_email, customer_phone, 
          total_amount, status, payment_method, order_type,
          created_at, updated_at, notes,
          product_id,
          products (id, name)
        `, { count: 'exact' });

      // Apply filters at database level
      if (filters.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }

      if (filters.paymentMethod && filters.paymentMethod !== 'all') {
        query = query.eq('payment_method', filters.paymentMethod);
      }

      if (filters.orderType && filters.orderType !== 'all') {
        query = query.eq('order_type', filters.orderType);
      }

      if (filters.search && filters.search.trim()) {
        const searchTerm = filters.search.trim();
        query = query.or(`customer_name.ilike.%${searchTerm}%,customer_email.ilike.%${searchTerm}%,customer_phone.ilike.%${searchTerm}%,id.ilike.%${searchTerm}%`);
      }

      if (filters.dateFrom) {
        query = query.gte('created_at', filters.dateFrom);
      }

      if (filters.dateTo) {
        query = query.lte('created_at', filters.dateTo);
      }

      if (filters.amountMin !== undefined) {
        query = query.gte('total_amount', filters.amountMin);
      }

      if (filters.amountMax !== undefined) {
        query = query.lte('total_amount', filters.amountMax);
      }

      // Apply pagination
      const offset = (page - 1) * limit;
      query = query
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      if (error) throw error;

      const result: PaginatedResponse<any> = {
        data: data || [],
        total: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit)
      };

      this.setCache(cacheKey, result);
      return result;

    } catch (error) {
      console.error('Error fetching paginated orders:', error);
      return {
        data: [],
        total: 0,
        page,
        limit,
        totalPages: 0
      };
    }
  }

  static async getOrdersStats(): Promise<{ [key: string]: number }> {
    const cacheKey = 'orders_stats';
    const cached = this.getFromCache<{ [key: string]: number }>(cacheKey);
    if (cached) return cached;

    try {
      if (!supabase) return {};

      // Get counts for different statuses
      const statusQueries = ['pending', 'confirmed', 'processing', 'completed', 'cancelled'].map(status =>
        supabase!
          .from('orders')
          .select('id', { count: 'exact', head: true })
          .eq('status', status)
      );

      const totalQuery = supabase!
        .from('orders')
        .select('id', { count: 'exact', head: true });

      const results = await Promise.all([...statusQueries, totalQuery]);
      
      const stats = {
        pending: results[0].count || 0,
        confirmed: results[1].count || 0,
        processing: results[2].count || 0,
        completed: results[3].count || 0,
        cancelled: results[4].count || 0,
        total: results[5].count || 0
      };

      this.setCache(cacheKey, stats, 60 * 1000); // Cache for 1 minute
      return stats;

    } catch (error) {
      console.error('Error fetching order stats:', error);
      return {};
    }
  }

  static clearCache(): void {
    this.cache.clear();
  }
}

export { OptimizedOrderService };
export type { OrderFilters, PaginatedResponse };
