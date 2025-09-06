export type ProductTier = 'reguler' | 'pelajar' | 'premium';

export interface Tier {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  borderColor?: string;
  backgroundGradient?: string;
  icon?: string;
  priceRangeMin?: number;
  priceRangeMax?: number;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface GameTitle {
  id: string;
  slug: string;
  name: string;
  description?: string;
  icon: string;
  color: string;
  logoUrl?: string;
  isPopular: boolean;
  isActive?: boolean;
  sortOrder?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  color?: string;
  isActive: boolean;
  sortOrder: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  images?: string[];
  category?: string; // Keep for backward compatibility (optional now)
  gameTitle: string; // Keep for backward compatibility
  tier?: ProductTier; // Keep for backward compatibility
  tierId?: string; // New foreign key
  gameTitleId?: string; // New foreign key
  tierData?: Tier; // Populated tier data
  gameTitleData?: GameTitle; // Populated game title data
  accountLevel?: string;
  accountDetails?: string;
  isFlashSale: boolean;
  flashSaleEndTime?: string;
  hasRental: boolean;
  rentalOptions?: RentalOption[];
  stock: number;
  // Archiving
  isActive?: boolean;
  archivedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RentalOption {
  id: string;
  duration: string;
  price: number;
  description?: string;
}

export interface FlashSale {
  id: string;
  productId: string;
  salePrice: number;
  originalPrice: number;
  startTime: string;
  endTime: string;
  stock: number;
  isActive: boolean;
}

export interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl: string;
  linkUrl?: string;
  ctaText?: string; // optional CTA label
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WebsiteSettings {
  id: string; // singleton row id
  siteName?: string;
  logoUrl?: string;
  faviconUrl?: string;
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
  updatedAt?: string;
}

export interface Customer {
  name: string;
  email: string;
  phone: string;
}

export interface Order {
  id: string;
  productId: string;
  customer: Customer;
  type: 'purchase' | 'rental';
  amount: number;
  status: 'pending' | 'paid' | 'completed' | 'cancelled';
  paymentMethod: 'xendit' | 'whatsapp';
  rentalDuration?: string;
  clientExternalId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  product: Product;
  // All products are single-quantity items
  quantity: 1;
  type: 'purchase' | 'rental';
  rentalOption?: RentalOption;
}
