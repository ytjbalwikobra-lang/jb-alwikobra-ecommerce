// Data mapping utilities for admin pages
import { OrderRow, ApiResponse, isApiResponse, ProductFormData, ProductRow, UserRow, UserFormData } from '../types/admin';

export function mapToOrderRow(raw: unknown): OrderRow {
  if (!raw || typeof raw !== 'object') {
    throw new Error('Invalid order data: not an object');
  }

  const r = raw as Record<string, unknown>;
  
  // Explicit type-safe mapping
  const id = String(r.id ?? '');
  const product_id = r.product_id ? String(r.product_id) : r.productId ? String(r.productId) : null;
  const product_name = r.product_name ? String(r.product_name) : 
                      r.productName ? String(r.productName) : 
                      (r.product as Record<string, unknown>)?.name ? String((r.product as Record<string, unknown>).name) : null;
  
  const customer_name = r.customer_name ? String(r.customer_name) : 
                       r.customerName ? String(r.customerName) : 
                       (r.customer as Record<string, unknown>)?.name ? String((r.customer as Record<string, unknown>).name) : 'Unknown';
  
  const customer_email = r.customer_email ? String(r.customer_email) : 
                        r.customerEmail ? String(r.customerEmail) : 
                        (r.customer as Record<string, unknown>)?.email ? String((r.customer as Record<string, unknown>).email) : '';
  
  const customer_phone = r.customer_phone ? String(r.customer_phone) : 
                        r.customerPhone ? String(r.customerPhone) : 
                        (r.customer as Record<string, unknown>)?.phone ? String((r.customer as Record<string, unknown>).phone) : '';
  
  const order_type = (r.order_type ?? r.orderType ?? 'purchase') as OrderRow['order_type'];
  const amount = Number(r.amount ?? 0);
  const status = (r.status ?? 'pending') as OrderRow['status'];
  const payment_method = (r.payment_method ?? r.paymentMethod ?? 'whatsapp') as OrderRow['payment_method'];
  const rental_duration = r.rental_duration ? String(r.rental_duration) : 
                         r.rentalDuration ? String(r.rentalDuration) : null;
  const created_at = r.created_at ? String(r.created_at) : 
                    r.createdAt ? String(r.createdAt) : new Date().toISOString();

  return {
    id,
    product_id,
    product_name,
    customer_name,
    customer_email,
    customer_phone,
    order_type,
    amount,
    status,
    payment_method,
    rental_duration,
    created_at};
}

export function validateApiResponse(response: unknown): ApiResponse {
  if (!isApiResponse(response)) {
    throw new Error('Invalid API response format');
  }
  return response;
}

export function parseOrdersFromApi(response: unknown): OrderRow[] {
  const apiResponse = validateApiResponse(response);
  
  if (!apiResponse.success) {
    throw new Error(apiResponse.error || 'API request failed');
  }

  const data = apiResponse.data as Record<string, unknown>;
  const orders = (data.orders as unknown[]) || [];
  
  return orders.map(mapToOrderRow);
}

export function createUrlParams(params: Record<string, string | number | boolean | undefined>): URLSearchParams {
  const urlParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      urlParams.append(key, String(value));
    }
  });
  
  return urlParams;
}

// Product mapping utilities
export function mapToProductFormData(product: ProductRow): ProductFormData {
  return {
    name: product.name,
    description: product.description,
    category: product.category,
    price: product.price,
    game_title_id: product.game_title_id,
    tier_id: product.tier_id,
    account_level: product.account_level,
    account_details: product.account_details,
    has_rental: product.has_rental,
    rental_options: [], // Will be loaded separately
    status: product.is_active ? 'active' : 'archived',
    images: product.images || []};
}

export function mapProductFormToDbPayload(formData: ProductFormData) {
  return {
    name: formData.name,
    description: formData.description,
    category: formData.category,
    price: formData.price,
    game_title_id: formData.game_title_id,
    tier_id: formData.tier_id,
    account_level: formData.account_level || '',
    account_details: formData.account_details || '',
    has_rental: formData.has_rental,
    is_flash_sale: false, // Default value
    stock: 999, // Default value
    is_active: formData.status === 'active',
    images: formData.images,
    // Add the main image from images array
    image: formData.images[0] || '',
    // Add game_title for backward compatibility
    game_title: '', // Will be populated from relation
  };
}

// User mapping utilities
export function mapToUserRow(user: UserFormData): UserRow {
  return {
    ...user,
    role: user.is_admin ? 'admin' : 'user'
  };
}

export function mapUserToFormData(user: UserRow): UserFormData {
  return {
    id: user.id,
    name: user.name || '',
    email: user.email || '',
    phone: user.phone || '',
    is_admin: user.is_admin,
    is_active: user.is_active
  };
}

export function mapUserFormToDbPayload(formData: UserFormData) {
  return {
    id: formData.id,
    name: formData.name,
    email: formData.email,
    phone: formData.phone,
    is_admin: formData.is_admin,
    is_active: formData.is_active,
    updated_at: new Date().toISOString()
  };
}
