// User types
export interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'customer';
  phoneNumber?: string;
  isEmailVerified: boolean;
  addresses: Address[];
  favoriteCategories: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  _id?: string;
  type: 'shipping' | 'billing';
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
}

// Product types
export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: Category;
  images: string[];
  specifications: Record<string, string>;
  tags: string[];
  isFeatured: boolean;
  slug: string;
  variants?: ProductVariant[];
  averageRating: number;
  numReviews: number;
  stock: number;
  sku: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductVariant {
  name: string;
  options: ProductVariantOption[];
}

export interface ProductVariantOption {
  value: string;
  price?: number;
  stock?: number;
  sku?: string;
}

// Category types
export interface Category {
  _id: string;
  name: string;
  description: string;
  image: string;
  slug: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

// Review types
export interface Review {
  _id: string;
  user: User;
  product: Product | string;
  rating: number;
  comment: string;
  isApproved: boolean;
  createdAt: string;
  updatedAt: string;
}

// Cart types
export interface Cart {
  _id: string;
  user: string;
  items: CartItem[];
  totalPrice: number;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  _id?: string;
  product: Product | string;
  quantity: number;
  price: number;
  variantOptions?: Record<string, string>;
}

// Order types
export interface Order {
  _id: string;
  user: User | string;
  orderItems: OrderItem[];
  shippingAddress: Address;
  paymentMethod: string;
  paymentResult?: PaymentResult;
  subtotal: number;
  taxPrice: number;
  shippingPrice: number;
  totalPrice: number;
  isPaid: boolean;
  paidAt?: string;
  isDelivered: boolean;
  deliveredAt?: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  product: Product | string;
  name: string;
  quantity: number;
  price: number;
  image: string;
  variantOptions?: Record<string, string>;
}

export interface PaymentResult {
  id: string;
  status: string;
  updateTime: string;
  emailAddress?: string;
}

// Activity types for recommendation system
export interface Activity {
  _id: string;
  user: User | string;
  product: Product | string;
  activityType: 'view' | 'cart' | 'wishlist' | 'purchase';
  timestamp: string;
}

// API response types
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string>;
  categories?: Category[];
  products?: Product[];
}

// Pagination types
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  page: number;
  pages: number;
  total: number;
}

// Auth types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

// Filter types
export interface ProductFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  search?: string;
  sort?: 'price' | 'price-desc' | 'rating' | 'newest';
  page?: number;
  limit?: number;
  tags?: string[];
  featured?: boolean;
} 