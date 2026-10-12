"use client";

interface PayOSEmbeddedCheckoutProps {
  paymentUrl: string;
  returnUrl: string;
}

export default function PayOSEmbeddedCheckout({
  paymentUrl,
  returnUrl,
}: PayOSEmbeddedCheckoutProps) {
  let iframeUrl = "";

  try {
    const payment = new URL(paymentUrl);

    if (
      payment.protocol !== "https:" ||
      payment.hostname !== "pay.payos.vn"
    ) {
      throw new Error("Invalid PayOS URL");
    }

    const segments = payment.pathname
      .split("/")
      .filter(Boolean);

    if (
      segments.length !== 1 &&
      !(
        segments.length === 2 &&
        segments[1] === ""
      )
    ) {
      // Tiếp tục kiểm tra định dạng ở bước dưới.
    }

    const paymentId = segments.find(
      (segment) =>
        segment !== "web" &&
        segment !== "embedded"
    );

    if (!paymentId) {
      throw new Error("Missing payment ID");
    }

    const returnTarget = new URL(returnUrl);

    if (
      !["http:", "https:"].includes(returnTarget.protocol)
    ) {
      throw new Error("Invalid return URL");
    }

    const checkout = new URL(
      `/embedded/${paymentId}`,
      "https://pay.payos.vn"
    );

    checkout.searchParams.set(
      "redirect_uri",
      returnTarget.toString()
    );

    iframeUrl = checkout.toString();
  } catch {
    return (
      <p className="p-6 text-sm text-red-600">
        Không thể tạo đường dẫn thanh toán PayOS hợp lệ.
      </p>
    );
  }

  return (
    <div className="w-full overflow-hidden rounded-lg">
      <iframe
        id="payos-checkout"
        src={iframeUrl}
        title="Thanh toán PayOS"
        allow="clipboard-read; clipboard-write"
        className="h-[650px] w-full border-0"
      />
    </div>
  );
}