"use client";

import { useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Package,
  ShoppingBag,
  CalendarDays,
  LoaderCircle,
  RefreshCw,
  X,
  CreditCard,
  ChevronRight,
  ReceiptText,
  Truck,
} from "lucide-react";

import { useAuth } from "@/hooks/useAuth";
import { useOrders } from "@/hooks/useOrders";
import type { Order } from "@/services/types/order";

const ORDER_STATUS: Record<
  string,
  { label: string; className: string; dotClassName: string }
> = {
  pending: {
    label: "Chờ thanh toán",
    className: "bg-amber-50 text-amber-700 ring-amber-200",
    dotClassName: "bg-amber-500",
  },
  processing: {
    label: "Đang xử lý",
    className: "bg-blue-50 text-blue-700 ring-blue-200",
    dotClassName: "bg-blue-500",
  },
  "on-hold": {
    label: "Tạm giữ",
    className: "bg-orange-50 text-orange-700 ring-orange-200",
    dotClassName: "bg-orange-500",
  },
  completed: {
    label: "Hoàn thành",
    className: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    dotClassName: "bg-emerald-500",
  },
  cancelled: {
    label: "Đã hủy",
    className: "bg-muted text-muted-foreground ring-border",
    dotClassName: "bg-muted-foreground",
  },
  refunded: {
    label: "Đã hoàn tiền",
    className: "bg-purple-50 text-purple-700 ring-purple-200",
    dotClassName: "bg-purple-500",
  },
  failed: {
    label: "Thanh toán thất bại",
    className: "bg-red-50 text-red-700 ring-red-200",
    dotClassName: "bg-red-500",
  },
};

const CANCELLABLE_STATUSES = new Set(["pending", "on-hold"]);
const PAYABLE_STATUSES = new Set(["pending", "failed", "on-hold"]);

function formatPrice(amount: string, currency: string) {
  const value = Number(amount);

  if (!Number.isFinite(value)) {
    return `${amount} ${currency}`;
  }

  try {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: currency || "VND",
    }).format(value);
  } catch {
    return `${amount} ${currency}`;
  }
}

function formatDate(date: string | null) {
  if (!date) return "Chưa có thông tin";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return date;
  }

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(parsedDate);
}

function getOrderStatus(order: Order) {
  return (
    ORDER_STATUS[order.status] ?? {
      label: order.status_label || order.status || "Không xác định",
      className: "bg-muted text-muted-foreground ring-border",
      dotClassName: "bg-muted-foreground",
    }
  );
}

function OrderSkeleton() {
  return (
    <main className="min-h-screen bg-muted/30">
      <div className="container mx-auto max-w-5xl px-4 py-8 md:px-6 md:py-12">
        <div className="h-4 w-32 animate-pulse rounded bg-muted" />
        <div className="mt-8 h-10 w-64 animate-pulse rounded bg-muted" />
        <div className="mt-3 h-4 w-80 max-w-full animate-pulse rounded bg-muted" />

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-24 animate-pulse rounded-xl border bg-background"
            />
          ))}
        </div>

        <div className="mt-6 h-72 animate-pulse rounded-xl border bg-background" />
      </div>
    </main>
  );
}

function LoginRequired() {
  return (
    <main className="flex min-h-[65vh] items-center justify-center bg-muted/30 px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border bg-background p-8 text-center shadow-sm">
        <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-primary/10">
          <Package className="size-8 text-primary" />
        </div>

        <h1 className="mt-5 text-2xl font-semibold tracking-tight">
          Đơn hàng của tôi
        </h1>

        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Đăng nhập để theo dõi đơn hàng, trạng thái giao hàng và lịch sử mua sắm.
        </p>

        <Link
          href="/login"
          className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          Đăng nhập
          <ArrowRight className="size-4" />
        </Link>
      </div>
    </main>
  );
}

export default function OrdersPage() {
  const { user, isLoading: authLoading } = useAuth();

  const {
    orders,
    isLoading,
    cancellingId,
    error,
    notice,
    fetchOrders,
    cancelOrder,
    clearMessages,
  } = useOrders({
    enabled: !authLoading && !!user,
  });

  const handleCancelOrder = useCallback(
    async (order: Order) => {
      const orderNumber = order.number || String(order.id);

      const confirmed = window.confirm(
        `Bạn có chắc muốn hủy đơn hàng #${orderNumber}?`,
      );

      if (!confirmed) return;

      clearMessages();
      await cancelOrder(order.id);
    },
    [cancelOrder, clearMessages],
  );

  if (authLoading) {
    return <OrderSkeleton />;
  }

  if (!user) {
    return <LoginRequired />;
  }

  const pendingCount = orders.filter((order) =>
    PAYABLE_STATUSES.has(order.status),
  ).length;

  const completedCount = orders.filter(
    (order) => order.status === "completed",
  ).length;

  return (
    <main className="min-h-screen bg-muted/30">
      <div className="container mx-auto max-w-5xl px-4 py-8 md:px-6 md:py-12">
        {/* Breadcrumb */}
        <Link
          href="/account"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Tài khoản của tôi
        </Link>

        {/* Header */}
        <div className="mt-7 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <div className="flex items-center gap-2 text-sm font-medium text-primary">
              <ReceiptText className="size-4" />
              Lịch sử mua hàng
            </div>

            <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
              Đơn hàng của tôi
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
              Quản lý đơn hàng, theo dõi trạng thái và tiếp tục thanh toán khi cần.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              clearMessages();
              void fetchOrders();
            }}
            disabled={isLoading || cancellingId !== null}
            className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg border bg-background px-4 text-sm font-medium transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw
              className={`size-4 ${isLoading ? "animate-spin" : ""}`}
            />
            Làm mới
          </button>
        </div>

        {/* Summary cards */}
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border bg-background p-5">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-muted-foreground">Đơn hàng đã tải</p>
              <ShoppingBag className="size-5 text-muted-foreground" />
            </div>
            <p className="mt-3 text-2xl font-semibold tabular-nums">
              {isLoading ? "—" : orders.length}
            </p>
          </div>

          <div className="rounded-xl border bg-background p-5">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-muted-foreground">Cần kiểm tra</p>
              <CreditCard className="size-5 text-amber-600" />
            </div>
            <p className="mt-3 text-2xl font-semibold tabular-nums">
              {isLoading ? "—" : pendingCount}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Đang chờ, tạm giữ hoặc thanh toán thất bại
            </p>
          </div>

          <div className="rounded-xl border bg-background p-5">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-muted-foreground">Đã hoàn thành</p>
              <Truck className="size-5 text-emerald-600" />
            </div>
            <p className="mt-3 text-2xl font-semibold tabular-nums">
              {isLoading ? "—" : completedCount}
            </p>
          </div>
        </div>

        {/* Notifications */}
        {error && (
          <div
            role="alert"
            className="mt-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            <X className="mt-0.5 size-4 shrink-0" />
            <div className="flex-1">{error}</div>

            <button
              type="button"
              onClick={() => {
                clearMessages();
                void fetchOrders();
              }}
              disabled={isLoading}
              className="shrink-0 font-medium underline disabled:opacity-50"
            >
              Thử lại
            </button>
          </div>
        )}

        {notice && (
          <div
            role="status"
            className="mt-6 flex items-start justify-between gap-3 rounded-xl border bg-background p-4 text-sm"
          >
            <p>{notice}</p>

            <button
              type="button"
              onClick={clearMessages}
              aria-label="Đóng thông báo"
              className="shrink-0 text-muted-foreground hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          </div>
        )}

        {/* Orders panel */}
        <section className="mt-8 overflow-hidden rounded-2xl border bg-background shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-5 md:px-6">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-muted">
                <Package className="size-5" />
              </div>

              <div>
                <h2 className="font-semibold">Danh sách đơn hàng</h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  Thông tin các lần mua hàng của bạn
                </p>
              </div>
            </div>

            {!isLoading && (
              <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                {orders.length} đơn
              </span>
            )}
          </div>

          {isLoading ? (
            <div
              className="flex min-h-64 flex-col items-center justify-center gap-3 px-5 py-14 text-sm text-muted-foreground"
              role="status"
            >
              <LoaderCircle className="size-7 animate-spin text-primary" />
              Đang tải danh sách đơn hàng...
            </div>
          ) : error && orders.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-red-50">
                <RefreshCw className="size-6 text-red-600" />
              </div>

              <h3 className="mt-4 font-semibold">
                Không tải được đơn hàng
              </h3>

              <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
                Vui lòng kiểm tra kết nối hoặc đăng nhập lại, sau đó thử tải lại.
              </p>

              <button
                type="button"
                onClick={() => {
                  clearMessages();
                  void fetchOrders();
                }}
                className="mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-lg border px-4 text-sm font-medium transition-colors hover:bg-muted"
              >
                <RefreshCw className="size-4" />
                Tải lại
              </button>
            </div>
          ) : orders.length === 0 ? (
            <div className="flex flex-col items-center px-6 py-16 text-center">
              <div className="flex size-16 items-center justify-center rounded-2xl bg-muted">
                <ShoppingBag className="size-8 text-muted-foreground" />
              </div>

              <h3 className="mt-5 text-lg font-semibold">
                Chưa có đơn hàng nào
              </h3>

              <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
                Khi bạn đặt hàng thành công, thông tin đơn hàng sẽ được hiển thị tại đây.
              </p>

              <Link
                href="/products"
                className="mt-6 inline-flex h-11 items-center gap-2 rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
              >
                Khám phá sản phẩm
                <ArrowRight className="size-4" />
              </Link>
            </div>
          ) : (
            <div className="divide-y">
              {orders.map((order) => {
                const status = getOrderStatus(order);
                const canCancel = CANCELLABLE_STATUSES.has(order.status);
                const canPay =
                  PAYABLE_STATUSES.has(order.status) &&
                  Boolean(order.payment_url);
                const isCancelling = cancellingId === order.id;

                return (
                  <article
                    key={order.id}
                    className="p-5 transition-colors hover:bg-muted/20 md:p-6"
                  >
                    {/* Order heading */}
                    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold tracking-tight">
                            Đơn hàng #{order.number || order.id}
                          </h3>

                          <span className="text-xs text-muted-foreground">
                            ID: {order.id}
                          </span>
                        </div>

                        <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                          <CalendarDays className="size-4 shrink-0" />
                          {formatDate(order.date_created)}
                        </p>
                      </div>

                      <span
                        className={`inline-flex w-fit items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium ring-1 ring-inset ${status.className}`}
                      >
                        <span
                          className={`size-1.5 rounded-full ${status.dotClassName}`}
                        />
                        {status.label}
                      </span>
                    </div>

                    {/* Products */}
                    <div className="mt-5 space-y-4">
                      {order.line_items?.length ? (
                        order.line_items.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between gap-4"
                          >
                            <div className="flex min-w-0 items-center gap-3">
                              <div className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-muted/50">
                                {item.image ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img
                                    src={item.image}
                                    alt={item.name}
                                    className="size-full object-cover"
                                    loading="lazy"
                                  />
                                ) : (
                                  <Package className="size-5 text-muted-foreground" />
                                )}
                              </div>

                              <div className="min-w-0">
                                <p className="line-clamp-2 text-sm font-medium">
                                  {item.name}
                                </p>

                                <p className="mt-1 text-xs text-muted-foreground">
                                  Số lượng: {item.quantity}
                                </p>
                              </div>
                            </div>

                            <p className="shrink-0 text-sm font-medium tabular-nums">
                              {formatPrice(item.total, order.currency)}
                            </p>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          Không có thông tin sản phẩm.
                        </p>
                      )}
                    </div>

                    {/* Footer */}
                    <div className="mt-5 flex flex-col justify-between gap-4 border-t pt-4 sm:flex-row sm:items-end">
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Tổng thanh toán
                        </p>

                        <p className="mt-1 text-xl font-semibold tracking-tight tabular-nums">
                          {formatPrice(order.total, order.currency)}
                        </p>

                        {order.payment_title && (
                          <p className="mt-1 text-xs text-muted-foreground">
                            {order.payment_title}
                          </p>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {canPay && (
                          <Link
                            href={`/checkout/pay/${order.id}`}
                            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
                          >
                            <CreditCard className="size-4" />
                            Thanh toán
                            <ChevronRight className="size-4" />
                          </Link>
                        )}

                        {canCancel && (
                          <button
                            type="button"
                            onClick={() => void handleCancelOrder(order)}
                            disabled={cancellingId !== null}
                            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-red-200 bg-background px-4 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {isCancelling ? (
                              <LoaderCircle className="size-4 animate-spin" />
                            ) : (
                              <X className="size-4" />
                            )}

                            {isCancelling ? "Đang hủy..." : "Hủy đơn"}
                          </button>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <p className="mt-5 text-center text-xs leading-5 text-muted-foreground">
          Cần hỗ trợ về đơn hàng? Vui lòng liên hệ bộ phận chăm sóc khách hàng.
        </p>
      </div>
    </main>
  );
}