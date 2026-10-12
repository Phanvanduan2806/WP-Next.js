"use client";

import { useCallback, useState } from "react";
import { checkoutService } from "@/services/client/checkout.service";

import type {
  CheckoutAddress,
  CheckoutPayload,
  CheckoutResponse,
  CheckoutValidationResponse,
  CreateOrderResponse,
} from "@/services/types/checkout";

export function useCheckout() {
  const [checkout, setCheckout] =
    useState<CheckoutResponse | null>(null);

  const [billing, setBilling] =
    useState<CheckoutAddress | null>(null);

  const [shipping, setShipping] =
    useState<CheckoutAddress | null>(null);

  const [paymentMethod, setPaymentMethod] =
    useState("cod");

  const [customerNote, setCustomerNote] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCheckout = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await checkoutService.getCheckout();

      setCheckout(data);
      setBilling(data.billing);
      setShipping(data.shipping);

      setPaymentMethod(
        data.payment_methods.find((method) => method.enabled)?.id ??
          "",
      );

      return data;
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Không thể tải thông tin checkout.";

      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const buildPayload = useCallback((): CheckoutPayload => {
    if (!billing) {
      throw new Error("Vui lòng nhập thông tin thanh toán.");
    }

    if (!paymentMethod) {
      throw new Error("Vui lòng chọn phương thức thanh toán.");
    }

    return {
      billing,
      shipping: shipping ?? billing,
      payment_method: paymentMethod,
      customer_note: customerNote,
    };
  }, [billing, shipping, paymentMethod, customerNote]);

  const validateCheckout =
    useCallback(async (): Promise<CheckoutValidationResponse> => {
      setIsValidating(true);
      setError(null);

      try {
        const result = await checkoutService.validateCheckout(
          buildPayload(),
        );

        return result;
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Thông tin checkout không hợp lệ.";

        setError(message);
        throw err;
      } finally {
        setIsValidating(false);
      }
    }, [buildPayload]);

  const submitCheckout =
    useCallback(async (): Promise<CreateOrderResponse> => {
      setIsSubmitting(true);
      setError(null);

      try {
        const result = await checkoutService.createOrder(
          buildPayload(),
        );

        return result;
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Không thể tạo đơn hàng.";

        setError(message);
        throw err;
      } finally {
        setIsSubmitting(false);
      }
    }, [buildPayload]);

  return {
    checkout,
    billing,
    setBilling,
    shipping,
    setShipping,
    paymentMethod,
    setPaymentMethod,
    customerNote,
    setCustomerNote,

    isLoading,
    isValidating,
    isSubmitting,
    error,

    fetchCheckout,
    validateCheckout,
    submitCheckout,
  };
}
