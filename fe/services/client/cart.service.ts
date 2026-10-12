
import type {
  CartAddItemInput,
  CartApplyCouponInput,
  CartData,
  CartUpdateItemInput,
} from "@/services/types/cart";

const CART_API_URL = "/api/cart";

async function request<T>(
  endpoint: string,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(`${CART_API_URL}${endpoint}`, {
    ...init,
    credentials: "same-origin",
    cache: "no-store",
    headers: {
      Accept: "application/json",
      ...(init?.body !== undefined
        ? { "Content-Type": "application/json" }
        : {}),
      ...init?.headers,
    },
  });

  const data = await response.json().catch(() => null);

  if (!response.ok || data?.success === false) {
    throw new Error(
      typeof data?.message === "string"
        ? data.message
        : "Không thể xử lý giỏ hàng. Vui lòng thử lại.",
    );
  }

  return data as T;
}

export const cartService = {
  async getCart(): Promise<CartData> {
    return request<CartData>("");
  },

  async addItem(input: CartAddItemInput): Promise<CartData> {
    return request<CartData>("/items", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  async updateItem(
    key: string,
    input: CartUpdateItemInput,
  ): Promise<CartData> {
    return request<CartData>(
      `/items/${encodeURIComponent(key)}`,
      {
        method: "PATCH",
        body: JSON.stringify(input),
      },
    );
  },

  async removeItem(key: string): Promise<CartData> {
    return request<CartData>(
      `/items/${encodeURIComponent(key)}`,
      { method: "DELETE" },
    );
  },

  async clearCart(): Promise<CartData> {
    return request<CartData>("", {
      method: "DELETE",
    });
  },

  async applyCoupon(
    input: CartApplyCouponInput,
  ): Promise<CartData> {
    const code = input.code.trim();

    if (!code) {
      throw new Error("Vui lòng nhập mã giảm giá.");
    }

    return request<CartData>("/coupons", {
      method: "POST",
      body: JSON.stringify({ code }),
    });
  },

  async removeCoupon(code: string): Promise<CartData> {
    const normalizedCode = code.trim();

    if (!normalizedCode) {
      throw new Error("Mã giảm giá không hợp lệ.");
    }

    return request<CartData>(
      `/coupons/${encodeURIComponent(normalizedCode)}`,
      { method: "DELETE" },
    );
  },
};
