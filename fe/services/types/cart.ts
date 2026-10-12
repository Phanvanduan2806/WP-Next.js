
export interface CartVariation {
  [attribute: string]: string;
}

export interface CartItem {
  key: string;
  product_id: number;
  variation_id: number;
  name: string;
  slug: string;
  permalink: string;
  image: string;
  sku: string | null;
  quantity: number;
  price: number;
  regular_price: number;
  sale_price: number | null;
  line_subtotal: number;
  line_total: number;
  line_subtotal_tax: number;
  line_tax: number;
  price_html: string;
  subtotal_html: string;
  total_html: string;
  variation: CartVariation | Record<string, never>;
}

export interface CartCoupon {
  code: string;
  discount_amount: number;
  discount_type: string;
}

export interface CartTotals {
  subtotal: number;
  discount_total: number;
  discount_tax: number;
  shipping_total: number;
  shipping_tax: number;
  fee_total: number;
  fee_tax: number;
  cart_contents_total: number;
  cart_contents_tax: number;
  total_tax: number;
  total: number;
  currency: string;
  currency_symbol: string;
  count: number;
}

export interface CartData {
  success: boolean;
  user_id: number;
  items: CartItem[];
  coupons: CartCoupon[];
  totals: CartTotals;
}

export interface CartAddItemInput {
  product_id: number;
  quantity?: number;
  variation_id?: number;
  variation?: Record<string, string>;
}

export interface CartUpdateItemInput {
  quantity: number;
}

export interface CartApplyCouponInput {
  code: string;
}

export interface CartApiError {
  success: false;
  code?: string;
  message: string;
}

export interface CartState {
  items: CartItem[];
  coupons: CartCoupon[];
  totals: CartTotals | null;
  isLoading: boolean;
  error: string | null;
}
