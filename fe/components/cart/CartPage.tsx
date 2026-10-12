"use client";
import { useCallback, useState, type FormEvent } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import {
  ShoppingBag,
  ShoppingCart,
  Trash2,
  Minus,
  Plus,
  ArrowRight,
  RefreshCw,
  PackageCheck,
  ArrowLeft,
  ShieldCheck,
  TicketPercent,
  X,
} from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { CART_UPDATED_EVENT } from "@/lib/cart-events";
function formatPrice(amount: number, currency: string) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: currency || "VND",
    maximumFractionDigits: 0,
  }).format(amount);
}
/**
 * Chuyển slug/key thuộc tính WooCommerce thành tên dễ đọc.
 *
 * Ví dụ:
 * attribute_pa_mau-sac -> Màu sắc
 * attribute_pa_phien-ban -> Phiên bản
 */
function formatAttributeName(name: string): string {
  const normalized = name
    .replace(/^attribute_/, "")
    .replace(/^pa_/, "")
    .replace(/[-_]+/g, " ")
    .trim()
    .toLocaleLowerCase("vi-VN");
  const knownNames: Record<string, string> = {
    "mau sac": "Màu sắc",
    "phien ban": "Phiên bản",
    "dung luong": "Dung lượng",
    "kich thuoc": "Kích thước",
    "chat lieu": "Chất liệu",
    "mau": "Màu sắc",
    "size": "Kích thước",
    "color": "Màu sắc",
    "colour": "Màu sắc",
    "version": "Phiên bản",
    "storage": "Dung lượng",
    "capacity": "Dung lượng",
    "material": "Chất liệu",
  };
  return (
    knownNames[normalized] ??
    normalized.replace(/\b\w/g, (char) => char.toLocaleUpperCase("vi-VN"))
  );
}
/**
 * Chuyển giá trị slug thành nhãn dễ đọc.
 *
 * Ví dụ:
 * mau-cam -> Màu cam
 * 64gb -> 64GB
 *
 * Nếu API đã trả về nhãn có dấu thì giữ nguyên nhãn đó.
 */
function formatAttributeValue(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  const normalized = trimmed.toLocaleLowerCase("vi-VN");
  const knownValues: Record<string, string> = {
    "mau-cam": "Màu cam",
    "mau-den": "Màu đen",
    "mau-hong": "Màu hồng",
    "mau-mam-tom": "Màu mắm tôm",
    "mau-xam-xi-mang": "Màu xám xi măng",
    "64gb": "64GB",
    "128gb": "128GB",
    "256gb": "256GB",
    "512gb": "512GB",
    "1tb": "1TB",
    "2tb": "2TB",
  };
  if (knownValues[normalized]) {
    return knownValues[normalized];
  }
  // Giá trị có dấu thường đã là tên hiển thị từ WooCommerce.
  if (/[à-ỹÀ-Ỹ]/u.test(trimmed)) {
    return trimmed;
  }
  return trimmed
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (char) => char.toLocaleUpperCase("vi-VN"));
}
/**
 * Chuẩn hóa các thuộc tính biến thể để hiển thị trong giỏ hàng.
 */
function getVariationEntries(variation: Record<string, string> | undefined) {
  if (!variation) return [];
  return Object.entries(variation)
    .filter(([, value]) => typeof value === "string" && value.trim() !== "")
    .map(([name, value]) => ({
      name: formatAttributeName(name),
      value: formatAttributeValue(value),
    }));
}
export default function CartPage() {
  const {
    items,
    coupons,
    totals,
    isLoading,
    isMutating,
    error,
    refreshCart,
    updateQuantity,
    removeItem,
    clearCart,
    applyCoupon,
    removeCoupon,
  } = useCart();
  const currency = totals?.currency || "VND";
  const [couponCode, setCouponCode] = useState("");
  const [couponMessage, setCouponMessage] = useState("");
  const [couponMessageType, setCouponMessageType] = useState<"success" | "error" | "">("");
  const notifyCartUpdated = useCallback(() => {
    window.dispatchEvent(new Event(CART_UPDATED_EVENT));
  }, []);
  const handleApplyCoupon = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const code = couponCode.trim();
      if (!code) {
        setCouponMessage("Vui lòng nhập mã giảm giá.");
        setCouponMessageType("error");
        return;
      }
      setCouponMessage("");
      setCouponMessageType("");
      try {
        await applyCoupon(code);
        setCouponCode("");
        setCouponMessage("Áp dụng mã giảm giá thành công.");
        setCouponMessageType("success");
        notifyCartUpdated();
      } catch (err) {
        setCouponMessage(
          err instanceof Error ? err.message : "Không thể áp dụng mã giảm giá.",
        );
        setCouponMessageType("error");
      }
    },
    [couponCode, applyCoupon, notifyCartUpdated],
  );
  const handleRemoveCoupon = useCallback(
    async (code: string) => {
      setCouponMessage("");
      setCouponMessageType("");
      try {
        await removeCoupon(code);
        setCouponMessage("Đã gỡ mã giảm giá.");
        setCouponMessageType("success");
        notifyCartUpdated();
      } catch (err) {
        setCouponMessage(
          err instanceof Error ? err.message : "Không thể gỡ mã giảm giá.",
        );
        setCouponMessageType("error");
      }
    },
    [removeCoupon, notifyCartUpdated],
  );
  const handleUpdateQuantity = useCallback(
    async (key: string, quantity: number) => {
      try {
        await updateQuantity(key, quantity);
        notifyCartUpdated();
      } catch {
        // useCart chịu trách nhiệm lưu và hiển thị lỗi.
      }
    },
    [updateQuantity, notifyCartUpdated],
  );
  const handleRemoveItem = useCallback(
    async (key: string) => {
      try {
        await removeItem(key);
        notifyCartUpdated();
      } catch {
        // Không thông báo cập nhật nếu API thất bại.
      }
    },
    [removeItem, notifyCartUpdated],
  );
  const handleClearCart = useCallback(async () => {
    if (!window.confirm("Bạn có chắc muốn xóa toàn bộ giỏ hàng?")) {
      return;
    }
    try {
      await clearCart();
      notifyCartUpdated();
    } catch {
      // Không thông báo cập nhật nếu API thất bại.
    }
  }, [clearCart, notifyCartUpdated]);
  if (isLoading) {
    return (
      <main className="min-h-[60vh] px-4 py-24">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-4">
          <RefreshCw className="h-7 w-7 animate-spin text-neutral-400" />
          <p className="text-sm text-neutral-500">
            Đang tải giỏ hàng...
          </p>
        </div>
      </main>
    );
  }
  if (!totals) {
    return (
      <main className="mx-auto flex min-h-[60vh] max-w-7xl flex-col items-center justify-center px-4 py-16 text-center">
        <ShoppingBag className="h-10 w-10 text-neutral-400" />
        <h1 className="mt-5 text-xl font-semibold text-neutral-900">
          Không thể tải giỏ hàng
        </h1>
        <p className="mt-2 max-w-md text-sm text-neutral-500">
          {error || "Vui lòng kiểm tra kết nối rồi thử lại."}
        </p>
        <button
          type="button"
          onClick={() => void refreshCart()}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-neutral-900 px-5 py-3 text-sm font-medium text-white hover:bg-neutral-700"
        >
          <RefreshCw className="h-4 w-4" />
          Thử lại
        </button>
      </main>
    );
  }
  if (items.length === 0) {
    return (
      <main className="mx-auto flex min-h-[65vh] max-w-7xl items-center justify-center px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex max-w-md flex-col items-center text-center"
        >
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-neutral-100">
            <ShoppingBag className="h-10 w-10 text-neutral-500" />
          </div>
          <h1 className="mt-7 text-2xl font-semibold tracking-tight text-neutral-900 sm:text-3xl">
            Giỏ hàng đang trống
          </h1>
          <p className="mt-3 text-sm leading-6 text-neutral-500">
            Khám phá các sản phẩm và thêm những món đồ bạn yêu thích vào giỏ hàng.
          </p>
          {error && (
            <p role="alert" className="mt-4 text-sm text-red-600">
              {error}
            </p>
          )}
          <Link
            href="/shop"
            className="mt-7 inline-flex items-center gap-2 rounded-xl bg-neutral-900 px-6 py-3.5 text-sm font-medium text-white transition hover:bg-neutral-700"
          >
            <ShoppingCart className="h-4 w-4" />
            Khám phá sản phẩm
            <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>
      </main>
    );
  }
  return (
    <main className="min-h-screen bg-neutral-50/70">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <nav className="mb-6 flex items-center gap-2 text-sm text-neutral-500">
          <Link href="/" className="transition hover:text-neutral-900">
            Trang chủ
          </Link>
          <span>/</span>
          <span className="font-medium text-neutral-900">Giỏ hàng</span>
        </nav>
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-neutral-950 sm:text-4xl">
              Giỏ hàng
            </h1>
            <p className="mt-2 text-sm text-neutral-500">
              {totals.count} sản phẩm trong giỏ hàng
            </p>
          </div>
          <button
            type="button"
            disabled={isMutating}
            onClick={() => void handleClearCart()}
            className="text-sm text-neutral-500 underline-offset-4 transition hover:text-red-600 hover:underline disabled:opacity-50"
          >
            Xóa toàn bộ
          </button>
        </div>
        {error && (
          <div
            role="alert"
            className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            <span>{error}</span>
            <button
              type="button"
              onClick={() => void refreshCart()}
              className="font-medium underline"
            >
              Thử tải lại
            </button>
          </div>
        )}
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-8">
          <section className="min-w-0 overflow-hidden rounded-2xl border border-neutral-200 bg-white">
            <div className="hidden grid-cols-[minmax(0,1fr)_100px_120px_110px_36px] gap-4 border-b border-neutral-200 bg-neutral-50/80 px-5 py-4 text-[11px] font-semibold uppercase tracking-wider text-neutral-500 md:grid">
              <span>Sản phẩm</span>
              <span className="text-center">Đơn giá</span>
              <span className="text-center">Số lượng</span>
              <span className="text-right">Thành tiền</span>
              <span />
            </div>
            <AnimatePresence initial={false}>
              {items.map((item) => {
                const variationEntries = getVariationEntries(item.variation);
                return (
                  <motion.article
                    key={item.key}
                    layout
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -16 }}
                    transition={{
                      layout: { duration: 0.25 },
                      opacity: { duration: 0.2 },
                    }}
                    className="grid grid-cols-1 gap-4 border-b border-neutral-100 p-4 last:border-b-0 sm:p-5 md:grid-cols-[minmax(0,1fr)_100px_120px_110px_36px] md:items-center md:gap-4"
                  >
                    <div className="flex min-w-0 items-center gap-4">
                      <Link
                        href={item.permalink || "/shop"}
                        className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-neutral-100 sm:h-28 sm:w-28"
                      >
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            loading="lazy"
                            className="h-full w-full object-cover transition duration-300 hover:scale-105"
                          />
                        ) : (
                          <ShoppingBag className="h-8 w-8 text-neutral-400" />
                        )}
                      </Link>
                      <div className="min-w-0 flex-1">
                        <Link
                          href={item.permalink || "/shop"}
                          className="line-clamp-2 text-sm font-semibold leading-5 text-neutral-900 transition hover:text-neutral-600"
                        >
                          {item.name}
                        </Link>
                        {item.sku && (
                          <p className="mt-1.5 text-xs text-neutral-500">
                            SKU: {item.sku}
                          </p>
                        )}
                        {variationEntries.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {variationEntries.map(({ name, value }) => (
                              <span
                                key={name}
                                className="inline-flex items-center gap-1 rounded-md border border-neutral-200 bg-neutral-50 px-2 py-1 text-xs text-neutral-600"
                              >
                                <span className="text-neutral-500">
                                  {name}:
                                </span>
                                <span className="font-medium text-neutral-900">
                                  {value}
                                </span>
                              </span>
                            ))}
                          </div>
                        )}
                        <p className="mt-2 text-sm font-semibold text-neutral-900 md:hidden">
                          {formatPrice(item.price, currency)}
                        </p>
                      </div>
                    </div>
                    <div className="hidden text-center text-sm text-neutral-700 md:block">
                      {formatPrice(item.price, currency)}
                    </div>
                    <div className="flex items-center justify-between md:justify-center">
                      <span className="text-sm text-neutral-500 md:hidden">
                        Số lượng
                      </span>
                      <div className="inline-flex items-center rounded-xl border border-neutral-200 bg-white">
                        <button
                          type="button"
                          aria-label={`Giảm số lượng ${item.name}`}
                          disabled={isMutating || item.quantity <= 1}
                          onClick={() =>
                            void handleUpdateQuantity(
                              item.key,
                              item.quantity - 1,
                            )
                          }
                          className="flex h-9 w-9 items-center justify-center rounded-l-xl text-neutral-600 transition hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="min-w-9 text-center text-sm font-medium tabular-nums">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          aria-label={`Tăng số lượng ${item.name}`}
                          disabled={isMutating}
                          onClick={() =>
                            void handleUpdateQuantity(
                              item.key,
                              item.quantity + 1,
                            )
                          }
                          className="flex h-9 w-9 items-center justify-center rounded-r-xl text-neutral-600 transition hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between md:block md:text-right">
                      <span className="text-sm text-neutral-500 md:hidden">
                        Thành tiền
                      </span>
                      <span className="text-sm font-semibold text-neutral-950">
                        {formatPrice(item.line_total, currency)}
                      </span>
                    </div>
                    <div className="flex justify-end md:justify-center">
                      <button
                        type="button"
                        aria-label={`Xóa ${item.name} khỏi giỏ hàng`}
                        disabled={isMutating}
                        onClick={() => void handleRemoveItem(item.key)}
                        className="flex h-9 w-9 items-center justify-center rounded-lg text-neutral-400 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-40"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </motion.article>
                );
              })}
            </AnimatePresence>
            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-neutral-200 bg-neutral-50/50 px-5 py-4">
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 text-sm font-medium text-neutral-600 transition hover:text-neutral-950"
              >
                <ArrowLeft className="h-4 w-4" />
                Tiếp tục mua sắm
              </Link>
              <button
                type="button"
                disabled={isMutating}
                onClick={() => void refreshCart()}
                className="inline-flex items-center gap-2 text-sm text-neutral-500 transition hover:text-neutral-900 disabled:opacity-50"
              >
                <RefreshCw
                  className={`h-3.5 w-3.5 ${isMutating ? "animate-spin" : ""}`}
                />
                Làm mới
              </button>
            </div>
          </section>
          <aside className="rounded-2xl border border-neutral-200 bg-white p-5 sm:p-6 lg:sticky lg:top-24">
            <h2 className="text-lg font-semibold tracking-tight text-neutral-950">
              Tóm tắt đơn hàng
            </h2>

            <section className="mt-5 rounded-xl border border-neutral-200 p-4">
              <div className="flex items-center gap-2">
                <TicketPercent className="h-4 w-4 text-neutral-600" />
                <h3 className="text-sm font-semibold text-neutral-900">
                  Mã giảm giá
                </h3>
              </div>

              <form onSubmit={handleApplyCoupon} className="mt-3 flex gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(event) => setCouponCode(event.target.value)}
                  placeholder="Nhập mã giảm giá"
                  aria-label="Mã giảm giá"
                  autoComplete="off"
                  disabled={isMutating}
                  className="min-w-0 flex-1 rounded-lg border border-neutral-200 px-3 py-2.5 text-sm outline-none transition placeholder:text-neutral-400 focus:border-neutral-500 disabled:bg-neutral-50"
                />
                <button
                  type="submit"
                  disabled={isMutating || !couponCode.trim()}
                  className="shrink-0 rounded-lg bg-neutral-900 px-3 py-2.5 text-sm font-medium text-white transition hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Áp dụng
                </button>
              </form>

              {couponMessage && (
                <p
                  role="status"
                  className={`mt-3 text-xs leading-5 ${
                    couponMessageType === "success"
                      ? "text-green-700"
                      : "text-red-600"
                  }`}
                >
                  {couponMessage}
                </p>
              )}

              {coupons.length > 0 && (
                <div className="mt-3 space-y-2">
                  {coupons.map((coupon) => (
                    <div
                      key={coupon.code}
                      className="flex items-center justify-between gap-3 rounded-lg bg-green-50 px-3 py-2"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-xs font-semibold text-green-800">
                          {coupon.code}
                        </p>
                        <p className="mt-0.5 text-xs text-green-700">
                          Giảm {formatPrice(coupon.discount_amount, currency)}
                        </p>
                      </div>
                      <button
                        type="button"
                        aria-label={`Gỡ mã ${coupon.code}`}
                        title={`Gỡ mã ${coupon.code}`}
                        disabled={isMutating}
                        onClick={() => void handleRemoveCoupon(coupon.code)}
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-green-800 transition hover:bg-green-100 disabled:opacity-50"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <div className="mt-6 space-y-4 text-sm">
              <div className="flex items-center justify-between gap-4">
                <span className="text-neutral-500">Tạm tính</span>
                <span className="font-medium text-neutral-900">
                  {formatPrice(totals.subtotal, currency)}
                </span>
              </div>
              {totals.discount_total > 0 && (
                <div className="flex items-center justify-between gap-4">
                  <span className="text-neutral-500">Giảm giá</span>
                  <span className="font-medium text-green-700">
                    −{formatPrice(totals.discount_total, currency)}
                  </span>
                </div>
              )}
              {totals.fee_total > 0 && (
                <div className="flex items-center justify-between gap-4">
                  <span className="text-neutral-500">Phụ phí</span>
                  <span className="font-medium text-neutral-900">
                    {formatPrice(totals.fee_total, currency)}
                  </span>
                </div>
              )}
              <div className="flex items-start justify-between gap-4">
                <span className="text-neutral-500">Vận chuyển</span>
                <span className="max-w-40 text-right text-xs leading-5 text-neutral-500">
                  Tính tại bước thanh toán
                </span>
              </div>
              <div className="border-t border-dashed border-neutral-200 pt-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-neutral-950">
                      Tổng cộng
                    </p>
                    <p className="mt-1 text-xs leading-5 text-neutral-500">
                      Theo cấu hình giá và thuế WooCommerce
                    </p>
                  </div>
                  <p className="text-lg font-bold tabular-nums text-neutral-950">
                    {formatPrice(totals.total, currency)}
                  </p>
                </div>
              </div>
            </div>
            <Link
              href="/checkout"
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-neutral-950 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-neutral-800"
            >
              Tiến hành thanh toán
              <ArrowRight className="h-4 w-4" />
            </Link>
            <div className="mt-4 flex items-start gap-3 rounded-xl bg-neutral-50 p-3.5">
              <PackageCheck className="mt-0.5 h-5 w-5 shrink-0 text-neutral-500" />
              <p className="text-xs leading-5 text-neutral-500">
                Phí vận chuyển có thể thay đổi theo địa chỉ giao hàng và phương thức vận chuyển.
              </p>
            </div>
            <div className="mt-3 flex items-center justify-center gap-2 text-xs text-neutral-500">
              <ShieldCheck className="h-4 w-4" />
              Giá được xử lý bởi WooCommerce
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}