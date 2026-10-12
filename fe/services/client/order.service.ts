import type {
  CancelOrderResponse,
  CreateOrderInput,
  CreateOrderResponse,
  GetOrdersParams,
  Order,
  OrderResponse,
  OrdersResponse,
  PreparePaymentResponse,
} from "@/services/types/order";

/**
 * =========================================================
 * ORDER SERVICE
 * =========================================================
 *
 * FE endpoints:
 * GET  /api/orders
 * GET  /api/orders/{id}
 * POST /api/orders
 * POST /api/orders/{id}/cancel
 * POST /api/orders/{id}/pay
 */

const API_BASE = "/api/orders";

/**
 * Build query string.
 */
function buildQuery(params?: GetOrdersParams): string {
  if (!params) {
    return "";
  }

  const searchParams = new URLSearchParams();

  if (params.page !== undefined) {
    searchParams.set("page", String(params.page));
  }

  if (params.perPage !== undefined) {
    searchParams.set("per_page", String(params.perPage));
  }

  const query = searchParams.toString();

  return query ? `?${query}` : "";
}

/**
 * Read API response and handle errors.
 */
async function request<T>(
  url: string,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: {
      Accept: "application/json",
      ...(init?.body
        ? { "Content-Type": "application/json" }
        : {}),
      ...init?.headers,
    },
    cache: "no-store",
  });

  const data: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const errorData = data as {
      message?: string;
      code?: string;
      data?: { status?: number };
    } | null;

    throw new Error(
      errorData?.message ??
        `Yêu cầu thất bại (HTTP ${response.status}).`,
    );
  }

  return data as T;
}

/**
 * =========================================================
 * GET CUSTOMER ORDERS
 * =========================================================
 */
async function getOrders(
  params?: GetOrdersParams,
): Promise<OrdersResponse> {
  return request<OrdersResponse>(
    `${API_BASE}${buildQuery(params)}`,
    {
      method: "GET",
    },
  );
}

/**
 * =========================================================
 * GET ORDER DETAIL
 * =========================================================
 */
async function getOrder(id: number | string): Promise<Order> {
  const orderId = String(id);

  if (!/^\d+$/.test(orderId) || Number(orderId) <= 0) {
    throw new Error("ID đơn hàng không hợp lệ.");
  }

  const response = await request<OrderResponse>(
    `${API_BASE}/${orderId}`,
    {
      method: "GET",
    },
  );

  return response.item;
}

/**
 * =========================================================
 * CREATE ORDER
 * =========================================================
 */
async function createOrder(
  input: CreateOrderInput,
): Promise<CreateOrderResponse> {
  return request<CreateOrderResponse>(API_BASE, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

/**
 * =========================================================
 * CANCEL ORDER
 * =========================================================
 */
async function cancelOrder(
  id: number | string,
): Promise<CancelOrderResponse> {
  const orderId = String(id);

  if (!/^\d+$/.test(orderId) || Number(orderId) <= 0) {
    throw new Error("ID đơn hàng không hợp lệ.");
  }

  return request<CancelOrderResponse>(
    `${API_BASE}/${orderId}/cancel`,
    {
      method: "POST",
    },
  );
}

/**
 * =========================================================
 * PREPARE PAYMENT
 * =========================================================
 */
async function preparePayment(
  id: number | string,
): Promise<PreparePaymentResponse> {
  const orderId = String(id);

  if (!/^\d+$/.test(orderId) || Number(orderId) <= 0) {
    throw new Error("ID đơn hàng không hợp lệ.");
  }

  return request<PreparePaymentResponse>(
    `${API_BASE}/${orderId}/pay`,
    {
      method: "POST",
    },
  );
}

/**
 * =========================================================
 * HELPERS
 * =========================================================
 */

/**
 * Check whether an order can be cancelled.
 */
function canCancelOrder(order: Order): boolean {
  return ["pending", "on-hold"].includes(order.status);
}

/**
 * Check whether an order can proceed to payment.
 */
function canPayOrder(order: Order): boolean {
  return (
    ["pending", "failed", "on-hold"].includes(order.status) &&
    Boolean(order.payment_url)
  );
}

/**
 * Export service.
 */
export const orderService = {
  getOrders,
  getOrder,
  createOrder,
  cancelOrder,
  preparePayment,
  canCancelOrder,
  canPayOrder,
};

export default orderService;