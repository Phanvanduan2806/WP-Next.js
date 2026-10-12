import type {
  CheckoutPayload,
  CheckoutResponse,
  CheckoutValidationResponse,
  CreateOrderResponse,
  CheckoutErrorResponse,
} from "@/services/types/checkout";

const CHECKOUT_API = "/api/checkout";
const VALIDATE_API = "/api/checkout/validate";

async function request<T>(
  url: string,
  init?: RequestInit,
): Promise<T> {
  let response: Response;

  try {
    response = await fetch(url, {
      ...init,
      headers: {
        Accept: "application/json",
        ...(init?.body !== undefined
          ? { "Content-Type": "application/json" }
          : {}),
        ...init?.headers,
      },
      cache: "no-store",
    });
  } catch {
    throw new Error("Không thể kết nối đến máy chủ.");
  }

  const contentType = response.headers.get("content-type") ?? "";

  if (!contentType.includes("application/json")) {
    throw new Error("Phản hồi từ máy chủ không hợp lệ.");
  }

  const data = await response.json();

  if (!response.ok || data?.success === false) {
    const errorData = data as CheckoutErrorResponse;

    throw new Error(
      errorData.message || "Đã xảy ra lỗi khi checkout.",
    );
  }

  return data as T;
}

export const checkoutService = {
  getCheckout(): Promise<CheckoutResponse> {
    return request<CheckoutResponse>(CHECKOUT_API, {
      method: "GET",
    });
  },

  validateCheckout(
    payload: CheckoutPayload,
  ): Promise<CheckoutValidationResponse> {
    return request<CheckoutValidationResponse>(VALIDATE_API, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  createOrder(
    payload: CheckoutPayload,
  ): Promise<CreateOrderResponse> {
    return request<CreateOrderResponse>(CHECKOUT_API, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
};
