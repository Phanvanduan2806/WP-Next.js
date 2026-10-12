
/**
 * =========================================================
 * ORDER TYPES
 * =========================================================
 */

export type OrderStatus =
  | "pending"
  | "processing"
  | "on-hold"
  | "completed"
  | "cancelled"
  | "refunded"
  | "failed"
  | string;

/**
 * Order line item.
 */
export interface OrderItem {
  id: number;
  product_id: number;
  variation_id: number;
  name: string;
  quantity: number;
  subtotal: string;
  total: string;
  image: string;
}

/**
 * Customer order.
 * Matches nextjs_format_customer_order() in WordPress.
 */
export interface Order {
  id: number;
  number: string;
  status: OrderStatus;
  status_label: string;
  date_created: string | null;

  total: string;
  subtotal: string;
  discount_total: string;
  shipping_total: string;
  total_tax: string;
  currency: string;

  payment_method: string;
  payment_title: string;
  payment_url: string;

  line_items: OrderItem[];
}

/**
 * GET /orders
 */
export interface OrdersResponse {
  success: boolean;
  items: Order[];
  total: number;
  total_pages: number;
  current_page: number;
  message?: string;
}

/**
 * GET /orders/{id}
 */
export interface OrderResponse {
  success: boolean;
  item: Order;
  message?: string;
}

/**
 * POST /orders
 */
export interface CreateOrderInput {
  billing: {
    first_name: string;
    last_name: string;
    email: string;

    phone?: string;
    company?: string;
    address_1?: string;
    address_2?: string;
    city?: string;
    state?: string;
    postcode?: string;
    country?: string;
  };

  shipping?: {
    first_name?: string;
    last_name?: string;
    company?: string;
    address_1?: string;
    address_2?: string;
    city?: string;
    state?: string;
    postcode?: string;
    country?: string;
  };
}

export interface CreateOrderResponse {
  success: boolean;
  message: string;
  item: Order;
}

/**
 * POST /orders/{id}/cancel
 */
export interface CancelOrderResponse {
  success: boolean;
  message: string;
  item: Order;
}

/**
 * POST /orders/{id}/pay
 */
export interface PreparePaymentResponse {
success: boolean;
payment_url: string;
return_url: string;
message?: string;
order_id?: number;
status?: OrderStatus;
}

/**
 * GET /orders query parameters.
 */
export interface GetOrdersParams {
  page?: number;
  perPage?: number;
}

/**
 * Standard API error response.
 */
export interface OrderApiError {
  code?: string;
  message?: string;
  data?: {
    status?: number;
  };
}