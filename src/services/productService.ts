import { supabase } from './supabase.ts';
import { Product, FlashSale } from '../types/index.ts';

export class ProductService {
  static async getAllProducts(): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          rental_options (*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data?.map(product => ({
        ...product,
        rentalOptions: product.rental_options || []
      })) || [];
    } catch (error) {
      console.error('Error fetching products:', error);
      return [];
    }
  }

  static async getProductById(id: string): Promise<Product | null> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          rental_options (*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;

      return data ? {
        ...data,
        rentalOptions: data.rental_options || []
      } : null;
    } catch (error) {
      console.error('Error fetching product:', error);
      return null;
    }
  }

  static async getFlashSales(): Promise<(FlashSale & { product: Product })[]> {
    try {
      const { data, error } = await supabase
        .from('flash_sales')
        .select(`
          *,
          products (*)
        `)
        .eq('is_active', true)
        .gte('end_time', new Date().toISOString());

      if (error) throw error;

      return data?.map(sale => ({
        ...sale,
        product: sale.products
      })) || [];
    } catch (error) {
      console.error('Error fetching flash sales:', error);
      return [];
    }
  }

  static async createProduct(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product | null> {
    try {
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
}
