import { supabase } from './supabase.ts';
import { Product, FlashSale } from '../types/index.ts';

// Sample data untuk development/testing
const sampleProducts: Product[] = [
  {
    id: '1',
    name: 'Akun ML Sultan Mythic Glory 1000 Points',
    description: 'Akun Mobile Legends dengan rank Mythic Glory 1000 points. Semua hero unlocked, 500+ skin epic/legend. Akun aman dan terpercaya.',
    price: 2500000,
    originalPrice: 3000000,
    image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400',
    images: ['https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400'],
    category: 'MOBA',
    gameTitle: 'Mobile Legends',
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
          rental_options (*)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error:', error);
        console.warn('Falling back to sample data');
        return sampleProducts;
      }

      return data?.map(product => ({
        ...product,
        rentalOptions: product.rental_options || []
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
          products (*)
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

      return data?.map(sale => ({
        ...sale,
        product: sale.products
      })) || [];
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
}
