
"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { cartService } from "@/services/client/cart.service";
import type {
  CartAddItemInput,
  CartData,
  CartItem,
  CartState,
} from "@/services/types/cart";

const initialState: CartState = {
  items: [],
  coupons: [],
  totals: null,
  isLoading: true,
  error: null,
};

const emptyState: CartState = {
  items: [],
  coupons: [],
  totals: null,
  isLoading: false,
  error: null,
};

export function useCart() {
  const [state, setState] = useState<CartState>(initialState);
  const [isMutating, setIsMutating] = useState(false);

  // Vô hiệu hóa các request cũ khi logout hoặc có request mới.
  const requestVersionRef = useRef(0);

  const applyCart = useCallback((cart: CartData) => {
    setState({
      items: cart.items,
      coupons: cart.coupons ?? [],
      totals: cart.totals,
      isLoading: false,
      error: null,
    });
  }, []);

  const resetCart = useCallback(() => {
    requestVersionRef.current += 1;

    setState(emptyState);
    setIsMutating(false);
  }, []);

  const fetchCart = useCallback(async (): Promise<CartData | null> => {
    const requestVersion = ++requestVersionRef.current;

    setState((previous) => ({
      ...previous,
      isLoading: true,
      error: null,
    }));

    try {
      const cart = await cartService.getCart();

      if (requestVersion !== requestVersionRef.current) {
        return null;
      }

      applyCart(cart);
      return cart;
    } catch (error) {
      if (requestVersion !== requestVersionRef.current) {
        return null;
      }

      const message =
        error instanceof Error
          ? error.message
          : "Không thể tải giỏ hàng.";

      setState((previous) => ({
        ...previous,
        isLoading: false,
        error: message,
      }));

      return null;
    }
  }, [applyCart]);

  const mutateCart = useCallback(
    async (action: () => Promise<CartData>): Promise<CartData> => {
      const requestVersion = requestVersionRef.current;

      setIsMutating(true);
      setState((previous) => ({
        ...previous,
        error: null,
      }));

      try {
        const cart = await action();

        if (requestVersion === requestVersionRef.current) {
          applyCart(cart);
        }

        return cart;
      } catch (error) {
        if (requestVersion === requestVersionRef.current) {
          const message =
            error instanceof Error
              ? error.message
              : "Không thể cập nhật giỏ hàng.";

          setState((previous) => ({
            ...previous,
            error: message,
          }));
        }

        throw error;
      } finally {
        if (requestVersion === requestVersionRef.current) {
          setIsMutating(false);
        }
      }
    },
    [applyCart],
  );

  const addItem = useCallback(
    (input: CartAddItemInput) =>
      mutateCart(() => cartService.addItem(input)),
    [mutateCart],
  );

  const updateQuantity = useCallback(
    (key: string, quantity: number) => {
      if (!Number.isSafeInteger(quantity) || quantity < 0) {
        return Promise.reject(
          new Error("Số lượng phải là số nguyên không âm."),
        );
      }

      return mutateCart(() =>
        cartService.updateItem(key, { quantity }),
      );
    },
    [mutateCart],
  );

  const removeItem = useCallback(
    (key: string) =>
      mutateCart(() => cartService.removeItem(key)),
    [mutateCart],
  );

  const clearCart = useCallback(
    () => mutateCart(() => cartService.clearCart()),
    [mutateCart],
  );

  const applyCoupon = useCallback(
    (code: string) => {
      if (!code.trim()) {
        return Promise.reject(
          new Error("Vui lòng nhập mã giảm giá."),
        );
      }

      return mutateCart(() =>
        cartService.applyCoupon({ code: code.trim() }),
      );
    },
    [mutateCart],
  );

  const removeCoupon = useCallback(
    (code: string) =>
      mutateCart(() => cartService.removeCoupon(code)),
    [mutateCart],
  );

  const refreshCart = useCallback(
    () => fetchCart(),
    [fetchCart],
  );

  useEffect(() => {
    const handleLoggedOut = () => {
      resetCart();
    };

    const handleCartReset = () => {
      resetCart();
    };

    window.addEventListener("auth:logged-out", handleLoggedOut);
    window.addEventListener("cart:reset", handleCartReset);

    void fetchCart();

    return () => {
      window.removeEventListener("auth:logged-out", handleLoggedOut);
      window.removeEventListener("cart:reset", handleCartReset);

      // Vô hiệu hóa request còn chạy khi hook unmount.
      requestVersionRef.current += 1;
    };
  }, [fetchCart, resetCart]);

  const totalItems =
    state.totals?.count ??
    state.items.reduce((sum, item) => sum + item.quantity, 0);

  return {
    ...state,
    totalItems,
    isMutating,
    fetchCart,
    refreshCart,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    applyCoupon,
    removeCoupon,
  };
}

export type UseCartReturn = ReturnType<typeof useCart>;
export type { CartItem };
