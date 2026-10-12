"use client";

import { useCallback, useEffect, useState } from "react";

import { orderService } from "@/services/client/order.service";

import type { CreateOrderInput, Order } from "@/services/types/order";

/**
 * =========================================================
 * USE ORDERS HOOK
 * =========================================================
 */

interface UseOrdersOptions {
  enabled?: boolean;
  page?: number;
  perPage?: number;
}

interface UseOrdersReturn {
  // Data
  orders: Order[];
  selectedOrder: Order | null;
  total: number;
  totalPages: number;
  currentPage: number;

  // Loading states
  isLoading: boolean;
  isDetailLoading: boolean;
  isMutating: boolean;
  cancellingId: number | null;
  payingId: number | null;

  // Error / success messages
  error: string | null;
  notice: string | null;

  // Actions
  clearMessages: () => void;
  fetchOrders: () => Promise<void>;
  fetchOrder: (id: number | string) => Promise<Order | null>;
  createOrder: (input: CreateOrderInput) => Promise<Order | null>;
  cancelOrder: (id: number | string) => Promise<boolean>;
  preparePayment: (id: number | string) => Promise<string | null>;

  // Helpers
  canCancelOrder: (order: Order) => boolean;
  canPayOrder: (order: Order) => boolean;
}

/**
 * =========================================================
 * HOOK IMPLEMENTATION
 * =========================================================
 */

export function useOrders(options: UseOrdersOptions = {}): UseOrdersReturn {
  const {
    enabled = true,
    page: initialPage = 1,
    perPage: initialPerPage = 10,
  } = options;

  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(initialPage);

  const [isLoading, setIsLoading] = useState(false);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [isMutating, setIsMutating] = useState(false);

  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const [payingId, setPayingId] = useState<number | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  /**
   * Clear feedback messages.
   */
  const clearMessages = useCallback(() => {
    setError(null);
    setNotice(null);
  }, []);

  /**
   * Fetch customer orders.
   */
  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await orderService.getOrders({
        page: currentPage,
        perPage: initialPerPage,
      });

      setOrders(response.items ?? []);
      setTotal(response.total ?? 0);
      setTotalPages(response.total_pages ?? 0);
      setCurrentPage(response.current_page ?? currentPage);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Không thể tải danh sách đơn hàng.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, initialPerPage]);

  /**
   * Fetch a single order.
   */
  const fetchOrder = useCallback(
    async (id: number | string): Promise<Order | null> => {
      setIsDetailLoading(true);
      setError(null);

      try {
        const order = await orderService.getOrder(id);
        setSelectedOrder(order);
        return order;
      } catch (err) {
        setSelectedOrder(null);
        setError(
          err instanceof Error
            ? err.message
            : "Không thể tải thông tin đơn hàng.",
        );
        return null;
      } finally {
        setIsDetailLoading(false);
      }
    },
    [],
  );

  /**
   * Create a new order.
   */
  const createOrder = useCallback(
    async (input: CreateOrderInput): Promise<Order | null> => {
      setIsMutating(true);
      setError(null);
      setNotice(null);

      try {
        const response = await orderService.createOrder(input);

        if (!response.success || !response.item) {
          throw new Error(response.message || "Không thể tạo đơn hàng.");
        }

        setSelectedOrder(response.item);
        setNotice(response.message || "Tạo đơn hàng thành công.");

        await fetchOrders();

        return response.item;
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Đã xảy ra lỗi khi tạo đơn hàng.",
        );
        return null;
      } finally {
        setIsMutating(false);
      }
    },
    [fetchOrders],
  );

  /**
   * Cancel an order.
   */
  const cancelOrder = useCallback(
    async (id: number | string): Promise<boolean> => {
      const orderId = Number(id);

      if (!Number.isInteger(orderId) || orderId <= 0) {
        setError("ID đơn hàng không hợp lệ.");
        return false;
      }

      setCancellingId(orderId);
      setError(null);
      setNotice(null);

      try {
        const response = await orderService.cancelOrder(orderId);

        if (!response.success) {
          throw new Error(response.message || "Không thể hủy đơn hàng.");
        }

        if (response.item) {
          setSelectedOrder((current) =>
            current?.id === response.item.id ? response.item : current,
          );
        }

        setNotice(response.message || "Đã hủy đơn hàng.");

        await fetchOrders();

        return true;
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Đã xảy ra lỗi khi hủy đơn hàng.",
        );
        return false;
      } finally {
        setCancellingId(null);
      }
    },
    [fetchOrders],
  );

  /**
   * Prepare PayOS payment and return the payment URL.
   *
   * API response:
   * {
   *   success: true,
   *   order_id: number,
   *   payment_url: string,
   *   status?: string
   * }
   */
  const preparePayment = useCallback(
    async (id: number | string): Promise<string | null> => {
      const orderId = Number(id);

      if (!Number.isInteger(orderId) || orderId <= 0) {
        setError("ID đơn hàng không hợp lệ.");
        return null;
      }

      setPayingId(orderId);
      setError(null);
      setNotice(null);

      try {
        const response = await orderService.preparePayment(orderId);

        if (
          response.success !== true ||
          typeof response.payment_url !== "string" ||
          !response.payment_url.trim()
        ) {
          throw new Error(response.message || "Không thể chuẩn bị thanh toán.");
        }

        const paymentUrl = new URL(response.payment_url);

        if (
          paymentUrl.protocol !== "https:" ||
          paymentUrl.hostname !== "pay.payos.vn"
        ) {
          throw new Error("Địa chỉ thanh toán PayOS không hợp lệ.");
        }

        if (
          typeof response.return_url !== "string" ||
          !response.return_url.trim()
        ) {
          throw new Error("API chưa trả về URL quay lại sau thanh toán.");
        }

        const returnUrl = new URL(response.return_url);

        if (
          !["http:", "https:"].includes(returnUrl.protocol) ||
          returnUrl.username ||
          returnUrl.password
        ) {
          throw new Error("URL quay lại sau thanh toán không hợp lệ.");
        }

        setNotice("Đã chuẩn bị thanh toán.");

        return paymentUrl.toString();
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Đã xảy ra lỗi khi chuẩn bị thanh toán.",
        );

        return null;
      } finally {
        setPayingId(null);
      }
    },
    [],
  );

  /**
   * UI helper: can the order be cancelled?
   */
  const canCancelOrder = useCallback(
    (order: Order) => orderService.canCancelOrder(order),
    [],
  );

  /**
   * UI helper: can the order proceed to payment?
   */
  const canPayOrder = useCallback(
    (order: Order) => orderService.canPayOrder(order),
    [],
  );

  /**
   * Automatically fetch the order list.
   */
  useEffect(() => {
    if (!enabled) {
      return;
    }

    void fetchOrders();
  }, [enabled, fetchOrders]);

  return {
    // Data
    orders,
    selectedOrder,
    total,
    totalPages,
    currentPage,

    // Loading
    isLoading,
    isDetailLoading,
    isMutating,
    cancellingId,
    payingId,

    // Feedback
    error,
    notice,

    // Actions
    clearMessages,
    fetchOrders,
    fetchOrder,
    createOrder,
    cancelOrder,
    preparePayment,

    // Helpers
    canCancelOrder,
    canPayOrder,
  };
}
