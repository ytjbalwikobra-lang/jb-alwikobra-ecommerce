export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  images?: string[];
  category: string;
  gameTitle: string;
  accountLevel?: string;
  accountDetails?: string;
  isFlashSale: boolean;
  flashSaleEndTime?: string;
  hasRental: boolean;
  rentalOptions?: RentalOption[];
  stock: number;
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
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  type: 'purchase' | 'rental';
  rentalOption?: RentalOption;
}
