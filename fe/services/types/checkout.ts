export interface CheckoutAddress {
  first_name: string;
  last_name: string;
  company?: string;
  email?: string;
  phone?: string;
  address_1: string;
  address_2?: string;
  city: string;
  state?: string;
  postcode?: string;
  country: string;
}

export interface CheckoutCustomer {
  id: number;
  name: string;
  email: string;
}

export interface CheckoutCartItem {
  key: string;
  product_id: number;
  name: string;
  quantity: number;
  price: string;
  line_subtotal: string;
  line_total: string;
  image: string;
}

export interface CheckoutTotals {
  subtotal: string;
  discount: string;
  shipping: string;
  tax: string;
  total: string;
  currency: string;
}

export interface CheckoutCart {
  items: CheckoutCartItem[];
  totals: CheckoutTotals;
  item_count: number;
}

export interface CheckoutPaymentMethod {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
}

export interface CheckoutResponse {
  success: boolean;
  customer: CheckoutCustomer;
  billing: CheckoutAddress;
  shipping: CheckoutAddress;
  cart: CheckoutCart;
  payment_methods: CheckoutPaymentMethod[];
}

export interface CheckoutPayload {
  billing: CheckoutAddress;
  shipping?: Partial<CheckoutAddress>;
  payment_method: string;
  customer_note?: string;
}

export interface CheckoutValidationResponse {
  success: boolean;
  message: string;
  cart: CheckoutCart;
}

export interface CreatedOrder {
  id: number;
  number: string;
  status: string;
  total: string;
  currency: string;
  payment_method: string;
  payment_title: string;
  payment_url: string;
  order_received_url: string;
}

export interface CreateOrderResponse {
  success: boolean;
  message: string;
  item: CreatedOrder;
}

export interface CheckoutErrorResponse {
  success: false;
  code?: string;
  message: string;
}
