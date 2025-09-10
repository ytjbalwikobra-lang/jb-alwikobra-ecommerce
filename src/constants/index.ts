/**
 * Application-wide constants and configuration
 */

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 8,
  PRODUCTS_PER_PAGE: 8,
  ADMIN_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100
} as const;

// Timing
export const TIMING = {
  DEBOUNCE_DELAY: 300,
  API_TIMEOUT: 30000,
  CACHE_TTL: 60000, // 1 minute
  RETRY_DELAY: 1000,
  MAX_RETRIES: 3
} as const;

// UI Constants
export const UI = {
  MOBILE_BREAKPOINT: 768,
  TABLET_BREAKPOINT: 1024,
  DESKTOP_BREAKPOINT: 1280,
  MAX_CONTENT_WIDTH: '7xl',
  SIDEBAR_WIDTH: 280
} as const;

// Image Constants
export const IMAGES = {
  PLACEHOLDER: '/images/placeholder.jpg',
  MAX_UPLOAD_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_FORMATS: ['image/jpeg', 'image/png', 'image/webp'],
  THUMBNAIL_SIZE: 300,
  CARD_IMAGE_SIZE: 400
} as const;

// Validation Rules
export const VALIDATION = {
  MIN_PASSWORD_LENGTH: 8,
  MAX_PASSWORD_LENGTH: 128,
  MIN_NAME_LENGTH: 2,
  MAX_NAME_LENGTH: 100,
  MAX_DESCRIPTION_LENGTH: 1000,
  MAX_TITLE_LENGTH: 200,
  PHONE_REGEX: /^(\+62|62|0)8[1-9][0-9]{6,9}$/,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
} as const;

// API Routes
export const API_ROUTES = {
  PRODUCTS: '/api/products',
  FLASH_SALES: '/api/flash-sales',
  AUTH: '/api/auth',
  ADMIN: '/api/admin',
  ORDERS: '/api/orders',
  USERS: '/api/users',
  SETTINGS: '/api/settings',
  UPLOAD: '/api/upload'
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  SESSION_TOKEN: 'session_token',
  USER_PREFERENCES: 'user_preferences',
  CART: 'shopping_cart',
  WISHLIST: 'wishlist',
  THEME: 'theme_preference',
  LAST_VISIT: 'last_visit',
  PRODUCTS_PAGE_STATE: 'productsPageState'
} as const;

// Toast Types
export const TOAST_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  INFO: 'info',
  WARNING: 'warning',
  NEW: 'new',
  PAID: 'paid',
  CANCELLED: 'cancelled'
} as const;

// Product Status
export const PRODUCT_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SOLD: 'sold',
  PENDING: 'pending'
} as const;

// Order Status
export const ORDER_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded'
} as const;

// Sort Options
export const SORT_OPTIONS = {
  NEWEST: 'newest',
  OLDEST: 'oldest',
  PRICE_LOW: 'price-low',
  PRICE_HIGH: 'price-high',
  NAME_AZ: 'name-az',
  NAME_ZA: 'name-za',
  POPULARITY: 'popularity',
  RATING: 'rating'
} as const;

// Currency
export const CURRENCY = {
  CODE: 'IDR',
  SYMBOL: 'Rp',
  LOCALE: 'id-ID',
  MIN_AMOUNT: 1000,
  MAX_AMOUNT: 100000000
} as const;

// Date Formats
export const DATE_FORMATS = {
  DEFAULT: 'DD/MM/YYYY',
  WITH_TIME: 'DD/MM/YYYY HH:mm',
  ISO: 'YYYY-MM-DD',
  RELATIVE: 'relative'
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Terjadi masalah koneksi. Silakan coba lagi.',
  UNAUTHORIZED: 'Anda tidak memiliki akses. Silakan login kembali.',
  FORBIDDEN: 'Anda tidak memiliki izin untuk melakukan aksi ini.',
  NOT_FOUND: 'Data yang dicari tidak ditemukan.',
  SERVER_ERROR: 'Terjadi kesalahan server. Silakan coba lagi nanti.',
  VALIDATION_ERROR: 'Data yang dimasukkan tidak valid.',
  TIMEOUT_ERROR: 'Permintaan timeout. Silakan coba lagi.',
  UNKNOWN_ERROR: 'Terjadi kesalahan yang tidak diketahui.'
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  SAVED: 'Data berhasil disimpan.',
  UPDATED: 'Data berhasil diperbarui.',
  DELETED: 'Data berhasil dihapus.',
  CREATED: 'Data berhasil dibuat.',
  LOGIN_SUCCESS: 'Login berhasil.',
  LOGOUT_SUCCESS: 'Logout berhasil.',
  PASSWORD_UPDATED: 'Password berhasil diperbarui.',
  EMAIL_SENT: 'Email berhasil dikirim.',
  ORDER_PLACED: 'Pesanan berhasil dibuat.',
  PAYMENT_SUCCESS: 'Pembayaran berhasil diproses.'
} as const;

// Feature Flags
export const FEATURE_FLAGS = {
  ENABLE_ANALYTICS: true,
  ENABLE_SERVICE_WORKER: true,
  ENABLE_DARK_MODE: true,
  ENABLE_NOTIFICATIONS: true,
  ENABLE_OFFLINE_MODE: false,
  ENABLE_BETA_FEATURES: false
} as const;

export type ToastType = typeof TOAST_TYPES[keyof typeof TOAST_TYPES];
export type ProductStatus = typeof PRODUCT_STATUS[keyof typeof PRODUCT_STATUS];
export type OrderStatus = typeof ORDER_STATUS[keyof typeof ORDER_STATUS];
export type SortOption = typeof SORT_OPTIONS[keyof typeof SORT_OPTIONS];
