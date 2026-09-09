export interface ProductSizeVariant {
  id: string;
  name: string;
  priceDelta?: number;
  stock?: number;
  sku?: string;
  image_url?: string;
  imageIndex?: number;
}

export interface Product {
  id: string;
  sku?: string;
  name: string;
  category: string;
  buy_price: number;
  sell_price: number;
  stock: number;
  min_stock?: number;
  min_stock_alert?: number;
  unit?: string;
  barcode?: string;
  image_url?: string;
  images?: string[];
  description?: string;
  hasSizes?: boolean;
  sizes?: ProductSizeVariant[];
  created_at?: string;
}

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  category: string;
  price: number;
  originalPrice: number;
  quantity: number;
  image_url?: string;
  selectedSize?: ProductSizeVariant;
  availableStock: number;
}

export interface PromoCode {
  id: string;
  code: string;
  type: 'percentage' | 'percent' | 'fixed';
  value: number;
  usage_limit?: number;
  times_used?: number;
  is_active: boolean;
  expires_at?: string;
}
