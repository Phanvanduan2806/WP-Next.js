"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { orderService } from "@/services/client/order.service";
import PayOSEmbeddedCheckout from "../../payos-embedded-checkout";

type PaymentState = "loading" | "ready" | "error";

export default function CheckoutPayPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const orderId = params.id;

  const [state, setState] = useState<PaymentState>("loading");
  const [paymentUrl, setPaymentUrl] = useState("");
  const [returnUrl, setReturnUrl] = useState("");
  const [error, setError] = useState("");

  const preparePayment = useCallback(async () => {
    if (!orderId || !/^[1-9]\d*$/.test(orderId)) {
      setError("Mã đơn hàng không hợp lệ.");
      setState("error");
      return;
    }

    setState("loading");
    setError("");
    setPaymentUrl("");
    setReturnUrl("");

    try {
      const response = await orderService.preparePayment(orderId);

      if (
        response?.success !== true ||
        typeof response.payment_url !== "string" ||
        !response.payment_url.trim()
      ) {
        throw new Error(
          response?.message ||
            "API chưa trả về đường dẫn thanh toán."
        );
      }

      let parsedPaymentUrl: URL;

      try {
        parsedPaymentUrl = new URL(response.payment_url);
      } catch {
        throw new Error("Đường dẫn thanh toán không hợp lệ.");
      }

      if (
        parsedPaymentUrl.protocol !== "https:" ||
        parsedPaymentUrl.hostname !== "pay.payos.vn"
      ) {
        throw new Error("Địa chỉ thanh toán PayOS không hợp lệ.");
      }

      if (
        typeof response.return_url !== "string" ||
        !response.return_url.trim()
      ) {
        throw new Error(
          "API chưa trả về URL quay lại sau thanh toán."
        );
      }

      let parsedReturnUrl: URL;

      try {
        parsedReturnUrl = new URL(response.return_url);
      } catch {
        throw new Error(
          "URL quay lại sau thanh toán không hợp lệ."
        );
      }

      if (
        !["http:", "https:"].includes(parsedReturnUrl.protocol) ||
        parsedReturnUrl.username ||
        parsedReturnUrl.password
      ) {
        throw new Error(
          "URL quay lại sau thanh toán không hợp lệ."
        );
      }

      setPaymentUrl(parsedPaymentUrl.toString());
      setReturnUrl(parsedReturnUrl.toString());
      setState("ready");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Không thể khởi tạo thanh toán. Vui lòng thử lại."
      );
      setState("error");
    }
  }, [orderId]);

  useEffect(() => {
    void preparePayment();
  }, [preparePayment]);

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">
            Thanh toán đơn hàng
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Mã đơn hàng: #{orderId}
          </p>
        </div>

        <button
          type="button"
          onClick={() => router.push("/account/orders")}
          className="text-sm text-gray-600 hover:text-black"
        >
          Quay lại đơn hàng
        </button>
      </div>

      {state === "loading" && (
        <section className="rounded-xl border p-8 text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-black" />

          <p className="font-medium">
            Đang khởi tạo thanh toán...
          </p>

          <p className="mt-2 text-sm text-gray-500">
            Vui lòng chờ trong giây lát.
          </p>
        </section>
      )}

      {state === "error" && (
        <section
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-6"
        >
          <h2 className="font-semibold text-red-700">
            Không thể khởi tạo thanh toán
          </h2>

          <p className="mt-2 break-words text-sm text-red-600">
            {error}
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => void preparePayment()}
              className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
            >
              Thử lại
            </button>

            <button
              type="button"
              onClick={() => router.push("/account/orders")}
              className="rounded-lg border px-4 py-2 text-sm hover:bg-white"
            >
              Quay lại đơn hàng
            </button>
          </div>
        </section>
      )}

      {state === "ready" && paymentUrl && (
        <section className="overflow-hidden rounded-xl border">
          <div className="border-b bg-gray-50 px-5 py-4">
            <h2 className="font-semibold">
              Thanh toán qua PayOS
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Hoàn tất thanh toán và chờ hệ thống xác nhận đơn hàng.
            </p>
          </div>

          {returnUrl ? (
            <PayOSEmbeddedCheckout
              paymentUrl={paymentUrl}
              returnUrl={returnUrl}
            />
          ) : (
            <div className="p-8 text-center text-sm text-gray-500">
              Đang chuẩn bị giao diện thanh toán...
            </div>
          )}

          <div className="border-t px-5 py-4 text-sm">
            Nếu giao diện thanh toán không hiển thị đúng, bạn có thể{" "}
            <a
              href={paymentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium underline"
            >
              mở PayOS trong tab mới
            </a>
            .
          </div>
        </section>
      )}
    </main>
  );
}