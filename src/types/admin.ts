// Admin-specific types to improve type safety
export interface OrderRow {
  id: string;
  product_id: string | null;
  product_name?: string | null;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  order_type: 'purchase' | 'rental';
  amount: number;
  status: 'pending' | 'paid' | 'completed' | 'cancelled';
  payment_method: 'xendit' | 'whatsapp';
  rental_duration?: string | null;
  created_at: string;
}

export interface ProductFormData {
  name: string;
  description: string;
  category: 'account' | 'item';
  price: number;
  game_title_id: string;
  tier_id: string;
  account_level?: string;
  account_details?: string;
  has_rental: boolean;
  rental_options: RentalOptionForm[];
  status?: 'active' | 'archived';
  images: string[];
}

export interface RentalOptionForm {
  duration: string;
  price: number;
  description?: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  warning?: string;
}

export interface PaginationData {
  total: number;
  page: number;
  limit: number;
}

// Game Title related types
export interface GameTitleFormData {
  id?: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  color?: string;
  logo_url?: string;
  logo_path?: string;
  is_popular: boolean;
  is_active: boolean;
  sort_order: number;
  logo_file?: File | null;
  logo_preview?: string | null;
}

export interface GameTitleRow {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  logo_url: string | null;
  logo_path: string | null;
  is_popular: boolean;
  is_active: boolean;
  sort_order: number;
  logoUrl?: string; // Computed field for display
}

// Product related types
export interface ProductFormData {
  name: string;
  description: string;
  category: 'account' | 'item';
  price: number;
  game_title_id: string;
  tier_id: string;
  account_level?: string;
  account_details?: string;
  has_rental: boolean;
  rental_options: RentalOptionForm[];
  status?: 'active' | 'archived';
  images: string[];
}

export interface RentalOptionForm {
  duration: string;
  price: number;
  description?: string;
}

export interface ProductRow {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'account' | 'item';
  game_title_id: string;
  tier_id: string;
  account_level?: string;
  account_details?: string;
  has_rental: boolean;
  is_flash_sale: boolean;
  stock: number;
  is_active: boolean;
  archived_at?: string | null;
  created_at: string;
  updated_at: string;
  images: string[];
}

export type OrdersApiResponse = ApiResponse<{
  orders: OrderRow[];
  pagination: PaginationData;
}>;

// Type guard functions
export function isOrderRow(obj: unknown): obj is OrderRow {
  if (typeof obj !== 'object' || obj === null) return false;
  const o = obj as Record<string, unknown>;
  return (
    typeof o.id === 'string' &&
    typeof o.customer_name === 'string' &&
    typeof o.customer_email === 'string' &&
    typeof o.customer_phone === 'string' &&
    ['purchase', 'rental'].includes(o.order_type as string) &&
    typeof o.amount === 'number' &&
    ['pending', 'paid', 'completed', 'cancelled'].includes(o.status as string) &&
    ['xendit', 'whatsapp'].includes(o.payment_method as string) &&
    typeof o.created_at === 'string'
  );
}

export function isApiResponse(obj: unknown): obj is ApiResponse {
  if (typeof obj !== 'object' || obj === null) return false;
  const o = obj as Record<string, unknown>;
  return typeof o.success === 'boolean';
}

// User types
export interface UserRow {
  id: string;
  name: string | null;
  email?: string | null;
  phone?: string | null;
  is_admin: boolean;
  is_active: boolean;
  phone_verified?: boolean;
  created_at?: string;
  updated_at?: string;
  last_login_at?: string;
  role: string; // Computed field for UI
}

export interface UserFormData {
  id: string;
  name: string;
  email: string;
  phone: string;
  is_admin: boolean;
  is_active: boolean;
}
