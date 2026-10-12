
"use client";

import { useEffect } from "react";
import { useCheckout } from "@/hooks/useCheckout";

export default function CheckoutPage() {
  const {
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
    isSubmitting,
    error,
    fetchCheckout,
    submitCheckout,
  } = useCheckout();

  useEffect(() => {
    void fetchCheckout().catch(() => {});
  }, [fetchCheckout]);

  async function handleSubmit() {
    try {
      const result = await submitCheckout();
      const order = result.item;

      const redirectUrl =
        order.payment_method === "cod"
          ? order.order_received_url
          : order.payment_url || order.order_received_url;

      if (redirectUrl) {
        window.location.assign(redirectUrl);
      }
    } catch {
      // Hiển thị lỗi từ hook.
    }
  }

  if (isLoading) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-12">
        <p>Đang tải thông tin thanh toán...</p>
      </main>
    );
  }

  if (!checkout || !billing || !shipping) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-12">
        <p role="alert" className="text-red-600">
          {error ?? "Không thể tải thông tin checkout."}
        </p>
        <button
          type="button"
          onClick={() => void fetchCheckout().catch(() => {})}
          className="mt-4 rounded border px-4 py-2"
        >
          Thử lại
        </button>
      </main>
    );
  }

  const currency = checkout.cart.totals.currency;

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="mb-8 text-3xl font-bold">
        Thanh toán
      </h1>

      {error && (
        <div
          role="alert"
          className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      {checkout.cart.items.length === 0 ? (
        <div className="rounded-lg border p-6">
          <p>Giỏ hàng của bạn đang trống.</p>
          <a href="/shop" className="mt-3 inline-block underline">
            Tiếp tục mua sắm
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_380px]">
          <div className="space-y-8">
            <section className="rounded-xl border p-5 sm:p-6">
              <h2 className="mb-5 text-xl font-semibold">
                Thông tin thanh toán
              </h2>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="space-y-1">
                  <span className="text-sm">Họ *</span>
                  <input
                    required
                    autoComplete="family-name"
                    className="w-full rounded-lg border px-3 py-2.5"
                    value={billing.last_name}
                    onChange={(e) =>
                      setBilling({
                        ...billing,
                        last_name: e.target.value,
                      })
                    }
                  />
                </label>

                <label className="space-y-1">
                  <span className="text-sm">Tên *</span>
                  <input
                    required
                    autoComplete="given-name"
                    className="w-full rounded-lg border px-3 py-2.5"
                    value={billing.first_name}
                    onChange={(e) =>
                      setBilling({
                        ...billing,
                        first_name: e.target.value,
                      })
                    }
                  />
                </label>

                <label className="space-y-1">
                  <span className="text-sm">Email *</span>
                  <input
                    required
                    type="email"
                    autoComplete="email"
                    className="w-full rounded-lg border px-3 py-2.5"
                    value={billing.email ?? ""}
                    onChange={(e) =>
                      setBilling({
                        ...billing,
                        email: e.target.value,
                      })
                    }
                  />
                </label>

                <label className="space-y-1">
                  <span className="text-sm">Số điện thoại</span>
                  <input
                    type="tel"
                    autoComplete="tel"
                    className="w-full rounded-lg border px-3 py-2.5"
                    value={billing.phone ?? ""}
                    onChange={(e) =>
                      setBilling({
                        ...billing,
                        phone: e.target.value,
                      })
                    }
                  />
                </label>

                <label className="space-y-1 sm:col-span-2">
                  <span className="text-sm">Địa chỉ *</span>
                  <input
                    required
                    autoComplete="street-address"
                    className="w-full rounded-lg border px-3 py-2.5"
                    value={billing.address_1}
                    onChange={(e) =>
                      setBilling({
                        ...billing,
                        address_1: e.target.value,
                      })
                    }
                  />
                </label>

                <label className="space-y-1">
                  <span className="text-sm">Tỉnh / Thành phố *</span>
                  <input
                    required
                    autoComplete="address-level2"
                    className="w-full rounded-lg border px-3 py-2.5"
                    value={billing.city}
                    onChange={(e) =>
                      setBilling({
                        ...billing,
                        city: e.target.value,
                      })
                    }
                  />
                </label>

                <label className="space-y-1">
                  <span className="text-sm">Quốc gia</span>
                  <input
                    autoComplete="country"
                    className="w-full rounded-lg border px-3 py-2.5"
                    value={billing.country}
                    onChange={(e) =>
                      setBilling({
                        ...billing,
                        country: e.target.value.toUpperCase(),
                      })
                    }
                  />
                </label>
              </div>
            </section>

            <section className="rounded-xl border p-5 sm:p-6">
              <h2 className="mb-4 text-xl font-semibold">
                Địa chỉ giao hàng
              </h2>

              <p className="mb-4 text-sm text-gray-500">
                Mặc định sử dụng địa chỉ thanh toán nếu bạn không
                thay đổi thông tin giao hàng.
              </p>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="space-y-1">
                  <span className="text-sm">Họ</span>
                  <input
                    className="w-full rounded-lg border px-3 py-2.5"
                    value={shipping.last_name}
                    onChange={(e) =>
                      setShipping({
                        ...shipping,
                        last_name: e.target.value,
                      })
                    }
                  />
                </label>

                <label className="space-y-1">
                  <span className="text-sm">Tên</span>
                  <input
                    className="w-full rounded-lg border px-3 py-2.5"
                    value={shipping.first_name}
                    onChange={(e) =>
                      setShipping({
                        ...shipping,
                        first_name: e.target.value,
                      })
                    }
                  />
                </label>

                <label className="space-y-1 sm:col-span-2">
                  <span className="text-sm">Địa chỉ</span>
                  <input
                    className="w-full rounded-lg border px-3 py-2.5"
                    value={shipping.address_1}
                    onChange={(e) =>
                      setShipping({
                        ...shipping,
                        address_1: e.target.value,
                      })
                    }
                  />
                </label>

                <label className="space-y-1 sm:col-span-2">
                  <span className="text-sm">Tỉnh / Thành phố</span>
                  <input
                    className="w-full rounded-lg border px-3 py-2.5"
                    value={shipping.city}
                    onChange={(e) =>
                      setShipping({
                        ...shipping,
                        city: e.target.value,
                      })
                    }
                  />
                </label>
              </div>
            </section>

            <section className="rounded-xl border p-5 sm:p-6">
              <h2 className="mb-4 text-xl font-semibold">
                Phương thức thanh toán
              </h2>

              <div className="space-y-3">
                {checkout.payment_methods
                  .filter((method) => method.enabled)
                  .map((method) => (
                    <label
                      key={method.id}
                      className="flex cursor-pointer items-start gap-3 rounded-lg border p-4"
                    >
                      <input
                        type="radio"
                        name="payment_method"
                        value={method.id}
                        checked={paymentMethod === method.id}
                        onChange={() =>
                          setPaymentMethod(method.id)
                        }
                        className="mt-1"
                      />

                      <span>
                        <span className="block font-medium">
                          {method.title}
                        </span>
                        {method.description && (
                          <span className="mt-1 block text-sm text-gray-500">
                            {method.description}
                          </span>
                        )}
                      </span>
                    </label>
                  ))}

                {checkout.payment_methods.filter(
                  (method) => method.enabled,
                ).length === 0 && (
                  <p className="text-sm text-red-600">
                    Hiện không có phương thức thanh toán khả dụng.
                  </p>
                )}
              </div>
            </section>

            <section className="rounded-xl border p-5 sm:p-6">
              <label className="block space-y-2">
                <span className="text-lg font-semibold">
                  Ghi chú đơn hàng
                </span>
                <textarea
                  rows={3}
                  className="w-full rounded-lg border px-3 py-2.5"
                  placeholder="Ghi chú về đơn hàng hoặc giao hàng..."
                  value={customerNote}
                  onChange={(e) => setCustomerNote(e.target.value)}
                />
              </label>
            </section>
          </div>

          <aside className="h-fit rounded-xl border p-5 sm:p-6 lg:sticky lg:top-6">
            <h2 className="mb-5 text-xl font-semibold">
              Đơn hàng của bạn
            </h2>

            <div className="space-y-4">
              {checkout.cart.items.map((item) => (
                <div
                  key={item.key}
                  className="flex gap-3"
                >
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-16 w-16 rounded-lg border object-cover"
                    />
                  )}

                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-gray-500">
                      Số lượng: {item.quantity}
                    </p>
                  </div>

                  <p className="shrink-0 text-sm font-medium">
                    {item.line_total} {currency}
                  </p>
                </div>
              ))}
            </div>

            <div className="my-5 space-y-3 border-t pt-5 text-sm">
              <div className="flex justify-between gap-4">
                <span>Tạm tính</span>
                <span>{checkout.cart.totals.subtotal} {currency}</span>
              </div>

              <div className="flex justify-between gap-4">
                <span>Giảm giá</span>
                <span>-{checkout.cart.totals.discount} {currency}</span>
              </div>

              <div className="flex justify-between gap-4">
                <span>Vận chuyển</span>
                <span>{checkout.cart.totals.shipping} {currency}</span>
              </div>

              <div className="flex justify-between gap-4">
                <span>Thuế</span>
                <span>{checkout.cart.totals.tax} {currency}</span>
              </div>

              <div className="flex justify-between gap-4 border-t pt-4 text-base font-bold">
                <span>Tổng cộng</span>
                <span>{checkout.cart.totals.total} {currency}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={
                isSubmitting ||
                checkout.cart.items.length === 0 ||
                !paymentMethod
              }
              className="w-full rounded-lg bg-black px-5 py-3 font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? "Đang tạo đơn hàng..." : "Đặt hàng"}
            </button>

            <p className="mt-3 text-center text-xs text-gray-500">
              Thông tin đơn hàng sẽ được xác nhận sau khi đặt hàng.
            </p>
          </aside>
        </div>
      )}
    </main>
  );
}
